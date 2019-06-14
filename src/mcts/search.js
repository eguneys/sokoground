import SearchWorker from './worker';
import { EdgeAndNode } from './node';

function now() {
  return Date.now();
}

export default function Search(tree,
                               bestMoveCb,
                               limits) {

  this.playedHistory = 
    tree.getPositionHistory();

  let shouldStop = false,
      bestMoveIsSent = false,
      finalBestMove;
  
  this.rootNode = tree.getCurrentHead();

  const getTimeToDeadline = () => {
    if (!limits.searchDeadline) return 0;
    return limits.searchDeadline - now();
  };

  const maybeTriggerStop = () => {
    if (bestMoveIsSent) return;
    if (!shouldStop) {
      if (limits.searchDeadline && getTimeToDeadline() <= 0) {
        fireStopInternal();
      }
    }

    if (shouldStop && !bestMoveIsSent) {
      ensureBestMoveKnown();
      bestMoveCb(finalBestMove.getMove());
      bestMoveIsSent = true;
    }
  };

  const WatchdogThread = () => {
    function step() {
      maybeTriggerStop();
      if (bestMoveIsSent)
        return;
      setTimeout(step, 0);
    }
    step();
  };

  const fireStopInternal = () => {
    shouldStop = true;
  };

  const ensureBestMoveKnown = () => {
    if (bestMoveIsSent) return;
    if (!this.rootNode.hasChildren()) return;

    finalBestMove = getBestChildNoTemperature(this.rootNode);
  };

  const getBestChildrenNoTemperature = (parent, count) => {

    var edges = [];

    for (var edge of parent.edges().range()) {

      edges.push({ n: edge.getN(), q: edge.getQ(), p: edge.getP(), value: edge });
    }

    var res = edges.map(_ => _.value);
    

    return res;
  };

  const getBestChildNoTemperature = (parent) => {
    const res = getBestChildrenNoTemperature(parent, 1);
    return res[0] || new EdgeAndNode();
  };

  this.start = () => {
    WatchdogThread();

    var worker = new SearchWorker(this);
    worker.Run();
  };

  this.stop = () => {
    fireStopInternal();
  };

  this.isSearchActive = () => {
    return !shouldStop;
  };
}
