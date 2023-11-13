import * as THREE from 'three';
//import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

let scene, camera, renderer;
let controller;

class FirstPersonController {
  constructor(camera) {
    this.camera = camera;
    this.moveSpeed = 0.01;
    this.turnSpeed = 0.002;

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
  }

  onKeyDown(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = true;
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = false;
        break;
    }
  }

  update(deltaTime) {
    const moveStep = this.moveSpeed * deltaTime;
    if (this.moveForward) this.camera.position.z -= moveStep;
    if (this.moveBackward) this.camera.position.z += moveStep;
    if (this.moveLeft) this.camera.position.x -= moveStep;
    if (this.moveRight) this.camera.position.x += moveStep;
  }
}


function init() {
    // Basic Three.js setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
   
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Adding a simple object
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);// PlaneGeometry(width, height, widthSegments, heightSegments)

    //floor
    const floorGeometry = new THREE.PlaneGeometry(10, 10, 10, 10);

    // For a simple material with color
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xCCCCCC });

    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    // Rotate the geometry to lay flat (rotate around the X-axis by -90 degrees)
    floor.rotation.x = -Math.PI / 2;
    
    scene.add(floor);



    camera.position.z = 5;
    
    
    
    //lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);
    
//    create an instance of controller class and update it in your animation loop.
    controller = new FirstPersonController(camera);
}

function animate(time) {
    requestAnimationFrame(animate);
    const deltaTime = time - (lastTime || time);
    lastTime = time;

    controller.update(deltaTime);
    renderer.render(scene,camera);  
}

init();

let lastTime = 0;
animate(0);



animate(0);

//capture the mouse movement to implement looking around
function onMouseMove(event) {
  const deltaX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  const deltaY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

  camera.rotation.y -= deltaX * controller.turnSpeed;
  camera.rotation.x -= deltaY * controller.turnSpeed;
}

document.addEventListener('mousemove', onMouseMove, false);

//For an immersive experience, you might want to run your application in fullscreen and lock the pointer.
function goFullscreenAndPointerLock() {
  renderer.domElement.requestFullscreen();
  renderer.domElement.requestPointerLock();
}

document.addEventListener('click', goFullscreenAndPointerLock, false);

//add constraints to the vertical camera rotation to prevent over-rotation and make looking more realistic.
// Inside the onMouseMove function
camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
