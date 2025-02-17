import { Sandbox } from "./sandbox/sandbox";
import { Tilemap } from "./tilemap/tilemap";
import { fps, init } from "./game-engine";
import { generateLevel } from "./level-generation/generate-level";
import { Entity } from "./sandbox/entity";
import { Node, createNodeTree } from "./level-generation/create-node-tree";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

const sandbox = new Sandbox();
const player = new Entity();

sandbox.addEntity(player);

// Debug tilemap generation code
let nodes: Node[] = createNodeTree(20);
let tilemap: Tilemap = generateLevel(nodes); // new Tilemap(0, 0);

sandbox.tilemap = tilemap;

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
  sandbox.update(dt);
}


function draw() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  ctx.imageSmoothingEnabled = false;

  // Set the background color
  ctx.fillStyle = "#10121C";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Align to the center of the screen
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // Determine how much content should be visible
  {
    let ratio = canvas.width / canvas.height;

    if (ratio < 1) ratio = 1 / ratio;

    ratio = Math.round(ratio);

    ctx.scale(ratio, ratio);
  }

  // Draw the sandbox
  sandbox.draw(ctx);

  // Debug draw the world origin
  ctx.fillStyle = "purple";
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.resetTransform();

  // Post processing experiment:

  /*
  let imageData: ImageData = ctx.getImageData(0, 0, canvas.width / 2, canvas.height / 2);

  for (let n = 0; n < imageData.data.length; n += 4) {
    let i = n / 4;
    let x = i % imageData.width;
    let y = Math.floor(i / imageData.width);

    imageData.data[n + 0] /= 2;
    imageData.data[n + 1] /= 2;
    imageData.data[n + 2] /= 2;
  }

  ctx.putImageData(imageData, 0, 0);
  */

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
  {
    ctx.fillStyle = "white";
    ctx.fillRect(8, 8, 16 * 10, 32)

    ctx.fillStyle = "black";
    ctx.font = "16px sans-serif";
    ctx.fillText(Math.floor(fps * 10) / 10 + " FPS", 16, 32)
  }

  // Debug display the tilemap generation
  // ctx.scale(10, 10);
  // ctx.translate(200, 200);
  // debugDrawNodeTree(ctx, nodes);
}

window.addEventListener("load", main);