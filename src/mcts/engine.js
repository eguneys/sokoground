import { NodeTree } from './node';
import Search from './search';

export function Engine(bestMoveCb, opts) {
  var currentPosition,
      tree,
      search;

  const setupPosition = (fen) => {
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
                        bestMoveCb,
                        limits);

    search.start();
  };

  this.stop = () => {
    if (search) {
      search.stop();
    }
  };

}
