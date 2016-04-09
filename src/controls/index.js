module.exports = {
  'gamepad-controls':   require('./gamepad-controls'),
  'hmd-controls':       require('./hmd-controls'),
  'keyboard-controls':  require('./keyboard-controls'),
  'mouse-controls':     require('./mouse-controls'),
  'touch-controls':     require('./touch-controls'),
  'universal-controls': require('./universal-controls'),
  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;

    this.extras.math.registerAll();
    AFRAME.registerComponent('gamepad-controls',    this['gamepad-controls']);
    AFRAME.registerComponent('hmd-controls',        this['hmd-controls']);
    AFRAME.registerComponent('keyboard-controls',   this['keyboard-controls']);
    AFRAME.registerComponent('mouse-controls',      this['mouse-controls']);
    AFRAME.registerComponent('touch-controls',      this['touch-controls']);
    AFRAME.registerComponent('universal-controls',  this['universal-controls']);

    this._registered = true;
  }
};
