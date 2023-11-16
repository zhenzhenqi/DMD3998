import * as THREE from 'three';

import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';


let camera, scene, renderer, clock;
let loader, mixers, models;

function init() {

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(2, 3, -6);
    camera.lookAt(0, 1, 0);

    scene = new THREE.Scene();
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

    // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

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
    models = [
        {
            path: 'models/clock.glb',
            position: new THREE.Vector3(-4, 3, 10),
            rotation: new THREE.Euler(Math.PI , 0, 0)
        },
        {
            path: 'models/blue_flower_animated.glb',
            position: new THREE.Vector3(2, 0, 0),
            rotation: new THREE.Euler(0, 0, 0)
        }
    ];

    models.forEach((model) => {
        loader.load(model.path, (gltf) => {
            gltf.scene.position.copy(model.position); // Set model position
            gltf.scene.rotation.copy(model.rotation);
            scene.add(gltf.scene);
            

            // Set up animation
            if (gltf.animations.length) {
                const mixer = new THREE.AnimationMixer(gltf.scene);
                mixers.push(mixer);
                const action = mixer.clipAction(gltf.animations[0]); // Play the first animation
                action.play();
            }
        }, undefined, (error) => {
            console.error('An error happened', error);
        });
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

// Animation loop
clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    mixers.forEach((mixer) => mixer.update(delta));

    renderer.render(scene, camera);
}

init();
animate();