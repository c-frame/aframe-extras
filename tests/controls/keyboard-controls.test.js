const entityFactory = require('../helpers').entityFactory;
const KeyboardEvent = window.KeyboardEvent;

suite('keyboard-controls', () => {
  let el, keyboardControls;

  setup((done) => {
    el = entityFactory();
    el.setAttribute('keyboard-controls', '');
    el.addEventListener('loaded', () => {
      keyboardControls = el.components['keyboard-controls'];
      done();
    });
  });

  suite('isVelocityActive', () => {
    test('not active by default', () => {
      expect(keyboardControls.isVelocityActive()).to.be.false;
    });

    test('active when target key is pressed', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyW'}));
      expect(keyboardControls.isVelocityActive()).to.be.true;
      window.dispatchEvent(new KeyboardEvent('keyup', {code: 'KeyW'}));
      expect(keyboardControls.isVelocityActive()).to.be.false;
    });

    test('inactive when disabled', () => {
      el.setAttribute('keyboard-controls', {enabled: false});
      window.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyW'}));
      expect(keyboardControls.isVelocityActive()).to.be.false;
    });
  });

  suite('getVelocityDelta', () => {
    test('updates position with WASD keys', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyW'}));
      expect(keyboardControls.getVelocityDelta()).to.shallowDeepEqual({x: 0, y: 0, z: -1});
      window.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyA'}));
      expect(keyboardControls.getVelocityDelta()).to.shallowDeepEqual({x: -1, y: 0, z: -1});
      window.dispatchEvent(new KeyboardEvent('keyup', {code: 'KeyW'}));
      window.dispatchEvent(new KeyboardEvent('keyup', {code: 'KeyA'}));
      expect(keyboardControls.getVelocityDelta()).to.shallowDeepEqual({x: 0, y: 0, z: 0});
    });

    test('updates position with arrow keys', () => {
      window.dispatchEvent(new KeyboardEvent('keydown', {code: 'ArrowUp'}));
      expect(keyboardControls.getVelocityDelta()).to.shallowDeepEqual({x: 0, y: 0, z: -1});
      window.dispatchEvent(new KeyboardEvent('keydown', {code: 'ArrowLeft'}));
      expect(keyboardControls.getVelocityDelta()).to.shallowDeepEqual({x: -1, y: 0, z: -1});
      window.dispatchEvent(new KeyboardEvent('keyup', {code: 'ArrowUp'}));
      window.dispatchEvent(new KeyboardEvent('keyup', {code: 'ArrowLeft'}));
      expect(keyboardControls.getVelocityDelta()).to.shallowDeepEqual({x: 0, y: 0, z: 0});
    });
  });
});
