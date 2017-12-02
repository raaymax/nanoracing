
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
        this.speed = 0;
        this.steerAngle = 0;
        this.angularAcceleration = 0;
        this.acceleration = 0;
        this.tyreRadius = 0.33;
        this.tyreInertia = 2*4.1;

        let b = sprite.getLocalBounds();
        this.backWheel = this.drawColider(0,70);
        this.frontWheel = this.drawColider(0,-60);
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
        circle.beginFill(0xff0000);
        circle.drawCircle(0, 0, 5);
        circle.endFill();
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


    computeModel(input, dt){
        if(dt === 0){
            this.oldinput = input;
            return;
        }
        let steerAngle = input.steerAngle;
        let deltaSteerAngle = input.steerAngle - this.oldinput.steerAngle;
        let Tef = oldinput.Tef;
        let Ter = oldinput.Ter;
        let L = this.length;
        let omega = this.speed / L * Math.tan(steerAngle);
        let Fcpf, Fcpr;
        let M = this.mass;
        if(steerAngle !== 0){
            let tmp = -M * Math.pow(this.speed,2)* Math.pow(Math.tan(steerAngle),2)/L;
            Fcpf = (
                new Vec(
                    Math.cos(steerAngle)/Math.sin(steerAngle)/2,
                    0.5
                )).mulp(tmp);
            Fcpr = (
                new Vec(
                    Math.cos(steerAngle)/Math.sin(steerAngle)/2,
                    0.5
                )).mulp(tmp)
        }else{
            Fcpf = Vec.Zero();
            Fcpr = Vec.Zero();
        }
        let W = this.width;
        let Ic = M *(Math.pow(W,2) + Math.pow(L,2))/12;
        let Ib = Ic + M * Math.pow(L,2)/4;
        let fr = Ib * Math.tan(steerAngle)/Math.pow(L,2);
        let tmp2 = 2*this.tyreInertia + (M + fr * Math.tan(steerAngle)) * Math.pow(this.Rw,2);
        let Ftot = (M * Math.pow(this.Rw,2)*(Fcpf.y - fr*this.speed/Math.pow(Math.cos(steerAngle),2))*deltaSteerAngle/dt) / tmp2 +
            (M*this.Rw * (Math.cos(steerAngle)*Tef+Ter)) / tmp2;
        let a = Ftot/M;
        let alpha = Math.tan(steerAngle)/L*a+this.speed/L*Math.pow(Math.cos(steerAngle),2)*deltaSteerAngle/dt;

        let Ttotf = a * this.tyreInertia/(this.Rw*Math.cos(steerAngle));
        let Faccf = (Tef - Ttotf)/this.Rw;
        let Ftracfy = Fcpf.y- fr * (Math.tan(steerAngle)*a + this.speed/Math.pow(Math.cos(steerAngle),2)*deltaSteerAngle/dt);
        let Ftracry = Ftot - Ftracfy;
        let Ttotr = Ter - Ffracry*this.Rw;


        let Frotfx = alpha*Ib/this.length;
        let Frotfy = Frotfx*Math.tan(steerAngle);
        let Frotf = new Vec(Frotfx, Frotfy);

        let Frotr = new Vec((Ib-Ic)/Ib*Frotfx,0);
        let Ftracr = (new Vec(0, Ftracry)).add(Fcpr).add(Frotr);
        let Ftracf = Fcpf.add(Frotf).add(new Vec(-Math.sin(steerAngle)*Faccf, Math.cos(steerAngle)*Faccf));
        let Fmax = 9.81*M/2;
        if(Ftracr.len() <= Fmax && Ftracf.len() <= Fmax){
            // update pos and rot and velocity
        }else{
            // sliding model
        }


    }


    update(map){
        //if(this.a) return;
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

        this.addControl(current_speed, max_speed);

        //if((this.speed < 10 && this.acceleration > 0) || (this.speed > -5 && this.acceleration < 0))
        //    this.speed += this.acceleration;

        let pos = this.pos.clone();
        let dir = Vec.Direction(this.direction);
        let dir2 = new Vec(Math.sin(this.direction +this.steerAngle),-Math.cos(this.direction +this.steerAngle))


        let wheelBase = 130*this.sprite.scale.x;
        let frontWheel = pos.clone().add(dir.clone().mulp(wheelBase/2));
        let backWheel = pos.clone().sub(dir.clone().mulp(wheelBase/2));



        //front wheel forces




        backWheel.add(dir.clone().mulp(this.speed));
        frontWheel.add(dir2.clone().mulp(this.speed));
        let carLocation = frontWheel.clone().add(backWheel).mulp(0.5);
        //this.pos.x = carLocation.x;
        //this.pos.y = carLocation.y;
        let ndir = frontWheel.clone().sub(backWheel)
        //this.direction = Math.atan2( ndir.x, -ndir.y);


        /*if(!this.collision(map)) {
            this.addControl(current_speed, max_speed);
            this.addFriction(map);
        }
        */
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
        const steer_factor = 0.50;

        let steer_input = 0.0;
        //console.log(current_speed);
        if(this.ctrl.right){
            steer_input = current_speed<0?-1.0:1.0;
        }else if(this.ctrl.left){
            steer_input = current_speed<0?1.0:-1.0;
        }

        return steer_input*steer_factor//*(Math.abs(current_speed)/max_speed);
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

        return acceleration_input * acceleration_factor;//forward_vector.clone().mulp(acceleration_input).mulp(acceleration_factor);
    }

    addControl(current_speed,max_speed){


        //console.log(current_speed);
        this.steerAngle = this.steer(current_speed, max_speed);
        this.acceleration = this.accelerate(current_speed, max_speed);
        //let steer_delta = this.steer(current_speed, max_speed);
        //let acceleration_vector = this.accelerate(current_speed, max_speed);

        //this.steerAngle = steer_delta;
        //this.direction += steer_delta;
        /*
        if(this.ctrl.break){
            acceleration_vector.mulp(0);
        }

        if (Math.abs(current_speed) < max_speed) {
            this.velocity.add(acceleration_vector);
        }
        */
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

    applyForce(f, point = Vec.Zero()){
        R = this.pos.clone().sub(point);
        let nega = point.clone().neg();
        let v = Vec.Dot(b, point)/Vec.Dot(nega,nega);
        Ft = point.clone().mulp(v);
        T = Vec.Dot(point, f);
        I = this.mass * (Math.pow(this.width,2)+Math.pow(this.length,2)) /12 + this.mass * this.point.len()
        this.acceleration += Ft/this.mass;
        this.angularAcceleration += T/I;
    }

    updatePosition(){
        this.velocity += this.acceleration;
        this.direction += this.angularAcceleration;
        this.pos.add(this.velocity);
        this.sprite.x = Math.round(this.pos.x);
        this.sprite.y = Math.round(this.pos.y);
        this.sprite.rotation = this.direction;
    }
};

