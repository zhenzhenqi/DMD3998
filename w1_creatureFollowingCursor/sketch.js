var ghost;

//function preload() {
//  // specify width and height of each frame and number of frames
//  sprite_sheet = loadSpriteSheet('assets/explode_sprite_sheet.png', 171, 158, 11);
//  explode_animation = loadAnimation(sprite_sheet);
//
//  // load the full sprite sheet for example reference only
//  sprite_sheet_image = loadImage('assets/explode_sprite_sheet.png');
//}

function setup() {
    createCanvas(500, 500);
    ghost = createSprite(0, 0);
    ghost.addAnimation('ghost.png', { frameSize: [100,86], 
                                     frames: 9 });
    //    ghost.setCollider('circle', -2, 2, 50);
}

function draw() {
    clear();
    ghost.velocity.x = (mouseX-ghost.position.x)/10;
    ghost.velocity.y = (mouseY-ghost.position.y)/10;

}