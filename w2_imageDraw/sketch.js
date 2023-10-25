//step one defining a custom variable
let img;
let locGhost;
let locX;

function preload() {
//step two: intitialization of a custom variable
    img = loadImage('assets/daco.png');
}

function setup() {
    createCanvas(innerWidth, innerHeight);
    imageMode(CENTER);
}

function draw(){
    print('The value of mouseX is ' + mouseX);
    print('The value of mousey is ' + mouseY);
    image(img, mouseX-100, mouseY, 100, 100);
}