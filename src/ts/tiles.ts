import { Tilemap } from "./tilemap/tilemap";
import { SPRITE_HEIGHT, SPRITE_WIDTH } from "./utils";

// Debug image declaration
declare let tileFloor: HTMLImageElement;

/** Function that renders a tile. */
type TileRenderFn = (tilemap: Tilemap, ctx: CanvasRenderingContext2D, tile: TileData, tileX: number, tileY: number, destX: number, destY: number) => void;

/** Properties of a given tile. */
type TileData = {
  isSolid: boolean;
  isOpaque: boolean;
  image: HTMLImageElement;
  renderFg?: TileRenderFn;
  renderBg?: TileRenderFn;
};

/** A map of tile properties by the tile's numeric id. */
export const TILES: Record<string, TileData> = {};

TILES[0] = {
  isSolid: false,
  isOpaque: false,
  image: tileFloor,
  renderBg: renderStaticImage
};

TILES[1] = {
  isSolid: true,
  isOpaque: true,
  image: document.getElementById("img-tile-grass-wall") as HTMLImageElement,
  renderFg: renderDynamicWall
};

TILES[2] = {
  isSolid: true,
  isOpaque: true,
  image: document.getElementById("img-tile-debug") as HTMLImageElement,
  renderFg: renderDynamicWall
};

/** Get a tile by its position. */
function getTile(tilemap: Tilemap, x: number, y: number): TileData {
  let index = tilemap.at(x, y, 1);
  let tile = TILES[index] || TILES[0];

  return tile;
}

/** Determine if the tile at a position is opaque. */
function isOpaque(tilemap: Tilemap, x: number, y: number): boolean {
  return getTile(tilemap, x, y).isOpaque;
}

/** Render a tile as a static image. */
function renderStaticImage(tilemap: Tilemap, ctx: CanvasRenderingContext2D, tile: TileData, tileX: number, tileY: number, destX: number, destY: number): void {
  ctx.drawImage(tile.image, destX, destY, SPRITE_WIDTH, SPRITE_HEIGHT);
}

/** Render a tile using the "dynamic wall" spritesheet layout. */
function renderDynamicWall(tilemap: Tilemap, ctx: CanvasRenderingContext2D, tile: TileData, tileX: number, tileY: number, destX: number, destY: number): void {
  // a-h represent the surrounding tiles:
  let a = isOpaque(tilemap, tileX - 1, tileY - 1);
  let b = isOpaque(tilemap, tileX    , tileY - 1);
  let c = isOpaque(tilemap, tileX + 1, tileY - 1);
  let d = isOpaque(tilemap, tileX - 1, tileY    );
  let e = isOpaque(tilemap, tileX + 1, tileY    );
  let f = isOpaque(tilemap, tileX - 1, tileY + 1);
  let g = isOpaque(tilemap, tileX    , tileY + 1);
  let h = isOpaque(tilemap, tileX + 1, tileY + 1);

  // Skip drawing the tile if it is surrounded by solid tiles.
  if (a && b && c && d && e && f && g && h) return;

  /**
   * This spritesheet uses the following layout:
   *
   * - x x x -
   * Y Z Z Z X
   * Y Z Z Z X
   * Y Z Z Z X
   * - y y y -
   *
   * Where x/y/z represent varations of each respective face, with capital and
   * lowercase characters representing positive and negative facing faces
   * respectively.
   */

  let image = tile.image;
  let sx: number, sy: number;

  // Draw the positive z face
  sx = (SPRITE_WIDTH + 1) * (1 + (tileX % 3));
  sy = (SPRITE_HEIGHT + 1) * (1 + (tileY % 3));

  ctx.drawImage(image, sx, sy, SPRITE_WIDTH, SPRITE_HEIGHT, destX, destY, SPRITE_WIDTH, SPRITE_HEIGHT);

  // Draw the negative x face
  if (!d) {
    sx = (SPRITE_WIDTH + 1) * (1 + (tileY % 3));
    sy = 0;

    ctx.drawImage(image, sx, sy, SPRITE_WIDTH, SPRITE_HEIGHT, destX, destY, SPRITE_WIDTH, SPRITE_HEIGHT);
  }

  // Draw the negative y face
  if (!b) {
    sx = (SPRITE_WIDTH + 1) * (1 + (tileX % 3));
    sy = (SPRITE_HEIGHT + 1) * 4;

    ctx.drawImage(image, sx, sy, SPRITE_WIDTH, SPRITE_HEIGHT, destX, destY, SPRITE_WIDTH, SPRITE_HEIGHT);
  }

  // Draw the positive x face
  if (!e) {
    sx = (SPRITE_WIDTH + 1) * 4;
    sy = (SPRITE_HEIGHT + 1) * (1 + (tileY % 3));

    ctx.drawImage(image, sx, sy, SPRITE_WIDTH, SPRITE_HEIGHT, destX, destY, SPRITE_WIDTH, SPRITE_HEIGHT);
  }

  // Draw the positive y face
  if (!g) {
    sx = 0;
    sy = (SPRITE_HEIGHT + 1) * (1 + (tileX % 3));

    ctx.drawImage(image, sx, sy, SPRITE_WIDTH, SPRITE_HEIGHT, destX, destY, SPRITE_WIDTH, SPRITE_HEIGHT);
  }
}

/** Render a tile to the foreground canvas. */
export function renderTileFg(tilemap: Tilemap, ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number): void {
  let index = tilemap.at(x, y);
  let tile = TILES[index];

  tile.renderFg?.(tilemap, ctx, tile, x, y, dx, dy);
}

/** Render a tile to the background canvas. */
export function renderTileBg(tilemap: Tilemap, ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number): void {
  let index = tilemap.at(x, y);
  let tile = TILES[index];

  tile.renderBg?.(tilemap, ctx, tile, x, y, dx, dy);
}