class FixtureManager {
  constructor(numberOfRounds, teamsPerMatch) {
    this.matchInfoMap = {};
    this.teamInfoMap = {};
    this.teamsPerMatch = teamsPerMatch;
    this.numberOfRounds = numberOfRounds;
  }

  addMatchUp(matchId, roundId, score, tournamentId, teamIds) {
    const key = this._getMatchUpKey(matchId, roundId);
    let matchUp;
    if (this.matchInfoMap[key]) { // existing matchUp info should either has only score or teams
      matchUp = this.matchInfoMap[key]
      if (score) {
        matchUp.setScore(score);
      }

      if (!isNaN(teamIds)) { // add a single team
        matchUp.addTeam(teamIds);
      }

    } else {
      View.addMatch(key);      
      const teamsIdsReformatted = !isNaN(teamIds)? [teamIds] : teamIds;
      matchUp = new MatchUp(matchId, roundId, score, tournamentId, teamsIdsReformatted);
    }

    matchUp.compete(this.teamsPerMatch, this.teamInfoMap, (winner) => {
      if (winner) {
        this._handleWinner(winner);
      }
    });

    this.matchInfoMap[key] = matchUp;
  }

  addTeamInfo(teamId, name, score, matchId, roundId) {
    const matchUpKey = this._getMatchUpKey(matchId, roundId);
    this.teamInfoMap[teamId] = new Team(teamId, name, score, matchUpKey);

    if (this.matchInfoMap[matchUpKey]) {
      const matchUp = this.matchInfoMap[matchUpKey];
      matchUp.addTeam(teamId);
      matchUp.compete(this.teamsPerMatch, this.teamInfoMap, (winner) => {
        if (winner) {
          this._handleWinner(winner)
        }
      });
    } 
  }

  _handleWinner(winner) {
    const {winnerId, matchId, currentRoundId, tournamentId} = winner;
    View.completeMatch(this._getMatchUpKey(matchId, currentRoundId));
    
    const nextRoundMatchId = Math.floor(matchId / this.teamsPerMatch);

    if (this._isLastMatch(matchId, currentRoundId)) {
      View.showWinner(this.teamInfoMap[winnerId].getName());
      // console.log('====== winner =====', this.teamInfoMap[winnerId]);
    } else {
      //add winner to next round match
      this.addMatchUp(nextRoundMatchId, currentRoundId + 1, undefined, tournamentId, winnerId);      
    }
  }

  _isLastMatch(matchId, roundId) {
    return matchId === 0 && roundId === this.numberOfRounds - 1;
  }

  _getMatchUpKey(matchId, roundId) {
    return `match_r${roundId}_m${matchId}`
  }

}