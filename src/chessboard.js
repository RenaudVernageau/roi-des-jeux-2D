// src/chessboard.js
import { Container, Graphics, Assets, Sprite } from "pixi.js";

/**
 * Crée un échiquier avec mapping des cases et conteneurs pour pièces et surbrillances.
 */
export async function createBoard(parentContainer, boardSize, tileSize) {
  const boardContainer = new Container();
  boardContainer.sortableChildren = true;
  parentContainer.addChild(boardContainer);

  // mapping des Graphics de chaque case par notation
  const squareGraphics = {};

  // Bordure
  const borderPadding = tileSize * 0.08;
  const border = new Graphics()
    .beginFill(0xffffff)
    .drawRoundedRect(
      -borderPadding,
      -borderPadding,
      tileSize * boardSize + borderPadding * 2,
      tileSize * boardSize + borderPadding * 2,
      tileSize * 0.2
    )
    .endFill();
  border.zIndex = 0;
  boardContainer.addChild(border);

  // Containers
  const chessBoard = new Container(); chessBoard.zIndex = 1; boardContainer.addChild(chessBoard);
  const highlightsContainer = new Container(); highlightsContainer.zIndex = 2; boardContainer.addChild(highlightsContainer);
  const piecesContainer = new Container(); piecesContainer.zIndex = 3; boardContainer.addChild(piecesContainer);

  // Couleurs et coins arrondis
  const lightColor = 0xf0d9b5;
  const darkColor = 0xb58863;
  const r = tileSize * 0.2;
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const square = new Graphics();
      const isDark = (row + col) % 2 === 1;
      const color = isDark ? darkColor : lightColor;
      const isTL = row === 0 && col === 0;
      const isTR = row === 0 && col === boardSize - 1;
      const isBR = row === boardSize - 1 && col === boardSize - 1;
      const isBL = row === boardSize - 1 && col === 0;
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
      // mapping pour animation d'échec
      const file = String.fromCharCode('a'.charCodeAt(0) + col);
      const rank = 8 - row;
      squareGraphics[`${file}${rank}`] = square;
    }
  }

  // Position initiale des pièces
  const initialPosition = {
    a1: "w_rook", b1: "w_knight", c1: "w_bishop", d1: "w_queen",
    e1: "w_king", f1: "w_bishop", g1: "w_knight", h1: "w_rook",
    a2: "w_pawn", b2: "w_pawn", c2: "w_pawn", d2: "w_pawn",
    e2: "w_pawn", f2: "w_pawn", g2: "w_pawn", h2: "w_pawn",
    a8: "b_rook", b8: "b_knight", c8: "b_bishop", d8: "b_queen",
    e8: "b_king", f8: "b_bishop", g8: "b_knight", h8: "b_rook",
    a7: "b_pawn", b7: "b_pawn", c7: "b_pawn", d7: "b_pawn",
    e7: "b_pawn", f7: "b_pawn", g7: "b_pawn", h7: "b_pawn",
  };
  const uniqueTextures = [...new Set(Object.values(initialPosition))];
  const textures = {};
  for (const name of uniqueTextures) textures[name] = await Assets.load(`/assets/pieces/${name}.png`);
  for (const [sq, piece] of Object.entries(initialPosition)) {
    const fileIndex = sq.charCodeAt(0) - 'a'.charCodeAt(0);
    const rankIndex = 8 - parseInt(sq[1], 10);
    const sprite = new Sprite(textures[piece]);
    sprite.anchor.set(0.5);
    sprite.width = sprite.height = tileSize * 0.9;
    sprite.name = `piece_${sq}`;
    sprite.zIndex = 4;
    sprite.x = fileIndex * tileSize + tileSize / 2;
    sprite.y = rankIndex * tileSize + tileSize / 2;
    piecesContainer.addChild(sprite);
  }

  return { boardContainer, piecesContainer, highlightsContainer, squareGraphics, tileSize, boardSize };
}