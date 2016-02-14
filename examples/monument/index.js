var AFRAME = window.AFRAME.aframeCore || window.AFRAME;

/* Components
——————————————————————————————————————————————*/

AFRAME.registerComponent('gamepad-controls', require('aframe-gamepad-controls'));
AFRAME.registerComponent('keyboard-controls', require('aframe-keyboard-controls'));
AFRAME.registerComponent('proxy-controls', require('aframe-proxy-controls'));
AFRAME.registerComponent('jump-ability', require('../../src/jump-ability'));
