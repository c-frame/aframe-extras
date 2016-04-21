var math = require('../math'),
    physics = require('../physics');

module.exports = {
  'jump-ability':      require('./jump-ability'),
  'toggle-velocity':   require('./toggle-velocity'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;

    math.registerAll();
    physics.registerAll();
    if (!AFRAME.components['jump-ability'])     AFRAME.registerComponent('jump-ability',      this['jump-ability']);
    if (!AFRAME.components['toggle-velocity'])  AFRAME.registerComponent('toggle-velocity',   this['toggle-velocity']);

    this._registered = true;
  }
};
