/**
 * Flat-shaded ocean primitive.
 *
 * Based on a Codrops tutorial:
 * http://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
 */
module.exports.Primitive = AFRAME.registerPrimitive('a-ocean', {
  defaultComponents: {
    ocean: {},
    rotation: { x: -90, y: 0, z: 0 }
  },
  mappings: {
    width: 'ocean.width',
    depth: 'ocean.depth',
    density: 'ocean.density',
    amplitude: 'ocean.amplitude',
    amplitudeVariance: 'ocean.amplitudeVariance',
    speed: 'ocean.speed',
    speedVariance: 'ocean.speedVariance',
    color: 'ocean.color',
    opacity: 'ocean.opacity'
  }
});

module.exports.Component = AFRAME.registerComponent('ocean', {
  schema: {
    // Dimensions of the ocean area.
    width: { default: 10, min: 0 },
    depth: { default: 10, min: 0 },

    // Density of waves.
    density: { default: 10 },

    // Wave amplitude and variance.
    amplitude: { default: 0.1 },
    amplitudeVariance: { default: 0.3 },

    // Wave speed and variance.
    speed: { default: 1 },
    speedVariance: { default: 2 },

    // Material.
    color: { default: '#7AD2F7', type: 'color' },
    opacity: { default: 0.8 }
  },

  /**
   * Use play() instead of init(), because component mappings – unavailable as dependencies – are
   * not guaranteed to have parsed when this component is initialized.
   */
  play: function () {
    const el = this.el;
    const data = this.data;
    let material = el.components.material;

    let geometry = new THREE.PlaneGeometry(data.width, data.depth, data.density, data.density);
    geometry = THREE.BufferGeometryUtils.mergeVertices(geometry);
    const posAttribute = geometry.getAttribute( 'position' );

    this.waves = [];
    
    for (let v, i=0; i<posAttribute.count; i++){
      this.waves.push({
        z:posAttribute.getZ(i),
        ang: Math.random() * Math.PI * 2,
        amp: data.amplitude + Math.random() * data.amplitudeVariance,
        speed: (data.speed + Math.random() * data.speedVariance) / 1000 // radians / frame 
      });
    }

    if (!material) {
      material = {};
      material.material = new THREE.MeshPhongMaterial({
        color: data.color,
        transparent: data.opacity < 1,
        opacity: data.opacity,
        flatShading: true
      });
    }

    this.mesh = new THREE.Mesh(geometry, material.material);
    el.setObject3D('mesh', this.mesh);
  },

  remove: function () {
    this.el.removeObject3D('mesh');
  },

  tick: function (t, dt) {
    if (!dt) return;
    const verts = this.mesh.geometry.getAttribute("position");

    for (let value, vprops, i = 0; i<verts.count; i++){
      /* assign values to variables */
      vprops = this.waves[i];
      value = vprops.z + Math.sin(vprops.ang) * vprops.amp;
      /* set the value for z axis */
      verts.setZ(i, value);
      /* update vprops.ang */
      vprops.ang += vprops.speed * dt;
    }
    /* update mesh to show changes to vertex position attribute */
    verts.needsUpdate = true;
  }
});
