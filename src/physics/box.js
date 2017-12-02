
const Element = require('./element');
const Rect = require('./rect');

module.exports = class Box extends Element {
    constructor(width, height){
        super();
        this.collider = new Rect(-width/2, -height/2, width, height);
    }
}