import Sokoban from './sokoban';
import PositionHistory from './position';

import { roundTo } from './util';

export function NodeTree() {
  let currentHead,
      gameBeginNode,
      history = new PositionHistory();

  const deallocateTree = () => {
    gameBeginNode = null;
    currentHead = null;
  };


  const makeMove = (move) => {
    history.append(move);
  };
  
  this.resetToPosition = (fen, moves) => {
    const startingBoard = new Sokoban();

    const { noPushPly } = startingBoard.setFromFen(fen);

    if (gameBeginNode) {
      deallocateTree();
    }

    if (!gameBeginNode) {
      gameBeginNode = new Node(null, 0);
    }

    history.reset(startingBoard, noPushPly);

    currentHead = gameBeginNode;

    for (const move of moves) {
      makeMove(move);
    }

  };

  this.getCurrentHead = () => {
    return currentHead;
  };

  this.getPositionHistory = () => {
    return history;
  };
}

export function Edge(move) {
  
  // probability that this move will be made
  var p;

  this.move = move;

  this.setP = (p_) => {
    p = p_;
  };

  this.getP = () => {
    return p;
  };

  this.getMove = () => {
    return this.move;
  };
}

function NodePtr(get, set) {
  return {
    get,
    set
  };
}

export function Node(parent, index) {
  let edges = [];

  let child;

  // Average value of all visited nodes in subtree.
  let q = 0,
      // How many completed visits this node had.
      n = 0,
      // how many threads currently process this node
      // (started but not finished).
      nInFlight = 0;

  this.parent = parent;
  this.sibling = null;

  // pointer to first child
  this.child = null;

  this.index = index;

  this.isTerminal = false;

  this.createEdges = (moves) => {
    edges = moves.map(_ => new Edge(_));
  };

  this.makeTerminal = (result) => {
    this.isTerminal = true;
    if (result === 'lose') {
      q = -1;
    } else {
      q = 1;
    }
  };

  this.tryStartScoreUpdate = () => {
    if (n === 0 && nInFlight > 0) return false;
    nInFlight++;
    return true;
  };

  this.cancelScoreUpdate = (multivisit = 1) => {
    nInFlight -= multivisit;
  };

  this.finalizeScoreUpdate = (v, multivisit = 1) => {
    var preQ = q;

    q += multivisit * (v - q) / (n + multivisit);

    if (v !== -1 && q === -1) {
      console.log(preQ, v);
      debugger;
    }

    n += multivisit;

    nInFlight -= multivisit;
  };

  this.getParent = () => {
    return parent;
  };

  this.getQ = () => {
    return q;
  };

  this.getN = () => {
    return n;
  };

  this.getNStarted = () => {
    return n + nInFlight;
  };

  this.getChildrenVisits = () => {
    return n > 0 ? n - 1 : 0;
  };

  this.edges = () => {
    return new EdgeIterator(edges, new NodePtr(() => {
      return this.child;
    }, (v) => {
      this.child = v;
    }));
  };

  this.hasChildren = () => {
    return edges.length > 0;
  };

  // for a child node returns corresponding edge
  this.getEdgeToNode = (node) => {
    return edges[node.index];
  };

  this.getOwnEdge = () => {
    return this.getParent().getEdgeToNode(this);
  };

  this.toString = () => {
    var res = `<node${this.index} q=${q} n=${n}>`;
    for (var iEdge of this.edges().range()) {
      var edge = iEdge.value();
      res += edge.toString() + ",";
    }
    res += "</node>";
    return res;
  };

  this.toShortString = (x, opts = {}, spaces = "") => {
    var indent = "  ";
    var res = spaces + indent + `<node ${this.index} q=${roundTo(q)} n=${roundTo(n)}>`;
    for (var iEdge of this.edges().range()) {
      var edge = iEdge.value();
      var str = edge.toShortString(x, opts, spaces + indent);
      if (str) {
        res += "\n" + spaces + indent + str + "\n";
      }
    }
    res += spaces + indent + "</node>";
    return res;
  };

  this.toPrettyShortString = () => {
    var edge = this.getOwnEdge();
    var res = edge.getMove() + " -> " +
        roundTo(n) + " q:" + roundTo(q) + " p:" + roundTo(edge.getP());
    return res;
  };

  this.toTailString = () => {
    var res = "";
    var cur = this;
    while ((cur = cur.getParent()) !== null) {
      if (!cur.getParent()) break;
      var edge = cur.getOwnEdge();
      res = edge.getMove() + " -> " + roundTo(cur.getN()) + " " + res;
    }
    return res + this.toPrettyShortString();
  };
}

export function EdgeAndNode(edge, node) {
  this.edge = edge;
  this.node = node;

  this.getQ = (defaultQ) => {
    return (this.node && this.node.getN() > 0) ? this.node.getQ() : defaultQ;
  };

  this.getN = () => {
    return this.node ? this.node.getN() : 0;
  };
  this.getNStarted = () => { return this.node ? this.node.getNStarted() : 0; };

  this.isTerminal = () => {
    return this.node ? this.node.isTerminal : false;
  };


  this.getP = () => {
    return this.edge.getP();
  };

  this.getMove = () => {
    return this.edge ? this.edge.getMove() : '';
  };


  // Returns U = numerator * p / N;
  // passed numerator is expected to be equal to (cpuct * sqrt(N[parent]);
  this.getU = (numerator) => {
    return numerator * this.getP() / (1 + this.getNStarted());
  };

  this.toString = () => {
    var res =
        [`<edge m=${this.edge.getMove()} p=${roundTo(this.edge.getP())}>`,
         this.node?this.node.toString():".",
         "</edge>"].join("");
    return res;
  };

  this.toShortString = (x, opts = {}, spaces) => {
    if (opts.discardLoss && (this.getQ(0) === -1 || !this.node)) {
      if (opts.discardLoss === 'hidden')
        return '';
      return `<${this.edge.getMove()} loss/>`;
    }
    var res =
        [`<${this.edge.getMove()} p=${roundTo(this.edge.getP())}>`,
         (this.node&&x > 0)?"\n"+node.toShortString(x-1, opts, spaces):".",
         `</${this.edge.getMove()}>`].join("");
    return res;
  };
}

export function EdgeIterator(edges,
                             nodePtr,
                             currentIdx = 0) {

  let node;

  const actualize = () => {
    while (nodePtr.get() && nodePtr.get().index < currentIdx) {
      var tmp = nodePtr.get();
      nodePtr = new NodePtr(() => {
        return tmp.sibling;
      }, (v) => {
        tmp.sibling = v;
      });
    }
    if (nodePtr.get() && nodePtr.get().index === currentIdx) {
      node = nodePtr.get();
      nodePtr = new NodePtr(() => {
        return node.sibling;
      }, (v) => {
        node.sibling = v;
      });
    } else {
      node = null;
    }
  };

  if (nodePtr) {
    actualize();
  }

  this.range = () => {
    var res = [];
  
    for (var i = 0; i< edges.length; i++) {
      res.push(new EdgeIterator(edges, nodePtr, currentIdx + i));
    }
    return res;
  };

  var edge;
  this.value = () => {
    if (!edge) {
      edge = new EdgeAndNode(edges[currentIdx], node);
    }
    return edge;
  };

  this.reset = () => {
    edge = null;
  };

  this.getOrSpawnNode = (parent) => {
    if (node) return node;
    var tmp = nodePtr.get();
    nodePtr.set(new Node(parent, currentIdx));
    nodePtr.get().sibling = tmp;
    actualize();
    return node;
  };

}


