var patrol = require('../../lib/patrol');
window._ = require('underscore');

/**
 * nav
 *
 * Pathfinding system, using PatrolJS.
 */
module.exports = {
  init: function () {
    this.navMesh = null;
    this.nodes = null;
    this.controllers = [];
  },

  /**
   * @param {THREE.Mesh} mesh
   */
  setNavMesh: function (mesh) {
    var geometry = mesh.geometry.isBufferGeometry
      ? new THREE.Geometry().fromBufferGeometry(mesh.geometry)
      : mesh.geometry;
    this.navMesh = new THREE.Mesh(geometry);
    this.nodes = patrol.buildNodes(this.navMesh.geometry);
    patrol.setZoneData('level', this.nodes);
  },

  /**
   * @return {THREE.Mesh}
   */
  getNavMesh: function () {
    return this.navMesh;
  },

  /**
   * @param {NavController} ctrl
   */
  addController: function (ctrl) {
    this.controllers.push(ctrl);
  },

  /**
   * @param  {NavController} ctrl
   * @param  {THREE.Vector3} target
   * @return {Array<THREE.Vector3>}
   */
  getPath: function (ctrl, target) {
    var start = ctrl.el.object3D.position;
    // TODO(donmccurdy): Current group should be cached.
    var group = patrol.getGroup('level', start);
    return patrol.findPath(start, target, 'level', group);
  }
};
