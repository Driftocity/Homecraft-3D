/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import ThreeCanvas from './components/ThreeCanvas';
import Sidebar from './components/Sidebar';
import Inspector from './components/Inspector';
import AIPlanner from './components/AIPlanner';
import { HomeProject, Furniture, FloorMaterial } from './types';
import { getCatalogItemById } from './data/furnitureCatalog';
import {
  Sparkles,
  Eye,
  Settings,
  HelpCircle,
  FolderOpen,
  Download,
  Trash2,
  Grid,
  Info,
  Check,
  Compass,
  FileText,
  RotateCw
} from 'lucide-react';

// Default starter project (Warm furnished living room)
const INITIAL_PROJECT: HomeProject = {
  id: 'starter-modern-living',
  name: 'Modern Scandinavian Living Room',
  floorMaterial: 'hardwood',
  floorColor: '#eab308', // Birch wood
  dimensions: { width: 10, length: 10 },
  walls: [
    // Closed outer room loop (10m x 10m)
    { id: 'wall-north', p1: { x: -5, y: -5 }, p2: { x: 5, y: -5 }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
    { id: 'wall-east', p1: { x: 5, y: -5 }, p2: { x: 5, y: 5 }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
    { id: 'wall-south', p1: { x: 5, y: 5 }, p2: { x: -5, y: 5 }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
    { id: 'wall-west', p1: { x: -5, y: 5 }, p2: { x: -5, y: -5 }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
  ],
  furniture: [
    {
      id: 'furn-sofa',
      catalogId: 'sofa_modern',
      name: 'Modern 3-Seater Sofa',
      type: 'sofa',
      position: { x: 0, y: 0, z: 2.5 },
      rotation: 0, // facing north
      scale: { x: 2.2, y: 0.8, z: 0.9 },
      color: '#4b5563',
      materialType: 'fabric',
      category: 'living'
    },
    {
      id: 'furn-table',
      catalogId: 'coffee_table_wood',
      name: 'Wooden Coffee Table',
      type: 'coffee_table',
      position: { x: 0, y: 0, z: 1.0 },
      rotation: 0,
      scale: { x: 1.2, y: 0.45, z: 0.7 },
      color: '#78350f',
      materialType: 'wood',
      category: 'living'
    },
    {
      id: 'furn-tv',
      catalogId: 'tv_stand_console',
      name: 'Media Center Console',
      type: 'tv_stand',
      position: { x: 0, y: 0, z: -4.3 },
      rotation: Math.PI, // facing south
      scale: { x: 1.8, y: 0.5, z: 0.45 },
      color: '#1f2937',
      materialType: 'wood',
      category: 'living'
    },
    {
      id: 'furn-rug',
      catalogId: 'rug_area',
      name: 'Geometric Area Rug',
      type: 'rug',
      position: { x: 0, y: 0, z: 1.5 },
      rotation: 0,
      scale: { x: 3.0, y: 0.01, z: 2.0 },
      color: '#e2e8f0',
      materialType: 'fabric',
      category: 'living'
    },
    {
      id: 'furn-plant',
      catalogId: 'plant_house',
      name: 'Potted Monstera Plant',
      type: 'plant',
      position: { x: -4.2, y: 0, z: -4.2 },
      rotation: 0,
      scale: { x: 0.6, y: 1.0, z: 0.6 },
      color: '#15803d',
      materialType: 'plastic',
      category: 'decor'
    },
    {
      id: 'furn-lamp',
      catalogId: 'lamp_floor',
      name: 'Minimalist Floor Lamp',
      type: 'lamp_floor',
      position: { x: 4.1, y: 0, z: 3.8 },
      rotation: -0.8,
      scale: { x: 0.4, y: 1.6, z: 0.4 },
      color: '#facc15',
      materialType: 'metal',
      category: 'decor'
    }
  ]
};

export default function App() {
  const [project, setProject] = useState<HomeProject>(INITIAL_PROJECT);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'walkthrough'>('3d');
  const [gridSnapping, setGridSnapping] = useState<boolean>(true);
  const [activePlacingCatalogId, setActivePlacingCatalogId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'templates' | 'ai'>('catalog');
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Load preset templates
  const handleLoadTemplate = (newProject: HomeProject) => {
    setProject(newProject);
    setSelectedFurnitureId(null);
    setActivePlacingCatalogId(null);
  };

  // Select furniture helper
  const handleSelectFurniture = (id: string | null) => {
    setSelectedFurnitureId(id);
  };

  // Update position of a piece of furniture
  const handleUpdateFurniturePosition = (id: string, pos: { x: number; y: number; z: number }) => {
    setProject((prev) => ({
      ...prev,
      furniture: prev.furniture.map((item) =>
        item.id === id ? { ...item, position: pos } : item
      ),
    }));
  };

  // Update rotation of a piece of furniture
  const handleUpdateFurnitureRotation = (id: string, rot: number) => {
    setProject((prev) => ({
      ...prev,
      furniture: prev.furniture.map((item) =>
        item.id === id ? { ...item, rotation: rot } : item
      ),
    }));
  };

  // Fine-grain furniture inspector edits
  const handleUpdateFurniture = (updatedItem: Furniture) => {
    setProject((prev) => ({
      ...prev,
      furniture: prev.furniture.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    }));
  };

  // Delete furniture
  const handleDeleteFurniture = (id: string) => {
    setProject((prev) => ({
      ...prev,
      furniture: prev.furniture.filter((item) => item.id !== id),
    }));
    if (selectedFurnitureId === id) {
      setSelectedFurnitureId(null);
    }
  };

  // Duplicate furniture
  const handleDuplicateFurniture = (item: Furniture) => {
    const copy: Furniture = {
      ...item,
      id: `furn-copy-${Date.now()}`,
      name: `${item.name} (Copy)`,
      position: {
        x: Math.min(project.dimensions.width / 2, item.position.x + 0.4), // slight offset to side
        y: item.position.y,
        z: item.position.z
      }
    };
    setProject((prev) => ({
      ...prev,
      furniture: [...prev.furniture, copy]
    }));
    setSelectedFurnitureId(copy.id);
  };

  // Load a catalog item onto the raycast placement cursor
  const handlePlaceCatalogItemSelect = (catalogId: string | null) => {
    setActivePlacingCatalogId(catalogId);
  };

  // Triggered when placement preview is clicked on the floor
  const handlePlaceItemOnGrid = (catalogId: string, position: { x: number; y: number; z: number }) => {
    const catalogItem = getCatalogItemById(catalogId);
    if (!catalogItem) return;

    const newFurniture: Furniture = {
      id: `furn-user-${Date.now()}`,
      catalogId,
      name: catalogItem.name,
      type: catalogItem.type,
      position,
      rotation: 0,
      scale: { ...catalogItem.defaultScale },
      color: catalogItem.defaultColor,
      materialType: catalogItem.defaultMaterial,
      category: catalogItem.category,
    };

    setProject((prev) => ({
      ...prev,
      furniture: [...prev.furniture, newFurniture],
    }));

    // Auto select newly placed item & clear active placement cursor
    setSelectedFurnitureId(newFurniture.id);
    setActivePlacingCatalogId(null);
  };

  // Update global floor materials / colors / name
  const handleUpdateFloorSettings = (settings: { floorMaterial: FloorMaterial; floorColor: string; name: string }) => {
    setProject((prev) => ({
      ...prev,
      name: settings.name,
      floorMaterial: settings.floorMaterial,
      floorColor: settings.floorColor,
    }));
  };

  // Clear workspace
  const handleClearWorkspace = () => {
    if (window.confirm('Are you sure you want to clear your entire room layout and furniture?')) {
      const halfW = project.dimensions.width / 2;
      const halfL = project.dimensions.length / 2;
      setProject({
        id: 'user-room-' + Date.now(),
        name: 'Empty Blueprint Plan',
        floorMaterial: 'concrete',
        floorColor: '#475569',
        dimensions: project.dimensions,
        walls: [
          { id: 'w1', p1: { x: -halfW, y: -halfL }, p2: { x: halfW, y: -halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
          { id: 'w2', p1: { x: halfW, y: -halfL }, p2: { x: halfW, y: halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
          { id: 'w3', p1: { x: halfW, y: halfL }, p2: { x: -halfW, y: halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
          { id: 'w4', p1: { x: -halfW, y: halfL }, p2: { x: -halfW, y: -halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
        ],
        furniture: []
      });
      setSelectedFurnitureId(null);
      setActivePlacingCatalogId(null);
    }
  };

  // Export layout to standard JSON file download
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}_blueprint.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import layout from JSON upload
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedProject = JSON.parse(event.target?.result as string);
        if (importedProject && importedProject.walls && importedProject.furniture) {
          setProject(importedProject);
          setSelectedFurnitureId(null);
          setActivePlacingCatalogId(null);
        } else {
          alert('Invalid blueprint file schema. Missing walls or furniture lists.');
        }
      } catch (err) {
        alert('Failed to parse blueprint JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const activeSelectedFurniture = project.furniture.find((item) => item.id === selectedFurnitureId) || null;

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans antialiased overflow-hidden" id="applet-root">
      {/* Top Banner / Navigation Dashboard */}
      <header className="h-16 shrink-0 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 z-10" id="top-dashboard">
        {/* Branding Title */}
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-sm font-bold tracking-wider text-slate-100 font-mono uppercase">
            {project.name}
          </h1>
          <span className="hidden md:inline text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-mono">
            {project.dimensions.width}m × {project.dimensions.length}m Layout
          </span>
        </div>

        {/* View mode toggle controls (Bento rounded switches) */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => { setViewMode('2d'); handleSelectFurniture(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer select-none ${
              viewMode === '2d'
                ? 'bg-slate-800 border border-slate-700/50 text-indigo-400 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>2D Blueprint</span>
          </button>
          <button
            onClick={() => { setViewMode('3d'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer select-none ${
              viewMode === '3d'
                ? 'bg-slate-800 border border-slate-700/50 text-indigo-400 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3D Studio</span>
          </button>
          <button
            onClick={() => { setViewMode('walkthrough'); handleSelectFurniture(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer select-none ${
              viewMode === 'walkthrough'
                ? 'bg-slate-800 border border-slate-700/50 text-indigo-400 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>First-Person Walk</span>
          </button>
        </div>

        {/* Action icons (Grid Snapping, Import, Export, Clear) */}
        <div className="flex items-center gap-2">
          {/* Grid snapping toggler */}
          <button
            onClick={() => setGridSnapping(!gridSnapping)}
            title="Toggle Grid Alignment Snapping (0.25m Steps)"
            className={`p-2 rounded-xl border transition cursor-pointer ${
              gridSnapping
                ? 'bg-indigo-600/10 border-indigo-500/60 text-indigo-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Import JSON input */}
          <label
            title="Import Saved Layout File"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 transition cursor-pointer flex items-center justify-center"
          >
            <FolderOpen className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          {/* Export JSON Button */}
          <button
            onClick={handleExportJSON}
            title="Export Layout as Blueprint File"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1" />

          {/* Clear Button */}
          <button
            onClick={handleClearWorkspace}
            title="Reset scene empty canvas"
            className="p-2 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-950 hover:border-rose-700 text-rose-300 hover:text-rose-200 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Drawer Side Panel */}
        <Sidebar
          onPlaceCatalogItem={handlePlaceCatalogItemSelect}
          activePlacingCatalogId={activePlacingCatalogId}
          onLoadTemplate={handleLoadTemplate}
          currentProject={project}
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
        >
          {/* AI Layout Planner inside Side Panel Drawer */}
          <AIPlanner
            onLoadGeneratedProject={handleLoadTemplate}
            currentDimensions={project.dimensions}
          />
        </Sidebar>

        {/* Core Canvas Viewport area */}
        <main className="flex-1 h-full relative overflow-hidden bg-slate-100" id="canvas-workspace">
          <ThreeCanvas
            project={project}
            selectedFurnitureId={selectedFurnitureId}
            selectedWallId={null}
            viewMode={viewMode}
            onSelectFurniture={handleSelectFurniture}
            onUpdateFurniturePosition={handleUpdateFurniturePosition}
            onUpdateFurnitureRotation={handleUpdateFurnitureRotation}
            gridSnapping={gridSnapping}
            activePlacingItemCatalogId={activePlacingCatalogId}
            onPlaceItem={handlePlaceItemOnGrid}
          />

          {/* Floating Instruction Manual Banner */}
          {showHelp && (
            <div className="absolute top-20 left-6 bg-slate-950/95 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-2xl z-20 max-w-md animate-fadeIn" id="instructions-manual">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">How to use the Architect</h3>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer select-none"
                >
                  ✕ Close
                </button>
              </div>
              <ul className="text-xs text-slate-300 flex flex-col gap-2.5 list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold shrink-0">1.</span>
                  <span>Select any item from the <span className="font-semibold text-white">Furniture Catalog</span> on the left tab. Click to enter "Placement Mode".</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold shrink-0">2.</span>
                  <span>Hover over the 3D grid, and <span className="font-semibold text-white">Left Click</span> on the floor to drop it exactly where you want.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold shrink-0">3.</span>
                  <span>Once placed, click on any item in the scene to <span className="font-semibold text-white">select</span> it. You can slide it around the floor, duplicate it, or trash it.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold shrink-0">4.</span>
                  <span>With an item selected, use the <span className="font-semibold text-white">Right Inspector</span> to tweak dimensions (width, height), rotate by degrees, elevate off the floor, or paint with custom texture shades.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold shrink-0">5.</span>
                  <span>Try the <span className="font-semibold text-indigo-300">AI Plan</span> tab. Type what you want (e.g., "A modern gaming bedroom") and let Gemini place walls and custom furniture coordinates instantly!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold shrink-0">6.</span>
                  <span>Use <span className="font-semibold text-white">First-Person Walk</span> to step inside. Press W, A, S, D or Arrows to navigate the rooms at eye-level!</span>
                </li>
              </ul>
            </div>
          )}
        </main>

        {/* Right Properties Inspector Drawer */}
        <Inspector
          selectedFurniture={activeSelectedFurniture}
          project={project}
          onUpdateFurniture={handleUpdateFurniture}
          onDeleteFurniture={handleDeleteFurniture}
          onDuplicateFurniture={handleDuplicateFurniture}
          onUpdateFloorSettings={handleUpdateFloorSettings}
        />
      </div>

      {/* Footer Status Indicators bar */}
      <footer className="h-8 shrink-0 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-6 text-[10px] font-mono text-slate-500 z-10" id="footer-rail">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>WebGL Context: Ready</span>
          </span>
          <span>Snapping: {gridSnapping ? '0.25m' : 'Disabled'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Active View: {viewMode.toUpperCase()}</span>
          <span>Press R to Rotate Selected Item</span>
        </div>
      </footer>
    </div>
  );
}
