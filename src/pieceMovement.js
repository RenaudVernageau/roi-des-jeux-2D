// src/pieceMovement.js
import { move, inCheck, legalMovesFrom, getTurn, getKingSquare } from "./logic/gameState.js";
import { squareToCoords, coordsToSquare } from "./logic/coordinateUtils.js";
import { Graphics, Ticker } from "pixi.js";

let sel, orgPos, orgSq, dots = [];

export function makePiecesDraggable(piecesCont, hlCont, squareGraphics, sounds, ts) {
  piecesCont.children.forEach(piece => {
    piece.interactive = true;
    piece.buttonMode = true;
    piece
      .on('pointerdown', e => startDrag(e, hlCont, ts))
      .on('pointermove', dragMove)
      .on('pointerup',   e => endDrag(e, piecesCont, hlCont, squareGraphics, sounds, ts))
      .on('pointerupoutside', e => endDrag(e, piecesCont, hlCont, squareGraphics, sounds, ts));
  });
}

function startDrag(event, hlCont, ts) {
  sel = event.currentTarget;
  orgPos = { x: sel.x, y: sel.y };
  orgSq  = coordsToSquare(orgPos.x, orgPos.y, ts);
  sel.data = event.data;

  // Afficher les coups légaux
  const moves = legalMovesFrom(orgSq);
  dots = moves.map(sq => {
    const { x, y } = squareToCoords(sq, ts);
    const dot = new Graphics()
      .beginFill(0x333333)
      .drawCircle(0, 0, ts * 0.1)
      .endFill();
    dot.x = x;
    dot.y = y;
    hlCont.addChild(dot);
    return dot;
  });

  console.log(`Turn: ${getTurn() === 'w' ? 'White' : 'Black'}`);
}

function dragMove() {
  if (!sel) return;
  const pos = sel.data.getLocalPosition(sel.parent);
  sel.x = pos.x;
  sel.y = pos.y;
}

function endDrag(event, piecesCont, hlCont, squareGraphics, sounds, ts) {
  if (!sel) return;

  // Nettoyer les pastilles
  dots.forEach(d => hlCont.removeChild(d));
  dots = [];

  const dropPos = sel.data.getLocalPosition(sel.parent);
  const dropSq  = coordsToSquare(dropPos.x, dropPos.y, ts);
  const res     = move(orgSq, dropSq);

  if (res) {
    // Petit ou grand roque ?
    if (res.flags.includes('k') || res.flags.includes('q')) {
      sounds['castle']?.play();
      animateCastling(piecesCont, res, ts);
    }
    // Capture
    else if (res.captured) {
      sounds['capture']?.play();
      const capName   = `piece_${dropSq}`;
      const capSprite = piecesCont.children.find(s => s.name === capName);
      if (capSprite) piecesCont.removeChild(capSprite);
      const { x, y } = squareToCoords(res.to, ts);
      sel.x = x;
      sel.y = y;
      sel.name = `piece_${res.to}`;
    }
    // Déplacement simple
    else {
      if (inCheck()) sounds['move-check']?.play();
      else               sounds['move-self']?.play();
      const { x, y } = squareToCoords(res.to, ts);
      sel.x = x;
      sel.y = y;
      sel.name = `piece_${res.to}`;
    }

    // Échec ?
    if (inCheck()) {
      sounds['game-end']; // pas jouer ici
      const kingSq = getKingSquare();
      animateCheck(squareGraphics, kingSq);
    }
  } else {
    // Coup invalide
    sounds['invalid']?.play();
    sel.x = orgPos.x;
    sel.y = orgPos.y;
  }

  sel.data = null;
  sel = null;
}

/**
 * Anime le roque (petit ou grand) : le roi et la tour glissent simultanément.
 */
function animateCastling(piecesCont, moveResult, ts) {
  const kingFrom  = moveResult.from;
  const kingTo    = moveResult.to;
  const rank      = kingTo[1];
  const isKingSide = moveResult.flags.includes('k');
  const rookFrom  = `${isKingSide ? 'h' : 'a'}${rank}`;
  const rookTo    = `${isKingSide ? 'f' : 'd'}${rank}`;

  const kingSprite = piecesCont.children.find(s => s.name === `piece_${kingFrom}`);
  const rookSprite = piecesCont.children.find(s => s.name === `piece_${rookFrom}`);
  if (!kingSprite || !rookSprite) return;

  const kingStart = { x: kingSprite.x, y: kingSprite.y };
  const rookStart = { x: rookSprite.x, y: rookSprite.y };
  const kingDest  = squareToCoords(kingTo, ts);
  const rookDest  = squareToCoords(rookTo, ts);

  const steps = 30;
  let count = 0;
  const ticker = new Ticker();

  ticker.add(() => {
    count++;
    const t = Math.min(count / steps, 1);
    kingSprite.x = kingStart.x + (kingDest.x - kingStart.x) * t;
    kingSprite.y = kingStart.y + (kingDest.y - kingStart.y) * t;
    rookSprite.x = rookStart.x + (rookDest.x - rookStart.x) * t;
    rookSprite.y = rookStart.y + (rookDest.y - rookStart.y) * t;

    if (count >= steps) {
      kingSprite.x = kingDest.x;
      kingSprite.y = kingDest.y;
      rookSprite.x = rookDest.x;
      rookSprite.y = rookDest.y;
      kingSprite.name = `piece_${kingTo}`;
      rookSprite.name = `piece_${rookTo}`;
      ticker.stop();
    }
  });

  ticker.start();
}

/**
 * Fait clignoter la case du roi en échec (3 flashes rapides).
 */
function animateCheck(squareGraphics, kingSq) {
  const square = squareGraphics[kingSq];
  if (!square) return;

  const pattern = [100, 100, 100];
  let toggled = false;
  let step = 0;

  function next() {
    if (step >= pattern.length) {
      square.tint  = 0xffffff;
      square.alpha = 1;
      return;
    }
    square.tint  = toggled ? 0xffffff : 0xff0000;
    square.alpha = toggled ? 1 : 0.5;
    toggled = !toggled;
    setTimeout(next, pattern[step]);
    step++;
  }

  next();
}
