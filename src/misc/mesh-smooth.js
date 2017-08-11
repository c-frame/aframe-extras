/**
 * Apply this component to models that looks "blocky", to have Three.js compute
 * vertex normals on the fly for a "smoother" look.
 */
module.exports = {
  init: function () {
    this.el.addEventListener('model-loaded', function (e) {
      e.detail.model.traverse(function (node) {
        if (node.isMesh) node.geometry.computeVertexNormals();
      });
    })
  }
}
