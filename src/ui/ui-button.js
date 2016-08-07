var AxisConstraint = require('../physics/constraints/axis-constraint');

module.exports = {
  schema: {
    axis:          {default: 'z', oneOf: ['x', 'y', 'z']},
    pressDistance: {default: 0.1, min: 0.0001},
    eventType:     {default: 'click'}
  },

  init: function () {
    var el = this.el;

    this.physics = /* {AFRAME.System} */ this.el.sceneEl.systems.physics;
    this.constraints = /* {Array<CANNON.Constraint>} */ [];

    if (!el.hasAttribute('dynamic-body')) {
      el.setAttribute('dynamic-body', {fixedRotation: true});
    }

    if (el.body) {
      this.bindConstraints();
    } else {
      el.addEventListener('body-loaded', this.bindConstraints.bind(this));
    }

    if (this.data.axis !== 'z') {
      console.log('TODO - button axes !== z not implemented yet');
    }
  },

  bindConstraints: function () {
    var data = this.data,
        body = this.el.body,
        physics = this.physics;

    this.constraints = [
      new AxisConstraint(body, {axis: 'x', maxValue: body.position.x, minValue: body.position.x}),
      new AxisConstraint(body, {axis: 'y', maxValue: body.position.y, minValue: body.position.y}),
      new AxisConstraint(body, {
        axis: 'z',
        maxValue: body.position.z,
        minValue: body.position.z - data.pressDistance
      })
    ];

    this.constraints.forEach(function (constraint) {
      physics.addBehavior(constraint, physics.Phase.SIMULATE);
    });
  },

  remove: function () {
    var physics = this.physics;
    this.constraints.forEach(function (constraint) {
      physics.addBehavior(constraint, physics.Phase.SIMULATE);
    });
  }
};
