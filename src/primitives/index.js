module.exports = {
  'a-grid':        require('./a-grid'),
  'a-ocean':        require('./a-ocean'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;
    AFRAME = AFRAME.aframeCore || AFRAME;

    AFRAME.registerPrimitive('a-grid',  this['a-grid']);

    AFRAME.registerComponent('ocean', this['a-ocean'].Component);
    AFRAME.registerPrimitive('a-ocean', this['a-ocean'].Primitive);

    this._registered = true;
  }
};
