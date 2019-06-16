export default function PositionHistory() {
  var positions = [];

  this.last = () => {
    return positions.slice(-1)[0];
  };

  this.getPositionAt = (idx) => {
    return positions[idx];
  };

  this.getLength = () => {
    return positions.length;
  };

  this.reset = (board) => {
    positions = [];
    positions.push(board);
  };

  this.append = (move) => {
    
  };
};
