# Physics

Components for A-Frame physics integration, built on [CANNON.js](http://schteppe.github.io/cannon.js/).

## Components

The `dynamic-body` and `static-body` components may be added to any `<a-entity/>` that contains a mesh. Generally, each scene will have at least one `static-body` for the ground, and one or more `dynamic-body` instances that the player can interact with.

- **dynamic-body**: A freely-moving object. Dynamic bodies have mass, collide with other objects, bounce or slow during collisions, and fall if gravity is enabled.
- **static-body**: A fixed-position or animated object. Other objects may collide with static bodies, but static bodies themselves are unaffected by gravity and collisions.

## Basic Usage

```html
<!-- The debug:true option creates a wireframe around each physics body. If you don't see a wireframe,
     the physics system may be unable to parse your model without a shape:box or shape:hull option. -->
<a-scene physics="debug: true">

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

## Using the CANNON.js API

For more advanced physics, use the CANNON.js API with custom JavaScript and A-Frame components. The [CANNON.js documentation](http://schteppe.github.io/cannon.js/docs/) and source code offer good resources for learning to work with physics in JavaScript.

In A-Frame, each entity's `CANNON.Body` instance is exposed on the `el.body` property. To apply a quick push to an object, you might do the following:

```html
<a-scene>
  <a-entity id="nyan" dynamic-body="shape: hull" obj-model="obj: url(nyan-cat.obj)"></a-entity>
  <a-grid static-body><a/grid>
</a-scene>
```

```javascript
var el = sceneEl.querySelector('#nyan');
el.body.applyImpulse(
  /* impulse */        new CANNON.Vec3(0, 1, -1),
  /* world position */ new CANNON.Vec3().copy(el.getComputedAttribute('position'))
);
```

## Body Shapes

Components will attempt to find an appropriate CANNON.js shape to fit your model. Boxes, Planes, Cylinders, Spheres, Convex Hulls, and Trimeshes are supported. When defining an object, you may use `auto`, `box`, or `hull`. `auto` will choose from the available shapes automatically. Select a shape carefully, as there are performance implications with different choices:

* **Auto** (`auto`) – Chooses automatically from the available shapes.
* **Box** (`box`) – Great performance, compared to Hull or Trimesh shapes, and may be fitted to custom models.
* **Convex** (`hull`) – Wraps a model like shrink-wrap. Convex shapes are more performant and better supported than Trimesh, but may still have some performance impact when used as dynamic objects.
* **Primitives** – Plane/Cylinder/Sphere. Used automatically with the corresponding A-Frame primitives.
* **Trimesh** – *Deprecated.* Not available as a custom shape, but may be chosen as a last resort for custom geometry. Trimeshes adapt to fit custom geometry (e.g. a `.OBJ` or `.DAE` file), but have very minimal support. Arbitrary trimesh shapes are difficult to model in any JS physics engine, will "fall through" certain other shapes, and have serious performance limitations.
* **Compound** – *In progress.* Compound shapes require a bit of work to set up, but allow you to use multiple primitives to define a physics shape around custom models. These will general perform better, and behave more accurately, than Trimesh or Convex shapes. For example, a stool might be modeled as a cylinder-shaped seat, on four long cylindrical legs.

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

## Configuration

Contact materials define what happens when two objects meet, including physical properties such as friction and restitution (bounciness). The default, scene-wide contact materials may be configured on the scene element:

```html
<a-scene physics="friction: 0.1; restitution: 0.5">
  <!-- ... -->
</a-scene>
```

| Property                        | Default | Description                                        |
|---------------------------------|---------|----------------------------------------------------|
| debug                           | true    | Whether to show wireframes for debugging.          |
| iterations                      | 10      | The number of solver iterations determines quality of the constraints in the world. The more iterations, the more correct simulation. More iterations need more computations though. If you have a large gravity force in your world, you will need more iterations. |
| maxInterval                     | 0.0667  | Maximum simulated time (in milliseconds) that may be taken by the physics engine per frame. Effectively prevents weird "jumps" when the player returns to the scene after a few minutes, at the expense of pausing physics during this time. |
| friction                        | 0.01    | Coefficient of friction.                           |
| restitution                     | 0.3     | Coefficient of restitution (bounciness).           |
| contactEquationStiffness        | 1e8     | Stiffness of the produced contact equations.       |
| contactEquationRelaxation       | 3       | Relaxation time of the produced contact equations. |
| frictionEquationStiffness       | 1e8     | Stiffness of the produced friction equations.      |
| frictionEquationRegularization  | 3       | Relaxation time of the produced friction equations |

More advanced configuration, including specifying different collision behaviors for different objects, is available through the CANNON.js JavaScript API.

Resources:

* [CANNON.World](http://schteppe.github.io/cannon.js/docs/classes/World.html)
* [CANNON.ContactMaterial](http://schteppe.github.io/cannon.js/docs/classes/ContactMaterial.html)

## Experimental

The `kinematic-body` component is useful in FPS and third-person games, but is not intended for use with first-person VR experiences because it can jar the camera during collisions.

- **kinematic-body**: Player-controlled body, which can move but is not affected (directly) by the physics engine. Intended for use on the player's model. Gravity and collisions are simulated, without giving full control to the physics engine.
