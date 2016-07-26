/**
 * Quaternion.
 *
 * Represents orientation of object in three dimensions. Similar to `rotation`
 * component, but avoids problems of gimbal lock.
 *
 * See: https://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation
 */
module.exports = {
  schema: {type: 'vec4'},

  play: function () {
    var el = this.el,
        q = el.object3D.quaternion;
    if (el.hasAttribute('rotation')) {
      el.components.rotation.update();
      el.setAttribute('quaternion', {x: q.x, y: q.y, z: q.z, w: q.w});
      el.removeAttribute('rotation');
      this.update();
    }
  },

  update: function () {
    var data = this.data;
    this.el.object3D.quaternion.set(data.x, data.y, data.z, data.w);
  }
};
