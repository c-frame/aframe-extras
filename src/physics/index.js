module.exports = {
  'physics':        require('./physics'),
  'dynamic-body':   require('./dynamic-body'),
  'kinematic-body': require('./kinematic-body'),
  'rigid-body':     require('./rigid-body'),
  registerAll: function (AFRAME) {
    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;
    AFRAME.registerComponent('physics',         this['physics']);
    AFRAME.registerComponent('dynamic-body',    this['dynamic-body']);
    AFRAME.registerComponent('kinematic-body',  this['kinematic-body']);
    AFRAME.registerComponent('rigid-body',      this['rigid-body']);
  }
};
