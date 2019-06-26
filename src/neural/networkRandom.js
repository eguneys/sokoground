import stringHash from 'string-hash';
import NetworkFactory from './factory';

// function Hash(val) {
//   return 0xfad0 * (val + 0xbaad) +
//     0x7ace * ((val >> 31) + 0xd571);
// }

// function HashCat(hash, x) {
//   hash ^= 0x2997 + Hash(x) + (hash << 6) + (hash >> 2);
//   return hash;
// }

function HashCat(hash, x) {
  return stringHash(hash + " " + x);
}

function RandomNetworkComputation() {
  
  const seed = 0;
  const inputs = [];

  this.addInput = (input) => {
    var hash = seed;
    
    for (var plane of input) {
      hash = HashCat(hash, plane.mask);
      hash = HashCat(hash, plane.value);
    }
    
    inputs.push(hash);
  };
  
  this.computeBlocking = () => {
  };

  this.getQVal = (sample) => {
    return ((inputs[sample] % 0xffffffff) - (0xffffffff / 2)) / (0xffffffff / 2);
  };

  this.getPVal = (sample, moveId) => {
    return (HashCat(inputs[sample], moveId) % 0xfffffff) / 0xfffffff;
  };

  this.dispose = () => {};
}

function RandomNetwork(options) {
  this.newComputation = () => {
    return new RandomNetworkComputation();
  }; 
}

function makeRandomNetwork(weights, options) {
  return new RandomNetwork(options);
}

NetworkFactory.Get().RegisterNetwork("random", makeRandomNetwork);
