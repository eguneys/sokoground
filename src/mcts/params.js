import { merge2 } from '../util';

export default function SearchParams(options) {
  
  const kTemperature = options.kTemperature,
        kTemperatureVisitOffset = options.kTemperatureVisitOffset,
        kTemperatureWinpctCutoff = options.kTemperatureWinpctCutoff,
        kCpuct = options.kCpuct,
        kCpuctFactor = options.kCpuctFactor,
        kCpuctBase = options.kCpuctBase,
        kFpuValue = options.kFpuValue,
        kFpuValueAtRoot = kFpuValue;

  const kNoPush = options.kNoPush;

  this.getTemperature = () => {
    return kTemperature;
  };

  this.getTemperatureVisitOffset = () => {
    return kTemperatureVisitOffset;
  };

  this.getTemperatureWinpctCutoff = () => {
    return kTemperatureWinpctCutoff;
  };


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
  merge2(options, defaults());
}

const defaults = () => ({
  kCpuct: 1.2,
  kCpuctBase: 19652,
  kCpuctFactor: 2.0,
  kFpuValue: 2,
  kNoPush: 30,
  kTemperatureVisitOffset: 0,
  kTemperatureWinpctCutoff: 10,
  kTemperature: 0 // 0 100
});
