/**
 * 3dof (Gear VR, Daydream) controls for mobile.
 */
module.exports = AFRAME.registerComponent('trackpad-controls', {
  schema: {
    enabled: { default: true },
    enableNegX: { default: true },
    enablePosX: { default: true },
    enableNegZ: { default: true },
    enablePosZ: { default: true },
    mode: { type: 'string', default: 'swipe', oneOf: ['swipe', 'touch', 'press'] }

  },

  init: function () {
    this.dVelocity = new THREE.Vector3();
    this.zVel      = 0;
    this.xVel      = 0;
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
    const targetEl = this.el;

    targetEl.addEventListener('axismove', this.onAxisMove);

    if(this.data.mode == 'swipe' || this.data.mode == 'touch') {
      targetEl.addEventListener('trackpadtouchstart', this.onTouchStart);
      targetEl.addEventListener('trackpadtouchend', this.onTouchEnd);
    }

    if(this.data.mode == 'press') {
      targetEl.addEventListener('trackpaddown', this.onTouchStart);
      targetEl.addEventListener('trackpadup', this.onTouchEnd);
    }

  },

  removeEventListeners: function () {
    const targetEl = this.el;

    targetEl.removeEventListener('axismove', this.onAxisMove);

    if(this.data.mode == 'swipe' || this.data.mode == 'touch') {
      targetEl.removeEventListener('trackpadtouchstart', this.onTouchStart);
      targetEl.removeEventListener('trackpadtouchend', this.onTouchEnd);
    }

    if(this.data.mode == 'press') {
      targetEl.removeEventListener('trackpaddown', this.onTouchStart);
      targetEl.removeEventListener('trackpadup', this.onTouchEnd);
    }

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
    switch(this.data.mode){
      case 'swipe':
        this.canRecordAxis = true;
        this.startingAxisData = [];
        break;
      case 'touch':
        this.isMoving = true;
        break;
      case 'press':
        this.isMoving = true;
        break;
    }

    e.preventDefault();
  },

  onTouchEnd: function (e) {
    if(this.data.mode == 'swipe') {
        this.startingAxisData = [];
    }

    this.isMoving = false;
    e.preventDefault();
  },

  onAxisMove: function(e){
    if(this.data.mode == 'swipe') {
      return this.handleSwipeAxis(e);
    }

    if(this.data.mode == 'touch' || this.data.mode == 'press') {
      return this.handleTouchAxis(e);
    }

  },

  handleSwipeAxis: function(e) {
    var axisData = e.detail.axis;

    if(this.startingAxisData.length === 0 && this.canRecordAxis){
      this.canRecordAxis = false;
      this.startingAxisData[0] = axisData[0];
      this.startingAxisData[1] = axisData[1];
    }


    if(this.startingAxisData.length > 0){
      let velX = 0;
      let velZ = 0;

      if(this.data.enableNegX == true && ( axisData[0] < this.startingAxisData[0] )) {
        velX = -1;
      }

      if(this.data.enablePosX == true && ( axisData[0] > this.startingAxisData[0] )) {
        velX = 1;
      }

      if(this.data.enablePosZ == true && ( axisData[1] > this.startingAxisData[1] )) {
        velZ = -1;
      }

      if(this.data.enableNegZ == true && ( axisData[1] < this.startingAxisData[1] )) {
        velZ = 1;
      }

      const absChangeZ  = Math.abs(this.startingAxisData[1] - axisData[1]);
      const absChangeX  = Math.abs(this.startingAxisData[0] - axisData[0]);

      if(absChangeX > absChangeZ)  {
        this.zVel = 0;
        this.xVel = velX;
        this.isMoving = true;
      }else{
        this.xVel = 0;
        this.zVel = velZ;
        this.isMoving = true;
      }

    }
  },

  handleTouchAxis: function(e) {
    var axisData = e.detail.axis;

    let velX = 0;
    let velZ = 0;

    if(this.data.enableNegX == true && ( axisData[0] < 0 )) {
      velX = -1;
    }

    if(this.data.enablePosX == true && ( axisData[0] > 0 )) {
      velX = 1;
    }

    if(this.data.enablePosZ == true && ( axisData[1] > 0 )) {
      velZ = -1;
    }

    if(this.data.enableNegZ == true && ( axisData[1] < 0 )) {
      velZ = 1;
    }

    if(Math.abs(axisData[0]) > Math.abs(axisData[1])) {
      this.zVel = 0;
      this.xVel = velX;
    }else{
      this.xVel = 0;
      this.zVel = velZ;
    }

  }

});

