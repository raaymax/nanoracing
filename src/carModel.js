const Body = require('./body');
const Vec = require('./vec');


class Wheel{
    constructor(conf, ctrl, x,y,parent, steer, power){
        this.conf = conf;
        this.ctrl = ctrl;
        this.parent = parent;
        this.relPos = Vec.New(x,y);
        this.steer = steer;
        this.steerAngle = 0;
        this.power = power;
        this.debug = false;
        this.drift = false;
        this.prevPos = this.pos;
        this.force = Vec.Zero();
    }

    get pos(){
        return this.relPos.clone().rotate(this.parent.rotation).add(this.parent.position);

    }

    update(dt){
        if(this.steer){
            this.steerWheel(dt);
        }
        if(this.ctrl.break){
            this.breakWheel(dt);
        }else {
            if(this.power){
                this.powerWheel(dt);
            }
            this.processWheel(dt);
        }
        this.applyFriction();
    }

    setAngle(angle){
        this.steerAngle = angle;
    }
    getAngle(){
        return this.parent.rotation+this.steerAngle;
    }

    toLocalAxis(axis){
        let angle = this.getAngle();
        return axis.clone().rotate(angle);
    }

    get rightAxis(){
        let right = Vec.New(1,0);
        return this.toLocalAxis(right);
    }

    get forwardAxis(){
        let forward = Vec.New(0,-1);
        return this.toLocalAxis(forward);
    }

    addFriction(F){
        this.force.add(F);
    }

    applyFriction(){
        let F = this.force;
        let N = this.parent.massPerWheel*9.8;
        let Fs  = N*0.9;
        let Fk  = N*0.6;
        let f = F.len();
        let Force;
        if(!this.drift) {
            if (f > Fs) {
                this.drift = true;
                Force = F.normalize().mulp(Fs);
            }else{
                Force = F;
            }
        }else{
            if(f > Fk){
                Force = F.normalize().mulp(Fk);
            }else{
                this.drift = false;
                Force = F;
            }
        }

        this.parent.applyForce(Force, this.pos);
        this.force.mulp(0);
    }

    computeNextPosition(dt){
        let acceleration = this.parent.force.clone().mulp(this.parent.invMass);
        let angularAcceleration = this.parent.invInertia*this.parent.torque;
        let velocity = this.parent.velocity.clone().add(acceleration.clone().mulp(dt));
        let angularVelocity = this.parent.angularVelocity + dt*angularAcceleration;

        let pos = this.parent.position.clone();
        pos.add(velocity.mulp(dt)).add(acceleration.mulp(Math.pow(dt,2)/2));
        let rotation = this.parent.rotation + angularVelocity*dt + 1/2 * angularAcceleration * Math.pow(dt,2);
        let position = this.relPos.clone().rotate(rotation).add(pos);
        return position;
    }

    breakWheel(dt){
        let s = this.computeNextPosition(dt);
        let ds = s.sub(this.pos);
        let V = ds.divp(dt);
        let F = V.mulp(this.parent.massPerWheel).divp(dt).mulp(-1);
        this.addFriction(F);
    }

    processWheel(dt){
        let s = this.computeNextPosition(dt);
        let ds = s.sub(this.pos);
        let V = ds.divp(dt);
        let Vb = V.castOnAxis(this.rightAxis);
        let F = Vec.New(-Vb,0).mulp(this.parent.massPerWheel).divp(dt);
        this.addFriction(this.toLocalAxis(F));
    }

    powerWheel(dt){
        let forward = this.forwardAxis.mulp(5000);

        if(this.ctrl.forward){
            this.addFriction(forward);
        }

        if(this.ctrl.backward){
            this.addFriction(forward.neg());
        }
    }

    steerWheel(dt){
        let alpha = Math.PI/2*dt;
        let maxAngle = Math.PI/4;
        if(this.ctrl.right){
            if(this.steerAngle < maxAngle) {
                this.setAngle(this.steerAngle+alpha)
            }
        }else if(this.ctrl.left){
            if(this.steerAngle > -maxAngle) {
                this.setAngle(this.steerAngle-alpha)
            }
        }else{
            if(this.steerAngle < alpha && this.steerAngle > -alpha){
                this.setAngle(0)
            }else if(this.steerAngle < 0) {
                this.setAngle(this.steerAngle+alpha)
            }else if(this.steerAngle > 0) {
                this.setAngle(this.steerAngle-alpha)
            }
        }
    }
}

module.exports = class Car extends Body{
    constructor(ctrl,conf){
        super();
        this.ctrl = ctrl;
        this.wheels = conf.wheels.map(wheel=>{
            return new Wheel(wheel, ctrl, wheel.pos.x, wheel.pos.y,this, wheel.steer, wheel.propulsion);
        });
    }

    get massPerWheel(){
        return this.mass/this.wheels.length;
    }

    update(dt){
        this.wheels.forEach(wheel=>wheel.update(dt));
        super.update(dt);
    }
};