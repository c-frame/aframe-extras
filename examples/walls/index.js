var AFRAME = window.AFRAME.aframeCore || window.AFRAME;

/* Components
——————————————————————————————————————————————*/

require('../../lib/CANNON-shape2mesh');

var extras = require('../..');
extras.controls.registerAll();
extras.math.registerAll();
extras.physics.registerAll();
AFRAME.registerComponent('proxy-controls', require('aframe-proxy-controls'));
