export default function PositionHistory() {
  var positions = [];

  this.last = () => {
    return positions.slice(-1)[0];
  };

  this.reset = (board) => {
    positions = [];
    positions.push(board);
  };

  this.append = (move) => {
    
  };
};
