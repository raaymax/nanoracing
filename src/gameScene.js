const PIXI = require('pixi.js');
const Car = require('./car.js');
const Controller = require('./controller.js');
const Camera = require('./camera');
const Container = PIXI.Container;
const TextureCache = PIXI.utils.TextureCache;
const Texture = PIXI.Texture;
const Sprite = PIXI.Sprite;
const Graphics = PIXI.Graphics;

const ctrl = new Controller({
    forward: 38,
    backward: 40,
    left: 37,
    right: 39,
    break: 16
});

const ctrl2 = new Controller({
    forward: 87,
    backward: 83,
    left: 65,
    right: 68,
    break: 16
});



module.exports = class GameScene extends Container{
    constructor(map){
        super();

        var drawable;
        let circle;
        let car, car2;

        this.winner = null;
        this.map = map;

        map.init(this);
        var canvasTexture = PIXI.Texture.fromCanvas(map.drawableCanvas);
        drawable = new PIXI.Sprite(canvasTexture);
        this.addChild(drawable);

        circle = new Graphics();
        circle.beginFill(0x9966FF);
        circle.drawCircle(0, 0, 16);
        circle.endFill();
        circle.x = 600;
        circle.y = 290;
        circle.colliderType = 'radius';
        circle.radius = 16;
        map.obstacles.push(circle);
        this.addChild(circle);
        

        this.createBoxObstacle(400,400);
        this.createBoxObstacle(600,200,0.6);
        /*this.createCheckoint(300,0,20,300,0);
        this.createCheckoint(590,170,20,300,0);
        this.createCheckoint(860,0,20,300,0);

        this.createCheckoint(860,350,20,400,-Math.PI/2);

        this.createCheckoint(860,400,20,300,0);
        this.createCheckoint(300,400,20,300,0);

        this.createCheckoint(300,340,20,300,Math.PI/2);
*/
        let sprite = new Sprite(TextureCache["assets/car.png"]);
        sprite.scale.x = 0.5;
        sprite.scale.y = 0.5;
        car = new Car(ctrl, sprite, 250,1100,0);
        this.addChild(sprite);


        let sprite2 = new Sprite(TextureCache["assets/car2.png"]);
        sprite2.scale.x = 0.5;
        sprite2.scale.y = 0.5;
        car2 = new Car(ctrl2, sprite2, 120,1100,0);
        this.addChild(sprite2);

        this.car = car;
        this.car2 = car2;
        this.drawable = drawable;

        this.camera = new Camera(this, car, car2)


    }

    update(){
        if(!this.winner && this.car.loop >= 3){
            this.winner = 1;
        }
        if(!this.winner && this.car2.loop >= 3){
            this.winner = 2;
        }
        this.drawable.texture.update();
        this.car.update(this.map);
        this.car2.update(this.map);
        this.camera.update();
    }

    createCheckoint(x,y,width, height,rotation){
        let box = new Graphics();
        box.beginFill(0x9966FF);
        box.drawRect(0, 0, width, height);
        box.endFill();
        box.x=x;
        box.y=y;
        box.alpha = 0;
        box.rotation = rotation;
        box.colliderType = 'rect';
        this.map.pushCheckpoint(box);
        this.addChild(box);
    }

    createBoxObstacle(x,y,s=1){
        let box = new Sprite(TextureCache["assets/crate.png"])
        box.x=x;
        box.y=y;
        box.anchor.x = 0.5;
        box.anchor.y = 0.5;
        box.scale.x = s;
        box.scale.y = s;
        box.colliderType = 'rect';
        this.map.obstacles.push(box);
        this.addChild(box);
    }
}