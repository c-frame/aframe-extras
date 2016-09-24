(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./src/loaders').registerAll();
},{"./src/loaders":3}],2:[function(require,module,exports){
/**
 * @author Wei Meng / http://about.me/menway
 *
 * Description: A THREE loader for PLY ASCII files (known as the Polygon File Format or the Stanford Triangle Format).
 *
 *
 * Limitations: ASCII decoding assumes file is UTF-8.
 *
 * Usage:
 *  var loader = new THREE.PLYLoader();
 *  loader.load('./models/ply/ascii/dolphins.ply', function (geometry) {
 *
 *    scene.add( new THREE.Mesh( geometry ) );
 *
 *  } );
 *
 * If the PLY file uses non standard property names, they can be mapped while
 * loading. For example, the following maps the properties
 * “diffuse_(red|green|blue)” in the file to standard color names.
 *
 * loader.setPropertyNameMapping( {
 *  diffuse_red: 'red',
 *  diffuse_green: 'green',
 *  diffuse_blue: 'blue'
 * } );
 *
 */

module.exports = THREE.PLYLoader = function ( manager ) {

  this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

  this.propertyNameMapping = {};

};

THREE.PLYLoader.prototype = {

  constructor: THREE.PLYLoader,

  load: function ( url, onLoad, onProgress, onError ) {

    var scope = this;

    var loader = new THREE.XHRLoader( this.manager );
    loader.setResponseType( 'arraybuffer' );
    loader.load( url, function ( text ) {

      onLoad( scope.parse( text ) );

    }, onProgress, onError );

  },

  setPropertyNameMapping: function ( mapping ) {

    this.propertyNameMapping = mapping;

  },

  bin2str: function ( buf ) {

    var array_buffer = new Uint8Array( buf );
    var str = '';
    for ( var i = 0; i < buf.byteLength; i ++ ) {

      str += String.fromCharCode( array_buffer[ i ] ); // implicitly assumes little-endian

    }

    return str;

  },

  isASCII: function( data ) {

    var header = this.parseHeader( this.bin2str( data ) );

    return header.format === "ascii";

  },

  parse: function ( data ) {

    if ( data instanceof ArrayBuffer ) {

      return this.isASCII( data )
        ? this.parseASCII( this.bin2str( data ) )
        : this.parseBinary( data );

    } else {

      return this.parseASCII( data );

    }

  },

  parseHeader: function ( data ) {

    var patternHeader = /ply([\s\S]*)end_header\s/;
    var headerText = "";
    var headerLength = 0;
    var result = patternHeader.exec( data );
    if ( result !== null ) {

      headerText = result [ 1 ];
      headerLength = result[ 0 ].length;

    }

    var header = {
      comments: [],
      elements: [],
      headerLength: headerLength
    };

    var lines = headerText.split( '\n' );
    var currentElement = undefined;
    var lineType, lineValues;

    function make_ply_element_property( propertValues, propertyNameMapping ) {

      var property = {
        type: propertValues[ 0 ]
      };

      if ( property.type === 'list' ) {

        property.name = propertValues[ 3 ];
        property.countType = propertValues[ 1 ];
        property.itemType = propertValues[ 2 ];

      } else {

        property.name = propertValues[ 1 ];

      }

      if ( property.name in propertyNameMapping ) {

        property.name = propertyNameMapping[ property.name ];

      }

      return property;

    }

    for ( var i = 0; i < lines.length; i ++ ) {

      var line = lines[ i ];
      line = line.trim();
      if ( line === "" ) {

        continue;

      }
      lineValues = line.split( /\s+/ );
      lineType = lineValues.shift();
      line = lineValues.join( " " );

      switch ( lineType ) {

      case "format":

        header.format = lineValues[ 0 ];
        header.version = lineValues[ 1 ];

        break;

      case "comment":

        header.comments.push( line );

        break;

      case "element":

        if ( ! ( currentElement === undefined ) ) {

          header.elements.push( currentElement );

        }

        currentElement = Object();
        currentElement.name = lineValues[ 0 ];
        currentElement.count = parseInt( lineValues[ 1 ] );
        currentElement.properties = [];

        break;

      case "property":

        currentElement.properties.push( make_ply_element_property( lineValues, this.propertyNameMapping ) );

        break;


      default:

        console.log( "unhandled", lineType, lineValues );

      }

    }

    if ( ! ( currentElement === undefined ) ) {

      header.elements.push( currentElement );

    }

    return header;

  },

  parseASCIINumber: function ( n, type ) {

    switch ( type ) {

    case 'char': case 'uchar': case 'short': case 'ushort': case 'int': case 'uint':
    case 'int8': case 'uint8': case 'int16': case 'uint16': case 'int32': case 'uint32':

      return parseInt( n );

    case 'float': case 'double': case 'float32': case 'float64':

      return parseFloat( n );

    }

  },

  parseASCIIElement: function ( properties, line ) {

    var values = line.split( /\s+/ );

    var element = Object();

    for ( var i = 0; i < properties.length; i ++ ) {

      if ( properties[ i ].type === "list" ) {

        var list = [];
        var n = this.parseASCIINumber( values.shift(), properties[ i ].countType );

        for ( var j = 0; j < n; j ++ ) {

          list.push( this.parseASCIINumber( values.shift(), properties[ i ].itemType ) );

        }

        element[ properties[ i ].name ] = list;

      } else {

        element[ properties[ i ].name ] = this.parseASCIINumber( values.shift(), properties[ i ].type );

      }

    }

    return element;

  },

  parseASCII: function ( data ) {

    // PLY ascii format specification, as per http://en.wikipedia.org/wiki/PLY_(file_format)

    var geometry = new THREE.Geometry();

    var result;

    var header = this.parseHeader( data );

    var patternBody = /end_header\s([\s\S]*)$/;
    var body = "";
    if ( ( result = patternBody.exec( data ) ) !== null ) {

      body = result [ 1 ];

    }

    var lines = body.split( '\n' );
    var currentElement = 0;
    var currentElementCount = 0;
    geometry.useColor = false;

    for ( var i = 0; i < lines.length; i ++ ) {

      var line = lines[ i ];
      line = line.trim();
      if ( line === "" ) {

        continue;

      }

      if ( currentElementCount >= header.elements[ currentElement ].count ) {

        currentElement ++;
        currentElementCount = 0;

      }

      var element = this.parseASCIIElement( header.elements[ currentElement ].properties, line );

      this.handleElement( geometry, header.elements[ currentElement ].name, element );

      currentElementCount ++;

    }

    return this.postProcess( geometry );

  },

  postProcess: function ( geometry ) {

    if ( geometry.useColor ) {

      for ( var i = 0; i < geometry.faces.length; i ++ ) {

        geometry.faces[ i ].vertexColors = [
          geometry.colors[ geometry.faces[ i ].a ],
          geometry.colors[ geometry.faces[ i ].b ],
          geometry.colors[ geometry.faces[ i ].c ]
        ];

      }

      geometry.elementsNeedUpdate = true;

    }

    geometry.computeBoundingSphere();

    return geometry;

  },

  handleElement: function ( geometry, elementName, element ) {

    if ( elementName === "vertex" ) {

      geometry.vertices.push(
        new THREE.Vector3( element.x, element.y, element.z )
      );

      if ( 'red' in element && 'green' in element && 'blue' in element ) {

        geometry.useColor = true;

        var color = new THREE.Color();
        color.setRGB( element.red / 255.0, element.green / 255.0, element.blue / 255.0 );
        geometry.colors.push( color );

      }

    } else if ( elementName === "face" ) {

      // BEGIN: Edits by donmccurdy.
      var vertex_indices = element.vertex_indices || element.vertex_index;
      // END: Edits by donmccurdy.

      if ( vertex_indices.length === 3 ) {

        geometry.faces.push(
          new THREE.Face3( vertex_indices[ 0 ], vertex_indices[ 1 ], vertex_indices[ 2 ] )
        );

      } else if ( vertex_indices.length === 4 ) {

        geometry.faces.push(
          new THREE.Face3( vertex_indices[ 0 ], vertex_indices[ 1 ], vertex_indices[ 3 ] ),
          new THREE.Face3( vertex_indices[ 1 ], vertex_indices[ 2 ], vertex_indices[ 3 ] )
        );

      }

    }

  },

  binaryRead: function ( dataview, at, type, little_endian ) {

    switch ( type ) {

      // corespondences for non-specific length types here match rply:
    case 'int8':    case 'char':   return [ dataview.getInt8( at ), 1 ];

    case 'uint8':   case 'uchar':  return [ dataview.getUint8( at ), 1 ];

    case 'int16':   case 'short':  return [ dataview.getInt16( at, little_endian ), 2 ];

    case 'uint16':  case 'ushort': return [ dataview.getUint16( at, little_endian ), 2 ];

    case 'int32':   case 'int':    return [ dataview.getInt32( at, little_endian ), 4 ];

    case 'uint32':  case 'uint':   return [ dataview.getUint32( at, little_endian ), 4 ];

    case 'float32': case 'float':  return [ dataview.getFloat32( at, little_endian ), 4 ];

    case 'float64': case 'double': return [ dataview.getFloat64( at, little_endian ), 8 ];

    }

  },

  binaryReadElement: function ( dataview, at, properties, little_endian ) {

    var element = Object();
    var result, read = 0;

    for ( var i = 0; i < properties.length; i ++ ) {

      if ( properties[ i ].type === "list" ) {

        var list = [];

        result = this.binaryRead( dataview, at + read, properties[ i ].countType, little_endian );
        var n = result[ 0 ];
        read += result[ 1 ];

        for ( var j = 0; j < n; j ++ ) {

          result = this.binaryRead( dataview, at + read, properties[ i ].itemType, little_endian );
          list.push( result[ 0 ] );
          read += result[ 1 ];

        }

        element[ properties[ i ].name ] = list;

      } else {

        result = this.binaryRead( dataview, at + read, properties[ i ].type, little_endian );
        element[ properties[ i ].name ] = result[ 0 ];
        read += result[ 1 ];

      }

    }

    return [ element, read ];

  },

  parseBinary: function ( data ) {

    var geometry = new THREE.Geometry();

    var header = this.parseHeader( this.bin2str( data ) );
    var little_endian = ( header.format === "binary_little_endian" );
    var body = new DataView( data, header.headerLength );
    var result, loc = 0;

    for ( var currentElement = 0; currentElement < header.elements.length; currentElement ++ ) {

      for ( var currentElementCount = 0; currentElementCount < header.elements[ currentElement ].count; currentElementCount ++ ) {

        result = this.binaryReadElement( body, loc, header.elements[ currentElement ].properties, little_endian );
        loc += result[ 1 ];
        var element = result[ 0 ];

        this.handleElement( geometry, header.elements[ currentElement ].name, element );

      }

    }

    return this.postProcess( geometry );

  }

};

},{}],3:[function(require,module,exports){
module.exports = {
  'ply-model': require('./ply-model'),
  'three-model': require('./three-model'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;

    if (!AFRAME.systems['ply-model']) {
      AFRAME.registerSystem('ply-model', this['ply-model'].System);
    }
    if (!AFRAME.components['ply-model']) {
      AFRAME.registerComponent('ply-model', this['ply-model'].Component);
    }
    if (!AFRAME.components['three-model']) {
      AFRAME.registerComponent('three-model', this['three-model']);
    }

    this._registered = true;
  }
};

},{"./ply-model":4,"./three-model":5}],4:[function(require,module,exports){
/**
 * ply-model
 *
 * Wraps THREE.PLYLoader.
 */
THREE.PLYLoader = require('../../lib/PLYLoader');

/**
 * Loads, caches, resolves geometries.
 *
 * @member cache - Promises that resolve geometries keyed by `src`.
 */
module.exports.System = {
  init: function () {
    this.cache = {};
  },

  /**
   * @returns {Promise}
   */
  getOrLoadGeometry: function (src, skipCache) {
    var cache = this.cache;
    var cacheItem = cache[src];

    if (!skipCache && cacheItem) {
      return cacheItem;
    }

    cache[src] = new Promise(function (resolve) {
      var loader = new THREE.PLYLoader();
      loader.load(src, function (geometry) {
        resolve(geometry);
      });
    });
    return cache[src];
  },
};

module.exports.Component = {
  schema: {
    skipCache: {type: 'boolean', default: false},
    src: {type: 'src'}
  },

  init: function () {
    this.model = null;
  },

  update: function () {
    var data = this.data;
    var el = this.el;
    var loader;

    if (!data.src) {
      console.warn('[%s] `src` property is required.', this.name);
      return;
    }

    // Get geometry from system, create and set mesh.
    this.system.getOrLoadGeometry(data.src, data.skipCache).then(function (geometry) {
      var model = createModel(geometry);
      el.setObject3D('mesh', model);
      el.emit('model-loaded', {format: 'ply', model: model});
    });
  },

  remove: function () {
    if (this.model) { this.el.removeObject3D('mesh'); }
  }
};

function createModel (geometry) {
  return new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
    color: 0xFFFFFF,
    shading: THREE.FlatShading,
    vertexColors: THREE.VertexColors,
    shininess: 0
  }));
}

},{"../../lib/PLYLoader":2}],5:[function(require,module,exports){
var DEFAULT_ANIMATION = '__auto__';

/**
 * three-model
 *
 * Loader for THREE.js JSON format. Somewhat confusingly, there are two
 * different THREE.js formats, both having the .json extension. This loader
 * supports both, but requires you to specify the mode as "object" or "json".
 *
 * Typically, you will use "json" for a single mesh, and "object" for a scene
 * or multiple meshes. Check the console for errors, if in doubt.
 *
 * See: https://clara.io/learn/user-guide/data_exchange/threejs_export
 */
module.exports = {
  schema: {
    src:               { type: 'src' },
    loader:            { default: 'object', oneOf: ['object', 'json'] },
    enableAnimation:   { default: true },
    animation:         { default: DEFAULT_ANIMATION },
    animationDuration: { default: 0 }
  },

  init: function () {
    this.model = null;
    this.mixer = null;
  },

  update: function (previousData) {
    previousData = previousData || {};

    var loader,
        data = this.data;

    if (!data.src) {
      this.remove();
      return;
    }

    // First load.
    if (!Object.keys(previousData).length) {
      this.remove();
      if (data.loader === 'object') {
        loader = new THREE.ObjectLoader();
        loader.load(data.src, function(loaded) {
          loaded.traverse( function(object) {
            if (object instanceof THREE.SkinnedMesh)
              loaded = object;
          });
          if(loaded.material)
            loaded.material.skinning = !!((loaded.geometry && loaded.geometry.bones) || []).length;
          this.load(loaded);
        }.bind(this));
      } else if (data.loader === 'json') {
        loader = new THREE.JSONLoader();
        loader.load(data.src, function (geometry, materials) {

          // Attempt to automatically detect common material options.
          materials.forEach(function (mat) {
            mat.vertexColors = (geometry.faces[0] || {}).color ? THREE.FaceColors : THREE.NoColors;
            mat.skinning = !!(geometry.bones || []).length;
            mat.morphTargets = !!(geometry.morphTargets || []).length;
            mat.morphNormals = !!(geometry.morphNormals || []).length;
          });

          var mesh = (geometry.bones || []).length
            ? new THREE.SkinnedMesh(geometry, new THREE.MultiMaterial(materials))
            : new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));

          this.load(mesh);
        }.bind(this));
      } else {
        throw new Error('[three-model] Invalid mode "%s".', data.mode);
      }
      return;
    }

    var activeAction = this.model && this.model.activeAction;

    if (data.animation !== previousData.animation) {
      if (activeAction) activeAction.stop();
      this.playAnimation();
      return;
    }

    if (activeAction && data.enableAnimation !== activeAction.isRunning()) {
      data.enableAnimation ? this.playAnimation() : activeAction.stop();
    }

    if (activeAction && data.animationDuration) {
        activeAction.setDuration(data.animationDuration);
    }
  },

  load: function (model) {
    this.model = model;
    this.mixer = new THREE.AnimationMixer(this.model);
    this.el.setObject3D('mesh', model);
    this.el.emit('model-loaded', {format: 'three', model: model});

    if (this.data.enableAnimation) this.playAnimation();
  },

  playAnimation: function () {
    var clip,
        data = this.data,
        animations = this.model.animations || this.model.geometry.animations || [];

    if (!data.enableAnimation || !data.animation || !animations.length) {
      return;
    }

    clip = data.animation === DEFAULT_ANIMATION
      ? animations[0]
      : THREE.AnimationClip.findByName(animations, data.animation);

    if (!clip) {
      console.error('[three-model] Animation "%s" not found.', data.animation);
      return;
    }

    this.model.activeAction = this.mixer.clipAction(clip, this.model);
    if (data.animationDuration) {
      this.model.activeAction.setDuration(data.animationDuration);
    }
    this.model.activeAction.play();
  },

  remove: function () {
    if (this.mixer) this.mixer.stopAllAction();
    if (this.model) this.el.removeObject3D('mesh');
  },

  tick: function (t, dt) {
    if (this.mixer && !isNaN(dt)) {
      this.mixer.update(dt / 1000);
    }
  }
};

},{}]},{},[1]);
