let animationIndex;

function setup() {
    createCanvas(400, 400);
    animationIndex = 0;
}

function draw() {
    background(220);

    switch(animationIndex) {
        case "up":
            ellipse(0,20,10,20);
            break;
        case "down":
            ellipse(20,39,20,100);
            break;
        default:
            break;

    }
}

function mousePressed() {
    animationIndex += 1;
}