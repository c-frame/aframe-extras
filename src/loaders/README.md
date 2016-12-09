# Loaders

Loaders for various 3D model types. All are trivial wrappers around one of the [many THREE.js loader classes](https://github.com/mrdoob/three.js/tree/master/examples/js/loaders).

- **json-model**: Loader for THREE.js .JSON format, generally containing a single mesh.
- **object-model**: Loader for THREE.js .JSON format, generally containing multiple meshes or an entire scene.
- **ply-model**: Loader for PLY format. Works well with occlusion and shadow baked models exported from [MagicaVoxel](https://ephtracy.github.io/).
- **fbx-model**: <sub><img alt="Experimental" src="https://img.shields.io/badge/status-experimental-orange.svg"></sub> Loader for FBX format. Supports ASCII, but *not* binary, models.

Unsure whether to use `json-model` or `object-model`? Check the console for errors. See also: [Clara.io | THREE.js Export](https://clara.io/learn/user-guide/data_exchange/threejs_export).

## Usage

```html
<a-entity json-model="src: url(my-model.json);">
</a-entity>
```

THREE.js models often need to be scaled down. Example:

```html
<a-entity scale="0.5 0.5 0.5" object-model="src: url(my-model.json);">
</a-entity>
```

## Animation

THREE.js models also support animation, through the `animation-mixer` component. The first animation will play by default, or you can specify
an animation and its duration:

| Property          | Default | Description                                         |
|-------------------|---------|-----------------------------------------------------|
| clip     | AUTO | Name of the animation clip to play, if there are more than one. |
| duration | AUTO | Duration of the animation, in seconds.                          |

A list of available animations can usually be found by inspecting the model file or its documentation.
