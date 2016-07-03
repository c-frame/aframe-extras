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
                             animation: default;
                             src: url(my-model.json);">
      </a-entity>
```

If your JSON model includes one or more animations, you'll need to specify the name of the animation to play. This can generally be found by inspecting the file itself, or opening it in a viewing program.

Scaling + model:

```html
<a-entity scale="0.5 0.5 0.5" ply-model="src: url(my-model.ply);"></a-entity>
```
