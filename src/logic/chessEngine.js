// src/logic/chessEngine.js
import { Chess } from "chess.js";

/**
 * Wrapper autour de chess.js pour exposer une API simple
 */
export default class ChessEngine {
  constructor(fen) {
    this.chess = new Chess(fen);
  }

  /** Récupère la position FEN courante */
  getFen() {
    return this.chess.fen();
  }

  /**
   * Tente de jouer un coup sous forme algébrique.
   * Retourne l'objet coup si valide, null sinon.
   */
  move(from, to, promotion = "q") {
    try {
      return this.chess.move({ from, to, promotion });
    } catch {
      return null;
    }
  }

  /** Annule le dernier coup */
  undo() {
    return this.chess.undo();
  }

  /** Vérifie si le roi du joueur en cours est en échec */
  inCheck() {
    return typeof this.chess.isCheck === 'function'
      ? this.chess.isCheck()
      : this.chess.in_check();
  }

  /** Vérifie si le joueur en cours est en échec et mat */
  inCheckmate() {
    if (typeof this.chess.isCheckmate === 'function') return this.chess.isCheckmate();
    if (typeof this.chess.in_checkmate === 'function') return this.chess.in_checkmate();
    return false;
  }

  /** Vérifie si la partie est terminée (mat, pat, nulle, etc.) */
  isGameOver() {
    return typeof this.chess.isGameOver === 'function'
      ? this.chess.isGameOver()
      : this.chess.game_over();
  }

  /** Vérifie si la partie est nulle */
  inDraw() {
    return typeof this.chess.isDraw === 'function'
      ? this.chess.isDraw()
      : this.chess.in_draw();
  }

  /** Liste de tous les coups légaux (simple algébrique) */
  legalMoves() {
    return this.chess.moves();
  }

  /** Liste des destinations légales depuis une case */
  legalMovesFrom(square) {
    return (this.chess.moves({ square, verbose: true }) || []).map(m => m.to);
  }

  /** Indique le joueur dont c'est le tour ('w' ou 'b') */
  getTurn() {
    return this.chess.turn();
  }

  /** Retourne la case du roi de la couleur dont c'est le tour */
  getKingSquare() {
    const board = this.chess.board();
    const turnColor = this.chess.turn();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = board[r][f];
        if (piece && piece.type === 'k' && piece.color === turnColor) {
          const file = String.fromCharCode('a'.charCodeAt(0) + f);
          const rank = (8 - r).toString();
          return `${file}${rank}`;
        }
      }
    }
    return null;
  }
}