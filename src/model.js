import { OrbitControls } from "./jsm/OrbitControls.js";


let glbposes = {}
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
    state.renderer.shadowMap.enabled = true;

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
    
    const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ),new THREE.MeshPhongMaterial( { color: 0xe6e6e6, depthWrite: true} ) );
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
loader.load('/model/gltf/bot.glb', ( gltf ) => {
    state.model = gltf.scene
    state.model.position.set(50,0,0);
    state.model.receiveShadow = true;

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

const findAngleX = (a,b) => {
    let defX =  a.x - b.x;
    let defY =  a.z - b.z;
    let angle = Math.atan2(defY, defX);
    
    return angle;
}


const reallocationPose = (poses) => {
    let w = 0.7
    state.model.position.x = (poses.head.x -100)/100
    console.log(glbposes, poses)

    glbposes.mixamorigRightArm.rotation.x = poses.rightShoulder.visibility > w ? - findAngle2d(poses.rightShoulder, poses.rightElbow) : glbposes.mixamorigRightArm.rotation.x
    glbposes.mixamorigLeftArm.rotation.x = poses.leftShoulder.visibility > w ?  findAngle2d(poses.leftShoulder, poses.leftElbow) + Math.PI : glbposes.mixamorigLeftArm.rotation.x

    glbposes.mixamorigRightForeArm.rotation.x = poses.rightWrist.visibility > w ? - (findAngle2d(poses.rightWrist, poses.rightElbow) + (Math.PI)) + findAngle2d(poses.rightShoulder, poses.rightElbow) : glbposes.mixamorigRightForeArm.rotation.x 
    glbposes.mixamorigLeftForeArm.rotation.x = poses.leftWrist.visibility > w ? (findAngle2d(poses.leftWrist, poses.leftElbow) + (Math.PI)) - (findAngle2d(poses.leftShoulder, poses.leftElbow)) : glbposes.mixamorigLeftForeArm.rotation.x

    glbposes.mixamorigRightUpLeg.rotation.z = poses.rightHip.visibility > w ? - (findAngle2d(poses.rightHip, poses.rightKnee) + (Math.PI / 2) + (Math.PI)) : glbposes.mixamorigRightUpLeg.rotation.z
    glbposes.mixamorigLeftUpLeg.rotation.z = poses.leftHip.visibility > w ? - (findAngle2d(poses.leftHip, poses.leftKnee) + (Math.PI / 2) + (Math.PI)) : glbposes.mixamorigLeftUpLeg.rotation.z

    glbposes.mixamorigRightLeg.rotation.z = poses.rightKnee.visibility > w ? - (findAngle2d(poses.rightKnee, poses.rightAnkle)) + findAngle2d(poses.rightHip, poses.rightKnee) : glbposes.mixamorigRightLeg.rotation.z
    glbposes.mixamorigLeftLeg.rotation.z = poses.leftKnee.visibility > w ? - (findAngle2d(poses.leftKnee, poses.leftAnkle)) + findAngle2d(poses.leftHip, poses.leftKnee) : glbposes.mixamorigLeftLeg.rotation.z

}




export { reallocationPose }