import Sokoban from './sokoban';

function Position(board, noPushPly) {

  this.noPushPly = noPushPly;

  let repetitions = 0;

  this.getBoard = () => {
    return board;
  };

  this.getNoPush = () => {
    return this.noPushPly;
  };

  this.setRepetitions = (n) => {
    repetitions = n;
  };

  this.getRepetitions = () => {
    return repetitions;
  };
}

Position.fromParent = (parent, move) => {
  const board = new Sokoban();
  board.setFromFen(parent.getBoard().fen);
  const isPush = board.applyMove(move);
  return new Position(board, isPush ? 0 : parent.noPushPly + 1);
};

export default function PositionHistory(other) {
  var positions = [];
  if (other) {
    positions = other.getPositions();
  }

  this.getPositions = () => {
    return positions;
  };

  this.last = () => {
    return positions.slice(-1)[0];
  };

  this.getPositionAt = (idx) => {
    return positions[idx];
  };

  this.trim = (size) => {
    positions = positions.slice(0, size);
  };

  this.getLength = () => {
    return positions.length;
  };

  this.reset = (board, noPushPly) => {
    positions = [];
    positions.push(new Position(board, noPushPly));
  };

  this.append = (move) => {
    positions.push(Position.fromParent(this.last(), move));
    this.last().setRepetitions(computeLastMoveRepetitions());
  };

  const computeLastMoveRepetitions = () => {
    const last = this.last();
    for (var idx = positions.length - 3; idx >= 0; idx -= 2) {
      const pos = positions[idx];
      if (pos.getBoard() == last.getBoard()) {
        return 1 + pos.getRepetitions();
      }
    }
    return 0;
  };
};
