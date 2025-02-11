import { Entity } from "./entity";
import { Tilemap } from "./tilemap";

const { floor, ceil } = Math;

const EPSILON = 0.0001;

type Edge = "left" | "top" | "right" | "bottom";

/** Iterate each tile that the given edge intersects. */
function* iterateEntityEdge(entity: Entity, edge: Edge): Generator<[x: number, y: number]> {
  let left = floor(entity.x - entity.width / 2 + EPSILON);
  let top = floor(entity.y - entity.height / 2 + EPSILON);
  let right = ceil(entity.x + entity.width / 2 - EPSILON) - 1;
  let bottom = ceil(entity.y + entity.height / 2 - EPSILON) - 1;

  if (edge == "left") {
    for (let y = top; y <= bottom; ++y) yield [left, y];
  } else if (edge == "top") {
    for (let x = left; x <= right; ++x) yield [x, top];
  } else if (edge == "right") {
    for (let y = top; y <= bottom; ++y) yield [right, y];
  } else {
    for (let x = left; x <= right; ++x) yield [x, bottom];
  }
}

/** Determine if the given edge intersects a solid tile. */
function entityHasEdgeCollision(tilemap: Tilemap, entity: Entity, edge: Edge) {
  for (let [x, y] of iterateEntityEdge(entity, edge)) if (tilemap.at(x, y) == 1) return true;

  return false;
}

/** Align the given edge to the tilemap grid. This is the tilemap collision response. */
function alignEntityEdge(entity: Entity, edge: Edge) {
  if (edge == "left") {
    entity.x = floor(entity.x - entity.width / 2) + entity.width / 2 + 1;
  } else if (edge == "top") {
    entity.y = floor(entity.y - entity.height / 2) + entity.height / 2 + 1;
  } else if (edge == "right") {
    entity.x = floor(entity.x + entity.width / 2) - entity.width / 2;
  } else {
    entity.y = floor(entity.y + entity.height / 2) - entity.height / 2;
  }
}

/** Move an entity with respect to tilemap collision. */
export function moveEntity(tilemap: Tilemap, entity: Entity, deltaX: number, deltaY: number): void {
  entity.x += deltaX;

  if (deltaX < 0) {
    if (entityHasEdgeCollision(tilemap, entity, "left")) {
      alignEntityEdge(entity, "left");
    }
  } else if (deltaX > 0) {
    if (entityHasEdgeCollision(tilemap, entity, "right")) {
      alignEntityEdge(entity, "right");
    }
  }

  entity.y += deltaY;

  if (deltaY < 0) {
    if (entityHasEdgeCollision(tilemap, entity, "top")) {
      alignEntityEdge(entity, "top");
    }
  } else if (deltaY > 0) {
    if (entityHasEdgeCollision(tilemap, entity, "bottom")) {
      alignEntityEdge(entity, "bottom");
    }
  }
}