export function read(fen) {
  console.log(fen);
};


export function loadLevels(cb) {
  fetch('./assets/Original.json')
    .then(function(response) {
      return response.json();
    })
    .then(cb);
}
