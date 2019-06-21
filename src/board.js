import * as move from './move';
import { key2pos, pos2key } from './util';

function callUserFunction(f) {
  if (f) setTimeout(f, 0);
}

export function isEnd(s) {
  for (var key of Object.keys(s.pieces)) {
    var box = s.pieces[key];
    if (box.role === 'box') {
      var under = s.squares[key];
      if (under.role !== 'target') {
        return false;
      }
    }
  }
  return true;
}

export function isStuck(s) {
  function addDir(pos, dir) {
    return [pos[0] + dir[0],
            pos[1] + dir[1]];
  }

  const { pieces, squares } = s;

  for (var key of Object.keys(pieces)) {
    var piece = pieces[key];
    var square = squares[key];
    if (piece.role === 'box' && square.role !== 'target') {
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
}

export function legalMoves(s) {
  const legals = [];

  const moves = {
    'right': move.dirRight,
    'left': move.dirLeft,
    'up': move.dirUp,
    'down': move.dirDown
  };

  for (var key of Object.keys(moves)) {
    const dir = moves[key],
          { orig, dest, dest2 } = move.dests(s, dir);

    if (canMove(s, orig, dest, dest2)) {
      legals.push(key);
    }
  }
  return legals;
}

function baseMove(s, orig, dest, dest2) {
  if (s.pieces[dest]) {
    s.pieces[dest2] = s.pieces[dest];
    s.noPushPly = 0;
  } else {
    s.noPushPly++;
  }
  s.pieces[dest] = s.pieces[orig];
  delete s.pieces[orig];

  callUserFunction(s.events.move);
  return true;
}

export function canMove(s, orig, dest, dest2) {
  function isEmpty(role) {
    return role === 'space' || role === 'target';
  }
  
  var isBox = s.pieces[dest] && s.pieces[dest].role === 'box';

  if (!isBox) {
    return isEmpty(s.squares[dest].role);
  } else {
    return isEmpty(s.squares[dest2].role) && !(s.pieces[dest2] && s.pieces[dest2].role === 'box');
  }
}

export function apiMove(s, orig, dest, dest2) {
  if (canMove(s, orig, dest, dest2)) {
    return baseMove(s, orig, dest, dest2);
  }
  return false;
}
