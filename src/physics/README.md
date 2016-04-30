# Physics

Components for A-Frame physics integration, built on [CANNON.js](http://schteppe.github.io/cannon.js/).

## Scene Physics

- **physics**: Added to the `<a-scene/>` element, and manages world physics.

## Components

- **dynamic-body**: Object that moves only according to physics simulation, which has mass and may collide with other objects.
- **static-body**: Static body with a fixed position. Unaffected by gravity and collisions, but other objects may collide with it.
- **kinematic-body**: Controlled but dynamic body, which moves but is not affected (directly) by the physics engine. Intended for use on the player's model. Gravity and collisions are simulated, without giving full control to the physics engine.

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

## Debugging

When debugging, it may be helpful to see the shape of the physics bodies attached to your entities, and verify that they're staying in sync.

```html
<a-scene physics="debug: true;">

  <!-- ... -->

</a-scene>
```

## Body Shapes

Components will attempt to find an appropriate CANNON.js shape to fit your model. Boxes, Planes, and Trimeshes are supported now. Trimeshes adapt to fit custom geometry (e.g. a .OBJ or .DAE file), but may not perform as well as primitive shapes. Additional shapes offered by CANNON.js (cylinder, sphere, heightfield, ...) will be supported soon.

CANNON.js also offers support for "composing" shapes for complex objects, using multiple primitives. For example, a stool might be modeled as a cylinder-shaped seat, on four long cylindrical legs. This has the advantage of better performance over a Trimesh, but requires manual customization. Composed shapes are not currently supported by these components, although writing a `chair-body` component, extending `body`, would allow you to override the default shape.

## Collision Events

CANNON.js generates events when a collision is detected, which are propagated onto the associated A-Frame entity. Example:

```javascript
var playerEl = document.querySelector('[camera]');
playerEl.addEventListener('collide', function (e) {
  console.log('Player has collided with body #' + e.detail.body.id));

  e.detail.target.el;  // Original entity (playerEl).
  e.detail.body.el;    // Other entity, which playerEl touched.
  e.detail.contact;    // Stats about the collision (CANNON.ContactEquation).
  e.detail.contact.ni; // Normal (direction) of the collision (CANNON.Vec3).
});
```

Note that CANNON.js cannot perfectly detect collisions with very fast-moving bodies. Doing so requires Continuous Collision Detection, which can be both slow and difficult to implement. If this is an issue for your scene, consider (1) slowing objects down, (2) detecting collisions manually (collisions with the floor are easy – `position.y - height / 2 <= 0`), or (3) attempting a PR to CANNON.js. See: [Collision with fast bodies](https://github.com/schteppe/cannon.js/issues/202).
