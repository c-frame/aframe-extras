# Controls

Extensible movement/rotation/hotkey controls, with support for a variety of input devices.

- **movement-controls**: Collection of locomotion controls, which can switch between input devices as they become active. Automatically includes the following components:
  + **keyboard-controls**: WASD + arrow controls for movement, and more.
  + **touch-controls**: Touch screen (or Cardboard button) to move forward.
  + **gamepad-controls**: Gamepad-based rotation and movement.
  + **trackpad-controls**: Trackpad-based movement.
- **checkpoint-controls**: Move to checkpoints created with the `checkpoint` component. *Not included by default with `movement-controls`, but may be added as shown in examples.*

## Usage

The `movement-controls` component requires the use of a camera "rig" wrapping the camera element. The rig may be assigned any position within your scene, and should be placed at ground level. The camera should only have height offset (used for devices without positional tracking) such as `0 1.6 0`.

Basic movement:

```html
<a-entity id="rig"
          movement-controls
          position="25 0 25">
  <a-entity camera
            position="0 1.6 0"
            look-controls="pointerLockEnabled: true"></a-entity>
</a-entity>
```

With checkpoints, and other input methods disabled:

```html
<a-entity id="rig"
          movement-controls="controls: checkpoint"
          checkpoint-controls="mode: animate">
  <a-entity camera
            position="0 1.6 0"
            look-controls="pointerLockEnabled: true">
  </a-entity>
</a-entity>
```

With navigation mesh:

```html
<a-entity id="rig" movement-controls="constrainToNavMesh: true">
  <a-entity camera
            position="0 1.6 0"
            look-controls="pointerLockEnabled: true">
  </a-entity>
</a-entity>
```

With physics-based movement.

> **WARNING** *Using physics for movement is unstable and performs poorly. When preventing players from passing through obstacles, use a navigation mesh instead whenever possible.*

```html
<a-entity id="rig" movement-controls kinematic-body>
  <a-entity camera
            position="0 1.6 0"
            look-controls="pointerLockEnabled: true"></a-entity>
</a-entity>
```

## Options

| Property           | Default | Description |
|--------------------|---------|-------------|
| enabled            | true    | Enables/disables movement controls. |
| controls           | gamepad, keyboard, touch | Ordered list of controls to be injected. |
| speed              | 0.3      | Movement speed. |
| fly                | false    | Whether vertical movement is enabled.               |
| constrainToNavMesh | false    | Whether to use navigation system to clamp movement. |
| camera             | [camera] | Camera element used for heading of the camera rig.  |

## Customizing movement-controls

To implement your custom controls, define a component and override one or more methods:

| Method                                             | Type     | Required |
|----------------------------------------------------|----------|----------|
| isVelocityActive() : boolean                       | Movement | Yes |
| getVelocityDelta(deltaMS : number) : THREE.Vector3 | Movement | No  |
| getPositionDelta(deltaMS : number) : THREE.Vector3 | Movement | No  |

Example:

```js
AFRAME.registerComponent('custom-controls', {
  isVelocityActive: function () {
    return Math.random() < 0.25;
  },
  getPositionDelta: function () {
    return new THREE.Vector3(1, 0, 0);
  }
});
```

## Other Controls

I've written standalone components for several other control components. These do not work with `movement-controls`, and are older and less well maintained.

- [gamepad-controls](https://github.com/donmccurdy/aframe-gamepad-controls): A more advanced standalone gamepad controller than the version in this package.
- [keyboard-controls](https://github.com/donmccurdy/aframe-keyboard-controls): A more advanced standalone keyboard controller than the version in this package.

## Mobile + Desktop Input Devices

Connect input devices from your desktop to your mobile phone with WebRTC, using [ProxyControls.js](https://proxy-controls.donmccurdy.com).

## Mobile Gamepad Support

See my [separate overview of gamepad support](https://gist.github.com/donmccurdy/cf336a8b88ba0f10991d4aab936cc28b).
