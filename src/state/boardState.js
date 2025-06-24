export class BoardState {
  constructor(initialPosition) {
    this.positions = { ...initialPosition };
  }

  squareToCoords(square) {
    const file = square.charCodeAt(0) - 97;
    const rank = 8 - parseInt(square[1], 10);
    return { x: file, y: rank };
  }

  snapToSquare(sprite, tileSize) {
    const { x, y } = this.squareToCoords(sprite.square);
    sprite.x = x * tileSize + tileSize / 2;
    sprite.y = y * tileSize + tileSize / 2;
  }
}
