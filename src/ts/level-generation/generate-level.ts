import { Tilemap } from "../tilemap/tilemap";
import { randomInt } from "../utils";
import { mapNodes, Node, normalizeNodes, scaleNodes, translateNodes } from "./create-node-tree";
import { Room } from "./rooms/room";
import { line } from "./utils";

const { random, floor, min, max } = Math;

/** Generate a level. */
export function generateLevel(nodes: Node[]) {
  const ROOM_SIZE_MAX = 16;
  const ROOM_SIZE_MIN = 12;
  const ROOOM_PADDING = 12;
  const GRID = ROOOM_PADDING * 2;

  normalizeNodes(nodes);
  scaleNodes(nodes, GRID + 1);

  // Offet border that keeps players in-bounds
  translateNodes(nodes, 1, 1);

  // Create the rooms
  let rooms = mapNodes(nodes, createRoom, (parent, child) => parent.paths.push(child));

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

  function createRoom(node: Node) {
    // Randomize the room size
    let width = randomInt(ROOM_SIZE_MIN, ROOM_SIZE_MAX);
    let height = randomInt(ROOM_SIZE_MIN, ROOM_SIZE_MAX);

    // Randomly offset the room position
    let x = node.x + randomInt(0, GRID - width - 1);
    let y = node.y + randomInt(0, GRID - width - 1);

    return new Room(x, y, width, height);
  }
}