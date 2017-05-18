# Controls

**NOTE:** Parts of these controls components may be merged into A-Frame core in the future. See [aframevr/aframe#1248](https://github.com/aframevr/aframe/pull/1248).

Extensible movement/rotation/hotkey controls, with support for a variety of input devices.

- **universal-controls**: Manager for other controls, which can be used to decide which input device is used when multiple are available, and to set common acceleration/sensitivity across all controls.

## Usage

Basic:

```html
<a-entity camera universal-controls></a-entity>
```

Extend with custom controls:

```html
<a-entity camera
          universal-controls="movementControls: custom, gamepad;"
          custom-controls></a-entity>
```

To implement your custom controls, define a component and override one or more methods:

| Type     | Required | Method |
|----------|----------|--------|
| Rotation | Yes      | isRotationActive() : boolean |
| Rotation | No       | getRotationDelta(deltaMS : number) : THREE.Vector3 |
| Rotation | No       | getRotation() : THREE.Vector3 |
| Movement | Yes      | isVelocityActive() : boolean |
| Movement | No       | getVelocityDelta(deltaMS : number) : THREE.Vector3 |
| Movement | No       | getPositionDelta(deltaMS : number) : THREE.Vector3 |

Example:

```js
AFRAME.registerCompononent('custom-controls', {
  isVelocityActive: function () {
    return Math.random() < 0.25;
  },
  getPositionDelta: function () {
    return new THREE.Vector3(1, 0, 0);
  }
});
```

## Input devices:

- **checkpoint-controls**: Teleport or animate between checkpoints. See also: [checkpoint](/src/misc/checkpoint.js).
- **gamepad-controls**: Gamepad position + (optional) rotation controls.
- **hmd-controls**: HMD rotation / positional tracking controls.
- **keyboard-controls**: WASD+Arrow key movement controls, with improved support for ZQSD and Dvorak layouts.
- **mouse-controls**: Mouse + Pointerlock controls. *Non-VR / desktop only.*
- **touch-controls**: Touch-to-move controls, e.g. for Cardboard.

## Other Controls

I've written standalone components for several other control components.

- [gamepad-controls](https://github.com/donmccurdy/aframe-gamepad-controls): A more advanced standalone gamepad controller than the version in this package.
- [keyboard-controls](https://github.com/donmccurdy/aframe-keyboard-controls): A more advanced standalone keyboard controller than the version in this package.
- **leap-motion-controls**: *In progress.*

## Mobile + Desktop Input Devices

Connect input devices from your desktop to your mobile phone with WebRTC, using [ProxyControls.js](https://proxy-controls.donmccurdy.com).

## Mobile Gamepad Support

See my [separate overview of gamepad support](https://gist.github.com/donmccurdy/cf336a8b88ba0f10991d4aab936cc28b).
