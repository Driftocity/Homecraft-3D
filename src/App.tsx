/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import ThreeCanvas from './components/ThreeCanvas';
import Sidebar from './components/Sidebar';
import Inspector from './components/Inspector';
import ConstructionGuide from './components/ConstructionGuide';
import SummaryReportModal from './components/SummaryReportModal';
import InstallModal from './components/InstallModal';
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
  RotateCw,
  Copy,
  Plus,
  Layers,
  Undo2,
  Redo2,
  Save,
  History,
  Edit2,
  Smartphone
} from 'lucide-react';

// Default starter project (Warm furnished living room)
const INITIAL_PROJECT: HomeProject = {
  id: 'starter-modern-living',
  name: 'Modern Scandinavian Living Room',
  floorMaterial: 'hardwood',
  floorColor: '#eab308', // Birch wood
  dimensions: { width: 10, length: 10 },
  foundationType: 'slab',
  foundationHeight: 0.2,
  foundationColor: '#64748b',
  sidingType: 'vinyl',
  sidingColor: '#f1f5f9',
  roofType: 'gabled',
  roofColor: '#334155',
  roofPitch: 0.35,
  roofOverhang: 0.3,
  unitSystem: 'imperial',
  targetBudget: 60000,
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
  // Load initial project from localStorage if it exists, otherwise use default
  const [project, setProject] = useState<HomeProject>(() => {
    try {
      const saved = localStorage.getItem('draft_home_project');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to restore saved project draft', e);
    }
    return INITIAL_PROJECT;
  });

  const [undoStack, setUndoStack] = useState<HomeProject[]>([]);
  const [redoStack, setRedoStack] = useState<HomeProject[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('auto_save_setting');
    return saved !== 'false'; // defaults to true
  });

  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'walkthrough'>('3d');
  const [gridSnapping, setGridSnapping] = useState<boolean>(true);
  const [activePlacingCatalogId, setActivePlacingCatalogId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'templates' | 'construction' | 'rooms' | 'pricing'>('construction');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [showSummaryReport, setShowSummaryReport] = useState<boolean>(false);

  // Update project with undo/redo capability
  const setProjectWithHistory = (updateValue: HomeProject | ((prev: HomeProject) => HomeProject)) => {
    setProject((prev) => {
      const next = typeof updateValue === 'function' ? updateValue(prev) : updateValue;
      // Push previous to undo stack
      setUndoStack((u) => [...u, prev].slice(-50)); // limit history to 50 states
      // Clear redo stack on a new modification
      setRedoStack([]);
      return next;
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((u) => u.slice(0, -1));
    setRedoStack((r) => [...r, project]);
    setProject(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setUndoStack((u) => [...u, project]);
    setProject(next);
  };

  // Auto-Save Effect
  React.useEffect(() => {
    if (autoSaveEnabled) {
      try {
        localStorage.setItem('draft_home_project', JSON.stringify(project));
      } catch (e) {
        console.error('Failed to auto-save project', e);
      }
    }
  }, [project, autoSaveEnabled]);

  // Persist autoSaveEnabled state
  React.useEffect(() => {
    localStorage.setItem('auto_save_setting', String(autoSaveEnabled));
  }, [autoSaveEnabled]);

  const handleDragEnd = () => {
    // Record history of the final dragged item position
    setProjectWithHistory((prev) => prev);
  };

  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(project.name);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Monitor browser PWA install availability
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallModal(false);
  };

  // Sync tempName when project.name changes externally (e.g., templates loading)
  React.useEffect(() => {
    setTempName(project.name);
  }, [project.name]);

  const handleSaveName = () => {
    setIsEditingName(false);
    const trimmed = tempName.trim();
    if (trimmed && trimmed !== project.name) {
      setProjectWithHistory({
        ...project,
        name: trimmed
      });
    }
  };

  // Global Keyboard Shortcuts (Alt+R for Reset Layout, Ctrl+Z for Undo, Ctrl+Y for Redo)
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Avoid firing if in input or textareas
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      // Alt + R: Reset Layout
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleClearWorkspace();
      }

      // Ctrl + Z: Undo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl + Y or Ctrl + Shift + Z: Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [project, undoStack, redoStack]);

  // Load preset templates
  const handleLoadTemplate = (newProject: HomeProject) => {
    setProject(newProject);
    setSelectedFurnitureId(null);
    setActivePlacingCatalogId(null);
  };

  // Select furniture helper
  const handleSelectFurniture = (id: string | null) => {
    setSelectedFurnitureId(id);
    if (id) {
      setIsInspectorOpen(true); // Auto expand inspector for selected item on mobile
    }
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
    setProjectWithHistory((prev) => ({
      ...prev,
      furniture: prev.furniture.map((item) =>
        item.id === id ? { ...item, rotation: rot } : item
      ),
    }));
  };

  // Fine-grain furniture inspector edits
  const handleUpdateFurniture = (updatedItem: Furniture) => {
    setProjectWithHistory((prev) => ({
      ...prev,
      furniture: prev.furniture.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    }));
  };

  // Delete furniture
  const handleDeleteFurniture = (id: string) => {
    setProjectWithHistory((prev) => ({
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
    setProjectWithHistory((prev) => ({
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

    setProjectWithHistory((prev) => ({
      ...prev,
      furniture: [...prev.furniture, newFurniture],
    }));

    // Auto select newly placed item & clear active placement cursor
    setSelectedFurnitureId(newFurniture.id);
    setActivePlacingCatalogId(null);
  };

  // Update global project/structural/floor settings
  const handleUpdateProjectSettings = (updatedProject: HomeProject) => {
    setProjectWithHistory(updatedProject);
  };

  // Clear workspace
  const handleClearWorkspace = () => {
    if (window.confirm('Are you sure you want to clear your entire room layout and furniture?')) {
      const halfW = project.dimensions.width / 2;
      const halfL = project.dimensions.length / 2;
      setProjectWithHistory({
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
      <header className="h-16 shrink-0 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 z-10" id="top-dashboard">
        {/* Branding Title with Inline Editor */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') {
                  setTempName(project.name);
                  setIsEditingName(false);
                }
              }}
              className="bg-slate-900 text-slate-100 border border-indigo-500 px-2 py-0.5 rounded text-xs sm:text-sm font-bold font-mono uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[150px] sm:max-w-[240px]"
              autoFocus
            />
          ) : (
            <div 
              onClick={() => setIsEditingName(true)}
              className="flex items-center gap-1.5 cursor-pointer group"
              title="Click to edit project name"
            >
              <h1 className="text-xs sm:text-sm font-bold tracking-wider text-slate-100 font-mono uppercase truncate max-w-[120px] sm:max-w-[200px] group-hover:text-indigo-400 transition-colors">
                {project.name}
              </h1>
              <Edit2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 hidden sm:inline-block" />
            </div>
          )}
          <span className="hidden md:inline text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-mono shrink-0">
            {project.dimensions.width}m × {project.dimensions.length}m Layout
          </span>
        </div>

        {/* View mode toggle controls (Bento rounded switches) */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl mx-1 sm:mx-0 shrink-0">
          <button
            onClick={() => { setViewMode('2d'); handleSelectFurniture(null); }}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none ${
              viewMode === '2d'
                ? 'bg-slate-800 border border-slate-700/50 text-indigo-400 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">2D Blueprint</span>
            <span className="sm:hidden">2D</span>
          </button>
          <button
            onClick={() => { setViewMode('3d'); }}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none ${
              viewMode === '3d'
                ? 'bg-slate-800 border border-slate-700/50 text-indigo-400 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">3D Studio</span>
            <span className="sm:hidden">3D</span>
          </button>
          <button
            onClick={() => { setViewMode('walkthrough'); handleSelectFurniture(null); }}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none ${
              viewMode === 'walkthrough'
                ? 'bg-slate-800 border border-slate-700/50 text-indigo-400 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">First Walk</span>
            <span className="sm:hidden">Walk</span>
          </button>
        </div>

        {/* Action icons (Grid Snapping, Import, Export, Clear) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            title={`Undo change (${undoStack.length} states in history)`}
            className={`p-1.5 sm:p-2 rounded-xl border transition cursor-pointer ${
              undoStack.length === 0
                ? 'opacity-35 cursor-not-allowed border-slate-800/40 text-slate-600 bg-slate-950/10'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Redo Button */}
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title={`Redo change (${redoStack.length} states in stack)`}
            className={`p-1.5 sm:p-2 rounded-xl border transition cursor-pointer ${
              redoStack.length === 0
                ? 'opacity-35 cursor-not-allowed border-slate-800/40 text-slate-600 bg-slate-950/10'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700'
            }`}
          >
            <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <div className="h-6 w-px bg-slate-800 mx-0.5" />

          {/* Auto-Save Toggle Pill */}
          <button
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
            title={autoSaveEnabled ? "Auto-Save is Active (persisting to browser storage)" : "Auto-Save is Inactive"}
            className={`px-2 py-1 sm:py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer text-[10px] font-bold font-mono uppercase tracking-wider ${
              autoSaveEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
          >
            <div className={`h-1.5 w-1.5 rounded-full ${autoSaveEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>{autoSaveEnabled ? "Auto-Save" : "Manual"}</span>
          </button>

          <div className="h-6 w-px bg-slate-800 mx-0.5" />

          {/* Grid snapping toggler */}
          <button
            onClick={() => setGridSnapping(!gridSnapping)}
            title="Toggle Grid Alignment Snapping (0.25m Steps)"
            className={`p-1.5 sm:p-2 rounded-xl border transition cursor-pointer ${
              gridSnapping
                ? 'bg-indigo-600/10 border-indigo-500/60 text-indigo-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Import JSON input - Hidden on small mobile screens to save space */}
          <label
            title="Import Saved Layout File"
            className="hidden sm:flex p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 transition cursor-pointer items-center justify-center"
          >
            <FolderOpen className="w-4 h-4" />
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          {/* Export JSON Button - Hidden on small mobile screens */}
          <button
            onClick={handleExportJSON}
            title="Export Layout as Blueprint File"
            className="hidden sm:inline-block p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          <div className="hidden sm:block h-6 w-px bg-slate-800 mx-1" />

          {/* Clear Button */}
          <button
            onClick={handleClearWorkspace}
            title="Reset scene layout (Shortcut: Alt + R)"
            className="p-1.5 sm:p-2 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-950 hover:border-rose-700 text-rose-300 hover:text-rose-200 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Summary Report Button */}
          <button
            onClick={() => setShowSummaryReport(true)}
            title="Generate Comprehensive Construction Summary Report"
            className="p-1.5 sm:px-3 sm:py-2 rounded-xl bg-indigo-955/40 hover:bg-indigo-950/70 border border-indigo-900/60 text-indigo-300 hover:text-indigo-200 transition cursor-pointer flex items-center gap-1.5 text-xs font-black select-none font-mono"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Report</span>
          </button>

          {/* Mobile Install Button */}
          <button
            onClick={() => setShowInstallModal(true)}
            title="Download / Install this app on your mobile device (Shortcut: Standalone App)"
            className="p-1.5 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-slate-100 transition cursor-pointer flex items-center gap-1.5 text-xs font-black select-none font-mono shadow-md border border-indigo-500/30"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
            <span className="hidden md:inline">Download App</span>
          </button>

          {/* Help Button */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {(isSidebarOpen || isInspectorOpen) && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden animate-fadeIn"
            onClick={() => {
              setIsSidebarOpen(false);
              setIsInspectorOpen(false);
            }}
          />
        )}

        {/* Left Drawer Side Panel (Collapsible on Mobile, Persistent on Desktop) */}
        <div
          className={`fixed md:relative inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-out md:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar
            onPlaceCatalogItem={(catalogId) => {
              handlePlaceCatalogItemSelect(catalogId);
              if (catalogId) {
                setIsSidebarOpen(false); // Auto-close drawer on selection so they can place it easily
              }
            }}
            activePlacingCatalogId={activePlacingCatalogId}
            onLoadTemplate={(tpl) => {
              handleLoadTemplate(tpl);
              setIsSidebarOpen(false);
            }}
            currentProject={project}
            activeSubTab={activeSubTab}
            setActiveSubTab={setActiveSubTab}
            onCloseMobile={() => setIsSidebarOpen(false)}
            onUpdateProjectSettings={handleUpdateProjectSettings}
          >
            {/* Construction & Footprint Guide inside Side Panel Drawer */}
            <ConstructionGuide
              project={project}
              onUpdateProjectSettings={handleUpdateProjectSettings}
              onLoadTemplate={(tpl) => {
                handleLoadTemplate(tpl);
                setIsSidebarOpen(false);
              }}
              onNavigateToCatalog={() => setActiveSubTab('catalog')}
            />
          </Sidebar>
        </div>

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
            onDragEnd={handleDragEnd}
          />

          {/* Floating Mobile Panel Toggle Pills */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-3 md:hidden pointer-events-auto">
            <button
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
                setIsInspectorOpen(false);
              }}
              className={`px-4 py-2.5 rounded-full border font-bold text-xs flex items-center gap-2 shadow-xl transition-all ${
                isSidebarOpen
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-950/90 backdrop-blur-sm border-slate-800 text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Catalog / Build</span>
            </button>

            <button
              onClick={() => {
                setIsInspectorOpen(!isInspectorOpen);
                setIsSidebarOpen(false);
              }}
              className={`px-4 py-2.5 rounded-full border font-bold text-xs flex items-center gap-2 shadow-xl transition-all ${
                isInspectorOpen
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-950/90 backdrop-blur-sm border-slate-800 text-slate-200'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeSelectedFurniture ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span>{activeSelectedFurniture ? 'Inspect Item' : 'Room Settings'}</span>
            </button>
          </div>

          {/* Mobile Walkthrough Touch Controller */}
          {viewMode === 'walkthrough' && (
            <div className="absolute bottom-20 left-4 z-20 flex flex-col gap-1 md:hidden pointer-events-auto bg-slate-950/90 backdrop-blur-sm p-3 rounded-2xl border border-slate-800 max-w-[150px] shadow-2xl">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 text-center font-bold">Touch D-Pad</span>
              <div className="grid grid-cols-3 gap-1">
                <div />
                <button
                  onTouchStart={() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' })); }}
                  onTouchEnd={() => { window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' })); }}
                  onMouseDown={() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' })); }}
                  onMouseUp={() => { window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' })); }}
                  className="w-10 h-10 bg-slate-900 border border-slate-800 active:bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-slate-200 select-none cursor-pointer"
                >
                  ▲
                </button>
                <div />

                <button
                  onTouchStart={() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })); }}
                  onTouchEnd={() => { window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' })); }}
                  onMouseDown={() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })); }}
                  onMouseUp={() => { window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft' })); }}
                  className="w-10 h-10 bg-slate-900 border border-slate-800 active:bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-slate-200 select-none cursor-pointer"
                >
                  ◀
                </button>
                <button
                  onTouchStart={() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' })); }}
                  onTouchEnd={() => { window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' })); }}
                  onMouseDown={() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' })); }}
                  onMouseUp={() => { window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowDown' })); }}
                  className="w-10 h-10 bg-slate-900 border border-slate-800 active:bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-slate-200 select-none cursor-pointer"
                >
                  ▼
                </button>
                <button
                  onTouchStart={() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); }}
                  onTouchEnd={() => { window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' })); }}
                  onMouseDown={() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })); }}
                  onMouseUp={() => { window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' })); }}
                  className="w-10 h-10 bg-slate-900 border border-slate-800 active:bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-slate-200 select-none cursor-pointer"
                >
                  ▶
                </button>
              </div>
            </div>
          )}

          {/* Floating Mobile Quick Action Toolbar for Selected Furniture */}
          {activeSelectedFurniture && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-950/95 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-2xl shadow-2xl z-20 flex items-center gap-2.5 md:hidden pointer-events-auto">
              <div className="flex flex-col border-r border-slate-800 pr-2 max-w-[80px]">
                <span className="text-[8px] text-indigo-400 font-mono uppercase truncate font-semibold">Active</span>
                <span className="text-[10px] font-bold text-slate-200 truncate">{activeSelectedFurniture.name}</span>
              </div>
              
              {/* Quick Rotation */}
              <button
                onClick={() => handleUpdateFurnitureRotation(activeSelectedFurniture.id, activeSelectedFurniture.rotation + Math.PI / 4)}
                title="Rotate 45°"
                className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-300 active:text-indigo-400 cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {/* Elevation Up */}
              <button
                onClick={() => {
                  handleUpdateFurniture({
                    ...activeSelectedFurniture,
                    position: {
                      ...activeSelectedFurniture.position,
                      y: Math.min(3, activeSelectedFurniture.position.y + 0.1)
                    }
                  });
                }}
                title="Elevate Up (+0.1m)"
                className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center w-7 h-7 cursor-pointer"
              >
                ▲
              </button>

              {/* Elevation Down */}
              <button
                onClick={() => {
                  handleUpdateFurniture({
                    ...activeSelectedFurniture,
                    position: {
                      ...activeSelectedFurniture.position,
                      y: Math.max(0, activeSelectedFurniture.position.y - 0.1)
                    }
                  });
                }}
                title="Elevate Down (-0.1m)"
                className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center w-7 h-7 cursor-pointer"
              >
                ▼
              </button>

              {/* Duplicate */}
              <button
                onClick={() => handleDuplicateFurniture(activeSelectedFurniture)}
                title="Duplicate Furniture"
                className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-indigo-400 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              {/* Trash */}
              <button
                onClick={() => handleDeleteFurniture(activeSelectedFurniture.id)}
                title="Delete Furniture"
                className="p-1.5 bg-rose-950/40 hover:bg-rose-950/60 rounded-xl border border-rose-900/40 text-rose-300 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Floating Instruction Manual Banner */}
          {showHelp && (
            <div className="absolute top-20 left-4 right-4 sm:left-6 sm:right-auto bg-slate-950/95 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-2xl z-20 max-w-md animate-fadeIn" id="instructions-manual">
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
                  <span>Try the <span className="font-semibold text-indigo-300">Build</span> tab. Change house dimensions to see real-time square footage, customize materials, foundations, wall sidings, and roof structures instantly!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold shrink-0">6.</span>
                  <span>Use <span className="font-semibold text-white">First-Person Walk</span> to step inside. Press W, A, S, D or Arrows to navigate the rooms at eye-level!</span>
                </li>
              </ul>
            </div>
          )}
        </main>

        {/* Right Properties Inspector Drawer (Collapsible on Mobile, Persistent on Desktop) */}
        <div
          className={`fixed md:relative inset-y-0 right-0 z-30 transform transition-transform duration-300 ease-out md:translate-x-0 ${
            isInspectorOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <Inspector
            selectedFurniture={activeSelectedFurniture}
            project={project}
            onUpdateFurniture={handleUpdateFurniture}
            onDeleteFurniture={(id) => {
              handleDeleteFurniture(id);
              setIsInspectorOpen(false);
            }}
            onDuplicateFurniture={handleDuplicateFurniture}
            onUpdateProjectSettings={handleUpdateProjectSettings}
            onCloseMobile={() => setIsInspectorOpen(false)}
          />
        </div>
      </div>

      {/* Footer Status Indicators bar */}
      <footer className="h-8 shrink-0 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-4 sm:px-6 text-[10px] font-mono text-slate-500 z-10" id="footer-rail">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline">WebGL Context: Ready</span>
            <span className="sm:hidden">WebGL</span>
          </span>
          <span>Snap: {gridSnapping ? '0.25m' : 'Off'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">Active View: {viewMode.toUpperCase()}</span>
          <span>{viewMode === 'walkthrough' ? 'Touch D-Pad' : 'Press R to Rotate'}</span>
        </div>
      </footer>

      {showSummaryReport && (
        <SummaryReportModal
          project={project}
          onClose={() => setShowSummaryReport(false)}
        />
      )}

      <InstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        deferredPrompt={deferredPrompt}
        onTriggerInstall={handleTriggerInstall}
      />
    </div>
  );
}
