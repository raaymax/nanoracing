const PIXI = require('pixi.js');

const Container = PIXI.Container;
const autoDetectRenderer = PIXI.autoDetectRenderer;

module.exports = class SceneManager{
    constructor(){
        this.renderer = autoDetectRenderer();
        this.scenes = [];
        this.resize();
        window.addEventListener("resize", this.resize);
        document.body.appendChild(this.renderer.view);
        requestAnimationFrame(()=>this.update());
    }

    add(id, scene){
        scene.id = id;
        this.scenes.push(scene);
        if(!this.currentScene){
            this.currentScene = scene;
        }
        return scene;
    }

    goto(id){
        //console.log('goto', id,this.currentScene);
        this.currentScene = this.scenes.find(s=>s.id===id);
        //console.log(this.currentScene);
    }

    remove(id){
        let idx = this.scenes.findIndex(s=>s.id===id);
        this.scenes.splice(idx, 1);
        if(this.currentScene.id === id){
            this.currentScene = null;
        }
    }

    update(){
        requestAnimationFrame(()=>this.update());
        Game.update();
        if(this.currentScene) {
            //console.log('ok');
            this.currentScene.update();
            this.renderer.render(this.currentScene);
        }
    }

    resize() {
        let w = window.innerWidth;
        let h = window.innerHeight;

        this.renderer.resize( w, h );
    }

};