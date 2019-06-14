import { read as fenRead } from '../fen';
import * as board from '../board';

const roles = { '#': 'wall', '.': 'target', ' ': 'space', '$': 'box', '*': 'boxtarget', '@': 'char' };

const invRoles = { 'wall': '#', 'target': '.', 'space': ' ', 'box': '$', 'boxtarget': '*', 'char': '@' };

export default function Sokoban() {

  this.setFromFen = (fen) => {
    this.fen = fen;
  };


  this.isEnd = () => {
    return this.fen.indexOf(invRoles['box']) === -1;
  };

  this.getLegalMoves = () => {

    const { pieces, squares } = fenRead(this.fen);

    return board.legalMoves({ pieces, squares});
  };
}
