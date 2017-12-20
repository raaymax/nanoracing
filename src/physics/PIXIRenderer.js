const PIXI = require('pixi.js');
const Container = PIXI.Container;
const TextureCache = PIXI.utils.TextureCache;
const Texture = PIXI.Texture;
const Sprite = PIXI.Sprite;
const Graphics = PIXI.Graphics;
const World = require('./world');
const Body = require('./body');
const Vec = require('../vec');

module.exports = class GameScene extends Container{
    constructor(){
        super();
        this.prev = Date.now();
        let world = this.world = new World();
        world.setGravity(Vec.New(0,9.8));


        this.posScale = 100;

        let a = new Body();
        a.width = 300;
        a.height = 300;
        a.position = Vec.New(300,800).mulp(this.posScale);
        a.static = true;
        this.world.addBody(a);

        let b = new Body();
        b.width = 100;
        b.height = 100;
        b.position = Vec.New(200,200).mulp(this.posScale);
        this.world.addBody(b);
        this.createBackground();
    }

    createBackground(){
        let shape = new Graphics();
        shape.beginFill(0xffffff);
        shape.drawRect(0,0,1000,1000);
        shape.endFill();
        shape.position.x = 50;
        shape.position.y = 50;
        this.addChild(shape);
    }

    drawBody(body){
        let shape;
        if(body._pixi){
            shape = body._pixi;
        }else {
            shape = new Graphics();
            shape.beginFill(0x9966FF);
            shape.drawRect(-body.width/2, -body.height/2, body.width/2, body.height/2);
            shape.endFill();
            body._pixi = shape;
            shape.width = body.width;
            shape.height = body.height;
            this.addChild(shape);
        }
        shape.position.x = body.position.x/this.posScale;
        shape.position.y = body.position.y/this.posScale;
        shape.rotation = body.rotation;
        shape.scale.x = body.scale;
        shape.scale.y = body.scale;
        //console.log(shape);
    }

    update(){
        let now = Date.now();
        let dt = now - this.prev;
        this.world.update(dt);
        this.world.bodies.forEach(body=>this.drawBody(body));
        this.prev = now;
    }
};