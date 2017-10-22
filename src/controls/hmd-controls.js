const radToDeg = THREE.Math.radToDeg,
    isMobile = AFRAME.utils.device.isMobile();

module.exports = AFRAME.registerComponent('hmd-controls', {
  schema: {
    enabled: {default: true},
    standing: {default: true}
  },

  init: function () {
    this.isPositionCalibrated = false;
    this.isNavMeshConstrained = false;
    this.dolly = new THREE.Object3D();
    this.hmdEuler = new THREE.Euler();
    this.previousHMDPosition = new THREE.Vector3();
    this.deltaHMDPosition = new THREE.Vector3();
    this.vrControls = new THREE.VRControls(this.dolly);
    this.rotation = new THREE.Vector3();
  },

  update: function () {
    const data = this.data;
    const vrControls = this.vrControls;
    vrControls.standing = data.standing;
    vrControls.update();
  },

  tick: function () {
    this.vrControls.update();
  },

  remove: function () {
    this.vrControls.dispose();
  },

  isRotationActive: function () {
    const hmdEuler = this.hmdEuler;
    if (!this.data.enabled || !(this.el.sceneEl.is('vr-mode') || isMobile)) {
      return false;
    }
    hmdEuler.setFromQuaternion(this.dolly.quaternion, 'YXZ');
    return !isNullVector(hmdEuler);
  },

  getRotation: function () {
    const hmdEuler = this.hmdEuler;
    return this.rotation.set(
      radToDeg(hmdEuler.x),
      radToDeg(hmdEuler.y),
      radToDeg(hmdEuler.z)
    );
  },

  isVelocityActive: function () {
    const deltaHMDPosition = this.deltaHMDPosition;
    const previousHMDPosition = this.previousHMDPosition;
    const currentHMDPosition = this.calculateHMDPosition();
    this.isPositionCalibrated = this.isPositionCalibrated || !isNullVector(previousHMDPosition);
    if (!this.data.enabled || !this.el.sceneEl.is('vr-mode') || isMobile) {
      return false;
    }
    deltaHMDPosition.copy(currentHMDPosition).sub(previousHMDPosition);
    previousHMDPosition.copy(currentHMDPosition);
    return this.isPositionCalibrated && !isNullVector(deltaHMDPosition);
  },

  getPositionDelta: function () {
    return this.deltaHMDPosition;
  },

  calculateHMDPosition: function () {
    const dolly = this.dolly;
    const position = new THREE.Vector3();
    dolly.updateMatrix();
    position.setFromMatrixPosition(dolly.matrix);
    return position;
  }
});

function isNullVector (vector) {
  return vector.x === 0 && vector.y === 0 && vector.z === 0;
}
