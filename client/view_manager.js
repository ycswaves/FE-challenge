class View {
  static getReady(cb) {
    const startBtn = document.getElementById('start');
    startBtn.addEventListener('click', (e) => {
      this.reset();
      e.target.setAttribute('disabled', true);
      cb();
    })
  }

  static getUserInput() {
    return {
      teamsPerMatch: document.getElementById('teamsPerMatch').value,
      numberOfTeams: document.getElementById('numberOfTeams').value
    }
  }

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
    document.getElementById('winner').innerHTML = winnerName;
    document.getElementById('winner-message').style.visibility = 'visible';
    document.getElementById('start').removeAttribute('disabled');
  }

  static reset() {
    document.getElementById('match-progress').innerHTML = '';
    document.getElementById('winner-message').style.visibility = 'hidden';
    document.getElementById('error').innerHTML = '';
  }

  static showError(errMsg) {
    document.getElementById('error').innerHTML = errMsg;
    document.getElementById('start').removeAttribute('disabled');    
  }
}