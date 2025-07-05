/**
 * Touch-to-move-forward controls for mobile.
 */
AFRAME.registerComponent('touch-controls', {
  schema: {
    enabled: { default: true },
    reverseEnabled: { default: true }
  },

  init: function () {
    this.dVelocity = new THREE.Vector3();
    this.bindMethods();
    this.direction = 0;
  },

  play: function () {
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
    this.dVelocity.set(0, 0, 0);
  },

  remove: function () {
    this.pause();
  },

  addEventListeners: function () {
    const sceneEl = this.el.sceneEl;
    const canvasEl = sceneEl.canvas;

    if (!canvasEl) {
      sceneEl.addEventListener('render-target-loaded', this.addEventListeners.bind(this));
      return;
    }

    canvasEl.addEventListener('touchstart', this.onTouchStart, {passive: true});
    canvasEl.addEventListener('touchend', this.onTouchEnd, {passive: true});
    const vrModeUI = sceneEl.getAttribute('vr-mode-ui');
    if (vrModeUI && vrModeUI.cardboardModeEnabled) {
      sceneEl.addEventListener('enter-vr', this.onEnterVR);
    }
  },

  removeEventListeners: function () {
    const canvasEl = this.el.sceneEl && this.el.sceneEl.canvas;
    if (!canvasEl) { return; }

    canvasEl.removeEventListener('touchstart', this.onTouchStart);
    canvasEl.removeEventListener('touchend', this.onTouchEnd);
    this.el.sceneEl.removeEventListener('enter-vr', this.onEnterVR)
  },

  isVelocityActive: function () {
    return this.data.enabled && !!this.direction;
  },

  getVelocityDelta: function () {
    this.dVelocity.z = this.direction;
    return this.dVelocity.clone();
  },

  bindMethods: function () {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onEnterVR = this.onEnterVR.bind(this);
  },

  onTouchStart: function (e) {
    this.direction = -1;
    if (this.data.reverseEnabled && e.touches && e.touches.length === 2) {
      this.direction = 1;
    }
    e.preventDefault();
  },

  onTouchEnd: function (e) {
    this.direction = 0;
    e.preventDefault();
  },

  onEnterVR: function () {
    // This is to make the Cardboard button on Chrome Android working
    const xrSession = this.el.sceneEl.xrSession;
    if (!xrSession) { return; }
    xrSession.addEventListener('selectstart', this.onTouchStart);
    xrSession.addEventListener('selectend', this.onTouchEnd);
  }
});
