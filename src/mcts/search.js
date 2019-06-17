import SearchWorker from './worker';
import { EdgeAndNode } from './node';
import SearchParams from './params';

function now() {
  return Date.now();
}

export default function Search(tree,
                               network,
                               bestMoveCb,
                               limits,
                               options) {

  this.playedHistory = 
    tree.getPositionHistory();
  this.network = network;

  const params = new SearchParams(options);

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
      if (this.onlyOnePossibleMoveLeft) {
        fireStopInternal();
      }
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

    // console.log(parent.toShortString(2, { discardLoss: false }));

    var edges = [];

    for (var iEdge of parent.edges().range()) {
      var edge = iEdge.value();
      edges.push({ n: edge.getN(), q: edge.getQ(0), p: edge.getP(), value: edge });
    }
    edges.sort((a, b) => {
      var n = b.n - a.n,
          q = n,
          p = n;

      if (n === 0) {
        q = b.q - a.q;
        if (q === 0) {
          p = b.p - a.p;
        }
      }
      return p;
    });

    console.log(edges.map(_ => _.n + _.value.getMove()));

    var res = edges.map(_ => _.value);
    return res;
  };

  const getBestChildNoTemperature = (parent) => {
    const res = getBestChildrenNoTemperature(parent, 1);
    return res[0] || new EdgeAndNode();
  };

  this.start = () => {
    WatchdogThread();

    var worker = new SearchWorker(this, params);
    worker.Run();
  };

  this.stop = () => {
    fireStopInternal();
  };

  this.isSearchActive = () => {
    return !shouldStop;
  };
}
