module.exports = AFRAME.registerComponent('checkpoint', {
  schema: {
    offset: {default: {x: 0, y: 0, z: 0}, type: 'vec3'}
  },

  init: function () {
    this.active = false;
    this.targetEl = null;
    this.fire = this.fire.bind(this);
    this.offset = new THREE.Vector3();
  },

  update: function () {
    this.offset.copy(this.data.offset);
  },

  play: function () { this.el.addEventListener('click', this.fire); },
  pause: function () { this.el.removeEventListener('click', this.fire); },
  remove: function () { this.pause(); },

  fire: function () {
    const targetEl = this.el.sceneEl.querySelector('[checkpoint-controls]');
    if (!targetEl) {
      throw new Error('No `checkpoint-controls` component found.');
    }
    targetEl.components['checkpoint-controls'].setCheckpoint(this.el);
  },

  getOffset: function () {
    return this.offset.copy(this.data.offset);
  }
});
