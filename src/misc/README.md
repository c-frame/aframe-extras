# Miscellaneous

Various other components.

- **checkpoint**: Target for [checkpoint-controls](/src/controls/checkpoint-controls.js).
- **grab**: When used on one or both hands, lets the player pick up objects with `vive-controls`. Requires `sphere-collider`.
- **jump-ability**: Allows player to jump using keyboard or gamepad, when physics is enabled. *Not VR-friendly*.
- **mesh-smooth**: Apply to models that looks "blocky", to have Three.js compute vertex normals on the fly for a "smoother" look.
- **sphere-collider**: Detects collisions with specified objects. Required for `grab`.
- **toggle-velocity**: Animates an object back and forth between two points, at a constant velocity.
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
| path | Folder containing cubemap images. Assumes naming scheme `negx.<ext>`, `posx.<ext>`, ... |
| extension | File extension for each cubemap image. |
| reflectivity | Amount [0,1] of the cubemap that should be reflected. |
| materials | Names of materials to be modified. Defaults to all materials. |
