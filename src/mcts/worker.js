import * as sokoban from './sokoban';

export default function SearchWorker(search) {

  const history = search.playedHistory;
  
  let minibatch = [];

  const pickNodeToExtend = () => {

    let node = search.rootNode;

    let isRootNode = true,
        depth = 0,
        nodeAlreadyUpdated = true;

    while (true) {

      if (!nodeAlreadyUpdated) {
        // node = bestEdge.getOrSpawnNode(node);
      }

      depth++;

      // node.tryStartScoreUpdate();

      if (node.isTerminal || !node.hasChildren()) {
        return Visit(node, depth);
      }

      nodeAlreadyUpdated = false;

    }
    
  };

  const initializeIteration = () => {
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
      }
    }
  };

  const extendNode = (node) => {
    const board = history.last(),
          legalMoves = board.getLegalMoves(),
          isEnd = board.isEnd();

    if (isEnd) {
      node.makeTerminal();
      return;
    }

    node.createEdges(legalMoves);
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
    nodeToProcess.d = computation.getDVal(idxInComputation);

    var total = 0;
    
    
    
  };

  const doBackupUpdate = () => {
    for (var nodeToProcess of minibatch) {
      doBackupUpdateSingleNode(nodeToProcess);
    }    
  };

  const doBackupUpdateSingleNode = (nodeToProcess) => {
    
  };
  
  const executeOneIteration = () => {

    initializeIteration();

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
