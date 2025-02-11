import { toOrtho, toWorld } from "./math";

import { SPRITE_WIDTH, SPRITE_HEIGHT } from "./constants";
import { Tilemap } from "./tilemap";

export class Entity {
  public x = 0;
  public y = 0;
  public width = 0.9;
  public height = 0.9;

  public update(dt: number, keys: Map<string, boolean | undefined>): void {

  }

  public hasCollison(tilemap: Tilemap, x: number, y: number) {
    return tilemap.at(Math.floor(x), Math.floor(y)) == 1;
  }

  public doCollision(tilemap: Tilemap, x: number, y: number, axisX: -1 | 0 | 1, axisY: -1 | 0 | 1): void {
    let tileX = Math.floor(x);
    let tileY = Math.floor(y);

    let solid = tilemap.at(tileX, tileY) == 1;

    if (solid) {
      // Determine the edge of the tile and the entity
      let tileEdgeX = tileX + (1 - axisX) / 2
      let tileEdgeY = tileY + (1 - axisY) / 2

      let entityEdgeX = this.x + this.width / 2 * axisX;
      let entityEdgeY = this.y + this.height / 2 * axisY;

      // Calculate the overlap between the tile and the entity
      let overlapX = (entityEdgeX - tileEdgeX) * axisX;
      let overlapY = (entityEdgeY - tileEdgeY) * axisY;

      // Translate the entity by the smallest overlap
      if (axisX) {

        this.x -= overlapX * axisX;
      }
      else if (axisY) {
        this.y -= overlapY * axisY;

      }
      if ((overlapY < 0 || overlapX < overlapY) && overlapX > 0) {
      } else if (overlapY > 0) {
      }
    }
  }

  /** Draw the entity to the screen. */
  public draw(ctx: CanvasRenderingContext2D): void {
    let [x, y] = toWorld(this.x, this.y);

    // Debug draw collision
    this.drawCollision(ctx);

    // Draw the sprite
    ctx.fillStyle = "red";
    // ctx.fillRect(x - SPRITE_WIDTH / 4, y - SPRITE_HEIGHT / 2, SPRITE_WIDTH / 2, SPRITE_HEIGHT / 2);

    // Debug draw the origin
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  /** Draw the basic collision box to the screen. */
  public drawCollision(ctx: CanvasRenderingContext2D): void {
    let w = this.width;
    let h = this.height;
    let x = this.x - w / 2;
    let y = this.y - h / 2;

    let [ax, ay] = toWorld(x, y);
    let [bx, by] = toWorld(x + w, y);
    let [cx, cy] = toWorld(x + w, y + h);
    let [dx, dy] = toWorld(x, y + h);

    ctx.fillStyle = "magenta";
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(cx, cy);
    ctx.lineTo(dx, dy);
    ctx.closePath();
    ctx.fill();
  }
}