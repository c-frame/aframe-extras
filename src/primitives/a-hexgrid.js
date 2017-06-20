var vg = require('../../lib/hex-grid.min.js');
var defaultHexGrid = require('../../lib/default-hex-grid.json');

/**
 * Hex grid.
 */
var Primitive = module.exports.Primitive = {
  defaultComponents: {
    'hexgrid': {}
  },
  mappings: {
    src: 'hexgrid.src'
  }
};

var Component = module.exports.Component = {
  dependencies: ['material'],
  schema: {
    src: {type: 'asset'}
  },
  init: function () {
    var data = this.data;
    if (data.src) {
      fetch(data.src)
        .then(function (response) { response.json(); })
        .then(function (json) { this.addMesh(json); });
    } else {
      this.addMesh(defaultHexGrid);
    }
  },
  addMesh: function (json) {
    var grid = new vg.HexGrid();
    grid.fromJSON(json);
    var board = new vg.Board(grid);
    board.generateTilemap();
    this.el.setObject3D('mesh', board.group);
    this.addMaterial();
  },
  addMaterial: function () {
    var materialComponent = this.el.components.material;
    var material = (materialComponent || {}).material;
    if (!material) return;
    this.el.object3D.traverse(function (node) {
      if (node.isMesh) {
        node.material = material;
      }
    });
  },
  remove: function () {
    this.el.removeObject3D('mesh');
  }
};

module.exports.registerAll = (function () {
  var registered = false;
  return function (AFRAME) {
    if (registered) return;
    AFRAME = AFRAME || window.AFRAME;
    AFRAME.registerComponent('hexgrid', Component);
    AFRAME.registerPrimitive('a-hexgrid', Primitive);
    registered = true;
  };
}());
