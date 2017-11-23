/**
 * nav-mesh
 *
 * Waits for a mesh to be loaded on the current entity, then sets it as the
 * nav mesh in the pathfinding system.
 */
module.exports = AFRAME.registerComponent('nav-mesh', {
  init: function () {
    this.system = this.el.sceneEl.systems.nav;
    this.loadNavMesh();
    this.el.addEventListener('model-loaded', this.loadNavMesh.bind(this));
  },

  loadNavMesh: function () {
    const object = this.el.getObject3D('mesh');

    if (!object) return;

    let navMesh;
    object.traverse((node) => {
      if (node.isMesh) navMesh = node;
    });

    if (!navMesh) return;

    this.system.setNavMesh(navMesh);
  }
});
