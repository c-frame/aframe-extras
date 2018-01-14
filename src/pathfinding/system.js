const Path = require('three-pathfinding');

const pathfinder = new Path();
const ZONE = 'level';

/**
 * nav
 *
 * Pathfinding system, using PatrolJS.
 */
module.exports = AFRAME.registerSystem('nav', {
  init: function () {
    this.navMesh = null;
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
    pathfinder.setZoneData(ZONE, Path.createZone(this.navMesh.geometry));
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
   * @param  {number} groupID
   * @return {Array<THREE.Vector3>}
   */
  getPath: function (start, end, groupID) {
    return pathfinder.findPath(start, end, ZONE, groupID);
  },

  /**
   * @param {THREE.Vector3} position
   * @return {number}
   */
  getGroup: function (position) {
    return pathfinder.getGroup(ZONE, position);
  },

  /**
   * @param  {THREE.Vector3} position
   * @param  {number} groupID
   * @return {Node}
   */
  getNode: function (position, groupID) {
    return pathfinder.getClosestNode(position, ZONE, groupID, true);
  },

  /**
   * @param  {THREE.Vector3} start Starting position.
   * @param  {THREE.Vector3} end Desired ending position.
   * @param  {number} groupID
   * @param  {Node} node
   * @param  {THREE.Vector3} endTarget (Output) Adjusted step end position.
   * @return {Node} Current node, after step is taken.
   */
  clampStep: function (start, end, groupID, node, endTarget) {
    if (!this.navMesh || !node) {
      endTarget.copy(end);
      return this.navMesh ? this.getNode(end, groupID) : null;
    }
    return pathfinder.clampStep(start, end, node, ZONE, groupID, endTarget);
  }
});
