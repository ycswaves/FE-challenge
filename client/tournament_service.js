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
      return FetchUtil.handlePromise(promise, this._requestHandled);
    })
  }

  getTeamData(tournamentId, teamId) {
    return this._applyLimit(() => {
      const promise = fetch(`/team?${FetchUtil.parameterize({tournamentId, teamId})}`);
      return FetchUtil.handlePromise(promise, this._requestHandled);
    })
  }

  getMatchData(tournamentId, round, match) {
    return this._applyLimit(() => {
      const promise = fetch(`/match?${FetchUtil.parameterize({tournamentId, round, match})}`);
      return FetchUtil.handlePromise(promise, this._requestHandled);
    })
  }

  getWinner(tournamentId, matchScore, teamScores) {
    return this._applyLimit(() => {
      const promise = fetch(`/winner?${FetchUtil.parameterize({tournamentId, teamScores, matchScore})}`);
      return FetchUtil.handlePromise(promise, this._requestHandled);
    })
  }
}

class FetchUtil {

  static handlePromise(res, notifyReqQueue) {
    return res.then(data => {
      notifyReqQueue()
      return data.json()
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
