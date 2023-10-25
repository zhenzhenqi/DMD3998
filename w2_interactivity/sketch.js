let x, y;
let dirX, dirY;
let col, r, g, b;

//function preload() {
//  // specify width and height of each frame and number of frames
//  sprite_sheet = loadSpriteSheet('assets/explode_sprite_sheet.png', 171, 158, 11);
//  explode_animation = loadAnimation(sprite_sheet);
//
//  // load the full sprite sheet for example reference only
//  sprite_sheet_image = loadImage('assets/explode_sprite_sheet.png');
//}




function setup() {
  createCanvas(600, 400);

  noStroke();
  x = 200;
  y = 300;
  dirX = 10;
  dirY = 10;
  r = color(255, 0, 0);
  g = color(0, 255, 0);
  b = color(0, 0, 255);
  col = r;

}

function draw() {
  fill(col);
  rect(x, y, 50, 50);
  x=x+dirX;
  y=y+dirY;


  if(x>width || x<0){
    dirX = -dirX;
    col = g;
  }
  if(y>height || y<0){
    dirY = -dirY;
    col = b;
  }
}