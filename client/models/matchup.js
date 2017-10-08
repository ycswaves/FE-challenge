class MatchUp {
  constructor(tournamentService, matchId, roundId, tournamentId) {
    this.tournamentService = tournamentService;
    this.matchId = matchId;
    this.roundId = roundId;
    this.tournamentId = tournamentId;
    this.teams;
    this.score;
  }

  getMatchId() {
    return this.matchId;
  }

  getRoundId() {
    return this.roundId;
  }

  getTournamentId() {
    return this.tournamentId;
  }

  getMatchScore() {
    return this.score;
  }

  retrieveScore() {
    const {tournamentId, roundId, matchId} = this
    return this.tournamentService.getMatchData(tournamentId, roundId, matchId)
  }

  setScore(score) {
    this.score = score;
  }

  getWinner() {
    return this.winnerId;
  }

  addTeam(newTeam) {
    if (!this.teams) {
      this.teams = [newTeam];
    } else {
      this.teams.push(newTeam);
    }
  }

  addAllTeams(newTeams) {
    this.teams = newTeams;
  }

  compete(teamsPerMatch) {
    return new Promise((resolve, reject) => {
      if (!this._readyToCompete(teamsPerMatch)) {
        resolve(false);
      } else {
        const { tournamentId, score, matchId, roundId, teams } = this;
        const teamScores = teams.map(team => team.getScore());
        this.tournamentService.getWinner(tournamentId, score, teamScores).then(winnerScore => {
          let winner, lowest = -1;
          teams.forEach(team => {
            if (winnerScore.score === team.score && (lowest === -1 || team.teamId < lowest)) {
              winner = team;
              lowest = winner.teamId;
            }
          });
    
          resolve({winner, matchUp: this});
        }).catch(err => {
          reject(err);
        });
      }
    });
  }

  _readyToCompete(teamsPerMatch) {
    return this.teams && this.teams.length >= teamsPerMatch && this.score != undefined;
  }

}
