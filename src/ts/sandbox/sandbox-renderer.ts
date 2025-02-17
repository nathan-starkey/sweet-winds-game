import { renderIsoTilemap, renderPackedTilemap, drawPackedTilemap } from "../tilemap/packed-tilemap";
import { Tilemap, IReadonlyTilemap } from "../tilemap/tilemap";
import { renderTileBg, renderTileFg } from "../tiles";
import { Sandbox } from "./sandbox";

/** Create a canvas rendering context. */
function createContext() {
  return document.createElement("canvas").getContext("2d")!;
}

export class SandboxRenderer {
  private tilemap: Tilemap | null = null;
  private background = createContext();
  private foreground = createContext();

  constructor(
    private readonly SPRITE_WIDTH: number,
    private readonly SPRITE_HEIGHT: number
  ) {}
  /** Render the tilemap. */
  private renderTilemap(): void {
    if (!this.tilemap) return;

    // DEBUG: Please fix this
    let callback1 = (tilemap: IReadonlyTilemap, context: CanvasRenderingContext2D, tileX: number, tileY: number, destX: number, destY: number) => renderTileBg(tilemap as Tilemap, context, tileX, tileY, destX, destY);
    let callback2 = (tilemap: IReadonlyTilemap, context: CanvasRenderingContext2D, tileX: number, tileY: number, destX: number, destY: number) => renderTileFg(tilemap as Tilemap, context, tileX, tileY, destX, destY);

    renderIsoTilemap(this.tilemap, this.background, callback1, this.SPRITE_WIDTH, this.SPRITE_HEIGHT);
    renderPackedTilemap(this.tilemap, this.foreground, callback2, this.SPRITE_WIDTH, this.SPRITE_HEIGHT);
  }

  /** Draw the sandbox. */
  public draw(context: CanvasRenderingContext2D, sandbox: Sandbox): void {
    // Render the tilemap if it has changed
    if (this.tilemap != sandbox.tilemap) {
      this.tilemap = sandbox.tilemap;

      this.renderTilemap();
    }

    // DEBUG: Move the scene toward the targeted entity
    let target = sandbox.entities[0];

    context.translate((target.x - target.y) * this.SPRITE_WIDTH / -2, (target.x + target.y) * this.SPRITE_HEIGHT / -4);

    // If there is no tilemap, simply draw the entities alone
    if (!this.tilemap) {
      for (let entity of sandbox.entities) {
        entity.draw(context);
      }

      return;
    }

    // Draw the background tilemap
    let offsetX = this.SPRITE_WIDTH * this.tilemap.height / -2;
    let offsetY = this.SPRITE_HEIGHT / -2;

    context.drawImage(this.background.canvas, offsetX, offsetY);

    // Sort the entities by their diagonal index
    let entities = Array.from(sandbox.entities);

    entities.sort((a, b) => a.x + a.y > b.x + b.y ? 1 : -1);

    // Draw the foreground tilemap and the entities interwoven
    let entity = entities.pop();

    for (let limit of drawPackedTilemap(context, this.foreground.canvas, this.tilemap.width, this.tilemap.height, this.SPRITE_WIDTH, this.SPRITE_HEIGHT)) {
      while (entity && entity.x + entity.y < limit) {
        entity.draw(context);
        entity = entities.pop();
      }
    }
  }
}