import { Entity } from "./entity";
import { drawIsometricRowSpritesheet, DrawTileCallback, renderIsometricRowSpritesheet, renderIsometricTilemap } from "./isometric-rendering-engine";
import { toScreenSpace } from "./math";
import { Tilemap } from "./tilemap";

declare let tileFloor: HTMLImageElement;
declare let tileBlock: HTMLImageElement;

const SPRITE_WIDTH = 36;
const SPRITE_HEIGHT = 36;
const NO_TILEMAP = new Tilemap(0, 0);

function createCanvasRenderingContext2D() {
  return document.createElement("canvas").getContext("2d")!;
}

function drawBgTile(tilemap: Tilemap, ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number) {
  let tile = tilemap.at(x, y);

  if (tile == 0) {
    ctx.drawImage(tileFloor, dx, dy + 17);
  }
}

function drawFgTile(tilemap: Tilemap, ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number) {
  let tile = tilemap.at(x, y);

  if (tile == 1) {
    ctx.drawImage(tileBlock, dx, dy, SPRITE_WIDTH, SPRITE_HEIGHT)
  }
}

export class Sandbox {
  private tilemap = NO_TILEMAP;
  private tilemapBg = createCanvasRenderingContext2D();
  private tilemapFg = createCanvasRenderingContext2D();
  private entities: Entity[] = [];

  /** Set the current tilemap and render it. */
  public setTilemap(tilemap: Tilemap | null): void {
    this.tilemap = tilemap || NO_TILEMAP;

    if (tilemap) {
      renderIsometricTilemap(this.tilemapBg, tilemap.width, tilemap.height, drawBgTile.bind(null, tilemap));
      renderIsometricRowSpritesheet(this.tilemapFg, tilemap.width, tilemap.height, drawFgTile.bind(null, tilemap));
    }
  }

  /** Add an entity to the sandbox. */
  public addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  /** Draw the sandbox to a rendering context. */
  public draw(ctx: CanvasRenderingContext2D): void {
    // Sort the entities by their percieved depth
    let entities = [...this.entities].sort((a, b) => a.x + a.y > b.x + b.y ? 1 : -1);

    // Move the scene toward the targeted entity
    let target = entities[0];

    ctx.translate((target.x - target.y) * SPRITE_WIDTH / -2, (target.x + target.y) * SPRITE_HEIGHT / -4);

    // Draw the tilemap background
    let hasTilemap = this.tilemap != NO_TILEMAP;

    if (hasTilemap) {
      ctx.drawImage(this.tilemapBg.canvas, SPRITE_WIDTH * this.tilemap.height / -2, SPRITE_HEIGHT / -2);
    }

    // Draw the tilemap foreground and entities
    let rowIndex = 0;
    let entity = entities.pop();

    for (let o of drawIsometricRowSpritesheet(ctx, this.tilemapFg.canvas, this.tilemap.width, this.tilemap.height)) {
      // Draw all entities with further depth than the current tilemap row
      while (entity && entity.x + entity.y - 2 < rowIndex) {
        ctx.save();
        ctx.scale(SPRITE_WIDTH / 2, SPRITE_HEIGHT / 2);
        entity.draw(ctx);
        ctx.restore();

        entity = entities.pop();
      }

      ++rowIndex;
    }

    // Draw the remaining entities
    while (entities.length) entities.pop()!.draw(ctx);

    // Debug
    ctx.resetTransform();
    ctx.scale(0.25, 0.25);
    ctx.drawImage(this.tilemapFg.canvas, 0, 0);
  }
}