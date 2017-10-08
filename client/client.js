// Edit me.
// Feel free to add other JS files in this directory as you see fit.

class Tournament {
  constructor() {
    document.addEventListener("DOMContentLoaded", () => {
      View.getReady(this.createTournament.bind(this));
      this.tournamentService = new TournamentService();
    });
  }

  createTournament() {
    const { teamsPerMatch, numberOfTeams } = View.getUserInput();
    this.teamsPerMatch = teamsPerMatch;
    this.numberOfTeams = numberOfTeams;

    const numberOfRounds = this._getNumberOfRounds();
    this.fixtureManager = new FixtureManager(numberOfRounds, this.teamsPerMatch, this.tournamentService);


    this.tournamentService.getMatchUps(teamsPerMatch, numberOfTeams).then(res => {

      const { tournamentId, matchUps } = res;
      this.tournamentId = tournamentId;

      const roundIndex = 0;
      matchUps.forEach(({match, teamIds}) => {
        this.fixtureManager.addNewMatchUp(match, roundIndex, this.tournamentId);

        teamIds.forEach(teamId => {
          this.tournamentService.getTeamData(tournamentId, teamId).then(teamInfo => {
            const { teamId, name, score } = teamInfo;
            this.fixtureManager.addTeamInfo(teamId, name, score, match, roundIndex, tournamentId);
          })
        });
      });

    })
  }

  _getNumberOfRounds() {
    const { teamsPerMatch, numberOfTeams } = this;
    return Math.round(Math.log(numberOfTeams) / Math.log(teamsPerMatch));
  }
}

const tournament = new Tournament();
