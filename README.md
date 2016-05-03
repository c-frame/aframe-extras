# A-Frame Extras

Add-ons and helpers for A-Frame VR.

## Usage (Scripts)

In the [dist/](https://github.com/donmccurdy/aframe-extras/tree/master/dist) folder, download any package(s) you need. Include the scripts on your page:

```html
<script src="//cdn.rawgit.com/donmccurdy/aframe-extras/v1.12.6/dist/aframe-extras.min.js"></script>
```

CDN builds for aframe-extras/v1.12.6:

- [aframe-extras.js](https://cdn.rawgit.com/donmccurdy/aframe-extras/v1.12.6/dist/aframe-extras.js)
- [aframe-extras.min.js](https://cdn.rawgit.com/donmccurdy/aframe-extras/v1.12.6/dist/aframe-extras.min.js)

Each package's components are automatically registered for you.

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
├── <a href="/src/controls">controls/</a>
│   ├── checkpoint-controls.js
│   ├── gamepad-controls.js
│   ├── hmd-controls.js
│   ├── keyboard-controls.js    <i>(not VR-friendly)</i>
│   ├── mouse-controls.js       <i>(not VR-friendly)</i>
│   ├── touch-controls.js
│   └── universal-controls.js
├── <a href="/src/loaders">loaders/</a>
│   ├── fbx-model.js            <i>(experimental)</i>
│   ├── ply-model.js
│   └── three-model.js
├── <a href="/src/math">math/</a>
│   ├── quaternion.js
│   └── velocity.js
├── <a href="/src/misc">misc/</a>
│   ├── checkpoint.js
│   ├── jump-ability.js         <i>(not VR-friendly)</i>
│   └── toggle-velocity.js
├── <a href="/src/physics">physics/</a>
│   ├── body.js
│   ├── dynamic-body.js
│   ├── kinematic-body.js
│   ├── physics.js
│   ├── static-body.js
│   └── system
│       └── physics.js
├── <a href="/src/primitives">primitives/</a>
│   ├── a-grid.js
│   └── a-ocean.js
└── <a href="/src/shadows">shadows/</a>
    ├── shadow-light.js         <i>(experimental)</i>
    └── shadow.js               <i>(experimental)</i>
</pre>
