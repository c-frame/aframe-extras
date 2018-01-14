/**
 * Recursively applies a MeshNormalMaterial to the entity, such that
 * face colors are determined by their orientation. Helpful for
 * debugging geometry
 */
module.exports = AFRAME.registerComponent('normal-material', {
  init: function () {
    this.material = new THREE.MeshNormalMaterial({flatShading: true});
    this.applyMaterial = this.applyMaterial.bind(this);
    this.el.addEventListener('object3dset', this.applyMaterial);
  },

  remove: function () {
    this.el.removeEventListener('object3dset', this.applyMaterial);
  },

  applyMaterial: function () {
    this.el.object3D.traverse((node) => {
      if (node.isMesh) node.material = this.material;
    });
  }
});
