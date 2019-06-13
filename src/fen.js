import { pos2key } from './util';

const roles = { '#': 'wall', '.': 'target', ' ': 'space', '$': 'box', '@': 'char' };

export function read(fen) {
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
      pieces[pos2key([col, row])] = {
        role: roles[role]
      };
    }
  });

  return pieces;
};


export function loadLevels(cb) {
  fetch('./assets/Original.json')
    .then(function(response) {
      return response.json();
    })
    .then(cb);
}
