import { key2pos, createEl } from './util';
import * as util from './util';

export default function render(s) {

  const posToTranslate = util.posToTranslate,
        translate = util.translate,
        boardEl = s.dom.elements.board,
        pieces = s.pieces,
        samePieces = {},
        movedPieces = {},
        piecesKeys = Object.keys(pieces);
  let k,
      p,
      el,
      pieceAtKey,
      elPieceName,
      pMvdSet,
      pMvd;

  el = boardEl.firstChild;

  while (el) {
    k = el.sgKey;
    pieceAtKey = pieces[k];
    elPieceName = el.sgPiece;

    if (pieceAtKey) {
      if (elPieceName === pieceNameOf(pieceAtKey)) {
        samePieces[k] = true;
      } else {
        if (movedPieces[elPieceName]) 
          movedPieces[elPieceName].push(el);
        else 
          movedPieces[elPieceName] = [el];        
      }
    } else {
      if (movedPieces[elPieceName]) 
        movedPieces[elPieceName].push(el);
      else 
        movedPieces[elPieceName] = [el];
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

  // remove any element that remains in the moved sets
  for (const i in movedPieces) removeNodes(s, movedPieces[i]);

}

function removeNodes(s, nodes) {
  for (const i in nodes)
    s.dom.elements.board.removeChild(nodes[i]);
}

function pieceNameOf(piece) {
  return piece.role;
}
