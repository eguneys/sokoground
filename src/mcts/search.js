import SearchWorker from './worker';

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
      bestMoveCb(finalBestMove);
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
