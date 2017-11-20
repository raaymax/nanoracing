const PIXI = require('pixi.js');
const Car = require('./car.js');
const Controller = require('./controller.js');

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






        //floor.beginFill(0xaaaaaa);
        //floor.drawRect(10, 10, 1000, 600);
        //floor.endFill();
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
        let w = window.innerWidth;
        let h = window.innerHeight;
        let sw = window.innerWidth/this.scale.x;
        let sh = window.innerHeight/this.scale.y;
        let mw = this.map.width;
        let mh = this.map.height;

        let ratio = w/h;


        let rect = {
            x: Math.min(this.car.sprite.x,this.car2.sprite.x)-300,
            y: Math.min(this.car.sprite.y,this.car2.sprite.y)-300,
            x2:Math.max(this.car.sprite.x,this.car2.sprite.x)+300,
            y2:Math.max(this.car.sprite.y,this.car2.sprite.y)+300
        };


        //rect.x = rect.x+(sw>rect.w)?sw-rect.w:0;
        //rect.y = rect.y+(sh>rect.h)?sh-rect.h:0;
        if(rect.x < 0){
            rect.x = 0;
        }
        if(rect.y < 0){
            rect.y = 0;
        }
        /*if(rect.x2 > mw){
            rect.x2 = mw;
        }
        if(rect.y2 > mh){
            rect.y2 = mh;
        }*/

        //console.log(rect);
        rect.w = rect.x2-rect.x;
        rect.h = rect.y2-rect.y;


        let zoom = Math.min(w/rect.w,h/rect.h,1.0);

        this.pivot.x = rect.x;
        this.pivot.y = rect.y;

        this.scale.x = zoom;
        this.scale.y = zoom;

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