const Vec = require('./vec');

class Body{
    constructor(){
        this.mass = 0.2;
        this.invMass = 1/0.2;
        this.velocity = Vec.Zero();
        this.acceleration = Vec.Zero();
        this.rotation = 0;
        this.angularVelocity = 0;
        this.angularAcceleration = 0;
        this.position = Vec.Zero();
        this.force = Vec.Zero();
        this.torque = 0;
        this.inertia = 1;
        this.invInertia = 1;
    }

    setMass(mass){
        this.mass = mass;
        this.invMass = 1/mass;
    }

    applyForce(force, point = Vec.Zero()){
        this.force.add(force);
        this.torque += Vec.Cross(Vec.sub(point, this.position), force);
    }


    update(dt){
        this.velocity.add(this.force.clone().mulp(dt*this.invMass));
        this.angularVelocity += dt*this.invInertia*this.torque;

        this.position.x = this.position.x + this.velocity.x*dt + 1/2 * this.acceleration.x * Math.pow(dt,2);
        this.position.y = this.position.y + this.velocity.y*dt + 1/2 * this.acceleration.y * Math.pow(dt,2);
        this.rotation = this.rotation + this.angularVelocity*dt + 1/2 * this.angularAcceleration * Math.pow(dt,2);
    }


}