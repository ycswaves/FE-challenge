class MatchUp {
  constructor(matchId, roundId, score, tournamentId, teamIds = []) {
    this.matchId = matchId;
    this.roundId = roundId;
    this.score = score;
    this.tournamentId = tournamentId;
    this.teamIds = teamIds;

    console.log(this)
  }

  getMatchScore() {
    return this.score;
  }

  setScore(score) {
    this.score = score;
  }

  getWinner() {
    return this.winnerId;
  }

  addTeam(teamId) {
    if (this.teamIds.indexOf(teamId) < 0) {
      this.teamIds.push(teamId);
    }
  }

  compete(teamsPerMatch, teamInfoMap, cb) {
    if (!this._readyToCompete(teamsPerMatch, teamInfoMap)) {
      cb(false);
      return false;
    }


    const { tournamentId, score, matchId, roundId, teamIds } = this;
    const teamScores = teamIds.map(teamId => teamInfoMap[teamId].getScore());
    TournamentService.getWinner(tournamentId, score, teamScores, (err, winnerScore) => {
      if(err) {
        console.log(err);
        return;
      }

      let winnerId, lowest = -1;
      teamIds.forEach(teamId => {
        const teamInfo = teamInfoMap[teamId];
        if (winnerScore.score === teamInfo.score && (lowest === -1 || teamInfo.teamId < lowest)) {
          winnerId = teamId;
          lowest = teamId;
        }
      });

      this.winnerId = winnerId;
      cb({winnerId, matchId, tournamentId, currentRoundId: roundId});
    })
  }

  _readyToCompete(teamsPerMatch, teamInfoMap) {
    return this.teamIds.length >= teamsPerMatch && this._teamScoreReady(teamInfoMap);
  }

  _teamScoreReady(teamInfoMap) {
    for(let i = 0; i < this.teamIds.length; i++) {
      if (!teamInfoMap[this.teamIds[i]]) {
        return false;
      }
    }
    return true;
  }
 }