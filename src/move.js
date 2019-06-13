import { pos2key, key2pos } from './util';
import * as board from './board';

const dirRight = [1, 0];
const dirLeft = [-1, 0];
const dirUp = [0, -1];
const dirDown = [0, 1];

function move(s, dir) {
  const origKey = findChar(s),
        origPos = key2pos(origKey),
        destPos = [origPos[0] + dir[0],
                   origPos[1] + dir[1]],
        dest2Pos = [destPos[0] + dir[0],
                    destPos[1] + dir[1]],
        destKey = pos2key(destPos),
        dest2Key = pos2key(dest2Pos);
  

  board.move(s, origKey, destKey, dest2Key);

  s.dom.redraw();
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
