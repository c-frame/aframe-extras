module.exports = {
  'jump-ability':      require('./jump-ability'),
  'toggle-velocity':   require('./toggle-velocity'),
  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;

    this.extras.math.registerAll();
    this.extras.physics.registerAll();
    AFRAME.registerComponent('jump-ability',      this['jump-ability']);
    AFRAME.registerComponent('toggle-velocity',   this['toggle-velocity']);

    this._registered = true;
  }
};
