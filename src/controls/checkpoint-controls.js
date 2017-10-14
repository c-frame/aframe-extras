var EPS = 0.1;

module.exports = {
  schema: {
    enabled: {default: true},
    mode: {default: 'teleport', oneOf: ['teleport', 'animate']},
    animateSpeed: {default: 3.0}
  },

  init: function () {
    this.active = true;
    this.checkpoint = null;

    this.offset = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();
  },

  play: function () { this.active = true; },
  pause: function () { this.active = false; },

  setCheckpoint: function (checkpoint) {
    var el = this.el;

    if (!this.active) return;
    if (this.checkpoint === checkpoint) return;

    if (this.checkpoint) {
      el.emit('navigation-end', {checkpoint: this.checkpoint});
    }

    this.checkpoint = checkpoint;
    this.sync();

    // Ignore new checkpoint if we're already there.
    if (this.position.distanceTo(this.targetPosition) < EPS) {
      this.checkpoint = null;
      return;
    }

    el.emit('navigation-start', {checkpoint: checkpoint});

    if (this.data.mode === 'teleport') {
      this.el.setAttribute('position', this.targetPosition);
      this.checkpoint = null;
      el.emit('navigation-end', {checkpoint: checkpoint});
    }
  },

  isVelocityActive: function () {
    return !!(this.active && this.checkpoint);
  },

  getVelocity: function () {
    if (!this.active) return;

    var data = this.data,
        offset = this.offset,
        position = this.position,
        targetPosition = this.targetPosition,
        checkpoint = this.checkpoint;

    this.sync();
    if (position.distanceTo(targetPosition) < EPS) {
      this.checkpoint = null;
      this.el.emit('navigation-end', {checkpoint: checkpoint});
      return offset.set(0, 0, 0);
    }
    offset.setLength(data.animateSpeed);
    return offset;
  },

  sync: function () {
    var offset = this.offset,
        position = this.position,
        targetPosition = this.targetPosition;

    position.copy(this.el.getAttribute('position'));
    targetPosition.copy(this.checkpoint.object3D.getWorldPosition());
    targetPosition.add(this.checkpoint.components.checkpoint.getOffset());
    offset.copy(targetPosition).sub(position);
  }
};
