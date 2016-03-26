var AFRAME = window.AFRAME.aframeCore || window.AFRAME;

/* Components
——————————————————————————————————————————————*/

var extras = require('../..');
extras.controls.registerAll();
extras.math.registerAll();
extras.shadows.registerAll();
AFRAME.registerComponent('obj-loader', require('aframe-obj-loader-component'));
