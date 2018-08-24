# A-Frame Extras

[![Build Status](https://travis-ci.org/donmccurdy/aframe-extras.svg?branch=master)](https://travis-ci.org/donmccurdy/aframe-extras)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/donmccurdy/aframe-extras/master/LICENSE)

Add-ons and helpers for A-Frame VR.

Includes components for controls, model loaders, pathfinding, and more:

<!-- tree src -I index.js -->
<pre>
src
├── <b>controls/</b> (<a href="/src/controls">Documentation</a>)
│   ├── movement-controls.js    <sub><img alt="New" src="https://img.shields.io/badge/status-new-green.svg"></sub>
│   ├── checkpoint-controls.js
│   ├── gamepad-controls.js
│   ├── keyboard-controls.js
│   ├── mouse-controls.js
│   └── touch-controls.js
├── <b>loaders/</b> (<a href="/src/loaders">Documentation</a>)
│   ├── animation-mixer.js
│   ├── fbx-model.js
│   ├── gltf-model-legacy.js
│   ├── json-model.js
│   ├── object-model.js
│   └── ply-model.js
├── <b>misc/</b> (<a href="/src/misc">Documentation</a>)
│   ├── checkpoint.js
│   ├── cube-env-map.js
│   ├── grab.js
│   ├── jump-ability.js
│   ├── kinematic-body.js       <sub><img alt="Deprecated" src="https://img.shields.io/badge/status-deprecated-orange.svg"></sub>
│   ├── mesh-smooth.js
│   └── sphere-collider.js
├── <b>pathfinding/</b> (<a href="/src/pathfinding">Documentation</a>)
│   ├── nav-mesh.js             <sub><img alt="New" src="https://img.shields.io/badge/status-new-green.svg"></sub>
│   └── nav-agent.js            <sub><img alt="New" src="https://img.shields.io/badge/status-new-green.svg"></sub>
└── <b>primitives/</b> (<a href="/src/primitives">Documentation</a>)
    ├── a-grid.js
    ├── a-hex-grid.js
    ├── a-ocean.js
    └── a-tube.js
</pre>

## Usage (Scripts)

In the [dist/](https://github.com/donmccurdy/aframe-extras/tree/master/dist) folder, download any package(s) you need. Include the scripts on your page, and all components are automatically registered for you:

```html
<script src="//cdn.rawgit.com/donmccurdy/aframe-extras/v4.1.2/dist/aframe-extras.min.js"></script>
```

CDN builds for aframe-extras/v4.1.2:

- [aframe-extras.js](https://cdn.rawgit.com/donmccurdy/aframe-extras/v4.1.2/dist/aframe-extras.js) *(development)*
- [aframe-extras.min.js](https://cdn.rawgit.com/donmccurdy/aframe-extras/v4.1.2/dist/aframe-extras.min.js) *(production)*

For partial builds, use a subpackage like `aframe-extras.controls.min.js`. Full list of packages above.

**A-Frame Version Compatibility**

| A-Frame   | Extras            |
|-----------|-------------------|
| v0.8.X | aframe-extras/v4.1.2 |
| v0.5.X | */v3.13.1            |
| v0.4.X | */v3.3.0             |
| v0.3.X | */v2.6.1             |
| v0.2.X | */v1.17.0            |

> **NOTE:** Several components and examples also rely on [aframe-physics-system](https://github.com/donmccurdy/aframe-physics-system).

## Usage (NPM)

```
npm install --save aframe-extras
```

```javascript
// index.js
require('aframe-extras');
```

Once installed, you'll need to compile your JavaScript using something like [Browserify](http://browserify.org/) or [Webpack](http://webpack.github.io/). Example:

```bash
npm install -g browserify
browserify index.js -o bundle.js
```

`bundle.js` may then be included in your page. See [here](http://browserify.org/#middle-section) for a better introduction to Browserify.
