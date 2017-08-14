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
    this._requestHandled = this._requestHandled.bind(this);
  }

  _applyLimit(fn) {
    if (this.requestCount > REQ_COUNT_THRESHOLD) {
      this.requestQueue.push(fn);
    } else {
      fn();
      this.requestCount++;        
    }
  }

  _requestHandled() {
    this.requestCount--;

    if (this.requestQueue.length > 0) {
      const fn = this.requestQueue.shift();
      fn();
    }
  }

  getMatchUps(teamsPerMatch, numberOfTeams, cb) {
    this._applyLimit(() => {
      const promise = fetch("/tournament", FetchUtil.getFetchConfig(
        FetchUtil.parameterize({teamsPerMatch, numberOfTeams})
      ));
      FetchUtil.handlePromise(promise, cb, this._requestHandled);
    })
    
  }

  getTeamData(tournamentId, teamId, cb) {
    this._applyLimit(() => {
      const promise = fetch(`/team?${FetchUtil.parameterize({tournamentId, teamId})}`);
      FetchUtil.handlePromise(promise, cb, this._requestHandled);
    })
  }

  getMatchData(tournamentId, round, match, cb) {
    this._applyLimit(() => {
      const promise = fetch(`/match?${FetchUtil.parameterize({tournamentId, round, match})}`);
      FetchUtil.handlePromise(promise, cb, this._requestHandled);
    })
  }

  getWinner(tournamentId, matchScore, teamScores, cb) {
    this._applyLimit(() => {
      const promise = fetch(`/winner?${FetchUtil.parameterize({tournamentId, teamScores, matchScore})}`);
      FetchUtil.handlePromise(promise, cb, this._requestHandled);
    })
  }
}

class FetchUtil {
  static handlePromise(res, cb, notifyReqQueue) {
    if (typeof cb !== 'function') return false;

    // todo: change to chainable promise so that only one catch is needed
    res.then(res => {
      res.json()
         .then(res => {
            notifyReqQueue();
            if (res.error) {
              cb(res);
            } else {
              cb(null, res)
            }
          })
         .catch(err => cb(err));
    }).catch(err => {
      cb(err);
    });
  }

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
