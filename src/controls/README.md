# Controls

Extensible movement/rotation/hotkey controls, with support for a variety of input devices.

- **movement-controls**: Collection of locomotion controls, which can switch between input devices as they become active. Automatically includes the following components:
  + **keyboard-controls**: WASD + arrow controls for movement, and more.
  + **touch-controls**: Touch screen (or Cardboard button) to move forward.
  + **gamepad-controls**: Gamepad-based rotation and movement.
- **checkpoint-controls**: Move to checkpoints created with the `checkpoint` component. *Not included by default with `movement-controls`, but may be added as shown in examples.*

```html
<a-scene movement-controls="constrainToNavMesh: true">
  <a-entity look-controls camera></a-entity>
</a-scene>

```

## Usage

Basic:

```html
<a-entity camera movement-controls></a-entity>
```

With checkpoint controls:

```html
<a-entity camera movement-controls="controls: checkpoint"></a-entity>
```

With custom controls:

```html
<a-entity camera
          movement-controls="controls: custom, gamepad;"
          custom-controls></a-entity>
```

## Options

| Property           | Default | Description |
|--------------------|---------|-------------|
| enabled            | true    | Enables/disables movement controls. |
| controls           | gamepad, keyboard, touch | Ordered list of controls to be injected. |
| easing             | 15       | Rate at which movement decelerates horizontally each frame. |
| easingY            | 0        | Rate at which movement decelerates vertically each frame. |
| acceleration       | 80       | Rate at which movement increases with input.        |
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

## Input devices:

- **checkpoint-controls**: Teleport or animate between checkpoints. See also: [checkpoint](/src/misc/checkpoint.js). Fires `navigation-start` and `navigation-end` events.
- **gamepad-controls**: Gamepad position + (optional) rotation controls.
- **keyboard-controls**: WASD+Arrow key movement controls, with improved support for ZQSD and Dvorak layouts.
- **touch-controls**: Touch-to-move controls, e.g. for Cardboard.

## Other Controls

I've written standalone components for several other control components.

- [gamepad-controls](https://github.com/donmccurdy/aframe-gamepad-controls): A more advanced standalone gamepad controller than the version in this package.
- [keyboard-controls](https://github.com/donmccurdy/aframe-keyboard-controls): A more advanced standalone keyboard controller than the version in this package.

## Mobile + Desktop Input Devices

Connect input devices from your desktop to your mobile phone with WebRTC, using [ProxyControls.js](https://proxy-controls.donmccurdy.com).

## Mobile Gamepad Support

See my [separate overview of gamepad support](https://gist.github.com/donmccurdy/cf336a8b88ba0f10991d4aab936cc28b).
