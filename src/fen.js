import { pos2key } from './util';

const roles = { '#': 'wall', '.': 'target', ' ': 'space', '$': 'box', '*': 'boxtarget', '@': 'char' };

const invRoles = { 'wall': '#', 'target': '.', 'space': ' ', 'box': '$', 'boxtarget': '*', 'char': '@' };

export function read(fen) {
  var squares = {};
  var pieces = {};
  const lines = fen.split('\n');
  const maxColumns = lines.reduce((acc, line) => (acc < line.length) ?line.length:acc, 0);

  var needRows = 20 - lines.length;

  while (needRows-- > 0) {
    lines.push("#");
  }

  lines.forEach((line, row) => {
    while (line.length < maxColumns) {
      line = line + " ";
    }

    var gap = 20 - maxColumns;
    if (gap > 0) {
      var left = Math.floor(gap / 2);
      var right = left + gap % 2;
      while (left-- > 0) {
        line = "#" + line;
      }
      while (right-- > 0) {
        line = line + "#";
      }
    }

    for (var col = 0; col < line.length; col++) {
      var role = line[col];
      switch (roles[role]) {
      case 'char':
        squares[pos2key([col, row])] = {
          role: 'space'
        };
        pieces[pos2key([col, row])] = {
          role: 'char'
        };
        break;
      case 'box':
        squares[pos2key([col, row])] = {
          role: 'space'
        };
        pieces[pos2key([col, row])] = {
          role: 'box'
        };
        break;
      case 'boxtarget':
        squares[pos2key([col, row])] = {
          role: 'target'
        };
        pieces[pos2key([col, row])] = {
          role: 'box'
        };
        break;
      default:
        squares[pos2key([col, row])] = {
          role: roles[role]
        };
      }
    }
  });

  return { squares, pieces };
};

export function write(squares, pieces) {
  var res = '';
  for (var x = 0; x < 20; x++) {
    var line = '';
    for (var y = 0; y < 20; y++) {
      const square = squares[pos2key([x, y])];
      const piece = pieces[pos2key([x, y])];
      var char;
      if (piece) {
        if (piece.role === 'box') {
          if (square.role === 'space') {
            char = invRoles['box'];
          } else {
            char = invRoles['boxtarget'];
          }
        } else {
          char = invRoles['char'];
        }
      } else {
        char = invRoles[square.role];
      }
      line += char;
    }
    res += line + '\n';
  }
  return res;
}


export function loadLevels(cb) {
  fetch('./assets/Original.json')
    .then(function(response) {
      return response.json();
    })
    .then(cb);
}
