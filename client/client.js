// Edit me.
// Feel free to add other JS files in this directory as you see fit.

class Tournament {
  constructor() {
    document.addEventListener("DOMContentLoaded", () => {
      const startBtn = document.getElementById('start');
      startBtn.addEventListener('click', () => {
        View.reset();
        this.createTournament();
      })
    })
  }

  createTournament() {
    const teamsPerMatch = document.getElementById('teamsPerMatch').value;
    const numberOfTeams = document.getElementById('numberOfTeams').value;
    this.teamsPerMatch = teamsPerMatch;
    this.numberOfTeams = numberOfTeams;

    const numberOfRounds = this._getNumberOfRounds();

    this.fixtureManager = new FixtureManager(numberOfRounds, this.teamsPerMatch, this.numberOfTeams);

    TournamentService.getMatchUps(teamsPerMatch, numberOfTeams, (err, res) => {
      if(err) {console.log(err);return;}

      const { tournamentId, matchUps } = res;

      this.tournamentId = tournamentId;

      const roundIndex = 0;
      matchUps.forEach(({match, teamIds}) => {
        TournamentService.getMatchData(tournamentId, roundIndex, match, (err, matchResult) => {
          if(err) {console.log(err);return;}

          this.fixtureManager.addMatchUp(match, roundIndex, matchResult.score, this.tournamentId, teamIds);
        });

        teamIds.forEach(teamId => {
          TournamentService.getTeamData(tournamentId, teamId, (err, teamInfo) => {
            if(err) {console.log(err);return;}

            const { teamId, name, score } = teamInfo;
            this.fixtureManager.addTeamInfo(teamId, name, score, match, 0);
          });
        });
      });

      if (numberOfRounds > 1) {
        this._getRestOfMatchResults(numberOfRounds);
      }

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
        TournamentService.getMatchData(this.tournamentId, roundIndex, matchId, (err, matchResult) => {
          if(err) {console.log(err);return;}

          this.fixtureManager.addMatchUp(matchId, roundIndex, matchResult.score, this.tournamentId);
        });
      }
    }
  }
}

const tournament = new Tournament();
