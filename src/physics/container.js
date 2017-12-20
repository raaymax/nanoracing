const Transform = require('./transform');

module.exports = class Container{
    constructor(){
        this._isContainer = true;
        this.transform = new Transform();
        this.bodies = [];
    }

    addBody(body){
        body.parent = this;
        this.bodies.push(body);
    }

    update(dt){
        this.bodies.forEach(b=>b.update(dt));
    }
};