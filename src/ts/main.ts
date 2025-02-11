import { Entity } from "./entity";
import { Sandbox } from "./sandbox";
import { toIso, toOrtho } from "./utils";
import { Tilemap } from "./tilemap";
import { moveEntity } from "./tilemap-collision";
import { init, fps } from "./game-engine";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const keys: Map<string, boolean | undefined> = new Map();

const game = new Sandbox();
const player = new Entity();

game.addEntity(player);

// Debug tilemap generation code
let tilemap: Tilemap = new Tilemap(0, 0);

{
  let width = Math.floor(Math.random() * 48) + 16;
  let height = Math.floor(Math.random() * 48) + 16;

  width = 128;
  height = 128;

  tilemap = new Tilemap(width, height);

  for (let y = 0; y < tilemap.height; ++y) {
    for (let x = 0; x < tilemap.width; ++x) {
      let d = Math.hypot(x - tilemap.width / 2, y - tilemap.height / 2);

      tilemap.put(x, y, Math.random() > d / tilemap.width * 2 ? 0 : 1);
    }
  }

  player.x = width / 2;
  player.y = height / 2;

  game.setTilemap(tilemap);
}

function main() {
  init(update, draw);
}

function update(dt: number) {
  let speed = 10;

  let dx = 0;
  let dy = 0;

  // World movement
  if (keys.has("ArrowLeft")) dx--;
  if (keys.has("ArrowUp")) dy--;
  if (keys.has("ArrowRight")) dx++;
  if (keys.has("ArrowDown")) dy++;

  if (dx || dy) {
    let n = Math.hypot(dx, dy);

    dx /= n;
    dy /= n;

    [dx, dy] = toIso(dx, dy);

    moveEntity(tilemap, player, speed * dx * dt, speed * dy * dt);
  }
}


function draw() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  ctx.imageSmoothingEnabled = false;

  // Set the background color
  ctx.fillStyle = "gray";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Align to the center of the screen
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // Debug scale the content
  ctx.scale(2, 2);

  // Draw the sandbox
  game.draw(ctx);

  // Debug draw the world origin
  ctx.fillStyle = "purple";
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  // Debug draw an ortho minimap
  /*{
    let scale = 7;

    ctx.resetTransform();
    ctx.scale(scale, scale);

    for (let y = 0; y < tilemap.height; ++y) {
      for (let x = 0; x < tilemap.width; ++x) {
        ctx.fillStyle = tilemap.at(x, y) == 0 ? "blue" : "red";
        ctx.fillRect(x, y, 1, 1);
      }
    }

    ctx.fillStyle = "yellow";
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
  }*/

  // Debug display the FPS
  {
    ctx.resetTransform();

    ctx.fillStyle = "white";
    ctx.fillRect(8, 8, 16 * 10, 32)

    ctx.fillStyle = "black";
    ctx.font = "16px sans-serif";
    ctx.fillText(Math.floor(fps * 10) / 10 + " FPS", 16, 32)
  }
}

window.addEventListener("load", main);

window.addEventListener("keydown", ev => keys.set(ev.key, true));

window.addEventListener("keyup", ev => keys.delete(ev.key));

window.addEventListener("blur", ev => keys.clear());