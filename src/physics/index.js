module.exports = {
  'physics':        require('./physics'),
  'dynamic-body':   require('./dynamic-body'),
  'kinematic-body': require('./kinematic-body'),
  'static-body':     require('./static-body'),
  registerAll: function (AFRAME) {
    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;
    AFRAME.registerComponent('physics',         this['physics']);
    AFRAME.registerComponent('dynamic-body',    this['dynamic-body']);
    AFRAME.registerComponent('kinematic-body',  this['kinematic-body']);
    AFRAME.registerComponent('static-body',      this['static-body']);
  }
};
