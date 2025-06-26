// src/logic/gameState.js
import ChessEngine from "./chessEngine.js";

const engine = new ChessEngine();
export default engine;
export const move = (from, to, promotion = 'q') => engine.move(from, to, promotion);
export const undo = () => engine.undo();
export const inCheck = () => engine.inCheck();
export const inCheckmate = () => engine.inCheckmate();
export const inDraw = () => engine.inDraw();
export const legalMoves = () => engine.legalMoves();
export const legalMovesFrom = square => engine.legalMovesFrom(square);
export const getTurn = () => engine.getTurn();
export const getKingSquare = () => engine.getKingSquare();