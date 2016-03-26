var AFRAME = window.AFRAME.aframeCore || window.AFRAME;

/* Components
——————————————————————————————————————————————*/

var extras = require('../..');
extras.controls.registerAll();
AFRAME.registerComponent('obj-loader', require('aframe-obj-loader-component'));
AFRAME.registerComponent('proxy-controls', require('aframe-proxy-controls'));
AFRAME.registerComponent('jump-ability', extras.misc['jump-ability']);
AFRAME.registerComponent('velocity', extras.math.velocity);
