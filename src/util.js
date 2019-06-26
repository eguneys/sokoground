import { openDB as openIndexdb  } from 'idb';

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
  return base;
}

export function merge2(base, extend) {
  for (let key in extend) {
    if (isObject(base[key]) && isObject(extend[key])) merge(base[key], extend[key]);
    else if (!base[key]) 
      base[key] = extend[key];
  }
  return base;
}


function isObject(o) {
  return typeof o === 'object';
}

export function makeStorage(name) {
  return {
    get() {
      return window.localStorage.getItem(name);
    },
    set(value) {
      window.localStorage.setItem(name, value);
    },
    clear() {
      window.localStorage.removeItem(name);
    }
  };
}

export function makeIndexdb(name) {
  const open = () => openIndexdb("sokoapp", 2, {
    upgrade(db) {
      console.log('here');
      if (!db.objectStoreNames.contains(name)) {
        console.log(name);
        db.createObjectStore(name, { autoIncrement: true });
      }
    }
  });
  
  return {
    getAll() {
      return open().then(db => {
        return db
          .transaction(name, 'readwrite')
          .objectStore(name)
          .getAll();        
      });
    },
    add(value) {
      return open().then(db => {
        return db
          .transaction(name, 'readwrite')
          .objectStore(name)
          .add(value);
      });      
    },
    clear() {
      return open().then(db => {
        return db
          .transaction(name, 'readwrite')
          .objectStore(name)
          .clear();
      });
    }
  };
}
