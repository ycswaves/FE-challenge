class View {
  static addMatch(matchId) {
    const emptySqr = document.createElement('span');
    emptySqr.id = matchId;
    emptySqr.classList.add('match');
    document.getElementById('match-progress').appendChild(emptySqr);
  }

  static completeMatch(matchId) {
    const matchElement = document.getElementById(matchId);
    matchElement.classList.add('completed');
  }

  static showWinner(winnerName) {
    document.getElementById('winner').innerHTML = `${winnerName} is the Winner.`
  }

  static reset() {
    document.getElementById('match-progress').innerHTML = '';
    document.getElementById('winner').innerHTML = '';
  }
}