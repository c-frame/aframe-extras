const LoopMode = {
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
AFRAME.registerComponent('animation-mixer', {
  schema: {
    clip: { default: '*' },
    useRegExp: {default: false},
    duration: { default: 0 },
    clampWhenFinished: { default: false, type: 'boolean' },
    crossFadeDuration: { default: 0 },
    loop: { default: 'repeat', oneOf: Object.keys(LoopMode) },
    repetitions: { default: Infinity, min: 0 },
    timeScale: { default: 1 },
    startAt: { default: 0 }
  },

  init: function () {
    /** @type {THREE.Mesh} */
    this.model = null;
    /** @type {THREE.AnimationMixer} */
    this.mixer = null;
    /** @type {Array<THREE.AnimationAction>} */
    this.activeActions = [];

    const model = this.el.getObject3D('mesh');

    if (model) {
      this.load(model);
    } else {
      this.el.addEventListener('model-loaded', (e) => {
        this.load(e.detail.model);
      });
    }
  },

  load: function (model) {
    const el = this.el;
    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);
    this.mixer.addEventListener('loop', (e) => {
      el.emit('animation-loop', { action: e.action, loopDelta: e.loopDelta });
    });
    this.mixer.addEventListener('finished', (e) => {
      el.emit('animation-finished', { action: e.action, direction: e.direction });
    });
    if (this.data.clip) this.update({});
  },

  remove: function () {
    if (this.mixer) this.mixer.stopAllAction();
  },

  update: function (prevData) {
    if (!prevData) return;

    const data = this.data;
    const changes = AFRAME.utils.diff(data, prevData);

    // If selected clips have changed, restart animation.
    if ('clip' in changes) {
      this.stopAction();
      if (data.clip) this.playAction();
      return;
    }

    // Otherwise, modify running actions.
    this.activeActions.forEach((action) => {
      if ('duration' in changes && data.duration) {
        action.setDuration(data.duration);
      }
      if ('clampWhenFinished' in changes) {
        action.clampWhenFinished = data.clampWhenFinished;
      }
      if ('loop' in changes || 'repetitions' in changes) {
        action.setLoop(LoopMode[data.loop], data.repetitions);
      }
      if ('timeScale' in changes) {
        action.setEffectiveTimeScale(data.timeScale);
      }
    });
  },

  stopAction: function () {
    const data = this.data;
    for (let i = 0; i < this.activeActions.length; i++) {
      data.crossFadeDuration
        ? this.activeActions[i].fadeOut(data.crossFadeDuration)
        : this.activeActions[i].stop();
    }
    this.activeActions.length = 0;
  },

  playAction: function () {
    if (!this.mixer) return;

    const model = this.model,
      data = this.data,
      clips = model.animations || (model.geometry || {}).animations || [];

    if (!clips.length) return;

    const re = data.useRegExp ? data.clip : wildcardToRegExp(data.clip);

    for (let clip, i = 0; (clip = clips[i]); i++) {
      if (clip.name.match(re)) {
        const action = this.mixer.clipAction(clip, model);

        action.enabled = true;
        action.clampWhenFinished = data.clampWhenFinished;
        if (data.duration) action.setDuration(data.duration);
        if (data.timeScale !== 1) action.setEffectiveTimeScale(data.timeScale);
        // animation-mixer.startAt and AnimationAction.startAt have very different meanings.
        // animation-mixer.startAt indicates which frame in the animation to start at, in msecs.
        // AnimationAction.startAt indicates when to start the animation (from the 1st frame),
        // measured in global mixer time, in seconds.
        action.startAt(this.mixer.time - data.startAt / 1000);
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
});

/**
 * Creates a RegExp from the given string, converting asterisks to .* expressions,
 * and escaping all other characters.
 */
function wildcardToRegExp(s) {
  return new RegExp('^' + s.split(/\*+/).map(regExpEscape).join('.*') + '$');
}

/**
 * RegExp-escapes all characters in the given string.
 */
function regExpEscape(s) {
  return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}
