import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer;
var controls;


init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight,45,30000);
    camera.position.set(-900,-200,-900);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
     // controls
    controls = new OrbitControls (camera, renderer.domElement);
    controls.listenToKeyEvents( window ); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.maxPolarAngle = Math.PI / 2;

    //load in the six skybox textures
    let materialArray = [];
    let texture_ft = new THREE.TextureLoader().load( 'skybox_wasteland/wasteland_ft.jpg');
    let texture_bk = new THREE.TextureLoader().load( 'skybox_wasteland/wasteland_bk.jpg');
    let texture_up = new THREE.TextureLoader().load( 'skybox_wasteland/wasteland_up.jpg');
    let texture_dn = new THREE.TextureLoader().load( 'skybox_wasteland/wasteland_dn.jpg');
    let texture_rt = new THREE.TextureLoader().load( 'skybox_wasteland/wasteland_rt.jpg');
    let texture_lf = new THREE.TextureLoader().load( 'skybox_wasteland/wasteland_lf.jpg');

    //organize the textures into material array
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
    materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));

    //set the materials to render only on the back side of the skybox
    for (let i = 0; i < 6; i++)
        materialArray[i].side = THREE.BackSide;
    let skyboxGeo = new THREE.BoxGeometry( 10000, 10000, 10000);
    let skybox = new THREE.Mesh( skyboxGeo, materialArray );
    
    //add skybox to the scene
    scene.add( skybox );  
}

function animate() {
    renderer.render(scene,camera);
    requestAnimationFrame(animate);
}

