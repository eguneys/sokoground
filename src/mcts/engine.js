import { NodeTree } from './node';
import Search from './search';
import { populate as searchParamsPopulate } from './params';

import NetworkFactory from '../neural/factory';

export function Engine(bestMoveCb, endCb, options) {
  var currentPosition,
      tree,
      network,
      search;

  populateOptions(options);

  network = NetworkFactory.LoadNetwork(options);

  const updateFromUciOptions = () => {
    // network = NetworkFactory.LoadNetwork(options);
  };

  const setupPosition = (fen, moves) => {
    updateFromUciOptions();
    
    if (!tree) {
      tree = new NodeTree();
    }

    tree.resetToPosition(fen, moves);
  };

  this.setPosition = (fen, moves = []) => {
    currentPosition = { fen, moves };
  };

  this.getRepetitions = () => {
    return tree.getPositionHistory().last().getRepetitions();
  };
  
  this.go = (params) => {

    setupPosition(currentPosition.fen, currentPosition.moves);

    const limits = {
      searchDeadline: params.searchDeadline
    };

    search = new Search(tree,
                        network,
                        bestMoveCb,
                        endCb,
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
