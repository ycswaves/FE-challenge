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
        this.tournamentService.getMatchData(tournamentId, roundIndex, match).then(matchResult => {
          this.fixtureManager.addMatchUp(match, roundIndex, matchResult.score, this.tournamentId, teamIds);
        }).catch(err => {
          View.showError(err.message || 'Error occurs');
        });

        teamIds.forEach(teamId => {
          this.tournamentService.getTeamData(tournamentId, teamId).then(teamInfo => {
            const { teamId, name, score } = teamInfo;
            this.fixtureManager.addTeamInfo(teamId, name, score, match, roundIndex);
          }).catch(err => {
            View.showError(err.message || 'Error occurs');
          });;
        });
      });

      if (numberOfRounds > 1) {
        this._getRestOfMatchResults(numberOfRounds);
      }

    }).catch(err => {
      console.log('err', err);
      View.showError(err.message || 'Error occurs');
    });
  }

  _getNumberOfRounds() {
    const { teamsPerMatch, numberOfTeams } = this;
    return Math.round(Math.log(numberOfTeams) / Math.log(teamsPerMatch));
  }

  _getMatchesPerRound(roundIndex) {
    const { teamsPerMatch, numberOfTeams } = this;
    return numberOfTeams / Math.pow(teamsPerMatch, roundIndex + 1);
  }

  _getRestOfMatchResults(numberOfRounds) {
    for (let roundIndex = 1; roundIndex < numberOfRounds; roundIndex++) {
      for (let matchId = 0; matchId < this._getMatchesPerRound(roundIndex); matchId++) {
        this.tournamentService.getMatchData(this.tournamentId, roundIndex, matchId).then(matchResult => {
          this.fixtureManager.addMatchUp(matchId, roundIndex, matchResult.score, this.tournamentId);
        }).catch(err => {
          View.showError(err.message || 'Error occurs');
        });
      }
    }
  }
}

const tournament = new Tournament();
