module.exports = {
  'animation-handler': require('./animation-handler'),
  'jump-ability':      require('./jump-ability'),
  'three-model':       require('./three-model'),
  'toggle-velocity':   require('./toggle-velocity'),
  registerAll: function (AFRAME) {
    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;
    AFRAME.registerComponent('animation-handler', this['animation-handler']);
    AFRAME.registerComponent('jump-ability',      this['jump-ability']);
    AFRAME.registerComponent('three-model',       this['three-model']);
    AFRAME.registerComponent('toggle-velocity',   this['toggle-velocity']);
  }
};
