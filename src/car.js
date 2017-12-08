
const PIXI = require('pixi.js');
const Vec = require('./vec');
const Collisions = require('./collisions');
const Sprite = PIXI.Sprite;
const Graphics = PIXI.Graphics;


const DRAG = 5.0;		 		/* factor for air resistance (drag) 	*/
const RESISTANCE = 30.0;			/* factor for rolling resistance */
const CA_R = -5.20;			/* cornering stiffness */
const CA_F = -5.0;			/* cornering stiffness */
const MAX_GRIP = 2.0;				/* maximum (normalised) friction force, =diameter of friction circle */



module.exports = class Car{
    constructor(controller, sprite,x,y,d=0){
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.position.x = x;
        sprite.position.y = y;
        this.sprite = sprite;
        this.ctrl = controller;

        this.pos = new Vec(x,y);
        this.velocity = new Vec();
        this.acceleration = Vec.Zero();
        this.speed = 0;

        this.angularAcceleration = 0;
        this.angularVelocity = 0;
        this.direction = d;
        this.steerAngle = 0;

        this.tyreRadius = 0.33;
        this.tyreInertia = 2*4.1;
        this.length = 4;
        this.width =2;
        this.mass = 1500;
        this.wheelBase = 3;

        this.cartype = {
            b: 1.0,
            c: 1.0,
            wheelbase: 2,
            h: 1.0,
            mass: 1500,
            inertia: 1500,
            width: 1.5,
            length: 3.0,
            wheellength: 0.7,
            wheelwidth: 0.3
        };

        this.oldinput = {
            Ter: 0,
            Tef: 0,
            steerAngle: 0
        };
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
        let frontTyre = this.frontWheel.position;
        let steerAngle = input.steerAngle;
        let deltaSteerAngle = input.steerAngle - this.oldinput.steerAngle;
        let Tef = this.oldinput.Tef;
        let Ter = this.oldinput.Ter;
        let Rw = this.tyreRadius;
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
        let tmp2 = 2*this.tyreInertia + (M + fr * Math.tan(steerAngle)) * Math.pow(Rw,2);
        let Ftot = (M * Math.pow(Rw,2)*(Fcpf.y - fr*this.speed/Math.pow(Math.cos(steerAngle),2))*deltaSteerAngle/dt) / tmp2 +
            (M*Rw * (Math.cos(steerAngle)*Tef+Ter)) / tmp2;
        let a = Ftot/M;
        let alpha = Math.tan(steerAngle)/L*a+this.speed/L*Math.pow(Math.cos(steerAngle),2)*deltaSteerAngle/dt;

        let Ttotf = a * this.tyreInertia/(Rw*Math.cos(steerAngle));
        let Faccf = (Tef - Ttotf)/Rw;
        let Ftracfy = Fcpf.y- fr * (Math.tan(steerAngle)*a + this.speed/Math.pow(Math.cos(steerAngle),2)*deltaSteerAngle/dt);
        let Ftracry = Ftot - Ftracfy;


        let Frotfx = alpha*Ib/this.length;
        let Frotfy = Frotfx*Math.tan(steerAngle);
        let Frotf = new Vec(Frotfx, Frotfy);

        let Frotr = new Vec((Ib-Ic)/Ib*Frotfx,0);
        let Ftracr = (new Vec(0, Ftracry)).add(Fcpr).add(Frotr);
        let Ftracf = Fcpf.add(Frotf).add(new Vec(-Math.sin(steerAngle)*Faccf, Math.cos(steerAngle)*Faccf));
        let Fmax = 9.81*M/2;
        //console.log(this.speed,a);
        //console.log(Ftracr.len(), Ftracf.len(), Fmax);
        if(Ftracr.len() <= Fmax && Ftracf.len() <= Fmax){
            let ds = this.speed*dt + a*Math.pow(dt,2)/2;
            let d0 = omega *dt+ alpha*Math.pow(dt,2)/2;

            this.pos.add(Vec.Direction(this.direction).mulp(ds).mulp(30));
            this.direction += d0;
            if(this.direction > Math.PI)
                this.direction = -Math.PI;
            if(this.direction < -Math.PI)
                this.direction = Math.PI;
            //Advance the car by ds = v dt + a dt2/2
            //Rotate the car by dθ = ω dt + α dt2/2
            this.speed += a* dt;
        }else{
            // sliding model
        }

        this.oldinput = input;
    }


    phisicsModel(input, delta_t){
        let sn = Math.sin(this.direction);
        let cs = Math.cos(this.direction);

        // SAE convention: x is to the front of the car, y is to the right, z is down

        let velocity = Vec.Zero();
        // transform velocity in world reference frame to velocity in car reference frame
        velocity.X = cs * this.velocity.y + sn * this.velocity.x;
        velocity.Y = -sn * this.velocity.y + cs * this.velocity.x;

        // Lateral force on wheels
        //
        // Resulting velocity of the wheels as result of the yaw rate of the car body
        // v = yawrate * r where r is distance of wheel to CG (approx. half wheel base)
        // yawrate (ang.velocity) must be in rad/s
        //
        let yawspeed = this.cartype.wheelBase * 0.5 * this.angularVelocity;
        let rot_angle,sideslip;

        if (velocity.y === 0)		// TODO: fix singularity
            rot_angle = 0;
        else
            rot_angle = Math.Atan2(yawspeed, velocity.X);

        // Calculate the side slip angle of the car (a.k.a. beta)
        if (velocity.x === 0)		// TODO: fix singularity
            sideslip = 0;
        else
            sideslip = Math.Atan2(velocity.Y, velocity.X);

        // Calculate slip angles for front and rear wheels (a.k.a. alpha)
        let slipanglefront = sideslip + rot_angle - input.steerAngle;
        let slipanglerear = sideslip - rot_angle;

        // weight per axle = half car mass times 1G (=9.8m/s^2)
        let weight = this.cartype.mass * 9.8 * 0.5;

        // lateral force on front wheels = (Ca * slip angle) capped to friction circle * load
        let flatf = Vec.Zero()
        flatf.x = 0;
        flatf.y = CA_F * slipanglefront;
        flatf.y = Math.min(MAX_GRIP, flatf.y);
        flatf.y = Math.max(-MAX_GRIP, flatf.y);
        flatf.y *= weight;
        if (input.front_slip === 1)
            flatf.y *= 0.5;

        // lateral force on rear wheels
        let flatr = Vec.Zero();
        flatr.x = 0;
        flatr.y = CA_R * slipanglerear;
        flatr.y = Math.min(MAX_GRIP, flatr.y);
        flatr.y = Math.max(-MAX_GRIP, flatr.y);
        flatr.y *= weight;
        if (input.rear_slip === 1)
            flatr.y *= 0.5;

        // longtitudinal force on rear wheels - very simple traction model
        let ftraction = Vec.Zero();
        ftraction.x = 100 * (input.throttle - input.brake * (((velocity.x) >= 0) ? 1 : -1));
        ftraction.y = 0;
        if (input.rear_slip === 1)
            ftraction.x *= 0.5;

        // Forces and torque on body

        // drag and rolling resistance
        let resistance = Vec.Zero();
        resistance.x = -(RESISTANCE * velocity.x + DRAG * velocity.x * Math.abs(velocity.x));
        resistance.y = -(RESISTANCE * velocity.y + DRAG * velocity.y * Math.abs(velocity.y));

        // sum forces
        let force = Vec.Zero();
        force.x = (ftraction.x + Math.sin(input.steerAngle) * flatf.x + flatr.x + resistance.x);
        force.y = (ftraction.y + Math.cos(input.steerAngle) * flatf.y + flatr.y + resistance.y);

        // torque on body from lateral forces
        let torque = this.cartype.b * flatf.y - this.cartype.c * flatr.y;

        // Acceleration

        // Newton F = m.a, therefore a = F/m
        let acceleration = Vec.Zero();
        acceleration.x = force.x / this.cartype.mass;
        acceleration.y = force.y / this.cartype.mass;

        let angular_acceleration = torque / this.cartype.inertia;

        // Velocity and position

        // transform acceleration from car reference frame to world reference frame
        let acceleration_wc = Vec.Zero();
        acceleration_wc.x = (cs * acceleration.y + sn * acceleration.x);
        acceleration_wc.y = (-sn * acceleration.y + cs * acceleration.x);

        // velocity is integrated acceleration
        //
        this.velocity.x += delta_t * acceleration_wc.x;
        this.velocity.y += delta_t * acceleration_wc.y;

        // position is integrated velocity
        //
        this.pos.x += delta_t * this.velocity.x;
        this.pos.y += delta_t * this.velocity.y;


        // Angular velocity and heading

        // integrate angular acceleration to get angular velocity
        //

        this.angularVelocity += (delta_t * angular_acceleration);

        // integrate angular velocity to get angular orientation
        //
        this.direction += delta_t * this.angularVelocity;
        //console.log(this.direction);
    }

    update(map){
        //if(this.a) return;
        this.checkPointCheck(map);
        const max_speed = 30.0;
        let forward_vector = Vec.Direction(this.direction);
        let backward_vector = forward_vector.clone().neg();
        let current_speed = Vec.Dot(this.velocity, forward_vector)/Vec.Dot(backward_vector, backward_vector);

        let now = Date.now();
        let dt = now - this.lastframe;
        dt /= 1000;
        let base = {
            br: this.sprite.parent.toLocal({x:0,y:0}, this.br),
            fr: this.sprite.parent.toLocal({x:0,y:0}, this.fr),
            bl: this.sprite.parent.toLocal({x:0,y:0}, this.bl),
            fl: this.sprite.parent.toLocal({x:0,y:0}, this.fl)
        };
        let basePos = this.pos.clone();
        this.timeSinceLastFrame = now - this.lastframe;

        this.addControl(current_speed, max_speed);


        /*this.phisicsModel({
            steerAngle: this.steer(),
            throttle: this.accelerate(),
            brake: 0,
            front_slip: 0,
            rear_slip:0
        },dt);
        */
        /*
        this.computeModel({
            Ter: this.accelerate(),
            Tef: 0,
            steerAngle: this.steer()
        }, dt);
        */

        let i = this.accelerate();

        this.applyForce(new Vec(10000,0), new Vec(100,100));

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
        this.updatePosition(dt);
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
        const steer_factor = 0.10;

        let steer_input = 0.0;
        //console.log(current_speed);
        if(this.ctrl.right){
            steer_input = 1.0
        }else if(this.ctrl.left){
            steer_input = -1.0
        }

        return steer_input*steer_factor//*(Math.abs(current_speed)/max_speed);
    }

    accelerate(current_speed, max_speed){
        const acceleration_factor = 50;
        let forward_vector = Vec.Direction(this.direction);
        let acceleration_input = 0.0;

        if(this.ctrl.forward){
            acceleration_input = -1.0;
        }else if(this.ctrl.backward){
            acceleration_input = 1.0;
        }

        return acceleration_input * acceleration_factor;//forward_vector.clone().mulp(acceleration_input).mulp(acceleration_factor);
    }

    addControl(current_speed,max_speed){


        //console.log(current_speed);
        //this.steerAngle = this.steer(current_speed, max_speed);
        //this.acceleration = this.accelerate(current_speed, max_speed);
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
        //let R = this.pos.clone().sub(point);
        let v = 0;
        let Ft,Fr,T,I;
        if(point.isZero()){
            Ft = f;
        } else {
            let nega = point.clone().neg();
            v = Vec.Dot(f, point) / Vec.Dot(nega, nega);
            Ft = point.clone().mulp(v);
            Fr = f.clone().sub(Ft);
            T = Fr.len()*point.len();
            I = this.cartype.mass * (Math.pow(this.cartype.width,2)+Math.pow(this.cartype.length,2)) /12 + this.cartype.mass * point.len();
            //console.log(T, I);
            this.angularAcceleration += T/I;
            //console.log(this.angularAcceleration)
        }
        this.acceleration.add(Ft.divp(this.cartype.mass));

    }

    updatePosition(dt){
        //console.log(this.pos);
        this.velocity.add(this.acceleration.clone().mulp(dt));
        this.angularVelocity += this.angularAcceleration * dt;
        //this.velocity.divp(this.velocity.len()).mulp(this.speed);

        //this.velocity = Vec.Direction(this.direction).mulp(this.speed);
        //this.velocity + this.acceleration;
        //this.direction += this.angularAcceleration * dt;
        this.pos.add(this.velocity.clone().mulp(dt));
        this.direction += this.angularVelocity * dt;

        /*
        console.log('dt',dt);
        console.log('pos',this.pos);
        console.log('v',this.velocity);
        console.log('av', this.angularVelocity);
        */
        this.sprite.x = Math.round(this.pos.x);
        this.sprite.y = Math.round(this.pos.y);
        this.sprite.rotation = this.direction ;
        this.acceleration.mulp(0);
        this.angularAcceleration = 0;
    }
};

