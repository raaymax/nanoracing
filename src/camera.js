

module.exports = class Camera{
    constructor(scene, car1, car2){
        this.scene = scene;
        this.car = car1;
        this.car2 = car2;
    }

    update(){
        let w = window.innerWidth;
        let h = window.innerHeight;


        let rect = {
            x: Math.min(this.car.sprite.x,this.car2.sprite.x)-300,
            y: Math.min(this.car.sprite.y,this.car2.sprite.y)-300,
            x2:Math.max(this.car.sprite.x,this.car2.sprite.x)+300,
            y2:Math.max(this.car.sprite.y,this.car2.sprite.y)+300
        };

        if(rect.x < 0){
            rect.x = 0;
        }
        if(rect.y < 0){
            rect.y = 0;
        }

        rect.w = rect.x2-rect.x;
        rect.h = rect.y2-rect.y;

        let zoom = Math.min(w/rect.w,h/rect.h,1.0);

        this.scene.pivot.x = rect.x;
        this.scene.pivot.y = rect.y;

        this.scene.scale.x = zoom;
        this.scene.scale.y = zoom;
    }
};