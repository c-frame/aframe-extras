/**
 * Specifies an envMap on an entity, without replacing any existing material
 * properties.
 */
module.exports = AFRAME.registerComponent('cube-env-map', {
  schema: {
    path: {default: ''},
    extension: {default: 'jpg'},
    format: {default: 'RGBFormat'},
    enableBackground: {default: false},
    reflectivity: {default: 1},
    materials: {default: []}
  },

  init: function () {
    const data = this.data;

    this.texture = new THREE.CubeTextureLoader().load([
      data.path + 'posx.' + data.extension, data.path + 'negx.' + data.extension,
      data.path + 'posy.' + data.extension, data.path + 'negy.' + data.extension,
      data.path + 'posz.' + data.extension, data.path + 'negz.' + data.extension
    ]);
    this.texture.format = THREE[data.format];

    if (data.enableBackground) {
      this.el.sceneEl.object3D.background = this.texture;
    }

    this.applyEnvMap();
    this.el.addEventListener('object3dset', this.applyEnvMap.bind(this));
  },

  applyEnvMap: function () {
    const mesh = this.el.getObject3D('mesh');
    const envMap = this.texture;

    if (!mesh) return;

    mesh.traverse(node => {
      const materials = this.ensureMaterialArray(node.material)

      materials.forEach(material => {
        if (material && 'envMap' in material) {
          const reflectivity = this.getMaterialReflectivity(material);
          if(reflectivity) {
            material.envMap = envMap;
            material.reflectivity = reflectivity;
            material.needsUpdate = true;  
          }
        }
      });
    });
  },

  ensureMaterialArray: function (material) {
    if(!material) {
      return []
    } else if(Array.isArray(material)) {
      return material
    } else if(material.materials) {
      return material.materials
    } else {
      return [material]
    }
  },

  getMaterialReflectivity: function (material) {
    if(this.data.materials.length === 0) {
      return this.data.reflectivity;
    }

    const index = this.data.materials.indexOf(material.name)
    if(index === -1) {
      return null;
    }

    const specificReflectivity = parseFloat(this.data.materials[index + 1]);
    if(isNaN(specificReflectivity)) {
      return this.data.reflectivity;
    } else {
      return specificReflectivity;
    }
  }
});
