
const PIXI = require('pixi.js');
const Vec = require('./vec');
const Sprite = PIXI.Sprite;


module.exports = class Car{
    constructor(controller, sprite,x,y,d=0){
        this.velocity = new Vec();
        this.pos = new Vec(x,y);
        this.direction = d;
        this.sprite = sprite;
        this.ctrl = controller;
        sprite.position.x = x;
        sprite.position.y = y;
    }

    update(map){
        let s = this.velocity.len();
        if(this.ctrl.left){
            this.direction -= s*0.008;
        }
        if(this.ctrl.right){
            this.direction += s*0.008;
        }
        if(this.ctrl.forward){
            this.velocity.add(Vec.Direction(this.direction).mulp(0.1))
        }
        if(this.ctrl.backward){
            this.velocity.sub(Vec.Direction(this.direction).mulp(0.1))
        }




        //this.velocity.divp(this.velocity.len()).mulp(s);


        /*
            if(b.hitTestCircleRectangle(circle, car) && checkCollisionCircleToRect(circle, car)){
                let a = new Vec(circle.x, circle.y);
                let b = new Vec(car.x, car.y);
                //velocity.len();
                let v = b.sub(a);
                velocity = v.divp(v.len()).mulp(velocity.len()/2);
                console.log('col');
            }

            b.contain(car, {x: 10, y: 10, width: 1800, height: 900}, true, ()=>{
                //direction+=Math.PI;
                //velocity.mulp(-1);
            });
        */

        this.pos.add(this.velocity.mulp(0.99));

        this.sprite.x = Math.round(this.pos.x);
        this.sprite.y = Math.round(this.pos.y);

            //car.position.y = car.position.y + velocity.y;
        //}
        this.sprite.rotation = this.direction;
    }
};