class Team {
  constructor(teamId, name, score, matchUpKey) {
    this.teamId = teamId;
    this.name = name;
    this.score = score;
    this.matchUpKey = matchUpKey;
  }

  getScore() {
    return this.score;
  }

  getName() {
    return this.name;
  }
}