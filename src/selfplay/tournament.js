import { merge2 } from '../util';

import { populate as searchParamsPopulate } from '../mcts/params';

import NetworkFactory from '../neural/factory';

import { TrainingDataWriter } from '../neural/writer';

import SelfPlayGame from './game';
import { GameResult } from './game';

function SelfPlayTournament(options, 
                            gameInfoCb) {

  const writer = new TrainingDataWriter();

  const searchLimits = {
    searchDeadline: options.searchDeadline
  };

  if (!searchLimits.searchDeadline) {
    throw new Error("Please configure searchDeadline option.");
  }

  if (!options.fen) {
    throw new Error("Please configure fen option.");
  }

  const gameCallback = gameInfoCb;
  let kTotalGames = options.kTotalGames;

  var network = NetworkFactory.LoadNetwork(options);

  let gamesCount = 0;
  let games = [];

  const playOneGame = (gameNumber) => {
    options.network = network;
    options.searchLimits = searchLimits;
    options.bestMoveCb = (move) => {
      
    };

    options.endMoveCb = () => {};

    var game = new SelfPlayGame(options);
    games.push(game);

    return game.play().then(() => {
      if (game.getGameResult() != GameResult.undecided) {
        const gameInfo = {
          result: game.getGameResult(),
          id: gameNumber,
          moves: game.getMoves()
        };


        const trainingData = game.writeTrainingData(writer);

        gameCallback(gameInfo);
      }
    });
  };

  this.Run = () => {
    return Worker();
  };

  const Worker = () => {
    let plays = [];
    let gameId;
    for (; gamesCount < kTotalGames; gamesCount++) {
      gameId = gamesCount;
      plays.push(playOneGame(gameId));
    }

    return Promise.all(plays).then(writer.finalize);
  };
}

SelfPlayTournament.populateOptions = (options) => {
  const defaults = () => ({
    kTotalGames: 100
  });

  NetworkFactory.populateOptions(options);
  searchParamsPopulate(options);

  merge2(options, defaults());
};

export default SelfPlayTournament;
