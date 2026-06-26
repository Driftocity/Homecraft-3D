/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export type FloorMaterial = 'hardwood' | 'carpet' | 'marble' | 'tile' | 'concrete';

export type FurnitureMaterial = 'wood' | 'fabric' | 'metal' | 'plastic' | 'glass';

export interface Wall {
  id: string;
  p1: Point2D;
  p2: Point2D;
  height: number;
  thickness: number;
  color: string;
}

export interface Furniture {
  id: string;
  catalogId: string;
  name: string;
  type: string;
  position: Point3D;
  rotation: number; // in radians around Y axis
  scale: Point3D;
  color: string;
  materialType: FurnitureMaterial;
  category: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  type: string;
  category: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'decor' | 'fixtures';
  defaultScale: Point3D;
  defaultColor: string;
  defaultMaterial: FurnitureMaterial;
  description: string;
}

export interface HomeProject {
  id: string;
  name: string;
  floorMaterial: FloorMaterial;
  floorColor: string;
  walls: Wall[];
  furniture: Furniture[];
  dimensions: {
    width: number; // in meters (e.g. 15)
    length: number; // in meters (e.g. 15)
  };
}

export interface AILayoutResponse {
  projectName: string;
  floorMaterial: FloorMaterial;
  floorColor: string;
  walls: Array<{
    p1: Point2D;
    p2: Point2D;
    color?: string;
  }>;
  furniture: Array<{
    catalogId: string;
    position: Point3D;
    rotation?: number;
    color?: string;
  }>;
}
