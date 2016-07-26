var entityFactory = require('../helpers').entityFactory;

suite('quaternion', function () {
  var el,
      component;

  setup(function (done) {
    el = this.el = entityFactory();
    el.setAttribute('quaternion', '');
    el.addEventListener('loaded', function () {
      component = el.components.quaternion;
      done();
    });
  });

  suite('update', function () {
    test('defaults to null transform', function () {
      component.update();
      expect(el.object3D.quaternion).to.shallowDeepEqual({
        x: 0, y: 0, z: 0
      });
    });

    test('applies quaternion on update', function () {
      el.setAttribute('quaternion', '0.707 0 0 0.707');
      expect(el.object3D.quaternion).to.shallowDeepEqual({
        x: 0.707, y: 0, z: 0, w: 0.707
      });
    });
  });
});
