import SelfPlayTournament from './tournament';
import { Training } from './training';

import { TrainingDataWriter } from '../neural/writer';
import { loadWeights } from '../neural/loader';

import { roundTo } from '../mcts/util';

export function SelfPlayLoop(options, progressCb) {

  SelfPlayTournament.populateOptions(options);

  let progress = 0;
  const totalGames = options.kTotalGames;
  let tournament;


  this.run = () => {
    sendProgress();
    tournament = new SelfPlayTournament(options, 
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

  let requestTraining;

  const writer = new TrainingDataWriter();
  
  this.run = () => {
    loadWeights().then(weights => {
      const step = () => {
        epoch++;
        const loop = new SelfPlayLoop({ ...options, weights },
                                      onProgress);
        loop.run().then(() => {
          if (!requestTraining) {
            setTimeout(step, 0);
          } else {
            requestTraining = false;
            this.train(weights, true);
          }
        });
      };
      step();
    });
  };

  this.train = (weights, runAfter) => {
    const training =
          new Training({ ...options, weights });
    training.run().then((history) => {
      epoch = 0;
      loss = roundTo(history.loss);
      acc = roundTo(history.acc);
      writer.clear().then(() => (runAfter?this.run:()=>{})());
    });
  };

  this.requestTrain = () => {
    requestTraining = true;
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

export function TrainingLoopOLD(options, progressCb) {
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
