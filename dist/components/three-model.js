(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
AFRAME.registerComponent('three-model', require('./src/loaders/three-model'));
},{"./src/loaders/three-model":2}],2:[function(require,module,exports){
var DEFAULT_ANIMATION = '__auto__';

/**
 * three-model
 *
 * Loader for THREE.js JSON format. Somewhat confusingly, there are two
 * different THREE.js formats, both having the .json extension. This loader
 * supports both, but requires you to specify the mode as "object" or "json".
 *
 * Typically, you will use "json" for a single mesh, and "object" for a scene
 * or multiple meshes. Check the console for errors, if in doubt.
 *
 * See: https://clara.io/learn/user-guide/data_exchange/threejs_export
 */
module.exports = {
  deprecated: true,

  schema: {
    src:               { type: 'asset' },
    loader:            { default: 'object', oneOf: ['object', 'json'] },
    enableAnimation:   { default: true },
    animation:         { default: DEFAULT_ANIMATION },
    animationDuration: { default: 0 },
    crossorigin:       { default: '' }
  },

  init: function () {
    this.model = null;
    this.mixer = null;
    console.warn('[three-model] Component is deprecated. Use json-model or object-model instead.');
  },

  update: function (previousData) {
    previousData = previousData || {};

    var loader,
        data = this.data;

    if (!data.src) {
      this.remove();
      return;
    }

    // First load.
    if (!Object.keys(previousData).length) {
      this.remove();
      if (data.loader === 'object') {
        loader = new THREE.ObjectLoader();
        if (data.crossorigin) loader.setCrossOrigin(data.crossorigin);
        loader.load(data.src, function(loaded) {
          loaded.traverse( function(object) {
            if (object instanceof THREE.SkinnedMesh)
              loaded = object;
          });
          if(loaded.material)
            loaded.material.skinning = !!((loaded.geometry && loaded.geometry.bones) || []).length;
          this.load(loaded);
        }.bind(this));
      } else if (data.loader === 'json') {
        loader = new THREE.JSONLoader();
        if (data.crossorigin) loader.crossOrigin = data.crossorigin;
        loader.load(data.src, function (geometry, materials) {

          // Attempt to automatically detect common material options.
          materials.forEach(function (mat) {
            mat.vertexColors = (geometry.faces[0] || {}).color ? THREE.FaceColors : THREE.NoColors;
            mat.skinning = !!(geometry.bones || []).length;
            mat.morphTargets = !!(geometry.morphTargets || []).length;
            mat.morphNormals = !!(geometry.morphNormals || []).length;
          });

          var mesh = (geometry.bones || []).length
            ? new THREE.SkinnedMesh(geometry, new THREE.MultiMaterial(materials))
            : new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));

          this.load(mesh);
        }.bind(this));
      } else {
        throw new Error('[three-model] Invalid mode "%s".', data.mode);
      }
      return;
    }

    var activeAction = this.model && this.model.activeAction;

    if (data.animation !== previousData.animation) {
      if (activeAction) activeAction.stop();
      this.playAnimation();
      return;
    }

    if (activeAction && data.enableAnimation !== activeAction.isRunning()) {
      data.enableAnimation ? this.playAnimation() : activeAction.stop();
    }

    if (activeAction && data.animationDuration) {
        activeAction.setDuration(data.animationDuration);
    }
  },

  load: function (model) {
    this.model = model;
    this.mixer = new THREE.AnimationMixer(this.model);
    this.el.setObject3D('mesh', model);
    this.el.emit('model-loaded', {format: 'three', model: model});

    if (this.data.enableAnimation) this.playAnimation();
  },

  playAnimation: function () {
    var clip,
        data = this.data,
        animations = this.model.animations || this.model.geometry.animations || [];

    if (!data.enableAnimation || !data.animation || !animations.length) {
      return;
    }

    clip = data.animation === DEFAULT_ANIMATION
      ? animations[0]
      : THREE.AnimationClip.findByName(animations, data.animation);

    if (!clip) {
      console.error('[three-model] Animation "%s" not found.', data.animation);
      return;
    }

    this.model.activeAction = this.mixer.clipAction(clip, this.model);
    if (data.animationDuration) {
      this.model.activeAction.setDuration(data.animationDuration);
    }
    this.model.activeAction.play();
  },

  remove: function () {
    if (this.mixer) this.mixer.stopAllAction();
    if (this.model) this.el.removeObject3D('mesh');
  },

  tick: function (t, dt) {
    if (this.mixer && !isNaN(dt)) {
      this.mixer.update(dt / 1000);
    }
  }
};

},{}]},{},[1]);
