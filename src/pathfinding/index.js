module.exports = {
  'nav-mesh':    require('./nav-mesh'),
  'nav-controller':     require('./nav-controller'),
  'system':      require('./system'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;

    if (!AFRAME.components['nav-mesh']) {
      AFRAME.registerComponent('nav-mesh', this['nav-mesh']);
    }

    if (!AFRAME.components['nav-controller']) {
      AFRAME.registerComponent('nav-controller',  this['nav-controller']);
    }

    if (!AFRAME.systems.nav) {
      AFRAME.registerSystem('nav', this.system);
    }

    this._registered = true;
  }
};
