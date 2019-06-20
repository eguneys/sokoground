import SelfPlayTournament from './tournament';

export function SelfPlayLoop(options) {

  SelfPlayTournament.populateOptions(options);

  const tournament = new SelfPlayTournament(options, 
                                            sendGameInfo);

  tournament.Run();

  const sendGameInfo = (gameInfo) => {
    console.log(gameInfo);
  };
}
