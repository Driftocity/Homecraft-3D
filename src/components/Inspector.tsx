/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Furniture, FloorMaterial, FurnitureMaterial, HomeProject } from '../types';
import { getCatalogItemById } from '../data/furnitureCatalog';
import {
  Trash2,
  Copy,
  Sliders,
  Maximize2,
  Palette,
  Home,
  ChevronRight,
  Info,
  Layers,
  RotateCw
} from 'lucide-react';

interface InspectorProps {
  selectedFurniture: Furniture | null;
  project: HomeProject;
  onUpdateFurniture: (updated: Furniture) => void;
  onDeleteFurniture: (id: string) => void;
  onDuplicateFurniture: (item: Furniture) => void;
  onUpdateFloorSettings: (settings: { floorMaterial: FloorMaterial; floorColor: string; name: string }) => void;
  onCloseMobile?: () => void;
}

const COLOR_PRESETS = [
  { name: 'Scandinavian Oak', hex: '#eab308' },
  { name: 'Warm Walnut', hex: '#78350f' },
  { name: 'Navy Denim', hex: '#1e3a8a' },
  { name: 'Sage Green', hex: '#15803d' },
  { name: 'Charcoal Fabric', hex: '#374151' },
  { name: 'Porcelain White', hex: '#f9fafb' },
  { name: 'Stainless Steel', hex: '#94a3b8' },
  { name: 'Rose Petal', hex: '#f472b6' }
];

const FLOOR_PRESETS = [
  { name: 'Oak Wood', hex: '#d97706' },
  { name: 'Light Birch', hex: '#fcd34d' },
  { name: 'White Marble', hex: '#f1f5f9' },
  { name: 'Slate Gray', hex: '#475569' },
  { name: 'Teal Carpet', hex: '#115e59' },
];

export default function Inspector({
  selectedFurniture,
  project,
  onUpdateFurniture,
  onDeleteFurniture,
  onDuplicateFurniture,
  onUpdateFloorSettings,
  onCloseMobile
}: InspectorProps) {

  // Handle individual updates on selected furniture
  const handleChangeField = (field: string, value: any) => {
    if (!selectedFurniture) return;

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      onUpdateFurniture({
        ...selectedFurniture,
        [parent]: {
          ...(selectedFurniture[parent as keyof Furniture] as any),
          [child]: value
        }
      });
    } else {
      onUpdateFurniture({
        ...selectedFurniture,
        [field]: value
      });
    }
  };

  const handleRotateDeg = (deg: number) => {
    // degrees to radians
    handleChangeField('rotation', (deg * Math.PI) / 180);
  };

  const rotationDeg = selectedFurniture ? Math.round((selectedFurniture.rotation * 180) / Math.PI) % 360 : 0;

  return (
    <div className="w-80 shrink-0 bg-slate-950 border-l border-slate-800 flex flex-col h-full" id="builder-inspector">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-50 uppercase tracking-wider">Blueprint Inspector</h2>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            type="button"
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl cursor-pointer transition select-none"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dynamic Inspector Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-5">
        {selectedFurniture ? (
          /* --- FURNITURE DETAILED INSPECTOR --- */
          <div className="flex flex-col gap-5 animate-fadeIn">
            {/* Header / Info */}
            <div className="flex flex-col gap-1 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[9px] text-indigo-400 font-mono uppercase tracking-wider font-semibold">
                Selected Asset
              </span>
              <h3 className="text-xs font-bold text-white truncate">{selectedFurniture.name}</h3>
              <p className="text-[10px] text-slate-400 leading-normal mt-1">
                {getCatalogItemById(selectedFurniture.catalogId)?.description || 'Custom placed asset.'}
              </p>
            </div>

            {/* Transform / Position Sliders */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dimensions & Placement</span>
              </div>

              <div className="flex flex-col gap-3.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                {/* Scale Width X */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Width (X-axis)</span>
                    <span className="font-mono text-slate-200 font-semibold">{selectedFurniture.scale.x.toFixed(2)}m</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="6.0"
                    step="0.05"
                    value={selectedFurniture.scale.x}
                    onChange={(e) => handleChangeField('scale.x', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Scale Height Y */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Height (Y-axis)</span>
                    <span className="font-mono text-slate-200 font-semibold">{selectedFurniture.scale.y.toFixed(2)}m</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="4.0"
                    step="0.05"
                    value={selectedFurniture.scale.y}
                    onChange={(e) => handleChangeField('scale.y', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Scale Depth Z */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Depth (Z-axis)</span>
                    <span className="font-mono text-slate-200 font-semibold">{selectedFurniture.scale.z.toFixed(2)}m</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="6.0"
                    step="0.05"
                    value={selectedFurniture.scale.z}
                    onChange={(e) => handleChangeField('scale.z', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="border-t border-slate-800/80 my-1" />

                {/* Rotation slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <RotateCw className="w-3 h-3 text-slate-400" />
                      <span>Rotation Y</span>
                    </span>
                    <span className="font-mono text-slate-200 font-semibold">{rotationDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    value={rotationDeg}
                    onChange={(e) => handleRotateDeg(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Height off floor Y */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Elevation (off floor)</span>
                    <span className="font-mono text-slate-200 font-semibold">{selectedFurniture.position.y.toFixed(2)}m</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="3.0"
                    step="0.05"
                    value={selectedFurniture.position.y}
                    onChange={(e) => handleChangeField('position.y', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Aesthetics / Color & Material presets */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>Materials & Palette</span>
              </div>

              <div className="flex flex-col gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                {/* Material type selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Texture Shader</label>
                  <select
                    value={selectedFurniture.materialType}
                    onChange={(e) => handleChangeField('materialType', e.target.value as FurnitureMaterial)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="wood">🪓 Finished Wood</option>
                    <option value="fabric">🧵 Soft Fabric</option>
                    <option value="metal">🪙 Polished Chrome Metal</option>
                    <option value="plastic">🏺 Smooth Plastic</option>
                    <option value="glass">💎 Clear Glazed Glass</option>
                  </select>
                </div>

                {/* Presets color swatches */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Accent Swatch</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {COLOR_PRESETS.map((col) => (
                      <button
                        key={col.hex}
                        onClick={() => handleChangeField('color', col.hex)}
                        title={col.name}
                        style={{ backgroundColor: col.hex }}
                        className={`w-full h-7 rounded-lg border cursor-pointer hover:scale-105 active:scale-95 transition ${
                          selectedFurniture.color === col.hex ? 'border-white ring-1 ring-indigo-500 scale-105' : 'border-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Color input */}
                <div className="flex items-center justify-between gap-3 mt-1.5 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium">Custom Color Code</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400 uppercase">{selectedFurniture.color}</span>
                    <input
                      type="color"
                      value={selectedFurniture.color}
                      onChange={(e) => handleChangeField('color', e.target.value)}
                      className="w-7 h-7 rounded-md border border-slate-700 bg-transparent cursor-pointer p-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Duplicate / Trash */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                onClick={() => onDuplicateFurniture(selectedFurniture)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 active:bg-slate-800 text-slate-200 font-semibold text-xs px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer select-none"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Duplicate</span>
              </button>
              <button
                onClick={() => onDeleteFurniture(selectedFurniture.id)}
                className="bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 hover:border-rose-700 text-rose-300 hover:text-rose-200 font-semibold text-xs px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer select-none"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ) : (
          /* --- GLOBAL HOUSE / ROOM CONFIGURATION --- */
          <div className="flex flex-col gap-5 animate-fadeIn">
            {/* Global Info */}
            <div className="flex flex-col gap-1.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-wider font-semibold flex items-center gap-1">
                <Home className="w-3 h-3" />
                <span>Blueprint Overview</span>
              </span>
              <input
                type="text"
                value={project.name}
                onChange={(e) => onUpdateFloorSettings({ ...project, name: e.target.value, floorColor: project.floorColor, floorMaterial: project.floorMaterial })}
                className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-indigo-500 text-xs font-bold text-white focus:outline-none py-0.5 transition"
                placeholder="My Blueprint"
              />
              {/* Dimensions */}
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-mono">
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-bold">
                  {project.dimensions.width}m × {project.dimensions.length}m
                </span>
                <span>Room Canvas Size</span>
              </div>
            </div>

            {/* Total Metrics Card (Bento Style) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/40 flex flex-col gap-1 text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Estimated Area</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5">
                  {project.dimensions.width * project.dimensions.length}m²
                </span>
              </div>
              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/40 flex flex-col gap-1 text-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Placed Assets</span>
                <span className="text-lg font-bold text-indigo-400 font-mono mt-0.5">
                  {project.furniture.length}
                </span>
              </div>
            </div>

            {/* Floor Texture Customization */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Palette className="w-3.5 h-3.5 text-emerald-400" />
                <span>Floor Finish Options</span>
              </div>

              <div className="flex flex-col gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                {/* Material Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Material Base</label>
                  <select
                    value={project.floorMaterial}
                    onChange={(e) => onUpdateFloorSettings({
                      ...project,
                      floorMaterial: e.target.value as FloorMaterial,
                      floorColor: project.floorColor,
                      name: project.name
                    })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="hardwood">🪵 Natural Wood Plank</option>
                    <option value="marble">🏛️ Polished Veined Marble</option>
                    <option value="tile">🔲 Grout Grid Ceramic Tile</option>
                    <option value="carpet">🧶 Soft Weave Carpet</option>
                    <option value="concrete">🏭 Industrial Mottled Concrete</option>
                  </select>
                </div>

                {/* Floor Color presets */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Finish Color Tone</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {FLOOR_PRESETS.map((fcol) => (
                      <button
                        key={fcol.hex}
                        onClick={() => onUpdateFloorSettings({
                          ...project,
                          floorColor: fcol.hex,
                          floorMaterial: project.floorMaterial,
                          name: project.name
                        })}
                        title={fcol.name}
                        style={{ backgroundColor: fcol.hex }}
                        className={`w-full h-6 rounded-md border cursor-pointer hover:scale-105 active:scale-95 transition ${
                          project.floorColor === fcol.hex ? 'border-white ring-1 ring-indigo-500 scale-105' : 'border-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Floor color */}
                <div className="flex items-center justify-between gap-3 mt-1.5 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-medium">Custom Color Hex</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400 uppercase">{project.floorColor}</span>
                    <input
                      type="color"
                      value={project.floorColor}
                      onChange={(e) => onUpdateFloorSettings({
                        ...project,
                        floorColor: e.target.value,
                        floorMaterial: project.floorMaterial,
                        name: project.name
                      })}
                      className="w-7 h-7 rounded-md border border-slate-700 bg-transparent cursor-pointer p-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Helper Tips */}
            <div className="bg-slate-900/40 border border-slate-800/40 p-3.5 rounded-xl flex gap-2">
              <Info className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-300">Quick Tips</span>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Click any placed item in the viewport to open its custom properties panel.
                </p>
                <p className="text-[10px] text-slate-400 leading-normal mt-1.5">
                  Hold <span className="font-semibold text-indigo-300">R</span> on your keyboard to instantly rotate any selected piece of furniture in 45-degree increments!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
