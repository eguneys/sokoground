import { merge } from '../util';

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

const defaults = () => ({
  kCpuct: 1.2,
  kCpuctBase: 19652,
  kCpuctFactor: 2.0,
  kFpuValue: 2,
  kNoPush: 20
});
