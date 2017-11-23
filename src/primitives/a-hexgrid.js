const vg = require('../../lib/hex-grid.min.js');
const defaultHexGrid = require('../../lib/default-hex-grid.json');

/**
 * Hex grid.
 */
module.exports.Primitive = AFRAME.registerPrimitive('a-hexgrid', {
  defaultComponents: {
    'hexgrid': {}
  },
  mappings: {
    src: 'hexgrid.src'
  }
});

module.exports.Component = AFRAME.registerComponent('hexgrid', {
  dependencies: ['material'],
  schema: {
    src: {type: 'asset'}
  },
  init: function () {
    const data = this.data;
    if (data.src) {
      fetch(data.src)
        .then((response) => response.json())
        .then((json) => this.addMesh(json));
    } else {
      this.addMesh(defaultHexGrid);
    }
  },
  addMesh: function (json) {
    const grid = new vg.HexGrid();
    grid.fromJSON(json);
    const board = new vg.Board(grid);
    board.generateTilemap();
    this.el.setObject3D('mesh', board.group);
    this.addMaterial();
  },
  addMaterial: function () {
    const materialComponent = this.el.components.material;
    const material = (materialComponent || {}).material;
    if (!material) return;
    this.el.object3D.traverse((node) => {
      if (node.isMesh) {
        node.material = material;
      }
    });
  },
  remove: function () {
    this.el.removeObject3D('mesh');
  }
});
