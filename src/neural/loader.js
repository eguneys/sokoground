import * as tf from '@tensorflow/tfjs';

export const valueUrl = 'localstorage://modelValue';
export const policyUrl = 'localstorage://modelPolicy';

export function loadWeights() {
  return Promise
    .all([tf.loadLayersModel(valueUrl),
          tf.loadLayersModel(policyUrl)])
    .then(values => {
      return {
        value: values[0],
        policy: values[1]
      }
    });
};

export function saveWeights(weights) {
  weights.value.save(valueUrl);
  weights.policy.save(policyUrl);
};
