/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Loader2, Compass, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { HomeProject } from '../types';

interface AIPlannerProps {
  onLoadGeneratedProject: (project: HomeProject) => void;
  currentDimensions: { width: number; length: number };
}

const DESIGN_PRESETS = [
  {
    title: 'Scandinavian Living Room',
    prompt: 'A bright cozy Scandinavian living room with light wood floors, a modern gray sofa, a wooden coffee table on a geometric rug, a tall bookshelf, and plenty of house plants in the corners.',
    icon: '🪵'
  },
  {
    title: 'Luxury Master Bedroom',
    prompt: 'A luxurious master bedroom with marble floors, a blue fabric king bed with side nightstands and brass floor lamps, an ergonomic desk area, and abstract canvas art on the wall.',
    icon: '✨'
  },
  {
    title: 'Industrial Office Loft',
    prompt: 'An industrial style office studio with concrete floors, dark gray walls, a large writing desk with a mesh chair, a bookshelf with books, and a modern lounge armchair with a floor lamp.',
    icon: '🧱'
  },
  {
    title: 'Family Kitchen & Dining',
    prompt: 'A warm and spacious kitchen and dining room with tiled floors, a solid family dining table with matching chairs, a marble-top kitchen island, and a stainless steel refrigerator.',
    icon: '🍳'
  }
];

export default function AIPlanner({ onLoadGeneratedProject, currentDimensions }: AIPlannerProps) {
  const [prompt, setPrompt] = useState<string>('');
  const [width, setWidth] = useState<number>(currentDimensions.width);
  const [length, setLength] = useState<number>(currentDimensions.length);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/generate-layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          width: Number(width) || 10,
          length: Number(length) || 10,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate layout.');
      }

      // Convert server JSON schema to our front-end model
      const generatedProject: HomeProject = {
        id: 'ai-generated-' + Date.now(),
        name: data.projectName || 'AI Generated Design',
        floorMaterial: data.floorMaterial || 'hardwood',
        floorColor: data.floorColor || '#d97706',
        dimensions: {
          width: Number(width) || 10,
          length: Number(length) || 10,
        },
        // Re-map walls with IDs
        walls: (data.walls || []).map((wall: any, index: number) => ({
          id: `ai-wall-${index}-${Date.now()}`,
          p1: wall.p1,
          p2: wall.p2,
          height: 2.8, // standard ceiling
          thickness: 0.15, // standard thickness
          color: wall.color || '#f1f5f9',
        })),
        // Re-map furniture with standard values
        furniture: (data.furniture || []).map((item: any, index: number) => {
          // Fallback properties
          const fallbackColors: { [key: string]: string } = {
            sofa_modern: '#4b5563',
            armchair_cozy: '#d97706',
            coffee_table_wood: '#78350f',
            tv_stand_console: '#1f2937',
            rug_area: '#e5e7eb',
            bookshelf_tall: '#451a03',
            bed_king: '#3b82f6',
            nightstand_wood: '#b45309',
            wardrobe_closet: '#d1fae5',
            desk_office: '#374151',
            chair_office: '#0f172a',
            dining_table: '#7c2d12',
            dining_chair: '#f3f4f6',
            fridge_modern: '#9ca3af',
            kitchen_island: '#111827',
            bathtub_oval: '#ffffff',
            toilet_porcelain: '#f9fafb',
            bathroom_sink: '#374151',
            fixture_door: '#d97706',
            fixture_window: '#e0f2fe',
            plant_house: '#15803d',
            lamp_floor: '#facc15',
            painting_canvas: '#ec4899',
          };

          const defaultScales: { [key: string]: { x: number; y: number; z: number } } = {
            sofa_modern: { x: 2.2, y: 0.8, z: 0.9 },
            armchair_cozy: { x: 0.9, y: 0.8, z: 0.95 },
            coffee_table_wood: { x: 1.2, y: 0.45, z: 0.7 },
            tv_stand_console: { x: 1.8, y: 0.5, z: 0.45 },
            rug_area: { x: 3.0, y: 0.01, z: 2.0 },
            bookshelf_tall: { x: 1.0, y: 2.0, z: 0.35 },
            bed_king: { x: 2.0, y: 0.9, z: 2.1 },
            nightstand_wood: { x: 0.5, y: 0.55, z: 0.45 },
            wardrobe_closet: { x: 1.5, y: 2.1, z: 0.6 },
            desk_office: { x: 1.3, y: 0.75, z: 0.65 },
            chair_office: { x: 0.65, y: 0.95, z: 0.65 },
            dining_table: { x: 1.6, y: 0.75, z: 0.9 },
            dining_chair: { x: 0.45, y: 0.9, z: 0.48 },
            fridge_modern: { x: 0.9, y: 1.9, z: 0.8 },
            kitchen_island: { x: 2.0, y: 0.9, z: 0.9 },
            bathtub_oval: { x: 1.7, y: 0.6, z: 0.8 },
            toilet_porcelain: { x: 0.5, y: 0.8, z: 0.7 },
            bathroom_sink: { x: 0.9, y: 0.85, z: 0.55 },
            fixture_door: { x: 0.9, y: 2.1, z: 0.1 },
            fixture_window: { x: 1.5, y: 1.2, z: 0.15 },
            plant_house: { x: 0.6, y: 1.0, z: 0.6 },
            lamp_floor: { x: 0.4, y: 1.6, z: 0.4 },
            painting_canvas: { x: 1.2, y: 0.8, z: 0.05 },
          };

          const defaultCategories: { [key: string]: string } = {
            sofa_modern: 'living',
            armchair_cozy: 'living',
            coffee_table_wood: 'living',
            tv_stand_console: 'living',
            rug_area: 'living',
            bookshelf_tall: 'living',
            bed_king: 'bedroom',
            nightstand_wood: 'bedroom',
            wardrobe_closet: 'bedroom',
            desk_office: 'bedroom',
            chair_office: 'bedroom',
            dining_table: 'kitchen',
            dining_chair: 'kitchen',
            fridge_modern: 'kitchen',
            kitchen_island: 'kitchen',
            bathtub_oval: 'bathroom',
            toilet_porcelain: 'bathroom',
            bathroom_sink: 'bathroom',
            fixture_door: 'fixtures',
            fixture_window: 'fixtures',
            plant_house: 'decor',
            lamp_floor: 'decor',
            painting_canvas: 'decor',
          };

          const catalogId = item.catalogId || 'sofa_modern';

          return {
            id: `ai-furniture-${index}-${Date.now()}`,
            catalogId,
            name: catalogId.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            type: catalogId.split('_')[0],
            position: item.position || { x: 0, y: 0, z: 0 },
            rotation: item.rotation || 0,
            scale: defaultScales[catalogId] || { x: 1, y: 1, z: 1 },
            color: item.color || fallbackColors[catalogId] || '#cbd5e1',
            materialType: catalogId.includes('wood') || catalogId.includes('nightstand') ? 'wood' : 'fabric',
            category: defaultCategories[catalogId] || 'living',
          };
        }),
      };

      onLoadGeneratedProject(generatedProject);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong during generation.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectPreset = (p: string) => {
    setPrompt(p);
  };

  return (
    <div className="flex flex-col gap-5" id="ai-planner-panel">
      {/* Panel Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-100">AI Room Designer</h2>
          <p className="text-[11px] text-slate-400">Describe your layout and watch Gemini build it</p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        {/* Text Prompt */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300">What would you like to build?</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            placeholder="e.g. A modern studio with clean hardwood floors, a luxury king bed in the center, a work desk under the window, and a plant next to a floor lamp..."
            className="w-full h-24 bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none leading-relaxed"
          />
        </div>

        {/* Room Boundaries Setup */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Room Width (meters)</label>
            <input
              type="number"
              min="4"
              max="20"
              value={width}
              onChange={(e) => setWidth(Math.min(20, Math.max(4, Number(e.target.value))))}
              disabled={isLoading}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition font-mono"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Room Length (meters)</label>
            <input
              type="number"
              min="4"
              max="20"
              value={length}
              onChange={(e) => setLength(Math.min(20, Math.max(4, Number(e.target.value))))}
              disabled={isLoading}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition font-mono"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
              <span>Placing walls & furniture...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate 3D Layout</span>
            </>
          )}
        </button>
      </form>

      {/* Success / Error Banners */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-3 py-2 rounded-xl text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">Generation failed</span>
            <span className="text-[10px] leading-normal text-rose-400/90">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-2 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold">Successfully Generated!</span>
            <span className="text-[10px] text-emerald-400/90">Your 3D blueprint is fully populated on the floor plan canvas.</span>
          </div>
        </div>
      )}

      {/* Preset Inspiration Cards */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <Compass className="w-3.5 h-3.5" />
          <span>Need Inspiration? Choose a Preset Style:</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {DESIGN_PRESETS.map((preset, index) => (
            <button
              key={index}
              onClick={() => selectPreset(preset.prompt)}
              disabled={isLoading}
              type="button"
              className="text-left bg-slate-800/40 hover:bg-slate-800/80 active:bg-slate-700/50 border border-slate-700/30 rounded-xl p-2.5 transition flex flex-col gap-1 select-none"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{preset.icon}</span>
                <span className="text-[11px] font-bold text-slate-200 line-clamp-1">{preset.title}</span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{preset.prompt}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
