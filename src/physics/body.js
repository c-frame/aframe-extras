var CANNON = require('cannon'),
    mesh2shape = require('../../lib/CANNON-mesh2shape');

require('../../lib/CANNON-shape2mesh');

module.exports = {
  dependencies: ['position'],

  init: function () {
    this.initBody();
  },

  initBody: function () {
    this.system = this.el.sceneEl.systems.physics;
    this.system.addBehavior(this, this.system.Phase.SIMULATE);

    var shape = mesh2shape(this.el.object3D);
    if (shape && this.el.sceneEl.hasLoaded) {
      this.initBody_(shape);
    } else if (shape && !this.el.sceneEl.hasLoaded) {
      this.el.sceneEl.addEventListener('loaded', this.initBody_.bind(this, shape));
    } else {
      this.el.addEventListener('model-loaded', function (e) {
        this.initBody_(mesh2shape(e.detail.model));
      }.bind(this));
    }
  },

  initBody_: function (shape) {
    var el = this.el,
        data = this.data,
        pos = el.getAttribute('position');

    if (!pos) {
      pos = {x: 0, y: 0, z: 0};
      el.setAttribute('position', pos);
    }

    // Apply scaling
    if (this.el.hasAttribute('scale')) {
      if (shape.setScale) {
        shape.setScale(this.el.getAttribute('scale'));
      } else {
        console.warn('Physics body scaling could not be applied.');
      }
    }

    this.body = new CANNON.Body({
      mass: data.mass || 0,
      material: this.system.material,
      position: new CANNON.Vec3(pos.x, pos.y, pos.z),
      linearDamping: data.linearDamping,
      angularDamping: data.angularDamping
    });
    this.body.addShape(shape, null, shape.orientation);

    // Apply rotation
    var rot = el.getAttribute('rotation') || {x: 0, y: 0, z: 0};
    this.body.quaternion.setFromEuler(
      THREE.Math.degToRad(rot.x),
      THREE.Math.degToRad(rot.y),
      THREE.Math.degToRad(rot.z),
      'XYZ'
    ).normalize();

    // Show wireframe
    if (this.system.options.debug) {
      this.createWireframe(this.body, shape);
    }

    this.body.el = this.el;
    this.system.addBody(this.body);
  },

  remove: function () {
    this.system.removeBehavior(this, this.system.Phase.SIMULATE);
    if (this.body) this.system.removeBody(this.body);
    if (this.wireframe) this.el.sceneEl.object3D.remove(this.wireframe);
  },

  createWireframe: function (body, shape) {
    var orientation = shape.orientation,
        mesh = CANNON.shape2mesh(body).children[0];
    this.wireframe = new THREE.EdgesHelper(mesh, 0xff0000);

    if (orientation) {
      orientation.inverse(orientation);
      this.wireframe.orientation = new THREE.Quaternion(
        orientation.x,
        orientation.y,
        orientation.z,
        orientation.w
      );
    }

    this.syncWireframe();
    this.el.sceneEl.object3D.add(this.wireframe);
  },

  syncWireframe: function () {
    var wireframe = this.wireframe;

    if (!this.wireframe) return;

    // Apply rotation. If the shape required custom orientation, also apply
    // that on the wireframe.
    wireframe.quaternion.copy(this.body.quaternion);
    if (wireframe.orientation) {
      wireframe.quaternion.multiply(wireframe.orientation);
    }

    // Apply position.
    wireframe.position.copy(this.body.position);

    wireframe.updateMatrix();
  }
};
