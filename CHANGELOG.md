# Changelog

## v4.1.0
* **movement-controls** — Replace acceleration/easing with `speed` property.

## v4.0.0

* Added CHANGELOG.md
* Removed `universal-controls`, replacing with `movement-controls`. In contrast to previous releases, `movement-controls` is intended to be used _with_ the default `look-controls` component. It adds several locomotion methods, and can be extended to include more, replacing `wasd-controls`. See [documentation](https://github.com/donmccurdy/aframe-extras/tree/v4.0.0/src/controls).
* Added navmesh support to `movement-controls`.
* Removed physics. Instead, include it separately via [aframe-physics-system](https://github.com/donmccurdy/aframe-physics-system).
