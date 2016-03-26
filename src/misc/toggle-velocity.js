/**
 * Toggle velocity.
 *
 * Moves an object back and forth along an axis, within a min/max extent.
 */
module.exports = {
  dependencies: ['velocity'],
  schema: {
    axis: { default: 'x', oneOf: ['x', 'y', 'z'] },
    min: { default: 0 },
    max: { default: 0 },
    speed: { default: 1 }
  },
  init: function () {
    var velocity = {x: 0, y: 0, z: 0};
    velocity[this.data.axis] = this.data.speed;
    this.el.setAttribute('velocity', velocity);

    if (this.el.sceneEl.addBehavior) this.el.sceneEl.addBehavior(this);
  },
  remove: function () {},
  update: function () { this.tick(); },
  tick: function () {
    var data = this.data,
        velocity = this.el.getAttribute('velocity'),
        position = this.el.getAttribute('position');
    if (velocity[data.axis] > 0 && position[data.axis] > data.max) {
      velocity[data.axis] = -data.speed;
      this.el.setAttribute('velocity', velocity);
    } else if (velocity[data.axis] < 0 && position[data.axis] < data.min) {
      velocity[data.axis] = data.speed;
      this.el.setAttribute('velocity', velocity);
    }
  },
};
