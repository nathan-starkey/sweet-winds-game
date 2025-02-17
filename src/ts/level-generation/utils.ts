import { vector } from "../utils";

const { hypot, round } = Math;

/** Paint a circle on the given tilemap. */
export function* circle(midX: number, midY: number, radiusX: number, radiusY = radiusX): Generator<[x: number, y: number]> {
  for (let j = -radiusY; j <= radiusY; ++j) {
    for (let i = -radiusX; i <= radiusX; ++i) {
      let x = midX + i;
      let y = midY + j;

      let dx = x - midX;
      let dy = y - midY;
      let d = hypot(dx / radiusX, dy / radiusY);

      if (d < 1) {
        yield [x, y];
      }
    }
  }
}

/** Paint a line on the given tilemap. */
export function* line(x0: number, y0: number, x1: number, y1: number, radius: number = 1): Generator<[x: number, y: number]> {
  let dx = x1 - x0;
  let dy = y1 - y0;

  for (let [x, y] of vector(dx, dy)) {
    x = round(x0 + x);
    y = round(y0 + y);

    for (let j = -radius; j <= radius; ++j) {
      for (let i = -radius; i <= radius; ++i) {
        yield [x + i, y + j];
      }
    }
  }
}