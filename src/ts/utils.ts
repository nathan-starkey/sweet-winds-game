export const SPRITE_WIDTH = 36;
export const SPRITE_HEIGHT = 36;

const { abs, sign } = Math;

type Tuple2<T> = [T, T];

export const toOrtho = (function () {
  let m00 = 1;
  let m01 = 0.5;
  let m10 = -1;
  let m11 = 0.5;

  return (x: number, y: number) => [
    x * m00 + y * m10,
    x * m01 + y * m11
  ] as Tuple2<number>;
} ());

export const toIso = (function () {
  let m00 = 0.5;
  let m01 = -0.5;
  let m10 = 1;
  let m11 = 1;

  return (x: number, y: number) => [
    x * m00 + y * m10,
    x * m01 + y * m11
  ] as Tuple2<number>;
} ());

export const toWorld = (function () {
  let m00 = SPRITE_WIDTH / 2;
  let m01 = SPRITE_HEIGHT / 4;
  let m10 = SPRITE_WIDTH / -2;
  let m11 = SPRITE_HEIGHT / 4;

  return (x: number, y: number) => [
    x * m00 + y * m10,
    x * m01 + y * m11
  ] as Tuple2<number>;
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

//@ts-expect-error
window.vector = vector;