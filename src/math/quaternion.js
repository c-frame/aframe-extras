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
  tick: function () {
    var data = this.data;
    this.el.object3D.quaternion.set(data.x, data.y, data.z, data.w);
  }
};
