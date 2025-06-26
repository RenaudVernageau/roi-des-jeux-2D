// src/init.js
import { Application } from "pixi.js";
import { createBoard } from "./chessboard.js";
import { makePiecesDraggable } from "./pieceMovement.js";

(async () => {
  const app = new Application();
  await app.init({ resizeTo: window, backgroundColor: "pink" });
  document.getElementById("pixi-container").appendChild(app.canvas);

  const boardSize = 8;
  const maxBoardWidth = Math.min(window.innerWidth, window.innerHeight) * 0.8;
  const tileSize = Math.floor(maxBoardWidth / boardSize);

  // List out each basename (without extension)
  const soundFiles = [
    "capture",
    "castle",
    "game-end",
    "move-check",
    "move-self",
  ];

  const sounds = {};
  soundFiles.forEach((name) => {
    const audio = new Audio(`/assets/sounds/${name}.mp3`);
    audio.volume = 0.2;
    sounds[name] = audio;
  });

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
})();
