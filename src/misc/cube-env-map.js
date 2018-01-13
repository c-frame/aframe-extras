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

    mesh.traverse((node) => {

      if (!node.isMesh) return;

      const materials = this.data.materials || [];
      const meshMaterials = this.ensureMaterialArray(node.material);

      meshMaterials.forEach((material) => {

        if (material && 'envMap' in material) return;
        if (materials.indexOf(material.name) === -1) return;

        material.envMap = envMap;
        material.reflectivity = this.data.reflectivity;
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
  }
});
