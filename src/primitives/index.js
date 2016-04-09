module.exports = {
  'a-grid':        require('./a-grid'),
  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;
    AFRAME.registerPrimitive('a-grid', this['a-grid']);

    this._registered = true;
  }
};
