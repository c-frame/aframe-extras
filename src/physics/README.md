# Physics

Components for A-Frame physics integration, built on [CANNON.js](http://schteppe.github.io/cannon.js/).

## Scene Physics

- `physics`: Added to the `<a-scene/>` element, and manages world physics

## Components

- `dynamic-body`: Object that moves only according to physics simulation, which has mass and may collide with other objects.
- `static-body`: Static body with a fixed position. Unaffected by gravity and collisions, but other objects may collide with it.
- `kinematic-body`: Controlled but dynamic body, which moves but is not affected (directly) by the physics engine. Intended for use on the player's model. Gravity and collisions are simulated, without giving full control to the physics engine.

## Usage

```html
<a-scene physics>

  <!-- Camera -->
  <a-entity camera universal-controls kinematic-body></a-entity>

  <!-- Floor -->
  <a-grid static-body></a-grid>

  <!-- Immovable box -->
  <a-box static-body position="0 0.5 -5" width="3" height="1" depth="1"></a-box>

  <!-- Dynamic box -->
  <a-box dynamic-body position="5 0.5 0" width="1" height="1" depth="1"></a-box>

</a-scene>
```
