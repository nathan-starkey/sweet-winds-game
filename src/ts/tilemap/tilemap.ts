export interface IReadonlyTilemap {
  readonly data: readonly number[];
  readonly width: number;
  readonly height: number;

  has(x: number, y: number): boolean;

  at(x: number, y: number, fallback?: number): number;
}

export interface ITilemap extends IReadonlyTilemap {
  data: number[];

  put(x: number, y: number, value: number): void;
}

export class Tilemap implements ITilemap {
  public data: number[];

  constructor(
    public readonly width: number,
    public readonly height: number
  ) {
    this.data = new Array(width * height).fill(0);
  }

  public has(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  public at(x: number, y: number, fallback: number = 0): number {
    return this.has(x, y) ? this.data[x + y * this.width] : fallback;
  }

  public put(x: number, y: number, value: number): void {
    if (this.has(x, y)) {
      this.data[x + y * this.width] = value;
    }
  }
}