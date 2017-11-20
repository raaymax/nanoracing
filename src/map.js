const data = require('./map_simple.js');
const PIXI = require('pixi.js');
const ParticleContainer = PIXI.ParticleContainer;
const Sprite = PIXI.Sprite;
const TextureCache = PIXI.TextureCache;
const TilingSprite = PIXI.extras.TilingSprite;

module.exports = class Map {
    constructor(source) {
        this.obstacles = [];
        this.checkpoints = [];
        this.width = data.map.size.width;
        this.height = data.map.size.height;


        //this.initBackground(source);
        this.initDrawable();
    }



    init(stage){
        let background = new TilingSprite(TextureCache['grass.png'], 8*400,8*400);
        stage.addChild(background);

        let map = new ParticleContainer(30,{rotation:true,uvs: true});
        let road = data.map.road;
        road.forEach(part=>{
            this.pushCheckpoint(createPart(part));
        });
        stage.addChild(map);

        function createPart(data){
            let part = new Sprite(TextureCache[data.tile]);
            part.anchor.x = 0.5;
            part.anchor.y = 0.5;
            if(data.rotation)
                part.rotation = data.rotation;
            part.colliderType = 'rect';
            part.x = data.pos[0]*400+200;
            part.y = data.pos[1]*400+200;
            map.addChild(part);
            return part;
        }
    }

    createFance(stage, x,y,w,h){
        let box = new Graphics();
        box.beginFill(0x9966FF);
        box.drawRect(0, 0, w,h);
        box.endFill();
        box.x=x;
        box.y=y;
        box.colliderType = 'rect';
        this.obstacles.push(box);
        stage.addChild(box);
    }

    create

    initBackground(source){
        this.canvas = document.createElement('canvas');
        var myImg = new Image();
        myImg.src = source;
        myImg.onload = ()=> {
            this.width=this.canvas.width = myImg.width;
            this.height=this.canvas.height = myImg.height;
            var context = this.canvas.getContext('2d');
            context.drawImage(myImg, 0, 0);
            this.context = context;
            console.log('loaded');
        }
    }

    pushCheckpoint(object){
        this.checkpoints.push(object);
    }

    initDrawable(){
        this.drawableCanvas = document.createElement('canvas');
        this.drawableCanvas.width = this.width;
        this.drawableCanvas.height = this.height;
        this.drawableContext = this.drawableCanvas.getContext('2d');
        //this.drawLine({x:0,y:0},{x:400,y:400});
    }

    getPixel(x,y){
        if(!this.context) return 0;
        return this.context.getImageData(x, y, 1, 1).data;
    }

    drawLine(v1,v2){
        this.drawableContext.strokeStyle='rgba(0,0,0,0.2)';
        this.drawableContext.beginPath();
        this.drawableContext.moveTo(v1.x, v1.y);
        this.drawableContext.lineTo(v2.x, v2.y);
        this.drawableContext.stroke();
    }

};