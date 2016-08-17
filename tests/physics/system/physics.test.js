var Physics = require('../../../src/physics/system/physics'),
    CustomPhysics = function () {};

AFRAME.utils.extend(CustomPhysics.prototype, Physics);
CustomPhysics.prototype.constructor = CustomPhysics;

suite('physics', function () {
  var system;

  setup(function () {
    system = new CustomPhysics();
  });

  suite('lifecycle', function () {
    test('noop', function () {
      expect(system).to.be.ok;
    });

    test.skip('init', function () {
      // TODO
    });

    test.skip('update', function () {
      // TODO
    });

    test.skip('remove', function () {
      // TODO
    });

    test.skip('play', function () {
      // TODO
    });

    test.skip('pause', function () {
      // TODO
    });
  });
});
