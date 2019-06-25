import * as tf from '@tensorflow/tfjs';

import { makeStorage } from '../util';

import { kInputPlanes } from '../neural/network';
import NetworkFactory from '../neural/factory';
import { saveWeights } from '../neural/loader';
import BitIterator from '../neural/bititer';

export function Training(options) {

  const data = JSON.parse(makeStorage('v4training').get()),
        network = NetworkFactory.LoadNetwork(options);

  this.run = () => {
    const { value, policy } = network.model;

    value.compile({
      optimizer: 'sgd',
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });

    policy.compile({
      optimizer: 'sgd',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    let xs = tf.buffer([data.length, kInputPlanes, 8, 8]);
    
    var flat = xs.values;


    let iterIdx = 0;
    for (const inputIdx in data) {
      var sample = data[inputIdx].planes;

      for (const mask of sample) {
        for (var bit of BitIterator(mask)) {
          flat[iterIdx + bit] = 1;
        }
        iterIdx += 64;
      }
    }

    let vYs = data.map(_ => _.bestQ),
        pYs = data.map(_ => _.probabilities);

    xs = xs.toTensor();
    xs = xs.reshape([-1, kInputPlanes * 8 * 8]);
    vYs = tf.tensor1d(vYs);
    pYs = tf.tensor2d(pYs, [pYs.length, 4]);

    return Promise
      .all([value.fit(xs, vYs, { verbose: 2 }),
            policy.fit(xs, pYs, { verbose: 2 })])
      .then(hs => {
        saveWeights(network.model);
        console.log(tf.memory().numTensors);
        return hs[0].history;
      });
  };

}
