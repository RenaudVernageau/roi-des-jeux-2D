import { Application, Assets, Sprite, Container, Graphics } from "pixi.js";
import { addNotation } from "./notationLayer.js";
import { makePiecesDraggable } from "./pieceMovement.js";

(async () => {
  const app = new Application();
  await app.init({ background: "pink", resizeTo: window });
  document.getElementById("pixi-container").appendChild(app.canvas);

  const boardSize = 8;

  // Responsive tile size
  const maxBoardWidth = Math.min(window.innerWidth, window.innerHeight) * 0.8;
  const tileSize = Math.floor(maxBoardWidth / boardSize);
  const boardSizePx = tileSize * boardSize;

  // Create board container
  const boardContainer = new Container();
  app.stage.addChild(boardContainer);
  boardContainer.sortableChildren = true;

  // White border
  const borderPadding = tileSize * 0.08; // Fine white border
  const border = new Graphics();
  border.roundRect(
    -borderPadding,
    -borderPadding,
    boardSizePx + borderPadding * 2,
    boardSizePx + borderPadding * 2,
    tileSize * 0.2
  );
  border.fill({ color: 0xffffff });
  boardContainer.addChild(border);

  // Chessboard container inside border
  const chessBoard = new Container();
  boardContainer.addChild(chessBoard);

  // Center the full board
  boardContainer.x = (app.screen.width - boardSizePx) / 2;
  boardContainer.y = (app.screen.height - boardSizePx) / 2;

  const lightColor = 0xf0d9b5;
  const darkColor = 0xb58863;

  // Draw the board
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const square = new Graphics();
      square.beginPath();
      const isDark = (row + col) % 2 === 1;
      square.rect(0, 0, tileSize, tileSize);
      square.fill({ color: isDark ? darkColor : lightColor });
      square.x = col * tileSize;
      square.y = row * tileSize;
      chessBoard.addChild(square);
    }
  }

  // Initial piece positions
  const initialPosition = {
    a1: "w_rook", b1: "w_knight", c1: "w_bishop", d1: "w_queen", e1: "w_king",
    f1: "w_bishop", g1: "w_knight", h1: "w_rook",
    a2: "w_pawn", b2: "w_pawn", c2: "w_pawn", d2: "w_pawn",
    e2: "w_pawn", f2: "w_pawn", g2: "w_pawn", h2: "w_pawn",
    a8: "b_rook", b8: "b_knight", c8: "b_bishop", d8: "b_queen", e8: "b_king",
    f8: "b_bishop", g8: "b_knight", h8: "b_rook",
    a7: "b_pawn", b7: "b_pawn", c7: "b_pawn", d7: "b_pawn",
    e7: "b_pawn", f7: "b_pawn", g7: "b_pawn", h7: "b_pawn",
  };

  const boardState = { ...initialPosition };

  // Notation -> coordinates
  function squareToCoords(square) {
    const file = square.charCodeAt(0) - "a".charCodeAt(0);
    const rank = 8 - parseInt(square[1]);
    return { x: file, y: rank };
  }

  // Load textures
  const allPieces = Object.values(initialPosition);
  const uniquePieces = [...new Set(allPieces)];
  const textures = {};
  for (const name of uniquePieces) {
    textures[name] = await Assets.load(`/assets/${name}.png`);
  }

  // Place pieces
  for (const [square, piece] of Object.entries(initialPosition)) {
    const { x, y } = squareToCoords(square);
    const sprite = new Sprite(textures[piece]);
    sprite.width = sprite.height = tileSize * 0.9;
    sprite.square = square;
    sprite.pieceId = piece;
    sprite.zIndex = 1;

    snapToSquare(sprite, x, y);

    chessBoard.addChild(sprite);
    makePiecesDraggable(
      sprite,
      app,
      chessBoard,
      boardContainer,
      boardState,
      boardSize,
      tileSize
    );
  }

  // Add annotations slightly lower
  addNotation(chessBoard, boardSize, tileSize, { offsetBottom: tileSize * 0.05 });

  // Helper: center sprite on square
  function snapToSquare(sprite, x, y) {
    sprite.x = x * tileSize + (tileSize - sprite.width) / 2;
    sprite.y = y * tileSize + (tileSize - sprite.height) / 2;
  }
})();
