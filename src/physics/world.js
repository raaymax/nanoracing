

module.exports = class World {
    constructor(){
        this.bodies = [];
        this.timeScale = 1/20;
    }
    setGravity(g){
        this.gravity = g;
    }

    addBody(body){
        this.bodies.push(body);
        body.setWorld(this);
    }

    update(dt){
        this.bodies.forEach(b=>b.update(dt*this.timeScale));
    }

    generateContacts(bodies){

    }
};
