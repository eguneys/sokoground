function callUserFunction(f) {
  if (f) setTimeout(f, 0);
}

function baseMove(s, orig, dest, dest2) {
  if (s.pieces[dest]) {
    s.pieces[dest2] = s.pieces[dest];
  }
  s.pieces[dest] = s.pieces[orig];
  delete s.pieces[orig];

  callUserFunction(s.events.move);
}

function canMove(s, orig, dest, dest2) {
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

export function move(s, orig, dest, dest2) {
  if (canMove(s, orig, dest, dest2)) {
    baseMove(s, orig, dest, dest2);
  }
}
