var AFRAME = window.AFRAME.aframeCore || window.AFRAME;

AFRAME.registerComponent('physics', require('./physics'));
AFRAME.registerComponent('dynamic-body', require('./dynamic-body'));
AFRAME.registerComponent('kinematic-body', require('./kinematic-body'));
AFRAME.registerComponent('rigid-body', require('./rigid-body'));
AFRAME.registerComponent('velocity', require('./velocity'));
