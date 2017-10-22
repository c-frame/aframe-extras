const Path = require('three-pathfinding');

const ZONE = 'level';

/**
 * nav
 *
 * Pathfinding system, using PatrolJS.
 */
module.exports = AFRAME.registerSystem('nav', {
  init: function () {
    this.navMesh = null;
    this.zone = null;
    this.agents = new Set();
  },

  /**
   * @param {THREE.Mesh} mesh
   */
  setNavMesh: function (mesh) {
    const geometry = mesh.geometry.isBufferGeometry
      ? new THREE.Geometry().fromBufferGeometry(mesh.geometry)
      : mesh.geometry;
    this.navMesh = new THREE.Mesh(geometry);
    this.zone = Path.buildNodes(this.navMesh.geometry);
    Path.setZoneData(ZONE, this.zone);
  },

  /**
   * @return {THREE.Mesh}
   */
  getNavMesh: function () {
    return this.navMesh;
  },

  /**
   * @param {NavAgent} ctrl
   */
  addAgent: function (ctrl) {
    this.agents.add(ctrl);
  },

  /**
   * @param {NavAgent} ctrl
   */
  removeAgent: function (ctrl) {
    this.agents.remove(ctrl);
  },

  /**
   * @param  {THREE.Vector3} start
   * @param  {THREE.Vector3} end
   * @param  {Path.Group} group
   * @return {Array<THREE.Vector3>}
   */
  getPath: function (start, end, group) {
    return Path.findPath(start, end, ZONE, group);
  },

  /**
   * @param {THREE.Vector3} position
   * @return {Path.Group}
   */
  getGroup: function (position) {
    return Path.getGroup(ZONE, position);
  },

  /**
   * @param  {THREE.Vector3} position
   * @param  {Path.Group} group
   * @return {Path.Node}
   */
  getNode: function (position, group) {
    return Path.getClosestNode(position, ZONE, group, true);
  },

  /**
   * @param  {THREE.Vector3} start Starting position.
   * @param  {THREE.Vector3} end Desired ending position.
   * @param  {Path.Group} group
   * @param  {Path.Node} node
   * @param  {THREE.Vector3} endTarget (Output) Adjusted step end position.
   * @return {Path.Node} Current node, after step is taken.
   */
  clampStep: function (start, end, group, node, endTarget) {
    if (!this.navMesh || !node) {
      endTarget.copy(end);
      return this.navMesh ? Path.getNode(ZONE, group) : null;
    }
    return Path.clampStep(start, end, node, ZONE, group, endTarget);
  }
});

