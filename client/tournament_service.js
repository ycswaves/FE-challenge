const defaultFetchConfigs = {
  method: "POST",
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
  }
}

const REQ_COUNT_THRESHOLD = 1000;

class TournamentService {
  constructor() {
    this.requestCount = 0;
    this.requestQueue = [];
  }

  _applyLimit(fn) {
    if (this.requestCount > REQ_COUNT_THRESHOLD) {
      return new Promise(resolve => {
        this.requestQueue.push(() => {
          resolve(fn());
        });
      });
    } else {
      this.requestCount++;        
      return fn();
    }
  }

  _handlePromise(res) {
    return res.then(data => {
      this._requestHandled()
      return data.json()
    });
  }

  _requestHandled() {
    this.requestCount--;

    if (this.requestQueue.length > 0) {
      const fn = this.requestQueue.shift();
      fn();
    }
  }

  getMatchUps(teamsPerMatch, numberOfTeams) {
    return this._applyLimit(() => {
      const promise = fetch("/tournament", FetchUtil.getFetchConfig(
        FetchUtil.parameterize({teamsPerMatch, numberOfTeams})
      ));
      return this._handlePromise(promise);
    })
  }

  getTeamData(tournamentId, teamId) {
    return this._applyLimit(() => {
      const promise = fetch(`/team?${FetchUtil.parameterize({tournamentId, teamId})}`);
      return this._handlePromise(promise);
    })
  }

  getMatchData(tournamentId, round, match) {
    return this._applyLimit(() => {
      const promise = fetch(`/match?${FetchUtil.parameterize({tournamentId, round, match})}`);
      return this._handlePromise(promise);
    })
  }

  getWinner(tournamentId, matchScore, teamScores) {
    return this._applyLimit(() => {
      const promise = fetch(`/winner?${FetchUtil.parameterize({tournamentId, teamScores, matchScore})}`);
      return this._handlePromise(promise);
    })
  }
}

class FetchUtil {

  static getFetchConfig(body) {
    return {
      method: "POST", //TODO: use defaultFetchConfigs
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      },
      body: body
    }
  }

  static parameterize(obj) {
    return Object.keys(obj)
            .map(k => {
              if (Array.isArray(obj[k])) {
                return obj[k].map(item => `${encodeURIComponent(k)}=${encodeURIComponent(item)}`).join('&');
              } else {
                return `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`;
              }
            })
            .join('&');
  }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { FetchUtil, TournamentService }
}
