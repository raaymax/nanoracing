const SceneManager = require('./sceneManager');
const MenuScene = require('./menuScene');
const GameScene = require('./gameScene');
const WinnerScene = require('./winnerScene');
const Map = require('./map');

module.exports = window.Game = new (class Game{

    constructor(){
        this.map = new Map("/assets/map2.png");
    }

    setup(){
        this.scenes = new SceneManager();
        this.menu = new MenuScene(this);
        this.scenes.add('menu', this.menu);
    }

    update(){
        if(this.game && this.game.winner){
            this.winner = new WinnerScene("Player "+ this.game.winner+" win!");
            this.scenes.add('winner', this.winner);
            this.scenes.goto('winner');
        }
    }

    newGame(){
        console.log('run');

        this.game = new GameScene(this.map);
        this.scenes.add('game', this.game);
        this.scenes.goto('game');
    };

})();