import { Text } from "pixi.js";

export function addNotation(
  container,
  boardSize,
  tileSize,
  { offset = tileSize * 0.4 } = {}
) {
  const letters = ["a","b","c","d","e","f","g","h"];
  const style = {
    fill: 0x000000,
    fontSize: tileSize * 0.2,
    fontFamily: "Arial",
  };

  // Files en bas
  for (let i = 0; i < boardSize; i++) {
    const txt = new Text(letters[i], style);
    txt.anchor.set(0.5);
    txt.x = i * tileSize + tileSize / 2;
    txt.y = boardSize * tileSize + offset;
    container.addChild(txt);
  }

  // Rangs à gauche
  for (let j = 0; j < boardSize; j++) {
    const num = boardSize - j;
    const txt = new Text(`${num}`, style);
    txt.anchor.set(0.5);
    txt.x = -offset;
    txt.y = j * tileSize + tileSize / 2;
    container.addChild(txt);
  }
}
