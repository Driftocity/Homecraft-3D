/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FURNITURE_CATALOG } from '../data/furnitureCatalog';
import { CatalogItem, HomeProject, Wall } from '../types';
import {
  Sofa,
  Bed,
  Utensils,
  Bath,
  Flower,
  Flame,
  LayoutGrid,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info,
  Hammer
} from 'lucide-react';

interface SidebarProps {
  onPlaceCatalogItem: (catalogId: string | null) => void;
  activePlacingCatalogId: string | null;
  onLoadTemplate: (project: HomeProject) => void;
  currentProject: HomeProject;
  activeSubTab: 'catalog' | 'templates' | 'ai';
  setActiveSubTab: (tab: 'catalog' | 'templates' | 'ai') => void;
  children?: React.ReactNode;
}

const CATEGORIES = [
  { id: 'living', name: 'Living Room', icon: Sofa },
  { id: 'bedroom', name: 'Bedroom', icon: Bed },
  { id: 'kitchen', name: 'Kitchen & Dining', icon: Utensils },
  { id: 'bathroom', name: 'Bathroom', icon: Bath },
  { id: 'decor', name: 'Decor & Plants', icon: Flower },
  { id: 'fixtures', name: 'Fixtures (Doors/Windows)', icon: Hammer },
];

export default function Sidebar({
  onPlaceCatalogItem,
  activePlacingCatalogId,
  onLoadTemplate,
  currentProject,
  activeSubTab,
  setActiveSubTab,
  children
}: SidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('living');

  // Filter catalog items
  const filteredCatalog = FURNITURE_CATALOG.filter(item => item.category === selectedCategory);

  // Load a quick manual layout template
  const loadStudioTemplate = () => {
    const w = 10;
    const l = 10;
    const halfW = w / 2;
    const halfL = l / 2;

    const baseWalls: Wall[] = [
      { id: 'w1', p1: { x: -halfW, y: -halfL }, p2: { x: halfW, y: -halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
      { id: 'w2', p1: { x: halfW, y: -halfL }, p2: { x: halfW, y: halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
      { id: 'w3', p1: { x: halfW, y: halfL }, p2: { x: -halfW, y: halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
      { id: 'w4', p1: { x: -halfW, y: halfL }, p2: { x: -halfW, y: -halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
      // Dividing bathroom wall
      { id: 'w5', p1: { x: -halfW, y: 1 }, p2: { x: -1, y: 1 }, height: 2.8, thickness: 0.12, color: '#e2e8f0' },
      { id: 'w6', p1: { x: -1, y: 1 }, p2: { x: -1, y: halfL }, height: 2.8, thickness: 0.12, color: '#e2e8f0' },
    ];

    const template: HomeProject = {
      id: 'template-studio-' + Date.now(),
      name: 'Modern Cozy Studio Template',
      floorMaterial: 'hardwood',
      floorColor: '#eab308',
      dimensions: { width: w, length: l },
      walls: baseWalls,
      furniture: [
        {
          id: 't-bed',
          catalogId: 'bed_king',
          name: 'King-Size Bed',
          type: 'bed',
          position: { x: 3, y: 0, z: -3 },
          rotation: Math.PI,
          scale: { x: 2, y: 0.9, z: 2.1 },
          color: '#3b82f6',
          materialType: 'fabric',
          category: 'bedroom'
        },
        {
          id: 't-stand',
          catalogId: 'nightstand_wood',
          name: 'Bedside Nightstand',
          type: 'nightstand',
          position: { x: 1.3, y: 0, z: -4 },
          rotation: Math.PI,
          scale: { x: 0.5, y: 0.55, z: 0.45 },
          color: '#b45309',
          materialType: 'wood',
          category: 'bedroom'
        },
        {
          id: 't-sofa',
          catalogId: 'sofa_modern',
          name: 'Modern 3-Seater Sofa',
          type: 'sofa',
          position: { x: 1, y: 0, z: 2 },
          rotation: 0,
          scale: { x: 2.2, y: 0.8, z: 0.9 },
          color: '#4b5563',
          materialType: 'fabric',
          category: 'living'
        },
        {
          id: 't-plant',
          catalogId: 'plant_house',
          name: 'Potted Monstera Plant',
          type: 'plant',
          position: { x: -4, y: 0, z: -4 },
          rotation: 0,
          scale: { x: 0.6, y: 1, z: 0.6 },
          color: '#15803d',
          materialType: 'plastic',
          category: 'decor'
        }
      ]
    };

    onLoadTemplate(template);
  };

  const loadEmptyCanvas = (width: number, length: number) => {
    const halfW = width / 2;
    const halfL = length / 2;

    const baseWalls: Wall[] = [
      { id: 'w1', p1: { x: -halfW, y: -halfL }, p2: { x: halfW, y: -halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
      { id: 'w2', p1: { x: halfW, y: -halfL }, p2: { x: halfW, y: halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
      { id: 'w3', p1: { x: halfW, y: halfL }, p2: { x: -halfW, y: halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
      { id: 'w4', p1: { x: -halfW, y: halfL }, p2: { x: -halfW, y: -halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
    ];

    const template: HomeProject = {
      id: 'template-empty-' + Date.now(),
      name: `Empty ${width}x${length} Floor Plan`,
      floorMaterial: 'hardwood',
      floorColor: '#d97706',
      dimensions: { width, length },
      walls: baseWalls,
      furniture: []
    };

    onLoadTemplate(template);
  };

  return (
    <div className="w-80 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col h-full" id="builder-sidebar">
      {/* App Branding & Primary Tabs */}
      <div className="p-4 border-b border-slate-800 flex flex-col gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-50 uppercase tracking-wider">3D Home Architect</h1>
            <p className="text-[10px] text-slate-400 font-medium">Bento-Style Design Studio</p>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <div className="grid grid-cols-3 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => { setActiveSubTab('catalog'); onPlaceCatalogItem(null); }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${
              activeSubTab === 'catalog'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Furniture
          </button>
          <button
            onClick={() => { setActiveSubTab('ai'); onPlaceCatalogItem(null); }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer select-none ${
              activeSubTab === 'ai'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>AI Plan</span>
          </button>
          <button
            onClick={() => { setActiveSubTab('templates'); onPlaceCatalogItem(null); }}
            className={`py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer select-none ${
              activeSubTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Presets
          </button>
        </div>
      </div>

      {/* Dynamic Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeSubTab === 'catalog' && (
          <div className="flex flex-col gap-4">
            {/* Category selection accordion */}
            <div className="grid grid-cols-3 gap-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer select-none ${
                      selectedCategory === cat.id
                        ? 'bg-slate-800 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/5'
                        : 'bg-slate-900 hover:bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] font-medium leading-tight truncate w-full">{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Hint message for placing items */}
            <div className="bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl flex gap-2">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 leading-normal">
                Click any asset below to activate <span className="text-indigo-300 font-semibold">Placement Mode</span>, then click on the grid floor to place it!
              </p>
            </div>

            {/* Catalog Items Grid */}
            <div className="flex flex-col gap-2.5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Available Items ({filteredCatalog.length})
              </h3>

              <div className="flex flex-col gap-2">
                {filteredCatalog.map((item) => {
                  const isPlacing = activePlacingCatalogId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onPlaceCatalogItem(isPlacing ? null : item.id)}
                      className={`text-left border rounded-xl p-3 flex flex-col gap-1 transition cursor-pointer select-none relative ${
                        isPlacing
                          ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                          : 'bg-slate-900 hover:bg-slate-900/80 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-100">{item.name}</span>
                        <span className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                          {item.defaultScale.x}m × {item.defaultScale.z}m
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">{item.description}</p>
                      
                      {isPlacing && (
                        <div className="absolute top-2 right-2 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'ai' && children}

        {activeSubTab === 'templates' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-slate-200">Load House Canvas Presets</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Instantly reset or load a structured starting canvas template. Warning: This will overwrite your current active floor design.
            </p>

            <div className="flex flex-col gap-3">
              {/* Studio Loft Blueprint */}
              <button
                onClick={loadStudioTemplate}
                className="text-left bg-slate-900 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700/60 rounded-xl p-3.5 transition flex flex-col gap-1.5 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-100">Cozy 10x10 Studio Apartment</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  A fully designed studio setup including a partitioned bathroom, king bed, sofa, coffee table, and greenery.
                </p>
              </button>

              {/* Empty 12x12 Grid */}
              <button
                onClick={() => loadEmptyCanvas(12, 12)}
                className="text-left bg-slate-900 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700/60 rounded-xl p-3.5 transition flex flex-col gap-1.5 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-100">Empty 12m × 12m Canvas</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  An empty rectangular outer boundary wall, perfect for starting your drawing and furniture placement from scratch.
                </p>
              </button>

              {/* Small 8x8 Grid */}
              <button
                onClick={() => loadEmptyCanvas(8, 8)}
                className="text-left bg-slate-900 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700/60 rounded-xl p-3.5 transition flex flex-col gap-1.5 cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-100">Empty 8m × 8m Canvas</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  A cozy compact canvas template, ideal for simple bedroom, office, or dining room design prototypes.
                </p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
