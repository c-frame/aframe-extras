var math = require('../math'),
    physics = require('../physics');

module.exports = {
  'checkpoint':      require('./checkpoint'),
  'grab':      require('./grab'),
  'jump-ability':    require('./jump-ability'),
  'sphere-collider':      require('./sphere-collider'),
  'toggle-velocity': require('./toggle-velocity'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;

    math.registerAll();
    physics.registerAll();
    if (!AFRAME.components['checkpoint'])      AFRAME.registerComponent('checkpoint',      this['checkpoint']);
    if (!AFRAME.components['grab'])            AFRAME.registerComponent('grab',            this['grab']);
    if (!AFRAME.components['jump-ability'])    AFRAME.registerComponent('jump-ability',    this['jump-ability']);
    if (!AFRAME.components['sphere-collider']) AFRAME.registerComponent('sphere-collider', this['sphere-collider']);
    if (!AFRAME.components['toggle-velocity']) AFRAME.registerComponent('toggle-velocity', this['toggle-velocity']);

    this._registered = true;
  }
};
