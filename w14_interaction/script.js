//@ts-check

import * as THREE from 'three';

import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';

import {
    PointerLockControls
} from 'three/addons/controls/PointerLockControls.js';

let camera, scene, renderer, clock, controls;


let collidableObjects = [];


let loader, mixers, models;
let raycaster;

// Controls setup
let moveForward = false;

let moveLeft = false;
let moveRight = false;
let moveBackward = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let clockLoaded, flowerLoaded;
let clockAction, flowerAction; // References to animation actions


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

    let flowerModel =
    {
        path: 'models/blue_flower_animated.glb',
        position: new THREE.Vector3(2, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(8, 8, 8)
    }

    function loadModel(model) {
        return new Promise((resolve, reject) => {
            loader.load(model.path, (gltf) => {
                // Set model position, rotation, and scale
                gltf.scene.position.copy(model.position);
                gltf.scene.rotation.copy(model.rotation);
                gltf.scene.scale.copy(model.scale);
                scene.add(gltf.scene);

                // Handle animations
                if (gltf.animations.length) {
                    let mixer = new THREE.AnimationMixer(gltf.scene);
                    mixers.push(mixer);
                }

                // Add to collidable objects
                collidableObjects.push(gltf.scene);

                // Resolve the promise with the loaded model
                resolve(gltf);
            }, undefined, (error) => {
                console.error('An error happened', error);
                reject(error); // Reject the promise if there's an error
            });
        });
    }


    loadModel(clockModel).then(gltf => {
        console.log('Clock model loaded', gltf);
        clockLoaded = gltf;
    }).catch(error => {
        console.error('Error loading clock model', error);
    });

    loadModel(flowerModel).then(gltf => {
        console.log('Flower model loaded', gltf);
        flowerLoaded = gltf;
    }).catch(error => {
        console.error('Error loading flower model', error);
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
                console.log("Initializing clock action");
                clockAction = new THREE.AnimationMixer(clockLoaded.scene).clipAction(clockLoaded.animations[0]);
            }
            if (!clockAction.isRunning()) {
                console.log("Playing clock animation");
                clockAction.play();
            }
        } else if (name.includes('flower') && flowerLoaded) {
            if (!flowerAction) {
                console.log("Initializing flower action");
                flowerAction = new THREE.AnimationMixer(flowerLoaded.scene).clipAction(flowerLoaded.animations[0]);
            }
            if (!flowerAction.isRunning()) {
                console.log("Playing flower animation");
                flowerAction.play();
            }
        }
    });
}





function animate() {
    requestAnimationFrame(animate);
    updateRaycaster();
    checkCollision();

    const delta = clock.getDelta();
    mixers.forEach((mixer) => mixer.update(delta));

    const time = performance.now();


    if (controls.isLocked === true) {

        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;

        //        const intersections = raycaster.intersectObjects(objects, false);
        //
        //        const onObject = intersections.length > 0;

        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        //        if (onObject === true) {
        //            console.log(intersects[0].object);
        //            velocity.y = Math.max(0, velocity.y);
        //            canJump = true;

        // }

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        controls.getObject().position.y += (velocity.y * delta); // new behavior

        if (controls.getObject().position.y < 10) {

            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;

        }

    }

    prevTime = time;

    renderer.render(scene, camera);
}