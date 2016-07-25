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
    if (!dt) return;
    if (this.system) return;
    this.step(t, dt);
  },

  step: function (t, dt) {
    if (!dt) return;

    var physics = this.el.sceneEl.systems.physics || {data: {maxInterval: 1 / 60}},

        // TODO - There's definitely a bug with getComputedAttribute and el.data.
        velocity = this.el.getAttribute('velocity') || {x: 0, y: 0, z: 0},
        position = this.el.getAttribute('position') || {x: 0, y: 0, z: 0};

    dt = Math.min(dt, physics.data.maxInterval * 1000);

    this.el.setAttribute('position', {
      x: position.x + velocity.x * dt / 1000,
      y: position.y + velocity.y * dt / 1000,
      z: position.z + velocity.z * dt / 1000
    });
  }
};
