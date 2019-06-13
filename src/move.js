import { pos2key, key2pos } from './util';

const dirRight = [-1, 0];
const dirLeft = [1, 0];
const dirUp = [0, -1];
const dirDown = [0, 1];

function baseMove(s, orig, dest, dest2) {
  
}

function canMove(s, key, dir) {
  return true;
}

function move(s, dir) {
  const charKey = findChar(s),
        charPos = key2pos(charKey);

  if (canMove(s, charKey, dir)) {
    baseMove(s, charKey, dir);
  }
}

function findChar(s) {
  for (var key of Object.keys(s.pieces)) {
    var piece = s.pieces[key];
    if (piece.role === 'char') {
      return key;
    }
  }
  return undefined;
}

export const right = (s) => move(s, dirRight);
export const left = (s) => move(s, dirLeft);
export const up = (s) => move(s, dirUp);
export const down = (s) => move(s, dirDown);
