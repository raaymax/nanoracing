const Vec = require('../vec');
const Transform = require('./transform');

module.exports = class Body{
    constructor(){
        this._isBody = true;
        this.static = false;
        this.transform = new Transform();
        this.mass = 0.2;
        this.invMass = 1/0.2;
        this.velocity = Vec.Zero();
        this.acceleration = Vec.Zero();
        this.angularVelocity = 0;
        this.angularAcceleration = 0;
        this.force = Vec.Zero();
        this.torque = 0;
        this.prevForce = this.force;
        this.prevTorque = 0;
        this.invInertia = 1/this.inertia;
        this.width = 2; //TODO
        this.height = 4; //TODO
        let w = this.width;
        let h = this.height;
        this.inertia = ( w*w + h*h ) * this.mass / 12;
        this.invInertia = 1/this.inertia;
    }

    getVertices(){
        if(!this.collider) throw new Error('collider not defined');
        return this.collider.vertices.map(v=>this.transform.toParent(v))
    }


    set parent(val){
        this.transform.parent = val;
    }
    get parent(){
        return this.transform.parent;
    }

    set rotation(val){
        this.transform.rotation = val;
    }
    get rotation(){
        return this.transform.rotation;
    }

    set position(val){
        this.transform.position = val;
    }
    get position(){
        return this.transform.position;
    }

    set scale(val){
        this.transform.rotation = val;
    }
    get scale(){
        return this.transform.scale;
    }

    setWorld(w){
        this.world = w;
    }

    setMass(mass){
        let w = this.width;
        let h = this.height;
        this.mass = mass;
        this.invMass = 1/mass;
        this.inertia = ( w*w + h*h ) * this.mass / 12;
        this.invInertia = 1/this.inertia;
    }

    setPosition(pos){
        this.position = pos;
    }

    setRotation(angle){
        this.rotation = angle;
    }

    applyForce(force, point = Vec.Zero()){
        if(force.len() === 0) return;
        this.force.add(force);
        if(!point.isZero()) {
            this.torque += Vec.Cross(point.clone().sub(this.position), force);
        }
    }

    update(dt){
        if(this.static) return;


        //console.log(this.world.gravity);

        this.acceleration = this.force.clone().mulp(this.invMass);
        if(this.world)
            this.acceleration.add(this.world.gravity);
        this.angularAcceleration = this.invInertia*this.torque;
        this.velocity.add(this.acceleration.clone().mulp(dt));
        this.angularVelocity += dt*this.angularAcceleration;

        this.position.x = this.position.x + this.velocity.x*dt + 1/2 * this.acceleration.x * Math.pow(dt,2);
        this.position.y = this.position.y + this.velocity.y*dt + 1/2 * this.acceleration.y * Math.pow(dt,2);
        this.rotation = this.rotation + this.angularVelocity*dt + 1/2 * this.angularAcceleration * Math.pow(dt,2);
        this.force = Vec.Zero();
        this.angularAcceleration = 0;
        this.torque = 0;
    }
};