import { pos2key } from './util';

const roles = { '#': 'wall', '.': 'target', ' ': 'space', '$': 'box', '*': 'boxtarget', '@': 'char', 'o': 'chartarget' };

const invRoles = { 'wall': '#', 'target': '.', 'space': ' ', 'box': '$', 'boxtarget': '*', 'char': '@', 'chartarget': 'o' };

export function read(fen) {
  var split = fen.split(';');
  var noPushPly = parseInt(split[1] || '0');
  fen = fen.split(';')[0];
  var squares = {};
  var pieces = {};
  const lines = fen.split('\n');
  const maxColumns = lines.reduce((acc, line) => (acc < line.length) ?line.length:acc, 0);

  var needRows = 20 - lines.length;

  while (needRows-- > 0) {
    lines.push("#");
  }

  lines.slice(0, 20).forEach((line, row) => {
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
      case 'chartarget':
        squares[pos2key([col, row])] = {
          role: 'target'
        };
        pieces[pos2key([col, row])] = {
          role: 'char'
        };
        break;
      default:
        squares[pos2key([col, row])] = {
          role: roles[role]
        };
      }
    }
  });

  return { squares, pieces, noPushPly };
};

export function write(squares, pieces, noPushPly) {
  var res = '';
  for (var row = 0; row < 20; row++) {
    var line = '';
    for (var col = 0; col < 20; col++) {
      const square = squares[pos2key([col, row])];
      const piece = pieces[pos2key([col, row])];
      var char;
      if (piece) {
        if (piece.role === 'box') {
          if (square.role === 'space') {
            char = invRoles['box'];
          } else {
            char = invRoles['boxtarget'];
          }
        } else {
          if (square.role === 'space') {
            char = invRoles['char'];
          } else {
            char = invRoles['chartarget'];
          }
        }
      } else {
        char = invRoles[square.role];
      }
      line += char;
    }
    res += line + '\n';
  }
  if (noPushPly) 
    res +=  ';' + noPushPly;
  return res;
}


export function loadLevels(path) {
  return fetch(path)
    .then(function(response) {
      return response.json();
    });
}
