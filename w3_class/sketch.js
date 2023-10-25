let bob, jane, annie;


function setup() {
  createCanvas(800, 600);
  background(0);
  noStroke();

  bob = new Rectangle(60, 300, 255, 0, 0, 40, 10);
  jane = new Rectangle(250, 380, 0, 255, 0, 100, 5);
  annie = new Rectangle(10, 380, 0, 0, 255, 60, 8);
}

function draw(){
  bob.show();
  bob.move();
  jane.show();
  jane.move();
  annie.show();
  annie.move();
}

class Rectangle {
  constructor(x, y, r, g, b, size, speed) {
    this.x = x;
    this.y = y;
    this.r = r; 
    this.g = g; 
    this.b = b; 
    this.col = color(r,g,b);
    this.speed = speed;
    this.directionX = 1;
    this.directionY = 1;
    this.size = size;
  }

  show(){
    fill(this.col);
    rect(this.x, this.y, this.size, this.size);
  }

  move() {
    this.x += this.speed * this.directionX;
    this.y += this.speed * this.directionY;

    if (this.x <= 0 || this.x + this.size >= width) {
      this.directionX *= -1;
    }
    if (this.y <= 0 || this.y + this.size >= height) {
      this.directionY *= -1;
    }
  }
}