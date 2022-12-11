const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(__dirname + '/public'));

//THREE
app.use('/buildThree/', express.static(path.join(__dirname, 'node_modules/three/build')));
app.use('/jsmThree/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));

//Dat.gui
app.use('/buildDatGui/', express.static(path.join(__dirname, 'node_modules/dat.gui/build')));

//Three.Interactive
app.use('/threeInteractive/', express.static(path.join(__dirname, 'node_modules/three.interactive/build')));

//Tween.js
app.use('/tweenJsDist/', express.static(path.join(__dirname, 'node_modules/@tweenjs/tween.js/dist')));

//Shifty aka TweenJs with async
//app.use('/shiftyTweenDist/', express.static(path.join(__dirname, 'node_modules/shifty/dist')));

//GSAP animation library
app.use('/gsapDirect/', express.static(path.join(__dirname, '/node_modules/gsap')));

//Objects
app.use('/resourcesObjects/', express.static(path.join(__dirname, 'resources/objects')));

app.listen(3000, () => {

    console.log('Visit site http://127.0.0.1:3000');

});