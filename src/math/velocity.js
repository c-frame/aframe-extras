/**
 * Velocity, in m/s.
 */
module.exports = {
  schema: {type: 'vec3'},

  init: function () {
    this.system = this.el.sceneEl.systems.physics;

    if (this.system) {
      this.system.addBehavior(this, this.system.Phase.RENDER);
    }
  },

  remove: function () {
    if (this.system) {
      this.system.removeBehavior(this, this.system.Phase.RENDER);
    }
  },

  tick: function (t, dt) {
    if (isNaN(dt)) return;
    if (this.system) return;
    this.step(t, dt);
  },

  step: function (t, dt) {
    if (isNaN(dt)) return;

    var physics = this.el.sceneEl.systems.physics || {options:{maxInterval: 1 / 60}},
        velocity = this.el.getComputedAttribute('velocity'),
        position = this.el.getComputedAttribute('position');

    dt = Math.min(dt, physics.options.maxInterval * 1000);

    this.el.setAttribute('position', {
      x: position.x + velocity.x * dt / 1000,
      y: position.y + velocity.y * dt / 1000,
      z: position.z + velocity.z * dt / 1000
    });
  }
};
