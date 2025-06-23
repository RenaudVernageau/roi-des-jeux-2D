export function makePiecesDraggable(
  sprite,
  app,
  chessBoard,
  boardContainer, // new
  boardState,
  boardSize,
  tileSize
) {
  sprite.eventMode = "static";
  sprite.cursor = "pointer";
  sprite.zIndex = 0;

  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;

  sprite.on("pointerdown", (event) => {
    const pos = event.global;
    offsetX = pos.x - sprite.x;
    offsetY = pos.y - sprite.y;
    dragging = true;

    sprite.zIndex = 1000;
    sprite.alpha = 0.8;
  });

  sprite.on("globalpointermove", (event) => {
    if (dragging) {
      const pos = event.global;
      sprite.x = pos.x - offsetX;
      sprite.y = pos.y - offsetY;
    }
  });

  sprite.on("pointerup", (event) => {
    if (!dragging) return;
    dragging = false;
    sprite.alpha = 1;
    sprite.zIndex = 0;

    const localPos = boardContainer.toLocal(event.global);

    const boardX = Math.floor(localPos.x / tileSize);
    const boardY = Math.floor(localPos.y / tileSize);

    if (
      boardX >= 0 &&
      boardX < boardSize &&
      boardY >= 0 &&
      boardY < boardSize
    ) {
      const newSquare =
        String.fromCharCode("a".charCodeAt(0) + boardX) + (8 - boardY);

      delete boardState[sprite.square];
      boardState[newSquare] = sprite.pieceId;

      sprite.square = newSquare;
      sprite.x = boardX * tileSize + tileSize * 0.05;
      sprite.y = boardY * tileSize + tileSize * 0.05;
    } else {
      const { x, y } = getCoordsFromSquare(sprite.square);
      sprite.x = x * tileSize + tileSize * 0.05;
      sprite.y = y * tileSize + tileSize * 0.05;
    }
  });

  sprite.on("pointerupoutside", () => {
    dragging = false;
    sprite.alpha = 1;
    sprite.zIndex = 0;

    const { x, y } = getCoordsFromSquare(sprite.square);
    sprite.x = x * tileSize + tileSize * 0.05;
    sprite.y = y * tileSize + tileSize * 0.05;
  });

  function getCoordsFromSquare(square) {
    const file = square.charCodeAt(0) - "a".charCodeAt(0);
    const rank = 8 - parseInt(square[1]);
    return { x: file, y: rank };
  }
}
