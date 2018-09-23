/**
 * nav-mesh
 *
 * Waits for a mesh to be loaded on the current entity, then sets it as the
 * nav mesh in the pathfinding system.
 */
module.exports = AFRAME.registerComponent('nav-mesh', {
  init: function () {
    this.system = this.el.sceneEl.systems.nav;
    this.hasLoadedNavMesh = false;
    this.el.addEventListener('object3dset', this.loadNavMesh.bind(this));
  },

  play: function () {
    if (!this.hasLoadedNavMesh) this.loadNavMesh();
  },

  loadNavMesh: function () {
    const object = this.el.getObject3D('mesh');
    const scene = this.el.sceneEl.object3D;

    if (!object) return;

    let navMesh;
    object.traverse((node) => {
      if (node.isMesh) navMesh = node;
    });

    if (!navMesh) return;

    const navMeshGeometry = navMesh.geometry.isBufferGeometry
      ? new THREE.Geometry().fromBufferGeometry(navMesh.geometry)
      : navMesh.geometry.clone();

    scene.updateMatrixWorld();
    navMeshGeometry.applyMatrix(navMesh.matrixWorld);
    this.system.setNavMeshGeometry(navMeshGeometry);

    this.hasLoadedNavMesh = true;
  }
});
