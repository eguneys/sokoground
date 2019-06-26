import * as tf from '@tensorflow/tfjs';

export const saveMedium = 'indexeddb://';
export const valueUrl = saveMedium + 'modelValue';
export const policyUrl = saveMedium + 'modelPolicy';

export function loadWeights() {
  return Promise
    .all([tf.loadLayersModel(valueUrl),
          tf.loadLayersModel(policyUrl)])
    .then(values => {
      return {
        value: values[0],
        policy: values[1]
      };
    });
};

export function saveWeights(weights) {
  return Promise.all([weights.value.save(valueUrl),
                      weights.policy.save(policyUrl)]);
};

export function clearWeights() {
  tf.io.removeModel(valueUrl);
  tf.io.removeModel(policyUrl);
};
