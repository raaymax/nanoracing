const PIXI = require('pixi.js');
const Game = require('./game');

const loader = PIXI.loader;


loader
    .add("assets/spritesheet.json")
    .add('car', "assets/car.png")
    .add('car2', "assets/car2.png")
    .add('map', "assets/map.png")
    .add('map2', "assets/map2.png")
    .add('crate', "assets/crate.png")
    .load(()=>Game.setup());
