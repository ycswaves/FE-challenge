class FixtureManager {
  constructor(numberOfRounds, teamsPerMatch, tournamentService) {
    this.matchInfoMap = {};
    this.teamInfoMap = {};
    this.teamsPerMatch = teamsPerMatch;
    this.numberOfRounds = numberOfRounds;
    this.tournamentService = tournamentService;
  }

  addNewMatchUp(matchId, roundId, tournamentId, team = null) {
    const key = this._getMatchUpKey(matchId, roundId);
    let matchUp;
    if (this.matchInfoMap[key]) {
      matchUp = this.matchInfoMap[key]
    } else {
      matchUp = this.matchInfoMap[key] = new MatchUp(this.tournamentService, matchId, roundId, tournamentId);
      View.addMatch(key);
    }
    matchUp.retrieveScore().then(matchResult => {      
      matchUp.setScore(matchResult.score);
      if(team) {
        matchUp.addTeam(team);
      }
      
      matchUp.compete(this.teamsPerMatch).then(matchResult => {
        this._handleWinner(matchResult);
      });

    })

  }

  addTeamInfo(teamId, name, score, matchId, roundId, tournamentId) {
    const matchUpKey = this._getMatchUpKey(matchId, roundId);
    this.teamInfoMap[teamId] = new Team(teamId, name, score, matchUpKey);

    if (!this.matchInfoMap[matchUpKey]) {
      this.matchInfoMap[matchUpKey] = new MatchUp(this.tournamentService, matchId, roundId, tournamentId);
      View.addMatch(matchUpKey);
    }

    const matchUp = this.matchInfoMap[matchUpKey];
    matchUp.addTeam(this.teamInfoMap[teamId]);

    matchUp.compete(this.teamsPerMatch).then(matchResult => {
      this._handleWinner(matchResult);
    });
  }

  _handleWinner(matchResult) {
    if (!matchResult) return;

    const {winner, matchUp} = matchResult;
    const matchId = matchUp.getMatchId();
    const currentRoundId = matchUp.getRoundId();
    View.completeMatch(this._getMatchUpKey(matchId, currentRoundId));
    
    const nextRoundMatchId = Math.floor(matchId / this.teamsPerMatch);

    if (this._isLastMatch(matchId, currentRoundId)) {
      View.showWinner(winner.getName());
      return;
    }
    
    //add winner to next round match
    const key = this._getMatchUpKey(matchId, currentRoundId);
    delete this.matchInfoMap[key];

    const nextRoundId = currentRoundId + 1
    const nextRoundMatchKey =  this._getMatchUpKey(nextRoundMatchId, nextRoundId);
    
    let nextMatchUp = this.matchInfoMap[nextRoundMatchKey];
    if (!nextMatchUp) {
      this.addNewMatchUp(nextRoundMatchId, nextRoundId, matchUp.getTournamentId(), winner)
    } else {
      nextMatchUp.addTeam(winner)
      nextMatchUp.compete(this.teamsPerMatch).then(matchResult => {
        this._handleWinner(matchResult);
      });
    }   
  }

  _isLastMatch(matchId, roundId) {
    return matchId === 0 && roundId === this.numberOfRounds - 1;
  }

  _getMatchUpKey(matchId, roundId) {
    return `match_r${roundId}_m${matchId}`
  }

}