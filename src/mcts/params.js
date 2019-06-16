export default function SearchParams(options) {
  
  const kCpuct = options.kCpuct,
        kFpuValue = options.kFpuValue,
        kFpuValueAtRoot = kFpuValue;
  
  this.getCpuct = () => {
    return kCpuct;
  };
  
  this.getFpuValue = (atRoot) => {
    return atRoot ? kFpuValueAtRoot : kFpuValue;
  };
}

export function populate(options) {
  options.kCpuct = 3;
  options.kFpuValue = 1.2;
}
