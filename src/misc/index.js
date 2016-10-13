var physics = require('aframe-physics-system');

module.exports = {
  'checkpoint':      require('./checkpoint'),
  'grab':            require('./grab'),
  'jump-ability':    require('./jump-ability'),
  'kinematic-body':  require('./kinematic-body'),
  'sphere-collider': require('./sphere-collider'),
  'toggle-velocity': require('./toggle-velocity'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;

    physics.registerAll();
    if (!AFRAME.components['checkpoint'])      AFRAME.registerComponent('checkpoint',      this['checkpoint']);
    if (!AFRAME.components['grab'])            AFRAME.registerComponent('grab',            this['grab']);
    if (!AFRAME.components['jump-ability'])    AFRAME.registerComponent('jump-ability',    this['jump-ability']);
    if (!AFRAME.components['kinematic-body'])  AFRAME.registerComponent('kinematic-body',  this['kinematic-body']);
    if (!AFRAME.components['sphere-collider']) AFRAME.registerComponent('sphere-collider', this['sphere-collider']);
    if (!AFRAME.components['toggle-velocity']) AFRAME.registerComponent('toggle-velocity', this['toggle-velocity']);

    this._registered = true;
  }
};
