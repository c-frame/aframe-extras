/**
 * Constrains a body's movement along a particular axis.
 * @class AxisConstraint
 * @constructor
 * @param {Body} body
 * @param {Object} [options]
 * @extends Constraint
 */
function AxisConstraint(body, options){
    options = options || {};

    /** @property {CANNON.Body} body */
    this.body = body;

    /** @property {string} axis */
    this.axis = options.axis || 'x';

    /** @property {number} maxForce */
    this.maxForce = typeof options.maxForce === 'undefined'
      ? 1e6
      : options.maxForce;

    /** @property {number} maxValue */
    this.maxValue = typeof options.maxValue === 'undefined'
      ? body.position[this.axis]
      : options.maxValue;

    /** @property {number} minValue */
    this.minValue = typeof options.minValue === 'undefined'
      ? body.position[this.axis]
      : options.minValue;
}

AxisConstraint.prototype.step = function () {
  this.update();
};

AxisConstraint.prototype.update = function () {
    var body = this.body,
        axis = this.axis;

    if (body.position[axis] > this.maxValue) {
      body.position[axis] = this.maxValue;
      body.velocity[axis] = 0;
    } else if (body.position[axis] < this.minValue) {
      body.position[axis] = this.minValue;
      body.velocity[axis] = 0;
    }
};

module.exports = AxisConstraint;
