/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CatalogItem } from '../types';

export const FURNITURE_CATALOG: CatalogItem[] = [
  // --- LIVING ROOM ---
  {
    id: 'sofa_modern',
    name: 'Modern 3-Seater Sofa',
    type: 'sofa',
    category: 'living',
    defaultScale: { x: 2.2, y: 0.8, z: 0.9 },
    defaultColor: '#4b5563', // Gray-600
    defaultMaterial: 'fabric',
    description: 'A comfortable, sleek modern three-seater fabric sofa.'
  },
  {
    id: 'armchair_cozy',
    name: 'Cozy Armchair',
    type: 'armchair',
    category: 'living',
    defaultScale: { x: 0.9, y: 0.8, z: 0.95 },
    defaultColor: '#d97706', // Amber-600
    defaultMaterial: 'fabric',
    description: 'A stylish and supportive lounge armchair.'
  },
  {
    id: 'coffee_table_wood',
    name: 'Wooden Coffee Table',
    type: 'coffee_table',
    category: 'living',
    defaultScale: { x: 1.2, y: 0.45, z: 0.7 },
    defaultColor: '#78350f', // Brown-900
    defaultMaterial: 'wood',
    description: 'Low-profile wooden coffee table with natural grain.'
  },
  {
    id: 'tv_stand_console',
    name: 'Media Center Console',
    type: 'tv_stand',
    category: 'living',
    defaultScale: { x: 1.8, y: 0.5, z: 0.45 },
    defaultColor: '#1f2937', // Gray-800
    defaultMaterial: 'wood',
    description: 'Low console table for media players and televisions.'
  },
  {
    id: 'rug_area',
    name: 'Geometric Area Rug',
    type: 'rug',
    category: 'living',
    defaultScale: { x: 3.0, y: 0.01, z: 2.0 },
    defaultColor: '#e5e7eb', // Gray-200
    defaultMaterial: 'fabric',
    description: 'Soft area rug to define your seating layout.'
  },
  {
    id: 'bookshelf_tall',
    name: 'Tall Bookshelf',
    type: 'bookshelf',
    category: 'living',
    defaultScale: { x: 1.0, y: 2.0, z: 0.35 },
    defaultColor: '#451a03', // Warm dark wood
    defaultMaterial: 'wood',
    description: 'Five-tier wooden bookshelf for storage and decorations.'
  },

  // --- BEDROOM ---
  {
    id: 'bed_king',
    name: 'King-Size Bed',
    type: 'bed',
    category: 'bedroom',
    defaultScale: { x: 2.0, y: 0.9, z: 2.1 },
    defaultColor: '#3b82f6', // Blue-500
    defaultMaterial: 'fabric',
    description: 'A plush king-size bed with a wood frame and headboard.'
  },
  {
    id: 'nightstand_wood',
    name: 'Bedside Nightstand',
    type: 'nightstand',
    category: 'bedroom',
    defaultScale: { x: 0.5, y: 0.55, z: 0.45 },
    defaultColor: '#b45309', // Amber-700
    defaultMaterial: 'wood',
    description: 'Compact bedside drawer unit.'
  },
  {
    id: 'wardrobe_closet',
    name: 'Double Wardrobe',
    type: 'wardrobe',
    category: 'bedroom',
    defaultScale: { x: 1.5, y: 2.1, z: 0.6 },
    defaultColor: '#d1fae5', // Light wood tone
    defaultMaterial: 'wood',
    description: 'Spacious dual-door clothes closet with chrome handles.'
  },
  {
    id: 'desk_office',
    name: 'Writing Desk',
    type: 'desk',
    category: 'bedroom',
    defaultScale: { x: 1.3, y: 0.75, z: 0.65 },
    defaultColor: '#374151', // Gray-700
    defaultMaterial: 'wood',
    description: 'Clean modern desk for home office and reading.'
  },
  {
    id: 'chair_office',
    name: 'Ergonomic Office Chair',
    type: 'desk_chair',
    category: 'bedroom',
    defaultScale: { x: 0.65, y: 0.95, z: 0.65 },
    defaultColor: '#0f172a', // Slate-900
    defaultMaterial: 'plastic',
    description: 'Mesh office chair with swivel and height adjustments.'
  },

  // --- KITCHEN / DINING ---
  {
    id: 'dining_table',
    name: 'Dining Table',
    type: 'dining_table',
    category: 'kitchen',
    defaultScale: { x: 1.6, y: 0.75, z: 0.9 },
    defaultColor: '#7c2d12', // Orange-900
    defaultMaterial: 'wood',
    description: 'Solid wood family dining table.'
  },
  {
    id: 'dining_chair',
    name: 'Dining Chair',
    type: 'dining_chair',
    category: 'kitchen',
    defaultScale: { x: 0.45, y: 0.9, z: 0.48 },
    defaultColor: '#f3f4f6', // Off-white
    defaultMaterial: 'wood',
    description: 'Matching dining chair with ergonomic back support.'
  },
  {
    id: 'fridge_modern',
    name: 'Stainless Steel Refrigerator',
    type: 'fridge',
    category: 'kitchen',
    defaultScale: { x: 0.9, y: 1.9, z: 0.8 },
    defaultColor: '#9ca3af', // Silver/Chrome
    defaultMaterial: 'metal',
    description: 'A modern double-door French refrigerator.'
  },
  {
    id: 'kitchen_island',
    name: 'Kitchen Counter Island',
    type: 'kitchen_island',
    category: 'kitchen',
    defaultScale: { x: 2.0, y: 0.9, z: 0.9 },
    defaultColor: '#111827', // Black core, stone top
    defaultMaterial: 'plastic',
    description: 'Kitchen preparation counter with storage cabinets below.'
  },

  // --- BATHROOM ---
  {
    id: 'bathtub_oval',
    name: 'Oval Bathtub',
    type: 'bathtub',
    category: 'bathroom',
    defaultScale: { x: 1.7, y: 0.6, z: 0.8 },
    defaultColor: '#ffffff', // White porcelain
    defaultMaterial: 'plastic',
    description: 'Freestanding luxury porcelain soaking tub.'
  },
  {
    id: 'toilet_porcelain',
    name: 'Compact Toilet',
    type: 'toilet',
    category: 'bathroom',
    defaultScale: { x: 0.5, y: 0.8, z: 0.7 },
    defaultColor: '#f9fafb',
    defaultMaterial: 'plastic',
    description: 'Sleek standard low-flow toilet unit.'
  },
  {
    id: 'bathroom_sink',
    name: 'Vanity Cabinet & Sink',
    type: 'bathroom_sink',
    category: 'bathroom',
    defaultScale: { x: 0.9, y: 0.85, z: 0.55 },
    defaultColor: '#374151', // Dark vanity base
    defaultMaterial: 'glass',
    description: 'Modern ceramic sink mounted on a wooden vanity storage cabinet.'
  },

  // --- FIXTURES (Doors & Windows) ---
  {
    id: 'fixture_door',
    name: 'Internal Door',
    type: 'door',
    category: 'fixtures',
    defaultScale: { x: 0.9, y: 2.1, z: 0.1 },
    defaultColor: '#d97706', // Golden brown wood
    defaultMaterial: 'wood',
    description: 'Standard single interior swing door panel.'
  },
  {
    id: 'fixture_window',
    name: 'Large Window',
    type: 'window',
    category: 'fixtures',
    defaultScale: { x: 1.5, y: 1.2, z: 0.15 },
    defaultColor: '#e0f2fe', // Glazed glass
    defaultMaterial: 'glass',
    description: 'Wide horizontal wall-mounted window for natural light.'
  },

  // --- DECOR & OUTDOOR ---
  {
    id: 'plant_house',
    name: 'Potted Monstera Plant',
    type: 'plant',
    category: 'decor',
    defaultScale: { x: 0.6, y: 1.0, z: 0.6 },
    defaultColor: '#15803d', // Green leaves
    defaultMaterial: 'plastic',
    description: 'Vibrant houseplant in a white ceramic cylinder pot.'
  },
  {
    id: 'lamp_floor',
    name: 'Minimalist Floor Lamp',
    type: 'lamp_floor',
    category: 'decor',
    defaultScale: { x: 0.4, y: 1.6, z: 0.4 },
    defaultColor: '#facc15', // Gold/Brass base and warm bulb
    defaultMaterial: 'metal',
    description: 'Elegant standing floor lamp with a linen fabric lampshade.'
  },
  {
    id: 'painting_canvas',
    name: 'Abstract Canvas Art',
    type: 'painting',
    category: 'decor',
    defaultScale: { x: 1.2, y: 0.8, z: 0.05 },
    defaultColor: '#ec4899', // Bright accent
    defaultMaterial: 'glass',
    description: 'Wall-mounted modern abstract painting canvas.'
  }
];

export function getCatalogItemById(id: string): CatalogItem | undefined {
  return FURNITURE_CATALOG.find(item => item.id === id);
}
