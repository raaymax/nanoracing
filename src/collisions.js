const Vec = require('./vec');
const PIXI = require('pixi.js');
const Point = PIXI.Point;
const Bump = require('bump.js');
const bump = new Bump(PIXI);

module.exports ={
    checkCollisionCircleToRect,
    checkCollisionRectToRect,
    checkCollisions,
    checkCollision
};

function checkCollisionPolyToRect(poly, rect){

}

function extractRectLocalCorners(rect){
    let lrect = rect.getLocalBounds();
    return [
        new Point(lrect.x, lrect.y),
        new Point(lrect.x, lrect.y+lrect.height),
        new Point(lrect.x+lrect.width, lrect.y),
        new Point(lrect.x+lrect.width, lrect.y+lrect.height)
    ];
}

function extractRectGlobalCorners(sprite, points){
    return points.map(point=>new Point(
        (point.x/sprite.scale.x + sprite.x),
        (point.y/sprite.scale.y + sprite.y)
    ));
}

function cornersToLocalSprite(sprite, points){
    return points.map(point=>new Point(
        Math.abs(point.x-sprite.x)/sprite.scale.x,
        Math.abs(point.y-sprite.y)/sprite.scale.y
    ));
}

function max(arr, prop){
    return arr.reduce((ret,val)=>ret<val[prop]?val[prop]:ret, -Infinity);
}
function min(arr, prop){
    return arr.reduce((ret,val)=>ret>val[prop]?val[prop]:ret, Infinity);
}

function intersects(a,b, c,d){
    //console.log(a,b,c,d);
    if((a <= c && b >= c) ||
        (a <= d && b >= d) ||
        (c <= a && d >= a) ||
        (c <= b && d >= b))
        return true;
    return false;
}

function castOnAxis(points, axis){
    let nega = axis.clone().neg();
    let max = -Infinity;
    let min = Infinity;
    for(let i = 0; i < points.length; i++) {
        let b = points[i];
        let v = Vec.Dot(b, axis)/Vec.Dot(nega,nega);
        if(v < min) min = v;
        if(v > max) max = v;
    }
    return [min, max];
}

function intersects2(r1,r2,axis){
    let a = castOnAxis(r1, axis);
    let b = castOnAxis(r2, axis);
    return intersects(a[0],a[1],b[0],b[1]);
}


function makeVecFromVertices(arr){
    let ret = [];
    for(let i = 0; i < arr.length; i+=2){
        ret.push(new Vec(arr[i], arr[i+2]));
    }
    return ret;
}


function checkCollisionRectToRect(r1, r2) {
    //console.log(r1.toLocal({x:0,y:0}, r2).x*r1.scale.x);
    let b1 = r1.getLocalBounds();
    let b2 = r2.getLocalBounds();
    let arr1 = [
        new Vec(b1.x, b1.y),
        new Vec(b1.x, b1.y+b1.height),
        new Vec(b1.x+b1.width, b1.y+b1.height),
        new Vec(b1.x+b1.width, b1.y),
    ];
    let arr2 = [
        new Point(b2.x, b2.y),
        new Point(b2.x, b2.y+b2.height),
        new Point(b2.x+b2.width, b2.y+b2.height),
        new Point(b2.x+b2.width, b2.y),
    ].map(p=>r1.toLocal(p, r2)).map(p=>new Vec(p.x, p.y));

    if(!intersects2(arr1,arr2, new Vec(0,1))) return false;
    if(!intersects2(arr1,arr2, new Vec(1,0))) return false;
    if(!intersects2(arr1,arr2, arr2[0].clone().sub(arr2[1]))) return false;
    if(!intersects2(arr1,arr2, arr2[1].clone().sub(arr2[2]))) return false;
    let v = new Vec(r1.x-r2.x, r1.y-r2.y);
    return v.divp(v.len());
}


function checkCollision(sprite, ob){
    if(hitPossible(sprite, ob)){
        if(ob.colliderType === 'rect'){
            return checkCollisionRectToRect(sprite, ob);
        }else if(ob.colliderType === 'radius'){
            return checkCollisionCircleToRect(ob,sprite);
        }
    }
    return false;
}


function checkCollisions(sprite, map){
    for(let key in map.obstacles){
        let ob = map.obstacles[key];
        if(hitPossible(sprite, ob)){
            if(ob.colliderType === 'rect'){
                let col = checkCollisionRectToRect(sprite, ob);
                if(col) return col;
            }else if(ob.colliderType === 'radius'){
                let col = checkCollisionCircleToRect(ob,sprite);
                if(col) return col;
            }
        }
    }
    return false;
}


function hitPossible(s1, s2){
    let b1 = s1.getBounds();
    let b2 = s2.getBounds();
    return intersects(b1.x-1, b1.x+b1.width+1, b2.x-1, b2.x+b2.width+1) &&
        intersects(b1.y-1, b1.y+b1.height+1, b2.y-1, b2.y+b2.height+1)
}



function checkCollisionCircleToRect(circle, rect){
    let b = rect.getLocalBounds();
    let c = rect.toLocal({x:0,y:0}, circle);
    let center = rect.toLocal({x:0,y:0}, rect);
    let p = new Vec(c.x, c.y);
    let radius =circle.radius/rect.scale.x;

    if(pointInsideRect(p, b)){
        let v = p.sub(center);
        v.divp(v.len());
        let x = v.x*Math.cos(rect.rotation-Math.PI) - v.y*Math.sin(rect.rotation-Math.PI);
        let y = v.x*Math.sin(rect.rotation-Math.PI) + v.y*Math.cos(rect.rotation-Math.PI);
        return new Vec(x,y);
    }else{
        let d = nearestPointOnRect(p,b);
        let v = p.sub(d);
        if(v.len() > radius) return false;
        v.divp(v.len());
        console.log(v);
        let x = v.x*Math.cos(rect.rotation-Math.PI) - v.y*Math.sin(rect.rotation-Math.PI);
        let y = v.x*Math.sin(rect.rotation-Math.PI) + v.y*Math.cos(rect.rotation-Math.PI);
        return new Vec(x,y);
    }
    return false;
}

function nearestPointOnRect(P, rect){
    let a = new Vec(rect.x, rect.y);
    let b = new Vec(rect.x+rect.width, rect.y);
    let c = new Vec(rect.x, rect.y+rect.height);
    let d = new Vec(rect.x+rect.width, rect.y+rect.height);
    if(P.x < rect.x){
        return nearestPointOnLine(P,a,c);
    }else if(P.x > rect.x+rect.width){
        return nearestPointOnLine(P,b,d);
    }else if(P.y < rect.y){
        return nearestPointOnLine(P,a,b);
    }else if(P.y > rect.y+rect.height){
        return nearestPointOnLine(P,c,d);
    }else if(pointInsideRect(P,rect)){
        return P;
    }
}

function pointInsideRect(P, rect){
    return P.x >= rect.x &&
        P.x <= rect.x+rect.width &&
        P.y >= rect.y &&
        P.y <= rect.y+rect.height;
}

function nearestPointOnLine(P, A, B){
    let BA = B.clone().sub(A);
    let AB = A.clone().sub(B);
    let u = Vec.Dot(P.clone().sub(A),BA) / Vec.Dot(AB,AB);
    return A.clone().add(BA.mulp(Math.max(0,Math.min(u,1))));
}

function pointOnLine(P, A, B){
    let BA = B.clone().sub(A);
    let AB = A.clone().sub(B);
    let u = Vec.Dot(P.clone().sub(A),BA) / Vec.Dot(AB,AB);
    if(u > 1 || u < 0) return null;
    return A.clone().add(BA.mulp(u));
}

function pointDistanceFromLine(P,A,B){
    let a = A.y-B.y;
    let b = B.x-A.x;
    let c = (A.x-B.x)*A.y + (B.y-A.y)*A.x;
    return Math.abs(a*P.x+b*P.y+c)/Math.sqrt(A*A+B*B);
}

function pointSideOfLine(P,A,B){
    let a = A.y-B.y;
    let b = B.x-A.x;
    let c = (A.x-B.x)*A.y + (B.y-A.y)*A.x;
    return a*P.x+b*P.y+c;
}

function findDistance(fromX, fromY, toX, toY){
    let a = Math.abs(fromX - toX);
    let b = Math.abs(fromY - toY);
    return Math.sqrt((a * a) + (b * b));
}

function contain(sprite, container) {

    var collision = undefined;

    //Left
    if (sprite.x < container.x) {
        sprite.x = container.x;
        collision = "left";
    }

    //Top
    if (sprite.y < container.y) {
        sprite.y = container.y;
        collision = "top";
    }

    //Right
    if (sprite.x + sprite.width > container.width) {
        sprite.x = container.width - sprite.width;
        collision = "right";
    }

    //Bottom
    if (sprite.y + sprite.height > container.height) {
        sprite.y = container.height - sprite.height;
        collision = "bottom";
    }

    //Return the `collision` value
    return collision;
}