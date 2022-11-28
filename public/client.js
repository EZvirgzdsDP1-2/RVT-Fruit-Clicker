//IMPORT STATMETS
import * as THREE from 'three'; //THREE JS library
import { GUI } from './buildDatGui/dat.gui.module.js'; //Dat.gui library
import { GLTFLoader }  from './jsmThree/loaders/GLTFLoader.js'; //GLTF loader
import { FBXLoader }  from './jsmThree/loaders/FBXLoader.js'; //FBX loader
import { InteractionManager } from './threeInteractive/three.interactive.js';//three.interactive
import * as TWEEN from './TweenJsDist/tween.esm.js'; //Tween.js

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

//Geometry and mesh for cube to be clicked on
const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0,
    transparent: true,
});

const cubeTree = new THREE.Mesh(cubeGeometry, cubeMaterial);
cubeTree.scale.x = 2;
cubeTree.scale.y = 1.7;
cubeTree.scale.z = 2;

//Load manager
const manager = new THREE.LoadingManager();

//Texutre loader
const textureLoader = new THREE.TextureLoader();

//Initialize object loader
const fbxLoader = new FBXLoader(manager);
const gltfLoader = new GLTFLoader(manager);

//Init THREE JS scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

//Count variables. Important for the gameplay.
let numberCount = 0;

//Texture loader initializations
let appleTreeTextures = await textureLoader.loadAsync('./resourcesObjects/appleTree/textures/gltf_embedded_0.png'); 
appleTreeTextures.flipY = false;

//Object variables which will be used when playing the game. This part of the code could be optimized more and use a smarter method of assigning.
let appleTreeModel = await gltfLoader.loadAsync('./resourcesObjects/appleTree/source/appletree.glb', function(gltf) {

  gltf.name = 'appleTree';

  /*gltf.scene.traverse( (o) => {
    if(o.isMesh)
    {
      o.material.map = appleTreeTextures;
    }
  } );
  */
  return gltf;

}, undefined, function (error)
{
  console.error(error);
} ); 

let applesModels = [];

//Tween Js functionality
appleTreeModel.userData.isTweening = false; //Related to the animation the tree will do. Is true when animation is in progress and false when not

//Add funtion to GUI interface
const addFuntionToButton = {
  addNumber: function()
  {
    console.log("Times clicked: " + ++numberCount);
  }

};

//Set camera position
camera.position.z = 5;//3
camera.position.y = 1;
camera.rotation.x = -0.2;



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

//Loading manager functions

manager.onStart = function(url, itemsLoaded, itemsTotal)
{
  console.log('Started loading file: '+ url +'. \n Loaded '+ itemsLoaded +' of '+ itemsTotal +' files.');
};

manager.onLoad = function()
{
  console.log('Loading Complete');
};

manager.onError = function(url)
{
  console.log( 'There was an error loading ' + url );
};

//Function object loader

function addFbxObject(path, nameObj) //FBX file format
{
  fbxLoader.load(path, function(fbx) {

    fbx.name = nameObj;

    scene.add( fbx );

  }, undefined, function (error)
  {
    console.error(error);
  } );

}

function addGltfObject(path, nameObj) //GLTF and GLB format files
{
  gltfLoader.load(path, function(gltf) {

    gltf.name = nameObj;

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

  if(appleTreeModel.userData.isTweening) return;

  let tweenDeflate = new TWEEN.Tween(appleTreeModel.scene.scale).to({
    x:2.16,
    y:2.16,
    z:2.88

  }, 90).easing(TWEEN.Easing.Back.In).onStart( ()=>{
      cubeTree.userData.isTweening = true;
  });
 
  let tweenInflate = new TWEEN.Tween(appleTreeModel.scene.scale).to({
    x:2.7,
    y:2.7,
    z:3.6
  }, 50).onComplete( ()=>{
    appleTreeModel.userData.isTweening = false;
  });
  
  
  tweenDeflate.chain(tweenInflate);
  tweenDeflate.start();
}


//Dat.gui function
function addGUI()
{
  //gui.add(cubeTree.scale, 'x', 0, 3).name("Scale x axis"); //first experiment
  gui.add(addFuntionToButton, 'addNumber');
}

//Get objects and then assign them to variables
function assignVariablesObjects()
{
  
}

//Add test cube to scene, later to be replaced by in-game objects
function addTree()
{
  scene.add(cubeTree);

  interactionThree.add(cubeTree);

  scene.add(appleTreeModel.scene);

  /*appleTreeModel.scene.traverse ( (o) => {
    if(o.isMesh)
    {
      o.material.map = appleTreeTextures;
    }
  } );
  */

  
  
  cubeTree.add(appleTreeModel.scene);
  //'./resourcesObjects/apple/source/apple.fbx'

  //Adjusting location of apple tree
  cubeTree.position.set(0,0.3,0);

  appleTreeModel.scene.scale.x = 2.7;
  appleTreeModel.scene.scale.y = 2.7;
  appleTreeModel.scene.scale.z = 3.6;

  appleTreeModel.scene.position.x = 0;
  appleTreeModel.scene.position.y = 0;
  appleTreeModel.scene.position.z = -1;
}

//Animate the scene
function animate()
{
    requestAnimationFrame(animate);
    treeSpinSlow();

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
  assignVariablesObjects(); // Experimental
  animate();
}

init();