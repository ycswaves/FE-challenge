const defaultFetchConfigs = {
  method: "POST",
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
  }
}

class TournamentService {
  static getMatchUps(teamsPerMatch, numberOfTeams, cb) {
    const promise = fetch("/tournament", FetchUtil.getFetchConfig(
      FetchUtil.parameterize({teamsPerMatch, numberOfTeams})
    ));
    FetchUtil.handlePromise(promise, cb);
  }

  static getTeamData(tournamentId, teamId, cb) {
    const promise = fetch(`/team?${FetchUtil.parameterize({tournamentId, teamId})}`);
    FetchUtil.handlePromise(promise, cb);
  }

  static getMatchData(tournamentId, round, match, cb) {
    const promise = fetch(`/match?${FetchUtil.parameterize({tournamentId, round, match})}`);
    FetchUtil.handlePromise(promise, cb);
  }

  static getWinner(tournamentId, matchScore, teamScores, cb) {
    const promise = fetch(`/winner?${FetchUtil.parameterize({tournamentId, teamScores, matchScore})}`);
    FetchUtil.handlePromise(promise, cb);
  }
}

class FetchUtil {
  static handlePromise(res, cb) {
    if (typeof cb !== 'function') return false;

    res.then(res => {
      res.json()
         .then(res => cb(null, res))
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
