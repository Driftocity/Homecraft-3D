/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HomeProject, Furniture, Wall, FloorMaterial } from '../types';
import { createFurnitureMesh } from '../utils/threeMeshBuilder';
import { getCatalogItemById } from '../data/furnitureCatalog';
import { Eye, Keyboard, Move, RotateCw, Trash2, ZoomIn, ZoomOut } from 'lucide-react';

interface ThreeCanvasProps {
  project: HomeProject;
  selectedFurnitureId: string | null;
  selectedWallId: string | null;
  viewMode: '2d' | '3d' | 'walkthrough';
  onSelectFurniture: (id: string | null) => void;
  onUpdateFurniturePosition: (id: string, pos: { x: number; y: number; z: number }) => void;
  onUpdateFurnitureRotation: (id: string, rot: number) => void;
  gridSnapping: boolean;
  activePlacingItemCatalogId: string | null;
  onPlaceItem: (catalogId: string, position: { x: number; y: number; z: number }) => void;
}

export default function ThreeCanvas({
  project,
  selectedFurnitureId,
  selectedWallId,
  viewMode,
  onSelectFurniture,
  onUpdateFurniturePosition,
  onUpdateFurnitureRotation,
  gridSnapping,
  activePlacingItemCatalogId,
  onPlaceItem,
}: ThreeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Drag state
  const isDraggingRef = useRef<boolean>(false);
  const dragPlaneRef = useRef<THREE.Plane | null>(null);
  const intersectionPointRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const dragOffsetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  // Interactive UI elements & status
  const [activeControls, setActiveControls] = useState<string>('Rotate / Left Click to select and drag items');
  const [cameraDistance, setCameraDistance] = useState<number>(0);

  // Track keyboard state for walkthrough mode
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Trigger re-texture when floor settings change
  const floorTextureCacheRef = useRef<{ [key: string]: THREE.CanvasTexture }>({});
  const sidingTextureCacheRef = useRef<{ [key: string]: THREE.CanvasTexture }>({});

  // Generate procedural textures
  const getFloorTexture = (material: FloorMaterial, hexColor: string): THREE.CanvasTexture => {
    const key = `${material}-${hexColor}`;
    if (floorTextureCacheRef.current[key]) {
      return floorTextureCacheRef.current[key];
    }

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, 512, 512);

    switch (material) {
      case 'hardwood': {
        // Draw wood planks
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 2;
        const plankHeight = 32;
        for (let y = 0; y < 512; y += plankHeight) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(512, y);
          ctx.stroke();

          // staggered joints
          const offset = (y / plankHeight) % 2 === 0 ? 0 : 128;
          ctx.beginPath();
          for (let x = offset; x < 512 + 128; x += 256) {
            ctx.moveTo(x % 512, y);
            ctx.lineTo(x % 512, y + plankHeight);
          }
          ctx.stroke();
        }

        // Slight grain lines
        ctx.fillStyle = 'rgba(0,0,0,0.03)';
        for (let i = 0; i < 200; i++) {
          const w = Math.random() * 200 + 50;
          const h = Math.random() * 2 + 1;
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          ctx.fillRect(x, y, w, h);
        }
        break;
      }

      case 'tile': {
        // Grout lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 3;
        const tileSize = 64;
        ctx.beginPath();
        for (let i = 0; i <= 512; i += tileSize) {
          // Vertical lines
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 512);
          // Horizontal lines
          ctx.moveTo(0, i);
          ctx.lineTo(512, i);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        break;
      }

      case 'marble': {
        // Soft marble veins
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1.5;
        for (let j = 0; j < 8; j++) {
          ctx.beginPath();
          let x = Math.random() * 512;
          let y = 0;
          ctx.moveTo(x, y);
          while (y < 512) {
            x += (Math.random() - 0.5) * 35;
            y += Math.random() * 40 + 10;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        break;
      }

      case 'carpet': {
        // Noise pattern
        for (let i = 0; i < 5000; i++) {
          const size = Math.random() * 3 + 1;
          const x = Math.random() * 512;
          const y = Math.random() * 512;
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
          ctx.fillRect(x, y, size, size);
        }
        break;
      }

      case 'concrete': {
        // Concrete cloudiness / splotches
        for (let i = 0; i < 5; i++) {
          const grad = ctx.createRadialGradient(
            Math.random() * 512, Math.random() * 512, 10,
            Math.random() * 512, Math.random() * 512, Math.random() * 200 + 100
          );
          grad.addColorStop(0, 'rgba(0,0,0,0.04)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 512, 512);
        }
        break;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8); // Repeat over floor
    floorTextureCacheRef.current[key] = texture;
    return texture;
  };

  const getSidingTexture = (material: string, hexColor: string): THREE.CanvasTexture => {
    const key = `${material}-${hexColor}`;
    if (sidingTextureCacheRef.current[key]) {
      return sidingTextureCacheRef.current[key];
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, 256, 256);

    switch (material) {
      case 'vinyl': {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.lineWidth = 1.5;
        const plankHeight = 16;
        for (let y = 0; y < 256; y += plankHeight) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(256, y);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, y + 1);
          ctx.lineTo(256, y + 1);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
          ctx.lineWidth = 1.5;
        }
        break;
      }
      case 'brick': {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2;
        const brickHeight = 16;
        const brickWidth = 32;

        for (let y = 0; y < 256; y += brickHeight) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(256, y);
          ctx.stroke();

          const offset = (y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
          ctx.beginPath();
          for (let x = offset; x < 256 + brickWidth; x += brickWidth) {
            ctx.moveTo(x % 256, y);
            ctx.lineTo(x % 256, y + brickHeight);
          }
          ctx.stroke();
        }

        for (let i = 0; i < 2000; i++) {
          const x = Math.random() * 256;
          const y = Math.random() * 256;
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.03)';
          ctx.fillRect(x, y, 1, 1);
        }
        break;
      }
      case 'wood': {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1.5;
        const plankWidth = 16;
        for (let x = 0; x < 256; x += plankWidth) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 256);
          ctx.stroke();
        }

        ctx.fillStyle = 'rgba(0,0,0,0.02)';
        for (let i = 0; i < 80; i++) {
          const w = Math.random() * 2 + 1;
          const h = Math.random() * 120 + 30;
          const x = Math.random() * 256;
          const y = Math.random() * 256;
          ctx.fillRect(x, y, w, h);
        }
        break;
      }
      case 'stucco': {
        for (let i = 0; i < 5000; i++) {
          const x = Math.random() * 256;
          const y = Math.random() * 256;
          const size = Math.random() * 1.5 + 0.5;
          ctx.fillStyle = Math.random() > 0.55 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
          ctx.fillRect(x, y, size, size);
        }
        break;
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    sidingTextureCacheRef.current[key] = texture;
    return texture;
  };

  // Setup Three JS Workspace
  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Create Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f1f5f9'); // Slate 100
    scene.fog = new THREE.FogExp2('#f1f5f9', 0.02);
    sceneRef.current = scene;

    // 2. Setup Camera
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(12, 11, 14);
    cameraRef.current = camera;

    // 3. Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Setup Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // don't go below ground level
    controls.minDistance = 2;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    // 5. Add Lighting
    // Ambient
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.6);
    scene.add(ambientLight);

    // Sun / Directional
    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.0); // Warm sun
    sunLight.position.set(15, 25, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    const d = 15;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Subtle blue fill light from the opposite direction
    const skyLight = new THREE.DirectionalLight('#eff6ff', 0.25);
    skyLight.position.set(-15, 10, -10);
    scene.add(skyLight);

    // Helper drag plane (y = 0 plane)
    dragPlaneRef.current = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Handle walkthrough movement
      if (viewMode === 'walkthrough') {
        const delta = clock.getDelta();
        const moveSpeed = 4.0; // meters per second
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0; // maintain horizontal level
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, camera.up).normalize();

        const moveDirection = new THREE.Vector3(0, 0, 0);

        if (keysPressedRef.current['w'] || keysPressedRef.current['arrowup']) {
          moveDirection.add(forward);
        }
        if (keysPressedRef.current['s'] || keysPressedRef.current['arrowdown']) {
          moveDirection.sub(forward);
        }
        if (keysPressedRef.current['a'] || keysPressedRef.current['arrowleft']) {
          moveDirection.sub(right);
        }
        if (keysPressedRef.current['d'] || keysPressedRef.current['arrowright']) {
          moveDirection.add(right);
        }

        if (moveDirection.lengthSq() > 0) {
          moveDirection.normalize().multiplyScalar(moveSpeed * delta);
          camera.position.add(moveDirection);
          // Clamp eye level
          camera.position.y = 1.6;

          // Keep orbit controls center in front of the camera
          const targetOffset = forward.clone().multiplyScalar(2);
          controls.target.copy(camera.position).add(targetOffset);
        }
      }

      controls.update();
      renderer.render(scene, camera);

      // Simple status update for zoom metrics
      if (cameraRef.current) {
        const dist = cameraRef.current.position.distanceTo(controls.target);
        setCameraDistance(Math.round(dist * 10) / 10);
      }
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Global Key Events for Walkthrough
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [viewMode]);

  // Adjust Camera View based on View Mode
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (viewMode === '2d') {
      // Overhead camera position
      controls.target.set(0, 0, 0);
      camera.position.set(0, 20, 0.001); // offset slightly on Z to avoid gimbal lock in orbital controls
      controls.enableRotate = false;
      controls.maxPolarAngle = 0;
      controls.minPolarAngle = 0;
      controls.update();
      setActiveControls('Blueprint Overhead Mode (Left click items to select, Drag to move)');
    } else if (viewMode === '3d') {
      // Free Orbit 3D position
      controls.enableRotate = true;
      controls.maxPolarAngle = Math.PI / 2 - 0.05;
      controls.minPolarAngle = 0.05;
      camera.position.set(10, 10, 12);
      controls.target.set(0, 0, 0);
      controls.update();
      setActiveControls('3D Orbital Studio (Right Click & drag to rotate, Left click to select & slide items)');
    } else if (viewMode === 'walkthrough') {
      // FPS eye level walkthrough
      controls.enableRotate = true;
      controls.maxPolarAngle = Math.PI - 0.1;
      controls.minPolarAngle = 0.1;
      camera.position.set(0, 1.6, 5); // eye level 1.6m, near south edge
      controls.target.set(0, 1.6, 0); // look forward towards center
      controls.update();
      setActiveControls('Walkthrough mode active. Use WASD or Arrow Keys to navigate at eye-level!');
    }
  }, [viewMode]);

  // Render Scene contents based on project details
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear existing dynamically generated meshes (keep light / environment)
    const toRemove: THREE.Object3D[] = [];
    scene.children.forEach((child) => {
      if (
        child.name.startsWith('furniture-') ||
        child.name === 'house-floor' ||
        child.name === 'house-grid' ||
        child.name.startsWith('wall-') ||
        child.name.startsWith('foundation-') ||
        child.name.startsWith('roof-') ||
        child.name === 'placement-preview'
      ) {
        toRemove.push(child);
      }
    });
    toRemove.forEach((child) => scene.remove(child));

    // 0. Render Foundation
    const foundType = project.foundationType || 'slab';
    const foundHeight = project.foundationHeight ?? 0.2;
    const foundColor = project.foundationColor || '#64748b';

    if (foundType === 'slab') {
      const slabGeo = new THREE.BoxGeometry(project.dimensions.width, foundHeight, project.dimensions.length);
      const slabMat = new THREE.MeshStandardMaterial({
        color: foundColor,
        roughness: 0.9,
        metalness: 0.1
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.name = 'foundation-slab';
      slabMesh.position.set(0, -foundHeight / 2, 0);
      slabMesh.receiveShadow = true;
      slabMesh.castShadow = true;
      scene.add(slabMesh);
    } else if (foundType === 'crawlspace') {
      // Raised crawlspace floor slab (top deck)
      const slabGeo = new THREE.BoxGeometry(project.dimensions.width, 0.1, project.dimensions.length);
      const slabMat = new THREE.MeshStandardMaterial({
        color: foundColor,
        roughness: 0.85
      });
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.name = 'foundation-crawl-slab';
      slabMesh.position.set(0, -0.05, 0);
      slabMesh.receiveShadow = true;
      scene.add(slabMesh);

      // Support pillars (corners + midpoint grid)
      const pillarSize = 0.45;
      const pillarGeo = new THREE.BoxGeometry(pillarSize, foundHeight, pillarSize);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: '#991b1b', // Brick Red colored piers
        roughness: 0.95
      });

      const wHalf = project.dimensions.width / 2;
      const lHalf = project.dimensions.length / 2;
      const pillarPositions = [
        { x: -wHalf + pillarSize / 2, z: -lHalf + pillarSize / 2 },
        { x: wHalf - pillarSize / 2, z: -lHalf + pillarSize / 2 },
        { x: wHalf - pillarSize / 2, z: lHalf - pillarSize / 2 },
        { x: -wHalf + pillarSize / 2, z: lHalf - pillarSize / 2 },
      ];

      // Midpoints
      if (project.dimensions.width > 5) {
        pillarPositions.push({ x: 0, z: -lHalf + pillarSize / 2 });
        pillarPositions.push({ x: 0, z: lHalf - pillarSize / 2 });
      }
      if (project.dimensions.length > 5) {
        pillarPositions.push({ x: -wHalf + pillarSize / 2, z: 0 });
        pillarPositions.push({ x: wHalf - pillarSize / 2, z: 0 });
      }
      pillarPositions.push({ x: 0, z: 0 });

      pillarPositions.forEach((pos, idx) => {
        const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
        pillarMesh.name = `foundation-pillar-${idx}`;
        pillarMesh.position.set(pos.x, -foundHeight / 2, pos.z);
        pillarMesh.castShadow = true;
        pillarMesh.receiveShadow = true;
        scene.add(pillarMesh);
      });
    } else if (foundType === 'basement') {
      // Full underground basement floor slab
      const bFloorGeo = new THREE.BoxGeometry(project.dimensions.width - 0.2, 0.1, project.dimensions.length - 0.2);
      const bFloorMat = new THREE.MeshStandardMaterial({
        color: '#475569',
        roughness: 0.9
      });
      const bFloorMesh = new THREE.Mesh(bFloorGeo, bFloorMat);
      bFloorMesh.name = 'foundation-basement-floor';
      bFloorMesh.position.set(0, -foundHeight + 0.05, 0);
      bFloorMesh.receiveShadow = true;
      scene.add(bFloorMesh);

      // Basement perimeter walls
      const bWallThickness = 0.25;
      const bWallGeoNorthSouth = new THREE.BoxGeometry(project.dimensions.width, foundHeight, bWallThickness);
      const bWallGeoEastWest = new THREE.BoxGeometry(bWallThickness, foundHeight, project.dimensions.length - bWallThickness * 2);
      const bWallMat = new THREE.MeshStandardMaterial({
        color: foundColor,
        roughness: 0.95
      });

      const wHalf = project.dimensions.width / 2;
      const lHalf = project.dimensions.length / 2;

      const wallN = new THREE.Mesh(bWallGeoNorthSouth, bWallMat);
      wallN.name = 'foundation-basement-wall-n';
      wallN.position.set(0, -foundHeight / 2, -lHalf + bWallThickness / 2);
      wallN.receiveShadow = true;
      wallN.castShadow = true;
      scene.add(wallN);

      const wallS = new THREE.Mesh(bWallGeoNorthSouth, bWallMat);
      wallS.name = 'foundation-basement-wall-s';
      wallS.position.set(0, -foundHeight / 2, lHalf - bWallThickness / 2);
      wallS.receiveShadow = true;
      wallS.castShadow = true;
      scene.add(wallS);

      const wallE = new THREE.Mesh(bWallGeoEastWest, bWallMat);
      wallE.name = 'foundation-basement-wall-e';
      wallE.position.set(wHalf - bWallThickness / 2, -foundHeight / 2, 0);
      wallE.receiveShadow = true;
      wallE.castShadow = true;
      scene.add(wallE);

      const wallW = new THREE.Mesh(bWallGeoEastWest, bWallMat);
      wallW.name = 'foundation-basement-wall-w';
      wallW.position.set(-wHalf + bWallThickness / 2, -foundHeight / 2, 0);
      wallW.receiveShadow = true;
      wallW.castShadow = true;
      scene.add(wallW);
    }

    // 1. Render House Floor
    const floorGeo = new THREE.PlaneGeometry(project.dimensions.width, project.dimensions.length);
    const floorTex = getFloorTexture(project.floorMaterial, project.floorColor);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.35,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.name = 'house-floor';
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 2. Render subtle Grid overlay
    const gridHelper = new THREE.GridHelper(
      Math.max(project.dimensions.width, project.dimensions.length),
      Math.max(project.dimensions.width, project.dimensions.length),
      '#cbd5e1', // Slate 300
      '#f1f5f9'  // Slate 100
    );
    gridHelper.name = 'house-grid';
    gridHelper.position.y = 0.002;
    scene.add(gridHelper);

    // 3. Render Walls
    project.walls.forEach((wall) => {
      const p1 = new THREE.Vector3(wall.p1.x, 0, wall.p1.y);
      const p2 = new THREE.Vector3(wall.p2.x, 0, wall.p2.y);

      const distance = p1.distanceTo(p2);
      const midpoint = p1.clone().add(p2).multiplyScalar(0.5);
      const angle = Math.atan2(p2.z - p1.z, p2.x - p1.x);

      const wallGeo = new THREE.BoxGeometry(distance, wall.height, wall.thickness);
      
      // Use wall siding texture
      const sidingTex = getSidingTexture(project.sidingType || 'vinyl', project.sidingColor || '#f1f5f9');
      const wallTex = sidingTex.clone();
      wallTex.needsUpdate = true;
      wallTex.repeat.set(distance, wall.height);

      const wallMat = new THREE.MeshStandardMaterial({
        color: wall.id === selectedWallId ? '#2563eb' : '#ffffff',
        map: wall.id === selectedWallId ? null : wallTex,
        roughness: 0.75,
        metalness: 0.05,
      });

      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.name = `wall-${wall.id}`;
      wallMesh.userData = { id: wall.id, isWall: true };
      wallMesh.position.set(midpoint.x, wall.height / 2, midpoint.z);
      wallMesh.rotation.y = -angle;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;

      scene.add(wallMesh);
    });

    // 3.5 Render Roof System
    const roofType = project.roofType || 'none';
    if (roofType !== 'none') {
      const wallHeight = project.walls[0]?.height || 2.8;
      const roofColor = project.roofColor || '#334155';
      const roofPitch = project.roofPitch ?? 0.35;
      const roofOverhang = project.roofOverhang ?? 0.3;

      const rWidth = project.dimensions.width + roofOverhang * 2;
      const rLength = project.dimensions.length + roofOverhang * 2;

      const roofMat = new THREE.MeshStandardMaterial({
        color: roofColor,
        roughness: 0.8,
        metalness: 0.1
      });

      if (roofType === 'flat') {
        const flatGeo = new THREE.BoxGeometry(rWidth, 0.18, rLength);
        const flatMesh = new THREE.Mesh(flatGeo, roofMat);
        flatMesh.name = 'roof-flat';
        flatMesh.position.set(0, wallHeight + 0.09, 0);
        flatMesh.castShadow = true;
        flatMesh.receiveShadow = true;
        scene.add(flatMesh);

        // Fascia caps
        const edgeThick = 0.04;
        const edgeHeight = 0.3;
        const edgeGeoNS = new THREE.BoxGeometry(rWidth, edgeHeight, edgeThick);
        const edgeGeoEW = new THREE.BoxGeometry(edgeThick, edgeHeight, rLength - edgeThick * 2);
        const fasciaMat = new THREE.MeshStandardMaterial({
          color: project.sidingColor || '#f1f5f9',
          roughness: 0.6
        });

        const fN = new THREE.Mesh(edgeGeoNS, fasciaMat);
        fN.name = 'roof-fascia-n';
        fN.position.set(0, wallHeight + edgeHeight / 2, -rLength / 2 + edgeThick / 2);
        scene.add(fN);

        const fS = new THREE.Mesh(edgeGeoNS, fasciaMat);
        fS.name = 'roof-fascia-s';
        fS.position.set(0, wallHeight + edgeHeight / 2, rLength / 2 - edgeThick / 2);
        scene.add(fS);

        const fE = new THREE.Mesh(edgeGeoEW, fasciaMat);
        fE.name = 'roof-fascia-e';
        fE.position.set(rWidth / 2 - edgeThick / 2, wallHeight + edgeHeight / 2, 0);
        scene.add(fE);

        const fW = new THREE.Mesh(edgeGeoEW, fasciaMat);
        fW.name = 'roof-fascia-w';
        fW.position.set(-rWidth / 2 + edgeThick / 2, wallHeight + edgeHeight / 2, 0);
        scene.add(fW);

      } else if (roofType === 'gabled') {
        const peakHeight = roofPitch * (rLength / 2);
        const angle = Math.atan(peakHeight / (rLength / 2));
        const slopeLen = Math.sqrt((rLength / 2) * (rLength / 2) + peakHeight * peakHeight);

        // Left Slope
        const lSlopeGeo = new THREE.BoxGeometry(rWidth, 0.1, slopeLen);
        const lSlopeMesh = new THREE.Mesh(lSlopeGeo, roofMat);
        lSlopeMesh.name = 'roof-slope-left';
        lSlopeMesh.position.set(0, wallHeight + peakHeight / 2, -rLength / 4);
        lSlopeMesh.rotation.x = -angle;
        lSlopeMesh.castShadow = true;
        lSlopeMesh.receiveShadow = true;
        scene.add(lSlopeMesh);

        // Right Slope
        const rSlopeGeo = new THREE.BoxGeometry(rWidth, 0.1, slopeLen);
        const rSlopeMesh = new THREE.Mesh(rSlopeGeo, roofMat);
        rSlopeMesh.name = 'roof-slope-right';
        rSlopeMesh.position.set(0, wallHeight + peakHeight / 2, rLength / 4);
        rSlopeMesh.rotation.x = angle;
        rSlopeMesh.castShadow = true;
        rSlopeMesh.receiveShadow = true;
        scene.add(rSlopeMesh);

        // Triangular Gable Walls
        const triShape = new THREE.Shape();
        triShape.moveTo(-project.dimensions.length / 2, 0);
        triShape.lineTo(project.dimensions.length / 2, 0);
        triShape.lineTo(0, peakHeight);
        triShape.closePath();

        const triGeo = new THREE.ShapeGeometry(triShape);
        const triMat = new THREE.MeshStandardMaterial({
          color: project.sidingColor || '#f1f5f9',
          side: THREE.DoubleSide,
          roughness: 0.8
        });

        const gableW = new THREE.Mesh(triGeo, triMat);
        gableW.name = 'roof-gable-w';
        gableW.position.set(-project.dimensions.width / 2 + 0.01, wallHeight, 0);
        gableW.rotation.y = Math.PI / 2;
        gableW.castShadow = true;
        scene.add(gableW);

        const gableE = new THREE.Mesh(triGeo, triMat);
        gableE.name = 'roof-gable-e';
        gableE.position.set(project.dimensions.width / 2 - 0.01, wallHeight, 0);
        gableE.rotation.y = Math.PI / 2;
        gableE.castShadow = true;
        scene.add(gableE);

      } else if (roofType === 'hipped') {
        const peakHeight = roofPitch * Math.max(rWidth, rLength) / 2;
        
        const coneGeo = new THREE.ConeGeometry(Math.sqrt(0.5), 1, 4);
        coneGeo.rotateY(Math.PI / 4);
        coneGeo.translate(0, 0.5, 0);

        const coneMesh = new THREE.Mesh(coneGeo, roofMat);
        coneMesh.name = 'roof-hipped';
        coneMesh.position.set(0, wallHeight, 0);
        coneMesh.scale.set(rWidth, peakHeight, rLength);
        coneMesh.castShadow = true;
        coneMesh.receiveShadow = true;
        scene.add(coneMesh);
      }
    }

    // 4. Render Furniture
    project.furniture.forEach((item) => {
      const catalogItem = getCatalogItemById(item.catalogId);
      if (!catalogItem) return;

      const furnitureMesh = createFurnitureMesh(item, catalogItem);

      // Placement transform
      furnitureMesh.position.set(item.position.x, item.position.y, item.position.z);
      furnitureMesh.rotation.y = item.rotation;
      furnitureMesh.scale.set(item.scale.x, item.scale.y, item.scale.z);

      // Highlight selected item with helper wireframe box
      if (item.id === selectedFurnitureId) {
        const bbox = new THREE.BoxHelper(furnitureMesh, new THREE.Color('#3b82f6'));
        (bbox as any).material.depthTest = false;
        (bbox as any).material.transparent = true;
        (bbox as any).material.opacity = 0.85;
        bbox.name = `furniture-highlight-${item.id}`;
        furnitureMesh.add(bbox);
      }

      scene.add(furnitureMesh);
    });
  }, [project, selectedFurnitureId, selectedWallId]);

  // Handle Raycasting Pointer interactions (Mouse down for Selection/Drag, Mouse move, Mouse up)
  const getMouseCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mountRef.current) return { x: 0, y: 0 };
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / mountRef.current.clientWidth) * 2 - 1;
    const y = -((e.clientY - rect.top) / mountRef.current.clientHeight) * 2 + 1;
    return { x, y };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode === 'walkthrough') return; // interact disabled in Walkthrough

    const { x, y } = getMouseCoords(e);
    mouseRef.current.set(x, y);

    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!camera || !scene) return;

    raycasterRef.current.setFromCamera(mouseRef.current, camera);

    // Intersects with all scene children
    const intersects = raycasterRef.current.intersectObjects(scene.children, true);

    // Filter to find furniture group or wall
    let targetFurnitureId: string | null = null;
    let targetWallId: string | null = null;
    let intersectPoint: THREE.Vector3 | null = null;

    for (let i = 0; i < intersects.length; i++) {
      const obj = intersects[i].object;

      // Check if we hit floor first (and are placing something!)
      if (obj.name === 'house-floor' && activePlacingItemCatalogId) {
        intersectPoint = intersects[i].point;
        break;
      }

      // Check if parent group represents furniture
      let parent: THREE.Object3D | null = obj;
      while (parent && parent !== scene) {
        if (parent.name.startsWith('furniture-')) {
          targetFurnitureId = parent.userData.id;
          intersectPoint = intersects[i].point;
          break;
        }
        if (parent.name.startsWith('wall-')) {
          targetWallId = parent.userData.id;
          intersectPoint = intersects[i].point;
          break;
        }
        parent = parent.parent;
      }

      if (targetFurnitureId || targetWallId || intersectPoint) {
        break;
      }
    }

    // Workflow: Item placement click
    if (activePlacingItemCatalogId && intersectPoint) {
      // Place the item!
      let placeX = intersectPoint.x;
      let placeZ = intersectPoint.z;

      if (gridSnapping) {
        placeX = Math.round(placeX * 4) / 4; // snap to 0.25 meters
        placeZ = Math.round(placeZ * 4) / 4;
      }

      onPlaceItem(activePlacingItemCatalogId, { x: placeX, y: 0, z: placeZ });
      return;
    }

    if (targetFurnitureId) {
      // Select the item and prep for drag
      onSelectFurniture(targetFurnitureId);

      const furnitureItem = project.furniture.find((item) => item.id === targetFurnitureId);
      if (furnitureItem && controlsRef.current && cameraRef.current) {
        isDraggingRef.current = true;
        controlsRef.current.enabled = false; // Disable OrbitControls while dragging

        // Position ray intersect offset
        if (intersectPoint) {
          dragOffsetRef.current.copy(intersectPoint).sub(
            new THREE.Vector3(furnitureItem.position.x, furnitureItem.position.y, furnitureItem.position.z)
          );
        }
      }
    } else {
      // Clear selection if we click on empty floor or walls
      if (intersects.length > 0 && intersects[0].object.name === 'house-floor') {
        onSelectFurniture(null);
      }
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { x, y } = getMouseCoords(e);
    mouseRef.current.set(x, y);

    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!camera || !scene) return;

    raycasterRef.current.setFromCamera(mouseRef.current, camera);

    // --- Interactive Ghost Placement Preview ---
    if (activePlacingItemCatalogId) {
      const intersects = raycasterRef.current.intersectObject(scene.getObjectByName('house-floor')!);
      if (intersects.length > 0) {
        const floorIntersect = intersects[0];
        let pX = floorIntersect.point.x;
        let pZ = floorIntersect.point.z;

        if (gridSnapping) {
          pX = Math.round(pX * 4) / 4;
          pZ = Math.round(pZ * 4) / 4;
        }

        // Check if preview already exists, otherwise create it
        let previewGroup = scene.getObjectByName('placement-preview') as THREE.Group;
        if (!previewGroup) {
          const catalogItem = getCatalogItemById(activePlacingItemCatalogId);
          if (catalogItem) {
            previewGroup = createFurnitureMesh(
              {
                id: 'preview',
                catalogId: activePlacingItemCatalogId,
                name: 'Preview',
                type: catalogItem.type,
                position: { x: 0, y: 0, z: 0 },
                rotation: 0,
                scale: catalogItem.defaultScale,
                color: '#22c55e', // Transparent Green overlay
                materialType: catalogItem.defaultMaterial,
                category: catalogItem.category,
              },
              catalogItem
            );
            previewGroup.name = 'placement-preview';

            // Add visual semi-transparent effect to children
            previewGroup.traverse((node: any) => {
              if (node.isMesh) {
                node.material = new THREE.MeshBasicMaterial({
                  color: '#22c55e',
                  transparent: true,
                  opacity: 0.5,
                  wireframe: false,
                });
              }
            });
            scene.add(previewGroup);
          }
        }

        if (previewGroup) {
          previewGroup.position.set(pX, 0, pZ);
        }
      }
      return;
    }

    // --- Furniture Drag and Drop ---
    if (isDraggingRef.current && selectedFurnitureId && dragPlaneRef.current) {
      const raycastResults = raycasterRef.current.intersectPlane(
        dragPlaneRef.current,
        intersectionPointRef.current
      );

      if (raycastResults) {
        const item = project.furniture.find((f) => f.id === selectedFurnitureId);
        if (item) {
          // Calculate target position subtracting start offset
          const targetPos = intersectionPointRef.current.clone().sub(dragOffsetRef.current);

          let newX = targetPos.x;
          let newZ = targetPos.z;

          if (gridSnapping) {
            newX = Math.round(newX * 4) / 4; // 0.25m step snapping
            newZ = Math.round(newZ * 4) / 4;
          }

          // Boundary clamp
          const halfW = project.dimensions.width / 2;
          const halfL = project.dimensions.length / 2;
          newX = Math.max(-halfW, Math.min(halfW, newX));
          newZ = Math.max(-halfL, Math.min(halfL, newZ));

          onUpdateFurniturePosition(selectedFurnitureId, { x: newX, y: item.position.y, z: newZ });
        }
      }
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    if (controlsRef.current) {
      controlsRef.current.enabled = true; // Restore camera control orbit navigation
    }
  };

  // Rotate selected item with hotkeys (r)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' && selectedFurnitureId) {
        const item = project.furniture.find((f) => f.id === selectedFurnitureId);
        if (item) {
          // rotate 45 degrees (PI / 4)
          onUpdateFurnitureRotation(selectedFurnitureId, item.rotation + Math.PI / 4);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedFurnitureId, project]);

  return (
    <div className="relative w-full h-full select-none" id="builder-canvas-container">
      {/* Three WebGL Mounting Block */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-crosshair outline-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        id="three-canvas-frame"
      />

      {/* Floating Canvas UI Assist & Status Panel */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none items-start z-10">
        {/* Left Side Status */}
        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl px-4 py-2 text-white shadow-xl flex items-center gap-3">
          <Eye className="w-4 h-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Active Guide</span>
            <span className="text-xs font-semibold">{activeControls}</span>
          </div>
        </div>

        {/* Right Side Camera Info */}
        <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl px-4 py-2 text-white shadow-xl flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Camera Zoom</span>
            <span className="text-xs font-semibold font-mono">{cameraDistance}m</span>
          </div>
        </div>
      </div>

      {/* Walkthrough Guide overlay */}
      {viewMode === 'walkthrough' && (
        <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 text-white px-4 py-3 rounded-xl shadow-2xl pointer-events-none flex items-center gap-4 max-w-sm">
          <Keyboard className="w-8 h-8 text-indigo-400 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">First-Person Controls</h4>
            <p className="text-xs text-slate-200">
              Press <span className="font-semibold text-amber-400">W, A, S, D</span> or <span className="font-semibold text-amber-400">Arrow Keys</span> on your keyboard to walk around your custom built house in real-time!
            </p>
          </div>
        </div>
      )}

      {/* Crosshair for First-Person Walkthrough alignment */}
      {viewMode === 'walkthrough' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-indigo-500/80 border border-white/50 shadow-sm" />
          <div className="absolute w-6 h-0.5 bg-white/20" />
          <div className="absolute h-6 w-0.5 bg-white/20" />
        </div>
      )}

      {/* Help Banner for Placement */}
      {activePlacingItemCatalogId && (
        <div className="absolute bottom-4 right-4 bg-emerald-600 border border-emerald-500 text-white px-5 py-3 rounded-xl shadow-2xl animate-pulse pointer-events-none flex items-center gap-3">
          <Move className="w-5 h-5" />
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider">Placement Mode Active</span>
            <span className="text-xs">Click on the floor to position your furniture piece!</span>
          </div>
        </div>
      )}
    </div>
  );
}
