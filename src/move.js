import { pos2key, key2pos } from './util';
import * as board from './board';

export const dirRight = [1, 0];
export const dirLeft = [-1, 0];
export const dirUp = [0, -1];
export const dirDown = [0, 1];

export function dests(s, dir) {
  const origKey = findChar(s),
        origPos = key2pos(origKey),
        destPos = [origPos[0] + dir[0],
                   origPos[1] + dir[1]],
        dest2Pos = [destPos[0] + dir[0],
                    destPos[1] + dir[1]],
        destKey = pos2key(destPos),
        dest2Key = pos2key(dest2Pos);
  
  return { orig: origKey,
           dest: destKey,
           dest2: dest2Key };
}

function move(s, dir) {

  const { orig, dest, dest2 } = dests(s, dir);

  board.apiMove(s, orig, dest, dest2);

  s.dom.redraw();
}

export function findChar(s) {
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
