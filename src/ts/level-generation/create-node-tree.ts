const { floor, min, random } = Math;

/** Represents a 2D node and it's children. */
export type Node = {
  x: number;
  y: number;
  children: Node[];
};

/** Create a node. */
function createNode(x = 0, y = 0): Node {
  return { x, y, children: [] };
}

/** Collectively scale the positions of nodes.  */
export function scaleNodes(nodes: Node[], scale: number): void {
  for (let node of nodes) {
    node.x *= scale;
    node.y *= scale;
  }
}

/** Collectively scale the positions of nodes.  */
export function translateNodes(nodes: Node[], dx: number, dy: number): void {
  for (let node of nodes) {
    node.x += dx;
    node.y += dy;
  }
}

/** Get the minimum x and y positions in a set of nodes. */
export function getMinNodePos(nodes: Node[]): [x: number, y: number] {
  let minX = 0;
  let minY = 0;

  for (let node of nodes) {
    minX = min(minX, node.x);
    minY = min(minY, node.y);
  }

  return [minX, minY];
}

/** Normalize the position of nodes such that the minimum x and y is zero. */
export function normalizeNodes(nodes: Node[]): void {
  let [x, y] = getMinNodePos(nodes);

  translateNodes(nodes, -x, -y);
}

/** Map a set of nodes to a new set of objects. */
export function mapNodes<T>(nodes: Node[], mapFn: (node: Node) => T, parentFn: (parent: T, child: T) => void): T[] {
  let values = nodes.map(mapFn);

  for (let pIndex = 0; pIndex < nodes.length; ++pIndex) {
    let pNode = nodes[pIndex];
    let pVal = values[pIndex];

    for (let j = 0; j < pNode.children.length; ++j) {
      let cNode = pNode.children[j];
      let cIndex = nodes.indexOf(cNode);
      let cVal = values[cIndex];

      parentFn(pVal, cVal);
    }
  }

  return values;
}

/** Create a randomized tree of connected nodes. */
export function createNodeTree(length: number): Node[] {
  let closed: Node[] = [];
  let open: Node[] = [ createNode() ];

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
      open.push(createNode(x, y));
    }
  }
}

/** Draw a node tree to the canvas. */
export function debugDrawNodeTree(ctx: CanvasRenderingContext2D, nodes: Node[], scale = 1): void {
  // Draw a red pixel for each node
  ctx.fillStyle = "red";

  for (let {x, y} of nodes) {
    ctx.fillRect(x * scale, y * scale, scale, scale);
  }

  // Draw blue strokes connecting the nodes
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