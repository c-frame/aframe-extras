module.exports = {
  'a-grid':     require('./a-grid'),
  'a-hexgrid': require('./a-hexgrid'),
  'a-ocean':    require('./a-ocean'),
  'a-tube':     require('./a-tube'),

  registerAll: function (AFRAME) {
    if (this._registered) return;
    AFRAME = AFRAME || window.AFRAME;
    this['a-grid'].registerAll(AFRAME);
    this['a-hexgrid'].registerAll(AFRAME);
    this['a-ocean'].registerAll(AFRAME);
    this['a-tube'].registerAll(AFRAME);
    this._registered = true;
  }
};
