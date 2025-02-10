import { toScreenSpace } from "./math";

export class Entity {
  public x = 0;
  public y = 0;
  public width = 1;
  public height = 1;

  public draw(ctx: CanvasRenderingContext2D) {
    let [x, y] = toScreenSpace(this.x, this.y);

    // ctx.fillStyle = "blue";
    // ctx.fillRect(x - 20, y - 20, 40, 40);

    ctx.fillStyle = "red";
    ctx.fillRect(x - this.width / 2, y - this.height, this.width, this.height);
  }
}