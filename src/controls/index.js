var AFRAME = window.AFRAME.aframeCore || window.AFRAME;

// Movement
AFRAME.registerComponent('touch-movement', require('./touch-movement'));

// Rotation
AFRAME.registerComponent('hmd-rotation', require('./hmd-rotation'));
AFRAME.registerComponent('mousedrag-rotation', require('./mousedrag-rotation'));
AFRAME.registerComponent('pointerlock-rotation', require('./pointerlock-rotation'));

// Movement + Rotation
AFRAME.registerComponent('gamepad-controls', require('./gamepad-controls'));
AFRAME.registerComponent('keyboard-controls', require('./keyboard-controls'));
