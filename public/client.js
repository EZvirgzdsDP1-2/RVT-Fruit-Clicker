//IMPORT STATMETS
import * as THREE from 'three'; //THREE JS library
import { GUI } from './buildDatGui/dat.gui.module.js'; //Dat.gui library
import { GLTFLoader }  from './jsmThree/loaders/GLTFLoader.js'; //GLTF loader
import { FBXLoader }  from './jsmThree/loaders/FBXLoader.js'; //FBX loader
import { OBJLoader } from './jsmThree/loaders/OBJLoader.js' //OBJLoader
import { InteractionManager } from './threeInteractive/three.interactive.js';//three.interactive
import { gsap } from 'gsap';
import * as TWEEN from './TweenJsDist/tween.esm.js'; //Tween.js

//Adds commas to big numbers
function addcomma(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

//RNG functions
function getRandomNumberRange(min, max)
{
  return Math.random() * (max - min) + min;
}

//Clicks per minute calculate function. DEPRICATED 
let clicksPerMinute = 0;

let click = 0;
let clicks = 0;

function calculateClicksPerMinute() { //Was meant for dynamic animations and opacity change. DEPRICATED
    let seconds = new Date().getTime();

    clicks = ((1 / ((seconds - click) / 1000)) * 60);
    click = seconds;
    clicksPerMinute = Math.floor(clicks);
};

let dynamicFruitCooldown = (clicksPerMinute ** -2) * (10 ** 5); //This may be only temporary, because GSAP doesn't support dynamic animation number update. DEPRICATED

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
let fruitCount = 0; //Saved in GameDataOne
let clickValue = 1; //Saved in GameDataOne
let clickDollarValue = 2; //Saved in GameDataOne
let clickUpgradeCount = 0; //Saved in GameDataOne
let dollarCount = 0; //Saved in GameDataOne

let farmerCount = 0; //Saved in GameDataTwo
let farmerValue = 10; //Saved in GameDataTwo
let farmerFruitPerSecond = 0; //Saved in GameDataTwo
let dollarValueToFruit = 8; //Saved in GameDataTwo
let fruitPerSecond = 0; //Saved in GameDataTwo

let fruitDolllarConversionUpgradeCount = 0; //Saved in GameDataThree
let fruitDolllarConversionUpgradeDollarValue = 10000; //Saved in GameDataThree

let droneUpgradeCount = 0; //Saved in GameDataThree
let droneFruitPerSecond = 0; //Saved in GameDataThree
let droneUpgradeValue = 150; //Saved in GameDataThree

let robotUpgradeDollarPrice = 1200; //Saved in GameDataFour
let robotFruitPerSecond = 0; //Saved in GameDataFour
let robotDollarUpgradeCount = 0; //Saved in GameDataFour

let artificialHumanUpgradePrice = 10000; //Saved in GameDataFive
let artificialHumanFruitPerSecond = 0; //Saved in GameDataFive
let artificialHumanUpgradeCount = 0; //Saved in GameDataFive

let fruitSummonerUpgradePrice = 50000; //Saved in GameDataSix
let fruitSummonerFruitPerSecond = 0; //Saved in GameDataSix
let fruitSummonerUpgradeCount = 0; //Saved in GameDataSix


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
  document.getElementById('fruitCounter').innerHTML = 'Fruit count: ' + addcomma(fruitCount);
  document.getElementById('dollarCounter').innerHTML = 'Money count: ' + addcomma(dollarCount) + '$';
  document.getElementById('buyFarmer').innerHTML = 'Buy Farmers: ' + addcomma(farmerValue) + '$'; 
  document.getElementById('fruitPerSecond').innerHTML = 'Current fruit per second: '+ addcomma(fruitPerSecond) +' fruit/sec';
  document.getElementById('farmerCount').innerHTML = 'Farmer Count: ' + addcomma(farmerCount) + ', '+ addcomma(farmerFruitPerSecond) +' Fruit/Sec';
  document.getElementById('buyUpgradeCursor').innerHTML = 'Buy cursor upgrade '+ addcomma(clickDollarValue) +'$';
  document.getElementById('cursorText').innerHTML = 'Current cursor count: '+ addcomma(clickUpgradeCount) +', '+  addcomma(clickValue) +'fruit/click';
  
  if( fruitDolllarConversionUpgradeCount < 7 )
  { document.getElementById('fruitConversionUpgradeButton').innerHTML = 'Upgrade fruit dollar conversion: '+ addcomma(fruitDolllarConversionUpgradeDollarValue) +'$'; }
  else{ document.getElementById('fruitConversionUpgradeButton').innerHTML = 'You can\'t get the fruit to dollar conversion upgrade anymore! Max reached'; }
  
  document.getElementById('fruitToDollarUpgradeText').innerHTML = 'Current upgrade level: '+ fruitDolllarConversionUpgradeCount;
  document.getElementById('fruitToDollarConversionText').innerHTML = 'Current fruit to money ratio: '+ dollarValueToFruit +' fruit to 1 $';
  document.getElementById('buyDrone').innerHTML = 'Buy Drone: '+ addcomma(droneUpgradeValue) +'$';
  document.getElementById('droneCount').innerHTML = 'Drone Count: '+ addcomma(droneUpgradeCount) +', '+ addcomma(droneFruitPerSecond) +' fruit/Sec';

  document.getElementById('buyRobotButton').innerHTML = 'Buy Robot: '+ addcomma(robotUpgradeDollarPrice) +'$';
  document.getElementById('robotCountText').innerHTML = 'Robot Count: '+ addcomma(robotDollarUpgradeCount) +', '+ addcomma(robotFruitPerSecond) +' fruit/Sec';

  document.getElementById('buyArtificialHumanButton').innerHTML = 'Buy artificial human: '+ addcomma(artificialHumanUpgradePrice) +'$';
  document.getElementById('artificialHumanCountText').innerHTML = 'Artificial human Count: '+ addcomma(artificialHumanUpgradeCount) +', '+ addcomma(artificialHumanFruitPerSecond) +' fruit/Sec';

  document.getElementById('buyFruitSummoningButton').innerHTML = 'Buy fruit summoner: '+ addcomma(fruitSummonerUpgradePrice) +'$';
  document.getElementById('fruitSummonerCountText').innerHTML = 'Fruit summoner count: '+ addcomma(fruitSummonerUpgradeCount) +', '+ addcomma(fruitSummonerFruitPerSecond) +' fruit/Sec';
} 

//Functions for getting game values loaded.

function getGameValues()
{
  let tempObjectOne = JSON.parse(localStorage.getItem('GameDataOne'));
  let tempObjectTwo = JSON.parse(localStorage.getItem('GameDataTwo'));
  let tempObjectThree = JSON.parse(localStorage.getItem('GameDataThree'));
  let tempObjectFour = JSON.parse(localStorage.getItem('GameDataFour'));
  let tempObjectFive = JSON.parse(localStorage.getItem('GameDataFive'));
  let tempObjectSix = JSON.parse(localStorage.getItem('GameDataSix'));
  
  fruitCount = parseInt(tempObjectOne["FruitCount"]); 
  dollarCount = parseInt(tempObjectOne["DollarCount"]);
  clickValue = parseInt(tempObjectOne["ClickValue"]);
  clickDollarValue = parseInt(tempObjectOne["ClickDollarValue"]);
  clickUpgradeCount = parseInt(tempObjectOne["ClickUpgradeCount"]);

  farmerFruitPerSecond = parseInt(tempObjectTwo["FarmerPerSecond"]);
  dollarValueToFruit = parseInt(tempObjectTwo["DollarFruitValue"]);
  fruitPerSecond = parseInt(tempObjectTwo["FruitPerSecond"]);
  farmerCount = parseInt(tempObjectTwo["FarmerCount"]);
  farmerValue = parseInt(tempObjectTwo["FarmerValue"]);

  fruitDolllarConversionUpgradeCount = parseInt(tempObjectThree["fruitDolllarConversionUpgradeCount"]);
  fruitDolllarConversionUpgradeDollarValue = parseInt(tempObjectThree["fruitDolllarConversionUpgradeDollarValue"]);
  droneUpgradeCount = parseInt(tempObjectThree["droneUpgradeCount"]);
  droneFruitPerSecond = parseInt(tempObjectThree["droneFruitPerSecond"]);
  droneUpgradeValue = parseInt(tempObjectThree["droneUpgradeValue"]);

  robotDollarUpgradeCount = parseInt(tempObjectFour["RobotUpgradeCount"]);
  robotFruitPerSecond = parseInt(tempObjectFour["RobotFruitPerSecond"]);
  robotUpgradeDollarPrice = parseInt(tempObjectFour["RobotUpgradeDollarPrice"]);

  artificialHumanFruitPerSecond = parseInt(tempObjectFive["ArtificialHumanFruitPerSecond"]);
  artificialHumanUpgradeCount = parseInt(tempObjectFive["ArtificialHumanUpgradeCount"]);
  artificialHumanUpgradePrice = parseInt(tempObjectFive["ArtificialHumanUpgradePrice"]);

  fruitSummonerFruitPerSecond = parseInt(tempObjectSix["FruitSummonerFruitPerSecond"]);
  fruitSummonerUpgradeCount = parseInt(tempObjectSix["FruitSummonerUpgradeCount"]);
  fruitSummonerUpgradePrice = parseInt(tempObjectSix["FruitSummonerUpgradePrice"]);

  reloadAll(); //Reloads HTML DOM
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

  //let gameDataObject = {'FruitCount': fruitCount, 'ClickValue': clickValue, 'ClickDollarValue': clickDollarValue, 'ClickUpgradeCount': clickUpgradeCount, 'DollarCount': dollarCount, 
  //'FarmerCount': farmerCount, 
  //'FarmerValue': farmerValue, 'FarmerPerSecond': farmerFruitPerSecond, 'FruitPerSecond': fruitPerSecond, 'DollarFruitValue':dollarValueToFruit};

  let gameDataObjectOne = {'FruitCount': fruitCount, 'ClickValue': clickValue, 'ClickDollarValue': clickDollarValue, 'ClickUpgradeCount': clickUpgradeCount, 'DollarCount': dollarCount};
  let gameDataObjectTwo = {'FarmerCount': farmerCount, 'FarmerValue': farmerValue, 'FarmerPerSecond': farmerFruitPerSecond, 'FruitPerSecond': fruitPerSecond, 'DollarFruitValue':dollarValueToFruit};
  let gameDataObjectThree = {'fruitDolllarConversionUpgradeCount': fruitDolllarConversionUpgradeCount, 'fruitDolllarConversionUpgradeDollarValue': fruitDolllarConversionUpgradeDollarValue,
    'droneUpgradeCount':droneUpgradeCount, 'droneFruitPerSecond':droneFruitPerSecond, 'droneUpgradeValue':droneUpgradeValue};
  let gameDataObjectFour = {'RobotUpgradeCount':robotDollarUpgradeCount, 'RobotFruitPerSecond':robotFruitPerSecond, 'RobotUpgradeDollarPrice': robotUpgradeDollarPrice};
  let gameDataObjectFive = {'ArtificialHumanUpgradePrice':artificialHumanUpgradePrice, 'ArtificialHumanFruitPerSecond':artificialHumanFruitPerSecond, 'ArtificialHumanUpgradeCount':artificialHumanUpgradeCount};
  let gameDataObjectSix = {'FruitSummonerFruitPerSecond':fruitSummonerFruitPerSecond, 'FruitSummonerUpgradeCount':fruitSummonerUpgradeCount, 'FruitSummonerUpgradePrice':fruitSummonerUpgradePrice};

  localStorage.setItem('GameDataOne', JSON.stringify(gameDataObjectOne) ); //Save game data in local storage
  localStorage.setItem('GameDataTwo', JSON.stringify(gameDataObjectTwo) );
  localStorage.setItem('GameDataThree', JSON.stringify(gameDataObjectThree) );
  localStorage.setItem('GameDataFour', JSON.stringify(gameDataObjectFour) );
  localStorage.setItem('GameDataFive', JSON.stringify(gameDataObjectFive) );
  localStorage.setItem('GameDataSix', JSON.stringify(gameDataObjectSix) );

  confirm('Game data has been saved.')
});

document.getElementById('resetGameData').addEventListener('click', (event) =>{ //Save game data

  if(confirm('Are you sure you want to reset the game data? This is unreverseable.'))
  {

    localStorage.removeItem('GameDataOne')
    localStorage.removeItem('GameDataTwo');
    localStorage.removeItem('GameDataThree');

    alert('Game data has been reset')
    location.reload();
  }
});

//Game button event listeners
document.getElementById('fruitToDollars').addEventListener('click', (event) =>{

  let tempDollarCount = Math.floor(fruitCount / dollarValueToFruit);

  dollarCount += tempDollarCount; 

  fruitCount -= parseInt( tempDollarCount * dollarValueToFruit );

  document.getElementById('fruitCounter').innerHTML = 'Fruit count: ' + addcomma(fruitCount);
  document.getElementById('dollarCounter').innerHTML = 'Money count: ' + addcomma(dollarCount) + '$';

});

document.getElementById('buyUpgradeCursor').addEventListener('click', (event) =>{

  if(dollarCount >= clickDollarValue)
  {
    //let tempClickerCount = parseInt( Math.floor(dollarCount / clickDollarValue) );

    clickUpgradeCount += 1;

    dollarCount -= 1 * clickDollarValue;

    clickValue = (1 + Math.ceil(clickUpgradeCount / 0.9)) * clickUpgradeCount;

    clickDollarValue = Math.ceil( clickDollarValue + (clickUpgradeCount * 2.5) );
    
    document.getElementById('buyUpgradeCursor').innerHTML = 'Buy cursor upgrade '+ addcomma(clickDollarValue) +'$';
    document.getElementById('cursorText').innerHTML = 'Current cursor count: '+ addcomma(clickUpgradeCount) +', '+  addcomma(clickValue) +'fruit/click';
    document.getElementById('dollarCounter').innerHTML = 'Money count: ' + addcomma(dollarCount) + '$';

  }

});

document.getElementById('buyFarmer').addEventListener('click', (event) =>{
  
  if(dollarCount >= farmerValue)
  {
    //let tempFarmerCount = parseInt( Math.floor(dollarCount / farmerValue) );

    farmerCount += 1; 

    dollarCount -= 1 * farmerValue;

    farmerValue = Math.ceil( farmerValue + (farmerCount * 2.5) );

    farmerFruitPerSecond = (3 + Math.ceil(farmerCount / 2)) * parseInt(farmerCount);

    changeFruitPerSecond()

    document.getElementById('buyFarmer').innerHTML = 'Buy Farmers: ' + addcomma(farmerValue) + '$'; 
    document.getElementById('farmerCount').innerHTML = 'Farmer Count: ' + addcomma(farmerCount) + ', '+ addcomma(farmerFruitPerSecond) +' Fruit/Sec';
    document.getElementById('dollarCounter').innerHTML = 'Money count: ' + addcomma(dollarCount) + '$';
    
  }
});


document.getElementById('fruitConversionUpgradeButton').addEventListener('click', (event) =>{
  
  if(dollarCount >= fruitDolllarConversionUpgradeDollarValue)
  {
    if(fruitDolllarConversionUpgradeCount != 7)
    {
      ++fruitDolllarConversionUpgradeCount;
      --dollarValueToFruit;

      dollarCount -= fruitDolllarConversionUpgradeDollarValue * 1;

      fruitDolllarConversionUpgradeDollarValue = Math.ceil( fruitDolllarConversionUpgradeDollarValue + (fruitDolllarConversionUpgradeDollarValue * 9.5) );

      document.getElementById('fruitConversionUpgradeButton').innerHTML = 'Upgrade fruit to dollar conversion '+ addcomma(fruitDolllarConversionUpgradeDollarValue) +'$';
      document.getElementById('fruitToDollarUpgradeText').innerHTML = 'Current upgrade level: '+ fruitDolllarConversionUpgradeCount;
      document.getElementById('fruitToDollarConversionText').innerHTML = 'Current fruit to money ratio: '+ dollarValueToFruit +' fruit to 1 $';
      document.getElementById('dollarCounter').innerHTML = 'Money count: ' + addcomma(dollarCount) + '$';
    }
    else
    {
      document.getElementById('fruitConversionUpgradeButton').innerHTML = 'You can\'t get the fruit to dollar conversion upgrade anymore';
    }
    
  }
});

document.getElementById('buyDrone').addEventListener('click', (event) =>{

  if(dollarCount >= droneUpgradeValue)
  {
    ++droneUpgradeCount;

    dollarCount -= droneUpgradeValue;

    droneFruitPerSecond =  Math.ceil(15 + (droneUpgradeCount / 0.9)) * droneUpgradeCount;
    droneUpgradeValue = Math.ceil( droneUpgradeValue + (droneUpgradeValue * 0.09) );

    changeFruitPerSecond();

    document.getElementById('buyDrone').innerHTML = 'Buy Drone: '+ addcomma(droneUpgradeValue) +'$';
    document.getElementById('droneCount').innerHTML = 'Drone Count: '+ addcomma(droneUpgradeCount) +', '+ addcomma(droneFruitPerSecond) +' fruit/Sec';
    document.getElementById('dollarCounter').innerHTML = 'Money count: ' + addcomma(dollarCount) + '$';
  }
});

document.getElementById('buyRobotButton').addEventListener('click', (event) =>{ 
  if(dollarCount >= robotUpgradeDollarPrice)
  {
    ++robotDollarUpgradeCount;

    dollarCount -= robotUpgradeDollarPrice;

    robotFruitPerSecond =  Math.ceil(90 + (robotDollarUpgradeCount / 0.94)) * robotDollarUpgradeCount;

    robotUpgradeDollarPrice = Math.ceil( robotUpgradeDollarPrice + (robotUpgradeDollarPrice * 0.11) );

    changeFruitPerSecond();

    document.getElementById('buyRobotButton').innerHTML = 'Buy Robot: '+ addcomma(robotUpgradeDollarPrice) +'$';
    document.getElementById('robotCountText').innerHTML = 'Robot Count: '+ addcomma(robotDollarUpgradeCount) +', '+ addcomma(robotFruitPerSecond) +' fruit/Sec';
    document.getElementById('dollarCounter').innerHTML = 'Money count: ' + addcomma(dollarCount) + '$';
  }
});

document.getElementById('buyArtificialHumanButton').addEventListener('click', (event) =>{ 
  if(dollarCount >= artificialHumanUpgradePrice)
  {
    ++artificialHumanUpgradeCount;

    dollarCount -= artificialHumanUpgradePrice;

    artificialHumanFruitPerSecond =  Math.ceil(470 + (artificialHumanUpgradeCount / 0.96)) * artificialHumanUpgradeCount;

    artificialHumanUpgradePrice = Math.ceil( artificialHumanUpgradePrice + (artificialHumanUpgradePrice * 0.13) );

    changeFruitPerSecond();

    document.getElementById('buyArtificialHumanButton').innerHTML = 'Buy artificial human: '+ addcomma(artificialHumanUpgradePrice) +'$';
    document.getElementById('artificialHumanCountText').innerHTML = 'Artificial human Count: '+ addcomma(artificialHumanUpgradeCount) +', '+ addcomma(artificialHumanFruitPerSecond) +' fruit/Sec';
    document.getElementById('dollarCounter').innerHTML = 'Money count: ' + addcomma(dollarCount) + '$';
  }
});


document.getElementById('buyFruitSummoningButton').addEventListener('click', (event) =>{ 
  if(dollarCount >= fruitSummonerUpgradePrice)
  {
    ++fruitSummonerUpgradeCount;

    dollarCount -= fruitSummonerUpgradePrice;

    fruitSummonerFruitPerSecond =  Math.ceil(890 + (fruitSummonerUpgradeCount / 0.98)) * fruitSummonerUpgradeCount;

    fruitSummonerUpgradePrice = Math.ceil( fruitSummonerUpgradePrice + (fruitSummonerUpgradePrice * 0.15) );

    changeFruitPerSecond();

    document.getElementById('buyFruitSummoningButton').innerHTML = 'Buy fruit summoner: '+ addcomma(fruitSummonerUpgradePrice) +'$';
    document.getElementById('fruitSummonerCountText').innerHTML = 'Fruit summoner count: '+ addcomma(fruitSummonerUpgradeCount) +', '+ addcomma(fruitSummonerFruitPerSecond) +' fruit/Sec';
    document.getElementById('dollarCounter').innerHTML = 'Money count: ' + addcomma(dollarCount) + '$';
  }
});

function changeFruitPerSecond()
{
  fruitPerSecond = farmerFruitPerSecond + droneFruitPerSecond + robotFruitPerSecond + artificialHumanFruitPerSecond + fruitSummonerFruitPerSecond; //Will add more objects that fruit per second;

  document.getElementById('fruitPerSecond').innerHTML = 'Current fruit per second: '+ addcomma(fruitPerSecond) +' fruit/sec';
}


//Automatic fruit incrementer
function addFruitPerSecond() //Uncomplete method
{
  fruitPerSecond = farmerFruitPerSecond + droneFruitPerSecond + robotFruitPerSecond + artificialHumanFruitPerSecond + fruitSummonerFruitPerSecond; //Will add more objects that fruit per second;

  fruitCount += fruitPerSecond;

  document.getElementById('fruitCounter').innerHTML = 'Fruit count: ' + addcomma(fruitCount);
  document.getElementById('fruitPerSecond').innerHTML = 'Current fruit per second: '+ addcomma(fruitPerSecond) +' fruit/sec';
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


//Set camera position
camera.position.z = 4.5;//5
camera.position.y = 1;
camera.position.x = -0.2;
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

  document.getElementById('fruitCounter').innerHTML = 'Fruit count: ' + addcomma(fruitCount);  

  //calculateClicksPerMinute();
  //console.log('Current clicks per minute: '+ clicksPerMinute); //Old part of code. Was meant for dynamic opacity and animation speed.

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
  
  if(localStorage.getItem('GameDataOne') != null) getGameValues(); //Load game values

  addTree(); //Add a clickable tree
  animate(); //Animation initializations
}

init();