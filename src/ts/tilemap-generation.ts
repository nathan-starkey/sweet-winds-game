import { Tilemap } from "./tilemap";
import { vector } from "./utils";

const { random, floor, min, max, hypot, abs, round } = Math;

// Node tree generation

export class Node {
  public children: Node[] = [];

  constructor(
    public x: number,
    public y: number
  ) {}
}

/** Create a randomized tree of connected nodes. */
export function createNodeTree(length: number) {
  let closed: Node[] = [];
  let open: Node[] = [new Node(0, 0)];

  while (closed.length < length) {
    // Close a random node
    let index = floor(random() * open.length);
    let node = open.splice(index, 1)[0];

    closed.push(node);

    // Connect the node to it's neighbors
    let x = node.x;
    let y = node.y;

    let a = getClosedNode(x - 1, y);
    let b = getClosedNode(x, y - 1);
    let c = getClosedNode(x + 1, y);
    let d = getClosedNode(x, y + 1);

    // Randomize which connections are created
    let children = [];

    if (a) children.push(a);
    if (b) children.push(b);
    if (c) children.push(c);
    if (d) children.push(d);

    let count = floor(random() * (children.length - 1)) + 1;

    children.sort(() => Math.random() < 0.5 ? -1 : 1);

    node.children.push(...children.splice(0, count));

    // Open it's siblings
    openNode(x - 1, y);
    openNode(x, y - 1);
    openNode(x + 1, y);
    openNode(x, y + 1);
  }

  return closed;

  function getClosedNode(x: number, y: number) {
    return closed.find(node => node.x == x && node.y == y);
  }

  function getOpenNode(x: number, y: number) {
    return open.find(node => node.x == x && node.y == y);
  }

  function openNode(x: number, y: number) {
    if (!getClosedNode(x, y) && !getOpenNode(x, y)) {
      open.push(new Node(x, y));
    }
  }
}

// Room generation

class Room {
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

export function generateTilemap(nodes: Node[]) {
  const ROOM_SIZE_MAX = 16;
  const ROOM_SIZE_MIN = 12;
  const ROOOM_PADDING = 8;
  const GRID = ROOOM_PADDING * 2;

  // Find the offset such that all nodes will have positive positions
  let minX = 0;
  let minY = 0;

  for (let node of nodes) {
    minX = min(minX, node.x);
    minY = min(minY, node.y);
  }

  // Create the rooms
  let rooms = nodes.map(node => {
    let x = node.x - minX;
    let y = node.y - minY;

    // Scale the grid
    x *= GRID + 1;
    y *= GRID + 1;

    // Minimum border so that players don't walk outside the map
    x += 1;
    y += 1;

    // Random variation to make the room placement feel natural
    let width = ROOM_SIZE_MIN + floor(random() * (ROOM_SIZE_MAX - ROOM_SIZE_MIN));
    let height = ROOM_SIZE_MIN + floor(random() * (ROOM_SIZE_MAX - ROOM_SIZE_MIN));

    x += floor(random() * (GRID - 1 - width));
    y += floor(random() * (GRID - 1 - height));

    return new Room(x, y, width, height);
  });

  // Connect the rooms
  for (let i = 0; i < rooms.length; ++i) {
    for (let j = 0; j < nodes[i].children.length; ++j) {
      rooms[i].paths.push(rooms[nodes.indexOf(nodes[i].children[j])]);
    }
  }

  // Find the resulting tilemap dimensions
  let maxX = 0;
  let maxY = 0;

  for (let room of rooms) {
    maxX = max(maxX, room.x + room.width);
    maxY = max(maxY, room.y + room.height);
  }

  // Create a blank tilemap
  let tilemap = new Tilemap(maxX + 1, maxY + 1);

  for (let y = 0; y < tilemap.height; ++y) {
    for (let x = 0; x < tilemap.width; ++x) {
      tilemap.put(x, y, 1);
    }
  }

  // Write the rooms
  for (let room of rooms) {
    room.generate(tilemap);
  }

  // Write the paths
  for (let room of rooms) {
    for (let other of room.paths) {
      let roomMidX = room.x + room.width / 2;
      let roomMidY = room.y + room.height / 2;

      let otherMidX = other.x + other.width / 2;
      let otherMidY = other.y + other.height / 2;

      for (let [x, y] of line(roomMidX, roomMidY, otherMidX, otherMidY, floor(random() * 3) + 1)) tilemap.put(x, y, 0);
    }
  }

  return tilemap;
}

export function* circle(midX: number, midY: number, radiusX: number, radiusY = radiusX): Generator<[x: number, y: number]> {
  for (let j = -radiusY; j <= radiusY; ++j) {
    for (let i = -radiusX; i <= radiusX; ++i) {
      let x = midX + i;
      let y = midY + j;

      let dx = x - midX;
      let dy = y - midY;
      let d = hypot(dx / radiusX, dy / radiusY);

      if (d < 1) {
        yield [x, y];
      }
    }
  }
}

/** Paint a line on the given tilemap. */
export function* line(x0: number, y0: number, x1: number, y1: number, radius: number = 1): Generator<[x: number, y: number]> {
  let dx = x1 - x0;
  let dy = y1 - y0;

  for (let [x, y] of vector(dx, dy)) {
    x = round(x0 + x);
    y = round(y0 + y);

    for (let j = -radius; j <= radius; ++j) {
      for (let i = -radius; i <= radius; ++i) {
        yield [x + i, y + j];
      }
    }
  }
}

export function debugDrawNodeTree(ctx: CanvasRenderingContext2D, nodes: Node[]) {
  // Regular scale doesn't work well for canvas strokes :(
  let scale = 2;

  ctx.fillStyle = "red";

  for (let {x, y} of nodes) {
    ctx.fillRect(x * scale, y * scale, scale, scale);
  }

  ctx.strokeStyle = "blue";

  for (let {x, y, children} of nodes) {
    for (let child of children) {
      ctx.beginPath();
      ctx.moveTo((x + 0.5) * scale, (y + 0.5) * scale);
      ctx.lineTo((child.x + 0.5) * scale, (child.y + 0.5) * scale);
      ctx.stroke();
    }
  }
}