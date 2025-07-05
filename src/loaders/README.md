# Loaders

Loaders for various 3D model types. All are trivial wrappers around one of the [many THREE.js loader classes](https://github.com/mrdoob/three.js/tree/master/examples/js/loaders).

- **collada-model-legacy**: Loader for COLLADA (`.dae`) format, removed from A-Frame core with v0.9.0 release. Where possible, use the `gltf-model` component that ships with A-Frame instead.
- **object-model**: Loader for THREE.js .JSON format, generally containing multiple meshes or an entire scene. Where possible, use the `gltf-model` component that ships with A-Frame instead.
- **fbx-model**: Loader for FBX format.
- **animation-mixer**: Controls animations embedded in a glTF model.

## Usage

```html
<!-- FBX -->
<a-entity fbx-model="src: url(my-model.fbx);"></a-entity>
```

THREE.js models often need to be scaled down. Example:

```html
<a-entity scale="0.5 0.5 0.5" fbx-model="src: url(my-model.fbx);">
</a-entity>
```

## Animation

![9ae34fd9-9ea5-44c5-9b95-2873484a1603-6702-0003a29fed9e49a0](https://cloud.githubusercontent.com/assets/1848368/25648601/845485de-2f82-11e7-8ae8-8e58c9dab9ff.gif)
> Example by [Joe Campbell](https://github.com/rexraptor08) ([source](https://github.com/rexraptor08/animation-controls)).

glTF and three.js models also support animation, through the `animation-mixer` component. All animations will play by default, or you can specify
an animation and its duration:

| Property          | Default  | Description                                               |
|-------------------|----------|-----------------------------------------------------------|
| clip              | *        | Name of the animation clip(s) to play. Accepts wildcards. |
| useRegExp         | false    | If true, interpret the `clip` string as a regular expression.  If false, it is treated as a literal string, except for the * character, which is treated as a variable-length wildcard. |
| duration          | 0     | Duration of one cycle of the animation clip, in seconds.  This provides the same functionality as timeScale (apart from pausing), with duration = clipLength/timeScale.  This property only has an effect if timeScale is set to 1, otherwise the value of timeScale is used to determine animation playback speed.  |
| crossFadeDuration | 0        | Duration of cross-fades between clips, in seconds.        |
| loop              | repeat   | `once`, `repeat`, or `pingpong`. In `repeat` and `pingpong` modes, the clip plays once plus the specified number of repetitions. For `pingpong`, every second clip plays in reverse. |
| repetitions       | Infinity | Number of times to play the clip, in addition to the first play. Repetitions are ignored for `loop: once`. |
| timeScale         | 1        | Scaling factor for playback speed. A value of 0 causes the animation to pause. Negative values cause the animation to play backwards. |
| clampWhenFinished | false        | If true, halts the animation at the last frame. |
| startAt           | 0        | Configures the animation clip to begin at a specific start time (in milliseconds). This is useful when you need to jump to an exact time in an animation. The input parameter will be scaled by the mixer's timeScale.  Negative values will result in a pause before the animation begins. |

A list of available animations can usually be found by inspecting the model file or its documentation. All animations will play by default. To play only a specific set of animations, use wildcards: `animation-mixer="clip: run_*"`, or use the useRegExp flag to enable full regular expression matching, e.g. `animation-mixer="useRegExp: true; clip: run|walk"`.

### Animation Events

The `animation-mixer` component emits events at certain points in the animation cycle.

| Event              | Details               | Description                                                    |
|--------------------|-----------------------|----------------------------------------------------------------|
| animation-loop     | `action`, `loopDelta` | Emitted when a single loop of the animation clip has finished. |
| animation-finished | `action`, `direction` | Emitted when all loops of an animation clip have finished.     |
