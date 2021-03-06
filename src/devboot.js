require("./theme.css");
require("./index.css");
const main = require('./main');
const Engine = require('./mcts/engine');
const SelfPlayLoop = require('./selfplay/loop');
const Training = require('./selfplay/training');
const loader = require('./neural/loader');

const fen = require('./fen');

const _ = require('./neural/networkRandom');
const __ = require('./neural/networkTF');
const ___ = require('./neural/networkTFS');


module.exports = main.app;
module.exports.Engine = Engine.Engine;
module.exports.SelfPlayLoop = SelfPlayLoop.SelfPlayLoop;
module.exports.TrainingLoop = SelfPlayLoop.TrainingLoop;
module.exports.Training = Training.Training;
module.exports.loadLevels = fen.loadLevels;
module.exports.loadWeights = loader.loadWeights;
module.exports.clearWeights = loader.clearWeights;
