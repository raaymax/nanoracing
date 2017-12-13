
module.exports = class Vec{
    static Direction(dir){
        return new Vec(Math.sin(dir), -Math.cos(dir));
    }

    static Zero(dir){
        return new Vec(0, 0);
    }

    static Dot(v1,v2){
        return v1.x*v2.x+v1.y*v2.y;
    }

    static Cross(v,w){
        return v.x * w.y - v.y * w.x
    }
    static New(x,y){
        return new Vec(x,y);
    }

    castOnAxis(axis){
        let nega = axis.clone().neg();
        return Vec.Dot(axis, this) / Vec.Dot(nega, nega);
    }

    normalize(){
        let l = this.len();
        if(l===0) return this;
        return this.divp(l);
    }

    constructor(x=0,y=0){
        this.x = x;
        this.y = y;
    }
    isZero(){
        return this.x === 0 && this.y === 0;
    }

    neg(){
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    atan2(){
        return Math.atan2(this.x, this.y);
    }

    rotate(angle){
        let cs = Math.cos(angle)
        let sn = Math.sin(angle);
        let px = x * cs - y * sn;
        let py = x * sn + y * cs;
        this.x = px;
        this.y = py;
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
