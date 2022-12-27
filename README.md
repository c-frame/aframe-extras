# A-Frame Extras

[![Latest NPM release](https://img.shields.io/npm/v/aframe-extras.svg)](https://www.npmjs.com/package/aframe-extras)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/n5ro/aframe-extras/master/LICENSE)

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
│   ├── gltf-model-legacy.js
│   └── object-model.js
├── <b>misc/</b> (<a href="/src/misc">Documentation</a>)
│   ├── checkpoint.js
│   ├── cube-env-map.js
│   ├── grab.js
│   ├── jump-ability.js
│   ├── kinematic-body.js       <sub><img alt="Deprecated" src="https://img.shields.io/badge/status-deprecated-orange.svg"></sub>
│   ├── mesh-smooth.js
│   ├── normal-material.js
│   └── sphere-collider.js
├── <b>pathfinding/</b> (<a href="/src/pathfinding">Documentation</a>)
│   ├── nav-mesh.js
│   └── nav-agent.js
└── <b>primitives/</b> (<a href="/src/primitives">Documentation</a>)
    ├── a-grid.js
    ├── a-hex-grid.js
    ├── a-ocean.js
    └── a-tube.js
</pre>

## Usage (Scripts)

In the [dist/](https://github.com/n5ro/aframe-extras/tree/master/dist) folder, download any package(s) you need. Include the scripts on your page, and all components are automatically registered for you:

```html
<script src="https://cdn.jsdelivr.net/gh/n5ro/aframe-extras@tagOrCommit/dist/aframe-extras.min.js"></script>
```

replace `tagOrCommit` by a tag (for example `v6.1.1`) or a commit hash (for example `fb96ab2`):

CDN builds of the latest version:

- [aframe-extras.js](https://cdn.jsdelivr.net/gh/n5ro/aframe-extras@fb96ab2/dist/aframe-extras.js) *(development)*
- [aframe-extras.min.js](https://cdn.jsdelivr.net/gh/n5ro/aframe-extras@fb96ab2/dist/aframe-extras.min.js) *(production)*

For partial builds, use a subpackage like `aframe-extras.controls.min.js`. Full list of packages above.

**A-Frame Version Compatibility**

| A-Frame  | Extras                        |
|----------|-------------------------------|
| v1.4.0   | v6.2.0 (unreleased) / fb96ab2 |
| v1.3.0   | v6.2.0 (unreleased) / fb96ab2 |
| v1.2.0   | v6.2.0 (unreleased) / fb96ab2 |
| v1.1.0   | v6.1.1                        |

> **NOTE:** Several components and examples also rely on [aframe-physics-system](https://github.com/c-frame/aframe-physics-system).

## Usage (NPM)

```
npm install --save aframe-extras
```

```javascript
// index.js
require('aframe-extras');
```

Once installed, you'll need to compile your JavaScript using something like [webpack](https://webpack.js.org).
