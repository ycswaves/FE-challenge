const defaultFetchConfigs = {
  method: "POST",
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
  }
}

const REQ_COUNT_THRESHOLD = 1;

class TournamentService {
  constructor(httpClient) {
    this.fetch = httpClient || window.fetch.bind(window);
    this.requestCount = 0;
    this.requestQueue = [];
  }

  _applyLimit(fn) {
    if (this.requestCount > REQ_COUNT_THRESHOLD) {
      return new Promise(resolve => {
        this.requestQueue.push(() => {
          resolve(fn())
        });
      })
    }
    this.requestCount++;    
    return Promise.resolve(fn());
  }

  _handlePromise(res) {
    return Promise.resolve(res)
    .then(data => {
      this._requestHandled()
      return data.json()
    }).catch(err => {
      View.showError(err.message || 'Error occurs'); 
    });
  }

  _requestHandled() {
    this.requestCount--;


    if (this.requestQueue.length > 0) {
      const fn = this.requestQueue.shift();
      fn()
      this.requestCount++;
    }
  }

  getMatchUps(teamsPerMatch, numberOfTeams) {
    return this._applyLimit(() => {
      const promise = this.fetch("/tournament", FetchUtil.getFetchConfig(
        FetchUtil.parameterize({teamsPerMatch, numberOfTeams})
      ));
      return this._handlePromise(promise);
    })
  }

  getTeamData(tournamentId, teamId) {
    return this._applyLimit(() => {
      const promise = this.fetch(`/team?${FetchUtil.parameterize({tournamentId, teamId})}`);
      return this._handlePromise(promise);
    })
  }

  getMatchData(tournamentId, round, match) {
    return this._applyLimit(() => {
      const promise = this.fetch(`/match?${FetchUtil.parameterize({tournamentId, round, match})}`);
      return this._handlePromise(promise);
    })
  }

  getWinner(tournamentId, matchScore, teamScores) {
    return this._applyLimit(() => {
      const promise = this.fetch(`/winner?${FetchUtil.parameterize({tournamentId, teamScores, matchScore})}`);
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
