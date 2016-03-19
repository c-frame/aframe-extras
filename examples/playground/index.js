var AFRAME = window.AFRAME.aframeCore || window.AFRAME;

/* Components
——————————————————————————————————————————————*/

require('../../lib/CANNON-shape2mesh');

require('../../src/controls/');
require('../../src/physics/');

AFRAME.registerComponent('proxy-controls', require('aframe-proxy-controls'));
AFRAME.registerComponent('universal-controls', require('../../src/universal-controls'));
AFRAME.registerComponent('toggle-velocity', require('../../src/toggle-velocity'));
