import { makeStorage } from '../util';

export default function V4TrainingData() {
  this.probabilities = [-1, -1, -1, -1];

  this.planes = [];
  for (var i = 0; i < 56; i++) {
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
