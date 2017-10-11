const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
var sinonChai = require("sinon-chai");
chai.should();
chai.use(sinonChai);

const { TournamentService } = require('../../client/tournament_service.js')


describe('Tournament Service', function (){
  let ts, httpClientStub;
  const pr = new Promise(resolve => 'done');
  beforeEach(function (){
    httpClientStub = sinon.stub().returns(pr);
    ts = new TournamentService(httpClientStub);
  })
  describe('getMatchUps', function (){
    it('should call /tournament with correct format', function (){
      ts.getMatchUps(2, 4)
      sinon.assert.calledWith(httpClientStub, '/tournament');
      // expect(httpClientStub).to.have.been.calledWith("/tournament", 'asdf');
      // httpClientStub.should.have.been.calledWith('/tournament')

      
    })
  })
})