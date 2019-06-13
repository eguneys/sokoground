import { configure } from './config';

export function start(state, redraw) {
  return {
    set(config) {
      render(state => configure(state, config), state);
    }
  };  
};


function render(mutation, state) {
  const result = mutation(state);
  state.dom.redraw();
  return result;
}
