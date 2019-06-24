import { makeStorage } from '../util';

export function Training(options) {

  const data = makeStorage('v4training').get();

  network = NetworkFactory.LoadNetwork(options);

  this.run = () => {

    network.model.fit(xs, ys);

    network.model.save("localstorage://model");

  };

}
