module.exports = {
  'a-grid':        require('./a-grid'),
  'a-ocean':        require('./a-ocean'),
  'a-tube':        require('./a-tube'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;

    AFRAME.registerPrimitive('a-grid',  this['a-grid']);

    AFRAME.registerComponent('ocean', this['a-ocean'].Component);
    AFRAME.registerPrimitive('a-ocean', this['a-ocean'].Primitive);

    AFRAME.registerComponent('tube', this['a-tube'].Component);
    AFRAME.registerPrimitive('a-tube', this['a-tube'].Primitive);

    this._registered = true;
  }
};
