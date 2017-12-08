
const Matter = require('matter-js');
const Controller = require('./controller');
const Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composites = Matter.Composites,
    Composite = Matter.Composite,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Vector = Matter.Vector,
    Events = Matter.Events;

const ctrl = new Controller({
    forward: 38,
    backward: 40,
    left: 37,
    right: 39,
    break: 16
});

// create engine
var engine = Engine.create({
        positionIterations: 6,
        velocityIterations: 4
    }),
    world = engine.world;

// create renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        showDebug: true,
        showVelocity: true,
        width: 800,
        height: 600,
        showAngleIndicator: true
    }
});

Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);


let car = Body.create();
let body = Bodies.rectangle(400, 400, 100, 50, {isStatic: false});
let wheel = Bodies.rectangle(400, 400, 10, 20, {isStatic: false});

let frontWheel = Bodies.rectangle(400, 370,10, 20, {isStatic: false});
let backWheel = Bodies.rectangle(400, 430, 10, 20, {isStatic: false});

let leftFrontWheel = Bodies.rectangle(375, 370,10, 20, {isStatic: false});
let leftBackWheel = Bodies.rectangle(375, 430, 10, 20, {isStatic: false});
let rightFrontWheel = Bodies.rectangle(425, 370, 10, 20, {isStatic: false});
let rightBackWheel = Bodies.rectangle(425, 430, 10, 20, {isStatic: false});

Body.rotate(body,Math.PI/2);
Body.setMass(body,1500);
//Body.setInertia(body,1500);

Body.setParts(car,[
    car,
    body,
    //wheel
    backWheel,
    frontWheel,
    //leftBackWheel,
    //leftFrontWheel,
    //rightBackWheel,
    //rightFrontWheel
]);
let i = 0;


function castOnAxis(v, axis){
    let nega = Vector.neg(Vector.clone(axis));
    return Vector.dot(axis, v) / Vector.dot(nega, nega);
}

class Wheel{
    constructor(wheel, steer, power){
        this.wheel = wheel;
        this.steer = steer;
        this.power = power;
        this.lastPos = Vector.clone(wheel.position);
        this.debug = false;
    }
    update(dt){
        this.processWheel(dt);
        if(this.steer){
            this.steerWheel(dt);
        }
        if(this.power){
            this.powerWheel(dt);
        }
    }

    toLocalAxis(axis){
        let angle = this.wheel.parent.angle+this.wheel.angle;
        return Vector.rotate(axis, angle);
    }

    rightAxis(){
        let right = Vector.create(1,0);
        return this.toLocalAxis(right);
    }

    forwardAxis(){
        let forward = Vector.create(0,-1);
        return this.toLocalAxis(forward);
    }

    processWheel(dt){
        let wheel = this.wheel;
        let lastPos = this.lastPos;
        let M  = car.mass/4;

        let ds = Vector.create(wheel.position.x-lastPos.x,wheel.position.y-lastPos.y);
        let V = Vector.div(ds,dt);

        let right = this.rightAxis();
        //if(i%100===0)  console.log(right);
        let Vs = castOnAxis(V, right);

        let Ft = Vs*M/dt * -0.9;
        const MAX_FRICTION = 10;
        Ft = Math.min(Ft, MAX_FRICTION);





        let Force = this.toLocalAxis(Vector.create(Ft,0));
        if(i%100===0) console.log(Force);
        //console.log(Force, M,Vs, dt);
        //console.log(F);
        Body.applyForce(wheel.parent, wheel.position, Force);
        lastPos.x = wheel.position.x;
        lastPos.y = wheel.position.y;

    }

    powerWheel(dt){
        let wheel = this.wheel;
        let forward = Vector.create(0,-20);
        let angle = wheel.parent.angle+wheel.angle;
        forward = Vector.rotate(forward, angle);
        Vector.mult(forward, 10);

        //console.log(dt, wheel.parent.velocity, Vector.div(Vector.mult(forward,dt),wheel.parent.mass));
        if(ctrl.forward){
            Body.applyForce(wheel.parent, wheel.position, forward);
        }

        if(ctrl.backward){
            Body.applyForce(wheel.parent, wheel.position, Vector.neg(forward));
        }
    }

    steerWheel(dt){
        let wheel = this.wheel;
        if(ctrl.right){
            Body.setAngle(wheel, Math.PI/4);
        }else if(ctrl.left){
            Body.setAngle(wheel, -Math.PI/4);
        }else{
            Body.setAngle(wheel,0);
        }
    }
}

let last = Date.now();
let flWheel = new Wheel(leftFrontWheel, true, false);
let frWheel = new Wheel(rightFrontWheel, true, false);
let blWheel = new Wheel(leftBackWheel, false, true);
let brWheel = new Wheel(rightBackWheel, false, true);


let fWheel = new Wheel(frontWheel, true, false);
let bWheel = new Wheel(backWheel, false, true);
Events.on(runner, 'tick', function(event) {
    i++;
    let dt = event.source.delta;
    last = Date.now();

    fWheel.update(dt);
    bWheel.update(dt);

    //flWheel.update(dt);
    //frWheel.update(dt);
    //blWheel.update(dt);
    //brWheel.update(dt);
    //steerWheel(wheel, dt);
    //processWheel(wheel, dt);
    //powerWheel(wheel,dt);
    /*
    steerWheel(leftFrontWheel, dt);
    steerWheel(rightFrontWheel, dt);
    processWheel(leftFrontWheel,dt);
    processWheel(rightFrontWheel,dt);
    processWheel(leftBackWheel,dt);
    processWheel(rightBackWheel,dt);
    powerWheel(leftBackWheel,dt);
    powerWheel(rightBackWheel,dt);
    */
    //console.log(car);
});


engine.world.gravity.x = 0;
engine.world.gravity.y = 0;
World.add(world, [
    car,
    Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
    Bodies.rectangle(400, 600, 800, 50, { isStatic: true }),
    Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
    Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
]);

Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 800, y: 600 }
});




Body.update = function(body, deltaTime, timeScale, correction) {
    var deltaTimeSquared = Math.pow(deltaTime * timeScale * body.timeScale, 2);

    // from the previous step
    var frictionAir = 1 - body.frictionAir * timeScale * body.timeScale,
        velocityPrevX = body.position.x - body.positionPrev.x,
        velocityPrevY = body.position.y - body.positionPrev.y;

    // update velocity with Verlet integration
    body.velocity.x = (velocityPrevX * frictionAir * correction) + (body.force.x / body.mass) * deltaTimeSquared;
    body.velocity.y = (velocityPrevY * frictionAir * correction) + (body.force.y / body.mass) * deltaTimeSquared;

    body.positionPrev.x = body.position.x;
    body.positionPrev.y = body.position.y;
    body.position.x += body.velocity.x;
    body.position.y += body.velocity.y;

    // update angular velocity with Verlet integration
    body.angularVelocity = ((body.angle - body.anglePrev) * frictionAir * correction) + (body.torque / body.inertia) * deltaTimeSquared;
    body.anglePrev = body.angle;