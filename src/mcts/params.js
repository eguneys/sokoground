export default function SearchParams(options) {
  
  const kCpuct = options.kCpuct,
        kFpuValue = options.kFpuValue,
        kFpuValueAtRoot = kFpuValue;

  const kNoPush = options.kNoPush;
  
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
  options.kCpuct = options.kCpuct || 1.4;
  options.kFpuValue = options.kFpuValue || 1.2;
  options.kNoPush = options.kNoPush || 20;
}
