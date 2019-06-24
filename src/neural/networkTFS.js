import NetworkFactory from './factory';
import * as tf from '@tensorflow/tfjs';
import { kInputPlanes } from './network';
import BitIterator from './bititer';

function MakeNetwork() {
  const hiddenNodes = 8,
        inputNodes = 58;

  const policy = tf.sequential({
    layers: [
      tf.layers.dense({
        units: hiddenNodes,
        inputShape: [inputNodes * 8 * 8],
        activation: 'sigmoid'
      }),
      tf.layers.dense({
        units: 4,
        activation: 'softmax'
      })
    ]
  });

  policy.compile({
    optimizer: 'sgd',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  const value = tf.sequential({
    layers: [
      tf.layers.dense({
        units: 8,
        inputShape: [inputNodes * 8 * 8],
      }),
      tf.layers.dense({
        units: 1,
        activation: 'tanh'
      })
    ]
  });

  value.compile({
    optimizer: 'sgd',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });


  return { value, policy };
}

function TFNetworkComputation(network) {

  let rawInput = [],
      output = [],
      input,
      status;


  this.addInput = (input) => {
    rawInput.push(input);
  };

  this.computeBlocking = () => {
    prepareInput();
    status = network.compute(input, output);
  };

  this.getQVal = (sample) => {
    return output[0].dataSync()[sample];
  };

  this.getPVal = (sample, moveId) => {
    return output[1].dataSync()[sample * 4 + moveId];
  };

  const prepareInput = () => {
    const buffer = tf.buffer([rawInput.length, kInputPlanes, 8, 8]);
    var flat = buffer.values;
    let iterIdx = 0;
    for (const inputIdx in rawInput) {
      var sample = rawInput[inputIdx];
      for (const planeIdx in sample) {
        const plane = sample[planeIdx];
        for (var bit of BitIterator(plane.mask)) {
          flat[iterIdx + bit] = plane.value;
        }
        iterIdx += 64;
      }
    }
    input = buffer.toTensor();
    input = input.reshape([-1, kInputPlanes * 8 * 8]);
  };
}

function TFNetwork(weights, options) {
  
  this.model = weights;

  this.compute = (input, output) => {
    const { value, policy } = this.model;

    if (input.shape[0] === 0) {
      return;
    }

    const predictionP = policy.predict(input);
    const predictionQ = value.predict(input);
    output.push(predictionQ);
    output.push(predictionP)
  };

  this.newComputation = () => {
    return new TFNetworkComputation(this);
  };
}

function makeTFNetwork(weights, options) {
  return new TFNetwork(weights, options);
}

tf.loadLayersModel('localstorage://modelValue').catch(e => {
  const { value, policy } = MakeNetwork();
  value.save('localstorage://modelValue');
  policy.save('localstorage://modelPolicy');
});

NetworkFactory.Get().RegisterNetwork("tensorflowSimple", makeTFNetwork);
