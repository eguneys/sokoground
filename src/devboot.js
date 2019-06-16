require("./theme.css");
require("./index.css");
const main = require('./main');
const Engine = require('./mcts/engine');

const _ = require('./neural/networkRandom');
const __ = require('./neural/networkTF');

module.exports = main.app;
module.exports.Engine = Engine.Engine;
