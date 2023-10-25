let gif,img, currentDisplay;


function preload() {
    //load 
    gif = loadImage('assets/gtlichScreen.gif');
    img = loadImage('assets/alien.png');
    currentDisplay = gif;
}

function setup(){
    createCanvas(gif.width, gif.height);
}

function draw() {
    background(255);
    image(currentDisplay, 0, 0);
    //booliean variable
//    print(mouseIsPressed);
//    if(mouseIsPressed===true){
//        currentDisplay = img;
//    }else{
//        currentDisplay = gif;
//    }
}

//function mousePressed(){
//    currentDisplay = img;
//}
//
//function mouseReleased(){
//    currentDisplay = gif;
//}

