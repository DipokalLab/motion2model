import { OrbitControls } from "./jsm/OrbitControls.js";

const scene = new THREE.Scene();
const clock = new THREE.Clock();


scene.background = new THREE.Color( 0xa0a0a0 );
scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.querySelector("#model").appendChild( renderer.domElement );


const dirLight = new THREE.DirectionalLight( 0xf7e5df );
dirLight.position.set( 3, 1000, 2500 );
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = - 2;
dirLight.shadow.camera.left = - 2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.06;
dirLight.shadow.camera.far = 4000;
scene.add(dirLight);

const hemiLight = new THREE.HemisphereLight( 0x707070, 0x444444 );
hemiLight.position.set( 0, 120, 0 );
scene.add(hemiLight);

const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ),new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: true} ) );
mesh.rotation.x = - Math.PI / 2;
mesh.receiveShadow = true;
scene.add(mesh);


camera.position.set( 0, 2, 3 );

const controls = new OrbitControls( camera, renderer.domElement );


const loader = new THREE.GLTFLoader();
let glbposes = {}
let model;

// Load a glTF resource
loader.load('/model/gltf/GL.glb', ( gltf ) => {

    model = gltf.scene
    model.position.set(50,0,0);
    scene.add( model );



    model.traverse( function ( object ) {
        if (object.type == 'Bone') {
            glbposes[object.name] = object

        }
        if ( object.isMesh ) object.castShadow = true;
    });

    //glbobject.mixamorigHead.position.x = 10

    var box = new THREE.Box3().setFromObject( model );
    model.position.set(0, -box.getSize().y/2 +0.5, 0);
    
    let helper = new THREE.SkeletonHelper( model );
    helper.material.linewidth = 5;
    helper.visible = true;
    scene.add(helper);
});

function reallocationPose(poses) {
    console.log(glbposes)
    model.position.x = (poses.head.x -100)/100
    //glbposes.mixamorigHead.position.y = -poses.head.y

    glbposes.mixamorigLeftShoulder.position.x = (poses.leftShoulder.x - 100)
    glbposes.mixamorigLeftShoulder.position.y = -poses.leftShoulder.y + 200

    glbposes.mixamorigRightShoulder.position.x = (poses.rightShoulder.x - 100 )
    glbposes.mixamorigRightShoulder.position.y = -poses.rightShoulder.y + 200

    glbposes.mixamorigLeftHand.position.z = poses.leftWrist.y - 200
    //glbposes.mixamorigLeftHand.position.y = poses.leftWrist.x

    glbposes.mixamorigRightHand.position.z = poses.rightWrist.y - 200
    //glbposes.mixamorigRightHand.position.y = -poses.rightWrist.x


    

}


function animate() {
    requestAnimationFrame( animate );
    controls.update();

    renderer.render( scene, camera );

}
animate();

export { reallocationPose }