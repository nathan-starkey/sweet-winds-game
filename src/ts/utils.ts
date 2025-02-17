export const SPRITE_WIDTH = 36;
export const SPRITE_HEIGHT = 36;

const { abs, floor, random, sign } = Math;

export type Vec2 = [x: number, y: number];

/** Convert an isometric coordinate to an orthogonal coordinate. */
export const toOrtho = (function () {
  let m00 = 1;
  let m01 = 0.5;
  let m10 = -1;
  let m11 = 0.5;

  return (x: number, y: number): Vec2 => [
    x * m00 + y * m10,
    x * m01 + y * m11
  ];
} ());

/** Convert an orthogonal coordinate to an isometric coordinate. */
export const toIso = (function () {
  let m00 = 0.5;
  let m01 = -0.5;
  let m10 = 1;
  let m11 = 1;

  return (x: number, y: number): Vec2 => [
    x * m00 + y * m10,
    x * m01 + y * m11
  ];
} ());

/** Convert a world coordinate to a screen-space coordinate.*/
export const toScreen = (function () {
  let m00 = SPRITE_WIDTH / 2;
  let m01 = SPRITE_HEIGHT / 4;
  let m10 = SPRITE_WIDTH / -2;
  let m11 = SPRITE_HEIGHT / 4;

  return (x: number, y: number): Vec2 => [
    x * m00 + y * m10,
    x * m01 + y * m11
  ];
} ());

/** Yield points on a vector at fixed intervals determined by the gradient. */
export function* vector(run: number, rise: number): Generator<[x: number, y: number]> {
  let swap = abs(rise) > abs(run);

  if (swap) [run, rise] = [rise, run];

  let gradient = rise / abs(run);
  let direction = sign(run);
  let length = abs(run);

  for (let i = 0; i <= length; ++i) {
    let x = i * direction;
    let y = i * gradient;

    yield swap ? [y, x] : [x, y];
  }
}

/** Generate a random integer from 'min' to 'max' inclusive. */
export function randomInt(min: number, max: number): number {
  return min + floor(random() * (max - min + 1));
}