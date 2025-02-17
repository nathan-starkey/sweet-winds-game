import { IReadonlyTilemap } from "./tilemap";

/** Get the size of a packed tilemap sprite sheet. */
export function getPackedTilemapSize(tilemapWidth: number, tilemapHeight: number, scale: number = 1, scaleY: number = scale): [sheetCols: number, sheetRows: number] {
  let sheetCols = Math.min(tilemapWidth, tilemapHeight);
  let sheetRows = Math.max(tilemapWidth, tilemapHeight);

  return [sheetCols * scale, sheetRows * scaleY];
}

/** Get the sprite sheet coord to store a tile in a packed tilemap sprite sheet. */
export function getPackedTilemapCoord(tilemapWidth: number, tilemapHeight: number, tileX: number, tileY: number, scale: number = 1, scaleY: number = scale): [spriteCol: number, spriteRow: number] {
  // The index of the diagonal tilemap row
  let diagonalIndex = tileX + tileY;

  // The number of rows in the spritesheet
  let sheetRows = Math.max(tilemapWidth, tilemapHeight);

  // Offset for when the rows no longer start at 0
  let offset = Math.min(0, tilemapHeight - diagonalIndex - 1)

  // Offset for when the rows wrap around to the top of the sprite sheet
  let offsetOverflow = Math.max(0, diagonalIndex + 1 - sheetRows);

  // The coords of the tile in the spritesheet
  let spriteCol = tileX + offset + offsetOverflow;
  let spriteRow = diagonalIndex % sheetRows;

  return [spriteCol * scale, spriteRow * scaleY];
}

/** Get the bounds and offset of a tile row stored in a packed tilemap sprite sheet. */
export function getPackedTilemapRow(tilemapWidth: number, tilemapHeight: number, diagonalIndex: number, scale: number = 1, scaleY: number = scale): [startX: number, startY: number, spanX: number, spanY: number, offsetX: number, offsetY: number] {
  // The number of cols and rows in the spritesheet
  let sheetCols = Math.min(tilemapWidth, tilemapHeight);
  let sheetRows = Math.max(tilemapWidth, tilemapHeight);

  // The length of the current diagonal row
  let rowLength = diagonalIndex < sheetRows ? Math.min(diagonalIndex + 1, sheetCols) : sheetCols + sheetRows - diagonalIndex - 1;

  // The start of the row in the sprite sheet
  let startX = Math.max(0, diagonalIndex - sheetRows + 1);
  let startY = diagonalIndex % sheetRows;

  // The size of the row in the sprite sheet
  let spanX = rowLength;
  let spanY = 1;

  // The offset used to draw the row
  let offsetX = diagonalIndex < sheetRows ? (diagonalIndex < tilemapHeight ? (diagonalIndex + 1) / -2 : (diagonalIndex + 1) / 2 - sheetCols) : (tilemapHeight > tilemapWidth ? (diagonalIndex + 1) / 2 - sheetRows : (diagonalIndex + sheetCols + 1) / 2 - sheetCols * 1.5);
  let offsetY = (diagonalIndex - 2) / 4;

  return [startX * scale, startY * scaleY, spanX * scale, spanY * scaleY, offsetX * scale, offsetY * scaleY];
}

/** Render a packed tilemap sprite sheet to the canvas. */
export function renderPackedTilemap(tilemap: IReadonlyTilemap, context: CanvasRenderingContext2D, callback: (tilemap: IReadonlyTilemap, context: CanvasRenderingContext2D, tileX: number, tileY: number, destX: number, destY: number, scaleX: number, scaleY: number) => void, scale: number = 1, scaleY: number = scale) {
  // Set the canvas size
  let [sizeX, sizeY] = getPackedTilemapSize(tilemap.width, tilemap.height, scale, scaleY);

  context.canvas.width = sizeX;
  context.canvas.height = sizeY;

  // Iterate the tiles
  for (let n = 0; n < tilemap.width * tilemap.height; ++n) {
    let tileX = n % tilemap.width;
    let tileY = Math.floor(n / tilemap.width);

    // Call the calback at each tile
    let [destX, destY] = getPackedTilemapCoord(tilemap.width, tilemap.height, tileX, tileY, scale, scaleY);

    callback(tilemap, context, tileX, tileY, destX, destY, scale, scaleY);
  }
}

/** Render an isometric tilemap to the canvas. */
export function renderIsoTilemap(tilemap: IReadonlyTilemap, context: CanvasRenderingContext2D, callback: (tilemap: IReadonlyTilemap, context: CanvasRenderingContext2D, tileX: number, tileY: number, destX: number, destY: number, scaleX: number, scaleY: number) => void, scale: number = 1, scaleY: number = scale) {
  // Set the canvas size
  let sizeX = (tilemap.width + tilemap.height) / 2 * scale;
  let sizeY = (tilemap.width + tilemap.height + 2) / 4 * scaleY;

  context.canvas.width = sizeX;
  context.canvas.height = sizeY;

  // Iterate the tiles
  for (let n = 0; n < tilemap.width * tilemap.height; ++n) {
    let tileX = n % tilemap.width;
    let tileY = Math.floor(n / tilemap.width);

    // Call the callback at each tile
    let destX = (tileX - tileY + tilemap.height - 1) / 2 * scale;
    let destY = (tileX + tileY) / 4 * scaleY;

    callback(tilemap, context, tileX, tileY, destX, destY, scale, scaleY);
  }
}

/** Draw a single row from a packed tilemap sprite sheet. */
export function drawPackedTilemapRow(context: CanvasRenderingContext2D, sheet: HTMLCanvasElement, tilemapWidth: number, tilemapHeight: number, diagonalIndex: number, scale: number = 1, scaleY: number = scale): void {
  let [startX, startY, spanX, spanY, offsetX, offsetY] = getPackedTilemapRow(tilemapWidth, tilemapHeight, diagonalIndex, scale, scaleY);

  context.drawImage(sheet, startX, startY, spanX, spanY, offsetX, offsetY, spanX, spanY);
}

/** Draw each row in sequence, allowing objects to be drawn between each row. */
export function* drawPackedTilemap(context: CanvasRenderingContext2D, sheet: HTMLCanvasElement, tilemapWidth: number, tilemapHeight: number, scale: number = 1, scaleY: number = scale): Generator<number> {
  // Iterate each diagonal tilemap row
  let diagonalCount = tilemapWidth + tilemapHeight - 1;

  for (let diagonalIndex = 0; diagonalIndex < diagonalCount; ++diagonalIndex) {
    // Yield so the user can compare and draw objects before the row
    yield diagonalIndex + 1;

    // Draw the row
    drawPackedTilemapRow(context, sheet, tilemapWidth, tilemapHeight, diagonalIndex, scale, scaleY);
  }

  // Yield so the user can draw the remaining objects
  yield Infinity;
}