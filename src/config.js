import { read as fenRead } from './fen';

export function configure(state, config) {

  merge(state, config);

  if (config.level) {
    config.fen = state.levels[config.level - 1];
  }
  if (config.fen) {
    state.pieces = fenRead(config.fen);
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
