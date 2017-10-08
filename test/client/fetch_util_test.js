const chai = require('chai');
const expect = chai.expect;

const { FetchUtil } = require('../../client/tournament_service.js')
describe('FetchUtil', function() {
  describe('#getFetchConfig', function() {
    it('should return configuration for POST action', function() {
      const actual = FetchUtil.getFetchConfig({a: 1});
      const expected = {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body: {a: 1}
      }

      expect(actual).to.eql(expected);
    })
  })
  
  describe('#parameterize', function() {
    context('with param needs to be uri encoded', function() {
      const param = { a: 1, b: 2, c: 'white space' };
      it('should parameterize', function() {
        const actual = FetchUtil.parameterize(param);
        const expected = 'a=1&b=2&c=white%20space';
        
        expect(actual).to.eql(expected);
      })
    });

    context('no array in param object', function() {
      const param = { a: 1, b: 2 };
      it('should parameterize', function() {
        const actual = FetchUtil.parameterize(param);
        const expected = 'a=1&b=2';
        
        expect(actual).to.eql(expected);
      })
    });
    
    context('array in param object', function() {
      const param = { a: 1, b: 2, c: ['c1', 'c2'] };
      it('should parameterize', function() {
        const actual = FetchUtil.parameterize(param);
        const expected = 'a=1&b=2&c=c1&c=c2';
        
        expect(actual).to.eql(expected);
      })
    })
  })
})