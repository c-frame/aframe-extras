# Loaders

Loaders for various 3D model types. All are trivial wrappers around one of the [many THREE.js loader classes](https://github.com/mrdoob/three.js/tree/master/examples/js/loaders).

- **gltf-model-legacy**: Loader for glTF 1.0 format, removed from A-Frame core with v0.7.0 release. For glTF 2.0, use the `gltf-model` component that ships with A-Frame.
- **json-model**: Loader for THREE.js .JSON format, generally containing a single mesh.
- **object-model**: Loader for THREE.js .JSON format, generally containing multiple meshes or an entire scene.
- **ply-model**: Loader for PLY format. Works well with occlusion and shadow baked models exported from [MagicaVoxel](https://ephtracy.github.io/).
- **fbx-model**: Loader for FBX format.

Unsure whether to use `json-model` or `object-model`? Check the console for errors. See also: [Clara.io | THREE.js Export](https://clara.io/learn/user-guide/data_exchange/threejs_export).

## Usage

```html
<!-- three.js JSON -->
<a-entity json-model="src: url(my-model.json);"></a-entity>
```

THREE.js models often need to be scaled down. Example:

```html
<a-entity scale="0.5 0.5 0.5" object-model="src: url(my-model.json);">
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
| duration          | AUTO     | Duration of the animation, in seconds.                    |
| crossFadeDuration | 0        | Duration of cross-fades between clips, in seconds.        |
| loop              | repeat   | `once`, `repeat`, or `pingpong`. In `repeat` and `pingpong` modes, the clip plays once plus the specified number of repetitions. For `pingpong`, every second clip plays in reverse. |
| repetitions       | Infinity | Number of times to play the clip, in addition to the first play. Repetitions are ignored for `loop: once`. |

A list of available animations can usually be found by inspecting the model file or its documentation. All animations will play by default. To play only a specific set of animations, use wildcards: `animation-mixer="clip: run_*"`.

### Animation Events

The `animation-mixer` component emits events at certain points in the animation cycle.

| Event              | Details               | Description                                                    |
|--------------------|-----------------------|----------------------------------------------------------------|
| animation-loop     | `action`, `loopDelta` | Emitted when a single loop of the animation clip has finished. |
| animation-finished | `action`, `direction` | Emitted when all loops of an animation clip have finished.     |
