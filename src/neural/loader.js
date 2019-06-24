import * as tf from '@tensorflow/tfjs';

export function loadWeights() {
  return Promise
    .all([tf.loadLayersModel('localstorage://modelValue'),
          tf.loadLayersModel('localstorage://modelPolicy')])
    .then(values => {
      return {
        value: values[0],
        policy: values[1]
      }
    });
};
