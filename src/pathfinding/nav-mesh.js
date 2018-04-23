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
