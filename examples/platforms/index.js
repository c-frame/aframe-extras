var AFRAME = require('aframe');

/* Components
——————————————————————————————————————————————*/

AFRAME.registerComponent('gamepad-controls', require('aframe-gamepad-controls'));
AFRAME.registerComponent('keyboard-controls', require('aframe-keyboard-controls'));
AFRAME.registerComponent('proxy-controls', require('aframe-proxy-controls'));
AFRAME.registerComponent('jump-ability', require('../../src/jump-ability'));

/* Platforms
——————————————————————————————————————————————*/

document.addEventListener('DOMContentLoaded', function () {
  var MAP_SIZE = 10,
      PLATFORM_SIZE = 5,
      NUM_PLATFORMS = 50;

  var platformsEl = document.querySelector('#platforms');

  var v,
      aCube;
  for (var i = 0;  i < NUM_PLATFORMS; i++) {
    v = {
      x: (Math.floor(Math.random() * MAP_SIZE) - PLATFORM_SIZE) * PLATFORM_SIZE,
      y: (Math.floor(Math.random() * MAP_SIZE)                ) * PLATFORM_SIZE + PLATFORM_SIZE / 2,
      z: (Math.floor(Math.random() * MAP_SIZE) - PLATFORM_SIZE) * PLATFORM_SIZE
    };
    aCube = document.createElement('a-cube');
    aCube.setAttribute('position', v.x + ' ' + v.y + ' ' + v.z);
    aCube.setAttribute('height', PLATFORM_SIZE);
    aCube.setAttribute('width', PLATFORM_SIZE);
    aCube.setAttribute('depth', PLATFORM_SIZE);
    platformsEl.appendChild(aCube);
  }

  console.info('Platforms loaded.');
});
