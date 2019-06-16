import stringHash from 'string-hash';
import { write as fenWrite, read as fenRead } from '../fen';
import * as board from '../board';
import * as move from '../move';

const roles = { '#': 'wall', '.': 'target', ' ': 'space', '$': 'box', '*': 'boxtarget', '@': 'char' };

const invRoles = { 'wall': '#', 'target': '.', 'space': ' ', 'box': '$', 'boxtarget': '*', 'char': '@' };

export default function Sokoban() {

  this.applyMove = (dir) => {
    switch (dir) {
    case 'up':
      dir = move.dirUp;
      break;
    case 'left':
      dir = move.dirLeft;
    case 'right':
      dir = move.dirRight;
    case 'down':
      dir = move.dirDown;
    }
    var s = this.piecesSquares();
    var { orig, dest, dest2 } = move.dests(s, dir);

    board.apiMove({ ...s, events: {} }, orig, dest, dest2);
    this.fen = fenWrite(s.squares, s.pieces);
  };

  this.piecesSquares = () => {
    if (!this._pieces) {
      this._pieces = fenRead(this.fen);
    }
    return this._pieces;
  };

  this.setFromFen = (fen) => {
    this.fen = fen;
  };

  const encodePiece = (role) => {
    return function() {
      let res = "";
      const { pieces, squares } = this.piecesSquares();

      for (var key of Object.keys(pieces)) {
        var piece = pieces[key];
        if (piece.role === role)
          res += key;
      }
      return stringHash(res);
    };
  };

  const encodeSquare = (role) => {
    return function() {
      let res = "";
      const { pieces, squares } = this.piecesSquares();

      for (var key of Object.keys(squares)) {
        var square = squares[key];
        if (square.role === role)
          res += key;
      }
      return stringHash(res);
    };
  };

  this.boxes = encodePiece('box');

  this.char = encodePiece('char');

  this.targets = encodeSquare('target');

  this.walls = encodeSquare('wall');

  this.isEnd = () => {
    return this.fen.indexOf(invRoles['box']) === -1;
  };

  this.getLegalMoves = () => {

    const { pieces, squares } = this.piecesSquares();

    return board.legalMoves({ pieces, squares});
  };
}

export function moveAsNNIndex(move) {
  const moves = ['up', 'left', 'down', 'right'];
  return moves.indexOf(move);
}
