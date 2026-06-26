/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  X, 
  Printer, 
  Calculator, 
  MapPin, 
  ClipboardList, 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  Layers,
  Flame,
  Wrench,
  ChevronRight
} from 'lucide-react';
import { HomeProject } from '../types';
import { STATE_MULTIPLIERS, DEFAULT_UNIT_PRICES, getFurniturePrice } from './PricingMatrix';

interface SummaryReportModalProps {
  project: HomeProject;
  onClose: () => void;
}

export default function SummaryReportModal({ project, onClose }: SummaryReportModalProps) {
  const customPrices = project.customPrices || {};
  const selectedState = project.selectedState || 'US';
  const targetBudget = project.targetBudget || 60000;
  const useFeet = project.unitSystem === 'imperial';

  // Base pricing getter helper
  const getPrice = (key: string): number => {
    return customPrices[key] !== undefined ? customPrices[key] : DEFAULT_UNIT_PRICES[key];
  };

  // Dimensional helpers
  const width = project.dimensions.width;
  const length = project.dimensions.length;
  const areaSqm = width * length;
  const areaSqft = areaSqm * 10.7639;

  const perimeterM = 2 * (width + length);
  const perimeterFt = perimeterM * 3.28084;
  const wallHeightM = project.walls[0]?.height || 2.8;
  const wallHeightFt = wallHeightM * 3.28084;
  const totalWallAreaSqft = perimeterFt * wallHeightFt;

  // Region lookup
  const stateObj = useMemo(() => {
    return STATE_MULTIPLIERS.find(s => s.code === selectedState) || STATE_MULTIPLIERS[0];
  }, [selectedState]);
  const multiplier = stateObj.factor;

  // Real-time calculated structural costs
  const fType = project.foundationType || 'slab';
  const foundationRate = getPrice(`found_${fType}`);
  const foundationCost = areaSqft * foundationRate;

  const sType = project.sidingType || 'vinyl';
  const sidingRate = getPrice(`side_${sType}`);
  const sidingCost = totalWallAreaSqft * sidingRate;

  const rType = project.roofType || 'none';
  const roofCost = useMemo(() => {
    if (rType === 'none') return 0;
    const roofRate = getPrice(`roof_${rType}`);
    const roofFootprintSqft = (width + (project.roofOverhang ?? 0.3) * 2) * (length + (project.roofOverhang ?? 0.3) * 2) * 10.7639;
    const pitchMultiplier = 1 + (project.roofPitch ?? 0.35) * 0.5;
    return roofFootprintSqft * roofRate * pitchMultiplier;
  }, [rType, width, length, project.roofOverhang, project.roofPitch, customPrices]);

  const floorRate = getPrice(`floor_${project.floorMaterial}`);
  const flooringCost = areaSqft * floorRate;

  const laborRate = getPrice('labor_rate');
  const baseLaborCost = areaSqft * laborRate;

  // Placed furniture cost and counts
  const furnitureTotal = useMemo(() => {
    return project.furniture.reduce((sum, item) => sum + getFurniturePrice(item.catalogId), 0);
  }, [project.furniture]);

  const rawSubtotal = foundationCost + sidingCost + roofCost + flooringCost + baseLaborCost;
  const localizedSubtotal = rawSubtotal * multiplier;
  const grandTotal = localizedSubtotal + furnitureTotal;

  // Trigger web native print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto" id="summary-report-modal">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] text-slate-100 print:bg-white print:text-slate-900 print:border-none print:shadow-none print:max-h-none overflow-hidden animate-scaleIn">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 print:hidden bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider font-mono">Architect Summary Report</h2>
              <p className="text-[10px] text-slate-400 font-medium">Construction Specifications, Bill of Materials, and regional cost forecasts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 print:overflow-visible print:p-0">
          
          {/* Printable Document Title Bar */}
          <div className="hidden print:flex flex-col gap-1 border-b pb-4 mb-6">
            <h1 className="text-2xl font-black uppercase tracking-wide">Architectural Construction Proposal</h1>
            <p className="text-xs text-slate-500 font-medium">Generated via Interactive 3D Home Designer • Regional Cost Indexing: US Standard</p>
          </div>

          {/* Project Title and Quick Metadata Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 md:col-span-2 print:border-slate-300 print:bg-slate-50">
              <span className="text-[8px] uppercase font-bold text-indigo-400 tracking-widest font-mono">Project Name</span>
              <h3 className="text-base font-black text-slate-100 print:text-black mt-0.5">{project.name}</h3>
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-900 print:border-slate-300">
                <div>
                  <span className="text-[8px] uppercase font-bold text-slate-500 font-mono">Location rate</span>
                  <span className="block text-xs font-bold text-slate-300 print:text-slate-800 mt-0.5">{stateObj.name} (x{multiplier.toFixed(2)})</span>
                </div>
                <div>
                  <span className="text-[8px] uppercase font-bold text-slate-500 font-mono">Scale Standard</span>
                  <span className="block text-xs font-bold text-slate-300 print:text-slate-800 mt-0.5">
                    {useFeet ? 'Imperial: Footage / Feet (ft)' : 'Metric: Meters / Square Meters (m)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950/80 p-4 rounded-xl border border-indigo-500/10 flex flex-col justify-between print:border-slate-300 print:from-slate-100 print:to-slate-100">
              <div>
                <span className="text-[8px] uppercase font-bold text-indigo-400 tracking-widest font-mono">Grand Estimate</span>
                <span className="block text-2xl font-black text-indigo-300 print:text-black mt-1">${Math.round(grandTotal).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-900 print:border-slate-200 mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 print:text-slate-700">
                <span>Target: ${targetBudget.toLocaleString()}</span>
                <span className={grandTotal <= targetBudget ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {grandTotal <= targetBudget ? 'Under Target' : 'Over Target!'}
                </span>
              </div>
            </div>
          </div>

          {/* Core Construction Specifications */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono print:text-slate-800">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Structural Construction Specs</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 print:bg-slate-50 print:border-slate-200">
                <span className="text-[8px] uppercase text-slate-500 font-bold font-mono">Total Area</span>
                <span className="block text-sm font-black text-slate-200 print:text-black mt-1">
                  {useFeet ? `${Math.round(areaSqft).toLocaleString()} sq ft` : `${areaSqm.toFixed(1)} m²`}
                </span>
                <span className="block text-[9px] text-slate-500 font-mono mt-0.5">
                  {useFeet ? `${areaSqm.toFixed(1)} m²` : `${Math.round(areaSqft).toLocaleString()} sq ft`}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 print:bg-slate-50 print:border-slate-200">
                <span className="text-[8px] uppercase text-slate-500 font-bold font-mono">Foundation</span>
                <span className="block text-sm font-black text-slate-200 print:text-black mt-1 capitalize">{fType}</span>
                <span className="block text-[9px] text-slate-500 font-mono mt-0.5">${foundationRate.toFixed(2)} / sqft</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 print:bg-slate-50 print:border-slate-200">
                <span className="text-[8px] uppercase text-slate-500 font-bold font-mono">Siding Exterior</span>
                <span className="block text-sm font-black text-slate-200 print:text-black mt-1 capitalize">{sType}</span>
                <span className="block text-[9px] text-slate-500 font-mono mt-0.5">${sidingRate.toFixed(2)} / wall sqft</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 print:bg-slate-50 print:border-slate-200">
                <span className="text-[8px] uppercase text-slate-500 font-bold font-mono">Roof Structure</span>
                <span className="block text-sm font-black text-slate-200 print:text-black mt-1 capitalize">{rType}</span>
                <span className="block text-[9px] text-slate-500 font-mono mt-0.5">Pitch: {project.roofPitch ?? 0.35}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Budget Estimation Progress Section */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 print:bg-slate-50">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 font-mono print:text-black mb-3">Construction Cost Budget Comparison</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 print:text-slate-700">Estimated Cost: <span className="font-bold text-white print:text-black">${Math.round(grandTotal).toLocaleString()}</span></span>
                <span className="text-slate-400 print:text-slate-700">Target Budget: <span className="font-bold text-white print:text-black">${targetBudget.toLocaleString()}</span></span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 print:bg-slate-200 print:border-slate-300">
                <div 
                  className={`h-full ${
                    grandTotal <= targetBudget 
                      ? 'bg-emerald-500 print:bg-emerald-600' 
                      : 'bg-rose-500 print:bg-rose-600'
                  }`}
                  style={{ width: `${Math.min(100, (grandTotal / targetBudget) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>Ratio Index: {((grandTotal / targetBudget) * 100).toFixed(0)}%</span>
                {grandTotal <= targetBudget ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Project is within target budget limits</span>
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <span>${Math.round(grandTotal - targetBudget).toLocaleString()} over budget limit</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bill of Materials Cost Table */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono print:text-slate-800">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span>Estimated Bill of Materials (BOM)</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-850/80 bg-slate-950/40 print:border-slate-300 print:bg-white">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-850 print:bg-slate-100 print:text-black print:border-slate-300">
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Description</th>
                    <th className="px-4 py-2.5 text-right">Quantity</th>
                    <th className="px-4 py-2.5 text-right">Unit Rate</th>
                    <th className="px-4 py-2.5 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/50 print:divide-slate-200">
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-indigo-300 print:text-slate-800">Foundation</td>
                    <td className="px-4 py-2.5 capitalize">{fType} Slab Foundation</td>
                    <td className="px-4 py-2.5 text-right">{Math.round(areaSqft).toLocaleString()} sq ft</td>
                    <td className="px-4 py-2.5 text-right">${foundationRate.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-200 print:text-black">${Math.round(foundationCost).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-indigo-300 print:text-slate-800">Siding</td>
                    <td className="px-4 py-2.5 capitalize">{sType} Siding & Insulation</td>
                    <td className="px-4 py-2.5 text-right">{Math.round(totalWallAreaSqft).toLocaleString()} sq ft</td>
                    <td className="px-4 py-2.5 text-right">${sidingRate.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-200 print:text-black">${Math.round(sidingCost).toLocaleString()}</td>
                  </tr>
                  {rType !== 'none' && (
                    <tr>
                      <td className="px-4 py-2.5 font-bold text-indigo-300 print:text-slate-800">Roofing</td>
                      <td className="px-4 py-2.5 capitalize">{rType} Framing & Felt</td>
                      <td className="px-4 py-2.5 text-right">1 Lump</td>
                      <td className="px-4 py-2.5 text-right">${Math.round(roofCost).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-200 print:text-black">${Math.round(roofCost).toLocaleString()}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-indigo-300 print:text-slate-800">Flooring</td>
                    <td className="px-4 py-2.5 capitalize">{project.floorMaterial} Finishes</td>
                    <td className="px-4 py-2.5 text-right">{Math.round(areaSqft).toLocaleString()} sq ft</td>
                    <td className="px-4 py-2.5 text-right">${floorRate.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-200 print:text-black">${Math.round(flooringCost).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold text-indigo-300 print:text-slate-800">Labor</td>
                    <td className="px-4 py-2.5">Site Contractor Labor hours</td>
                    <td className="px-4 py-2.5 text-right">{Math.round(areaSqft).toLocaleString()} sq ft</td>
                    <td className="px-4 py-2.5 text-right">${laborRate.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-200 print:text-black">${Math.round(baseLaborCost).toLocaleString()}</td>
                  </tr>
                  {multiplier !== 1.0 && (
                    <tr className="text-slate-400 print:text-slate-600 bg-slate-950/10">
                      <td className="px-4 py-2.5 font-bold">Adjustment</td>
                      <td className="px-4 py-2.5">{stateObj.name} Cost index</td>
                      <td className="px-4 py-2.5 text-right">1 Factor</td>
                      <td className="px-4 py-2.5 text-right">x{multiplier.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold">${Math.round(localizedSubtotal - rawSubtotal).toLocaleString()}</td>
                    </tr>
                  )}
                  {project.furniture.length > 0 && (
                    <tr className="bg-slate-900/30 print:bg-slate-100/40 text-slate-300 print:text-black font-semibold">
                      <td className="px-4 py-2.5" colSpan={4}>Interior Furnishings & Decor Accent Inventory ({project.furniture.length} items)</td>
                      <td className="px-4 py-2.5 text-right">${Math.round(furnitureTotal).toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Furnishing Accent Items Breakdown (Lists itemized interior pieces) */}
          {project.furniture.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono print:text-slate-800">
                <ClipboardList className="w-4 h-4 text-indigo-400" />
                <span>Interior Sourced Accents Checklist</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:grid-cols-2">
                {project.furniture.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950 rounded-lg border border-slate-850 print:bg-white print:border-slate-200 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-indigo-400" />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-200 print:text-black">{item.name}</span>
                        <span className="text-[9px] text-slate-500 capitalize">{item.category} zone • {item.materialType}</span>
                      </div>
                    </div>
                    <span className="font-bold text-indigo-400 print:text-black">${getFurniturePrice(item.catalogId).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3 print:hidden shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer select-none"
          >
            Close Report
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer select-none flex items-center gap-1.5 shadow-md shadow-indigo-950/50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate PDF / Print</span>
          </button>
        </div>

      </div>
    </div>
  );
}
