import * as tf from '@tensorflow/tfjs';

import { makeStorage } from '../util';

import { kInputPlanes } from '../neural/network';
import NetworkFactory from '../neural/factory';
import { TrainingDataWriter } from '../neural/writer';
import { saveWeights } from '../neural/loader';
import BitIterator from '../neural/bititer';

export function Training(options) {

  const network = NetworkFactory.LoadNetwork(options);

  this.run = () => {
    return new TrainingDataWriter().get()
      .then(_ => {
        function step(values, history) {
          if (values.length) {
            const chunk = values.splice(0, 10000);
            console.log('training ', chunk.length + '/' + values.length);
            return train(chunk).then(_ => step(values, _));
          } else {
            return Promise.resolve(history);
          }
        };
        return step(_);
      });
  };

  const train = data => {
    console.log(data);
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

    let xsBuffer = tf.buffer([data.length, kInputPlanes, 8, 8]);
    
    var flat = xsBuffer.values;


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

    xsBuffer = xsBuffer.toTensor();

    let xs,
        vYs = data.map(_ => _.bestQ),
        pYs = data.map(_ => _.probabilities);
    
    xs = xsBuffer.reshape([-1, kInputPlanes, 8, 8]);
    vYs = tf.tensor1d(vYs);
    pYs = tf.tensor2d(pYs, [pYs.length, 4]);

    const dispose = () => [xsBuffer, xs, vYs, pYs]
          .forEach(_ => _.dispose);

    return Promise
      .all([value.fit(xs, vYs),
            policy.fit(xs, pYs)])
      .then(hs => {
        saveWeights(network.model);
        dispose();
        console.log(tf.memory().numTensors);
        return hs[0].history;
      });
  };

}
