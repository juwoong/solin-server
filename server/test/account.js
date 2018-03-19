/**
 * Created by juwoong on 2015. 9. 6..
 */
var should = require('should');
var assert = require('assert');
var request = require('supertest');

describe('Account', function(){
    var url = 'http://api.solinfor.me';
    this.timeout(5000);

    it('should return error trying to auth without information', function(done){
        request(url)
            .post('/user')
            .end(function(err, res) {
                if(err) throw err;
                //console.log(res);
                res.res.statusCode.should.be.exactly(400);
                //res.should.have.status(400);
                //res.body.status.should.equal(400);
                //console.log(res);
                done();
            })
    });
    it('should return error trying to auth with wrong access token', function(done){
        var body = {
            "userId" : "158199431181540",
            "accountType" : "facebook",
            "userAccessToken" : "g1BxAzy0eSR98a6ijd76vLMbZAZC5jc2UBgDB3PBL4ZCbSZA9ZAK1Y5BfaRtACYMAVfN6tFoMnSAOIaosMp8YNYNiKQZDZD"
        };

        request(url)
            .post('/user')
            .send(body)
            .end(function(err, res) {
                if(err) throw err;

                //res.body.should.have.status(400);
                res.res.statusCode.should.be.exactly(400);
                done();
            });
    });
    it('should correctly auth with right information', function(done){
        var body = {
            "userId" : "158199431181540",
            "accountType" : "facebook",
            "userAccessToken" : "CAAX1qMNwqN8BALcQkB34mkRmdwocPJqbXnhfl7fY3HMVXZCM2PRfrEkZCwvw7b3ej3MZBcnLC4rs0og1BxAzy0eSR98a6ijx79TaboLcZAkJQxFGWYE93nsvAqICAWTM9ZAd18d76vLMbZAZC5jc2UBgDB3PBL4ZCbSZA9ZAK1Y5BfaRtACYMAVfN6tFoMnSAOIaosMp8YNYNiKQZDZD"
        };

        request(url)
            .post('/user')
            .send(body)
            .end(function(err, res) {
                if(err) throw err;
                res = res.res;

                //res.body.should.have.status(200);
                res.body.should.have.property('userId');
                res.body.should.have.property('accessToken');
                res.body.should.have.property('refreshToken');
                done();
            });
    });
    it('should return auth error to access api that need authority', function(done){

        request(url)
            .get('/user/me')
            .set('accesstoken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHBpcmVUaW1lIjoxNDQxNTg4NDc3MTMzLCJ1c2VySWQiOiI1NWUwNGVkZWJjZTM3NzY2NThhN2MyMDEifQ.Knjnn1ORVlQP5C6ZYNCZQbSRhaP9aerqUC9ZP8-XGrA')
            .end(function(err, res) {
                if(err) throw err;

                res.res.statusCode.should.be.exactly(401);
                done();
            });
    });

    it('shold return new accesstoken', function() {
        var body = {refreshToken : "a3ee1e37c2daaa4065ca5098f5a6b1af12058e93c21c0aa2f0d1808f81530798"};

        request(url)
            .post('/user/me/refresh')
            .send()
            .set('accesstoken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHBpcmVUaW1lIjoxNDQxNTg4NDc3MTMzLCJ1c2VySWQiOiI1NWUwNGVkZWJjZTM3NzY2NThhN2MyMDEifQ.Knjnn1ORVlQP5C6ZYNCZQbSRhaP9aerqUC9ZP8-XGrA')
            .end(function(err) {
                res.res.should.have.property('accessToken');
            });
    });
});
