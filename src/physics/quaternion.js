/**
 * Quaternion.
 *
 * Represents orientation of object in three dimensions. Similar to `rotation`
 * component, but avoids problems of gimbal lock.
 *
 * See: https://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation
 */
module.exports = {
  schema: {
    // TODO - type: vec4
    x: { default: 0 },
    y: { default: 0 },
    z: { default: 0 },
    w: { default: 0 }
  },
  init: function () {
    if (this.el.sceneEl.addBehavior) this.el.sceneEl.addBehavior(this);
  },
  remove: function () {},
  update: function () { this.tick(); },
  tick: function () {
    var data = this.data;
    this.el.object3D.quaternion.set(data.x, data.y, data.z, data.w);
  }
};
