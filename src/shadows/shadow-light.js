/**
 * Light component.
 *
 * Source: https://github.com/aframevr/aframe-core/pull/348
 *
 * @namespace light
 * @param {number} [angle=PI / 3] - Maximum extent of light from its direction,
          in radians. For spot lights.
 * @param {bool} [castShadow=false] - Whether light will cast shadows.
          Only applies to directional, point, and spot lights.
 * @param {string} [color=#FFF] - Light color. For every light.
 * @param {number} [decay=1] - Amount the light dims along the distance of the
          light. For point and spot lights.
 * @param {number} [exponent=10.0] - Rapidity of falloff of light from its
          target direction. For spot lights.
 * @param {string} [groundColor=#FFF] - Ground light color.
          For hemisphere lights.
 * @param {number} [intensity=1.0] - Light strength.
          For every light except ambient.
 * @param {number} [shadowBias=0] - How much to add or subtract from the
          normalized depth when deciding whether a surface is in shadow.
 * @param {number} [shadowCameraFar=5000] - Orthographic shadow camera frustum
          parameter.
 * @param {number} [shadowCameraNear=50] - Orthographic shadow camera frustum
          parameter.
 * @param {number} [shadowDarkness=0.5] - Darkness of shadow cast, from 0 to 1.
 * @param {number} [shadowMapHeight=512] - Shadow map texture height in pixels.
 * @param {number} [shadowMapWidth=512] - Shadow map texture height in pixels.
 * @param {string} [type=directional] - Light type (i.e., ambient, directional,
          hemisphere, point, spot).
 */
module.exports = {
  schema: {
      angle:            { default: Math.PI / 3 },
      castShadow:       { default: false },
      color:            { default: '#FFF' },
      groundColor:      { default: '#FFF' },
      decay:            { default: 1 },
      distance:         { default: 0.0 },
      exponent:         { default: 10.0 },
      intensity:        { default: 1.0 },
      shadowBias:       { default: 0 },
      shadowCameraFar:  { default: 5000 },
      shadowCameraFov:  { default: 50 },
      shadowCameraNear: { default: 0.5 },
      shadowDarkness:   { default: 0.5 },
      shadowMapHeight:  { default: 512 },
      shadowMapWidth:   { default: 512 },
      type:             { default: 'directional' }
  },

  init: function () {
    var el = this.el;
    this.light = this.getLight();
    el.object3D.add(this.light);
    el.sceneEl.systems.light.registerLight(el);
    if (!el.sceneEl.hasLoaded) {
      el.sceneEl.addEventListener('loaded', this.play.bind(this));
    }
  },

  update: function (previousData) {
    previousData = previousData || {};
    if (!Object.keys(previousData).length) { return; }
    this.el.object3D.remove(this.light);
    this.light = this.getLight();
    this.el.object3D.add(this.light);
  },

  play: function () {
    var el = this.el,
        renderer = el.sceneEl.renderer;
    if (renderer && !renderer.shadowMap.enabled) {
      renderer.shadowMap.enabled = true;
    }
  },

  /**
   * Creates a new three.js light object given the current attributes of the
   * component.
   *
   * @namespace light
   */
  getLight: function () {
    var data = this.data;
    var color = new THREE.Color(data.color).getHex();
    var intensity = data.intensity;
    var type = data.type;

    if (type) {
      type = type.toLowerCase();
    }
    switch (type) {
      case 'ambient': {
        return new THREE.AmbientLight(color);
      }
      case 'directional': {
        return this.setShadow(new THREE.DirectionalLight(color, intensity));
      }
      case 'hemisphere': {
        return new THREE.HemisphereLight(color, data.groundColor,
                                         intensity);
      }
      case 'point': {
        return this.setShadow(
          new THREE.PointLight(color, intensity, data.distance, data.decay));
      }
      case 'spot': {
        return this.setShadow(
          new THREE.SpotLight(color, intensity, data.distance, data.angle,
                              data.exponent, data.decay));
      }
      default: {
        return new THREE.AmbientLight(color);
      }
    }
  },

  /**
   * Copy over shadow-related data from the component onto the light.
   *
   * @param {object} light
   */
  setShadow: function (light) {
    var data = this.data;
    if (!data.castShadow) { return light; }

    light.castShadow = data.castShadow;
    light.shadow.camera.near = data.shadowCameraNear;
    light.shadow.camera.far = data.shadowCameraFar;
    light.shadow.camera.fov = data.shadowCameraFov;
    light.shadow.darkness = data.shadowDarkness;
    light.shadow.mapSize.height = data.shadowMapHeight;
    light.shadow.mapSize.width = data.shadowMapWidth;

    return light;
  }
};
