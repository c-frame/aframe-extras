# Math

Helpers for physics and controls components.

- **velocity**: Updates an entity's position at each clock tick, according to a constant (or animateable) velocity.
- **quaternion**: Alternative to the `rotation` component, helpful in the odd case where gimbal lock is an issue.

## Usage

Velocity:

```html
<a-entity velocity="-1 0 0"></a-entity>
```

Quaternion:

```html
<a-entity quaternion="-0.707107 0 0 0.707107"></a-entity>
```
