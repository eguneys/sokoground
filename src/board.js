import * as move from './move';

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
