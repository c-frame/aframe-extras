# Physics

Components for A-Frame physics integration, built on [CANNON.js](http://schteppe.github.io/cannon.js/).

## Scene Physics

- **physics**: Added to the `<a-scene/>` element, and manages world physics.

## Components

- **dynamic-body**: Object that moves only according to physics simulation, which has mass and may collide with other objects. If the object will be pushed around by the player or other objects, choose `dynamic-body`.
- **static-body**: Static body with a fixed position. Unaffected by gravity and collisions, but other objects may collide with it. If the object will move only through animation, or not at all, use a `static-body`.
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

When debugging, it may be helpful to see the shape of the physics bodies attached to your entities, and verify that they're staying in sync. The `debug` option creates a red wireframe around each physics body:

```html
<a-scene physics="debug: true;">

  <!-- ... -->

</a-scene>
```

## Body Shapes

Components will attempt to find an appropriate CANNON.js shape to fit your model. Boxes, Planes, Cylinders, Spheres, Convex Hulls, and Trimeshes are supported. When defining an object, you may use `auto`, `box`, or `hull`. `auto` will choose from the available shapes automatically. Select a shape carefully, as there are performance implications with different choices:

* **Auto** (`auto`) – Chooses automatically from the available shapes. Currently uses Trimesh as a fallback for custom models, but this default may change in the future, to improve default scene performance.
* **Box** (`box`) – Great performance, compared to Hull or Trimesh shapes, and may be fitted to custom models.
* **Plane** ( – ) – Not available as a custom shape, but may be chosen automatically for PlaneGeometry.
* **Cylinder** ( – ) – Not available as a custom shape, but may be chosen automatically for CylinderGeometry.
* **Sphere** ( – ) – Not available as a custom shape, but may be chosen automatically for SphereGeometry.
* **Convex** (`hull`) – Wraps a model, much like shrink-wrap. Indents and holes are removed from the physics shape. Convex shapes are better supported than Trimesh, but still have performance implications when used as dynamic objects.
* **Trimesh** ( – ) – Not available as a custom shape, but may be chosen as a last resort for custom geometry. Trimeshes adapt to fit custom geometry (e.g. a `.OBJ` or `.DAE` file), but have very minimal support. Arbitrary trimesh shapes are difficult to model in any JS physics engine, will "fall through" certain other shapes, and have serious performance limitations.
* **Compound** ( – ) – *In progress.* Compound shapes require a bit of work to set up, but allow you to use multiple primitives to define a physics shape around custom models. These will general perform better, and behave more accurately, than Trimesh or Convex shapes. For example, a stool might be modeled as a cylinder-shaped seat, on four long cylindrical legs.

For more details, see the CANNON.js [collision matrix](https://github.com/schteppe/cannon.js#features).

Example using a bounding box for a custom model:

```html
<a-entity obj-model="obj: url(...)" dynamic-body="shape: box; mass: 2"></a-entity>
```

## Collision Events

CANNON.js generates events when a collision is detected, which are propagated onto the associated A-Frame entity. Example:

```javascript
var playerEl = document.querySelector('[camera]');
playerEl.addEventListener('collide', function (e) {
  console.log('Player has collided with body #' + e.detail.body.id);

  e.detail.target.el;  // Original entity (playerEl).
  e.detail.body.el;    // Other entity, which playerEl touched.
  e.detail.contact;    // Stats about the collision (CANNON.ContactEquation).
  e.detail.contact.ni; // Normal (direction) of the collision (CANNON.Vec3).
});
```

Note that CANNON.js cannot perfectly detect collisions with very fast-moving bodies. Doing so requires Continuous Collision Detection, which can be both slow and difficult to implement. If this is an issue for your scene, consider (1) slowing objects down, (2) detecting collisions manually (collisions with the floor are easy – `position.y - height / 2 <= 0`), or (3) attempting a PR to CANNON.js. See: [Collision with fast bodies](https://github.com/schteppe/cannon.js/issues/202).
