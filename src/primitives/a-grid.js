/**
 * Flat grid.
 *
 * Defaults to 9x9.
 */
module.exports = {
  defaultAttributes: {
    geometry: {
      primitive: 'plane'
    },
    rotation: {x: -90, y: 0, z: 0},
    scale: {x: 75, y: 75, z: 1},
    material: {
      src: 'url(../../assets/grid.png)',
      repeat: '75 75'
    }
  },
  mappings: {
    width: 'scale.x',
    depth: 'scale.y',
    src: 'material.src'
  }
};
