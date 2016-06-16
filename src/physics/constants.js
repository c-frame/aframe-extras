module.exports = {
  GRAVITY: -9.8,
  MAX_INTERVAL: 4 / 60,
  ITERATIONS: 10,
  CONTACT_MATERIAL: {
    friction:     0.01,
    restitution:  0.3,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8,
    frictionEquationRegularization: 3
  }
};
