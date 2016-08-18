var ProxyObject = require('./proxy-object'),
    CANNON = require('cannon');

function ProxyVec3 (x, y, z) {
  ProxyObject.call(this, 'ProxyVec3', new CANNON.Vec3(x || 0, y || 0, z || 0));
}

ProxyVec3.prototype = Object.create(ProxyObject.prototype);
ProxyVec3.prototype.constructor = ProxyVec3;

ProxyVec3.Methods = {
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

module.exports = ProxyVec3;
