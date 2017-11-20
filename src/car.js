
const PIXI = require('pixi.js');
const Vec = require('./vec');
const Collisions = require('./collisions');
const Sprite = PIXI.Sprite;
const Graphics = PIXI.Graphics;

module.exports = class Car{
    constructor(controller, sprite,x,y,d=0){
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        this.velocity = new Vec();
        this.pos = new Vec(x,y);
        this.direction = d;
        this.sprite = sprite;
        this.ctrl = controller;
        sprite.position.x = x;
        sprite.position.y = y;


        let b = sprite.getLocalBounds();
        this.br = this.drawColider(b.width/2-30,b.height/2-50);
        this.fr = this.drawColider(b.width/2-30,-b.height/2+60);
        this.bl = this.drawColider(-b.width/2+30,b.height/2-50);
        this.fl = this.drawColider(-b.width/2+30,-b.height/2+60);
        this.cc = this.drawColider(0,0);
        this.lastframe = Date.now();
        this.timeSinceLastFrame = Date.now();
        this.nextCheckpoint = 0;
        this.loop = 0;
    }

    percept(map,p){
        let pos = this[p].toGlobal({x:0,y:0});
        return map.getPixel(pos.x, pos.y)[0] > 80;
    }

    drawColider(x,y){
        let circle = new Graphics();
        //circle.beginFill(0xff0000);
        //circle.drawCircle(0, 0, 10);
        //circle.endFill();
        circle.x = x;
        circle.y = y;
        this.sprite.addChild(circle);
        return circle;
    }

    checkPointCheck(map){
        //map.checkpoints[this.nextCheckpoint%map.checkpoints.length].alpha = 1;
        if(Collisions.checkCollision(this.sprite, map.checkpoints[this.nextCheckpoint%map.checkpoints.length])){
            if(this.nextCheckpoint%map.checkpoints.length === map.checkpoints.length-1){
                this.loop++;
            }
            //map.checkpoints[this.nextCheckpoint%map.checkpoints.length].alpha = 0;
            console.log(this.nextCheckpoint);
            this.nextCheckpoint++;
        }

    }


    update(map){
        this.checkPointCheck(map);
        const max_speed = 30.0;
        let forward_vector = Vec.Direction(this.direction);
        let backward_vector = forward_vector.clone().neg();
        let current_speed = Vec.Dot(this.velocity, forward_vector)/Vec.Dot(backward_vector, backward_vector);

        let now = Date.now();
        let base = {
            br: this.sprite.parent.toLocal({x:0,y:0}, this.br),
            fr: this.sprite.parent.toLocal({x:0,y:0}, this.fr),
            bl: this.sprite.parent.toLocal({x:0,y:0}, this.bl),
            fl: this.sprite.parent.toLocal({x:0,y:0}, this.fl)
        };
        let basePos = this.pos.clone();
        this.timeSinceLastFrame = now - this.lastframe;
        if(!this.collision(map)) {
            this.addControl(current_speed, max_speed);
            this.addFriction(map);
        }
        this.updatePosition();

        let after = {
            br: this.sprite.parent.toLocal({x:0,y:0}, this.br),
            fr: this.sprite.parent.toLocal({x:0,y:0}, this.fr),
            bl: this.sprite.parent.toLocal({x:0,y:0}, this.bl),
            fl: this.sprite.parent.toLocal({x:0,y:0}, this.fl)
        };

        if(this.velocity.len() - Math.abs(current_speed) > 0.5){
            map.drawLine(base.br, after.br);
            map.drawLine(base.fr, after.fr);
            map.drawLine(base.bl, after.bl);
            map.drawLine(base.fl, after.fl);
        }
        this.lastframe = now;
    }


    steer(current_speed, max_speed){
        const steer_factor = 0.30;

        let steer_input = 0.0;
        //console.log(current_speed);
        if(this.ctrl.right){
            steer_input = current_speed<0?-1.0:1.0;
        }else if(this.ctrl.left){
            steer_input = current_speed<0?1.0:-1.0;
        }

        return steer_input*steer_factor*(Math.abs(current_speed)/max_speed);
    }

    accelerate(current_speed, max_speed){
        const acceleration_factor = 0.2;
        let forward_vector = Vec.Direction(this.direction);
        let acceleration_input = 0.0;

        if(this.ctrl.forward){
            acceleration_input = 1.0;
        }else if(this.ctrl.backward){
            acceleration_input = -1.0;
        }

        return forward_vector.clone().mulp(acceleration_input).mulp(acceleration_factor);
    }

    addControl(current_speed,max_speed){
        //console.log(current_speed);
        let steer_delta = this.steer(current_speed, max_speed);
        let acceleration_vector = this.accelerate(current_speed, max_speed);

        this.direction += steer_delta;

        if(this.ctrl.break){
            acceleration_vector.mulp(0);
        }

        if (Math.abs(current_speed) < max_speed) {
            this.velocity.add(acceleration_vector);
        }
    }

    addFriction(map){
        let forward_vector = Vec.Direction(this.direction);
        let lateral_friction_factor = 0.05;
        let backwards_friction_factor = 0.01;
        let right_vector = forward_vector.rotate(Math.PI/2);
        if(this.percept(map, 'sprite')){
         //   lateral_friction_factor*=10;
          //  backwards_friction_factor*=10;
        }
        if(this.ctrl.break){
            backwards_friction_factor*=3;
        }

        let backwards_friction = this.velocity.clone().neg().mulp(backwards_friction_factor);
        let lateral_velocity = right_vector.clone().mulp(Vec.Dot(this.velocity, right_vector));
        let lateral_friction = lateral_velocity.neg().mulp(lateral_friction_factor);

        this.velocity.add(backwards_friction).add(lateral_friction);
    }

    collision(map){
        let speed = this.velocity.len();
        let col = Collisions.checkCollisions(this.sprite, map);

        if(col){
            this.velocity = col.mulp(Math.max(1.0,speed)/2);
            console.log('asd');
            //this.cc.beginFill(0x00ff00);
            //this.cc.drawCircle(0, 0, 10);
            //this.cc.endFill();
            return true;
        }else{
            //this.cc.beginFill(0xff0000);
            //this.cc.drawCircle(0, 0, 10);
            //this.cc.endFill();
            return false;
        }
    }

    updatePosition(){
        this.pos.add(this.velocity);
        this.sprite.x = Math.round(this.pos.x);
        this.sprite.y = Math.round(this.pos.y);
        this.sprite.rotation = this.direction;
    }
};

