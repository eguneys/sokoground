import * as move from './move';

export function bindDocument(s) {

  const unbinds = [];

  const onKeyDown = startMove(s);

  unbinds.push(unbindable(document, 'keydown', onKeyDown));

  return () => { unbinds.forEach(f => f()); };
}

function unbindable(el, eventName, callback) {
  el.addEventListener(eventName, callback);
  return () => el.removeEventListener(eventName, callback);
}

function startMove(s) {
  return function(e) {
    switch (e.code) {
    case "ArrowUp":
      move.up(s);
      break;
    case "ArrowDown":
      move.down(s);
      break;
    case "ArrowLeft":
      move.left(s);
      break;
    case "ArrowRight":
      move.right(s);
      break;
    }
  };
}
