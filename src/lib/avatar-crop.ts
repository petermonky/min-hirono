export type Crop = { x: number; y: number; zoom: number };
export type Point = { x: number; y: number };
type ImageSize = { naturalWidth: number; naturalHeight: number };
type Frame = { left: number; top: number; width: number; height: number };

export function constrain(crop: Crop, image: ImageSize): Crop {
  const zoom = Math.max(1, Math.min(4, crop.zoom));
  const side = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
  const halfX = side / (2 * image.naturalWidth);
  const halfY = side / (2 * image.naturalHeight);
  return { zoom, x: Math.max(halfX, Math.min(1 - halfX, crop.x)), y: Math.max(halfY, Math.min(1 - halfY, crop.y)) };
}

export function pinchCrop(crop: Crop, previous: [Point, Point], next: [Point, Point], frame: Frame, image: ImageSize): Crop {
  const distance = (points: [Point, Point]) => Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
  const previousDistance = distance(previous);
  if (previousDistance < 1 || frame.width <= 0 || frame.height <= 0) return crop;
  const zoom = Math.max(1, Math.min(4, crop.zoom * distance(next) / previousDistance));
  const oldSide = Math.min(image.naturalWidth, image.naturalHeight) / crop.zoom;
  const newSide = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
  const midpoint = (points: [Point, Point]) => ({
    x: ((points[0].x + points[1].x) / 2 - frame.left) / frame.width - 0.5,
    y: ((points[0].y + points[1].y) / 2 - frame.top) / frame.height - 0.5,
  });
  const before = midpoint(previous);
  const after = midpoint(next);
  // Keep the image point under the gesture midpoint anchored as fingers move.
  return constrain({
    zoom,
    x: crop.x + (before.x * oldSide - after.x * newSide) / image.naturalWidth,
    y: crop.y + (before.y * oldSide - after.y * newSide) / image.naturalHeight,
  }, image);
}
