import Search from '../mcts/search';

import { NodeTree } from './node';

export default function SelfPlayGame(options) {

  let gameResult = GameResult.undecided,
      trainingData;

  let tree = new NodeTree(),
      search;

  tree.resetToPosition(options.fen);


  this.play = () => {
    function step() {
      gameResult = tree.getPositionHistory().computeGameResult();

      if (gameResult != GameResult.undecided)
        return Promise.resolve();

      search = new Search(tree,
                          options.network,
                          options.bestMoveCb,
                          options.searchLimits,
                          options);

      return search.runAsync(() => {
        const bestEval = search.getBestEval();
        const bestQ = bestEval;
        trainingData.push(tree.getCurrentHead()
                          .getV4TrainingData(
                            GameResult.undecided,
                            tree.getPositionHistory(),
                            bestQ
                          ));

        const eval = bestEval;

        if (eval < -0.95) {
          gameResult = GameResult.lose;
        } else if (eval === 1) {
          gameResult = GameResult.win;
        }


        const move = search.getBestMove();
        tree.makeMove(move);

        return step();
      });
    }

  };
}

export const GameResult = {
  undecided: 'undecided',
  win: 'win',
  lose: 'lose'
};
