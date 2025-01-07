# Changelog

## v4.2.0

* **movement-controls** Added support for setting rig rotation. Fixed bug with `speed` implementation.
* **nav** Improved nav-mesh load handling, renamed `nav-start` and `nav-end` events to `navigation-start` and `navigation-end`.
* **animation-mixer** Allows property updates while playing, added `timeScale` property.
* **touch-controls** Support two-finger touch to move backwards.
* **fbx-model** Updated to FBXLoader r96.

## v4.1.0

* **movement-controls** — Replace acceleration/easing with `speed` property.

## v4.0.0

* Added CHANGELOG.md
* Removed `universal-controls`, replacing with `movement-controls`. In contrast to previous releases, `movement-controls` is intended to be used _with_ the default `look-controls` component. It adds several locomotion methods, and can be extended to include more, replacing `wasd-controls`. See [documentation](https://github.com/c-frame/aframe-extras/tree/v4.0.0/src/controls).
* Added navmesh support to `movement-controls`.
* Removed physics. Instead, include it separately via [aframe-physics-system](https://github.com/c-frame/aframe-physics-system).
