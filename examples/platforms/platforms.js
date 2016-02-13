var AFRAME = require('aframe');
// var AFRAME = window.AFRAME.aframeCore || AFRAME;

/* Components
 —————————————————————————————————————————————*/

AFRAME.registerComponent('gamepad-controls', require('aframe-gamepad-controls'));
AFRAME.registerComponent('keyboard-controls', require('aframe-keyboard-controls'));
AFRAME.registerComponent('proxy-controls', require('aframe-proxy-controls'));

AFRAME.registerComponent('jump-ability', require('../../src/jump-ability'));

/* Bootstrap
 —————————————————————————————————————————————*/

document.addEventListener('DOMContentLoaded', function () {
  initTerrain();
  initGravity();
  console.info('Platforms and gravity loaded.');
});

/* Globals
 —————————————————————————————————————————————*/

var platforms = [];

/* Terrain
 —————————————————————————————————————————————*/

function initTerrain () {
  var MAP_SIZE = 10,
      PLATFORM_SIZE = 5;

  var platformsEl = document.querySelector('#platforms');

  var v,
      aCube;
  for (var i = 0;  i < 50; i++) {
    v = {
      x: (Math.floor(Math.random() * MAP_SIZE) - PLATFORM_SIZE) * PLATFORM_SIZE,
      y: (Math.floor(Math.random() * MAP_SIZE)                ) * PLATFORM_SIZE + PLATFORM_SIZE / 2,
      z: (Math.floor(Math.random() * MAP_SIZE) - PLATFORM_SIZE) * PLATFORM_SIZE
    };
    aCube = document.createElement('a-cube');
    aCube.setAttribute('position', v.x + ' ' + v.y + ' ' + v.z);
    aCube.setAttribute('height', 5);
    aCube.setAttribute('width', 5);
    aCube.setAttribute('depth', 5);
    platformsEl.appendChild(aCube);
    platforms.push(aCube);
  }
}

/* Gravity
 —————————————————————————————————————————————*/

function initGravity () {
  // TODO
}
