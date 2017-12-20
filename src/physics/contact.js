


module.exports = class Contact {
    constructor(pos, normal, penetration, restitution, friction, bodyA, bodyB){
        this.pos = pos;
        this.normal = normal;
        this.penetration = penetration;
        this.restitution = restitution;
        this.friction = friction;
        this.body = [bodyA, bodyB];
    }
};