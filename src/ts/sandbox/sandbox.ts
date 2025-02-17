import { SPRITE_HEIGHT, SPRITE_WIDTH } from "../utils";
import { Entity } from "./entity";
import { ITilemap } from "../tilemap/tilemap";
import { moveEntity } from "../tilemap/collision";
import { SandboxRenderer } from "./sandbox-renderer";

/** Represents the sandbox simulation of the game. */
export class Sandbox {
  private renderer = new SandboxRenderer(SPRITE_WIDTH, SPRITE_HEIGHT);

  public tilemap: ITilemap | null = null;
  public entities: Entity[] = [];

  /** Add an entity to the sandbox. */
  public addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  /** Update the sandbox simulation. */
  public update(dt: number): void {
    for (let entity of this.entities) {
      entity.input(dt);

      if (this.tilemap && (entity.vx || entity.vy)) {
        moveEntity(this.tilemap, entity, entity.vx * dt, entity.vy * dt);
      }

      entity.update(dt);
    }
  }

  /** Draw the sandbox to a rendering context. */
  public draw(ctx: CanvasRenderingContext2D): void {
    this.renderer.draw(ctx, this);
  }
}