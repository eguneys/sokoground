import stringHash from 'string-hash';
import { write as fenWrite, read as fenRead } from '../fen';
import * as board from '../board';
import * as move from '../move';
import { key2pos, pos2key } from '../util';

const roles = { '#': 'wall', '.': 'target', ' ': 'space', '$': 'box', '*': 'boxtarget', '@': 'char' };

const invRoles = { 'wall': '#', 'target': '.', 'space': ' ', 'box': '$', 'boxtarget': '*', 'char': '@' };

export default function Sokoban() {

  this.applyMove = (dirS) => {
    var dir;
    switch (dirS) {
    case 'up':
      dir = move.dirUp;
      break;
    case 'left':
      dir = move.dirLeft;
      break;
    case 'right':
      dir = move.dirRight;
      break;
    case 'down':
      dir = move.dirDown;
      break;
    }
    var s = this.piecesSquares();
    var { orig, dest, dest2 } = move.dests(s, dir);
    var isPush = false;

    if (s.pieces[dest] && s.pieces[dest].role === 'box') {
      isPush = true;
    }

    if (!board.apiMove({ ...s, events: {} }, orig, dest, dest2)) {
      throw new Error("bad move " + dirS + "\n" + this.fen);
      
    }
    this.fen = fenWrite(s.squares, s.pieces);
    this._pieces = null;
    return isPush;
  };

  this.piecesSquares = () => {
    if (!this._pieces) {
      this._pieces = fenRead(this.fen);
    }
    return this._pieces;
  };

  this.setFromFen = (fen) => {
    this.fen = fen;
    this._pieces = null;

    const { noPushPly } = this.piecesSquares();

    return { noPushPly };
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

  this.boxtargets = () => {
    let res = "";
    const { pieces, squares } = this.piecesSquares();

    for (var key of Object.keys(pieces)) {
      var piece = pieces[key];
      var square = squares[key];
      if (piece.role === 'box' && square.role === 'target') {
        res += key;
      }
    }
    return stringHash(res);    
  };

  this.isEnd = () => {
    return this.fen.indexOf(invRoles['box']) === -1;
  };

  this.isStuck = () => {
    function addDir(pos, dir) {
      return [pos[0] + dir[0],
              pos[1] + dir[1]];
    }

    const { pieces, squares } = this.piecesSquares();

    for (var key of Object.keys(pieces)) {
      var piece = pieces[key];
      if (piece.role === 'box') {
        const pos = key2pos(key),
              left = addDir(pos, move.dirLeft),
              right = addDir(pos, move.dirRight),
              up = addDir(pos, move.dirUp),
              down = addDir(pos, move.dirDown),
              checks = [
                [left, up],
                [left, down],
                [right, up],
                [right, down]
              ];

        for (var check of checks) {
          var square1 = squares[pos2key(check[0])],
              square2 = squares[pos2key(check[1])];
          if (square1.role === 'wall' && square2.role === 'wall') {
            return true;
          }
        }
      }
    }
    return false;
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
