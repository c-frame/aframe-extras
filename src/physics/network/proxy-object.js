function ProxyObject (name, state) {
  this.__name = name;
  this.__state = state;
  this.__buffer = [];
  this.prototype.constructor.Methods.PASSIVE.forEach(this.__attachPassive.bind(this));
  this.prototype.constructor.Methods.MUTATORS.forEach(this.__attachMutator.bind(this));
  this.prototype.constructor.Methods.UNAVAILABLE.forEach(this.__attachUnavailable.bind(this));
}

ProxyObject.prototype.__attachMutator = function (method) {
  var self = this;
  this[method] = function () {
    self.__state[method].apply(self, arguments);
    self.__buffer.push({method: method, args: arguments});
    return self;
  };
};

ProxyObject.prototype.__attachPassive = function (method) {
  var self = this;
  this[method] = function () {
    return self.__state[method].apply(self, arguments);
  };
};

ProxyObject.prototype.__attachUnavailable = function (method) {
  var self = this;
  this[method] = function () {
    throw new Error('%s.%s not supported in proxy.', self.__name, method);
  };
};

ProxyObject.prototype.__serialize = function () {
  throw new Error('Not implemented.');
};

ProxyObject.prototype.__unserialize = function () {
  throw new Error('Not implemented.');
};

module.exports = ProxyObject;
