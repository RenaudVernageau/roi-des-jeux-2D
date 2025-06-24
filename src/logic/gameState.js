export class GameState {
  constructor(boardState) {
    this.boardState    = boardState;
    this.currentPlayer = "white";
    this.history       = [];
  }

  canMovePiece(pieceId) {
    return (this.currentPlayer === "white" && pieceId.startsWith("w_"))
        || (this.currentPlayer === "black" && pieceId.startsWith("b_"));
  }

  nextTurn() {
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
  }

  recordMove(move) {
    this.history.push(move);
  }

  isGameOver() {
    return false;
  }
}
