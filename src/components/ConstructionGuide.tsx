/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Hammer,
  Layers,
  Home,
  Palette,
  CheckCircle2,
  Trash2,
  Info,
  Ruler,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { HomeProject, FloorMaterial, FoundationType, SidingType, RoofType, Wall } from '../types';

export interface MaterialPreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  sidingType: SidingType;
  sidingColor: string;
  floorMaterial: FloorMaterial;
  floorColor: string;
  roofType: RoofType;
  roofColor: string;
  foundationType: FoundationType;
  foundationColor: string;
  wallColor: string;
  colors: string[];
}

export const MATERIAL_PRESETS: MaterialPreset[] = [
  {
    id: 'luxury-modern',
    name: 'Luxury Modern',
    description: 'Sleek white stucco, royal marble floors, and flat slate gray shingles.',
    emoji: '✨',
    sidingType: 'stucco',
    sidingColor: '#f8fafc',
    floorMaterial: 'marble',
    floorColor: '#f1f5f9',
    roofType: 'flat',
    roofColor: '#1e293b',
    foundationType: 'slab',
    foundationColor: '#64748b',
    wallColor: '#f8fafc',
    colors: ['#f8fafc', '#f1f5f9', '#1e293b', '#64748b']
  },
  {
    id: 'rustic-industrial',
    name: 'Rustic Industrial',
    description: 'Classic red brick siding, raw concrete flooring, and metal roof.',
    emoji: '🧱',
    sidingType: 'brick',
    sidingColor: '#991b1b',
    floorMaterial: 'concrete',
    floorColor: '#64748b',
    roofType: 'gabled',
    roofColor: '#334155',
    foundationType: 'basement',
    foundationColor: '#475569',
    wallColor: '#3f3f46',
    colors: ['#991b1b', '#64748b', '#334155', '#3f3f46']
  },
  {
    id: 'scandinavian',
    name: 'Nordic Minimalist',
    description: 'Light ash wood planks, bleached pine hardwood, and crisp white trim.',
    emoji: '🌲',
    sidingType: 'wood',
    sidingColor: '#f5f5f4',
    floorMaterial: 'hardwood',
    floorColor: '#e7e5e4',
    roofType: 'gabled',
    roofColor: '#1e293b',
    foundationType: 'slab',
    foundationColor: '#78716c',
    wallColor: '#fafaf9',
    colors: ['#f5f5f4', '#e7e5e4', '#1e293b', '#fafaf9']
  },
  {
    id: 'coastal-cottage',
    name: 'Coastal Cottage',
    description: 'Soft sky blue lap siding, rich honey oak, and sandy shingles.',
    emoji: '⚓',
    sidingType: 'vinyl',
    sidingColor: '#e0f2fe',
    floorMaterial: 'hardwood',
    floorColor: '#d97706',
    roofType: 'gabled',
    roofColor: '#475569',
    foundationType: 'crawlspace',
    foundationColor: '#cbd5e1',
    wallColor: '#f0f9ff',
    colors: ['#e0f2fe', '#d97706', '#475569', '#f0f9ff']
  },
  {
    id: 'desert-adobe',
    name: 'Desert Adobe',
    description: 'Warm terracotta stucco, clay floor tiles, and wood log style trim.',
    emoji: '🌵',
    sidingType: 'stucco',
    sidingColor: '#c2410c',
    floorMaterial: 'tile',
    floorColor: '#ea580c',
    roofType: 'flat',
    roofColor: '#78350f',
    foundationType: 'slab',
    foundationColor: '#a21caf',
    wallColor: '#fed7aa',
    colors: ['#c2410c', '#ea580c', '#78350f', '#fed7aa']
  },
  {
    id: 'mountain-cabin',
    name: 'Rustic Cabin',
    description: 'Rich log wood siding, deep walnut flooring, and forest blue roofing.',
    emoji: '🪵',
    sidingType: 'wood',
    sidingColor: '#78350f',
    floorMaterial: 'hardwood',
    floorColor: '#451a03',
    roofType: 'gabled',
    roofColor: '#164e63',
    foundationType: 'crawlspace',
    foundationColor: '#451a03',
    wallColor: '#fef3c7',
    colors: ['#78350f', '#451a03', '#164e63', '#fef3c7']
  }
];

interface ConstructionGuideProps {
  project: HomeProject;
  onUpdateProjectSettings: (project: HomeProject) => void;
  onLoadTemplate: (project: HomeProject) => void;
  onNavigateToCatalog: () => void;
}

export default function ConstructionGuide({
  project,
  onUpdateProjectSettings,
  onLoadTemplate,
  onNavigateToCatalog
}: ConstructionGuideProps) {
  const width = project.dimensions.width;
  const length = project.dimensions.length;

  // Real-time calculations
  const areaSqm = width * length;
  const areaSqft = Math.round(areaSqm * 10.7639);
  const perimeterM = 2 * (width + length);
  const perimeterFt = Math.round(perimeterM * 3.28084);

  // Home Footprint Classifications
  const homeCategory = React.useMemo(() => {
    if (areaSqft < 500) {
      return { label: 'Tiny House / Cabin Plan', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };
    } else if (areaSqft < 1200) {
      return { label: 'Cozy Starter Home Plan', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
    } else if (areaSqft < 2200) {
      return { label: 'Classic Suburban Residence', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' };
    } else {
      return { label: 'Spacious Premium Villa Plan', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' };
    }
  }, [areaSqft]);

  // Handle resizing of dimensions and auto-snapping outer perimeter walls
  const handleDimensionChange = (newWidth: number, newLength: number) => {
    const w = Math.round(newWidth * 10) / 10;
    const l = Math.round(newLength * 10) / 10;
    const halfW = w / 2;
    const halfL = l / 2;

    // We adjust the outer boundary walls to align with the new width and length
    const updatedWalls = project.walls.map((wall) => {
      if (wall.id === 'wall-north' || wall.id === 'w1') {
        return { ...wall, p1: { x: -halfW, y: -halfL }, p2: { x: halfW, y: -halfL } };
      }
      if (wall.id === 'wall-east' || wall.id === 'w2') {
        return { ...wall, p1: { x: halfW, y: -halfL }, p2: { x: halfW, y: halfL } };
      }
      if (wall.id === 'wall-south' || wall.id === 'w3') {
        return { ...wall, p1: { x: halfW, y: halfL }, p2: { x: -halfW, y: halfL } };
      }
      if (wall.id === 'wall-west' || wall.id === 'w4') {
        return { ...wall, p1: { x: -halfW, y: halfL }, p2: { x: -halfW, y: -halfL } };
      }
      return wall;
    });

    onUpdateProjectSettings({
      ...project,
      dimensions: { width: w, length: l },
      walls: updatedWalls
    });
  };

  // Start with a clean canvas of the current size
  const handleResetToCleanCanvas = () => {
    if (window.confirm('Wipe all interior partitions and furniture to start off with a clean slate outer shell?')) {
      const halfW = width / 2;
      const halfL = length / 2;

      const cleanWalls: Wall[] = [
        { id: 'wall-north', p1: { x: -halfW, y: -halfL }, p2: { x: halfW, y: -halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
        { id: 'wall-east', p1: { x: halfW, y: -halfL }, p2: { x: halfW, y: halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
        { id: 'wall-south', p1: { x: halfW, y: halfL }, p2: { x: -halfW, y: halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
        { id: 'wall-west', p1: { x: -halfW, y: halfL }, p2: { x: -halfW, y: -halfL }, height: 2.8, thickness: 0.15, color: '#f8fafc' },
      ];

      onUpdateProjectSettings({
        ...project,
        name: `${width}x${length} Custom Architect Shell`,
        walls: cleanWalls,
        furniture: []
      });
    }
  };

  const handleApplyPreset = (preset: MaterialPreset) => {
    const updatedWalls = project.walls.map(wall => ({
      ...wall,
      color: preset.wallColor
    }));

    onUpdateProjectSettings({
      ...project,
      sidingType: preset.sidingType,
      sidingColor: preset.sidingColor,
      floorMaterial: preset.floorMaterial,
      floorColor: preset.floorColor,
      roofType: preset.roofType,
      roofColor: preset.roofColor,
      foundationType: preset.foundationType,
      foundationColor: preset.foundationColor,
      walls: updatedWalls
    });
  };

  return (
    <div className="flex flex-col gap-5 py-1">
      {/* Starting Off with a Clean Canvas */}
      <div className="flex flex-col gap-2.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
            <Ruler className="w-3.5 h-3.5" />
            <span>Active Canvas</span>
          </div>
          <button
            onClick={handleResetToCleanCanvas}
            title="Wipe canvas to outer shell"
            className="text-[9px] bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/40 text-rose-300 font-semibold px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer select-none"
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span>Reset Canvas</span>
          </button>
        </div>

        {/* Dynamic Imperial / Metric Toggle Segment */}
        <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
          <span className="text-[9px] text-slate-400 font-mono uppercase font-bold">Measurement Unit</span>
          <div className="grid grid-cols-2 p-0.5 bg-slate-950 border border-slate-850 rounded-lg text-[9px] font-mono font-bold shrink-0">
            <button
              onClick={() => onUpdateProjectSettings({ ...project, unitSystem: 'imperial' })}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                project.unitSystem === 'imperial'
                  ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Footage (Ft)
            </button>
            <button
              onClick={() => onUpdateProjectSettings({ ...project, unitSystem: 'metric' })}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                project.unitSystem === 'metric'
                  ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Metric (M)
            </button>
          </div>
        </div>

        {/* Live Footprint Dimension Sliders */}
        <div className="flex flex-col gap-3 mt-1">
          {/* Width */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Exterior Width</span>
              {project.unitSystem === 'imperial' ? (
                <span className="font-mono text-slate-200 font-bold">
                  {Math.round(width * 3.28084)}ft <span className="text-[9px] text-slate-500">({width.toFixed(1)}m)</span>
                </span>
              ) : (
                <span className="font-mono text-slate-200 font-bold">
                  {width.toFixed(1)}m <span className="text-[9px] text-slate-500">({Math.round(width * 3.28084)}ft)</span>
                </span>
              )}
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="0.5"
              value={width}
              onChange={(e) => handleDimensionChange(parseFloat(e.target.value), length)}
              className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Length */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Exterior Length</span>
              {project.unitSystem === 'imperial' ? (
                <span className="font-mono text-slate-200 font-bold">
                  {Math.round(length * 3.28084)}ft <span className="text-[9px] text-slate-500">({length.toFixed(1)}m)</span>
                </span>
              ) : (
                <span className="font-mono text-slate-200 font-bold">
                  {length.toFixed(1)}m <span className="text-[9px] text-slate-500">({Math.round(length * 3.28084)}ft)</span>
                </span>
              )}
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="0.5"
              value={length}
              onChange={(e) => handleDimensionChange(width, parseFloat(e.target.value))}
              className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Real-time Square Footage & Perimeter calculations */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2.5 border-t border-slate-800/80">
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-900 text-center">
            <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold font-mono">Total Footprint</span>
            {project.unitSystem === 'imperial' ? (
              <>
                <span className="block text-xs font-black text-slate-100 font-mono mt-0.5">{areaSqft.toLocaleString()} <span className="text-[9px] text-slate-400 font-medium">sq ft</span></span>
                <span className="block text-[9px] text-slate-500 font-mono mt-0.5">{areaSqm.toFixed(1)} m²</span>
              </>
            ) : (
              <>
                <span className="block text-xs font-black text-slate-100 font-mono mt-0.5">{areaSqm.toFixed(1)} <span className="text-[9px] text-slate-400 font-medium">m²</span></span>
                <span className="block text-[9px] text-slate-500 font-mono mt-0.5">{areaSqft.toLocaleString()} sq ft</span>
              </>
            )}
          </div>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-900 text-center">
            <span className="block text-[8px] uppercase tracking-wider text-slate-500 font-bold font-mono">Perimeter Shell</span>
            {project.unitSystem === 'imperial' ? (
              <>
                <span className="block text-xs font-black text-slate-100 font-mono mt-0.5">{perimeterFt} <span className="text-[9px] text-slate-400 font-medium">ft</span></span>
                <span className="block text-[9px] text-slate-500 font-mono mt-0.5">{perimeterM.toFixed(1)} m</span>
              </>
            ) : (
              <>
                <span className="block text-xs font-black text-slate-100 font-mono mt-0.5">{perimeterM.toFixed(1)} <span className="text-[9px] text-slate-400 font-medium">m</span></span>
                <span className="block text-[9px] text-slate-500 font-mono mt-0.5">{perimeterFt} ft</span>
              </>
            )}
          </div>
        </div>

        {/* Home Classification Badge */}
        <div className={`mt-2 text-center text-[10px] font-bold border rounded-lg py-1 px-1.5 leading-snug ${homeCategory.color}`}>
          {homeCategory.label}
        </div>
      </div>

      {/* Designer Material Presets Section */}
      <div className="flex flex-col gap-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Designer Material Presets</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 leading-normal">
          Apply a synchronized color & texture palette to all interior walls, exterior siding, floors, and roofs with one click.
        </p>

        <div className="grid grid-cols-2 gap-2 mt-1">
          {MATERIAL_PRESETS.map((preset) => {
            const isActive = 
              project.floorMaterial === preset.floorMaterial &&
              project.sidingType === preset.sidingType &&
              project.sidingColor === preset.sidingColor &&
              project.roofType === preset.roofType;

            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`text-left p-2.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all cursor-pointer hover:bg-slate-900/80 select-none ${
                  isActive 
                    ? 'bg-indigo-950/20 border-indigo-500 ring-1 ring-indigo-500/30' 
                    : 'bg-slate-950/80 border-slate-850 hover:border-slate-800'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs">{preset.emoji}</span>
                    <span className="text-[11px] font-black text-slate-100 font-mono tracking-wide">{preset.name}</span>
                    {isActive && (
                      <span className="text-[8px] bg-indigo-500/20 text-indigo-300 font-mono px-1 py-0.2 rounded-full font-bold border border-indigo-500/30">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 leading-tight line-clamp-2">{preset.description}</p>
                </div>

                {/* Mood-board Swatch Preview */}
                <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-md border border-slate-800/40 w-fit">
                  {preset.colors.map((color, cIdx) => (
                    <span 
                      key={cIdx} 
                      className="w-2.5 h-2.5 rounded-sm border border-black/40 shadow-sm" 
                      style={{ backgroundColor: color }}
                      title={
                        cIdx === 0 ? `Siding Color: ${color}` :
                        cIdx === 1 ? `Floor Color: ${color}` :
                        cIdx === 2 ? `Roof Color: ${color}` :
                        `Interior Wall Color: ${color}`
                      }
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guided 5-Phase Construction Process Checklist */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <Hammer className="w-3.5 h-3.5 text-indigo-400" />
          <span>Home Construction Roadmap</span>
        </h3>

        {/* Phase 1: Foundation */}
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-800/40">1</span>
              <span className="text-xs font-bold text-slate-200">Pour Foundation</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-400/10" />
              <span>Poured</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-slate-500 font-mono uppercase">Type</span>
              <select
                value={project.foundationType || 'slab'}
                onChange={(e) => onUpdateProjectSettings({
                  ...project,
                  foundationType: e.target.value as FoundationType
                })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1 text-[10px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="slab">Slab on Grade</option>
                <option value="crawlspace">Crawlspace Piers</option>
                <option value="basement">Basement Slab</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-slate-500 font-mono uppercase">Depth/Height</span>
              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.05"
                value={project.foundationHeight ?? 0.2}
                onChange={(e) => onUpdateProjectSettings({
                  ...project,
                  foundationHeight: parseFloat(e.target.value)
                })}
                className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg mt-2 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Phase 2: Siding */}
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-800/40">2</span>
              <span className="text-xs font-bold text-slate-200">Framing & Exterior Siding</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-400/10" />
              <span>Framed</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-slate-500 font-mono uppercase">Siding Material</span>
              <select
                value={project.sidingType || 'vinyl'}
                onChange={(e) => onUpdateProjectSettings({
                  ...project,
                  sidingType: e.target.value as SidingType
                })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1 text-[10px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="vinyl">Vinyl Siding</option>
                <option value="brick">Flemish Brick</option>
                <option value="stucco">Fine Stucco</option>
                <option value="wood">Vertical Wood</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-slate-500 font-mono uppercase">Siding Paint</span>
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="color"
                  value={project.sidingColor || '#f1f5f9'}
                  onChange={(e) => onUpdateProjectSettings({
                    ...project,
                    sidingColor: e.target.value
                  })}
                  className="w-5 h-5 rounded border border-slate-700 bg-transparent cursor-pointer p-0"
                />
                <span className="text-[10px] text-slate-400 font-mono uppercase truncate">{project.sidingColor || '#f1f5f9'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 3: Roof */}
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-800/40">3</span>
              <span className="text-xs font-bold text-slate-200">Roof Structural Cap</span>
            </div>
            <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
              {project.roofType && project.roofType !== 'none' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-indigo-400 fill-indigo-400/10" />
                  <span>Installed</span>
                </>
              ) : (
                <span className="text-slate-500">No Roof (Open)</span>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-slate-500 font-mono uppercase">Roof Style</span>
              <select
                value={project.roofType || 'gabled'}
                onChange={(e) => onUpdateProjectSettings({
                  ...project,
                  roofType: e.target.value as RoofType
                })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1 text-[10px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="gabled">🔺 Gabled Peak</option>
                <option value="hipped">🏠 Hipped Slopes</option>
                <option value="flat">🟥 Modernist Flat</option>
                <option value="none">🟩 None (See Inside)</option>
              </select>
            </div>
            {project.roofType && project.roofType !== 'none' && (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-slate-500 font-mono uppercase">Shingle Color</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="color"
                    value={project.roofColor || '#334155'}
                    onChange={(e) => onUpdateProjectSettings({
                      ...project,
                      roofColor: e.target.value
                    })}
                    className="w-5 h-5 rounded border border-slate-700 bg-transparent cursor-pointer p-0"
                  />
                  <span className="text-[10px] text-slate-400 font-mono uppercase truncate">{project.roofColor || '#334155'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phase 4: Flooring */}
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-800/40">4</span>
              <span className="text-xs font-bold text-slate-200">Floor Finishes</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-400/10" />
              <span>Finished</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-slate-500 font-mono uppercase">Material</span>
              <select
                value={project.floorMaterial}
                onChange={(e) => onUpdateProjectSettings({
                  ...project,
                  floorMaterial: e.target.value as FloorMaterial
                })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1 text-[10px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="hardwood">Birch Hardwood</option>
                <option value="carpet">Plush Carpet</option>
                <option value="tile">Checkerboard Tile</option>
                <option value="concrete">Polished Concrete</option>
                <option value="marble">Royal Marble</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-slate-500 font-mono uppercase">Tint</span>
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="color"
                  value={project.floorColor}
                  onChange={(e) => onUpdateProjectSettings({
                    ...project,
                    floorColor: e.target.value
                  })}
                  className="w-5 h-5 rounded border border-slate-700 bg-transparent cursor-pointer p-0"
                />
                <span className="text-[10px] text-slate-400 font-mono uppercase truncate">{project.floorColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 5: Furniture Furnishing */}
        <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/50 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 font-mono text-[10px] font-bold border border-indigo-800/40">5</span>
              <span className="text-xs font-bold text-slate-200">Furniture & Furnishing</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-950/80 border border-indigo-800/30 px-1.5 py-0.5 rounded-md">
              {project.furniture.length} Placed
            </span>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal">
            Your shell layout is complete! Ready to arrange the interior spacing?
          </p>

          <button
            onClick={onNavigateToCatalog}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer select-none"
          >
            <span>Browse Furniture Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
