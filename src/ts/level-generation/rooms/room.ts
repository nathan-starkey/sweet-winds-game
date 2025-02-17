import { Tilemap } from "../../tilemap/tilemap";
import { circle } from "../utils";

export class Room {
  public paths: Room[] = [];

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  public generate(tilemap: Tilemap): void {
    let midX = this.x + this.width / 2;
    let midY = this.y + this.height / 2;

    for (let [x, y] of circle(midX, midY, this.width / 2, this.height / 2)) {
      tilemap.put(x, y, 0);
    }
  }
}