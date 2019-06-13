import { configure } from './config';
import { write as fenWrite } from './fen';
import * as move from './move';

export function start(state, redraw) {
  return {
    set(config) {
      render(state => configure(state, config), state);
    },
    getFen() {
      return fenWrite(state.squares, state.pieces);
    },
    move(dir) {
      render(state => {
        switch (dir) {
        case 'right':
          move.right(state);
          break;
        case 'left':
          move.left(state);
          break;
        case 'up':
          move.up(state);
          break;
        case 'down':
          move.down(state);
          break;
        }
      }, state);
    },
  };  
};


function render(mutation, state) {
  const result = mutation(state);
  state.dom.redraw();
  return result;
}
