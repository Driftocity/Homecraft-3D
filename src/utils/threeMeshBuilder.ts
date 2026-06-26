/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { Furniture, CatalogItem } from '../types';

/**
 * Creates a procedurally detailed 3D group for a catalog item.
 */
export function createFurnitureMesh(furniture: Furniture, catalogItem: CatalogItem): THREE.Group {
  const group = new THREE.Group();
  group.name = `furniture-${furniture.id}`;
  group.userData = { id: furniture.id };

  const color = new THREE.Color(furniture.color || catalogItem.defaultColor);
  const scale = furniture.scale;

  // Materials
  const plasticMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.2,
    metalness: 0.1,
  });

  const woodColor = new THREE.Color(furniture.color || catalogItem.defaultColor);
  const woodMat = new THREE.MeshStandardMaterial({
    color: woodColor,
    roughness: 0.7,
    metalness: 0.05,
  });

  const fabricMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.9,
    metalness: 0.0,
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: furniture.color ? new THREE.Color(furniture.color) : new THREE.Color('#94a3b8'),
    roughness: 0.25,
    metalness: 0.8,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: '#e0f2fe',
    transparent: true,
    opacity: 0.4,
    roughness: 0.1,
    metalness: 0.9,
  });

  const porcelainMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.1,
    metalness: 0.1,
  });

  const plantGreenMat = new THREE.MeshStandardMaterial({
    color: '#16a34a',
    roughness: 0.6,
    metalness: 0.0,
  });

  const getMaterial = (type: string) => {
    switch (type) {
      case 'wood': return woodMat;
      case 'fabric': return fabricMat;
      case 'metal': return metalMat;
      case 'glass': return glassMat;
      case 'plastic':
      default:
        return plasticMat;
    }
  };

  const primaryMat = getMaterial(furniture.materialType || catalogItem.defaultMaterial);

  // Build the meshes based on item type
  switch (catalogItem.type) {
    case 'sofa': {
      // Base cushion
      const baseGeo = new THREE.BoxGeometry(1, 0.2, 0.8);
      const baseMesh = new THREE.Mesh(baseGeo, primaryMat);
      baseMesh.position.y = 0.2;
      baseMesh.scale.set(scale.x, 1, scale.z);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Backrest
      const backGeo = new THREE.BoxGeometry(1, 0.6, 0.15);
      const backMesh = new THREE.Mesh(backGeo, primaryMat);
      backMesh.position.set(0, 0.5, -scale.z / 2 + 0.075);
      backMesh.scale.set(scale.x, 1, 1);
      backMesh.castShadow = true;
      backMesh.receiveShadow = true;
      group.add(backMesh);

      // Armrest Left
      const armGeo = new THREE.BoxGeometry(0.15, 0.45, 0.8);
      const armLMesh = new THREE.Mesh(armGeo, primaryMat);
      armLMesh.position.set(-scale.x / 2 + 0.075, 0.4, 0);
      armLMesh.scale.set(1, 1, scale.z);
      armLMesh.castShadow = true;
      group.add(armLMesh);

      // Armrest Right
      const armRMesh = armLMesh.clone();
      armRMesh.position.x = scale.x / 2 - 0.075;
      group.add(armRMesh);

      // Cushions details
      const seatCushionGeo = new THREE.BoxGeometry((scale.x - 0.3) / 2, 0.08, scale.z - 0.15);
      const cushionColor = color.clone().offsetHSL(0, 0, 0.05);
      const seatCushionMat = new THREE.MeshStandardMaterial({ color: cushionColor, roughness: 0.9 });

      const cushion1 = new THREE.Mesh(seatCushionGeo, seatCushionMat);
      cushion1.position.set(-scale.x / 4, 0.28, 0.05);
      cushion1.castShadow = true;
      group.add(cushion1);

      const cushion2 = cushion1.clone();
      cushion2.position.x = scale.x / 4;
      group.add(cushion2);

      // Wooden legs
      const legGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.15, 8);
      const darkWoodMat = new THREE.MeshStandardMaterial({ color: '#27160c', roughness: 0.8 });
      const offsetsX = [-scale.x / 2 + 0.08, scale.x / 2 - 0.08];
      const offsetsZ = [-scale.z / 2 + 0.08, scale.z / 2 - 0.08];

      offsetsX.forEach((x) => {
        offsetsZ.forEach((z) => {
          const leg = new THREE.Mesh(legGeo, darkWoodMat);
          leg.position.set(x, 0.075, z);
          leg.castShadow = true;
          group.add(leg);
        });
      });
      break;
    }

    case 'armchair': {
      // Main chair body
      const bodyGeo = new THREE.BoxGeometry(scale.x, 0.3, scale.z);
      const body = new THREE.Mesh(bodyGeo, primaryMat);
      body.position.y = 0.25;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      // Backrest (high-backed)
      const backGeo = new THREE.BoxGeometry(scale.x, 0.65, 0.15);
      const back = new THREE.Mesh(backGeo, primaryMat);
      back.position.set(0, 0.65, -scale.z / 2 + 0.075);
      back.castShadow = true;
      group.add(back);

      // Left Arm
      const armGeo = new THREE.BoxGeometry(0.12, 0.45, scale.z - 0.1);
      const armL = new THREE.Mesh(armGeo, primaryMat);
      armL.position.set(-scale.x / 2 + 0.06, 0.45, 0.05);
      armL.castShadow = true;
      group.add(armL);

      // Right Arm
      const armR = armL.clone();
      armR.position.x = scale.x / 2 - 0.06;
      group.add(armR);

      // Soft Seat Cushion
      const cushionGeo = new THREE.BoxGeometry(scale.x - 0.24, 0.1, scale.z - 0.2);
      const cushionColor = color.clone().offsetHSL(0, 0, 0.06);
      const cushionMat = new THREE.MeshStandardMaterial({ color: cushionColor, roughness: 0.95 });
      const cushion = new THREE.Mesh(cushionGeo, cushionMat);
      cushion.position.set(0, 0.38, 0.05);
      cushion.castShadow = true;
      group.add(cushion);

      // Legs
      const legGeo = new THREE.CylinderGeometry(0.03, 0.015, 0.2, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.5 }); // Dark metal legs
      const offsetsX = [-scale.x / 2 + 0.06, scale.x / 2 - 0.06];
      const offsetsZ = [-scale.z / 2 + 0.06, scale.z / 2 - 0.06];

      offsetsX.forEach((x) => {
        offsetsZ.forEach((z) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(x, 0.1, z);
          // slight angle for modern look
          leg.rotation.z = x > 0 ? -0.15 : 0.15;
          leg.rotation.x = z > 0 ? -0.15 : 0.15;
          leg.castShadow = true;
          group.add(leg);
        });
      });
      break;
    }

    case 'coffee_table': {
      // Wooden tabletop
      const topGeo = new THREE.BoxGeometry(scale.x, 0.04, scale.z);
      const top = new THREE.Mesh(topGeo, primaryMat);
      top.position.y = scale.y - 0.02;
      top.castShadow = true;
      top.receiveShadow = true;
      group.add(top);

      // Legs
      const legGeo = new THREE.CylinderGeometry(0.025, 0.02, scale.y - 0.04, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4, metalness: 0.3 }); // Sleek metal feet

      const offsetsX = [-scale.x / 2 + 0.06, scale.x / 2 - 0.06];
      const offsetsZ = [-scale.z / 2 + 0.06, scale.z / 2 - 0.06];

      offsetsX.forEach((x) => {
        offsetsZ.forEach((z) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(x, (scale.y - 0.04) / 2, z);
          leg.castShadow = true;
          group.add(leg);
        });
      });
      break;
    }

    case 'tv_stand': {
      // Main Cabinet structure
      const cabGeo = new THREE.BoxGeometry(scale.x, scale.y - 0.1, scale.z);
      const cabinet = new THREE.Mesh(cabGeo, primaryMat);
      cabinet.position.y = (scale.y - 0.1) / 2 + 0.1;
      cabinet.castShadow = true;
      cabinet.receiveShadow = true;
      group.add(cabinet);

      // Glass front inserts / Shelves
      const shelfGeo = new THREE.BoxGeometry(scale.x - 0.1, 0.02, scale.z - 0.05);
      const shelf = new THREE.Mesh(shelfGeo, woodMat);
      shelf.position.set(0, scale.y / 2, 0.02);
      group.add(shelf);

      // Minimalist TV sitting on top
      const tvScreenGeo = new THREE.BoxGeometry(scale.x * 0.75, 0.7, 0.04);
      const tvScreenMat = new THREE.MeshStandardMaterial({ color: '#030712', roughness: 0.1, metalness: 0.8 });
      const tvScreen = new THREE.Mesh(tvScreenGeo, tvScreenMat);
      tvScreen.position.set(0, scale.y + 0.45, 0);
      tvScreen.castShadow = true;
      group.add(tvScreen);

      // TV stand leg
      const tvPostGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.1, 16);
      const tvBaseMat = new THREE.MeshStandardMaterial({ color: '#374151', roughness: 0.4, metalness: 0.7 });
      const tvPost = new THREE.Mesh(tvPostGeo, tvBaseMat);
      tvPost.position.set(0, scale.y + 0.05, 0);
      group.add(tvPost);

      // TV flat stand base
      const tvBaseGeo = new THREE.BoxGeometry(0.4, 0.015, 0.25);
      const tvBase = new THREE.Mesh(tvBaseGeo, tvBaseMat);
      tvBase.position.set(0, scale.y + 0.0075, 0);
      group.add(tvBase);

      // Low wooden support blocks
      const supportGeo = new THREE.BoxGeometry(0.12, 0.1, 0.12);
      const legMat = new THREE.MeshStandardMaterial({ color: '#111827' });
      const offsetsX = [-scale.x / 2 + 0.1, scale.x / 2 - 0.1];
      const offsetsZ = [-scale.z / 2 + 0.08, scale.z / 2 - 0.08];

      offsetsX.forEach((x) => {
        offsetsZ.forEach((z) => {
          const support = new THREE.Mesh(supportGeo, legMat);
          support.position.set(x, 0.05, z);
          support.castShadow = true;
          group.add(support);
        });
      });
      break;
    }

    case 'rug': {
      // Rug is just a textured flat surface floating extremely close to 0 to prevent z-fighting
      const rugGeo = new THREE.BoxGeometry(scale.x, 0.006, scale.z);
      const rugMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 1.0,
        metalness: 0.0,
      });
      const rug = new THREE.Mesh(rugGeo, rugMat);
      rug.position.y = 0.003;
      rug.receiveShadow = true;
      group.add(rug);

      // Decorative rug border/fringes (two smaller white bars)
      const fringeGeo = new THREE.BoxGeometry(0.04, 0.007, scale.z);
      const fringeMat = new THREE.MeshStandardMaterial({ color: '#f5f5f4', roughness: 1.0 });

      const fringeL = new THREE.Mesh(fringeGeo, fringeMat);
      fringeL.position.set(-scale.x / 2 + 0.02, 0.0035, 0);
      group.add(fringeL);

      const fringeR = fringeL.clone();
      fringeR.position.x = scale.x / 2 - 0.02;
      group.add(fringeR);
      break;
    }

    case 'bookshelf': {
      // Outer carcass
      const sideGeo = new THREE.BoxGeometry(0.04, scale.y, scale.z);
      const sideL = new THREE.Mesh(sideGeo, primaryMat);
      sideL.position.set(-scale.x / 2 + 0.02, scale.y / 2, 0);
      sideL.castShadow = true;
      group.add(sideL);

      const sideR = sideL.clone();
      sideR.position.x = scale.x / 2 - 0.02;
      group.add(sideR);

      // Top and Bottom plates
      const plateGeo = new THREE.BoxGeometry(scale.x - 0.08, 0.04, scale.z);
      const plateTop = new THREE.Mesh(plateGeo, primaryMat);
      plateTop.position.set(0, scale.y - 0.02, 0);
      plateTop.castShadow = true;
      group.add(plateTop);

      const plateBottom = plateTop.clone();
      plateBottom.position.y = 0.02;
      group.add(plateBottom);

      // Back panel
      const backGeo = new THREE.BoxGeometry(scale.x - 0.04, scale.y, 0.02);
      const backColor = color.clone().offsetHSL(0, 0, -0.05);
      const backMat = new THREE.MeshStandardMaterial({ color: backColor, roughness: 0.8 });
      const back = new THREE.Mesh(backGeo, backMat);
      back.position.set(0, scale.y / 2, -scale.z / 2 + 0.01);
      group.add(back);

      // Shelves & Books
      const numShelves = 4;
      const shelfSpacing = (scale.y - 0.1) / numShelves;
      const shelfPlateGeo = new THREE.BoxGeometry(scale.x - 0.08, 0.025, scale.z - 0.02);

      const bookGeo = new THREE.BoxGeometry(0.04, 0.22, 0.18);
      const bookColors = ['#dc2626', '#2563eb', '#16a34a', '#eab308', '#ec4899', '#7c3aed'];

      for (let i = 1; i < numShelves; i++) {
        const h = i * shelfSpacing + 0.02;
        const sh = new THREE.Mesh(shelfPlateGeo, primaryMat);
        sh.position.set(0, h, 0.01);
        sh.castShadow = true;
        group.add(sh);

        // Populate shelf with some books
        const numBooks = Math.floor(Math.random() * 4) + 3;
        const bookStartOffset = -scale.x / 2.5;

        for (let b = 0; b < numBooks; b++) {
          const bookColor = bookColors[(i + b) % bookColors.length];
          const bMat = new THREE.MeshStandardMaterial({ color: bookColor, roughness: 0.8 });
          const book = new THREE.Mesh(bookGeo, bMat);

          const bookHeight = 0.18 + Math.random() * 0.06;
          const bookWidth = 0.03 + Math.random() * 0.02;
          book.scale.set(bookWidth / 0.04, bookHeight / 0.22, 1);

          book.position.set(
            bookStartOffset + b * 0.08 + Math.random() * 0.02,
            h + 0.012 + bookHeight / 2,
            -0.03
          );
          // tilt some books
          if (b === numBooks - 1 && Math.random() > 0.5) {
            book.rotation.z = -0.25;
            book.position.y -= 0.01;
            book.position.x += 0.02;
          }
          book.castShadow = true;
          group.add(book);
        }
      }
      break;
    }

    case 'bed': {
      // Headboard
      const headGeo = new THREE.BoxGeometry(scale.x, 0.9, 0.12);
      const head = new THREE.Mesh(headGeo, primaryMat);
      head.position.set(0, 0.45, -scale.z / 2 + 0.06);
      head.castShadow = true;
      group.add(head);

      // Wooden base frame
      const frameGeo = new THREE.BoxGeometry(scale.x, 0.25, scale.z - 0.12);
      const frame = new THREE.Mesh(frameGeo, woodMat);
      frame.position.set(0, 0.125, 0.06);
      frame.castShadow = true;
      frame.receiveShadow = true;
      group.add(frame);

      // Mattress
      const mattGeo = new THREE.BoxGeometry(scale.x - 0.08, 0.3, scale.z - 0.16);
      const mattMat = new THREE.MeshStandardMaterial({ color: '#fbfbfb', roughness: 0.85 }); // Off white fabric
      const mattress = new THREE.Mesh(mattGeo, mattMat);
      mattress.position.set(0, 0.3, 0.08);
      mattress.castShadow = true;
      mattress.receiveShadow = true;
      group.add(mattress);

      // Blanket / Quilt on lower half
      const quiltGeo = new THREE.BoxGeometry(scale.x - 0.07, 0.31, (scale.z - 0.16) / 2);
      const quiltMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.9 });
      const quilt = new THREE.Mesh(quiltGeo, quiltMat);
      quilt.position.set(0, 0.31, scale.z / 4 + 0.08);
      quilt.castShadow = true;
      group.add(quilt);

      // Pillows
      const pillowGeo = new THREE.BoxGeometry((scale.x - 0.3) / 2, 0.08, 0.4);
      const pillowMat = new THREE.MeshStandardMaterial({ color: '#f3f4f6', roughness: 0.95 });

      const pillowL = new THREE.Mesh(pillowGeo, pillowMat);
      pillowL.position.set(-scale.x / 4, 0.45, -scale.z / 3 + 0.08);
      pillowL.rotation.x = -0.15; // angled slightly
      pillowL.castShadow = true;
      group.add(pillowL);

      const pillowR = pillowL.clone();
      pillowR.position.x = scale.x / 4;
      group.add(pillowR);
      break;
    }

    case 'nightstand': {
      // Main block
      const standGeo = new THREE.BoxGeometry(scale.x, scale.y, scale.z);
      const stand = new THREE.Mesh(standGeo, primaryMat);
      stand.position.y = scale.y / 2;
      stand.castShadow = true;
      stand.receiveShadow = true;
      group.add(stand);

      // Drawer front grooves
      const drawerGeo = new THREE.BoxGeometry(scale.x - 0.04, (scale.y - 0.08) / 2, 0.01);
      const drawerMat = new THREE.MeshStandardMaterial({ color: color.clone().offsetHSL(0, 0, -0.08) });

      const d1 = new THREE.Mesh(drawerGeo, drawerMat);
      d1.position.set(0, scale.y * 0.7, scale.z / 2 - 0.005);
      group.add(d1);

      const d2 = d1.clone();
      d2.position.y = scale.y * 0.28;
      group.add(d2);

      // Brass drawer handles
      const handleGeo = new THREE.SphereGeometry(0.016, 8, 8);
      const handleMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', metalness: 0.9, roughness: 0.1 });

      const h1 = new THREE.Mesh(handleGeo, handleMat);
      h1.position.set(0, scale.y * 0.7, scale.z / 2 + 0.01);
      group.add(h1);

      const h2 = h1.clone();
      h2.position.y = scale.y * 0.28;
      group.add(h2);
      break;
    }

    case 'wardrobe': {
      // Main block
      const wardrobeGeo = new THREE.BoxGeometry(scale.x, scale.y, scale.z);
      const wardrobe = new THREE.Mesh(wardrobeGeo, primaryMat);
      wardrobe.position.y = scale.y / 2;
      wardrobe.castShadow = true;
      wardrobe.receiveShadow = true;
      group.add(wardrobe);

      // Doors seam (vertical thin line)
      const seamGeo = new THREE.BoxGeometry(0.015, scale.y - 0.1, 0.01);
      const seamMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.9 });
      const seam = new THREE.Mesh(seamGeo, seamMat);
      seam.position.set(0, scale.y / 2, scale.z / 2 - 0.004);
      group.add(seam);

      // Long metal bar door handles
      const hBarGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.5, 8);
      const hBarL = new THREE.Mesh(hBarGeo, metalMat);
      hBarL.position.set(-0.06, scale.y / 2, scale.z / 2 + 0.01);
      hBarL.castShadow = true;
      group.add(hBarL);

      const hBarR = hBarL.clone();
      hBarR.position.x = 0.06;
      group.add(hBarR);
      break;
    }

    case 'desk': {
      // Tabletop
      const topGeo = new THREE.BoxGeometry(scale.x, 0.04, scale.z);
      const top = new THREE.Mesh(topGeo, primaryMat);
      top.position.y = scale.y - 0.02;
      top.castShadow = true;
      top.receiveShadow = true;
      group.add(top);

      // Metal legs
      const legGeo = new THREE.CylinderGeometry(0.025, 0.018, scale.y - 0.04, 12);
      const legMat = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.3, metalness: 0.6 });

      const offsetsX = [-scale.x / 2 + 0.05, scale.x / 2 - 0.05];
      const offsetsZ = [-scale.z / 2 + 0.05, scale.z / 2 - 0.05];

      offsetsX.forEach((x) => {
        offsetsZ.forEach((z) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(x, (scale.y - 0.04) / 2, z);
          leg.castShadow = true;
          group.add(leg);
        });
      });

      // Simple drawer unit hanging on the right side
      const drawUnitGeo = new THREE.BoxGeometry(0.35, 0.22, scale.z - 0.1);
      const drawerUnit = new THREE.Mesh(drawUnitGeo, primaryMat);
      drawerUnit.position.set(scale.x / 2 - 0.22, scale.y - 0.15, 0.02);
      drawerUnit.castShadow = true;
      group.add(drawerUnit);
      break;
    }

    case 'desk_chair': {
      // Swivel star base
      const baseHubGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8);
      const baseHub = new THREE.Mesh(baseHubGeo, metalMat);
      baseHub.position.y = 0.15;
      group.add(baseHub);

      const legGeo = new THREE.BoxGeometry(scale.x, 0.02, 0.05);
      const leg1 = new THREE.Mesh(legGeo, metalMat);
      leg1.position.set(0, 0.13, 0);
      group.add(leg1);

      const leg2 = leg1.clone();
      leg2.rotation.y = Math.PI / 2;
      group.add(leg2);

      // Gas lift cylinder
      const stemGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.25, 8);
      const stem = new THREE.Mesh(stemGeo, metalMat);
      stem.position.y = 0.28;
      group.add(stem);

      // Seat cushion
      const seatGeo = new THREE.BoxGeometry(scale.x - 0.1, 0.07, scale.z - 0.1);
      const seat = new THREE.Mesh(seatGeo, primaryMat);
      seat.position.y = 0.42;
      seat.castShadow = true;
      group.add(seat);

      // Backrest bracket
      const bktGeo = new THREE.BoxGeometry(0.06, 0.35, 0.02);
      const bracket = new THREE.Mesh(bktGeo, metalMat);
      bracket.position.set(0, 0.58, -scale.z / 2 + 0.08);
      bracket.rotation.x = 0.1;
      group.add(bracket);

      // Backrest
      const backGeo = new THREE.BoxGeometry(scale.x - 0.15, scale.y * 0.4, 0.05);
      const back = new THREE.Mesh(backGeo, primaryMat);
      back.position.set(0, 0.75, -scale.z / 2 + 0.05);
      back.castShadow = true;
      group.add(back);
      break;
    }

    case 'dining_table': {
      // Massive dining top
      const topGeo = new THREE.BoxGeometry(scale.x, 0.05, scale.z);
      const top = new THREE.Mesh(topGeo, primaryMat);
      top.position.y = scale.y - 0.025;
      top.castShadow = true;
      top.receiveShadow = true;
      group.add(top);

      // Heavy wooden legs
      const legGeo = new THREE.CylinderGeometry(0.045, 0.035, scale.y - 0.05, 12);
      const legColor = color.clone().offsetHSL(0, 0, -0.05);
      const legMat = new THREE.MeshStandardMaterial({ color: legColor, roughness: 0.7 });

      const offsetsX = [-scale.x / 2 + 0.08, scale.x / 2 - 0.08];
      const offsetsZ = [-scale.z / 2 + 0.08, scale.z / 2 - 0.08];

      offsetsX.forEach((x) => {
        offsetsZ.forEach((z) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(x, (scale.y - 0.05) / 2, z);
          leg.castShadow = true;
          group.add(leg);
        });
      });
      break;
    }

    case 'dining_chair': {
      // Seat height: ~0.45m
      const seatGeo = new THREE.BoxGeometry(scale.x, 0.04, scale.z);
      const seat = new THREE.Mesh(seatGeo, primaryMat);
      seat.position.y = 0.43;
      seat.castShadow = true;
      group.add(seat);

      // High backrest
      const backGeo = new THREE.BoxGeometry(scale.x, 0.45, 0.04);
      const back = new THREE.Mesh(backGeo, primaryMat);
      back.position.set(0, 0.65, -scale.z / 2 + 0.02);
      back.castShadow = true;
      group.add(back);

      // Back vertical frame rails
      const railGeo = new THREE.BoxGeometry(0.03, 0.5, 0.03);
      const railL = new THREE.Mesh(railGeo, woodMat);
      railL.position.set(-scale.x / 2 + 0.025, 0.4, -scale.z / 2 + 0.025);
      railL.castShadow = true;
      group.add(railL);

      const railR = railL.clone();
      railR.position.x = scale.x / 2 - 0.025;
      group.add(railR);

      // Legs
      const legGeo = new THREE.CylinderGeometry(0.022, 0.015, 0.41, 8);
      const legMat = woodMat;
      const offsetsX = [-scale.x / 2 + 0.03, scale.x / 2 - 0.03];
      const offsetsZ = [-scale.z / 2 + 0.03, scale.z / 2 - 0.03];

      offsetsX.forEach((x) => {
        offsetsZ.forEach((z) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(x, 0.205, z);
          leg.castShadow = true;
          group.add(leg);
        });
      });
      break;
    }

    case 'fridge': {
      // Fridge cabinet
      const cabGeo = new THREE.BoxGeometry(scale.x, scale.y, scale.z);
      const body = new THREE.Mesh(cabGeo, primaryMat);
      body.position.y = scale.y / 2;
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      // Horizontal seam for freezer on bottom or French door vertical seam
      const doorSeamGeo = new THREE.BoxGeometry(0.01, scale.y - 0.1, 0.01);
      const seamMat = new THREE.MeshStandardMaterial({ color: '#27272a' });
      const seam = new THREE.Mesh(doorSeamGeo, seamMat);
      seam.position.set(0, scale.y / 2, scale.z / 2 - 0.005);
      group.add(seam);

      const hSeamGeo = new THREE.BoxGeometry(scale.x - 0.05, 0.01, 0.01);
      const hSeam = new THREE.Mesh(hSeamGeo, seamMat);
      hSeam.position.set(0, scale.y * 0.35, scale.z / 2 - 0.004);
      group.add(hSeam);

      // Chrome long bar handles
      const handleGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.4, 8);
      const handleL = new THREE.Mesh(handleGeo, metalMat);
      handleL.position.set(-0.04, scale.y * 0.65, scale.z / 2 + 0.01);
      handleL.castShadow = true;
      group.add(handleL);

      const handleR = handleL.clone();
      handleR.position.x = 0.04;
      group.add(handleR);

      const freezerHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.25, 8), metalMat);
      freezerHandle.rotation.z = Math.PI / 2;
      freezerHandle.position.set(0, scale.y * 0.3, scale.z / 2 + 0.01);
      freezerHandle.castShadow = true;
      group.add(freezerHandle);
      break;
    }

    case 'kitchen_island': {
      // Main cabinet base
      const baseGeo = new THREE.BoxGeometry(scale.x - 0.05, scale.y - 0.04, scale.z - 0.05);
      const base = new THREE.Mesh(baseGeo, primaryMat);
      base.position.y = (scale.y - 0.04) / 2;
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);

      // Marble Countertop on top with slight overhang
      const topGeo = new THREE.BoxGeometry(scale.x, 0.04, scale.z);
      const counterTopMat = new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.15,
        metalness: 0.1,
      });
      const top = new THREE.Mesh(topGeo, counterTopMat);
      top.position.y = scale.y - 0.02;
      top.castShadow = true;
      top.receiveShadow = true;
      group.add(top);

      // Decorative panel grooves on one side
      const panelGeo = new THREE.BoxGeometry(0.01, scale.y - 0.2, scale.z - 0.2);
      const panelL = new THREE.Mesh(panelGeo, primaryMat);
      panelL.position.set(-scale.x / 2 + 0.03, scale.y / 2 - 0.02, 0);
      group.add(panelL);

      const panelR = panelL.clone();
      panelR.position.x = scale.x / 2 - 0.03;
      group.add(panelR);
      break;
    }

    case 'bathtub': {
      // White freestanding bathtub
      // Inner tub void is simulated by stacking layers or a outer box with rounded trim
      const tubGeo = new THREE.BoxGeometry(scale.x, scale.y, scale.z);
      const tub = new THREE.Mesh(tubGeo, porcelainMat);
      tub.position.y = scale.y / 2;
      tub.castShadow = true;
      tub.receiveShadow = true;
      group.add(tub);

      // Silver drain and faucet
      const faucetPostGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.2, 8);
      const faucetPost = new THREE.Mesh(faucetPostGeo, metalMat);
      faucetPost.position.set(-scale.x / 2 + 0.08, scale.y + 0.1, 0);
      faucetPost.castShadow = true;
      group.add(faucetPost);

      const tapGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.08, 8);
      const tap = new THREE.Mesh(tapGeo, metalMat);
      tap.rotation.z = Math.PI / 2;
      tap.position.set(-scale.x / 2 + 0.11, scale.y + 0.2, 0);
      group.add(tap);
      break;
    }

    case 'toilet': {
      // Toilet bowl
      const bowlGeo = new THREE.BoxGeometry(0.42, 0.4, 0.5);
      const bowl = new THREE.Mesh(bowlGeo, porcelainMat);
      bowl.position.set(0, 0.2, 0.08);
      bowl.castShadow = true;
      group.add(bowl);

      // Back Water tank
      const tankGeo = new THREE.BoxGeometry(0.44, 0.42, 0.22);
      const tank = new THREE.Mesh(tankGeo, porcelainMat);
      tank.position.set(0, 0.61, -scale.z / 2 + 0.11);
      tank.castShadow = true;
      group.add(tank);

      // Toilet seat cover lid (slightly different white shade)
      const seatGeo = new THREE.BoxGeometry(0.41, 0.02, 0.44);
      const seatMat = new THREE.MeshStandardMaterial({ color: '#f3f4f6', roughness: 0.15 });
      const seat = new THREE.Mesh(seatGeo, seatMat);
      seat.position.set(0, 0.41, 0.09);
      group.add(seat);

      // Flush lever
      const leverGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.04, 8);
      const lever = new THREE.Mesh(leverGeo, metalMat);
      lever.rotation.z = Math.PI / 2;
      lever.position.set(-0.18, 0.72, -scale.z / 2 + 0.24);
      group.add(lever);
      break;
    }

    case 'bathroom_sink': {
      // Vanity cabinet base
      const cabGeo = new THREE.BoxGeometry(scale.x, scale.y - 0.12, scale.z);
      const cabinet = new THREE.Mesh(cabGeo, primaryMat);
      cabinet.position.y = (scale.y - 0.12) / 2;
      cabinet.castShadow = true;
      cabinet.receiveShadow = true;
      group.add(cabinet);

      // Porcelain countertop Sink basin
      const sinkGeo = new THREE.BoxGeometry(scale.x - 0.04, 0.12, scale.z - 0.04);
      const sink = new THREE.Mesh(sinkGeo, porcelainMat);
      sink.position.y = scale.y - 0.06;
      sink.castShadow = true;
      sink.receiveShadow = true;
      group.add(sink);

      // Faucet
      const faucetGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.15, 8);
      const faucet = new THREE.Mesh(faucetGeo, metalMat);
      faucet.position.set(0, scale.y + 0.075, -scale.z / 2 + 0.08);
      faucet.castShadow = true;
      group.add(faucet);

      const spoutGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.06, 8);
      const spout = new THREE.Mesh(spoutGeo, metalMat);
      spout.rotation.x = Math.PI / 2;
      spout.position.set(0, scale.y + 0.15, -scale.z / 2 + 0.11);
      group.add(spout);
      break;
    }

    case 'door': {
      // Frame
      const frameWGeo = new THREE.BoxGeometry(scale.x, 0.05, scale.z * 1.2);
      const frameTop = new THREE.Mesh(frameWGeo, woodMat);
      frameTop.position.set(0, scale.y - 0.025, 0);
      group.add(frameTop);

      const frameHGeo = new THREE.BoxGeometry(0.05, scale.y - 0.05, scale.z * 1.2);
      const frameL = new THREE.Mesh(frameHGeo, woodMat);
      frameL.position.set(-scale.x / 2 + 0.025, (scale.y - 0.05) / 2, 0);
      group.add(frameL);

      const frameR = frameL.clone();
      frameR.position.x = scale.x / 2 - 0.025;
      group.add(frameR);

      // Swing Door slab (shown partially open at a 45 deg angle!)
      const doorSlabGeo = new THREE.BoxGeometry(scale.x - 0.08, scale.y - 0.08, 0.04);
      const doorSlab = new THREE.Mesh(doorSlabGeo, primaryMat);
      // Position the door slab group to pivot from the side hinge
      const doorPivotGroup = new THREE.Group();
      doorPivotGroup.position.set(-scale.x / 2 + 0.04, (scale.y - 0.08) / 2 + 0.04, 0);
      doorSlab.position.x = (scale.x - 0.08) / 2; // offset so the edge matches the pivot
      doorPivotGroup.add(doorSlab);
      doorPivotGroup.rotation.y = 1.0; // 45-ish degrees open
      group.add(doorPivotGroup);

      // Brass door handle sphere
      const handleGeo = new THREE.SphereGeometry(0.025, 12, 12);
      const handleMat = new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.9, roughness: 0.15 });
      const doorHandle = new THREE.Mesh(handleGeo, handleMat);
      doorHandle.position.set(scale.x - 0.16, 0, 0.05);
      doorPivotGroup.add(doorHandle);
      break;
    }

    case 'window': {
      // Window white frame
      const frameWGeo = new THREE.BoxGeometry(scale.x, 0.05, scale.z);
      const frameTop = new THREE.Mesh(frameWGeo, porcelainMat);
      frameTop.position.set(0, scale.y / 2, 0);
      group.add(frameTop);

      const frameBottom = frameTop.clone();
      frameBottom.position.y = -scale.y / 2;
      group.add(frameBottom);

      const frameHGeo = new THREE.BoxGeometry(0.05, scale.y, scale.z);
      const frameL = new THREE.Mesh(frameHGeo, porcelainMat);
      frameL.position.set(-scale.x / 2 + 0.025, 0, 0);
      group.add(frameL);

      const frameR = frameL.clone();
      frameR.position.x = scale.x / 2 - 0.025;
      group.add(frameR);

      // Glass panels
      const glassGeo = new THREE.BoxGeometry(scale.x - 0.08, scale.y - 0.08, 0.02);
      const glass = new THREE.Mesh(glassGeo, glassMat);
      group.add(glass);

      // Window muntins (cross-bars for detailed look)
      const dividerV = new THREE.Mesh(new THREE.BoxGeometry(0.015, scale.y - 0.08, 0.022), porcelainMat);
      group.add(dividerV);

      const dividerH = new THREE.Mesh(new THREE.BoxGeometry(scale.x - 0.08, 0.015, 0.022), porcelainMat);
      group.add(dividerH);

      // Move window up off ground by default mounting height
      group.position.y = 1.0; // standard sill height
      break;
    }

    case 'plant': {
      // Ceramic pot
      const potGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.25, 16);
      const potMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.y = 0.125;
      pot.castShadow = true;
      group.add(pot);

      // Soil
      const soilGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.02, 16);
      const soilMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.9 });
      const soil = new THREE.Mesh(soilGeo, soilMat);
      soil.position.y = 0.235;
      group.add(soil);

      // Stems and Large Monstera leaves
      const plantStemMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8 });
      const leafGeo = new THREE.SphereGeometry(0.16, 8, 8);
      leafGeo.scale(1.2, 0.08, 1.8); // Flatten into a leaf!

      // Draw 5 styled leaves shooting out
      const stemCount = 5;
      for (let i = 0; i < stemCount; i++) {
        const stemGroup = new THREE.Group();
        stemGroup.position.set(0, 0.23, 0);

        // Thin stem pole
        const poleGeo = new THREE.CylinderGeometry(0.008, 0.012, 0.4 + i * 0.1, 8);
        const pole = new THREE.Mesh(poleGeo, plantStemMat);
        pole.position.y = (0.4 + i * 0.1) / 2;
        stemGroup.add(pole);

        // Leaf mesh angled on top of the stem
        const leaf = new THREE.Mesh(leafGeo, plantGreenMat);
        leaf.position.y = 0.4 + i * 0.1;
        leaf.rotation.x = 0.5 + Math.random() * 0.4;
        leaf.rotation.z = Math.random() * 0.2 - 0.1;
        leaf.castShadow = true;
        stemGroup.add(leaf);

        // Angle the stem outwards
        stemGroup.rotation.y = (i * (2 * Math.PI)) / stemCount + (Math.random() * 0.3 - 0.15);
        stemGroup.rotation.x = 0.3 + i * 0.08;

        group.add(stemGroup);
      }
      break;
    }

    case 'lamp_floor': {
      // Circular metal base
      const baseGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.02, 16);
      const base = new THREE.Mesh(baseGeo, metalMat);
      base.position.y = 0.01;
      base.castShadow = true;
      group.add(base);

      // Slender gold pole
      const poleGeo = new THREE.CylinderGeometry(0.01, 0.01, scale.y - 0.3, 8);
      const pole = new THREE.Mesh(poleGeo, metalMat);
      pole.position.y = (scale.y - 0.3) / 2 + 0.02;
      pole.castShadow = true;
      group.add(pole);

      // Shade (trapezoid cone)
      const shadeGeo = new THREE.CylinderGeometry(0.15, 0.22, 0.28, 16);
      const shadeMat = new THREE.MeshStandardMaterial({
        color: '#fef08a', // pale translucent yellow
        emissive: '#fef08a',
        emissiveIntensity: 0.3,
        roughness: 0.9,
      });
      const shade = new THREE.Mesh(shadeGeo, shadeMat);
      shade.position.y = scale.y - 0.14;
      shade.castShadow = true;
      group.add(shade);

      // Bulb (emissive sphere)
      const bulbGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const bulbMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.y = scale.y - 0.22;
      group.add(bulb);
      break;
    }

    case 'painting': {
      // Picture frame
      const frameGeo = new THREE.BoxGeometry(scale.x, scale.y, 0.02);
      const frameMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.8 });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.castShadow = true;
      group.add(frame);

      // Abstract canvas inset
      const artGeo = new THREE.BoxGeometry(scale.x - 0.08, scale.y - 0.08, 0.01);

      // Procedural color palette canvas texture!
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = color.getStyle();
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(40, 50, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(50, 40, 60, 50);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 108, 108);
      }
      const canvasTex = new THREE.CanvasTexture(canvas);
      const artMat = new THREE.MeshBasicMaterial({ map: canvasTex });
      const art = new THREE.Mesh(artGeo, artMat);
      art.position.z = 0.006;
      group.add(art);

      // Painting floats at hanging height
      group.position.y = 1.5; // typical art center height
      break;
    }

    default: {
      // Fallback box with outline
      const boxGeo = new THREE.BoxGeometry(scale.x, scale.y, scale.z);
      const box = new THREE.Mesh(boxGeo, primaryMat);
      box.position.y = scale.y / 2;
      box.castShadow = true;
      box.receiveShadow = true;
      group.add(box);
      break;
    }
  }

  return group;
}
