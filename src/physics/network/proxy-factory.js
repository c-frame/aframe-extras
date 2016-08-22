var CANNON = require('cannon'),
    Methods = require('./methods');

function ProxyFactory (stream) {
  this.stream = stream;

  this.setHandler = function () {
    console.warn('[CANNON.Proxy] Seters not supported.');
    return false;
  };

  this.applyMutatorHandler = function (target, context, args) {
    stream.push({
      type: 'mutator',
      target: target,
      context: context,
      args: args
    });
    return Reflect.apply(target, context, args);
  };

  this.applyUnavailableHandler = function () {
    throw new Error('[CANNON.Proxy] Method not available.');
  };
}

ProxyFactory.prototype.createVec3 = function (x, y, z) {
  var self = this,
      target = new CANNON.Vec3(x, y, z);
  Methods.Vec3.MUTATORS.forEach(function (method) {
    target[method] = new Proxy(target[method], self.applyMutatorHandler);
  });
  Methods.Vec3.UNAVAILABLE.forEach(function (method) {
    target[method] = new Proxy(target[method], self.applyUnavailableHandler);
  });
  return new Proxy(target, {set: self.setHandler});
};

ProxyFactory.prototype.createBody = function (options) {
  throw new Error('Not implemented');
};

module.exports = ProxyFactory;
