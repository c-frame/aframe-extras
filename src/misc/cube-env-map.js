/**
 * @param  {Array<THREE.Material>|THREE.Material} material
 * @return {Array<THREE.Material>}
 */
function ensureMaterialArray (material) {
  if (!material) {
    return [];
  } else if (Array.isArray(material)) {
    return material;
  } else if (material.materials) {
    return material.materials;
  } else {
    return [material];
  }
}

/**
 * @param  {THREE.Object3D} mesh
 * @param  {Array<string>} materialNames
 * @param  {THREE.Texture} envMap
 * @param  {number} reflectivity  [description]
 */
function applyEnvMap (mesh, materialNames, envMap, reflectivity) {
  if (!mesh) return;

  materialNames = materialNames || [];

  mesh.traverse((node) => {

    if (!node.isMesh) return;

    const meshMaterials = ensureMaterialArray(node.material);

    meshMaterials.forEach((material) => {

      if (material && !('envMap' in material)) return;
      if (materialNames.length && materialNames.indexOf(material.name) === -1) return;

      material.envMap = envMap;
      material.reflectivity = reflectivity;
      material.needsUpdate = true;

    });

  });
}

/**
 * Specifies an envMap on an entity, without replacing any existing material
 * properties.
 */
AFRAME.registerComponent('cube-env-map', {
  multiple: true,

  schema: {
    path: {default: ''},
    extension: {default: 'jpg', oneOf: ['jpg', 'png']},
    enableBackground: {default: false},
    reflectivity: {default: 1, min: 0, max: 1},
    materials: {default: []}
  },

  init: function () {
    const data = this.data;

    this.texture = new THREE.CubeTextureLoader().load([
      data.path + 'posx.' + data.extension, data.path + 'negx.' + data.extension,
      data.path + 'posy.' + data.extension, data.path + 'negy.' + data.extension,
      data.path + 'posz.' + data.extension, data.path + 'negz.' + data.extension
    ]);
    this.texture.format = THREE.RGBAFormat;

    this.object3dsetHandler = () => {
      const mesh = this.el.getObject3D('mesh');
      const data = this.data;
      applyEnvMap(mesh, data.materials, this.texture, data.reflectivity);
    };

    this.object3dsetHandler();
    this.el.addEventListener('object3dset', this.object3dsetHandler);
    
  },

  update: function (oldData) {
    const data = this.data;
    const mesh = this.el.getObject3D('mesh');

    let addedMaterialNames = [];
    let removedMaterialNames = [];

    if (data.materials.length) {
      if (oldData.materials) {
        addedMaterialNames = data.materials.filter((name) => !oldData.materials.includes(name));
        removedMaterialNames = oldData.materials.filter((name) => !data.materials.includes(name));
      } else {
        addedMaterialNames = data.materials;
      }
    }
    if (addedMaterialNames.length) {
      applyEnvMap(mesh, addedMaterialNames, this.texture, data.reflectivity);
    }
    if (removedMaterialNames.length) {
      applyEnvMap(mesh, removedMaterialNames, null, 1);
    }

    if (oldData.materials && data.reflectivity !== oldData.reflectivity) {
      const maintainedMaterialNames = data.materials
        .filter((name) => oldData.materials.includes(name));
      if (maintainedMaterialNames.length) {
        applyEnvMap(mesh, maintainedMaterialNames, this.texture, data.reflectivity);
      }
    }

    if (this.data.enableBackground && !oldData.enableBackground) {
      this.setBackground(this.texture);
    } else if (!this.data.enableBackground && oldData.enableBackground) {
      this.setBackground(null);
    }
  },

  remove: function () {
    this.el.removeEventListener('object3dset', this.object3dsetHandler);
    const mesh = this.el.getObject3D('mesh');
    const data = this.data;

    applyEnvMap(mesh, data.materials, null, 1);
    if (data.enableBackground) this.setBackground(null);
  },

  setBackground: function (texture) {
    this.el.sceneEl.object3D.background = texture;
  }
});
