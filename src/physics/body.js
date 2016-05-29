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

    var shape, options;

    if (this.data.shape !== 'auto') {
      options = {
        type: mesh2shape.Type[this.data.shape.toUpperCase()]
      };
    }

    // TODO - This is pretty obtuse. There really ought to be a clean way to
    // delay component initialization until the scene and all of its components
    // have been taken care of.
    shape = mesh2shape(this.el.object3D, options);
    if (shape && this.el.sceneEl.hasLoaded) {
      this.initBody_(shape);
    } else if (shape && !this.el.sceneEl.hasLoaded) {
      this.el.sceneEl.addEventListener('loaded', this.initBody_.bind(this, shape));
    } else if (!this.el.sceneEl.hasLoaded) {
      this.el.sceneEl.addEventListener('loaded', function () {
        shape = mesh2shape(this.el.object3D, options);
        if (shape) {
          this.initBody_(shape);
        } else {
          this.el.addEventListener('model-loaded', function (e) {
            this.initBody_(mesh2shape(e.detail.model, options));
          }.bind(this));
        }
      }.bind(this));
    } else {
      this.el.addEventListener('model-loaded', function (e) {
        this.initBody_(mesh2shape(e.detail.model, options));
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
    this.body.addShape(shape, shape.offset, shape.orientation);

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

    this.el.body = this.body;
    this.body.el = this.el;
    this.loaded = true;
    this.play();

    this.el.emit('body-loaded', {body: this.el.body});
  },

  play: function () {
    if (!this.loaded) return;

    this.system.addBehavior(this, this.system.Phase.SIMULATE);
    this.system.addBody(this.body);
    if (this.wireframe) this.el.sceneEl.object3D.add(this.wireframe);

    this.syncToPhysics();
  },

  pause: function () {
    if (!this.loaded) return;

    this.system.removeBehavior(this, this.system.Phase.SIMULATE);
    this.system.removeBody(this.body);
    if (this.wireframe) this.el.sceneEl.object3D.remove(this.wireframe);
  },

  remove: function () {
    this.pause();
    delete this.body.el;
    delete this.body;
    delete this.el.body;
    delete this.wireframe;
  },

  createWireframe: function (body, shape) {
    var offset = shape.offset,
        orientation = shape.orientation,
        mesh = CANNON.shape2mesh(body).children[0];
    this.wireframe = new THREE.EdgesHelper(mesh, 0xff0000);

    if (offset) {
      this.wireframe.offset = offset.clone();
    }

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
  },

  syncWireframe: function () {
    var offset,
        wireframe = this.wireframe;

    if (!this.wireframe) return;

    // Apply rotation. If the shape required custom orientation, also apply
    // that on the wireframe.
    wireframe.quaternion.copy(this.body.quaternion);
    if (wireframe.orientation) {
      wireframe.quaternion.multiply(wireframe.orientation);
    }

    // Apply position. If the shape required custom offset, also apply that on
    // the wireframe.
    wireframe.position.copy(this.body.position);
    if (wireframe.offset) {
      offset = wireframe.offset.clone().applyQuaternion(wireframe.quaternion);
      wireframe.position.add(offset);
    }

    wireframe.updateMatrix();
  },

  syncToPhysics: function () {
    if (!this.body) return;
    if (this.el.components.velocity) this.body.velocity.copy(this.el.getAttribute('velocity'));
    if (this.el.components.position) this.body.position.copy(this.el.getAttribute('position'));
    if (this.wireframe) this.syncWireframe();
  },

  syncFromPhysics: function () {
    if (!this.body) return;
    this.el.setAttribute('quaternion', this.body.quaternion);
    this.el.setAttribute('position', this.body.position);
    if (this.wireframe) this.syncWireframe();
  }
};
