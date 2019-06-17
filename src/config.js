import { read as fenRead } from './fen';

export function configure(state, config) {

  merge(state, config);

  if (state.level) {
    config.fen = state.levels[state.level - 1];
  }
  if (config.fen) {
    const { squares, pieces, noPushPly } = fenRead(config.fen);
    state.squares = squares;
    state.pieces = pieces;
    state.noPushPly = noPushPly;
  }

}


function merge(base, extend) {
  for (let key in extend) {
    if (isObject(base[key]) && isObject(extend[key])) merge(base[key], extend[key]);
    else base[key] = extend[key];
  }
}

function isObject(o) {
  return typeof o === 'object';
}
