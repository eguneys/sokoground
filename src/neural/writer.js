import { makeStorage } from '../util';
import { kInputPlanes } from './network';

export default function V4TrainingData() {
  this.probabilities = [0, 0, 0, 0];

  this.planes = [];
  for (var i = 0; i < kInputPlanes; i++) {
    this.planes[i] = null;
  }
  
};

export function TrainingDataWriter() {

  this.storage = makeStorage('v4training');
  
  this.chunks = [];

  this.writeChunk = (chunk) => {
    this.chunks.push(chunk);
  };

  this.finalize = () => {
    this.storage.set(JSON.stringify(this.chunks));
  };

}
