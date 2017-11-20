const PIXI = require('pixi.js');

const Container = PIXI.Container;
const Graphics = PIXI.Graphics;



module.exports = class MenuScene extends Container{
    constructor(game){
        super();
        this.game = game;
        this.createButton(100,100,300,50, "Play");
    }

    update(){

    }


    createButton(x,y,w,h, text){
        let box = new Graphics();
        box.beginFill(0xffffff);
        box.drawRect(0, 0, w, h);
        box.endFill();
        box.beginFill(0x9966FF);
        box.drawRect(2, 2, w-4, h-4);
        box.endFill();
        box.x=x;
        box.y=y;
        box.pivot.x=0.5;
        box.pivot.y=0.5;

        var style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff', '#00ff99'], // gradient
            stroke: '#4a1850',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440
        });

        var richText = new PIXI.Text(text, style);
        richText.x = 0;
        richText.y = 0;

        box.interactive = true;
        box.on('pointerdown', ()=>{
            box.scale.x = 0.9;
            box.scale.y = 0.9;
        });
        box.on('pointerup', ()=>{
            box.scale.x = 1;
            box.scale.y = 1;
            console.log(this.game);
            this.game.newGame();
        });

        box.addChild(richText);
        this.addChild(box);
        return box;
    }

}