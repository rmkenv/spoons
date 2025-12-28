
import { SpoonParameters, BowlType } from '../types';

export interface Point {
  x: number;
  y: number;
}

const rotatePoint = (p: Point, angleDeg: number, origin: Point): Point => {
  const angleRad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos,
  };
};

export const generateSpoonPath = (params: SpoonParameters): string => {
  const {
    bowlWidth, bowlLength, bowlType,
    neckLength, neckWidth,
    handleLength, handleShoulderWidth, handleMidWidth, handleEndWidth,
    symmetry, crankAngle, crankOffset
  } = params;

  const halfBW = bowlWidth / 2;
  const halfNW = neckWidth / 2;
  const halfHSW = handleShoulderWidth / 2;
  const halfHMW = handleMidWidth / 2;
  const halfHEW = handleEndWidth / 2;

  // Bowl stays centered
  // Handle start at y=0, shifted by crankOffset
  const pivot: Point = { x: crankOffset, y: 0 };
  
  // Points for right side of handle/neck (relative to pivot and then rotated)
  const getHandlePoints = (side: number) => {
    const points = [
      { x: pivot.x + side * halfHSW, y: 0 },
      { x: pivot.x + side * halfNW, y: -neckLength },
      { x: pivot.x + side * halfHMW, y: -neckLength - handleLength * 0.5 },
      { x: pivot.x + side * halfHEW, y: -neckLength - handleLength },
    ];
    return points.map(p => rotatePoint(p, side * crankAngle, pivot));
  };

  const rightHandle = getHandlePoints(1);
  const leftHandle = getHandlePoints(-1);

  // Bowl points (independent of crank for 2D template baseline)
  const bowlRight = [
    { x: 0, y: bowlLength }, // Tip
    { x: halfBW, y: bowlLength * 0.5 }, // Wide
    { x: halfHSW, y: 0 } // Shoulder
  ];
  
  const bowlLeft = [
    { x: -halfHSW, y: 0 },
    { x: -halfBW, y: bowlLength * 0.5 },
    { x: 0, y: bowlLength }
  ];

  // Construction of the SVG path
  // Start at bowl tip
  let path = `M 0,${bowlLength} `;
  
  // Bowl Rim Right
  path += `C ${halfBW},${bowlLength} ${halfBW},${bowlLength * 0.7} ${halfBW},${bowlLength * 0.5} `;
  path += `C ${halfBW},${bowlLength * 0.3} ${halfHSW * 1.2},0.1 ${rightHandle[0].x},${rightHandle[0].y} `;

  // Neck & Handle Right
  path += `L ${rightHandle[1].x},${rightHandle[1].y} `;
  path += `L ${rightHandle[2].x},${rightHandle[2].y} `;
  path += `L ${rightHandle[3].x},${rightHandle[3].y} `;

  // Handle Bottom Curve
  const endWidth = Math.sqrt(Math.pow(rightHandle[3].x - leftHandle[3].x, 2) + Math.pow(rightHandle[3].y - leftHandle[3].y, 2));
  path += `A ${endWidth/2},${endWidth/4} ${crankAngle} 0 0 1 ${leftHandle[3].x},${leftHandle[3].y} `;

  // Handle & Neck Left
  path += `L ${leftHandle[2].x},${leftHandle[2].y} `;
  path += `L ${leftHandle[1].x},${leftHandle[1].y} `;
  path += `L ${leftHandle[0].x},${leftHandle[0].y} `;

  // Bowl Rim Left
  path += `C ${-halfHSW * 1.2},0.1 ${-halfBW},${bowlLength * 0.3} ${-halfBW},${bowlLength * 0.5} `;
  path += `C ${-halfBW},${bowlLength * 0.7} ${-halfBW},${bowlLength} 0,${bowlLength} Z`;

  return path;
};

export const getDimensions = (params: SpoonParameters) => {
  const width = Math.max(params.bowlWidth, params.handleEndWidth * 2);
  const height = params.bowlLength + params.neckLength + params.handleLength;
  return { width, height };
};
