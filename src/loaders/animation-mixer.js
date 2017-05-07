var LoopMode = {
  once: THREE.LoopOnce,
  repeat: THREE.LoopRepeat,
  pingpong: THREE.LoopPingPong
};

/**
 * animation-mixer
 *
 * Player for animation clips. Intended to be compatible with any model format that supports
 * skeletal or morph animations through THREE.AnimationMixer.
 * See: https://threejs.org/docs/?q=animation#Reference/Animation/AnimationMixer
 */
module.exports = {
  schema: {
    clip:  {default: '*'},
    duration: {default: 0},
    crossFadeDuration: {default: 0},
    loop: {default: 'repeat', oneOf: Object.keys(LoopMode)},
    repetitions: {default: Infinity, min: 0},
    useSkinnedMeshRoot: {default: false}
  },

  init: function () {
    /** @type {THREE.Mesh} */
    this.model = null;
    /** @type {THREE.AnimationMixer} */
    this.mixer = null;
    /** @type {Array<THREE.AnimationAction>} */
    this.activeActions = [];

    var model = this.el.getObject3D('mesh');

    if (model) {
      this.load(model);
    } else {
      this.el.addEventListener('model-loaded', function(e) {
        this.load(e.detail.model);
      }.bind(this));
    }

    this.el.addEventListener('animation-loaded', this.onAnimationLoaded.bind(this));
  },

  load: function (model) {
    var el = this.el;
    var data = this.data;

    // Allow the (presumably only) SkinnedMesh to be used as the animation
    // root, to support Mixamo-style exports.
    if (data.useSkinnedMeshRoot) {
      model.traverse(function (node) {
        if (node.isSkinnedMesh) model = node;
      });
    }

    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);
    this.mixer.addEventListener('loop', function (e) {
      el.emit('animation-loop', {action: e.action, loopDelta: e.loopDelta});
    }.bind(this));
    this.mixer.addEventListener('finished', function (e) {
      el.emit('animation-finished', {action: e.action, direction: e.direction});
    }.bind(this));

    if (data.clip) this.update({});
  },

  remove: function () {
    if (this.mixer) this.mixer.stopAllAction();
  },

  update: function (previousData) {
    if (!previousData) return;

    this.stopAction();

    if (this.data.clip) {
      this.playAction();
    }
  },

  stopAction: function () {
    var data = this.data;
    for (var i = 0; i < this.activeActions.length; i++) {
      data.crossFadeDuration
        ? this.activeActions[i].fadeOut(data.crossFadeDuration)
        : this.activeActions[i].stop();
    }
    this.activeActions.length = 0;
  },

  playAction: function () {
    if (!this.mixer) return;

    var data = this.data,
        clips = this.getClips();

    if (!clips.length) return;

    var re = wildcardToRegExp(data.clip);

    for (var clip, i = 0; (clip = clips[i]); i++) {
      if (clip.name.match(re)) {
        this.playOneAction_(clip);
      }
    }
  },

  playOneAction_: function (clip) {
    var data = this.data;
    var action = this.mixer.clipAction(clip, this.model);
    action.enabled = true;
    if (data.duration) action.setDuration(data.duration);
    action
      .setLoop(LoopMode[data.loop], data.repetitions)
      .fadeIn(data.crossFadeDuration)
      .play();
    this.activeActions.push(action);
  },

  tick: function (t, dt) {
    if (this.mixer && !isNaN(dt)) this.mixer.update(dt / 1000);
  },

  getClips: function () {
    var model = this.el.getObject3D('mesh');
    if (!model) return [];
    if (model.animations) return model.animations;
    if ((model.geometry||{}).animations) return model.geometry.animations;
    if ((model.children[0]||{}).animations) return model.children[0].animations;
    return [];
  },

  onAnimationLoaded: function (e) {
    var clip = e.detail.clip;
    var re = wildcardToRegExp(this.data.clip);
    if (clip.name.match(re) && this.mixer) {
      this.playOneAction_(clip);
    }
  }
};

/**
 * Creates a RegExp from the given string, converting asterisks to .* expressions,
 * and escaping all other characters.
 */
function wildcardToRegExp (s) {
  return new RegExp('^' + s.split(/\*+/).map(regExpEscape).join('.*') + '$');
}

/**
 * RegExp-escapes all characters in the given string.
 */
function regExpEscape (s) {
  return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}
