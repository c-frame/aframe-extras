# Miscellaneous

Various other components.

- **checkpoint**: Target for [checkpoint-controls](/src/controls/checkpoint-controls.js).
- **grab**: When used on one or both hands, lets the player pick up objects with `vive-controls`. Requires `sphere-collider`.
- **jump-ability**: Allows player to jump using keyboard or gamepad, when physics is enabled. *Not VR-friendly*.
- **mesh-smooth**: Apply to models that looks "blocky", to have Three.js compute vertex normals on the fly for a "smoother" look.
- **sphere-collider**: Detects collisions with specified objects. Required for `grab`.
- **toggle-velocity**: Animates an object back and forth between two points, at a constant velocity.
- **cube-env-map**: Applies a CubeTexture as the envMap of an entity, without otherwise modifying the preset materials. Usage: `cube-env-map="path: assets/folder/; extension: jpg; reflectivity: 0.5; materials: front, 0.2, back, 0.8;"`. Assumes naming scheme: negx, posx, ... Materials is an optional array of named materials to apply the map to (default is all); each name can optionally by followed by a specific reflectivity for that material.
