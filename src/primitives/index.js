module.exports = {
  'a-grid':        require('./a-grid'),
  registerAll: function (AFRAME) {
    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;
    AFRAME.registerPrimitive('a-grid', this['a-grid']);
  }
};
