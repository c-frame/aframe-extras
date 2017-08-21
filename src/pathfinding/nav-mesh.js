/**
 * nav-mesh
 *
 * Waits for a mesh to be loaded on the current entity, then sets it as the
 * nav mesh in the pathfinding system.
 */
module.exports = {
  init: function () {
    this.system = this.el.sceneEl.systems.nav;
    this.loadNavMesh();
    this.el.addEventListener('model-loaded', this.loadNavMesh.bind(this));
  },

  loadNavMesh: function () {
    var object = this.el.getObject3D('mesh');

    if (!object) return;

    var navMesh;
    object.traverse(function (node) {
      if (node.isMesh) navMesh = node;
    });

    if (!navMesh) return;

    this.system.setNavMesh(navMesh);
  }
};
