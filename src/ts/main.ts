import { Entity } from "./entity";
import { Sandbox } from "./sandbox";
import { toIso } from "./utils";
import { Tilemap } from "./tilemap";
import { moveEntity } from "./tilemap-collision";
import { init } from "./game-engine";
import { Node, createNodeTree, debugDrawNodeTree, generateTilemap } from "./tilemap-generation";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const keys: Map<string, boolean | undefined> = new Map();

const game = new Sandbox();
const player = new Entity();

game.addEntity(player);

// Debug tilemap generation code
let nodes: Node[] = createNodeTree(20);
let tilemap: Tilemap = generateTilemap(nodes); // new Tilemap(0, 0);

game.setTilemap(tilemap);

// Debug spawn code
let x = 0;
let y = 0;

while (tilemap.at(x, y) == 1) {
  x = Math.floor(Math.random() * tilemap.width);
  y = Math.floor(Math.random() * tilemap.height);
}

player.x = x;
player.y = y;

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

  // Determine how much content should be visible
  {
    let ratio = canvas.width / canvas.height;

    if (ratio < 1) ratio = 1 / ratio;

    ctx.scale(ratio, ratio);
  }

  // Draw the sandbox
  game.draw(ctx);

  // Debug draw the world origin
  ctx.fillStyle = "purple";
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.resetTransform();

  // Debug draw an ortho minimap
  /*{
    let scale = 7;

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
  /*{
    ctx.fillStyle = "white";
    ctx.fillRect(8, 8, 16 * 10, 32)

    ctx.fillStyle = "black";
    ctx.font = "16px sans-serif";
    ctx.fillText(Math.floor(fps * 10) / 10 + " FPS", 16, 32)
  }*/

  // Debug display the tilemap generation
  // ctx.scale(10, 10);
  // ctx.translate(200, 200);
  // debugDrawNodeTree(ctx, nodes);
}

window.addEventListener("load", main);

window.addEventListener("keydown", ev => keys.set(ev.key, true));

window.addEventListener("keyup", ev => keys.delete(ev.key));

window.addEventListener("blur", ev => keys.clear());