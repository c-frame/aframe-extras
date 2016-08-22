var Body = {
  PASSIVE: [],
  MUTATORS: [
    'applyForce',
    'applyImpulse',
    'applyLocalForce',
    'applyLocalImpulse'
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
    'sleep',
    'updateBoundingRadius',
    'updateInertiaWorld',
    'updateMassProperties',
    'updateSolveMassProperties',
    'vectorToLocalFrame',
    'vectorToWorldFrame',
    'wakeUp'
  ],
  CUSTOM: [
    'addShape',
  ]
};

var Vec3 = {
  PASSIVE: [
    'almostEquals',
    'almostZero',
    'cross',
    'crossmat',
    'distanceSquared',
    'distanceTo',
    'isAntiparallelTo',
    'isZero',
    'length',
    'lengthSquared',
    'negate',
    'scale',
    'tangents',
    'toArray',
    'toString',
    'unit',
    'vadd',
    'vsub'
  ],
  MUTATORS: [
    'copy',
    'normalize',
    'set',
    'setZero',
  ],
  UNAVAILABLE: [
    'clone',
    'dot',
    'lerp',
  ]
};

var World = {
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

module.exports = {
  Body: Body,
  Vec3: Vec3,
  World: World
};
