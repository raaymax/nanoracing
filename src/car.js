
const PIXI = require('pixi.js');
const Vec = require('./vec');
const Collisions = require('./collisions');
const Sprite = PIXI.Sprite;
const Graphics = PIXI.Graphics;
const Model = require('./carModel');
const Ferrari = require('./cars/ferrari');


module.exports = class Car{
    constructor(controller, sprite,x,y,d=0){
        this.model = new Model(controller,Ferrari);
        this.model.setMass(Ferrari.mass);
        this.model.setPosition(Vec.New(x/80,y/80));
        this.model.setRotation(d);

        this.sprite = sprite;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.position.x = x;
        sprite.position.y = y;

        this.ctrl = controller;
        this.pos = new Vec(x/80,y/80);
        this.direction = d;
        this.lastframe = Date.now();
        this.nextCheckpoint = 0;
        this.loop = 0;
    }

    drawColider(x,y){
        let circle = new Graphics();
        circle.beginFill(0xff0000);
        circle.drawCircle(0, 0, 5);
        circle.endFill();
        circle.x = x;
        circle.y = y;
        this.sprite.addChild(circle);
        return circle;
    }

    checkPointCheck(map){
        if(Collisions.checkCollision(this.sprite, map.checkpoints[this.nextCheckpoint%map.checkpoints.length])){
            if(this.nextCheckpoint%map.checkpoints.length === map.checkpoints.length-1){
                this.loop++;
            }
            this.nextCheckpoint++;
        }

    }

    update(map){
        this.checkPointCheck(map);
        let now = Date.now();
        let dt = now - this.lastframe;
        dt /= 1000;
        this.model.update(dt);
        this.updatePosition();
        this.lastframe = now;
    }



    updatePosition(){
        this.pos = this.model.position;
        this.direction = this.model.rotation;
        this.sprite.x = Math.round(this.pos.x*80);
        this.sprite.y = Math.round(this.pos.y*80);
        this.sprite.rotation = this.direction ;
    }
};

