//IMPORT STATMETS
import * as THREE from 'three'; //THREE JS library
import { GUI } from './buildDatGui/dat.gui.module.js'; //Dat.gui library
import { GLTFLoader }  from './jsmThree/loaders/GLTFLoader.js'; //GLTF loader
import { FBXLoader }  from './jsmThree/loaders/FBXLoader.js'; //FBX loader
import { OBJLoader } from './jsmThree/loaders/OBJLoader.js' //OBJLoader
import { InteractionManager } from './threeInteractive/three.interactive.js';//three.interactive
import { gsap } from 'gsap';
import * as TWEEN from './TweenJsDist/tween.esm.js'; //Tween.js

//GUI change text to different
//GUI.TEXT_OPEN = "Open fruit upgrade";
//GUI.TEXT_CLOSED = "Close fruit upgrade";

//const getDatGuiContainer = document.getElementById("datguiContainer");

//Init Dat.gui
/*const gui = new GUI( {  resizable : false,
                        autoplace: false,
                        hideable: false,
                        width: 400  } );*/

//getDatGuiContainer.appendChild(gui.domElement);  //Debug mode menu. Enables DAT.GUI

//RNG functions
function getRandomNumberRange(min, max)
{
  return Math.random() * (max - min) + min;
}

//Clicks per minute calculate function 
let clicksPerMinute = 0;

let click = 0;
let clicks = 0;

function calculateClicksPerMinute() {
    let seconds = new Date().getTime();

    clicks = ((1 / ((seconds - click) / 1000)) * 60);
    click = seconds;
    clicksPerMinute = Math.floor(clicks);
};

let dynamicFruitCooldown = (clicksPerMinute ** -2) * (10 ** 5); //This may be only temporary, because GSAP doesn't support dynamic animation number update

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

//Plane geometry for the ground
const planeGeometry = new THREE.PlaneGeometry(20,2,20);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xA0A0A0
});

const planeGround = new THREE.Mesh(planeGeometry, planeMaterial);
planeGround.position.set(0, -0.3, 0);
planeGround.scale.set(6,3,0);
planeGround.rotatex = -90;

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
const sceneDirectionalLight = new THREE.DirectionalLight(0xffffff, 4); //Light color and the light brightness
sceneDirectionalLight.position.set(2,-2,2); //Need to play with this number more to get it right

scene.add(sceneDirectionalLight); //Directional light added to scene so objects can be seen

//Count variables. Important for the gameplay.
let fruitCount = 0;
let clickValue = 1;

let farmerCount = 0;
let farmerValue = 10;
let farmerFruitPerSecond = 0;

let dollarCount = 0;
let dollarValueToFruit = 8;

let fruitPerSecond = 0; //Must add more

document.getElementById('fruitCounter').innerHTML = 'Fruit count: ' + fruitCount; //Updates HTML DOM with current apple count WILL UNCOMMENT
document.getElementById('dollarCounter').innerHTML = 'Money count: ' + dollarCount + '$'; //Updates HTML DOM with current apple count WILL UNCOMMENT

//Texture loader initializations
let appleTextures = await textureLoader.loadAsync('./resourcesObjects/appleLowerPoly/textures/Gradient_UV_003.png'); //Old one is 'apple' directory
let pearTextures = await textureLoader.loadAsync('./resourcesObjects/pear/textures/Pear_Geo_initialShadingGroup_BaseColor.png'); 
//let lemonTextures = await textureLoader.loadAsync('./resourcesObjects/lemon/textures/gltf_embedded_0.png');

//Object variables which will be used when playing the game. This part of the code could be optimized more and use a smarter method of assigning.
let appleTreeModel = await gltfLoader.loadAsync('./resourcesObjects/appleTree/source/appleTree.glb', function(gltf) 
{
  gltf.name = 'appleTree';
  return gltf;

}, undefined, function (error)
{
  console.error(error);
} ); 

let appleModel = await fbxLoader.loadAsync('./resourcesObjects/appleLowerPoly/source/Apple_001.fbx', function(fbx) //Adds apple model to 'applesModel'
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

let peachModel = await fbxLoader.loadAsync('./resourcesObjects/peach/source/Peach.fbx', function(fbx) //Adds a peach model to 'peachModel'
{
  fbx.name = 'peachModel';
  return fbx;

}, undefined, function (error)
{
  console.error(error);
} );

let grassModel = await gltfLoader.loadAsync('./resourcesObjects/grass/sketch.gltf', function(gltf) //Add two lemon models to array 'lemonModels' 
{   
  gltf.name = 'grassModel';
  return gltf;

}, undefined, function (error)
{
  console.error(error);
} ); 

//Update HTML DOM to update the values
function reloadAll()
{
  document.getElementById('fruitCounter').innerHTML = 'Fruit count: ' + fruitCount;
  document.getElementById('dollarCounter').innerHTML = 'Money count: ' + dollarCount + '$';
  document.getElementById('buyFarmer').innerHTML = 'Buy Farmers: ' + farmerValue + '$'; 
  document.getElementById('fruitPerSecond').innerHTML = 'Current fruit per second: '+ farmerFruitPerSecond +' fruit/sec';
  document.getElementById('farmerCount').innerHTML = 'Farmer Count: ' + farmerCount+ ', '+ farmerFruitPerSecond +' Fruit/Sec';
} 

//Functions for getting game values loaded.

function getGameValues()
{
  let tempObject = JSON.parse(localStorage.getItem('GameData'));
  
  fruitCount = parseInt(tempObject["FruitCount"]); //Fix this thing.
  dollarCount = parseInt(tempObject["DollarCount"]);
  clickValue = parseInt(tempObject["ClickValue"]);
  farmerCount = parseInt(tempObject["FarmerCount"]);
  farmerValue = parseInt(tempObject["FarmerCount"]);;
  farmerFruitPerSecond = parseInt(tempObject["FarmerCount"]);;
  dollarValueToFruit = parseInt(tempObject["FarmerCount"]);;
  fruitPerSecond = parseInt(tempObject["FarmerCount"]);

  reloadAll();
}

//Event listeners for drawing side menu
document.getElementById('openMenuButton').addEventListener('click', (event) =>{ //Open the side menu
  
  document.getElementById("sideMenu").style.width = "30%";
  document.body.style.backgroundColor = "rgba(0,0,0,0.4)";

});

document.getElementById('closeMenuButton').addEventListener('click', (event) =>{ //Close the side menu
  
  document.getElementById("sideMenu").style.width = "0";
  document.body.style.backgroundColor = "white";

});

document.getElementById('saveGameData').addEventListener('click', (event) =>{ //Save the game data

  let gameDataObject = {'FruitCount': fruitCount, 'ClickValue': clickValue, 'DollarCount': dollarCount, 'FarmerCount': farmerCount, 'FarmerValue': farmerValue,
   'FarmerPerSecond': farmerFruitPerSecond, 'FruitPerSecond': fruitPerSecond, 'DollarFruitValue':dollarValueToFruit};

  localStorage.setItem('GameData', JSON.stringify(gameDataObject) );

  confirm('Game data has been saved.')
});

document.getElementById('resetGameData').addEventListener('click', (event) =>{ //Save game data

  if(confirm('Are you sure you want to reset the game data? This is unreverseable.'))
  {
    /*fruitCount = 0;
    clickValue = 1;
    farmerCount = 0;
    farmerValue = 0
    farmerFruitPerSecond = 0;
    dollarCount = 0;
    dollarValueToFruit = 0;
    fruitPerSecond = 0;

    let gameDataObject = {'FruitCount': fruitCount, 'ClickValue': clickValue, 'DollarCount': dollarCount};*/

    localStorage.removeItem('GameData');

    alert('Game data has been reset')
    location.reload();
  }
});

//Game button event listeners
document.getElementById('fruitToDollars').addEventListener('click', (event) =>{

  let tempDollarCount = Math.floor(fruitCount / dollarValueToFruit);

  dollarCount += tempDollarCount; 

  fruitCount -= parseInt( tempDollarCount * dollarValueToFruit );

  document.getElementById('fruitCounter').innerHTML = 'Fruit count: ' + fruitCount;
  document.getElementById('dollarCounter').innerHTML = 'Money count: ' + dollarCount + '$';

});

document.getElementById('buyFarmer').addEventListener('click', (event) =>{
  
  if(dollarCount >= farmerValue)
  {
    let tempFarmerCount = parseInt( Math.floor(dollarCount / farmerValue) );

    farmerCount += tempFarmerCount; 

    dollarCount -= tempFarmerCount * farmerValue;

    farmerValue = Math.ceil( farmerValue + (farmerCount * 2.5) );

    farmerFruitPerSecond = 2 * parseInt(farmerCount);

    console.log('Dollar count is '+ dollarCount);

    document.getElementById('buyFarmer').innerHTML = 'Buy Farmers: ' + farmerValue + '$'; 
    document.getElementById('fruitPerSecond').innerHTML = 'Current fruit per second: '+ farmerFruitPerSecond +' fruit/sec';
    document.getElementById('farmerCount').innerHTML = 'Farmer Count: ' + farmerCount+ ', '+ farmerFruitPerSecond +' Fruit/Sec';
    document.getElementById('dollarCounter').innerHTML = 'Money count: ' + dollarCount + '$';
    
  }
});

//Automatic fruit incrementer
function addFruitPerSecond() //Uncomplete method
{
  fruitPerSecond = farmerFruitPerSecond; //Will add more obejts that fruit per second;

  fruitCount += fruitPerSecond;

  document.getElementById('fruitCounter').innerHTML = 'Fruit count: ' + fruitCount;
  document.getElementById('fruitPerSecond').innerHTML = 'Current fruit per second: '+ farmerFruitPerSecond +' fruit/sec';
}

setInterval(addFruitPerSecond, 1000);

//Tween Js functionality
appleTreeModel.userData.isTweening = false; //Related to the animation the tree will do. Is true when animation is in progress and false when not
appleModel.userData.isTweening = false;

let peachOpacityVariable;
let lemonOpacityVariable;
let pearOpacityVariable;
let appleOpacityVariable;

//GSAP variables for animations. Mostly for fruit falling from the tree
const gsapPear = gsap.timeline();
const gsapApple = gsap.timeline();
const gsapPeach = gsap.timeline();
const gsapLemon= gsap.timeline();


//Add funtion to GUI interface  NO NEED FOR DATGUI
/*const addFuntionToButton = {
  addNumber: function()
  {
    console.log('The number generated: ' + getRandomNumberRange(0,0.5).toFixed(2));
  }
};*/

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
  fruitCount += clickValue;

  document.getElementById('fruitCounter').innerHTML = 'Fruit count: ' + fruitCount;  

  calculateClicksPerMinute();
  console.log('Current clicks per minute: '+ clicksPerMinute);

  moveSlowlyPear();//Temporary, will add more fruit
  moveSlowlyApple();
  moveSlowlyLemon();
  moveSlowlyPeach();

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
/*function addGUI()
{
  //gui.add(cubeTree.scale, 'x', 0, 3).name("Scale x axis"); //first experiment
  gui.add(addFuntionToButton, 'addNumber');
  gui.add(cubeTree.material, 'opacity', 0, 1).name("Scale opacity"); //first experiment
  gui.add(pearModel.position, 'y', 0, 3).name("y coordinates");
}*/


//Add test cube to scene, later to be replaced by in-game objects
function addTree()
{
  //scene.add(planeGround); //Seeing if the ground looks good. Can adjust later for testing. Ground can be used as for shadow casting 
  cubeTree.position.set(0,0.3,0);
  scene.add(cubeTree);

  interactionThree.add(cubeTree);

  scene.add(appleTreeModel.scene);

  cubeTree.add(appleTreeModel.scene);

  scene.add(grassModel.scene);//Grass model variant No1 UNCOMMENT THIS LATER OR FIND A BETTER TEXTURE

  grassModel.scene.scale.x = 4;
  grassModel.scene.scale.z = 3.6;
  grassModel.scene.scale.y = 0.7;

  grassModel.scene.position.x = 0.7;
  grassModel.scene.position.z = -1.3;
  grassModel.scene.position.y = -1;

  grassModel.scene.rotation.y = -0.01;

  //Adjusting location and scale of apple tree

  appleTreeModel.scene.scale.x = 2.7;
  appleTreeModel.scene.scale.y = 2.7;
  appleTreeModel.scene.scale.z = 3.6;

  appleTreeModel.scene.position.x = 0;
  appleTreeModel.scene.position.y = 0;
  appleTreeModel.scene.position.z = -1;

  //Object scaling
  appleModel.scale.x = 0.004;
  appleModel.scale.y = 0.004;
  appleModel.scale.z = 0.004;

  pearModel.scale.x = 0.01;
  pearModel.scale.y = 0.01;
  pearModel.scale.z = 0.01;

  peachModel.scale.x = 0.0005;
  peachModel.scale.y = 0.0005;
  peachModel.scale.z = 0.0005;

  lemonModel.scene.scale.x = 1;
  lemonModel.scene.scale.y = 1;
  lemonModel.scene.scale.z = 1;

  appleModel.traverse ( (o) => {
    if(o.isMesh)
    {
      o.material.map = appleTextures;
      o.material.transparent = true;
      o.material.opacity = 1;//0
      appleOpacityVariable = o.material.opacity;
    }
  } );

  pearModel.traverse ( (o) => { //Enabeling opacity in pear object
    if(o.isMesh)
    {
      o.material.map = pearTextures;
      o.material.transparent = true;
      o.material.opacity = 1;//0 
      pearOpacityVariable = o.material.opacity;
    }
  } );

  peachModel.traverse ( (o) => { //Enabeling opacity in peach object 
    if(o.isMesh)
    {
      o.material.transparent = true;
      o.material.opacity = 1;//0
      peachOpacityVariable = o.material.opacity;
    }
  } );

  lemonModel.scene.traverse ( (o) => { //Enabeling opacity in peach object 
    if(o.isMesh)
    {
      o.material.transparent = true;
      o.material.opacity = 0;
      lemonOpacityVariable = o.material.opacity;
    }
  } );

  scene.add(pearModel);
  cubeTree.add(pearModel);

  scene.add(peachModel);
  cubeTree.add(peachModel)

  scene.add(appleModel);
  cubeTree.add(appleModel)

  scene.add(lemonModel.scene);
  cubeTree.add(lemonModel.scene);
}

//Animate the scene
function animate()
{
    requestAnimationFrame(animate);
    
    treeSpinSlow();

    //pearOpacityAnimation();
    //peachOpacityAnimation();
    //appleOpacityAnimation();
    //lemonOpacityAnimation();

    pearSpinSlow();
    appleSpinSlow();
    lemonSpinSlow();
    peachSpinSlow();

    TWEEN.update();
    interactionThree.update();
    renderer.render(scene, camera);
}


function moveSlowlyPear()
{
  let xCoordinates = getRandomNumberRange(-0.3, 0.3).toFixed(2);
  let zCoordinates = getRandomNumberRange(-0.4, 0.4).toFixed(2);

  switch(gsapPear.isActive())
  {
    case true:
      //console.log('Is active');
      break;
    case false:
      
      gsapPear.from(pearModel.position, {
        x: xCoordinates, y: 0, z: zCoordinates
      })
      .to(pearModel.position, {
        x: xCoordinates, y: -0.89, z: zCoordinates, duration: 0.81
      });
      //gsapPear.call( pearOpacityAnimation );
      break;
  }
}

function moveSlowlyApple()
{
  let xCoordinates = getRandomNumberRange(-0.3, 0.3).toFixed(3);
  let zCoordinates = getRandomNumberRange(-0.4, 0.4).toFixed(2);

  switch(gsapApple.isActive())
  {
    case true:
      //console.log('Is active');
      break;
    case false:
      gsapApple.from(appleModel.position, {
        x: xCoordinates, y: 0, z: zCoordinates
      })
      .to(appleModel.position, {
        x: xCoordinates, y: -0.89, z: zCoordinates, duration: 1
      });
      //gsapPear.call( pearOpacityAnimation );
      break;
  }
}

function moveSlowlyLemon()
{
  let xCoordinates = getRandomNumberRange(-0.4, 0.4).toFixed(2);
  let zCoordinates = getRandomNumberRange(-0.3, 0.3).toFixed(3);

  switch(gsapLemon.isActive())
  {
    case true:
      //console.log('Is active');
      break;
    case false:
      gsapLemon.from(lemonModel.scene.position, {
        x: xCoordinates, y: 0, z: zCoordinates
      })
      .to(lemonModel.scene.position, {
        x: xCoordinates, y: -0.89, z: zCoordinates, duration: 1.2
      });
      //gsapPear.call( pearOpacityAnimation );
      break;
  }
}

function moveSlowlyPeach()
{
  let xCoordinates = getRandomNumberRange(-0.4, 0.4).toFixed(3);
  let zCoordinates = getRandomNumberRange(-0.4, 0.4).toFixed(3);

  switch(gsapPeach.isActive())
  {
    case true:
      //console.log('Is active');
      break;
    case false:
      gsapPeach.from(peachModel.position, {
        x: xCoordinates, y: 0, z: zCoordinates
      })
      .to(peachModel.position, {
        x: xCoordinates, y: -0.89, z: zCoordinates, duration: 0.88
      });
      //gsapPear.call( pearOpacityAnimation );
      break;
  }
}

//Cube spin animation. The apple tree is added to cubeTree as a child object.
function treeSpinSlow()
{
  cubeTree.rotation.y += 0.01;
}

function pearSpinSlow()
{
  pearModel.rotation.x += 0.01;
  pearModel.rotation.z += 0.01;
}

function lemonSpinSlow()
{
  lemonModel.scene.rotation.x += 0.01;
  lemonModel.scene.rotation.z += 0.01;
}

function appleSpinSlow()
{
  appleModel.rotation.x += 0.01;
  appleModel.rotation.z += 0.01;
}

function peachSpinSlow()
{
  peachModel.rotation.x += 0.01;
  peachModel.rotation.z += 0.01;
}

//Opacity animation functions for pear, lemon, apple and peach. Unused part of project.

function pearOpacityAnimation() //Opacity function in which the imported object opacity can be changed
{
 if(pearOpacityVariable > 0) //&& pearFadeOut == true
  {
    pearModel.traverse ( (o) => { //Decrease opacity
      if(o.isMesh)
      {
        o.material.opacity -= 0.02;
        o.material.needsUpdate = true;
        pearOpacityVariable = o.material.opacity;
      }
    } );

    if(pearOpacityVariable.toFixed(2) <= 0.00) //pearOpacityCounter = -100;
    {
      pearModel.traverse ( (o) => { //Decrease opacity
        if(o.isMesh)
        {
          
          o.material.opacity = 1;
          o.material.needsUpdate = true;
          pearOpacityVariable = o.material.opacity;
        }
      } );
    }
  }
}

let peachOpacityCounter = -100; // -200
function peachOpacityAnimation() //Opacity function in which the imported object opacity can be changed
{

  if(peachOpacityCounter < 0)
  {
    peachModel.traverse ( (o) => { //Increase opacity
      if(o.isMesh)
      {
        o.material.opacity += 0.01; //0.005
        o.material.needsUpdate = true;
        peachOpacityVariable = o.material.opacity;
      }
    } );
    
    ++peachOpacityCounter;
  }
  else if(peachOpacityCounter >= 0)
  {
    peachModel.traverse ( (o) => { //Decrease opacity
      if(o.isMesh)
      {
        o.material.opacity -= 0.01;
        o.material.needsUpdate = true;
        peachOpacityVariable = o.material.opacity;
      }
    } );
    
    ++peachOpacityCounter;
    if(peachOpacityCounter == 100) peachOpacityCounter = -100;
  }
}

let appleOpacityCounter = -40;
function appleOpacityAnimation() //Opacity function in which the imported object opacity can be changed
{

  if(appleOpacityCounter < 0)
  {
    appleModel.traverse ( (o) => { //Increase opacity
      if(o.isMesh)
      {
        o.material.opacity += 0.025;
        o.material.needsUpdate = true;
        appleOpacityVariable = o.material.opacity;
      }
    } );
    
    ++appleOpacityCounter;
  }
  else if(appleOpacityCounter >= 0)
  {
    appleModel.traverse ( (o) => { //Decrease opacity
      if(o.isMesh)
      {
        o.material.opacity -= 0.025;
        o.material.needsUpdate = true;
        appleOpacityVariable = o.material.opacity;
      }
    } );
    
    ++appleOpacityCounter;
    if(appleOpacityCounter == 40) appleOpacityCounter = -40;
  }
}

let lemonOpacityCounter = -50;
function lemonOpacityAnimation() //Opacity function in which the imported object opacity can be changed
{

  if(lemonOpacityCounter < 0)
  {
    lemonModel.scene.traverse ( (o) => { //Increase opacity
      if(o.isMesh)
      {
        o.material.opacity += 0.02;
        o.material.needsUpdate = true;
        lemonOpacityVariable = o.material.opacity;
      }
    } );
    
    ++lemonOpacityCounter;
  }
  else if(appleOpacityCounter >= 0)
  {
    lemonModel.scene.traverse ( (o) => { //Decrease opacity
      if(o.isMesh)
      {
        o.material.opacity -= 0.02;
        o.material.needsUpdate = true;
        lemonOpacityVariable = o.material.opacity;
      }
    } );
    
    ++lemonOpacityCounter;
    if(lemonOpacityCounter == 50) lemonOpacityCounter = -50;
  }
}

//Add counting event to object
cubeTree.addEventListener("click", (Event) =>{
  
  clickAnimationTree();

});


function init()
{
  scene.background = new THREE.Color(0xD9D9D9);
  
  if(localStorage.getItem('GameData') != null) getGameValues();

  addTree();
  //addGUI(); //Debug menu
  animate();
}

init();