import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


let scene, renderer, camera, clock;
let loader, mixers, models;
let controls;
let skybox;


let rayLine;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let targetPoint = new THREE.Vector3();


function init() {
    scene = new THREE.Scene();

    scene.background = new THREE.Color(0xcccccc);
    scene.fog = new THREE.FogExp2(0xcccccc, 0.00025);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(10, 10, 40);
    camera.lookAt(new THREE.Vector3(0, 0, 0));


    // controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(window); // optional

    // Set the zoom range
    controls.minDistance = 5;
    controls.maxDistance = 200;

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.maxPolarAngle = Math.PI / 2;


    const loader = new GLTFLoader();
    loader.load('bballcourt.glb', function (gltf) {
        scene.add(gltf.scene);
    }, undefined, function (error) {
        console.error(error);
    });

    //load in the six skybox textures
    let materialArray = [];
    let texture_ft = new THREE.TextureLoader().load('skybox/skybox_ft.png');
    let texture_bk = new THREE.TextureLoader().load('skybox/skybox_bk.png');
    let texture_up = new THREE.TextureLoader().load('skybox/skybox_up.png');
    let texture_dn = new THREE.TextureLoader().load('skybox/skybox_dn.png');
    let texture_rt = new THREE.TextureLoader().load('skybox/skybox_rt.png');
    let texture_lf = new THREE.TextureLoader().load('skybox/skybox_lf.png');

    //organize the textures into material array
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

    //set the materials to render only on the back side of the skybox
    for (let i = 0; i < 6; i++)
        materialArray[i].side = THREE.BackSide;
    let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
    skybox = new THREE.Mesh(skyboxGeo, materialArray);

    //add skybox to the scene
    scene.add(skybox);


    mixers = []; // Array to hold AnimationMixers
    models = [
        {
            name: 'bouncing',
            path: 'basketballcourtanimationbouncing.glb',
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0)
        },
        {
            name: 'shooting',
            path: 'basketballcourtanimationshooting.glb',
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0)
        },
        {
            name: 'rolling',
            path: 'bballrollinganimation.glb',
            position: new THREE.Vector3(10, 0.5, 0),
            rotation: new THREE.Euler(0, 0, 0)
        }
    ];

    models.forEach((model, index) => {
        loader.load(model.path, (gltf) => {
            gltf.scene.position.copy(model.position); // Set model position
            gltf.scene.rotation.copy(model.rotation);
            scene.add(gltf.scene);


            gltf.name = model.name;
            gltf.scene.name = model.name + " scene";
           


            // // Calculate the bounding box
            // const bbox = new THREE.Box3().setFromObject(gltf.scene);

            // // Create a helper to visualize the bounding box
            // const bboxHelper = new THREE.Box3Helper(bbox, 0xff0000); // Red bounding box
            // scene.add(bboxHelper);

            // Set up animation
            if (gltf.animations.length) {
                const mixer = new THREE.AnimationMixer(gltf.scene);
                const action = mixer.clipAction(gltf.animations[0]);
``              
                // Store the mixer and action in the model

               
        
                gltf.scene.action = action;

                models[index].mixer = mixer;

                
                
                console.log(gltf.scene);

                // Set the action to play only once
                action.setLoop(THREE.LoopOnce);
                action.clampWhenFinished = true;
            

            }

            printHierarchy(gltf.scene, '---');
        }, undefined, (error) => {
            console.error('An error happened', error);
        });
    });

    function printHierarchy(obj, indent = '') {
        console.log(indent + 'Object:', obj.name, '(' + obj.type + ')');
        obj.children.forEach(child => printHierarchy(child, indent + '--'));
    }
    
    
    




    // lights
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 3);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x002288, 3);
    dirLight2.position.set(- 1, - 1, - 1);
    scene.add(dirLight2);

    const ambientLight = new THREE.AmbientLight(0x555555);
    scene.add(ambientLight);


    let material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    let geometry = new THREE.BufferGeometry().setFromPoints([camera.position, targetPoint]);

    //start from dummy points
    geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -10)]);
    rayLine = new THREE.Line(geometry, material);
    scene.add(rayLine);
}




window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    models.forEach(model => {
        if (model.mixer) {
            model.mixer.update(delta);
        }
    });

    controls.update();
    updateRayLine();

    // Rotate the skybox on all three axes
    skybox.rotation.x += 0.00006; // Adjust this value for different speeds
    skybox.rotation.y += 0.00007; // Adjust this value for different speeds
    skybox.rotation.z += 0.00005; // Adjust this value for different speeds

    renderer.render(scene, camera);
}

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('mousemove', onMouseMove, false);

function findObjectWithAction(obj) {
  
    if (obj.action) {
        return obj;
    } else if (obj.parent) {
        return findObjectWithAction(obj.parent);
    }
    return null;
}


function onMouseClick(event) {
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    console.log("mouse click");

    // Calculate objects intersected by the ray
    const intersects = raycaster.intersectObjects(scene.children, true);



    // Check if any of the intersected objects is one of our models
    for (let intersect of intersects) {

        const found = findObjectWithAction(intersect.object);
     
        if(found){
            console.log(found);
            found.action.reset().play();
            break;
        }
     

    }
}
window.addEventListener('click', onMouseClick, false);

function updateRayLine() {
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        // Update target point with the intersection point
        targetPoint.copy(intersects[0].point);
    } else {
        // Optionally, handle the case where there is no intersection
        // For example, setting a default distance
        // targetPoint.set(...); // Set to a default position
    }

    // Update the ray visualization
    let points = [camera.position, targetPoint];
    rayLine.geometry.setFromPoints(points);
    rayLine.geometry.verticesNeedUpdate = true; // Important, to update the line geometry
}


init();
animate();
