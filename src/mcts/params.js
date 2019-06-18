export default function SearchParams(options) {
  
  const kCpuct = options.kCpuct,
        kCpuctFactor = options.kCpuctFactor,
        kCpuctBase = options.kCpuctBase,
        kFpuValue = options.kFpuValue,
        kFpuValueAtRoot = kFpuValue;

  const kNoPush = options.kNoPush;

  this.getCpuctFactor = () => {
    return kCpuctFactor;
  };

  this.getCpuctBase = () => {
    return kCpuctBase;
  };
  
  this.getCpuct = () => {
    return kCpuct;
  };
  
  this.getFpuValue = (atRoot) => {
    return atRoot ? kFpuValueAtRoot : kFpuValue;
  };

  this.getNoPushValue = () => {
    return kNoPush;
  };
}

export function populate(options) {
  merge(options, defaults());
}

function merge(base, extend) {
  for (let key in extend) {
    if (isObject(base[key]) && isObject(extend[key])) merge(base[key], extend[key]);
    else base[key] = extend[key];
  }
}

function isObject(o) {
  return typeof o === 'object';
}

const defaults = () => ({
  kCpuct: 1.2,
  kCpuctBase: 19652,
  kCpuctFactor: 2.0,
  kFpuValue: 2,
  kNoPush: 20
});
