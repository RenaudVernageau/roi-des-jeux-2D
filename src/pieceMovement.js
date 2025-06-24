import { Graphics } from "pixi.js";
import { isMoveLegal } from "./logic/moveRules.js";

export function makePiecesDraggable(
  sprite,
  app,
  chessBoard,
  boardContainer,
  boardState,
  gameState,
  boardSize,
  tileSize
) {
  sprite.interactive = true;
  sprite.cursor      = "pointer";

  let dragging = false;
  let offsetX = 0, offsetY = 0;
  const highlights = [];

  const clearHighlights = () => {
    highlights.forEach(h => chessBoard.removeChild(h));
    highlights.length = 0;
  };

  sprite.on("pointerdown", event => {
    if (!gameState.canMovePiece(sprite.pieceId)) return;
    const pos = event.data.getLocalPosition(chessBoard);
    offsetX = pos.x - sprite.x;
    offsetY = pos.y - sprite.y;
    dragging = true;
    sprite.zIndex = 2;
    sprite.alpha  = 0.8;

    clearHighlights();
    const files = "abcdefgh";
    for (let f = 0; f < boardSize; f++) {
      for (let r = 1; r <= boardSize; r++) {
        const to = `${files[f]}${r}`;
        if (isMoveLegal(sprite.square, to, boardState.positions)) {
          const { x, y } = boardState.squareToCoords(to);
          const hl = new Graphics()
            .beginFill(0x00ff00, 0.3)
            .drawRect(x * tileSize, y * tileSize, tileSize, tileSize)
            .endFill();
          highlights.push(hl);
          chessBoard.addChild(hl);
        }
      }
    }
  });

  sprite.on("pointermove", event => {
    if (!dragging) return;
    const pos = event.data.getLocalPosition(chessBoard);
    sprite.x = pos.x - offsetX;
    sprite.y = pos.y - offsetY;
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;

    const file = Math.floor(sprite.x / tileSize);
    const rank = Math.floor(sprite.y / tileSize);
    const target = `${String.fromCharCode(97 + file)}${8 - rank}`;

    delete boardState.positions[sprite.square];
    boardState.positions[target] = sprite.pieceId;
    gameState.recordMove({ from: sprite.square, to: target });
    sprite.square = target;

    const cx = Math.max(0, Math.min(file, boardSize - 1));
    const cy = Math.max(0, Math.min(rank, boardSize - 1));
    sprite.x = cx * tileSize + tileSize / 2;
    sprite.y = cy * tileSize + tileSize / 2;

    sprite.alpha  = 1;
    sprite.zIndex = 1;
    gameState.nextTurn();
    clearHighlights();
  };

  sprite.on("pointerup", endDrag);
  sprite.on("pointerupoutside", endDrag);
}
