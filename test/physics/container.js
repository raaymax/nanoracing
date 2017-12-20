
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const Container = require('../../src/physics/container');
const Body = require('../../src/physics/body');
const Vec = require('../../src/vec');

describe('Body container', ()=>{
    it('init',()=>{
        let c = new Container();
        let body = new Body();
        c.addBody(body);
        body.update = sinon.spy();
        c.update(1);
        expect(body.update.calledOnce).to.be.true;
    })
});
