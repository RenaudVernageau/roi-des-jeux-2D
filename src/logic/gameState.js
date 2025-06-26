import ChessEngine from "./chessEngine.js";

let chessEngine = new ChessEngine();

export function resetGame() {
  chessEngine = new ChessEngine(); // recrée une nouvelle partie propre
}

// Fonctions nécessaires :
export const move = (from, to) => chessEngine.move(from, to);
export const inCheck = () => chessEngine.inCheck();
export const legalMovesFrom = (square) => chessEngine.legalMovesFrom(square);
export const getTurn = () => chessEngine.getTurn();
export const getKingSquare = () => {
  const turn = chessEngine.getTurn();
  const fen = chessEngine.getFen().split(" ")[0];
  const rows = fen.split("/");
  for (let rank = 0; rank < 8; rank++) {
    let file = 0;
    for (const char of rows[rank]) {
      if (isNaN(char)) {
        if (char === (turn === "w" ? "K" : "k")) {
          return `${String.fromCharCode(97 + file)}${8 - rank}`;
        }
        file++;
      } else {
        file += parseInt(char);
      }
    }
  }
};

export function getHistory() {
  return chessEngine.chess.history(); // retire simplement verbose:false
}
