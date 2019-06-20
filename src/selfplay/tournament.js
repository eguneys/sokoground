import { merge } from '../util';

import { populate as searchParamsPopulate } from './params';

import NetworkFactory from '../neural/factory';

import SelfPlayGame from './game';
import { GameResult } from './game';

function SelfPlayTournament(options, 
                            gameInfoCb) {

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

    var game = new SelfPlayGame(options);
    games.push(game);

    return game.play().then(() => {
      if (game.getGameResult() != GameResult.undecided) {
        const gameInfo = {
          result: game.getGameResult(),
          id: gameNumber,
          moves: game.getMoves()
        };

        const trainingData = game.writeTrainingData();

        gameCallback(gameInfo);
      }
    });
  };

  this.Run = () => {
    Worker();
  };

  const Worker = () => {
    let plays = [];
    let gameId;
    for (; gamesCount <= kTotalGames; gamesCount++) {
      gameId = gamesCount;
      plays.push(playOneGame(gameId));
    }

    return Promise.all(plays);
  };
}

SelfPlayTournament.populateOptions = (options) => {
  const defaults = () => ({
    kTotalGames: 100
  });

  NetworkFactory.populateOptions(options);
  searchParamsPopulate(options);

  merge(options, defaults());
};

export default SelfPlayTournament;
