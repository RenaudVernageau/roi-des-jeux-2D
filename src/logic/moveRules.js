// src/logic/moveRules.js

const files = "abcdefgh".split("");
const dirs = {
  king:   [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]],
  knight: [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]],
  rook:   [[1,0],[-1,0],[0,1],[0,-1]],
  bishop: [[1,1],[1,-1],[-1,1],[-1,-1]]
};

function inBoard(f, r) {
  return f >= 0 && f < 8 && r >= 0 && r < 8;
}

export function isMoveLegal(from, to, positions) {
  if (from === to) return false;
  const pieceId = positions[from];
  if (!pieceId) return false;
  const color = pieceId[0]; // 'w' or 'b'
  const type  = pieceId.slice(2); // 'pawn','rook',...
  const fi = files.indexOf(from[0]);
  const ri = 8 - parseInt(from[1],10);
  const fo = files.indexOf(to[0]);
  const ro = 8 - parseInt(to[1],10);
  const df = fo - fi, dr = ro - ri;
  const dest = positions[to];

  // can't capture own
  if (dest && dest[0] === color) return false;

  if (type === "pawn") {
    const dir = color === "w" ? -1 : 1;
    const start = color === "w" ? 6 : 1;
    if (df === 0) {
      if (dr === dir && !dest) return true;
      if (ri === start && dr === 2*dir && !dest && !positions[files[fi]+(8-(ri+dir))]) return true;
    }
    if (Math.abs(df) === 1 && dr === dir && dest && dest[0] !== color) return true;
    return false;
  }

  if (type === "knight") {
    return dirs.knight.some(([dx,dy]) => dx === df && dy === dr);
  }

  if (type === "bishop" || type === "rook" || type === "queen") {
    let vects = type === "bishop" ? dirs.bishop
             : type === "rook"   ? dirs.rook
             : dirs.bishop.concat(dirs.rook);
    for (let [dx,dy] of vects) {
      for (let step=1; ; step++) {
        const x = fi + dx*step, y = ri + dy*step;
        if (!inBoard(x,y)) break;
        const sq = files[x] + (8-y);
        if (x === fo && y === ro) return true;
        if (positions[sq]) break;
      }
    }
    return false;
  }

  if (type === "king") {
    return dirs.king.some(([dx,dy]) => dx === df && dy === dr);
  }

  return false;
}
