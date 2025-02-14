export interface GridConfig {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  showGrid: boolean
}

export interface Point {
  x: number
  y: number
}

export const toCanvasX = (
  x: number,
  gridConfig: GridConfig,
  scale: number,
  padding: number
) => {
  return (x - gridConfig.xMin) * scale + padding
}

export const toCanvasY = (
  y: number,
  gridConfig: GridConfig,
  scale: number,
  padding: number,
  canvasHeight: number
) => {
  return canvasHeight - ((y - gridConfig.yMin) * scale + padding)
}

export const toGridX = (
  canvasX: number,
  gridConfig: GridConfig,
  scale: number,
  padding: number
) => {
  return ((canvasX - padding) / scale) + gridConfig.xMin
}

export const toGridY = (
  canvasY: number,
  gridConfig: GridConfig,
  scale: number,
  padding: number,
  canvasHeight: number
) => {
  return ((canvasHeight - canvasY - padding) / scale) + gridConfig.yMin
}

export const snapToGrid = (value: number): number => {
  const gridInterval = 0.5
  return Math.round(value / gridInterval) * gridInterval
}

export const isPointNearby = (p1: Point, p2: Point, threshold = 0.1): boolean => {
  return Math.abs(p1.x - p2.x) <= threshold && Math.abs(p1.y - p2.y) <= threshold
}

export const arePointsEqual = (points1: Point[], points2: Point[]): boolean => {
  if (points1.length !== points2.length) return false
  
  return points2.every(p2 => 
    points1.some(p1 => isPointNearby(p1, p2))
  )
}

export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  ctx.clearRect(x, y, width, height)
}
