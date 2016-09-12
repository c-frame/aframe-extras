# Loaders

Loaders for various 3D model types. All are trivial wrappers around one of the [many THREE.js loader classes](https://github.com/mrdoob/three.js/tree/master/examples/js/loaders).

- **ply-model**: Loader for .PLY format. Works well with occlusion and shadow baked models exported from [MagicaVoxel](https://ephtracy.github.io/).
- **three-model**: Loader for THREE.js .JSON format, with basic animation support. Somewhat confusingly, there are two different THREE.js formats, both having the .json extension. This loader supports both, but requires you to specify the mode as "object" or "json". Typically, you will use "json" for a single mesh, and "object" for a scene or multiple meshes. Check the console for errors, if in doubt. See also: [Clara.io | THREE.js Export](https://clara.io/learn/user-guide/data_exchange/threejs_export).

## Usage

PLY:

```html
<a-entity ply-model="src: url(my-model.ply);"></a-entity>
```

JSON:

```html
      <a-entity three-model="loader: object;
                             src: url(my-model.json);">
      </a-entity>
```

THREE.js models also support animation. The first animation will play by default, or you can specify
an animation and its duration in the `three-model` properties:

| Property          | Default | Description                                                |
|-------------------|---------|------------------------------------------------------------|
| enableAnimation   | true    | Enables animation of the model.                            |
| animation         | AUTO    | Name of the animation to play, if there are more than one. A list of available animations can usually be found in the model file or its documentation. |
| animationDuration | AUTO    | Duration of the animation, in seconds.                     |

THREE.js models often need to be scaled down. Example:

```html
<a-entity scale="0.5 0.5 0.5" ply-model="src: url(my-model.ply);"></a-entity>
```
