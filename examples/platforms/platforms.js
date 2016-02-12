var AFRAME = require('aframe');

/* Components
 —————————————————————————————————————————————*/

AFRAME.registerComponent('gamepad-controls', require('aframe-gamepad-controls'));
AFRAME.registerComponent('keyboard-controls', require('aframe-keyboard-controls'));
AFRAME.registerComponent('proxy-controls', require('aframe-proxy-controls'));

/* Terrain
 —————————————————————————————————————————————*/

var terrain = document.querySelector('#terrain');

var v,
    aCube;
for (var i = 0;  i < 20; i++) {
  v = {
    x: Math.floor(Math.random() * 20) - 10,
    y: Math.floor(Math.random() * 20),
    z: Math.floor(Math.random() * 20) - 10,
  };
  aCube = document.createElement('a-cube');
  aCube.setAttribute('position', v.x + ' ' + v.y + ' ' + v.z);
  terrain.appendChild(aCube);
}

/* Gravity
 —————————————————————————————————————————————*/
