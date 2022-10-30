//IMPORT STATMETS
import * as THREE from 'three'; //THREE JS library
import { GUI } from './buildDatGui/dat.gui.module.js'; //Dat.gui library
import { GLTFLoader }  from './jsmThree/loaders/GLTFLoader.js'; //GLTF loader
import { FBXLoader }  from './jsmThree/loaders/FBXLoader.js'; //FBX loader

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
});

const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

//Create renderer to render things in scene
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



//Window resize event listner
window.addEventListener(
    'resize',
    () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        render()
    },
    false
)

//Function object loader

function addFbxObject(path) //FBX file format
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

function addGltfObject(path) //GLTF and GLB format files
{

  gltfLoader.load(path, function(gltf) {

    let objectToAdd = new THREE.Object3D();

    objectToAdd = gltf;

    scene.add( gltf );

  }, undefined, function (error)
  {
    console.error(error);
  } );

}


//Dat.gui function
function addGUI()
{
  gui.add(cube.scale, 'x', 0, 3).name("Scale x axis"); //first experiment
  gui.add(addFuntionToButton, 'addNumber');
}

//Add test cube to scene, later to be replaced by in-game objects
function addTree()
{
  scene.add(cube);

  //'./resourcesObjects/apple/source/apple.fbx'

}

//Animate the scene
function animate()
{
    requestAnimationFrame(animate);
    //cubeSpinSlow();

    renderer.render(scene, camera);
}

//Cube spin animation, later to be replaced by spinning tree
function cubeSpinSlow()
{
  cube.rotation.y += 0.01;
}

function init()
{
  scene.background = new THREE.Color(0xD9D9D9);
  
  addTree();
  addGUI();
  animate()
}

init();