import { SPRITE_WIDTH, SPRITE_HEIGHT, toScreen } from "../utils";
import { getMovementDirection } from "../player-input";

export class Entity {
  public x = 0;
  public y = 0;
  public width = 0.75;
  public height = 0.75;
  public vx = 0;
  public vy = 0;

  public input(dt: number): void {
    let speed = 10;
    let [dx, dy] = getMovementDirection();

    this.vx = speed * dx;
    this.vy = speed * dy;
  }

  public update(dt: number): void {
  }

  /** Draw the entity to the screen. */
  public draw(ctx: CanvasRenderingContext2D): void {
    let [x, y] = toScreen(this.x, this.y);

    // Debug draw collision
    // this.drawCollision(ctx);

    // Draw the sprite
    ctx.fillStyle = "red";
    ctx.fillRect(x - SPRITE_WIDTH / 4, y - SPRITE_HEIGHT / 2, SPRITE_WIDTH / 2, SPRITE_HEIGHT / 2);

    // Debug draw the origin
    // ctx.fillStyle = "blue";
    // ctx.beginPath();
    // ctx.arc(x, y, 2, 0, Math.PI * 2);
    // ctx.fill();
  }

  /** Draw the basic collision box to the screen. */
  private drawCollision(ctx: CanvasRenderingContext2D): void {
    let w = this.width;
    let h = this.height;
    let x = this.x - w / 2;
    let y = this.y - h / 2;

    let [ax, ay] = toScreen(x, y);
    let [bx, by] = toScreen(x + w, y);
    let [cx, cy] = toScreen(x + w, y + h);
    let [dx, dy] = toScreen(x, y + h);

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