// src/logic/coordinateUtils.js
/** Convertit notation algébrique ↔ coordonnées pixels */
export function squareToCoords(square, tileSize) {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(square[1], 10);
  const rankIndex = 8 - rank;
  return { x: file * tileSize + tileSize / 2, y: rankIndex * tileSize + tileSize / 2 };
}

export function coordsToSquare(x, y, tileSize) {
  const file = Math.floor(x / tileSize);
  const rankIndex = Math.floor(y / tileSize);
  const rank = 8 - rankIndex;
  const fileChar = String.fromCharCode('a'.charCodeAt(0) + file);
  return `${fileChar}${rank}`;
}