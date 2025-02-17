import { toIso, Vec2 } from "./utils";

const { hypot } = Math;

const keys: Map<string, boolean | undefined> = new Map();

window.addEventListener("keydown", ev => keys.set(ev.key, true));

window.addEventListener("keyup", ev => keys.delete(ev.key));

window.addEventListener("blur", ev => keys.clear());

/** Get the movement direction from keyboard input. */
export function getMovementDirection(): Vec2 {
  // Determine the input direction
  let dx = 0;
  let dy = 0;

  if (keys.has("ArrowLeft")) dx--;
  if (keys.has("ArrowUp")) dy--;
  if (keys.has("ArrowRight")) dx++;
  if (keys.has("ArrowDown")) dy++;

  // Normalize the direction for consistent movement speed
  let n = hypot(dx, dy);

  dx = dx / n || 0;
  dy = dy / n || 0;

  [dx, dy] = toIso(dx, dy);


  // Return the direction in isometric coordinates
  return [dx, dy];
}