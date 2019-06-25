import SelfPlayTournament from './tournament';
import { Training } from './training';

import { loadWeights } from '../neural/loader';

import { roundTo } from '../mcts/util';

export function SelfPlayLoop(options, progressCb) {

  SelfPlayTournament.populateOptions(options);

  let progress = 0;
  const totalGames = options.kTotalGames;


  this.run = () => {
    sendProgress();
    const tournament = new SelfPlayTournament(options, 
                                              sendGameInfo);
    return tournament.Run();
  };

  const sendGameInfo = (gameInfo) => {
    progress++;
    sendProgress();
  };

  const sendProgress = () => {
    progressCb({
      n: progress,
      t: totalGames
    });    
  };
}

export function TrainingLoop(options, progressCb) {
  let epoch = 0,
      loss,
      acc;
  
  this.run = () => {
    function step() {
      loadWeights().then(weights => {
        const loop = new SelfPlayLoop({ ...options, weights },
                                      onProgress),
              training = new Training({ ...options, weights });

        loop.run().then(() => {
          training.run().then((history) => {
            loss = roundTo(history.loss);
            acc = roundTo(history.acc);
            epoch++;
            setTimeout(step, 0);
          });
        });
      });
    }
    step();
  };

  const onProgress = ({ n, t }) => {
    progressCb({
      n,
      t,
      epoch,
      loss,
      acc
    });
  };
}
