import { Application, Assets, Sprite, Container, Graphics } from "pixi.js";

export async function initBoard(containerId) {
  const app = new Application();
  await app.init({ background: "pink", resizeTo: window });
  document.getElementById(containerId).appendChild(app.canvas);

  const boardSize     = 8;
  const maxBoardWidth = Math.min(window.innerWidth, window.innerHeight) * 0.8;
  const tileSize      = Math.floor(maxBoardWidth / boardSize);
  const boardSizePx   = tileSize * boardSize;

  // Container principal et bordure
  const boardContainer = new Container();
  boardContainer.sortableChildren = true;
  app.stage.addChild(boardContainer);

  const borderPadding = tileSize * 0.08;
  const border = new Graphics();
  border
    .beginFill(0xffffff)
    .drawRoundedRect(
      -borderPadding,
      -borderPadding,
      boardSizePx + borderPadding * 2,
      boardSizePx + borderPadding * 2,
      tileSize * 0.2
    )
    .endFill();
  boardContainer.addChild(border);

  // Container interne pour les cases
  const chessBoard = new Container();
  chessBoard.sortableChildren = true;
  boardContainer.addChild(chessBoard);

  boardContainer.x = (app.screen.width  - boardSizePx) / 2;
  boardContainer.y = (app.screen.height - boardSizePx) / 2;

  // Couleurs
  const lightColor = 0xf0d9b5;
  const darkColor  = 0xb58863;

  // Dessin des cases, coins extérieurs arrondis un par un
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const square = new Graphics();
      const isDark = (row + col) % 2 === 1;
      const color  = isDark ? darkColor : lightColor;
      const r      = tileSize * 0.2;

      // Détection des coins
      const isTL = row === 0               && col === 0;
      const isTR = row === 0               && col === boardSize - 1;
      const isBR = row === boardSize - 1   && col === boardSize - 1;
      const isBL = row === boardSize - 1   && col === 0;

      square.beginFill(color);

      if (isTL) {
        square
          .moveTo(r, 0)
          .lineTo(tileSize, 0)
          .lineTo(tileSize, tileSize)
          .lineTo(0, tileSize)
          .lineTo(0, r)
          .arc(r, r, r, Math.PI, 1.5 * Math.PI)
          .closePath();
      } else if (isTR) {
        square
          .moveTo(0, 0)
          .lineTo(tileSize - r, 0)
          .arc(tileSize - r, r, r, 1.5 * Math.PI, 2 * Math.PI)
          .lineTo(tileSize, tileSize)
          .lineTo(0, tileSize)
          .closePath();
      } else if (isBR) {
        square
          .moveTo(0, 0)
          .lineTo(tileSize, 0)
          .lineTo(tileSize, tileSize - r)
          .arc(tileSize - r, tileSize - r, r, 0, 0.5 * Math.PI)
          .lineTo(0, tileSize)
          .closePath();
      } else if (isBL) {
        square
          .moveTo(0, r)
          .arc(r, tileSize - r, r, 0.5 * Math.PI, Math.PI)
          .lineTo(0, 0)
          .lineTo(tileSize, 0)
          .lineTo(tileSize, tileSize)
          .lineTo(0, tileSize)
          .closePath();
      } else {
        square.drawRect(0, 0, tileSize, tileSize);
      }

      square.endFill();
      square.x = col * tileSize;
      square.y = row * tileSize;
      chessBoard.addChild(square);
    }
  }

  // Chargement et placement des pièces
const initialPosition = {
    a1: "w_rook",   b1: "w_knight", c1: "w_bishop", d1: "w_queen",
    e1: "w_king",   f1: "w_bishop", g1: "w_knight", h1: "w_rook",
    a2: "w_pawn",   b2: "w_pawn",   c2: "w_pawn",   d2: "w_pawn",
    e2: "w_pawn",   f2: "w_pawn",   g2: "w_pawn",   h2: "w_pawn",
    a8: "b_rook",   b8: "b_knight", c8: "b_bishop", d8: "b_queen",
    e8: "b_king",   f8: "b_bishop", g8: "b_knight", h8: "b_rook",
    a7: "b_pawn",   b7: "b_pawn",   c7: "b_pawn",   d7: "b_pawn",
    e7: "b_pawn",   f7: "b_pawn",   g7: "b_pawn",   h7: "b_pawn",
};

  const all = Object.values(initialPosition);
  const unique = [...new Set(all)];
  const textures = {};
  for (const name of unique) {
    textures[name] = await Assets.load(`/assets/${name}.png`);
  }

  for (const [sq, piece] of Object.entries(initialPosition)) {
    const file = sq.charCodeAt(0) - "a".charCodeAt(0);
    const rank = 8 - parseInt(sq[1], 10);
    const spr  = new Sprite(textures[piece]);
    spr.anchor.set(0.5);
    spr.width = spr.height = tileSize * 0.9;
    spr.name  = `piece_${sq}`;
    spr.zIndex = 1;
    spr.x = file * tileSize + tileSize / 2;
    spr.y = rank * tileSize + tileSize / 2;
    chessBoard.addChild(spr);
  }

  return { app, boardContainer, chessBoard, tileSize, boardSize };
}
