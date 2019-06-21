import SelfPlayTournament from './tournament';

export function SelfPlayLoop(options) {

  SelfPlayTournament.populateOptions(options);


  this.run = () => {
    const tournament = new SelfPlayTournament(options, 
                                              sendGameInfo);
    return tournament.Run();
  };

  const sendGameInfo = (gameInfo) => {
    console.log(gameInfo);
  };
}
