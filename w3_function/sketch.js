let x, y;
let col, r, g, b;
let dirX, dirY;

function setup(){
    createCanvas(innerWidth, innerHeight);
    noStroke();
    x = 200;
    y = 300;

    dirX = 10;
    dirY = 10;

    r = color(255, 0, 0);
    g = color(0, 255, 0);
    b = color(0, 0, 255);
    col = g;

    background(r);
}

function draw(){
    show();
    move();

    //    fill(col);
    //    rect(x, y, 50, 50);
    //    
    //    x = x+dirX;
    //    y = y+dirY;
    //
    //    //if the rectangle hits left or right edge of the canvas, reverse it back
    //    if(x<0||x>innerWidth){
    //        dirX = -dirX;
    //        col = b;
    //    }
    //
    //
    //    //if the rectangle hits top or bottom edge of the canvas, reverse it back
    //
    //    if(y<0||y>innerHeight){
    //        dirY = -dirY;
    //        col = g;
    //    }
}

function show(){
    fill(col);
    rect(x, y, 50, 50);
    x = x +1;
    y = y +1;
}

function move(){
    x = x+dirX;
    y = y+dirY;

    if(y>innerHeight){
        dirY = -dirY;
    }
    //if the rectangle hits left or right edge of the canvas, reverse it back
    if(x<0||x>innerWidth){
        dirX = -dirX;
        col = b;
    }


    //if the rectangle hits top or bottom edge of the canvas, reverse it back

    if(y<0||y>innerHeight){
        dirY = -dirY;
        col = g;
    }
}
