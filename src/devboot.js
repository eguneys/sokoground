require("./theme.css");
require("./index.css");
const main = require('./main');
const Engine = require('./mcts/engine');
const SelfPlayLoop = require('./selfplay/loop');

const fen = require('./fen');

const _ = require('./neural/networkRandom');
const __ = require('./neural/networkTF');

module.exports = main.app;
module.exports.Engine = Engine.Engine;
module.exports.SelfPlayLoop = SelfPlayLoop.SelfPlayLoop;
module.exports.loadLevels = fen.loadLevels;
