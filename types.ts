
export type Unit = 'in' | 'mm';

export enum BowlType {
  OVAL = 'oval',
  GOURD = 'gourd',
  LADLE = 'ladle',
  ROUND = 'round',
  POINTED = 'pointed'
}

export interface SpoonParameters {
  // Bowl
  bowlWidth: number;
  bowlLength: number;
  bowlRadius: number;
  bowlAsymmetry: number;
  bowlType: BowlType;
  
  // Neck
  neckLength: number;
  neckWidth: number;
  neckCurve: number;
  
  // Handle
  handleLength: number;
  handleShoulderWidth: number;
  handleMidWidth: number;
  handleEndWidth: number;
  handleAsymmetry: number;
  
  // Crank & Global
  crankAngle: number;
  crankOffset: number;
  totalRotation: number;
  
  // Settings
  units: Unit;
  showGrid: boolean;
  gridSnap: boolean;
  symmetry: boolean;
  darkMode: boolean;
}

export const DEFAULT_PARAMETERS: SpoonParameters = {
  bowlWidth: 1.8,
  bowlLength: 2.5,
  bowlRadius: 0.5,
  bowlAsymmetry: 0,
  bowlType: BowlType.OVAL,
  
  neckLength: 0.8,
  neckWidth: 0.6,
  neckCurve: 0,
  
  handleLength: 5.0,
  handleShoulderWidth: 0.7,
  handleMidWidth: 0.6,
  handleEndWidth: 0.8,
  handleAsymmetry: 0,
  
  crankAngle: 0,
  crankOffset: 0,
  totalRotation: 0,
  
  units: 'in',
  showGrid: true,
  gridSnap: false,
  symmetry: true,
  darkMode: false,
};
