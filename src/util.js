const rows = 20;

const allKeys = (() => {
  var res = [];
  for (var r = 0; r < rows; r++)
    for (var c = 0; c < rows; c++)
      res.push(r + 'x' + c);
  return res;
})();

export const pos2key = (pos) => allKeys[rows * pos[0] + pos[1]];

export const key2pos = (k) => k.split('x').map(_ => parseInt(_));

export const posToTranslate = (pos) => {
  var factor = 100 / 20;
  return [pos[0] * factor,
          pos[1] * factor];
};

export const translate = (el, percents) => {
  el.style.left = percents[0] + '%';
  el.style.top = percents[1] + '%';
}

export const createEl = (tagName, className) => {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  return el;
};

export const raf = (window.requestAnimationFrame || window.setTimeout).bind(window);

export function merge(base, extend) {
  for (let key in extend) {
    if (isObject(base[key]) && isObject(extend[key])) merge(base[key], extend[key]);
    else base[key] = extend[key];
  }
}

function isObject(o) {
  return typeof o === 'object';
}
