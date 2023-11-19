# Miscellaneous

Various other components.

- **checkpoint**: Target for [checkpoint-controls](/src/controls/checkpoint-controls.js).
- **grab**: When used on one or both hands, lets the player pick up objects with `hand-controls`. Requires `sphere-collider` and using CANNON physics.
- **normal-material**: Applies a MeshNormalMaterial to the entity, such that face colors are determined by their orientation. Helpful for debugging geometry.
- **sphere-collider**: Detects collisions with specified objects. Required for `grab`.
- **cube-env-map**: Applies a CubeTexture as the envMap of an entity, without otherwise modifying the preset materials.

## `cube-env-map`

Usage:

```
<a-entity gltf-model="src: url(my-model.gltf);"
          cube-env-map="path: assets/folder/;
                        extension: jpg;
                        reflectivity: 0.5;
                        materials: myPrimaryMaterial, myAccentMaterial;">
</a-entity>
```

| Option | Description |
|--------|-------------|
| path | Folder containing cubemap images. Path should end in a trailing `/`. Assumes naming scheme `negx.<ext>`, `posx.<ext>`, ... |
| extension | File extension for each cubemap image. |
| reflectivity | Amount [0,1] of the cubemap that should be reflected. |
| materials | Names of materials to be modified. Defaults to all materials. |
