# A-Frame Extras

Add-ons and helpers for A-Frame VR.

## Usage (NPM)

```
npm install --save aframe-extras
```

```javascript
var extras = require('aframe-extras');
AFRAME.registerComponent('velocity', extras.math.velocity); // Register a single component.
extras.physics.registerAll();                               // Register a particular package.
extras.registerAll();                                       // Register everything.
```

## Usage (Global)

*Coming soon*.

## Add-ons

<!-- tree src -I index.js -->
```
src
├── controls
│   ├── gamepad-controls.js
│   ├── hmd-controls.js
│   ├── keyboard-controls.js
│   ├── mouse-controls.js
│   ├── touch-controls.js
│   └── universal-controls.js
├── math
│   ├── quaternion.js
│   └── velocity.js
├── misc
│   ├── jump-ability.js
│   ├── jump-ability-lite.js
│   ├── three-model.js
│   └── toggle-velocity.js
├── physics
│   ├── dynamic-body.js
│   ├── kinematic-body.js
│   ├── physics.js
│   └── static-body.js
└── shadows
    ├── shadow-light.js
    └── shadow.js
```

### Controls

Extensible movement/rotation/hotkey controls, with support for a variety of input devices.

- `universal-controls`: Manager for other controls, which can be used to decide which input device is used when multiple are available, and to set common acceleration/sensitivity across all controls.

#### Input devices:

`gamepad-controls`, `hmd-controls`, `keybard-controls`, `mouse-controls`, and `touch-controls`.

#### Other Controls

I've written standalone components for several other control components.

- [gamepad-controls](https://github.com/donmccurdy/aframe-gamepad-controls): A more advanced standalone gamepad controller than the version in this package.
- [keyboard-controls](https://github.com/donmccurdy/aframe-keyboard-controls): A more advanced standalone keyboard controller than the version in this package.
- `leap-motion-controls`: *In progress.*

#### Mobile + Desktop Input Devices

Connect input devices from your desktop to your mobile phone with WebRTC, using [ProxyControls.js](https://proxy-controls.donmccurdy.com).

### Physics

Components for A-Frame physics integration, built on [CANNON.js](http://schteppe.github.io/cannon.js/).

**Scene Physics:**

- `physics`: Added to the `<a-scene/>` element, and manages global physics World

**Object Types:**

- `dynamic-body`: Object that moves only according to physics simulation, which has mass and may collide with other objects.
- `static-body`: Static body with a fixed position. Unaffected by gravity and collisions, but other objects may collide with it.
- `kinematic-body`: Controlled but dynamic body, which moves but is not affected (directly) by the physics engine. Intended for use on the player's model. Gravity and collisions are simulated, without giving full control to the physics engine.

**Math:**

- `velocity`: Helper to update an object's by a fixed amount position over time.
- `quaternion`: Helper for preventing gimbal-lock during rotation.

### Shadows

Runtime shadows, with the `shadow` and `shadow-light` components. Originally written by @ngokevin, and likely to be available in A-Frame later (https://github.com/aframevr/aframe-core/pull/348).

> *NOTE: Adding shadows to more than a few simple objects can slow your scene >down significantly. For performant shadows on scenery, like trees and houses, bake your shadows into your textures using modeling software.*
