# Miscellaneous

Various other components.

- **checkpoint**: Target for [checkpoint-controls](/src/controls/checkpoint-controls.js).
- **grab**: When used on one or both hands, lets the player pick up objects with `vive-controls`. Requires `sphere-collider`.
- **jump-ability**: Allows player to jump using keyboard or gamepad, when physics is enabled. *Not VR-friendly*.
- **mesh-smooth**: Apply to models that looks "blocky", to have Three.js compute vertex normals on the fly for a "smoother" look.
- **normal-material**: Applies a MeshNormalMaterial to the entity, such that face colors are determined by their orientation. Helpful for debugging geometry.
- **sphere-collider**: Detects collisions with specified objects. Required for `grab`.
- **toggle-velocity**: Animates an object back and forth between two points, at a constant velocity.
- **cube-env-map**: Applies a CubeTexture as the envMap of an entity, without otherwise modifying the preset materials.
- **kinematic-body**: Constraints player movement using physics. *Deprecated — see below.*

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

## `kinematic-body` (Deprecated)

> **WARNING** *Using physics for movement is unstable and performs poorly. When preventing players from passing through obstacles, use a navigation mesh instead whenever possible.*

The `kinematic-body` component constraints player movement using physics, and depends on [aframe-physics-system](http://github.com/donmccurdy/aframe-physics-system/). Using physics for locomotion is not VR-friendly, and often glitchy even for traditional 3D experiences. [Use a navigation mesh](https://github.com/donmccurdy/aframe-extras/tree/master/src/controls#usage) instead, whenever possible.
