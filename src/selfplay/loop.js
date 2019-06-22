import SelfPlayTournament from './tournament';

export function SelfPlayLoop(options, progressCb) {

  SelfPlayTournament.populateOptions(options);

  let progress = 0;
  const totalGames = options.kTotalGames;


  this.run = () => {
    sendProgress();
    const tournament = new SelfPlayTournament(options, 
                                              sendGameInfo);
    return tournament.Run();
  };

  const sendGameInfo = (gameInfo) => {
    progress++;
    sendProgress();
  };

  const sendProgress = () => {
    progressCb({
      n: progress,
      t: totalGames
    });    
  };
}
