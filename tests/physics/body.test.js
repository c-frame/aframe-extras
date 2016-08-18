var entityFactory = require('../helpers').entityFactory;

var Body = require('../../src/physics/body'),
    CustomBody = function () {};

AFRAME.utils.extend(CustomBody.prototype, Body);
CustomBody.prototype.constructor = CustomBody;

suite('body', function () {
  var el,
      component;

  var body = {type: 'CANNON.Body'},
      physics = {
        removeBehavior: sinon.spy(),
        removeBody: sinon.spy(),
        Phase: {SIMULATE: 0, RENDER: 1}
      };

  setup(function (done) {
    el = body.el = entityFactory();
    el.addEventListener('loaded', function () {
      el.sceneEl.systems.physics = physics;
      component = new CustomBody();
      sinon.stub(component, 'initBody');
      component.el = el;
      done();
    });
  });

  teardown(function () {
    physics.removeBehavior.reset();
    physics.removeBody.reset();
  });

  suite('lifecycle', function () {
    test('init', function () {
      el.sceneEl.hasLoaded = true;
      component.init();
      expect(component.system).to.equal(physics);
      expect(component.initBody).to.have.been.calledOnce;
    });

    test.skip('update', function () {
      // TODO
    });

    test('remove', function () {
      component.wireframe = {type: 'Wireframe'};
      component.body = el.body = body;
      component.remove();
      expect(el.body).to.be.undefined;
      expect(body.el).to.be.undefined;
      expect(component.body).to.be.undefined;
      expect(component.wireframe).to.be.undefined;
    });

    test.skip('play', function () {
      // TODO
    });

    test('pause', function () {
      component.isLoaded = true;
      component.system = physics;
      component.body = el.body = body;
      component.pause();
      expect(physics.removeBehavior).to.have.been.calledWith(component, physics.Phase.SIMULATE);
      expect(physics.removeBody).to.have.been.calledWith(body);
    });
  });

  suite('sync', function () {
    test.skip('syncToPhysics', function () {
      // TODO
    });

    test.skip('syncFromPhysics', function () {
      // TODO
    });
  });
});
