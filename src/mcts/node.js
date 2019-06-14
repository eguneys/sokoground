import Sokoban from './sokoban';
import PositionHistory from './position';

export function NodeTree() {
  let currentHead,
      gameBeginNode,
      history = new PositionHistory();

  
  this.resetToPosition = (fen) => {
    const startingBoard = new Sokoban();

    startingBoard.setFromFen(fen);

    if (!gameBeginNode) {
      gameBeginNode = new Node(null, 0);
    }

    history.reset(startingBoard);

    currentHead = gameBeginNode;

  };

  this.getCurrentHead = () => {
    return currentHead;
  };

  this.getPositionHistory = () => {
    return history;
  };
}

export function Edge(move) {
  this.move = move;
}

export function Node(parent, index) {
  let edges = [];

  let child,
      sibling;

  let q = 0,
      d = 0;

  this.isTerminal = false;

  this.createEdges = (moves) => {
    edges = moves.map(_ => new Edge(_));
  };

  this.makeTerminal = () => {
    this.isTerminal = true;
    q = 1;
  };

  this.getQ = () => {
    return q;
  };

  this.edges = () => {
    return new EdgeIterator(edges, child);
  };

  this.hasChildren = () => {
    return edges.length > 0;
  };
}

export function EdgeAndNode(edge, node) {
  this.edge = edge;
  this.node = node;
}

export function EdgeIterator(edges, node) {

  var currentIdx = 0,
      totalCount = edges.length;

  this.edgeAndNode = new EdgeAndNode(edges[0],
                                     null);

  const actualize = () => {
    
  };

  if (this.edgeAndNode.edge) {
    actualize();
  }



  this.next = () => {
    if (++currentIdx === totalCount) {
      this.edgeAndNode.edge = null;
    } else {
      this.edgeAndNode.edge = edges[currentIdx+1];
      actualize();
    }
  };
}


