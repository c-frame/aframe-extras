/**
 * Specifies an envMap on an entity, without replacing any existing material
 * properties.
 */
module.exports = AFRAME.registerComponent('cube-env-map', {
  multiple: true,
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

    this.object3dsetHandler = this.updateEnvMap.bind(this, data.materials, true);
    this.el.addEventListener('object3dset', this.object3dsetHandler);
  },

  update: function (oldData) {
    const data = this.data;

    let addedMaterialNames = [];
    let removedMaterialNames = [];
    if(data.materials.length)
    {
      if(oldData.materials) {
        addedMaterialNames = data.materials.filter(name => !oldData.materials.includes(name) );
        removedMaterialNames = oldData.materials.filter(name => !data.materials.includes(name) );
      } else {
        addedMaterialNames = data.materials
      }
    }
    if(addedMaterialNames.length) {
      this.updateEnvMap(addedMaterialNames, true)
    }
    if(removedMaterialNames.length) {
      this.updateEnvMap(removedMaterialNames, false)
    }

    if(oldData.materials && data.reflectivity !== oldData.reflectivity) {
      const maintanedMaterialNames = data.materials.filter(name => oldData.materials.includes(name) );
      if(maintanedMaterialNames.length) {
        this.updateEnvMap(maintanedMaterialNames, true)
      }
    }

    if (this.data.enableBackground && !oldData.enableBackground) {
      this.enableBackground();
    } else if(!this.data.enableBackground && oldData.enableBackground) {
      this.disableBackground();
    }
  },

  remove: function () {
    this.el.removeEventListener('object3dset', this.object3dsetHandler);
    this.updateEnvMap(this.data.materials, false);
    if(this.enableBackground) {
      this.disableBackground();
    }
  },

  updateEnvMap: function (materialNames, applyMap) {
    const mesh = this.el.getObject3D('mesh');
    const envMap = this.texture;

    if (!mesh) return;

    mesh.traverse((node) => {

      if (!node.isMesh) return;

      const materials = this.data.materials || [];
      const meshMaterials = this.ensureMaterialArray(node.material);

      meshMaterials.forEach((material) => {

        if (material && 'envMap' in material) return;
        if (materials.indexOf(material.name) === -1) return;

        if(applyMap) {
          material.envMap = envMap;
          material.reflectivity = this.data.reflectivity;
        } else {
          material.envMap = null;
          material.reflectivity = null;
        }
        material.needsUpdate = true;
      });

    });
  },

  ensureMaterialArray: function (material) {
    if (!material) {
      return [];
    } else if (Array.isArray(material)) {
      return material;
    } else if (material.materials) {
      return material.materials;
    } else {
      return [material];
    }
  },

  enableBackground() {
    this.el.sceneEl.object3D.background = this.texture;
  },

  disableBackground() {
    this.el.sceneEl.object3D.background = null;
  }
});
