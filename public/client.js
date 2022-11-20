//IMPORT STATMETS
import * as THREE from 'three'; //THREE JS library
import { GUI } from './buildDatGui/dat.gui.module.js'; //Dat.gui library
import { GLTFLoader }  from './jsmThree/loaders/GLTFLoader.js'; //GLTF loader
import { FBXLoader }  from './jsmThree/loaders/FBXLoader.js'; //FBX loader
import { InteractionManager } from './threeInteractive/three.interactive.js';//three.interactive
import * as TWEEN from './TweenJsDist/tween.esm.js'; //Tween.js  ,"tween": "./TweenJsDist/tween.esm.js" { Tween }

//GUI change text to different
GUI.TEXT_OPEN = "Open fruit upgrade";
GUI.TEXT_CLOSED = "Close fruit upgrade";

const getDatGuiContainer = document.getElementById("datguiContainer");

//Init Dat.gui
const gui = new GUI( {  resizable : false,
                        autoplace: false,
                        hideable: false,
                        width: 400  } );

getDatGuiContainer.appendChild(gui.domElement);


//Initialize object loader
const fbxLoader = new FBXLoader();
const gltfLoader = new GLTFLoader();

//Init THREE JS scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

//Experimental, delete later when not needed
let numberCount = 0;

//Object variables which will be used when playing the game
let appleTree; //= new THREE.Object3D()

//Add funtion to GUI interface
const addFuntionToButton = {
  addNumber: function()
  {
    console.log("Times clicked: " + ++numberCount);
  }

};

//Set camera position
camera.position.z = 3;
camera.position.y = 1;
camera.rotation.x = -0.2;

//Test geometry and mesh for cube (To be replaced by game objects)
const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0.1,
    transparent: true,
});

const cubeTree = new THREE.Mesh(cubeGeometry, cubeMaterial);

cubeTree.userData.isTweening = false; //Related to the animation the tree will do.
//Is true when animation is in progress and false when not

//Create renderer to render objects in the scene
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Initialize Three.Interactive
const interactionThree = new InteractionManager(renderer, camera, renderer.domElement);

//Window resize event listner
window.addEventListener('resize',
    () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.render(scene, camera);
    },
    false
)

//Function object loader

function addFbxObject(path, name) //FBX file format
{
  fbxLoader.load(path, function(fbx) {

    let objectToAdd = new THREE.Object3D();

    objectToAdd = fbx;

    scene.add( fbx );

  }, undefined, function (error)
  {
    console.error(error);
  } );

}

function addGltfObject(path, name) //GLTF and GLB format files
{
  gltfLoader.load(path, function(gltf) {

    //let objectToAdd = new THREE.Object3D();

    //objectToAdd = gltf;

    scene.add( gltf.scene );

  }, undefined, function (error)
  {
    console.error(error);
  } );
}

//Decrease and increase cube size (later tree size)
function clickAnimationTree()
{
  console.log("Times clicked: " + ++numberCount);

  if(cubeTree.userData.isTweening) return;

  let tweenDeflate = new TWEEN.Tween(cubeTree.scale).to({
    x:0.8,
    y:0.8,
    z:0.8

  }, 90).easing(TWEEN.Easing.Back.In).onStart( ()=>{
      cubeTree.userData.isTweening = true;
  });
 
  let tweenInflate = new TWEEN.Tween(cubeTree.scale).to({
    x:1,
    y:1,
    z:1
  }, 50).onComplete( ()=>{
    cubeTree.userData.isTweening = false;
  });
  
  
  tweenDeflate.chain(tweenInflate);
  tweenDeflate.start();
}


//Dat.gui function
function addGUI()
{
  gui.add(cubeTree.scale, 'x', 0, 3).name("Scale x axis"); //first experiment
  gui.add(addFuntionToButton, 'addNumber');
}

//Add test cube to scene, later to be replaced by in-game objects
function addTree()
{
  scene.add(cubeTree);

  interactionThree.add(cubeTree);

  appleTree; 
  
  addGltfObject('./resourcesObjects/appleTree/source/appletree.glb');

  //scene.add(appleTree.scene);
  //'./resourcesObjects/apple/source/apple.fbx'

  //appleTree.scale.x = 3;
  //appleTree.scale.y = 3;
  //appleTree.scale.z = 3;
}

//Animate the scene
function animate()
{
    requestAnimationFrame(animate);
    //cubeSpinSlow();

    TWEEN.update();
    interactionThree.update();
    renderer.render(scene, camera);
}

//Cube spin animation, later to be replaced by spinning tree
function treeSpinSlow()
{
  cubeTree.rotation.y += 0.01;
}

//Add counting event to object
cubeTree.addEventListener("click", (Event) =>{
  //console.log("Times clicked: " + ++numberCount);
  
  clickAnimationTree();

});

function init()
{
  scene.background = new THREE.Color(0xD9D9D9);
  
  addTree();
  addGUI();
  animate();
}

init();