/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Tag, Plus, Trash2, MapPin, Sparkles, Move } from 'lucide-react';
import { HomeProject, RoomLabel } from '../types';

interface RoomLabelerProps {
  project: HomeProject;
  onUpdateProjectSettings: (project: HomeProject) => void;
}

export default function RoomLabeler({ project, onUpdateProjectSettings }: RoomLabelerProps) {
  const [newLabelName, setNewLabelName] = useState('');

  const roomLabels = project.roomLabels || [];

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    const newLabel: RoomLabel = {
      id: `room-label-${Date.now()}`,
      name: newLabelName.trim(),
      position: { x: 0, y: 0 },
      color: '#f4f4f5',
      fontSize: 14
    };

    onUpdateProjectSettings({
      ...project,
      roomLabels: [...roomLabels, newLabel]
    });

    setNewLabelName('');
  };

  const handleDeleteLabel = (id: string) => {
    onUpdateProjectSettings({
      ...project,
      roomLabels: roomLabels.filter((label) => label.id !== id)
    });
  };

  const handleUpdateLabelField = (id: string, field: keyof RoomLabel, value: any) => {
    onUpdateProjectSettings({
      ...project,
      roomLabels: roomLabels.map((label) => {
        if (label.id === id) {
          return { ...label, [field]: value };
        }
        return label;
      })
    });
  };

  const handleUpdateLabelPosition = (id: string, coord: 'x' | 'y', val: number) => {
    onUpdateProjectSettings({
      ...project,
      roomLabels: roomLabels.map((label) => {
        if (label.id === id) {
          return {
            ...label,
            position: {
              ...label.position,
              [coord]: Math.round(val * 10) / 10
            }
          };
        }
        return label;
      })
    });
  };

  // Pre-suggested standard room names
  const ROOM_SUGGESTIONS = [
    'Living Room',
    'Master Bedroom',
    'Kitchen',
    'Dining Area',
    'Home Office',
    'Guest Bathroom',
    'Outdoor Patio',
    'Garage Studio'
  ];

  const handleAddSuggestion = (name: string) => {
    const newLabel: RoomLabel = {
      id: `room-label-${Date.now()}`,
      name,
      position: { x: 0, y: 0 },
      color: '#f4f4f5',
      fontSize: 14
    };
    onUpdateProjectSettings({
      ...project,
      roomLabels: [...roomLabels, newLabel]
    });
  };

  const halfWidth = project.dimensions.width / 2;
  const halfLength = project.dimensions.length / 2;

  return (
    <div className="flex flex-col gap-5 py-1">
      <div className="flex flex-col gap-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
        <span className="text-[9px] text-indigo-400 font-mono uppercase tracking-wider font-bold flex items-center gap-1">
          <Tag className="w-3 h-3" />
          <span>Quick Placement Suggestions</span>
        </span>
        <p className="text-[10px] text-slate-400 leading-normal">
          Click any popular room name to instantly drop a layout tag onto the center of your floor plan:
        </p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {ROOM_SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              onClick={() => handleAddSuggestion(sug)}
              type="button"
              className="text-[9px] bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 border border-slate-700/60 px-2 py-1 rounded-md transition cursor-pointer select-none"
            >
              + {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Input Form */}
      <form onSubmit={handleAddLabel} className="flex flex-col gap-2">
        <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold font-mono">
          Custom Room Name Label
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="e.g. Nursery / Studio Loft"
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center gap-1 select-none"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Active Room Label Managers */}
      <div className="flex flex-col gap-3.5">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          <span>Position Room Labels ({roomLabels.length})</span>
        </h3>

        {roomLabels.length === 0 ? (
          <div className="bg-slate-900/30 border border-slate-800/40 p-4 rounded-xl text-center">
            <p className="text-[10px] text-slate-500">
              No rooms placed on the floor plan yet. Click a suggestion above or enter a custom name to place one!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {roomLabels.map((lbl) => (
              <div
                key={lbl.id}
                className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3 flex flex-col gap-3 relative"
              >
                {/* Header Edit */}
                <div className="flex justify-between items-center gap-2">
                  <input
                    type="text"
                    value={lbl.name}
                    onChange={(e) => handleUpdateLabelField(lbl.id, 'name', e.target.value)}
                    className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 text-xs font-bold text-white focus:outline-none py-0.5 transition w-full"
                  />
                  <button
                    onClick={() => handleDeleteLabel(lbl.id)}
                    title="Remove room label"
                    className="p-1 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded-md transition cursor-pointer select-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-800/60">
                  {/* Position X */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[9px] font-mono">
                      <span className="text-slate-500">Horizontal (X)</span>
                      <span className="text-slate-300 font-bold">{lbl.position.x.toFixed(1)}m</span>
                    </div>
                    <input
                      type="range"
                      min={-halfWidth}
                      max={halfWidth}
                      step="0.2"
                      value={lbl.position.x}
                      onChange={(e) => handleUpdateLabelPosition(lbl.id, 'x', parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Position Y */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[9px] font-mono">
                      <span className="text-slate-500">Vertical (Y)</span>
                      <span className="text-slate-300 font-bold">{lbl.position.y.toFixed(1)}m</span>
                    </div>
                    <input
                      type="range"
                      min={-halfLength}
                      max={halfLength}
                      step="0.2"
                      value={lbl.position.y}
                      onChange={(e) => handleUpdateLabelPosition(lbl.id, 'y', parseFloat(e.target.value))}
                      className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Help tip for coordinates */}
                <div className="text-[8px] text-slate-500 font-mono flex items-center gap-1">
                  <Move className="w-2.5 h-2.5 text-indigo-400" />
                  <span>Use sliders to shift label positions anywhere on the {project.dimensions.width}m x {project.dimensions.length}m floor shell.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
