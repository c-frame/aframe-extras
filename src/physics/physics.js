var CONSTANTS = require('./constants'),
    C_GRAV = CONSTANTS.GRAVITY,
    C_MAT = CONSTANTS.CONTACT_MATERIAL;

module.exports = {
  schema: {
    gravity:                            { default: C_GRAV },
    friction:                           { default: C_MAT.friction },
    restitution:                        { default: C_MAT.restitution },
    contactEquationStiffness:           { default: C_MAT.contactEquationStiffness },
    contactEquationRelaxation:          { default: C_MAT.contactEquationRelaxation },
    frictionEquationStiffness:          { default: C_MAT.frictionEquationStiffness },
    frictionEquationRegularization:     { default: C_MAT.frictionEquationRegularization },

    // Never step more than four frames at once. Effectively pauses the scene
    // when out of focus, and prevents weird "jumps" when focus returns.
    maxInterval:      { default: 4 / 60 },

    // If true, show wireframes around physics bodies.
    debug:        { default: false },
  },

  update: function (previousData) {
    var data = this.data,
        schema = this.schema;
    for (var opt in data) {
      if (data[opt] !== (previousData ? previousData[opt] : schema[opt].default)) {
        this.system.setOption(opt, data[opt]);
      }
    }
  }
};
