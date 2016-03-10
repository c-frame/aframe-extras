var AFRAME = window.AFRAME.aframeCore || window.AFRAME;

/* Components
——————————————————————————————————————————————*/

require('../../src/controls/');

AFRAME.registerComponent('obj-loader', require('aframe-obj-loader-component'));
AFRAME.registerComponent('proxy-controls', require('aframe-proxy-controls'));
AFRAME.registerComponent('jump-ability', require('../../src/jump-ability'));
AFRAME.registerComponent('universal-controls', require('../../src/universal-controls'));
AFRAME.registerComponent('velocity', require('../../src/physics/velocity'));
