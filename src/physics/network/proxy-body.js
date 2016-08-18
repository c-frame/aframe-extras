var ProxyObject = require('./proxy-object'),
    ProxyVec3 = require('./proxy-vec3'),
    CANNON = require('cannon');

function ProxyBody (options) {
  ProxyObject.call(this, 'ProxyBody', new CANNON.Body(options));
  this.position = new ProxyVec3();
  this.velocity = new ProxyVec3();
}

ProxyBody.prototype = Object.create(ProxyObject.prototype);
ProxyBody.prototype.constructor = ProxyBody;

ProxyBody.Methods = {
  PASSIVE: [],
  MUTATORS: [
    'applyForce',
    'applyImpulse',
    'applyLocalForce',
    'applyLocalImpulse',
    'sleep',
    'wakeUp'
  ],
  UNAVAILABLE: [
    'addEventListener',
    'computeAABB',
    'dispatchEvent',
    'getVelocityAtWorldPoint',
    'hasEventListener',
    'pointToLocalFrame',
    'pointToWorldFrame',
    'removeEventListener',
    'sleepTick',
    'updateBoundingRadius',
    'updateInertiaWorld',
    'updateMassProperties',
    'updateSolveMassProperties',
    'vectorToLocalFrame',
    'vectorToWorldFrame',
  ],
  CUSTOM: [
    'addShape',
  ]
};

module.exports = ProxyBody;
