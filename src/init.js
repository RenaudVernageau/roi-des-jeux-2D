import { initBoard }           from "./chessboard.js";
import { makePiecesDraggable } from "./pieceMovement.js";
import { addNotation }         from "./notationLayer.js";
import { BoardState }          from "./state/boardState.js";
import { GameState }           from "./logic/gameState.js";

// Position initiale des pièces
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

// Bouton Restart
document.getElementById("restart").addEventListener("click", () => {
  window.location.reload();
});

(async () => {
  // 1. Initialise le plateau
  const { app, boardContainer, chessBoard, tileSize, boardSize } =
    await initBoard("pixi-container");

  // 2. État et logique
  const boardState = new BoardState(initialPosition);
  const game       = new GameState(boardState);

  // 3. Place et rends draggable
  chessBoard.children
    .filter(c => c.name?.startsWith("piece_"))
    .forEach(sprite => {
      sprite.square  = sprite.name.split("_")[1];
      sprite.pieceId = initialPosition[sprite.square];
      makePiecesDraggable(
        sprite,
        app,
        chessBoard,
        boardContainer,
        boardState,
        game,
        boardSize,
        tileSize
      );
    });

  // 4. Notation
  addNotation(chessBoard, boardSize, tileSize, { offset: tileSize * 0.4 });
})();
