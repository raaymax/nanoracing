const Vec = require('../vec');

module.exports = class Transform{
    constructor(rotation = 0, translation = Vec.Zero(), scale = 1, parent = null){
        let y = Vec.New(0,1).rotate(rotation).mulp(scale);
        let x = Vec.New(1,0).rotate(rotation).mulp(scale);
        this.setComponents(x,y,translation);
        this.offset = translation.clone();
        this.parent = parent;
        this.position = translation;
        this.rotation = rotation;
        this.scale = scale;
    }

    toParent(pos){
        pos = this.translate(this.offset.clone().neg(), pos);
        return this.transform(this.invTransformMatrix, pos);
    }

    toLocal(pos, body){
        if(body){
            pos = body.toGlobal(pos);
        }
        if(this.parent) {
            pos = this.parent.transform.toLocal(pos);
        }
        pos = this.translate(this.offset.clone().neg(), pos);
        return this.transform(this.invTransformMatrix, pos);
    }

    toGlobal(pos){
        pos = this.transform(this.transformMatrix, pos);
        pos = this.translate(this.offset, pos);
        if(this.parent) {
            pos = this.parent.transform.toGlobal(pos);
        }
        return pos;
    }

    setComponents(a,b,c){
        this.transformMatrix = [];
        this.invTransformMatrix = [];
        this.transformMatrix[0] = [a.x, b.x];
        this.transformMatrix[1] = [a.y, b.y];
        let s = 1/(a.x*b.y-b.x*a.y);
        this.invTransformMatrix[0] = [b.y*s, -b.x*s];
        this.invTransformMatrix[1] = [-a.y*s, a.x*s];
    }

    transform(t, pos){
        return Vec.New(pos.x*t[0][0]+pos.y*t[0][1], pos.x*t[1][0]+pos.y*t[1][1]);
    }

    translate(t, pos){
        return pos.clone().add(t);
    }

};