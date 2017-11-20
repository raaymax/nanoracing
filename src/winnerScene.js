const PIXI = require('pixi.js');

const Container = PIXI.Container;
const Graphics = PIXI.Graphics;



module.exports = class MenuScene extends Container{
    constructor( text){
        super();
        this.createText(100,100,text);
    }

    update(){

    }


    createText(x,y, text){

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
        richText.x = x;
        richText.y = y;

        this.addChild(richText);
    }

}