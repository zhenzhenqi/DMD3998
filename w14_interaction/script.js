//@ts-check

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// Camera, scene, and renderer declarations
let camera, scene, renderer;

// Clock for animation timing
let clock;

// PointerLockControls for camera movement
let controls;

// Array to store collidable objects in the scene
let collidableObjects = [];

// GLTFLoader for loading 3D models and mixers for animations
let loader, mixers;

// Raycaster for collision detection
let raycaster;

// Movement controls
let moveForward = false;
let moveLeft = false;
let moveRight = false;
let moveBackward = false;
let canJump = false;

// Time tracking for movement
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Variables to manage clock model and its animations
let clockLoaded;
let clockAction;

// Initialize and animate the scene
init();
animate();

function init() {
    // Animation loop
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(2, 0, -6);
    camera.lookAt(0, 1, 0);

    controls = new PointerLockControls(camera, document.body);

    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');

    instructions.addEventListener('click', function () {

        controls.lock();

    });

    controls.addEventListener('lock', function () {

        instructions.style.display = 'none';
        blocker.style.display = 'none';

    });

    controls.addEventListener('unlock', function () {

        blocker.style.display = 'block';
        instructions.style.display = '';

    });


    scene = new THREE.Scene();
    scene.add(controls.getObject());
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(-3, 10, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 4;
    dirLight.shadow.camera.bottom = -4;
    dirLight.shadow.camera.left = -4;
    dirLight.shadow.camera.right = 4;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);

    const onKeyDown = function (event) {

        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;

            case 'Space':
                if (canJump === true) velocity.y += 350;
                canJump = false;
                break;

        }

    };

    const onKeyUp = function (event) {

        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;

        }

    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    raycaster = new THREE.Raycaster();
    //    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
    raycaster.near = 0.1;
    raycaster.far = 10; // Only detect collisions within 10 units from the camera


    // ground
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshPhongMaterial({
        color: 0xcbcbcb,
        depthWrite: false
    }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // GLTF Loader
    loader = new GLTFLoader();
    mixers = []; // Array to hold AnimationMixers

    let clockModel = {
        path: 'models/clock.glb',
        position: new THREE.Vector3(-4, 15, 10),
        rotation: new THREE.Euler(Math.PI, 0, 0),
        scale: new THREE.Vector3(1, 1, 1)
    }

    function loadModel(model) {
        // A Promise is used to handle asynchronous operations. It represents a value that may be available now, later, or never.
        return new Promise((resolve, reject) => {
            // Use the GLTFLoader to load a 3D model
            loader.load(model.path, (gltf) => {
                // Set the position, rotation, and scale of the loaded model to match the specified model
                gltf.scene.position.copy(model.position);
                gltf.scene.rotation.copy(model.rotation);
                gltf.scene.scale.copy(model.scale);

                // Add the model to the scene
                scene.add(gltf.scene);

                // Check if the model has animations
                if (gltf.animations.length) {
                    // Create an AnimationMixer to handle the model's animations
                    let mixer = new THREE.AnimationMixer(gltf.scene);
                    mixers.push(mixer); // Add the mixer to the mixers array for later use

                    // Store the mixer in the loaded model for easy reference
                    gltf.mixer = mixer;
                }

                // Add the model to the list of collidable objects for collision detection
                collidableObjects.push(gltf.scene);

                // Resolve the promise, indicating that the model has been loaded successfully
                resolve(gltf);
            }, undefined, (error) => {
                console.error('An error happened', error);
                reject(error); // Reject the promise if an error occurs during loading
            });
        });
    }

    // Asynchronously load the clock model
    loadModel(clockModel).then(gltf => {
        // This code runs after the model has been successfully loaded
        console.log('Clock model loaded', gltf);
        clockLoaded = gltf; // Store the loaded model for later use
    }).catch(error => {
        // This code runs if there was an error loading the model
        console.error('Error loading clock model', error);
    });


    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

}



function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateRaycaster() {
    // Set the raycaster to start at the camera position and cast in the direction the camera is facing
    raycaster.set(camera.position, camera.getWorldDirection(new THREE.Vector3()));
}


function checkCollision() {
    const intersects = raycaster.intersectObjects(collidableObjects, true);

    if (intersects.length === 0) {
        return; // No collision detected
    }

    console.log("Collision detected with: ", intersects.map(obj => obj.object.name));

    intersects.forEach(intersectedObject => {
        const name = intersectedObject.object.name;

        if (name.includes('clock') && clockLoaded) {
            if (!clockAction) {
                clockAction = clockLoaded.mixer.clipAction(clockLoaded.animations[0]);
            }
            if (!clockAction.isRunning()) {
                clockAction.play();
            }
        }
    });
}




function animate() {
    // Request the browser to perform an animation and call the 'animate' function on the next frame
    requestAnimationFrame(animate);

    // Update the raycaster for collision detection
    updateRaycaster();
    checkCollision();

    // Calculate the time passed since the last frame
    const delta = clock.getDelta();

    // Update all animation mixers for any animations in the scene
    mixers.forEach((mixer) => mixer.update(delta));

    // Get the current time for movement calculations
    const time = performance.now();

    // If the camera controls are locked (meaning, user is controlling the camera)
    if (controls.isLocked === true) {

        // Adjust the raycaster's origin to the camera's position for collision detection
        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10; // Move it slightly downwards

        // Calculate time difference since last movement
        const delta = (time - prevTime) / 1000;

        // Apply friction to slow down movement
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        // Apply gravity effect
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 represents a 'mass' value

        // Determine the direction of movement based on key presses
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // Normalize the direction for consistent movement speed

        // Adjust velocity based on the direction of movement
        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        // Move the camera based on calculated velocity
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        // Apply calculated velocity to camera's vertical position (Y-axis)
        controls.getObject().position.y += (velocity.y * delta);

        // Check if camera's position is below a certain threshold (to simulate ground level)
        if (controls.getObject().position.y < 10) {
            velocity.y = 0; // Stop vertical movement
            controls.getObject().position.y = 10; // Set position to ground level
            canJump = true; // Allow the camera to jump again
        }
    }

    // Update the previous time for the next frame
    prevTime = time;

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);
}
