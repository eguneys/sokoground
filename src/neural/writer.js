import { makeStorage, makeIndexdb } from '../util';
import { kInputPlanes } from './network';

export default function V4TrainingData() {
  this.probabilities = [0, 0, 0, 0];

  this.planes = [];
  for (var i = 0; i < kInputPlanes; i++) {
    this.planes[i] = null;
  }
  
};

export function TrainingDataWriter() {

  this.storage = makeIndexdb('v4training');
  
  this.chunks = [];

  this.writeChunk = (chunk) => {
    this.chunks.push(chunk);
  };

  this.get = () => {
    return this.storage.getAll().then(values => {
      console.log(values, values.flat());
      return values.flat();
    });
  };

  this.finalize = () => {
    return this.storage.add(this.chunks);
  };

  this.clear = () => {
    return this.storage.clear();
  };

}
