import { OrbitControls } from "./jsm/OrbitControls.js";


let glbposes = {}
let model;
let state = {
    scene: undefined,
    camera: undefined,
    renderer: undefined,
    controls: undefined,
    model: undefined
}

const init = () => {
    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color( 0xa0a0a0 );
    state.scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );
    
    state.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    state.camera.position.set( 0, 2, 3 );

    state.renderer = new THREE.WebGLRenderer();
    state.renderer.setSize( window.innerWidth, window.innerHeight );
    document.querySelector("#model").appendChild( state.renderer.domElement );
    
    const dirLight = new THREE.DirectionalLight( 0xf7e5df );
    dirLight.position.set( 3, 1000, 2500 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.06;
    dirLight.shadow.camera.far = 4000;
    state.scene.add(dirLight);
    
    const hemiLight = new THREE.HemisphereLight( 0x707070, 0x444444 );
    hemiLight.position.set( 0, 120, 0 );
    state.scene.add(hemiLight);
    
    const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ),new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: true} ) );
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    state.scene.add(mesh);
    
    
    state.controls = new OrbitControls( state.camera, state.renderer.domElement );
    function animate() {
        requestAnimationFrame( animate );
        state.controls.update();
    
        state.renderer.render( state.scene, state.camera );
    }
    animate();
    
}


init()

const loader = new THREE.GLTFLoader();
loader.load('/model/gltf/GL.glb', ( gltf ) => {
    state.model = gltf.scene
    state.model.position.set(50,0,0);
    state.scene.add( state.model );

    state.model.traverse( function ( object ) {
        if (object.type == 'Bone') {
            glbposes[object.name] = object
        }
        if ( object.isMesh ) object.castShadow = true;
    });

    let box = new THREE.Box3().setFromObject( state.model );
    state.model.position.set(0, -box.getSize().y/2 +0.5, 0);
    
    let helper = new THREE.SkeletonHelper( state.model );
    helper.material.linewidth = 5;
    helper.visible = true;
    state.scene.add(helper);
});



const findAngle2d = (a,b) => {
    let defX =  a.x - b.x;
    let defY =  a.y - b.y;
    let angle = Math.atan2(defY, defX);
    
    return angle;
}



const reallocationPose = (poses) => {
    state.model.position.x = (poses.head.x -100)/100
    //glbposes.mixamorigHead.position.y = -poses.head.y

    glbposes.mixamorigRightShoulder.rotation.y = - findAngle2d(poses.rightShoulder, poses.rightElbow)
    glbposes.mixamorigLeftShoulder.rotation.y = - findAngle2d(poses.leftShoulder, poses.leftElbow) + Math.PI

    glbposes.mixamorigRightForeArm.rotation.x = - (findAngle2d(poses.rightWrist, poses.rightElbow) + (Math.PI)) + findAngle2d(poses.rightShoulder, poses.rightElbow)
    glbposes.mixamorigLeftForeArm.rotation.x = (findAngle2d(poses.leftWrist, poses.leftElbow) + (Math.PI)) - (findAngle2d(poses.leftShoulder, poses.leftElbow))

}




export { reallocationPose }