// src/pieceMovement.js
import { move, inCheck, legalMovesFrom, getTurn, getKingSquare } from "./logic/gameState.js";
import { squareToCoords, coordsToSquare } from "./logic/coordinateUtils.js";
import { Graphics, Ticker } from "pixi.js";
import { updateHistoryDisplay } from "./init.js";

let sel, orgPos, orgSq, highlights = [];

export function makePiecesDraggable(piecesCont, hlCont, squareGraphics, sounds, ts) {
  piecesCont.parent.sortableChildren = true;
  hlCont.sortableChildren = true;

  piecesCont.children.forEach(piece => {
    piece.interactive = true;
    piece.buttonMode = true;
    piece
      .on('pointerdown', e => startDrag(e, hlCont, piecesCont, squareGraphics, ts))
      .on('pointermove', dragMove)
      .on('pointerup',   e => endDrag(e, piecesCont, hlCont, squareGraphics, sounds, ts))
      .on('pointerupoutside', e => endDrag(e, piecesCont, hlCont, squareGraphics, sounds, ts));
  });
}

function startDrag(event, hlCont, piecesCont, squareGraphics, ts) {
  highlights.forEach(h => h.parent && h.parent.removeChild(h));
  highlights = [];

  sel = event.currentTarget;
  orgPos = { x: sel.x, y: sel.y };
  orgSq  = coordsToSquare(orgPos.x, orgPos.y, ts);
  sel.data = event.data;
  piecesCont.sortableChildren = true;
  sel.zIndex = piecesCont.children.length;

  const moves = legalMovesFrom(orgSq);
  moves.forEach(sq => {
    const { x, y } = squareToCoords(sq, ts);
    const capSprite = piecesCont.children.find(s => s.name === `piece_${sq}`);
    let indicator;
    const size = ts * 0.3;
    if (capSprite) {
      indicator = new Graphics()
        .beginFill(0xff0000, 0.8)
        .drawRoundedRect(-size/2, -size/2, size, size, size * 0.1)
        .endFill();
      indicator.x = capSprite.x;
      indicator.y = capSprite.y;
      indicator.zIndex = piecesCont.parent.getChildIndex(piecesCont) + 1;
      piecesCont.parent.addChild(indicator);
    } else {
      indicator = new Graphics()
        .beginFill(0x555555, 0.5)
        .drawRoundedRect(-size/2, -size/2, size, size, size * 0.1)
        .endFill();
      indicator.x = x;
      indicator.y = y;
      indicator.zIndex = hlCont.zIndex;
      hlCont.addChild(indicator);
    }
    highlights.push(indicator);
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
  highlights.forEach(h => h.parent && h.parent.removeChild(h));
  highlights = [];

  const pos = sel.data.getLocalPosition(sel.parent);
  const dropSq = coordsToSquare(pos.x, pos.y, ts);
  const res = move(orgSq, dropSq);

  if (res) {
    if (res.flags.includes('k') || res.flags.includes('q')) {
      sounds['castle']?.play();
      animateCastling(piecesCont, res, ts);
    } else if (res.captured) {
      sounds['capture']?.play();
      const cap = piecesCont.children.find(s => s.name === `piece_${dropSq}`);
      if (cap) piecesCont.removeChild(cap);
      const { x, y } = squareToCoords(res.to, ts);
      sel.x = x; sel.y = y; sel.name = `piece_${res.to}`;
    } else {
      const key = inCheck() ? 'move-check' : 'move-self';
      sounds[key]?.play();
      const { x, y } = squareToCoords(res.to, ts);
      sel.x = x; sel.y = y; sel.name = `piece_${res.to}`;
    }
    if (inCheck()) {
      sounds['check']?.play();
      animateCheck(squareGraphics, getKingSquare());
    }

    updateHistoryDisplay();
  } else {
    sounds['invalid']?.play();
    sel.x = orgPos.x; sel.y = orgPos.y;
  }

  sel.data = null;
  sel = null;
}

function animateCastling(piecesCont, moveResult, ts) {
  const kingFrom = moveResult.from;
  const kingTo   = moveResult.to;
  const rank     = kingTo[1];
  const isKing   = moveResult.flags.includes('k');
  const rookFrom = `${isKing ? 'h':'a'}${rank}`;
  const rookTo   = `${isKing ? 'f':'d'}${rank}`;
  const king = piecesCont.children.find(s => s.name === `piece_${kingFrom}`);
  const rook = piecesCont.children.find(s => s.name === `piece_${rookFrom}`);
  if (!king || !rook) return;
  const kStart = { x: king.x, y: king.y };
  const rStart = { x: rook.x, y: rook.y };
  const kDest  = squareToCoords(kingTo, ts);
  const rDest  = squareToCoords(rookTo, ts);
  let count = 0; const steps = 30;
  const ticker = new Ticker();
  ticker.add(() => {
    count++;
    const t = Math.min(count/steps, 1);
    king.x = kStart.x + (kDest.x - kStart.x) * t;
    king.y = kStart.y + (kDest.y - kStart.y) * t;
    rook.x = rStart.x + (rDest.x - rStart.x) * t;
    rook.y = rStart.y + (rDest.y - rStart.y) * t;
    if (count >= steps) {
      king.x = kDest.x; king.y = kDest.y;
      rook.x = rDest.x; rook.y = rDest.y;
      king.name = `piece_${kingTo}`; rook.name = `piece_${rookTo}`;
      ticker.stop();
    }
  });
  ticker.start();
}

function animateCheck(squareGraphics, kingSq) {
  const sq = squareGraphics[kingSq]; if (!sq) return;
  const pattern = [100, 100, 100]; let toggle = false, step = 0;
  function next() {
    if (step >= pattern.length) { sq.tint = 0xffffff; sq.alpha = 1; return; }
    sq.tint = toggle ? 0xffffff : 0xff0000;
    sq.alpha = toggle ? 1 : 0.5;
    toggle = !toggle; setTimeout(next, pattern[step]); step++;
  }
  next();
}
