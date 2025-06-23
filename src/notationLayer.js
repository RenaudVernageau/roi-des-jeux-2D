import { Text } from "pixi.js";

export function addNotation(container, boardSize, tileSize, options = {}) {
  const letters = "abcdefgh";
  const offsetBottom = options.offsetBottom ?? 0;

  for (let i = 0; i < boardSize; i++) {
    // Bottom letters (a–h)
    const fileText = new Text({
      text: letters[i],
      style: {
        fill: 0x000000,
        fontSize: tileSize * 0.25,
        fontFamily: "Arial",
      },
    });

    fileText.anchor.set(0.5);
    fileText.x = i * tileSize + tileSize / 2;
    fileText.y = boardSize * tileSize + tileSize * 0.2 + offsetBottom;
    container.addChild(fileText);

    // Left-side numbers (1–8)
    const rankText = new Text({
      text: `${boardSize - i}`,
      style: {
        fill: 0x000000,
        fontSize: tileSize * 0.25,
        fontFamily: "Arial",
      },
    });

    rankText.anchor.set(0.5);
    rankText.x = -tileSize * 0.3;
    rankText.y = i * tileSize + tileSize / 2;
    container.addChild(rankText);
  }
}
