type Tuple2<T> = [T, T];

export const toScreenSpace = (function () {
  let m00 = 1;
  let m01 = 0.5;
  let m10 = -1;
  let m11 = 0.5;

  return (x: number, y: number) => [
    x * m00 + y * m10,
    x * m01 + y * m11
  ] as Tuple2<number>;
} ());

export const fromScreenSpace = (function () {
  let m00 = 0.5;
  let m01 = -0.5;
  let m10 = 1;
  let m11 = 1;

  return (x: number, y: number) => [
    x * m00 + y * m10,
    x * m01 + y * m11
  ] as Tuple2<number>;
} ());