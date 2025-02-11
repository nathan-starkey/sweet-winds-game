import { SPRITE_HEIGHT, SPRITE_WIDTH } from "./utils";

const { min, max, floor } = Math;

export type DrawTileCallback = (ctx: CanvasRenderingContext2D, tileX: number, tileY: number, destX: number, destY: number) => void;

/**
 * Render an isometric tilemap to a canvas.
 * @param ctx The rendering context.
 * @param width The tilemap width.
 * @param height The tilemap height.
 * @param drawTile The callback to draw a tile.
 */
export function renderIsometricTilemap(ctx: CanvasRenderingContext2D, width: number, height: number, drawTile: DrawTileCallback) {
  // Set the canvas size
  ctx.canvas.width = (width + height) / 2 * SPRITE_WIDTH;
  ctx.canvas.height = (width + height + 2) / 4 * SPRITE_HEIGHT;

  // Debug fill color
  // ctx.fillStyle = "black";
  // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Iterate the tilemap
  for (let n = 0; n < width * height; ++n) {
    let x = n % width;
    let y = floor(n / width);

    // Draw the tile
    drawTile(ctx, x, y, (x - y + height - 1) / 2 * SPRITE_WIDTH, (x + y) / 4 * SPRITE_HEIGHT);
  }
}

/**
 * Render an isometric tilemap as an isometric row spritesheet.
 * @param ctx The rendering context.
 * @param width The tilemap width.
 * @param height The tilemap height.
 * @param drawTile The callback to draw a tile.
 */
export function renderIsometricRowSpritesheet(ctx: CanvasRenderingContext2D, width: number, height: number, drawTile: DrawTileCallback): void {
  // Determine the spritesheet dimensions
  let cols = min(width, height);
  let rows = max(width, height);

  // Set the canvas size
  ctx.canvas.width = cols * SPRITE_WIDTH;
  ctx.canvas.height = rows * SPRITE_HEIGHT;

  // Iterate the tilemap
  for (let n = 0; n < width * height; ++n) {
    let x = n % width;
    let y = floor(n / width);

    // Determine the row index
    let rowIndex = x + y;

    // Determine where to put the tile in the spritesheet
    let col = x - max(0, rowIndex - height + 1) + max(0, rowIndex - rows + 1);
    let row = (rowIndex) % rows;

    // Debug background fill
    // ctx.fillStyle = "hsl(" + (rowIndex / (width + height - 2) * 360) + "deg, 100%, 50%)";
    // ctx.fillRect(col * SPRITE_WIDTH, row * SPRITE_HEIGHT, SPRITE_WIDTH, SPRITE_HEIGHT);

    // Draw the tile
    drawTile(ctx, x, y, col * SPRITE_WIDTH, row * SPRITE_HEIGHT);
  }
}

/**
 * Draw an isometric tilemap from an isometric row spritesheet.
 * @param ctx The rendering context.
 * @param image The isometric row spritesheet canvas.
 * @param width The tilemap width.
 * @param height The tilemap height.
 */
export function* drawIsometricRowSpritesheet(ctx: CanvasRenderingContext2D, image: HTMLCanvasElement, width: number, height: number): Generator<void> {
  // Determine the spritesheet dimensions
  let cols = min(width, height);
  let rows = max(width, height);

  // Iterate each tile row
  for (let row = 0; row < width + height - 1; ++row) {
    // Determine the number of tiles in the row
    let count = row < rows ? min(row + 1, cols) : cols + rows - row - 1;

    // Determine the bounds of the row in the spritesheet
    let source = [max(0, row - rows + 1), row % rows, count, 1] as const;

    // Determine the bounds for where to draw the tile row
    let dest = [row < rows ?
      (row < height ? (row + 1) / -2 : (row + 1) / 2 - cols) :
      (height > width ? (row + 1) / 2 - rows : (row + cols + 1) / 2 - cols * 1.5),
      (row - 2) / 4, source[2], source[3]] as const;

    // Debug background fill
    // ctx.fillStyle = "hsl(" + (row / (width + height - 2) * 360) + "deg, 100%, 50%)";
    // ctx.fillRect(dest[0] * SPRITE_WIDTH, dest[1] * SPRITE_HEIGHT, dest[2] * SPRITE_WIDTH, dest[3] * SPRITE_HEIGHT);

    // Draw the tile row
    ctx.drawImage(image, source[0] * SPRITE_WIDTH, source[1] * SPRITE_HEIGHT, source[2] * SPRITE_WIDTH, source[3] * SPRITE_HEIGHT, dest[0] * SPRITE_WIDTH, dest[1] * SPRITE_HEIGHT, dest[2] * SPRITE_WIDTH, dest[3] * SPRITE_HEIGHT);

    yield;
  }
}