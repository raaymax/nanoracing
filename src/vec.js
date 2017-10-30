
module.exports = class Vec{
    static Direction(dir){
        return new Vec(Math.sin(dir), -Math.cos(dir));
    }
    constructor(x=0,y=0){
        this.x = x;
        this.y = y;
    }

    len(){
        return Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2));
    }


    addp(v){
        this.x +=v;
        this.y +=v;
        return this;
    }
    add(v){
        this.x +=v.x;
        this.y +=v.y;
        return this;
    }
    subp(v){
        this.x -=v;
        this.y -=v;
        return this;
    }
    sub(v){
        this.x -=v.x;
        this.y -=v.y;
        return this;
    }
    mulp(v){
        this.x *=v;
        this.y *=v;
        return this;
    }
    mul(v){
        this.x *=v.x;
        this.y *=v.y;
        return this;
    }
    divp(v){
        this.x /=v;
        this.y /=v;
        return this;
    }
    div(v){
        this.x /=v.x;
        this.y /=v.y;
        return this;
    }
}
