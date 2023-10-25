let camera, scene, renderer, geometry, material, cube;

init();
animate();

function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xcccccc );
    scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;

    // controls

//    controls = new OrbitControls( camera, renderer.domElement );
//    controls.listenToKeyEvents( window ); // optional
//
//    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
//
//    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
//    controls.dampingFactor = 0.05;
//
//    controls.screenSpacePanning = false;
//
//    controls.minDistance = 100;
//    controls.maxDistance = 500;
//
//    controls.maxPolarAngle = Math.PI / 2;

    // world

    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 5;

    // lights

    const dirLight1 = new THREE.DirectionalLight( 0xffffff, 3 );
    dirLight1.position.set( 1, 1, 1 );
    scene.add( dirLight1 );

    const dirLight2 = new THREE.DirectionalLight( 0x002288, 3 );
    dirLight2.position.set( - 1, - 1, - 1 );
    scene.add( dirLight2 );

    const ambientLight = new THREE.AmbientLight( 0x555555 );
    scene.add( ambientLight );

    //

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );
    
    cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

    renderer.render( scene, camera );

}