/**
 * 3dof (Gear VR, Daydream) controls for mobile.
 */
module.exports = AFRAME.registerComponent('trackpad-controls', {
  schema: {
    enabled: { default: true }
  },

  init: function () {
    this.dVelocity = new THREE.Vector3();
    this.zVel      = 0;
    this.bindMethods();
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

    sceneEl.addEventListener('axismove', this.onAxisMove);
    sceneEl.addEventListener('trackpadtouchstart', this.onTouchStart);
    sceneEl.addEventListener('trackpadtouchend', this.onTouchEnd);

  },

  removeEventListeners: function () {
    const sceneEl = this.el.sceneEl;

    sceneEl.removeEventListener('axismove', this.onAxisMove);
    sceneEl.removeEventListener('trackpadtouchstart', this.onTouchStart);
    sceneEl.removeEventListener('trackpadtouchend', this.onTouchEnd);

  },

  isVelocityActive: function () {
    return this.data.enabled && this.isMoving;
  },

  getVelocityDelta: function () {
    this.dVelocity.z = this.isMoving ? -this.zVel : 1;
    this.dVelocity.x = this.isMoving ? this.xVel : 1;
    return this.dVelocity.clone();
  },

  bindMethods: function () {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onAxisMove = this.onAxisMove.bind(this);
  },

  onTouchStart: function (e) {
    this.canRecordAxis = true;
    this.startingAxisData = [];
    e.preventDefault();
  },

  onTouchEnd: function (e) {
    this.startingAxisData = [];
    this.isMoving = false;
    e.preventDefault();
  },

  onAxisMove: function(e){
    var axis_data = e.detail.axis;

    if(this.startingAxisData.length === 0 && this.canRecordAxis){
      this.canRecordAxis = false;
      this.startingAxisData[0] = axis_data[0];
      this.startingAxisData[1] = axis_data[1];
      this.isMoving = true;
    }


    if(this.startingAxisData.length > 0){
      const velX = axis_data[0] < this.startingAxisData[0] ? -1 : 1;
      const velZ = axis_data[1] < this.startingAxisData[1] ? 1 : -1;

      const absChangeZ = Math.abs(this.startingAxisData[1] - axis_data[1]);
      const absChangeX = Math.abs(this.startingAxisData[0] - axis_data[0]);

      if(absChangeZ > absChangeX) {
        this.xVel = 0;
        this.zVel = velZ;

      }else{
        this.zVel = 0;
        this.xVel = velX;
      }

    }
  }
});

