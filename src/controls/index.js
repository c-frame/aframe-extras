var AFRAME = window.AFRAME.aframeCore || window.AFRAME;

// Movement
AFRAME.registerComponent('touch-controls', require('./touch-controls'));

// Rotation
AFRAME.registerComponent('hmd-controls', require('./hmd-controls'));
AFRAME.registerComponent('mousedrag-controls', require('./mousedrag-controls'));
AFRAME.registerComponent('pointerlock-controls', require('./pointerlock-controls'));

// Movement + Rotation
AFRAME.registerComponent('gamepad-controls', require('./gamepad-controls'));
AFRAME.registerComponent('keyboard-controls', require('./keyboard-controls'));
