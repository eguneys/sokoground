require("./theme.css");
require("./index.css");
const main = require('./main');
const Engine = require('./mcts/engine');

module.exports = main.app;
module.exports.Engine = Engine.Engine;
