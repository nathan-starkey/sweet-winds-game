import { Entity } from "./entity";
import { Tilemap } from "./tilemap";

const { floor, ceil } = Math;

type Edge = "left" | "top" | "right" | "bottom";

export function* iterateEntityEdge(entity: Entity, edge: Edge): Generator<[x: number, y: number]> {
  let left = floor(entity.x - entity.width / 2);
  let top = floor(entity.y - entity.height / 2);
  let right = ceil(entity.x + entity.width / 2) - 1;
  let bottom = ceil(entity.y + entity.height / 2) - 1;

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

export function entityHasEdgeCollision(tilemap: Tilemap, entity: Entity, edge: Edge) {
  for (let [x, y] of iterateEntityEdge(entity, edge)) if (tilemap.at(x, y) == 1) return true;

  return false;
}

export function alignEntityEdge(entity: Entity, edge: Edge) {
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