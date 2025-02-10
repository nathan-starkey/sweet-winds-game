import { Entity } from "./entity";
import { Sandbox } from "./sandbox";
import { fromScreenSpace, toScreenSpace } from "./math";
import { Tilemap } from "./tilemap";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const keys: Map<string, boolean | undefined> = new Map();

const game = new Sandbox();
const player = new Entity();

game.addEntity(player);

// Debug tilemap generation code
{
  let width = Math.floor(Math.random() * 48) + 16;
  let height = Math.floor(Math.random() * 48) + 16;

  const tilemap = new Tilemap(width, height);

  for (let y = 0; y < tilemap.height; ++y) {
    for (let x = 0; x < tilemap.width; ++x) {
      let d = Math.hypot(x - tilemap.width / 2, y - tilemap.height / 2);

      tilemap.put(x, y, Math.random() > d / tilemap.width * 2 ? 0 : 1);
    }
  }

  game.setTilemap(tilemap);
}

function main() {
  loop();
}

function loop() {
  update();

  draw();

  requestAnimationFrame(loop);
}

function update() {
  let speed = 10;
  let dt = 1 / 60;

  let dx = 0;
  let dy = 0;

  if (keys.has("ArrowLeft")) dx--;
  if (keys.has("ArrowUp")) dy--;
  if (keys.has("ArrowRight")) dx++;
  if (keys.has("ArrowDown")) dy++;

  [dx, dy] = fromScreenSpace(dx, dy);

  player.x += dx * speed * dt;
  player.y += dy * speed * dt;
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

  // Scale the content
  ctx.scale(2, 2);

  game.draw(ctx);

  // Draw a dot at (0, 0)
  ctx.fillStyle = "purple";
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();
}

window.addEventListener("load", main);

window.addEventListener("keydown", ev => keys.set(ev.key, true));

window.addEventListener("keyup", ev => keys.delete(ev.key));

window.addEventListener("blur", ev => keys.clear());