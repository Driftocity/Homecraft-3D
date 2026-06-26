/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  DollarSign,
  Calculator,
  Sliders,
  TrendingUp,
  MapPin,
  RefreshCw,
  FileSpreadsheet,
  Calendar,
  Layers,
  ChevronDown,
  Info
} from 'lucide-react';
import { HomeProject, FoundationType, SidingType, RoofType, FloorMaterial } from '../types';

interface PricingMatrixProps {
  project: HomeProject;
  onUpdateProjectSettings: (project: HomeProject) => void;
}

export const STATE_MULTIPLIERS = [
  { code: 'US', name: 'US National Average', factor: 1.00 },
  { code: 'CA', name: 'California (High-Index)', factor: 1.40 },
  { code: 'NY', name: 'New York (Metro/Sourcing)', factor: 1.45 },
  { code: 'TX', name: 'Texas (Mid-South)', factor: 0.95 },
  { code: 'FL', name: 'Florida (Coastal)', factor: 1.10 },
  { code: 'IL', name: 'Illinois (Great Lakes)', factor: 1.18 },
  { code: 'WA', name: 'Washington (Pacific NW)', factor: 1.30 },
  { code: 'CO', name: 'Colorado (Mountain)', factor: 1.12 }
];

export const DEFAULT_UNIT_PRICES: { [key: string]: number } = {
  // Foundation (per sq ft)
  'found_slab': 12.50,
  'found_crawlspace': 19.00,
  'found_basement': 42.00,

  // Siding / Framing (per sq ft of wall area)
  'side_vinyl': 7.50,
  'side_brick': 24.00,
  'side_stucco': 15.00,
  'side_wood': 13.50,

  // Roof (per sq ft of roof footprint)
  'roof_gabled': 16.00,
  'roof_hipped': 21.00,
  'roof_flat': 11.50,

  // Flooring (per sq ft)
  'floor_hardwood': 9.50,
  'floor_carpet': 4.50,
  'floor_tile': 8.00,
  'floor_concrete': 5.00,
  'floor_marble': 26.00,

  // Base Labor Constant (per sq ft of total footprint)
  'labor_rate': 28.00
};

// Map furniture catalog items to realistic unit prices
export const getFurniturePrice = (catalogId: string): number => {
  const map: { [key: string]: number } = {
    // living
    'sofa-luxe': 1250,
    'sofa-sectional': 1850,
    'lounge-chair': 450,
    'tv-credenza': 650,
    'coffee-table': 350,
    'bookshelf-tall': 280,
    // bedroom
    'bed-king': 1400,
    'bed-queen': 1100,
    'nightstand': 180,
    'dresser-wood': 750,
    'wardrobe-mirror': 950,
    // kitchen
    'dining-table': 850,
    'dining-chair': 120,
    'kitchen-island': 1600,
    'fridge-double': 2100,
    'stove-oven': 1200,
    // bathroom
    'bathtub-soaking': 1500,
    'bathroom-vanity': 850,
    'toilet-modern': 400,
    // decor & plants
    'rug-oriental': 600,
    'potted-monstera': 65,
    'floor-lamp': 110,
    'standing-mirror': 240,
    // doors & windows
    'wood-door': 350,
    'sliding-glass': 950,
    'double-window': 420
  };
  return map[catalogId] || 150; // fallback default price
};

export default function PricingMatrix({ project, onUpdateProjectSettings }: PricingMatrixProps) {
  const customPrices = project.customPrices || {};
  const selectedState = project.selectedState || 'US';

  // Retrieve current active prices (merging custom overrides with defaults)
  const getPrice = (key: string): number => {
    return customPrices[key] !== undefined ? customPrices[key] : DEFAULT_UNIT_PRICES[key];
  };

  const handlePriceChange = (key: string, value: string) => {
    const num = parseFloat(value) || 0;
    onUpdateProjectSettings({
      ...project,
      customPrices: {
        ...customPrices,
        [key]: num
      }
    });
  };

  const handleResetPrices = () => {
    if (window.confirm('Reset all unit material and labor pricing matrix to regional default averages?')) {
      onUpdateProjectSettings({
        ...project,
        customPrices: {}
      });
    }
  };

  // Dimensions & Calculations
  const width = project.dimensions.width;
  const length = project.dimensions.length;
  const areaSqm = width * length;
  const areaSqft = areaSqm * 10.7639;

  // Exterior Wall Perimeter Calculations
  const perimeterM = 2 * (width + length);
  const perimeterFt = perimeterM * 3.28084;
  const wallHeightM = project.walls[0]?.height || 2.8;
  const wallHeightFt = wallHeightM * 3.28084;
  const totalWallAreaSqft = perimeterFt * wallHeightFt;

  // State adjustment factor
  const stateObj = STATE_MULTIPLIERS.find(s => s.code === selectedState) || STATE_MULTIPLIERS[0];
  const multiplier = stateObj.factor;

  // Real-time dynamic costs
  // 1. Foundation Cost
  const fType = project.foundationType || 'slab';
  const foundationRate = getPrice(`found_${fType}`);
  const foundationCost = areaSqft * foundationRate;

  // 2. Siding & Framing Cost
  const sType = project.sidingType || 'vinyl';
  const sidingRate = getPrice(`side_${sType}`);
  const sidingCost = totalWallAreaSqft * sidingRate;

  // 3. Roof Cost
  const rType = project.roofType || 'none';
  const roofCost = React.useMemo(() => {
    if (rType === 'none') return 0;
    const roofRate = getPrice(`roof_${rType}`);
    const roofFootprintSqft = (width + (project.roofOverhang ?? 0.3) * 2) * (length + (project.roofOverhang ?? 0.3) * 2) * 10.7639;
    const pitchMultiplier = 1 + (project.roofPitch ?? 0.35) * 0.5; // pitch adds surface area
    return roofFootprintSqft * roofRate * pitchMultiplier;
  }, [rType, width, length, project.roofOverhang, project.roofPitch, customPrices]);

  // 4. Flooring Cost
  const floorRate = getPrice(`floor_${project.floorMaterial}`);
  const flooringCost = areaSqft * floorRate;

  // 5. Labor Cost
  const laborRate = getPrice('labor_rate');
  const baseLaborCost = areaSqft * laborRate;

  // 6. Placed Furniture Costs
  const furnitureTotal = project.furniture.reduce((sum, item) => sum + getFurniturePrice(item.catalogId), 0);

  // Apply location multiplier to raw materials and labor
  const rawSubtotal = foundationCost + sidingCost + roofCost + flooringCost + baseLaborCost;
  const localizedSubtotal = rawSubtotal * multiplier;
  const grandTotal = localizedSubtotal + furnitureTotal;

  return (
    <div className="flex flex-col gap-5 py-1">
      {/* Dynamic Summary Panel */}
      <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900/80 p-4 rounded-xl border border-indigo-500/20 shadow-xl flex flex-col gap-3.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
            <Calculator className="w-3.5 h-3.5" />
            <span>Project Estimation</span>
          </div>
          <button
            onClick={handleResetPrices}
            title="Reset matrix to standard baseline averages"
            className="text-[9px] bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700/80 text-slate-400 font-semibold px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer select-none"
          >
            <RefreshCw className="w-3 h-3 text-indigo-400" />
            <span>Reset Matrix</span>
          </button>
        </div>

        {/* Pricing Location Selector */}
        <div className="flex flex-col gap-1.5 bg-slate-950/80 p-2.5 rounded-lg border border-slate-900">
          <label className="text-[9px] text-slate-400 uppercase tracking-wider font-bold font-mono flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span>Region/State Sourcing Rate</span>
          </label>
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => onUpdateProjectSettings({
                ...project,
                selectedState: e.target.value
              })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none"
            >
              {STATE_MULTIPLIERS.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.name} ({st.factor >= 1.0 ? `+${Math.round((st.factor - 1) * 100)}%` : `-${Math.round((1 - st.factor) * 100)}%`})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Invoiced Estimates */}
        <div className="flex flex-col gap-1.5 font-mono pt-1">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Material & Labor Subtotal:</span>
            <span>${localizedSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Furniture & Decor total:</span>
            <span>${furnitureTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-800/80 pt-2 mt-1">
            <span className="text-xs font-black text-white">ESTIMATED TOTAL</span>
            <span className="text-base font-black text-indigo-400">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="text-[8px] text-slate-500 leading-normal mt-1.5 text-center bg-slate-950/40 p-1.5 rounded border border-slate-900/50">
            *Includes {Math.round(areaSqft).toLocaleString()} sqft footprint calculations localized for <span className="font-semibold text-slate-400">{stateObj.name}</span>.
          </div>
        </div>
      </div>

      {/* Monthly Rate Configuration Matrix (Interactive) */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>Edit Monthly Unit Rates ($/SqFt)</span>
        </h3>

        <div className="bg-slate-900/40 border border-slate-800/40 p-3 rounded-xl flex gap-2">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-[9px] text-slate-400 leading-normal">
            You can modify the base rates below to keep pricing up-to-date with your local hardware and general labor quotes.
          </p>
        </div>

        {/* Categories accordion */}
        <div className="flex flex-col gap-3 bg-slate-900/20 p-1.5 rounded-xl border border-slate-800/60">
          
          {/* Foundation */}
          <div className="flex flex-col gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-800/30">
            <span className="text-[10px] font-bold text-slate-300 font-mono flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Foundation Layer</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Slab</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('found_slab')}
                  onChange={(e) => handlePriceChange('found_slab', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Crawlspace</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('found_crawlspace')}
                  onChange={(e) => handlePriceChange('found_crawlspace', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Basement</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('found_basement')}
                  onChange={(e) => handlePriceChange('found_basement', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Siding */}
          <div className="flex flex-col gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-800/30">
            <span className="text-[10px] font-bold text-slate-300 font-mono flex items-center gap-1">
              <Layers className="w-3 h-3 text-rose-400" />
              <span>Siding & Framing</span>
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Vinyl</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('side_vinyl')}
                  onChange={(e) => handlePriceChange('side_vinyl', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Brick</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('side_brick')}
                  onChange={(e) => handlePriceChange('side_brick', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Stucco</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('side_stucco')}
                  onChange={(e) => handlePriceChange('side_stucco', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Wood</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('side_wood')}
                  onChange={(e) => handlePriceChange('side_wood', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Roof Style */}
          <div className="flex flex-col gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-800/30">
            <span className="text-[10px] font-bold text-slate-300 font-mono flex items-center gap-1">
              <Layers className="w-3 h-3 text-sky-400" />
              <span>Roof Materials</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Gabled</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('roof_gabled')}
                  onChange={(e) => handlePriceChange('roof_gabled', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Hipped</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('roof_hipped')}
                  onChange={(e) => handlePriceChange('roof_hipped', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Flat</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('roof_flat')}
                  onChange={(e) => handlePriceChange('roof_flat', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Flooring */}
          <div className="flex flex-col gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-800/30">
            <span className="text-[10px] font-bold text-slate-300 font-mono flex items-center gap-1">
              <Layers className="w-3 h-3 text-emerald-400" />
              <span>Flooring Materials</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Hardwood</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('floor_hardwood')}
                  onChange={(e) => handlePriceChange('floor_hardwood', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Carpet</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('floor_carpet')}
                  onChange={(e) => handlePriceChange('floor_carpet', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Tile</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('floor_tile')}
                  onChange={(e) => handlePriceChange('floor_tile', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Concrete</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('floor_concrete')}
                  onChange={(e) => handlePriceChange('floor_concrete', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] text-slate-500 font-mono uppercase">Marble</span>
                <input
                  type="number"
                  step="0.5"
                  value={getPrice('floor_marble')}
                  onChange={(e) => handlePriceChange('floor_marble', e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-1 text-[10px] text-slate-200 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Labor */}
          <div className="flex flex-col gap-2 p-2 bg-slate-900/40 rounded-lg border border-slate-800/30">
            <span className="text-[10px] font-bold text-slate-300 font-mono flex items-center gap-1">
              <Sliders className="w-3 h-3 text-amber-400" />
              <span>Base General Labor</span>
            </span>
            <div className="flex gap-2 items-center">
              <span className="text-[9px] text-slate-400">National Base Rate ($/SqFt):</span>
              <input
                type="number"
                step="0.5"
                value={getPrice('labor_rate')}
                onChange={(e) => handlePriceChange('labor_rate', e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none w-28"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
