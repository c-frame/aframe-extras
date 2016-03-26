module.exports = {
  'jump-ability':     require('./jump-ability'),
  'toggle-velocity':  require('./toggle-velocity'),
  registerAll: function (AFRAME) {
    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;
    AFRAME.registerComponent('jump-ability',    this['jump-ability']);
    AFRAME.registerComponent('toggle-velocity', this['toggle-velocity']);
  }
};
