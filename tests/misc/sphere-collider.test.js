/* global suite, setup, test, expect */
var entityFactory = require('../helpers').entityFactory;

suite('sphere-collider', function () {
  var collider, collidee;

  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('sphere-collider', 'objects: #collidee');
    el.setAttribute('geometry', 'primitive: sphere');
    collidee = document.createElement('a-entity');
    collidee.setAttribute('id', 'collidee');
    el.parentNode.appendChild(collidee);
    collidee.setAttribute('position', '5 5 5');
    collidee.setAttribute('geometry', 'primitive: sphere');
    el.parentNode.addEventListener('loaded', function () {
      collider = el.components['sphere-collider'];
      done();
    });
  });

  suite('lifecycle', function () {
    test('attaches', function () {
      console.log(this.el.components);
      expect(collider).to.be.ok;
    });
    test('detaches', function (done) {
      this.el.removeAttribute('sphere-collider');
      process.nextTick(function () {
        expect(collider.el.components['sphere-collider']).to.not.be.ok;
        done();
      });
    });
  });

  suite('collisions', function () {
    test('collided state remains until collision ends', function () {
      expect(collidee.is(collider.data.state)).to.be.false;
      collidee.setAttribute('position', collider.el.getAttribute('position'));
      collider.tick();
      expect(collidee.is(collider.data.state)).to.be.true;
      collider.tick();
      expect(collidee.is(collider.data.state)).to.be.true;
      collider.el.setAttribute('position', '5 5 5');
      collider.tick();
      expect(collidee.is(collider.data.state)).to.be.false;
    });
    test('collision radius accounts for collidee scale', function () {
      // Obj3d needs forced update to pickup A-Frame attrs in test context
      collidee.object3D.updateMatrixWorld(true);
      collider.tick();
      expect(collidee.is(collider.data.state)).to.be.false;
      collidee.setAttribute('scale', '10 10  10');
      collidee.object3D.updateMatrixWorld(true);
      collider.tick();
      expect(collidee.is(collider.data.state)).to.be.true;
    });
    test('collision radius accounts for collider scale', function () {
      // Obj3d needs forced update to pickup A-Frame attrs in test context
      collidee.object3D.updateMatrixWorld(true);
      collider.tick();
      expect(collidee.is(collider.data.state)).to.be.false;
      collider.el.setAttribute('scale', '160 1 1');
      collider.el.object3D.updateMatrixWorld(true);
      collider.tick();
      expect(collidee.is(collider.data.state)).to.be.true;
    });
  });
});
