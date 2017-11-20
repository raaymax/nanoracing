
module.exports = class Controller{
    constructor(keyMap){
        Object.keys(keyMap).forEach(key=>{
            this[key] = false;
        });
        this.init(keyMap);
    }

    init(keyMap){
        Object.keys(keyMap).forEach(key=>{
            let code = keyMap[key];
            let watcher = Controller.watch(code);
            watcher.press = ()=>this[key]=true;
            watcher.release = ()=>this[key]=false;
        });
    }

    static watch(keyCode) {
        var key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        //The `downHandler`
        key.downHandler = function(event) {
            console.log(event.keyCode);
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        //The `upHandler`
        key.upHandler = function(event) {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };

        //Attach event listeners
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    }
};


