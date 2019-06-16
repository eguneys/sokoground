function Position(board) {
  let repetitions = 0;

  this.getBoard = () => {
    return board;
  };

  this.setRepetitions = (n) => {
    repetitions = n;
  };

  this.getRepetitions = () => {
    return repetitions;
  };
}

export default function PositionHistory() {
  var positions = [];

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

  this.reset = (board) => {
    positions = [];
    positions.push(new Position(board));
  };

  this.append = (move) => {
    this.last().getBoard().applyMove(move);
    positions.push(this.last());
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
