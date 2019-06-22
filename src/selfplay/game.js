import Search from '../mcts/search';

import { NodeTree } from '../mcts/node';

export default function SelfPlayGame(options) {

  let gameResult = GameResult.undecided,
      trainingData = [];

  let tree = new NodeTree(),
      search;

  tree.resetToPosition(options.fen, []);

  this.getGameResult = () => {
    return gameResult;
  };

  this.getMoves = () => {
    const moves = [];
    for (let node = tree.getCurrentHead();
         node != tree.getGameBeginNode();
         node = node.getParent()) {
      moves.push(node.getParent().getEdgeToNode(node).getMove());
    }
    moves.reverse();
    return moves;
  };

  this.play = () => {
    function step() {
      gameResult = tree.getPositionHistory().computeGameResult();
      if (gameResult != GameResult.undecided) {
        return Promise.resolve();
      }

      // tree.trimTreeAtHead();

      console.log('play pos fen');
      console.log(tree.getPositionHistory().last().getBoard().fen);
      console.log(tree.getCurrentHead().toTailString());

      search = new Search(tree,
                          options.network,
                          options.bestMoveCb,
                          options.endMoveCb,
                          options.searchLimits,
                          options);

      return new Promise(resolve => {
        search.runAsync().then(() => {
          const bestEval = search.getBestEval();
          const bestQ = bestEval;
          
          trainingData.push(tree.getCurrentHead()
                            .getV4TrainingData(
                              GameResult.undecided,
                              tree.getPositionHistory(),
                              bestQ
                            ));

          if (bestEval < -0.95) {
            gameResult = GameResult.lose;
          } else if (bestEval === 1) {
            gameResult = GameResult.win;
          }

          const move = search.getBestMove();
          tree.makeMove(move);

          step().then(resolve);
        });
      });
    }

    return step();
  };

  this.writeTrainingData = (writer) => {
    console.log(trainingData);
    for (var chunk of trainingData) {
      if (gameResult === GameResult.win) {
        chunk.result = 1;
      } else if (gameResult === GameResult.lose) {
        chunk.result = -1;
      } else {
        chunk.result = 0;
      }
      writer.writeChunk(chunk);
    }
  };
}

export const GameResult = {
  undecided: 'undecided',
  win: 'win',
  lose: 'lose'
};
