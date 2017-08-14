const defaultFetchConfigs = {
  method: "POST",
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
  }
}

const COUNT_THRESHOLD = 100;
const WAIT_TIME = 1100;

class TournamentService {
  constructor() {
    this.requestCount = 0;
    this.delayedRequestCount = 0;
    this.batchIndex = 1;
  }

  _applyLimit(fn) {
    this.requestCount++;
    console.log(this.requestCount);
    if (this.requestCount > COUNT_THRESHOLD) {
      console.log('apply limit', WAIT_TIME * this.batchIndex)
      setTimeout(() => {
        fn();
        this.delayedRequestCount++;        
        if (this.delayedRequestCount > COUNT_THRESHOLD) {
          this.requestCount = 0;
          this.delayedRequestCount = 0;
          this.batchIndex++;
        }
      }, WAIT_TIME * this.batchIndex);
    } else {
      fn();
    }
  }

  getMatchUps(teamsPerMatch, numberOfTeams, cb) {
    this._applyLimit(() => {
      const promise = fetch("/tournament", FetchUtil.getFetchConfig(
        FetchUtil.parameterize({teamsPerMatch, numberOfTeams})
      ));
      FetchUtil.handlePromise(promise, cb);
    })
    
  }

  getTeamData(tournamentId, teamId, cb) {
    this._applyLimit(() => {
      
      const promise = fetch(`/team?${FetchUtil.parameterize({tournamentId, teamId})}`);
      FetchUtil.handlePromise(promise, cb);
    })
  }

  getMatchData(tournamentId, round, match, cb) {
    this._applyLimit(() => {
      
      const promise = fetch(`/match?${FetchUtil.parameterize({tournamentId, round, match})}`);
      FetchUtil.handlePromise(promise, cb);
    })
  }

  getWinner(tournamentId, matchScore, teamScores, cb) {
    this._applyLimit(() => {
      
      const promise = fetch(`/winner?${FetchUtil.parameterize({tournamentId, teamScores, matchScore})}`);
      FetchUtil.handlePromise(promise, cb);
    })
  }
}

class FetchUtil {
  static handlePromise(res, cb) {
    if (typeof cb !== 'function') return false;

    res.then(res => {
      res.json()
         .then(res => {
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
      method: "POST",
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
