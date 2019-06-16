import { NodeTree } from './node';
import Search from './search';
import { populate as searchParamsPopulate } from './params';

import NetworkFactory from '../neural/factory';

export function Engine(bestMoveCb, options) {
  var currentPosition,
      tree,
      network,
      search;

  populateOptions(options);

  const updateFromUciOptions = () => {
    network = NetworkFactory.LoadNetwork(options);
  };

  const setupPosition = (fen) => {
    updateFromUciOptions();
    
    if (!tree) {
      tree = new NodeTree();
    }
    tree.resetToPosition(fen);
  };

  this.setPosition = (fen) => {
    currentPosition = { fen };
  };
  
  this.go = (params) => {

    setupPosition(currentPosition.fen);

    const limits = {
      searchDeadline: params.searchDeadline
    };

    search = new Search(tree,
                        network,
                        bestMoveCb,
                        limits,
                        options);

    search.start();
  };

  this.stop = () => {
    if (search) {
      search.stop();
    }
  };

}

function populateOptions(options) {
  NetworkFactory.populateOptions(options);
  searchParamsPopulate(options);
}
