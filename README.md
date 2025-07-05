# A-Frame Extras

[![Latest NPM release](https://img.shields.io/npm/v/aframe-extras.svg)](https://www.npmjs.com/package/aframe-extras)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/c-frame/aframe-extras/master/LICENSE)

Add-ons and helpers for A-Frame VR.

Includes components for controls, model loaders, pathfinding, and more:

<!-- tree src -I index.js -->
<pre>
src
├── <b>controls/</b> (<a href="/src/controls">Documentation</a>)
│   ├── movement-controls.js
│   ├── checkpoint-controls.js
│   ├── gamepad-controls.js
│   ├── keyboard-controls.js
│   ├── touch-controls.js
│   └── trackpad-controls.js
├── <b>loaders/</b> (<a href="/src/loaders">Documentation</a>)
│   ├── animation-mixer.js
│   ├── collada-model-legacy.js
│   ├── fbx-model.js
│   └── object-model.js
├── <b>misc/</b> (<a href="/src/misc">Documentation</a>)
│   ├── checkpoint.js
│   ├── cube-env-map.js
│   ├── grab.js
│   ├── mesh-smooth.js
│   ├── normal-material.js
│   └── sphere-collider.js
├── <b>pathfinding/</b> (<a href="/src/pathfinding">Documentation</a>)
│   ├── nav-mesh.js
│   └── nav-agent.js
└── <b>primitives/</b> (<a href="/src/primitives">Documentation</a>)
    ├── a-grid.js
    ├── a-ocean.js
    └── a-tube.js
</pre>

## Usage (Scripts)

In the [dist/](https://github.com/c-frame/aframe-extras/tree/master/dist) folder, download any package(s) you need. Include the scripts on your page, and all components are automatically registered for you:

```html
<script src="https://cdn.jsdelivr.net/gh/c-frame/aframe-extras@7.6.0/dist/aframe-extras.min.js"></script>
```

replace `7.6.0` by another tag or a commit hash (for example `3e0ab50`) if you want to use a build from master branch.
You can [look at the commits](https://github.com/c-frame/aframe-extras/commits/master) and use the latest commit hash.

For partial builds, use a subpackage like `aframe-extras.controls.min.js`. Full list of packages above.

**A-Frame Version Compatibility**

| A-Frame  | Extras |
|----------|--------|
| v1.7.x   | v7.x.x |
| v1.4.0   | v7.0.0 |
| v1.3.0   | v7.0.0 |
| v1.2.0   | v7.0.0 |
| v1.1.0   | v6.1.1 |

> **NOTE:** Several components and examples also rely on [aframe-physics-system](https://github.com/c-frame/aframe-physics-system).

## Usage (NPM)

```
npm install --save aframe-extras
```

```javascript
// index.js
import 'aframe-extras';
// or specific packages
import "aframe-extras/controls/index.js";
import "aframe-extras/pathfinding/index.js";
```

Once installed, you'll need to compile your JavaScript using something like [webpack](https://webpack.js.org) with three defined as external, see webpack.config.js in this repo for an example.

## Examples

A live set of usage examples can be found here:

https://c-frame.github.io/aframe-extras/examples/

## Deprecated Components

The following components existed in previous versions of A-Frame Extras, but have been removed as of the latest release

| Component        | Removed in | Reasons                                                      |
| ---------------- | ---------- | ------------------------------------------------------------ |
| `kinematic-body` | 7.0.0      | Using physics for movement is unstable and performs poorly. When preventing players from passing through obstacles, use a navigation mesh instead whenever possible.<br /><br />The `kinematic-body` component constrainted player movement using physics, and depended on [aframe-physics-system](http://github.com/c-frame/aframe-physics-system). Using physics for locomotion is not VR-friendly, and often glitchy even for traditional 3D experiences. [Use a navigation mesh](https://github.com/c-frame/aframe-extras/tree/master/src/controls#usage) instead, whenever possible. |
| `jump-ability`   | 7.0.0      | Dependent on `kinematic-body`                                |
| `a-hexgrid`      | 7.0.0      | Was based on [this repo](https://github.com/vonWolfehaus/von-grid), which is no longer maintained, and does not work with recent versions of THREE.js. |
| `mesh-smooth`    | 7.0.0      | Intended for JSON models, but the JSON Loader is [no longer part of this repo](https://github.com/c-frame/aframe-extras/commit/d079064e6ac55a4cd6bbf64bd46a576e26dd214e).  More background [here](https://github.com/c-frame/aframe-extras/issues/411). |

