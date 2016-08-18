var ProxyObject = require('./proxy-object'),
    ProxyVec3 = require('./proxy-vec3'),
    CANNON = require('cannon');

function ProxyWorld (options) {
  ProxyObject.call(this, 'ProxyWorld', new CANNON.World());
  Object.keys(options).forEach(function (key) {
    this.__state[key] = options[key];
  }.bind(this));
  this.gravity = new ProxyVec3();
}

ProxyWorld.prototype = Object.create(ProxyObject.prototype);
ProxyWorld.prototype.constructor = ProxyWorld;

ProxyWorld.Methods = {
  PASSIVE: [],
  MUTATORS: [
    'add',
    'addConstraint',
    'clearForces',
    'removeBody',
    'removeConstraint',
  ],
  UNAVAILABLE: [
    'addContactMaterial',
    'addEventListener',
    'addMaterial',
    'collisionMatrixTick',
    'dispatchEvent',
    'getContactMaterial',
    'hasEventListener',
    'raycastAll',
    'raycastAny',
    'raycastClosest',
    'removeEventListener',
    'step'
  ],
  CUSTOM: []
};

module.exports = ProxyWorld;
