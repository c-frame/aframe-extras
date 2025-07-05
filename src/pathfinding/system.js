import { Pathfinding } from 'three-pathfinding';

const pathfinder = new Pathfinding();
const ZONE = 'level';

/**
 * nav
 *
 * Pathfinding system, using PatrolJS.
 */
AFRAME.registerSystem('nav', {
  init: function () {
    this.navMesh = null;
    this.agents = new Set();
  },

  /**
   * @param {THREE.Geometry} geometry
   */
  setNavMeshGeometry: function (geometry) {
    this.navMesh = new THREE.Mesh(geometry);
    pathfinder.setZoneData(ZONE, Pathfinding.createZone(geometry));
    Array.from(this.agents).forEach((agent) => agent.updateNavLocation());
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
    this.agents.delete(ctrl);
  },

  /**
   * @param  {THREE.Vector3} start
   * @param  {THREE.Vector3} end
   * @param  {number} groupID
   * @return {Array<THREE.Vector3>}
   */
  getPath: function (start, end, groupID) {
    return this.navMesh
      ? pathfinder.findPath(start, end, ZONE, groupID)
      : null;
  },

  /**
   * @param {THREE.Vector3} position
   * @return {number}
   */
  getGroup: function (position) {
    return this.navMesh
      ? pathfinder.getGroup(ZONE, position)
      : null;
  },

  /**
   * @param  {THREE.Vector3} position
   * @param  {number} groupID
   * @return {Node}
   */
  getNode: function (position, groupID) {
    return this.navMesh
      ? pathfinder.getClosestNode(position, ZONE, groupID, true)
      : null;
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
    if (!this.navMesh) {
      endTarget.copy(end);
      return null;
    } else if (!node) {
      endTarget.copy(end);
      return this.getNode(end, groupID);
    }
    return pathfinder.clampStep(start, end, node, ZONE, groupID, endTarget);
  }
});
