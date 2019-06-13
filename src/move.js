const dirRight = [-1, 0];
const dirLeft = [1, 0];
const dirUp = [0, -1];
const dirDown = [0, 1];

function move(s, dir) {
  console.log(dir);
}

export const right = (s) => move(s, dirRight);
export const left = (s) => move(s, dirLeft);
export const up = (s) => move(s, dirUp);
export const down = (s) => move(s, dirDown);
