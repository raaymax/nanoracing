module.exports = class Map {
    constructor(source) {
        this.canvas = document.createElement('canvas');
        var myImg = new Image();
        myImg.src = source;
        myImg.onload = ()=> {
            this.canvas.width = myImg.width;
            this.canvas.height = myImg.height;
            var context = this.canvas.getContext('2d');
            context.drawImage(myImg, 0, 0);
            this.context = context;
            console.log('loaded');
        }
    }

    getPixel(x,y){
        return this.context.getImageData(x, y, 1, 1).data;
    }

};