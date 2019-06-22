import SearchWorker from './worker';
import { EdgeAndNode } from './node';
import SearchParams from './params';

import { roundTo, now } from './util';

import { getFpu } from './worker';

export default function Search(tree,
                               network,
                               bestMoveCb,
                               endCb,
                               limits,
                               options) {

  this.playedHistory = 
    tree.getPositionHistory();
  this.network = network;

  const params = new SearchParams(options);

  let searchDeadline;

  let clearWorker;

  let shouldStop = false,
      bestMoveIsSent = false,
      finalBestMove;
  
  this.rootNode = tree.getCurrentHead();

  const getTimeToDeadline = () => {
    if (!searchDeadline) return 0;
    return searchDeadline - now();
  };

  const maybeTriggerStop = () => {
    if (bestMoveIsSent) return;
    if (!shouldStop) {
      // if (this.onlyOnePossibleMoveLeft) {
      //   fireStopInternal();
      // }
      if (searchDeadline && getTimeToDeadline() <= 0) {
        fireStopInternal();
      }
    }

    if (shouldStop && !bestMoveIsSent) {
      ensureBestMoveKnown();
      if (finalBestMove) {
        bestMoveCb(finalBestMove.getMove());
      } else {
        endCb();
      }
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

    // console.log(this.playedHistory.last().getBoard().fen);
    // console.log(this.rootNode.toShortString(6, { discardLoss: 'hidden' }));

    const temperature = params.getTemperature();

    finalBestMove = temperature ?
      getBestChildWithTemperature(this.rootNode, temperature) :
      getBestChildNoTemperature(this.rootNode);
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

    // console.log(edges.map(_ => `${_.value.getMove()} -> ${roundTo(_.n)} q:${roundTo(_.q)} p:${roundTo(_.p)}`).join("\n"));

    edges.reduce((acc, edge) => {
      if (edge.q > acc.mq) {
        // debugger;
        // console.log(edges);
        return acc;
      }
      return { mq: edge.q };
    }, { mq: 1 });

    var res = edges.map(_ => _.value);
    return res;
  };

  const getBestChildNoTemperature = (parent) => {
    const res = getBestChildrenNoTemperature(parent, 1);
    return res[0] || new EdgeAndNode();
  };

  const getBestChildWithTemperature = (parent, temperature) => {

    const cumulativeSums = [];
    let sum = 0;
    let maxN = 0;
    const offset = params.getTemperatureVisitOffset();
    let maxEval = -1;
    
    const fpu = getFpu(params, parent, parent === this.rootNode);

    for (var iEdge of parent.edges().range()) {
      var edge = iEdge.value();

      if (edge.getN() + offset > maxN) {
        maxN = edge.getN() + offset;
        maxEval = edge.getQ(fpu);
      }
    }

    if (maxN <= 0) return getBestChildNoTemperature(parent);

    const minEval = maxEval - params.getTemperatureWinpctCutoff() / 50;
    for (iEdge of parent.edges().range()) {
      edge = iEdge.value();
      if (edge.getQ(fpu) < minEval) continue;
      sum += Math.pow(Math.max(0, (edge.getN() + offset) / maxN),
                      1 / temperature);
      cumulativeSums.push(sum);
    }
    const toss = Math.random() * cumulativeSums.slice(-1)[0];
    const lowerBound = cumulativeSums.find(_ => _ > toss);
    let idx = lowerBound ? cumulativeSums.indexOf(lowerBound) : cumulativeSums.length;

    for (iEdge of parent.edges().range()) {
      edge = iEdge.value();
      if (edge.getQ(fpu) < minEval) continue;
      if (idx-- === 0) return edge;
    }
    throw new Error("get best child with no temperature failed");
    return null;
  };

  this.getBestEval = () => {
    const parentQ = - this.rootNode.getQ();
    if (!this.rootNode.hasChildren()) return parentQ;
    const bestEdge = getBestChildNoTemperature(this.rootNode);

    return bestEdge.getQ(parentQ);
  };

  this.getBestMove = () => {
    ensureBestMoveKnown();
    return finalBestMove.getMove();
  };

  this.runAsync = () => {
    this.start();
    return new Promise(resolve => {
      const step = () => {
        if (!this.isSearchActive()) {
          if (clearWorker)
            clearWorker();

          resolve();
          return;
        }
        setTimeout(step, 100);
      };
      step();
    });
  };

  this.start = () => {
    if (limits.searchDeadline) {
      searchDeadline = now() + limits.searchDeadline;
    }
    
    WatchdogThread();

    const worker = new SearchWorker(this, params);
    clearWorker = worker.Run();
  };

  this.stop = () => {
    fireStopInternal();
  };

  this.isSearchActive = () => {
    return !shouldStop;
  };
}
