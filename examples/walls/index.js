var AFRAME = window.AFRAME.aframeCore || window.AFRAME;

/* Components
——————————————————————————————————————————————*/

require('../../src/controls/');
require('../../src/physics/');

AFRAME.registerComponent('obj-loader', require('aframe-obj-loader-component'));
AFRAME.registerComponent('proxy-controls', require('aframe-proxy-controls'));
AFRAME.registerComponent('jump-ability', require('../../src/jump-ability'));
AFRAME.registerComponent('universal-controls', require('../../src/universal-controls'));
