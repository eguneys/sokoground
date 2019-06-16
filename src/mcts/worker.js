import * as sokoban from './sokoban';

import { encodePositionForNN } from '../neural/encoder';
import { EdgeIterator } from './node';
import * as util from './util';

export default function SearchWorker(search, params) {

  const history = search.playedHistory;
  
  let minibatch = [],
      computation;

  const pickNodeToExtend = () => {

    let node = search.rootNode,
        bestEdge = new EdgeIterator([]),
        secondBestEdge;

    let isRootNode = true,
        depth = 0,
        nodeAlreadyUpdated = true;

    while (true) {

      if (!nodeAlreadyUpdated) {
        // if (depth < 4)
        //   console.log((search.rootNode.toShortString(2)));
        node = bestEdge.getOrSpawnNode(node);
      }
      bestEdge.reset();

      depth++;

      // node.tryStartScoreUpdate();

      if (node.isTerminal || !node.hasChildren()) {
        return Visit(node, depth);
      }

      nodeAlreadyUpdated = false;


      const cpuct = computeCpuct(params, node.getN());
      const puctMult =
            cpuct * Math.sqrt(Math.max(node.getChildrenVisits(), 1));
      var best = -Infinity;
      var secondBest = -Infinity;
      const fpu = getFpu(params, node, isRootNode);

      for (var child of node.edges().range()) {
        if (isRootNode) {
          
        }

        const Q = child.value().getQ(fpu);
        const score = child.value().getU(puctMult) + Q;

        if (score > best) {
          secondBest = best;
          secondBestEdge = bestEdge;
          best = score;
          bestEdge = child;
        } else if (score > secondBest) {
          secondBest = score;
          secondBestEdge = child;
        }
      }

      isRootNode = false;
    }
    
  };

  const initializeIteration = (computation_) => {
    computation = computation_;
    minibatch = [];
  };

  const gatherMiniBatch = () => {

    minibatch.push(pickNodeToExtend());
    let pickedNode = minibatch.slice(-1)[0],
        node = pickedNode.node;
    if (pickedNode.isExtendable()) {
      extendNode(node);
      if (!node.isTerminal) {
        pickedNode.nnQueried = true;
        addNodeToComputation(node);
      }
    }
  };

  const extendNode = (node) => {
    history.trim(search.playedHistory.getLength());

    const toAdd = [];

    let cur = node;
    while (cur !== search.rootNode) {
      let prev = cur.getParent();
      toAdd.push(prev.getEdgeToNode(cur).getMove());
      cur = prev;
    }

    for (var i = toAdd.length - 1; i >= 0; i--) {
      history.append(toAdd[i]);
    }

    const board = history.last().getBoard(),
          legalMoves = board.getLegalMoves(),
          isEnd = board.isEnd();

    if (isEnd) {
      node.makeTerminal();
      return;
    }

    node.createEdges(legalMoves);
  };

  const addNodeToComputation = (node) => {
    const planes = encodePositionForNN(history, 8);
    computation.addInput(planes);
  };

  const runNNComputation = () => {
  };

  const fetchMinibatchResults = () => {
    var idxInComputation = 0;
    for (var nodeToProcess of minibatch) {
      fetchSingleNodeResult(nodeToProcess, idxInComputation);
      if (nodeToProcess.nnQueried) 
        ++idxInComputation;
    }
  };

  const fetchSingleNodeResult = (nodeToProcess, idxInComputation) => {
    var node = nodeToProcess.node;

    if (!nodeToProcess.nnQueried) {
      nodeToProcess.v = node.getQ();
      nodeToProcess.d = node.getD();
      return;
    }

    nodeToProcess.v = -computation.getQVal(idxInComputation);

    var total = 0;
    for (var iEdge of node.edges().range()) {
      var edge = iEdge.value();

      var p = computation.getPVal(idxInComputation, sokoban.moveAsNNIndex(edge.getMove()));
      edge.edge.setP(p);
      total += edge.getP();
    }

    // normalize P values to add up to 1
    if (total > 0) {
      const scale = 1 / total;
      for (iEdge of node.edges().range()) {
        edge = iEdge.value();
        edge.edge.setP(edge.getP() * scale);
      }
    }
    
  };

  const doBackupUpdate = () => {
    for (var nodeToProcess of minibatch) {
      doBackupUpdateSingleNode(nodeToProcess);
    }    
  };

  const doBackupUpdateSingleNode = (nodeToProcess) => {
    const node = nodeToProcess.node;
    
    const v = nodeToProcess.v;

    for (var n = node, p; n !== search.rootNode.getParent(); n = p) {
      p = n.getParent();

      if (n.isTerminal) {
        v = n.getQ();
      }

      n.finalizeScoreUpdate(v);
    }
  };
  
  const executeOneIteration = () => {

    initializeIteration(search.network.newComputation());

    gatherMiniBatch();

    runNNComputation();

    fetchMinibatchResults();

    doBackupUpdate();
  };

  this.Run = () => {
    function step() {
      executeOneIteration();
      if (search.isSearchActive()) {
        setTimeout(step, 0);
      }
    }
    step();
  };
  
}

function getFpu(params, node, isRootNode) {
  const value = params.getFpuValue(isRootNode);
  return value;
}

function computeCpuct(params, N) {
  const init = params.getCpuct();
  return init;
}

function Visit(node, depth) {
  return new NodeToProcess(node, depth);
}

function NodeToProcess(node, depth) {
  this.node = node;
  this.depth = depth;

  this.nnQueried = false;

  this.isExtendable = () => {
    return !node.isTerminal;
  };
}
