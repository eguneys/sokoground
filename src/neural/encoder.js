import { InputPlane } from './network';

const kMoveHistory = 8;
const kPlanesPerBoard = 4;
const kAuxPlaneBase = kPlanesPerBoard * kMoveHistory;

export function encodePositionForNN(history, historyPlanes) {

  const result = [];

  for (var j = 0; j < kAuxPlaneBase + 1; j++) {
    result[j] = new InputPlane();
  }

  const board = history.last();
  result[kAuxPlaneBase + 0].setAll();
  

  var historyIdx = history.getLength() - 1;
  for (var i = 0; i < Math.min(historyPlanes, kMoveHistory);
       ++i, --historyIdx) {
    const position = history.getPositionAt(historyIdx < 0 ? 0 : historyIdx);

    if (historyIdx < 0)
      break;
    const base = i * kPlanesPerBoard;

    result[base + 0].mask = (board.boxes());
    result[base + 1].mask = (board.char());
    result[base + 2].mask = (board.targets());
    result[base + 3].mask = (board.walls());
  }

  return result;
}
                                    
