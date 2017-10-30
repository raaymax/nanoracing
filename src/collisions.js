

function checkCollisionCircleToRect(circle, rect){
    let unrotatedCircleX = Math.cos(rect.rotation) * (circle.x - rect.x) -
        Math.sin(rect.rotation) * (circle.y - rect.y) + rect.x;
    let unrotatedCircleY  = Math.sin(rect.rotation) * (circle.x - rect.x) +
        Math.cos(rect.rotation) * (circle.y - rect.y) + rect.y;

    let closestX, closestY;

    let box = rect.getBounds();
    if (unrotatedCircleX  < box.x)
        closestX = box.x;
    else if (unrotatedCircleX  > box.x + box.width)
        closestX = box.x + rect.width;
    else
        closestX = unrotatedCircleX ;

// Find the unrotated closest y point from center of unrotated circle
    if (unrotatedCircleY < box.y)
        closestY = box.y;
    else if (unrotatedCircleY > box.y + box.height)
        closestY = box.y + box.height;
    else
        closestY = unrotatedCircleY;

// Determine collision
    let collision = false;

    let distance = findDistance(unrotatedCircleX , unrotatedCircleY, closestX, closestY);
    if (distance < circle.radius)
        collision = true; // Collision
    else
        collision = false;
    return collision;
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