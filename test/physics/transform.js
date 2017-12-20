
const chai = require('chai');
const expect = chai.expect;
const Transform = require('../../src/physics/transform');
const Vec = require('../../src/vec');

describe('Transformation of coordinates', ()=>{
    it('to global translation', ()=>{
        let t = new Transform(0, Vec.New(1,1),1);
        let pos = t.toGlobal(Vec.New(0,0));
        expect(pos).to.include({x:1, y:1});
    });
    it('to local translation', ()=>{
        let t = new Transform(0, Vec.New(1,1),1);
        let pos = t.toLocal(Vec.New(1,1));
        expect(pos).to.include({x:0, y:0});
    });

    it('two-ways translation', ()=>{
        let t = new Transform(0, Vec.New(2,2),1);
        let pos = Vec.New(2,2);
        let gPos = t.toGlobal(pos);
        let lPos = t.toLocal(gPos);
        expect(pos).to.deep.eql(lPos);
    });

    it('to global scale',()=>{
        let t = new Transform(0, Vec.New(0,0),2);
        let pos = t.toGlobal(Vec.New(2,2));
        expect(pos).to.include({x:4, y:4});
    });

    it('to local scale',()=>{
        let t = new Transform(0, Vec.New(0,0),2);
        let pos = t.toLocal(Vec.New(2,2));
        expect(pos).to.include({x:1, y:1});
    });

    it('two-ways scale', ()=>{
        let t = new Transform(0, Vec.New(0,0),2);
        let pos = Vec.New(2,2);
        let gPos = t.toGlobal(pos);
        let lPos = t.toLocal(gPos);
        expect(pos).to.deep.eql(lPos);
    });

    it('to global rotation',()=>{
        let t = new Transform(Math.PI/2, Vec.New(0,0),1);
        let pos = t.toGlobal(Vec.New(1,0));
        expect(Math.round(pos.x)).to.eql(0,'x');
        expect(Math.round(pos.y)).to.eql(1,'y');
    });

    it('to local rotation',()=>{
        let t = new Transform(Math.PI/2, Vec.New(0,0),1);
        let pos = Vec.New(1,0);
        let lPos = t.toLocal(pos);
        expect(Math.round(lPos.x)).to.eql(0,'x');
        expect(Math.round(lPos.y)).to.eql(-1,'y');
    });

    it('two-ways rotation', ()=>{
        let t = new Transform(Math.PI/2, Vec.New(0,0),1);
        let pos = Vec.New(1,0);
        let gPos = t.toGlobal(pos);
        let lPos = t.toLocal(gPos);
        expect(pos).to.deep.eql(lPos);
    });
    it('to global translation + scale', ()=>{
        let t = new Transform(0, Vec.New(2,2),2);
        let pos = t.toGlobal(Vec.New(2,2));
        expect(Math.round(pos.x)).to.eql(6,'x');
        expect(Math.round(pos.y)).to.eql(6,'y');
    });

    it('to local translation + scale', ()=>{
        let t = new Transform(0, Vec.New(2,2),2);
        let pos = t.toLocal(Vec.New(6,6));
        console.log(pos);
        expect(Math.round(pos.x)).to.eql(2,'x');
        expect(Math.round(pos.y)).to.eql(2,'y');
    });

    it('two-ways translation + rotation', ()=>{
        let t = new Transform(Math.PI/2, Vec.New(2,2),1);
        let pos = Vec.New(2,2);
        let gPos = t.toGlobal(pos);
        let lPos = t.toLocal(gPos);
        expect(pos.x).to.eql(Math.round(lPos.x));
        expect(pos.y).to.eql(Math.round(lPos.y));
    });

    it('two-ways translation + scale', ()=>{
        let t = new Transform(0, Vec.New(2,2),2);
        let pos = Vec.New(2,2);
        let gPos = t.toGlobal(pos);
        let lPos = t.toLocal(gPos);
        expect(pos).to.deep.eql(lPos);
    });

    it('two-ways rotation + scale', ()=>{
        let t = new Transform(Math.PI/2, Vec.New(0,0),2);
        let pos = Vec.New(2,2);
        let gPos = t.toGlobal(pos);
        let lPos = t.toLocal(gPos);
        expect(pos.x).to.eql(Math.round(lPos.x));
        expect(pos.y).to.eql(Math.round(lPos.y));
    });

    it('two-ways translation + rotation + scale', ()=>{
        let t = new Transform(Math.PI/2, Vec.New(2,2),2);
        let pos = Vec.New(2,2);
        let gPos = t.toGlobal(pos);
        let lPos = t.toLocal(gPos);
        expect(pos.x).to.eql(Math.round(lPos.x));
        expect(pos.y).to.eql(Math.round(lPos.y));
    });

    it('hierarchy',()=>{
        let t = new Transform(Math.PI/2, Vec.New(2,2),2);
        let t2 = new Transform(Math.PI/2, Vec.New(3,3),1,{transform:t});
        let pos = Vec.New(2,2);
        let gPos = t2.toGlobal(pos);
        let lPos = t2.toLocal(gPos);
        expect(pos.x).to.eql(Math.round(lPos.x));
        expect(pos.y).to.eql(Math.round(lPos.y));

        expect(Math.round(gPos.x)).to.eql(-8, 'x');
        expect(Math.round(gPos.y)).to.eql(4, 'y');
    })

});
