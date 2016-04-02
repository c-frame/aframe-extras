var TICK_DEBOUNCE = 4; // ms

module.exports = {

  /*******************************************************************
   * Schema
   */

  schema: {
    enabled: { default: true }
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function () {
    this.tPrev = 0;
    this.dolly = new THREE.Object3D();
    this.euler = new THREE.Euler();
    this.controls = new THREE.VRControls(this.dolly);
    this.zeroQuaternion = new THREE.Quaternion();
  },

  /*******************************************************************
   * Tick
   */

  tick: function (t) {
    t = t || Date.now();
    if (t - this.tPrev > TICK_DEBOUNCE) {
      this.controls.update();
      this.tPrev = t;
    }
  },

  /*******************************************************************
   * Universal interface
   */

  isRotationActive: function () {
    return this.data.enabled && !this.dolly.quaternion.equals(this.zeroQuaternion);
  },

  getRotation: (function () {
    var hmdEuler = new THREE.Euler();
    hmdEuler.order = 'YXZ';
    return function () {
      this.tick();
      var hmdQuaternion = this.calculateHMDQuaternion();
      hmdEuler.setFromQuaternion(hmdQuaternion);
      return new THREE.Vector3(
        THREE.Math.radToDeg(hmdEuler.x),
        THREE.Math.radToDeg(hmdEuler.y),
        THREE.Math.radToDeg(hmdEuler.z)
      );
    };
  }()),

  /*******************************************************************
   * Orientation
   */

  calculateHMDQuaternion: (function () {
    var hmdQuaternion = new THREE.Quaternion();
    return function () {
      var dolly = this.dolly;
      if (!this.zeroed && !dolly.quaternion.equals(this.zeroQuaternion)) {
        this.zeroOrientation();
        this.zeroed = true;
      }
      hmdQuaternion.copy(this.zeroQuaternion).multiply(dolly.quaternion);
      return hmdQuaternion;
    };
  }()),

  zeroOrientation: function () {
    var euler = new THREE.Euler();
    euler.setFromQuaternion(this.dolly.quaternion.clone().inverse());
    // Cancel out roll and pitch. We want to only reset yaw
    euler.z = 0;
    euler.x = 0;
    this.zeroQuaternion.setFromEuler(euler);
  }
};
