
module.exports = class Vec{
    static Direction(dir){
        return new Vec(Math.sin(dir), -Math.cos(dir));
    }

    static Dot(v1,v2){
        return v1.x*v2.x+v1.y*v2.y;
    }
    constructor(x=0,y=0){
        this.x = x;
        this.y = y;
    }

    neg(){
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    clone(){
        return new Vec(this.x, this.y);
    }

    len(){
        return Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2));
    }

    rotate(degrees){
        let x = this.x * Math.cos(degrees) - this.y * Math.sin(degrees);
        let y = this.x * Math.sin(degrees) + this.y * Math.cos(degrees);
        return new Vec(x,y);
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
