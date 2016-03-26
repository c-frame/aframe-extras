/**
 * Velocity, in m/s.
 */
module.exports = {
  schema: {type: 'vec3'},
  tick: function (t, dt) {
    if (isNaN(dt)) { return; }

    var physics = this.el.sceneEl.components.physics || {data:{maxInterval: 1 / 60}},
        velocity = this.el.getAttribute('velocity'), // TODO - why not this.el.data?
        position = this.el.getAttribute('position');

    dt = Math.min(dt, physics.data.maxInterval * 1000);

    this.el.setAttribute('position', {
      x: position.x + velocity.x * dt / 1000,
      y: position.y + velocity.y * dt / 1000,
      z: position.z + velocity.z * dt / 1000
    });
  },
};
