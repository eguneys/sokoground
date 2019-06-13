const roles = { '#': 'wall', '.': 'target', ' ': 'space', '$': 'box', '@': 'char' };

export function read(fen) {
  const lines = fen.split('\n');
  const maxColumns = lines.reduce((acc, line) => (acc < line.length) ?line.length:acc, 0);
  return lines.map(line => {
    while (line.length < maxColumns) {
      line = line + " ";
    }
    return Array.prototype.map.call(line, c => ({
      role: roles[c]
    }));
  });
};


export function loadLevels(cb) {
  fetch('./assets/Original.json')
    .then(function(response) {
      return response.json();
    })
    .then(cb);
}
