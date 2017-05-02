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
    repetitions: {default: Infinity, min: 0}
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
  },

  load: function (model) {
    var el = this.el;
    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);
    this.mixer.addEventListener('loop', function (e) {
      el.emit('animation-loop', {action: e.action, loopDelta: e.loopDelta});
    }.bind(this));
    this.mixer.addEventListener('finished', function (e) {
      el.emit('animation-finished', {action: e.action, direction: e.direction});
    }.bind(this));
    if (this.data.clip) this.update({});
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

    var model = this.model,
        data = this.data,
        clips = model.animations || (model.geometry || {}).animations || [];

    if (!clips.length) return;

    var re = wildcardToRegExp(data.clip);

    for (var clip, i = 0; (clip = clips[i]); i++) {
      if (clip.name.match(re)) {
        var action = this.mixer.clipAction(clip, model);
        action.enabled = true;
        if (data.duration) action.setDuration(data.duration);
        action
          .setLoop(LoopMode[data.loop], data.repetitions)
          .fadeIn(data.crossFadeDuration)
          .play();
        this.activeActions.push(action);
      }
    }
  },

  tick: function (t, dt) {
    if (this.mixer && !isNaN(dt)) this.mixer.update(dt / 1000);
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
