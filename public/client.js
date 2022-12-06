//IMPORT STATMETS
import * as THREE from 'three'; //THREE JS library
import { GUI } from './buildDatGui/dat.gui.module.js'; //Dat.gui library
import { GLTFLoader }  from './jsmThree/loaders/GLTFLoader.js'; //GLTF loader
import { FBXLoader }  from './jsmThree/loaders/FBXLoader.js'; //FBX loader
import { OBJLoader } from './jsmThree/loaders/OBJLoader.js' //OBJLoader
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
const cubeMaterial = new THREE.MeshBasicMaterial({ //For cubeTree
    color: 0x000000, //0x000000
    opacity: 0,
    transparent: true,
});


const cubeTree = new THREE.Mesh(cubeGeometry, cubeMaterial); //Cube for appleTree clicking model
cubeTree.scale.x = 2;
cubeTree.scale.y = 1.7;
cubeTree.scale.z = 2;

//Load manager
const loadingManager = new THREE.LoadingManager();

//Loading manager functions

loadingManager.onStart = function(url, itemsLoaded, itemsTotal)
{
  console.log('Started loading file: '+ url +'. \n Loaded '+ itemsLoaded +' of '+ itemsTotal +' files.');
};

loadingManager.onLoad = function()
{
  console.log('Loading Complete');
};

loadingManager.onError = function(url)
{
  console.log( 'There was an error loading ' + url );
};

//Texutre loader
const textureLoader = new THREE.TextureLoader();

//Initialize object loader
const fbxLoader = new FBXLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);
const objLoader = new OBJLoader(loadingManager);

//Init THREE JS scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);

//Directional light + adding to scene
const sceneDirectionalLight = new THREE.DirectionalLight(0xffffff, 4);
scene.add(sceneDirectionalLight);

//Count variables. Important for the gameplay.
let numberCount = 0;

//Texture loader initializations
//let appleTreeTextures = await textureLoader.loadAsync('./resourcesObjects/appleTree/textures/gltf_embedded_0.png'); 
//appleTreeTextures.flipY = false;
const materialLoader = new THREE.MaterialLoader();

//let appleTextures = await textureLoader.loadAsync('./resourcesObjects/apple/textures/Apple_BaseColor.png');
let appleTextures = await textureLoader.loadAsync('./resourcesObjects/appleLowerPoly/textures/Gradient_UV_003.png'); //Old one is 'apple' directory
let pearTextures = await textureLoader.loadAsync('./resourcesObjects/pear/textures/Pear_Geo_initialShadingGroup_BaseColor.png'); 

//Object variables which will be used when playing the game. This part of the code could be optimized more and use a smarter method of assigning.
let appleTreeModel = await gltfLoader.loadAsync('./resourcesObjects/appleTree/source/appleTree.glb', function(gltf) 
{
  gltf.name = 'appleTree';
  return gltf;

}, undefined, function (error)
{
  console.error(error);
} ); 

let appleModel = await fbxLoader.loadAsync('./resourcesObjects/appleLowerPoly/source/Apple_001.fbx', function(fbx) //Adds apple model to 'applesModel' './resourcesObjects/apple/source/Apple.fbx'
{
  fbx.name = 'appleModel';
  return fbx;

}, undefined, function (error)
{
  console.error(error);
} );

let lemonModel = await gltfLoader.loadAsync('./resourcesObjects/lemon/source/lemon.glb', function(gltf) //Add two lemon models to array 'lemonModels' 
{   
  gltf.name = 'lemonModel';
  return gltf;

}, undefined, function (error)
{
  console.error(error);
} ); 

let pearModel = await objLoader.loadAsync('./resourcesObjects/pear/source/LowpolyPear.obj', function(obj) //Add two pears to array 'pearModels'
{
  obj.name = 'pearModel';
  return obj;

}, undefined, function (error)
{
  console.error(error);
} );

//Tween Js functionality
appleTreeModel.userData.isTweening = false; //Related to the animation the tree will do. Is true when animation is in progress and false when not
appleModel.userData.isTweening = false;


//Add funtion to GUI interface
const addFuntionToButton = {
  addNumber: function()
  {
    console.log("Times clicked: " + ++numberCount);
  }
};

//Set camera position
camera.position.z = 5;
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
  //gui.add(pearModel.material, 'opacity', 0, 1).name("Scale opacity"); //first experiment
  //gui.add(cubeApple.position, 'z', 0, 3).name("z coordinates");
}


//Add test cube to scene, later to be replaced by in-game objects
function addTree()
{
  scene.add(cubeTree);

  interactionThree.add(cubeTree);

  scene.add(appleTreeModel.scene);

  
  /* Can delete, this texture apply function doesnt work
  appleTreeModel.scene.traverse ( (o) => {
    if(o.isMesh)
    {
      o.material.map = appleTreeTextures;
    }
  } );
  
  appleTreeModel.scene.traverse(  function(child)
  {
    if(child.isMesh)
    {
      if(child.material.map)
      {
        child.material.map = appleTreeTextures;

        child.material.map.needsUpdate = true;
      }
    }
  });
  

  pearModel.traverse ( (o) => { //Testing opacity
    if(o.isMesh)
    {
      o.material.transparent = true;
      o.material.opacity = 0.5;
    }
  } );
  */

  cubeTree.add(appleTreeModel.scene);


  //Adjusting location of apple tree
  cubeTree.position.set(0,0.3,0);

  appleTreeModel.scene.scale.x = 2.7;//2.7  0.01  For appleTreeThreeGLTF
  appleTreeModel.scene.scale.y = 2.7;//2.7  0.005
  appleTreeModel.scene.scale.z = 3.6;//3.6  0.01 

  appleTreeModel.scene.position.x = 0;
  appleTreeModel.scene.position.y = 0;
  appleTreeModel.scene.position.z = -1;

  //Temporary apple model test
  appleModel.scale.x = 0.004;
  appleModel.scale.y = 0.004;
  appleModel.scale.z = 0.004;

  pearModel.scale.x = 0.01;
  pearModel.scale.y = 0.01;
  pearModel.scale.z = 0.01;

  appleModel.traverse ( (o) => {
    if(o.isMesh)
    {
      o.material.map = appleTextures;
    }
  } );

  pearModel.traverse ( (o) => { //With opacity
    if(o.isMesh)
    {
      o.material.map = pearTextures;
      o.material.transparent = true;
      o.material.opacity = 0;
    }
  } );

  scene.add(pearModel);
  pearModel.position.z = 4;
  
  scene.add(appleModel);
}

//Animate the scene
function animate()
{
    requestAnimationFrame(animate);
    treeSpinSlow();
    DELETETHIS();

    TWEEN.update();
    interactionThree.update();
    renderer.render(scene, camera);
}

//Cube spin animation, later to be replaced by spinning tree
function treeSpinSlow()
{
  cubeTree.rotation.y += 0.01;
}

let pearOpacityCounter = -200;
function DELETETHIS() //Opacity function in which the imported object opacity can be changed
{
  /*if(pearModel.opacity != 1)
  {
    
    pearModel.traverse ( (o) => { //With opacity
      if(o.isMesh)
      {
        o.material.opacity += 0.02;
        o.material.needsUpdate = true;
      }
    } );
  }
  else
  {
    console.log("Works?")

    pearModel.traverse ( (o) => { //With opacity
      if(o.isMesh)
      {
        o.material.opacity -= 0.02;
        o.material.needsUpdate = true;
      }
    } );
  }*/
  if(pearOpacityCounter < 0)
  {
    pearModel.traverse ( (o) => { //With opacity
      if(o.isMesh)
      {
        o.material.opacity += 0.005;
        o.material.needsUpdate = true;
      }
    } );
    
    ++pearOpacityCounter;
  }
  else if(pearOpacityCounter >= 0)
  {
    pearModel.traverse ( (o) => { //With opacity
      if(o.isMesh)
      {
        o.material.opacity -= 0.005;
        o.material.needsUpdate = true;
      }
    } );
    
    ++pearOpacityCounter;
    if(pearOpacityCounter == 200) pearOpacityCounter = -200;
  }
}

//Add counting event to object
cubeTree.addEventListener("click", (Event) =>{
  
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