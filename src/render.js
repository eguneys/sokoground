import { key2pos, createEl } from './util';
import * as util from './util';

export default function render(s) {

  const posToTranslate = util.posToTranslate,
        translate = util.translate,
        boardEl = s.dom.elements.board,
        pieces = s.pieces,
        squares = s.squares,
        samePieces = {},
        sameSquares = {},
        movedPieces = {},
        movedSquares = {},
        piecesKeys = Object.keys(pieces),
        squaresKeys = Object.keys(squares);
  let k,
      p,
      el,
      pieceAtKey,
      squareAtKey,
      elPieceName,
      elSquareName,
      pMvdSet,
      pMvd,
      sMvdSet,
      sMvd;

  el = boardEl.firstChild;

  while (el) {
    k = el.sgKey;

    if (isPieceNode(el)) {
      pieceAtKey = pieces[k];
      elPieceName = el.sgPiece;

      if (pieceAtKey) {
        if (elPieceName === pieceNameOf(pieceAtKey)) {
          samePieces[k] = true;
        } else {
          safePush(movedPieces, elPieceName, el);
        }
      } else {
        safePush(movedPieces, elPieceName, el);

      }
    } else if (isSquareNode(el)) {
      squareAtKey = squares[k];
      elSquareName = el.sgSquare;

      if (squareAtKey) {
        if (elSquareName === pieceNameOf(squareAtKey)) {
          sameSquares[k] = true;
        } else {
          safePush(movedSquares, elSquareName, el); 
        }
      } else {
        safePush(movedSquares, elSquareName, el);
      }      
    }

    el = el.nextSibling;
  }


  for (const j in piecesKeys) {
    k = piecesKeys[j];
    p = pieces[k];

    if (!samePieces[k]) {
      pMvdSet = movedPieces[pieceNameOf(p)];
      pMvd = pMvdSet && pMvdSet.pop();

      // same piece moved
      if (pMvd) {
        pMvd.sgKey = k;
        const pos = key2pos(k);
        translate(pMvd, posToTranslate(pos));

      // no piece in moved obj: insert new piece
      } else {
        const pieceName = pieceNameOf(p);
        const pieceNode = createEl('piece', pieceName);
        
        const pos = key2pos(k);
        pieceNode.sgPiece = pieceName;
        pieceNode.sgKey = k;
        translate(pieceNode, posToTranslate(pos));
        boardEl.appendChild(pieceNode);
      }
    }
  }

  for (const j in squaresKeys) {
    k = squaresKeys[j];
    p = squares[k];

    if (!sameSquares[k]) {
      sMvdSet = movedSquares[pieceNameOf(p)];
      sMvd = sMvdSet && sMvdSet.pop();

      // same square moved
      if (sMvd) {
        sMvd.sgKey = k;
        const pos = key2pos(k);
        translate(sMvd, posToTranslate(pos));

      // no square in moved obj: insert new square
      } else {
        const squareName = pieceNameOf(p);
        const squareNode = createEl('square', squareName);
        
        const pos = key2pos(k);
        squareNode.sgSquare = squareName;
        squareNode.sgKey = k;
        translate(squareNode, posToTranslate(pos));
        boardEl.appendChild(squareNode);
      }
    }
  }

  // remove any element that remains in the moved sets
  for (const i in movedPieces) removeNodes(s, movedPieces[i]);
  for (const i in movedSquares) removeNodes(s, movedSquares[i]);

}

function isPieceNode(el) {
  return el.tagName === 'PIECE';
}

function isSquareNode(el) {
  return el.tagName === 'SQUARE';
}

function removeNodes(s, nodes) {
  for (const i in nodes)
    s.dom.elements.board.removeChild(nodes[i]);
}

function pieceNameOf(piece) {
  return piece.role;
}

function safePush(arr, key, el) {
  if (arr[key]) 
    arr[key].push(el);
  else 
    arr[key] = [el];
}
