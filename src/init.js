// src/init.js
import { Application } from "pixi.js";
import { createBoard } from "./chessboard.js";
import { makePiecesDraggable } from "./pieceMovement.js";
import { getHistory, resetGame } from "./logic/gameState.js";

// Fonction qui met à jour l'affichage de l'historique des coups
export function updateHistoryDisplay() {
  const historyDiv = document.getElementById("move-history");
  const history = getHistory();

  let pgnText = "";
  for (let i = 0; i < history.length; i += 2) {
    const moveNumber = (i / 2) + 1;
    const whiteMove = history[i];
    const blackMove = history[i + 1] ? history[i + 1] : "";
    pgnText += `${moveNumber}. ${whiteMove} ${blackMove} `;
  }

  historyDiv.textContent = pgnText.trim();
}

(async () => {
  const app = new Application();
  await app.init({ resizeTo: window, backgroundColor: "pink" });
  document.getElementById("pixi-container").appendChild(app.canvas);

  const boardSize = 8;
  const maxBoardWidth = Math.min(window.innerWidth, window.innerHeight) * 0.8;
  const tileSize = Math.floor(maxBoardWidth / boardSize);

  const soundFiles = ["capture", "castle", "game-end", "move-check", "move-self"];
  const sounds = {};
  soundFiles.forEach((name) => {
    const audio = new Audio(`/assets/sounds/${name}.mp3`);
    audio.volume = 0.2;
    sounds[name] = audio;
  });

  async function setupGame() {
    resetGame(); // réinitialise la logique
    app.stage.removeChildren();
    
    const {
      boardContainer,
      piecesContainer,
      highlightsContainer,
      squareGraphics,
    } = await createBoard(app.stage, boardSize, tileSize);

    boardContainer.x = (app.screen.width - tileSize * boardSize) / 2;
    boardContainer.y = (app.screen.height - tileSize * boardSize) / 2;

    makePiecesDraggable(
      piecesContainer,
      highlightsContainer,
      squareGraphics,
      sounds,
      tileSize
    );

    updateHistoryDisplay(); // réinitialise aussi l'affichage de l'historique
  }

  document.getElementById("restart").addEventListener("click", setupGame);

  setupGame();
})();
