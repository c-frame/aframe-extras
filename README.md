# A-Frame Extras

[![Build Status](https://travis-ci.org/donmccurdy/aframe-extras.svg?branch=master)](https://travis-ci.org/donmccurdy/aframe-extras)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/donmccurdy/aframe-extras/master/LICENSE)

Add-ons and helpers for A-Frame VR.

## Usage (Scripts)

In the [dist/](https://github.com/donmccurdy/aframe-extras/tree/master/dist) folder, download any package(s) you need. Include the scripts on your page, and all components are automatically registered for you:

```html
<script src="//cdn.rawgit.com/donmccurdy/aframe-extras/v2.1.0/dist/aframe-extras.min.js"></script>
```

CDN builds for aframe-extras/v2.1.0:

- [aframe-extras.js](https://cdn.rawgit.com/donmccurdy/aframe-extras/v2.1.0/dist/aframe-extras.js) *(development)*
- [aframe-extras.min.js](https://cdn.rawgit.com/donmccurdy/aframe-extras/v2.1.0/dist/aframe-extras.min.js) *(production)*

> **Compatibility Notes:** Extras v2.0.0 is compatible with the A-Frame 'master' branch, and upcoming v0.3.0 release. For support for older versions of A-Frame, use Extras v1.17.0.

## Usage (NPM)

```
npm install --save aframe-extras
```

```javascript
// custom-extras.js

var extras = require('aframe-extras');
AFRAME.registerComponent('velocity', extras.math.velocity); // Register a single component.
extras.physics.registerAll();                               // Register a particular package, and its dependencies.
extras.registerAll();                                       // Register everything.
```

Once installed, you'll need to compile your JavaScript using something like [Browserify](http://browserify.org/) or [Webpack](http://webpack.github.io/). Example:

```bash
npm install -g browserify
browserify custom-extras.js -o bundle.js
```

`bundle.js` may then be included in your page. See [here](http://browserify.org/#middle-section) for a better introduction to Browserify.

## Add-ons

<!-- tree src -I index.js -->
<pre>
src
├── <b>controls/</b> (<a href="/src/controls">Documentation</a>)
│   ├── checkpoint-controls.js
│   ├── gamepad-controls.js
│   ├── hmd-controls.js
│   ├── keyboard-controls.js
│   ├── mouse-controls.js
│   ├── touch-controls.js
│   └── universal-controls.js
├── <b>loaders/</b> (<a href="/src/loaders">Documentation</a>)
│   ├── ply-model.js
│   └── three-model.js
├── <b>math/</b> (<a href="/src/math">Documentation</a>)
│   ├── quaternion.js
│   └── velocity.js
├── <b>misc/</b> (<a href="/src/misc">Documentation</a>)
│   ├── checkpoint.js
│   ├── jump-ability.js
│   └── toggle-velocity.js
├── <b>physics/</b> (<a href="/src/physics">Documentation</a>)
│   ├── body.js
│   ├── dynamic-body.js
│   ├── kinematic-body.js       <sub><img alt="Experimental" src="https://img.shields.io/badge/status-experimental-orange.svg"></sub>
│   ├── physics.js
│   ├── static-body.js
│   └── system
│       └── physics.js
├── <b>primitives/</b> (<a href="/src/primitives">Documentation</a>)
│   ├── a-grid.js
│   ├── a-ocean.js
│   └── a-tube.js
└── <b>shadows/</b> (<a href="/src/shadows">Documentation</a>)    <sub><img alt="Experimental" src="https://img.shields.io/badge/status-experimental-orange.svg"></sub>
    ├── shadow-light.js
    └── shadow.js
</pre>
