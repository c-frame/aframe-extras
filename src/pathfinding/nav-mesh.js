/**
 * nav-mesh
 *
 * Waits for a mesh to be loaded on the current entity, then sets it as the
 * nav mesh in the pathfinding system.
 */
module.exports = AFRAME.registerComponent('nav-mesh', {
  schema: {
    src: { type: "asset" }
  },
  init: function () {
    this.system = this.el.sceneEl.systems.nav;
    
    if (this.data.src) {
      this.fileLoader = new THREE.FileLoader();
      this.fileLoader.setResponseType("json");
      this.fileLoader.load(
        this.data.src,
        (zoneData) => {
          this.system.setJSONNavMesh(zoneData);
        },
        () => {},
        (err) => {
          console.error("Error loading nav mesh data:", err);
        }
      );
    } else {
      this.loadNavMesh();
      this.el.addEventListener('model-loaded', this.loadNavMesh.bind(this));
    }
  },

  play: function () {
    if (!this.hasLoadedNavMesh && !this.data.src) this.loadNavMesh();
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
