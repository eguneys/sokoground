function NetworkFactory() {

  var factories = [];

  this.RegisterNetwork = (name, factory) => {
    factories.push({name, factory});
  };

  this.getBackendsList = () => {
    return factories.map(_ => _.name);
  };

  this.Create = (network, weights, options) => {

    for (var factory of factories) {
      if (factory.name === network) {
        return factory.factory(weights, options);
      }
    }
    throw new Error("Unknown backend: " + network);
  };

};

const Get = (() => {
  const factory = new NetworkFactory();
  return function() {
    return factory;
  };
})();

const LoadNetwork = (options) => {
  const backend = options['kBackend'];
  const weights = null;

  return Get().Create(backend, weights);
};

function populateOptions(options) {
  const backends = Get().getBackendsList();
  options['kBackend'] = backends[0];
}

export default {
  Get,
  LoadNetwork,
  populateOptions
};
