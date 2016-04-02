/**
 * Flat grid.
 *
 * Defaults to 75x75.
 */
module.exports = {
  defaultAttributes: {
    geometry: {
      primitive: 'plane',
      width: 75,
      height: 75
    },
    rotation: {x: -90, y: 0, z: 0},
    material: {
      src: 'url(../../assets/grid.png)',
      repeat: '75 75'
    }
  },
  mappings: {
    width: 'geometry.width',
    depth: 'geometry.depth',
    src: 'material.src'
  }
};
