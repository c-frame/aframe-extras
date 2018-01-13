/* global suite, setup, test, expect */
const entityFactory = require('../helpers').entityFactory;

suite('sphere-collider', () => {
  let el, collider, collidee;

  setup((done) => {
    el = entityFactory();
    el.setAttribute('sphere-collider', 'objects: #collidee');
    el.setAttribute('geometry', 'primitive: sphere');
    collidee = document.createElement('a-entity');
    collidee.setAttribute('id', 'collidee');
    el.parentNode.appendChild(collidee);
    collidee.setAttribute('position', '5 5 5');
    collidee.setAttribute('geometry', 'primitive: sphere');
    el.parentNode.addEventListener('loaded', () => {
      collider = el.components['sphere-collider'];
      done();
    });
  });

  suite('lifecycle', () => {
    test('attaches', () => {
      expect(collider).to.be.ok;
    });
    test('detaches', (done) =>  {
      el.removeAttribute('sphere-collider');
      process.nextTick(() => {
        expect(collider.el.components['sphere-collider']).to.not.be.ok;
        done();
      });
    });
  });

  suite('collisions', () => {
    test('collided state remains until collision ends', () => {
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
    test('collision radius accounts for collidee scale', () => {
      // Obj3d needs forced update to pickup A-Frame attrs in test context
      collidee.object3D.updateMatrixWorld(true);
      collider.tick();
      expect(collidee.is(collider.data.state)).to.be.false;
      collidee.setAttribute('scale', '10 10  10');
      collidee.object3D.updateMatrixWorld(true);
      collider.tick();
      expect(collidee.is(collider.data.state)).to.be.true;
    });
    test('collision radius accounts for collider scale', () => {
      // Obj3d needs forced update to pickup A-Frame attrs in test context
      collidee.object3D.updateMatrixWorld(true);
      collider.tick();
      expect(collidee.is(collider.data.state)).to.be.false;
      collider.el.setAttribute('scale', '160 1 1');
      collider.el.object3D.updateMatrixWorld(true);
      collider.tick();
      expect(collidee.is(collider.data.state)).to.be.true;
    });
    test('hit and hitend event emission', function () {
      const hitSpy = sinon.spy(),
          hitEndSpy = sinon.spy(),
          targetHitSpy = sinon.spy(),
          targetHitEndSpy = sinon.spy();
      collider.el.addEventListener('hit', hitSpy);
      collider.el.addEventListener('hitend', hitEndSpy);
      collidee.addEventListener('hit', targetHitSpy);
      collidee.addEventListener('hitend', targetHitEndSpy);
      collidee.setAttribute('position', collider.el.getAttribute('position'));
      collider.tick();
      expect(hitSpy.calledWithMatch({detail: {el: collidee}})).to.be.true;
      expect(targetHitSpy.called).to.be.true;
      collider.el.setAttribute('position', '5 5 5');
      collider.tick();
      expect(hitEndSpy.calledWithMatch({detail: {el: collidee}})).to.be.true;
      expect(targetHitEndSpy.called).to.be.true;
    });
  });
});
