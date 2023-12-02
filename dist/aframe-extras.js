(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("THREE"));
	else if(typeof define === 'function' && define.amd)
		define(["THREE"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("THREE")) : factory(root["THREE"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, (__WEBPACK_EXTERNAL_MODULE_three__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/ColladaLoader.js":
/*!******************************!*\
  !*** ./lib/ColladaLoader.js ***!
  \******************************/
/***/ ((module) => {

/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

module.exports = THREE.ColladaLoader = function ( manager ) {

  this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.ColladaLoader.prototype = {

  constructor: THREE.ColladaLoader,

  crossOrigin: 'anonymous',

  load: function ( url, onLoad, onProgress, onError ) {

    var scope = this;

    var path = ( scope.path === undefined ) ? THREE.LoaderUtils.extractUrlBase( url ) : scope.path;

    var loader = new THREE.FileLoader( scope.manager );
    loader.setPath( scope.path );
    loader.load( url, function ( text ) {

      onLoad( scope.parse( text, path ) );

    }, onProgress, onError );

  },

  setPath: function ( value ) {

    this.path = value;
    return this;

  },

  setResourcePath: function ( value ) {

    this.resourcePath = value;
    return this;

  },

  options: {

    set convertUpAxis( value ) {

      console.warn( 'THREE.ColladaLoader: options.convertUpAxis() has been removed. Up axis is converted automatically.' );

    }

  },

  setCrossOrigin: function ( value ) {

    this.crossOrigin = value;
    return this;

  },

  parse: function ( text, path ) {

    function getElementsByTagName( xml, name ) {

      // Non recursive xml.getElementsByTagName() ...

      var array = [];
      var childNodes = xml.childNodes;

      for ( var i = 0, l = childNodes.length; i < l; i ++ ) {

        var child = childNodes[ i ];

        if ( child.nodeName === name ) {

          array.push( child );

        }

      }

      return array;

    }

    function parseStrings( text ) {

      if ( text.length === 0 ) return [];

      var parts = text.trim().split( /\s+/ );
      var array = new Array( parts.length );

      for ( var i = 0, l = parts.length; i < l; i ++ ) {

        array[ i ] = parts[ i ];

      }

      return array;

    }

    function parseFloats( text ) {

      if ( text.length === 0 ) return [];

      var parts = text.trim().split( /\s+/ );
      var array = new Array( parts.length );

      for ( var i = 0, l = parts.length; i < l; i ++ ) {

        array[ i ] = parseFloat( parts[ i ] );

      }

      return array;

    }

    function parseInts( text ) {

      if ( text.length === 0 ) return [];

      var parts = text.trim().split( /\s+/ );
      var array = new Array( parts.length );

      for ( var i = 0, l = parts.length; i < l; i ++ ) {

        array[ i ] = parseInt( parts[ i ] );

      }

      return array;

    }

    function parseId( text ) {

      return text.substring( 1 );

    }

    function generateId() {

      return 'three_default_' + ( count ++ );

    }

    function isEmpty( object ) {

      return Object.keys( object ).length === 0;

    }

    // asset

    function parseAsset( xml ) {

      return {
        unit: parseAssetUnit( getElementsByTagName( xml, 'unit' )[ 0 ] ),
        upAxis: parseAssetUpAxis( getElementsByTagName( xml, 'up_axis' )[ 0 ] )
      };

    }

    function parseAssetUnit( xml ) {

      if ( ( xml !== undefined ) && ( xml.hasAttribute( 'meter' ) === true ) ) {

        return parseFloat( xml.getAttribute( 'meter' ) );

      } else {

        return 1; // default 1 meter

      }

    }

    function parseAssetUpAxis( xml ) {

      return xml !== undefined ? xml.textContent : 'Y_UP';

    }

    // library

    function parseLibrary( xml, libraryName, nodeName, parser ) {

      var library = getElementsByTagName( xml, libraryName )[ 0 ];

      if ( library !== undefined ) {

        var elements = getElementsByTagName( library, nodeName );

        for ( var i = 0; i < elements.length; i ++ ) {

          parser( elements[ i ] );

        }

      }

    }

    function buildLibrary( data, builder ) {

      for ( var name in data ) {

        var object = data[ name ];
        object.build = builder( data[ name ] );

      }

    }

    // get

    function getBuild( data, builder ) {

      if ( data.build !== undefined ) return data.build;

      data.build = builder( data );

      return data.build;

    }

    // animation

    function parseAnimation( xml ) {

      var data = {
        sources: {},
        samplers: {},
        channels: {}
      };

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        var id;

        switch ( child.nodeName ) {

          case 'source':
            id = child.getAttribute( 'id' );
            data.sources[ id ] = parseSource( child );
            break;

          case 'sampler':
            id = child.getAttribute( 'id' );
            data.samplers[ id ] = parseAnimationSampler( child );
            break;

          case 'channel':
            id = child.getAttribute( 'target' );
            data.channels[ id ] = parseAnimationChannel( child );
            break;

          default:
            console.log( child );

        }

      }

      library.animations[ xml.getAttribute( 'id' ) ] = data;

    }

    function parseAnimationSampler( xml ) {

      var data = {
        inputs: {},
      };

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'input':
            var id = parseId( child.getAttribute( 'source' ) );
            var semantic = child.getAttribute( 'semantic' );
            data.inputs[ semantic ] = id;
            break;

        }

      }

      return data;

    }

    function parseAnimationChannel( xml ) {

      var data = {};

      var target = xml.getAttribute( 'target' );

      // parsing SID Addressing Syntax

      var parts = target.split( '/' );

      var id = parts.shift();
      var sid = parts.shift();

      // check selection syntax

      var arraySyntax = ( sid.indexOf( '(' ) !== - 1 );
      var memberSyntax = ( sid.indexOf( '.' ) !== - 1 );

      if ( memberSyntax ) {

        //  member selection access

        parts = sid.split( '.' );
        sid = parts.shift();
        data.member = parts.shift();

      } else if ( arraySyntax ) {

        // array-access syntax. can be used to express fields in one-dimensional vectors or two-dimensional matrices.

        var indices = sid.split( '(' );
        sid = indices.shift();

        for ( var i = 0; i < indices.length; i ++ ) {

          indices[ i ] = parseInt( indices[ i ].replace( /\)/, '' ) );

        }

        data.indices = indices;

      }

      data.id = id;
      data.sid = sid;

      data.arraySyntax = arraySyntax;
      data.memberSyntax = memberSyntax;

      data.sampler = parseId( xml.getAttribute( 'source' ) );

      return data;

    }

    function buildAnimation( data ) {

      var tracks = [];

      var channels = data.channels;
      var samplers = data.samplers;
      var sources = data.sources;

      for ( var target in channels ) {

        if ( channels.hasOwnProperty( target ) ) {

          var channel = channels[ target ];
          var sampler = samplers[ channel.sampler ];

          var inputId = sampler.inputs.INPUT;
          var outputId = sampler.inputs.OUTPUT;

          var inputSource = sources[ inputId ];
          var outputSource = sources[ outputId ];

          var animation = buildAnimationChannel( channel, inputSource, outputSource );

          createKeyframeTracks( animation, tracks );

        }

      }

      return tracks;

    }

    function getAnimation( id ) {

      return getBuild( library.animations[ id ], buildAnimation );

    }

    function buildAnimationChannel( channel, inputSource, outputSource ) {

      var node = library.nodes[ channel.id ];
      var object3D = getNode( node.id );

      var transform = node.transforms[ channel.sid ];
      var defaultMatrix = node.matrix.clone().transpose();

      var time, stride;
      var i, il, j, jl;

      var data = {};

      // the collada spec allows the animation of data in various ways.
      // depending on the transform type (matrix, translate, rotate, scale), we execute different logic

      switch ( transform ) {

        case 'matrix':

          for ( i = 0, il = inputSource.array.length; i < il; i ++ ) {

            time = inputSource.array[ i ];
            stride = i * outputSource.stride;

            if ( data[ time ] === undefined ) data[ time ] = {};

            if ( channel.arraySyntax === true ) {

              var value = outputSource.array[ stride ];
              var index = channel.indices[ 0 ] + 4 * channel.indices[ 1 ];

              data[ time ][ index ] = value;

            } else {

              for ( j = 0, jl = outputSource.stride; j < jl; j ++ ) {

                data[ time ][ j ] = outputSource.array[ stride + j ];

              }

            }

          }

          break;

        case 'translate':
          console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
          break;

        case 'rotate':
          console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
          break;

        case 'scale':
          console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
          break;

      }

      var keyframes = prepareAnimationData( data, defaultMatrix );

      var animation = {
        name: object3D.uuid,
        keyframes: keyframes
      };

      return animation;

    }

    function prepareAnimationData( data, defaultMatrix ) {

      var keyframes = [];

      // transfer data into a sortable array

      for ( var time in data ) {

        keyframes.push( { time: parseFloat( time ), value: data[ time ] } );

      }

      // ensure keyframes are sorted by time

      keyframes.sort( ascending );

      // now we clean up all animation data, so we can use them for keyframe tracks

      for ( var i = 0; i < 16; i ++ ) {

        transformAnimationData( keyframes, i, defaultMatrix.elements[ i ] );

      }

      return keyframes;

      // array sort function

      function ascending( a, b ) {

        return a.time - b.time;

      }

    }

    var position = new THREE.Vector3();
    var scale = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();

    function createKeyframeTracks( animation, tracks ) {

      var keyframes = animation.keyframes;
      var name = animation.name;

      var times = [];
      var positionData = [];
      var quaternionData = [];
      var scaleData = [];

      for ( var i = 0, l = keyframes.length; i < l; i ++ ) {

        var keyframe = keyframes[ i ];

        var time = keyframe.time;
        var value = keyframe.value;

        matrix.fromArray( value ).transpose();
        matrix.decompose( position, quaternion, scale );

        times.push( time );
        positionData.push( position.x, position.y, position.z );
        quaternionData.push( quaternion.x, quaternion.y, quaternion.z, quaternion.w );
        scaleData.push( scale.x, scale.y, scale.z );

      }

      if ( positionData.length > 0 ) tracks.push( new THREE.VectorKeyframeTrack( name + '.position', times, positionData ) );
      if ( quaternionData.length > 0 ) tracks.push( new THREE.QuaternionKeyframeTrack( name + '.quaternion', times, quaternionData ) );
      if ( scaleData.length > 0 ) tracks.push( new THREE.VectorKeyframeTrack( name + '.scale', times, scaleData ) );

      return tracks;

    }

    function transformAnimationData( keyframes, property, defaultValue ) {

      var keyframe;

      var empty = true;
      var i, l;

      // check, if values of a property are missing in our keyframes

      for ( i = 0, l = keyframes.length; i < l; i ++ ) {

        keyframe = keyframes[ i ];

        if ( keyframe.value[ property ] === undefined ) {

          keyframe.value[ property ] = null; // mark as missing

        } else {

          empty = false;

        }

      }

      if ( empty === true ) {

        // no values at all, so we set a default value

        for ( i = 0, l = keyframes.length; i < l; i ++ ) {

          keyframe = keyframes[ i ];

          keyframe.value[ property ] = defaultValue;

        }

      } else {

        // filling gaps

        createMissingKeyframes( keyframes, property );

      }

    }

    function createMissingKeyframes( keyframes, property ) {

      var prev, next;

      for ( var i = 0, l = keyframes.length; i < l; i ++ ) {

        var keyframe = keyframes[ i ];

        if ( keyframe.value[ property ] === null ) {

          prev = getPrev( keyframes, i, property );
          next = getNext( keyframes, i, property );

          if ( prev === null ) {

            keyframe.value[ property ] = next.value[ property ];
            continue;

          }

          if ( next === null ) {

            keyframe.value[ property ] = prev.value[ property ];
            continue;

          }

          interpolate( keyframe, prev, next, property );

        }

      }

    }

    function getPrev( keyframes, i, property ) {

      while ( i >= 0 ) {

        var keyframe = keyframes[ i ];

        if ( keyframe.value[ property ] !== null ) return keyframe;

        i --;

      }

      return null;

    }

    function getNext( keyframes, i, property ) {

      while ( i < keyframes.length ) {

        var keyframe = keyframes[ i ];

        if ( keyframe.value[ property ] !== null ) return keyframe;

        i ++;

      }

      return null;

    }

    function interpolate( key, prev, next, property ) {

      if ( ( next.time - prev.time ) === 0 ) {

        key.value[ property ] = prev.value[ property ];
        return;

      }

      key.value[ property ] = ( ( key.time - prev.time ) * ( next.value[ property ] - prev.value[ property ] ) / ( next.time - prev.time ) ) + prev.value[ property ];

    }

    // animation clips

    function parseAnimationClip( xml ) {

      var data = {
        name: xml.getAttribute( 'id' ) || 'default',
        start: parseFloat( xml.getAttribute( 'start' ) || 0 ),
        end: parseFloat( xml.getAttribute( 'end' ) || 0 ),
        animations: []
      };

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'instance_animation':
            data.animations.push( parseId( child.getAttribute( 'url' ) ) );
            break;

        }

      }

      library.clips[ xml.getAttribute( 'id' ) ] = data;

    }

    function buildAnimationClip( data ) {

      var tracks = [];

      var name = data.name;
      var duration = ( data.end - data.start ) || - 1;
      var animations = data.animations;

      for ( var i = 0, il = animations.length; i < il; i ++ ) {

        var animationTracks = getAnimation( animations[ i ] );

        for ( var j = 0, jl = animationTracks.length; j < jl; j ++ ) {

          tracks.push( animationTracks[ j ] );

        }

      }

      return new THREE.AnimationClip( name, duration, tracks );

    }

    function getAnimationClip( id ) {

      return getBuild( library.clips[ id ], buildAnimationClip );

    }

    // controller

    function parseController( xml ) {

      var data = {};

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'skin':
            // there is exactly one skin per controller
            data.id = parseId( child.getAttribute( 'source' ) );
            data.skin = parseSkin( child );
            break;

          case 'morph':
            data.id = parseId( child.getAttribute( 'source' ) );
            console.warn( 'THREE.ColladaLoader: Morph target animation not supported yet.' );
            break;

        }

      }

      library.controllers[ xml.getAttribute( 'id' ) ] = data;

    }

    function parseSkin( xml ) {

      var data = {
        sources: {}
      };

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'bind_shape_matrix':
            data.bindShapeMatrix = parseFloats( child.textContent );
            break;

          case 'source':
            var id = child.getAttribute( 'id' );
            data.sources[ id ] = parseSource( child );
            break;

          case 'joints':
            data.joints = parseJoints( child );
            break;

          case 'vertex_weights':
            data.vertexWeights = parseVertexWeights( child );
            break;

        }

      }

      return data;

    }

    function parseJoints( xml ) {

      var data = {
        inputs: {}
      };

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'input':
            var semantic = child.getAttribute( 'semantic' );
            var id = parseId( child.getAttribute( 'source' ) );
            data.inputs[ semantic ] = id;
            break;

        }

      }

      return data;

    }

    function parseVertexWeights( xml ) {

      var data = {
        inputs: {}
      };

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'input':
            var semantic = child.getAttribute( 'semantic' );
            var id = parseId( child.getAttribute( 'source' ) );
            var offset = parseInt( child.getAttribute( 'offset' ) );
            data.inputs[ semantic ] = { id: id, offset: offset };
            break;

          case 'vcount':
            data.vcount = parseInts( child.textContent );
            break;

          case 'v':
            data.v = parseInts( child.textContent );
            break;

        }

      }

      return data;

    }

    function buildController( data ) {

      var build = {
        id: data.id
      };

      var geometry = library.geometries[ build.id ];

      if ( data.skin !== undefined ) {

        build.skin = buildSkin( data.skin );

        // we enhance the 'sources' property of the corresponding geometry with our skin data

        geometry.sources.skinIndices = build.skin.indices;
        geometry.sources.skinWeights = build.skin.weights;

      }

      return build;

    }

    function buildSkin( data ) {

      var BONE_LIMIT = 4;

      var build = {
        joints: [], // this must be an array to preserve the joint order
        indices: {
          array: [],
          stride: BONE_LIMIT
        },
        weights: {
          array: [],
          stride: BONE_LIMIT
        }
      };

      var sources = data.sources;
      var vertexWeights = data.vertexWeights;

      var vcount = vertexWeights.vcount;
      var v = vertexWeights.v;
      var jointOffset = vertexWeights.inputs.JOINT.offset;
      var weightOffset = vertexWeights.inputs.WEIGHT.offset;

      var jointSource = data.sources[ data.joints.inputs.JOINT ];
      var inverseSource = data.sources[ data.joints.inputs.INV_BIND_MATRIX ];

      var weights = sources[ vertexWeights.inputs.WEIGHT.id ].array;
      var stride = 0;

      var i, j, l;

      // procces skin data for each vertex

      for ( i = 0, l = vcount.length; i < l; i ++ ) {

        var jointCount = vcount[ i ]; // this is the amount of joints that affect a single vertex
        var vertexSkinData = [];

        for ( j = 0; j < jointCount; j ++ ) {

          var skinIndex = v[ stride + jointOffset ];
          var weightId = v[ stride + weightOffset ];
          var skinWeight = weights[ weightId ];

          vertexSkinData.push( { index: skinIndex, weight: skinWeight } );

          stride += 2;

        }

        // we sort the joints in descending order based on the weights.
        // this ensures, we only procced the most important joints of the vertex

        vertexSkinData.sort( descending );

        // now we provide for each vertex a set of four index and weight values.
        // the order of the skin data matches the order of vertices

        for ( j = 0; j < BONE_LIMIT; j ++ ) {

          var d = vertexSkinData[ j ];

          if ( d !== undefined ) {

            build.indices.array.push( d.index );
            build.weights.array.push( d.weight );

          } else {

            build.indices.array.push( 0 );
            build.weights.array.push( 0 );

          }

        }

      }

      // setup bind matrix

      if ( data.bindShapeMatrix ) {

        build.bindMatrix = new THREE.Matrix4().fromArray( data.bindShapeMatrix ).transpose();

      } else {

        build.bindMatrix = new THREE.Matrix4().identity();

      }

      // process bones and inverse bind matrix data

      for ( i = 0, l = jointSource.array.length; i < l; i ++ ) {

        var name = jointSource.array[ i ];
        var boneInverse = new THREE.Matrix4().fromArray( inverseSource.array, i * inverseSource.stride ).transpose();

        build.joints.push( { name: name, boneInverse: boneInverse } );

      }

      return build;

      // array sort function

      function descending( a, b ) {

        return b.weight - a.weight;

      }

    }

    function getController( id ) {

      return getBuild( library.controllers[ id ], buildController );

    }

    // image

    function parseImage( xml ) {

      var data = {
        init_from: getElementsByTagName( xml, 'init_from' )[ 0 ].textContent
      };

      library.images[ xml.getAttribute( 'id' ) ] = data;

    }

    function buildImage( data ) {

      if ( data.build !== undefined ) return data.build;

      return data.init_from;

    }

    function getImage( id ) {

      var data = library.images[ id ];

      if ( data !== undefined ) {

        return getBuild( data, buildImage );

      }

      console.warn( 'THREE.ColladaLoader: Couldn\'t find image with ID:', id );

      return null;

    }

    // effect

    function parseEffect( xml ) {

      var data = {};

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'profile_COMMON':
            data.profile = parseEffectProfileCOMMON( child );
            break;

        }

      }

      library.effects[ xml.getAttribute( 'id' ) ] = data;

    }

    function parseEffectProfileCOMMON( xml ) {

      var data = {
        surfaces: {},
        samplers: {}
      };

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'newparam':
            parseEffectNewparam( child, data );
            break;

          case 'technique':
            data.technique = parseEffectTechnique( child );
            break;

          case 'extra':
            data.extra = parseEffectExtra( child );
            break;

        }

      }

      return data;

    }

    function parseEffectNewparam( xml, data ) {

      var sid = xml.getAttribute( 'sid' );

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'surface':
            data.surfaces[ sid ] = parseEffectSurface( child );
            break;

          case 'sampler2D':
            data.samplers[ sid ] = parseEffectSampler( child );
            break;

        }

      }

    }

    function parseEffectSurface( xml ) {

      var data = {};

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'init_from':
            data.init_from = child.textContent;
            break;

        }

      }

      return data;

    }

    function parseEffectSampler( xml ) {

      var data = {};

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'source':
            data.source = child.textContent;
            break;

        }

      }

      return data;

    }

    function parseEffectTechnique( xml ) {

      var data = {};

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'constant':
          case 'lambert':
          case 'blinn':
          case 'phong':
            data.type = child.nodeName;
            data.parameters = parseEffectParameters( child );
            break;

        }

      }

      return data;

    }

    function parseEffectParameters( xml ) {

      var data = {};

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'emission':
          case 'diffuse':
          case 'specular':
          case 'bump':
          case 'ambient':
          case 'shininess':
          case 'transparency':
            data[ child.nodeName ] = parseEffectParameter( child );
            break;
          case 'transparent':
            data[ child.nodeName ] = {
              opaque: child.getAttribute( 'opaque' ),
              data: parseEffectParameter( child )
            };
            break;

        }

      }

      return data;

    }

    function parseEffectParameter( xml ) {

      var data = {};

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'color':
            data[ child.nodeName ] = parseFloats( child.textContent );
            break;

          case 'float':
            data[ child.nodeName ] = parseFloat( child.textContent );
            break;

          case 'texture':
            data[ child.nodeName ] = { id: child.getAttribute( 'texture' ), extra: parseEffectParameterTexture( child ) };
            break;

        }

      }

      return data;

    }

    function parseEffectParameterTexture( xml ) {

      var data = {
        technique: {}
      };

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'extra':
            parseEffectParameterTextureExtra( child, data );
            break;

        }

      }

      return data;

    }

    function parseEffectParameterTextureExtra( xml, data ) {

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'technique':
            parseEffectParameterTextureExtraTechnique( child, data );
            break;

        }

      }

    }

    function parseEffectParameterTextureExtraTechnique( xml, data ) {

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'repeatU':
          case 'repeatV':
          case 'offsetU':
          case 'offsetV':
            data.technique[ child.nodeName ] = parseFloat( child.textContent );
            break;

          case 'wrapU':
          case 'wrapV':

            // some files have values for wrapU/wrapV which become NaN via parseInt

            if ( child.textContent.toUpperCase() === 'TRUE' ) {

              data.technique[ child.nodeName ] = 1;

            } else if ( child.textContent.toUpperCase() === 'FALSE' ) {

              data.technique[ child.nodeName ] = 0;

            } else {

              data.technique[ child.nodeName ] = parseInt( child.textContent );

            }

            break;

        }

      }

    }

    function parseEffectExtra( xml ) {

      var data = {};

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'technique':
            data.technique = parseEffectExtraTechnique( child );
            break;

        }

      }

      return data;

    }

    function parseEffectExtraTechnique( xml ) {

      var data = {};

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'double_sided':
            data[ child.nodeName ] = parseInt( child.textContent );
            break;

        }

      }

      return data;

    }

    function buildEffect( data ) {

      return data;

    }

    function getEffect( id ) {

      return getBuild( library.effects[ id ], buildEffect );

    }

    // material

    function parseMaterial( xml ) {

      var data = {
        name: xml.getAttribute( 'name' )
      };

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'instance_effect':
            data.url = parseId( child.getAttribute( 'url' ) );
            break;

        }

      }

      library.materials[ xml.getAttribute( 'id' ) ] = data;

    }

    function getTextureLoader( image ) {

      var loader;

      var extension = image.slice( ( image.lastIndexOf( '.' ) - 1 >>> 0 ) + 2 ); // http://www.jstips.co/en/javascript/get-file-extension/
      extension = extension.toLowerCase();

      switch ( extension ) {

        case 'tga':
          loader = tgaLoader;
          break;

        default:
          loader = textureLoader;

      }

      return loader;

    }

    function buildMaterial( data ) {

      var effect = getEffect( data.url );
      var technique = effect.profile.technique;
      var extra = effect.profile.extra;

      var material;

      switch ( technique.type ) {

        case 'phong':
        case 'blinn':
          material = new THREE.MeshPhongMaterial();
          break;

        case 'lambert':
          material = new THREE.MeshLambertMaterial();
          break;

        default:
          material = new THREE.MeshBasicMaterial();
          break;

      }

      material.name = data.name;

      function getTexture( textureObject ) {

        var sampler = effect.profile.samplers[ textureObject.id ];
        var image = null;

        // get image

        if ( sampler !== undefined ) {

          var surface = effect.profile.surfaces[ sampler.source ];
          image = getImage( surface.init_from );

        } else {

          console.warn( 'THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530).' );
          image = getImage( textureObject.id );

        }

        // create texture if image is avaiable

        if ( image !== null ) {

          var loader = getTextureLoader( image );

          if ( loader !== undefined ) {

            var texture = loader.load( image );

            var extra = textureObject.extra;

            if ( extra !== undefined && extra.technique !== undefined && isEmpty( extra.technique ) === false ) {

              var technique = extra.technique;

              texture.wrapS = technique.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
              texture.wrapT = technique.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

              texture.offset.set( technique.offsetU || 0, technique.offsetV || 0 );
              texture.repeat.set( technique.repeatU || 1, technique.repeatV || 1 );

            } else {

              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;

            }

            return texture;

          } else {

            console.warn( 'THREE.ColladaLoader: Loader for texture %s not found.', image );

            return null;

          }

        } else {

          console.warn( 'THREE.ColladaLoader: Couldn\'t create texture with ID:', textureObject.id );

          return null;

        }

      }

      var parameters = technique.parameters;

      for ( var key in parameters ) {

        var parameter = parameters[ key ];

        switch ( key ) {

          case 'diffuse':
            if ( parameter.color ) material.color.fromArray( parameter.color );
            if ( parameter.texture ) material.map = getTexture( parameter.texture );
            break;
          case 'specular':
            if ( parameter.color && material.specular ) material.specular.fromArray( parameter.color );
            if ( parameter.texture ) material.specularMap = getTexture( parameter.texture );
            break;
          case 'bump':
            if ( parameter.texture ) material.normalMap = getTexture( parameter.texture );
            break;
          case 'ambient':
            if ( parameter.texture ) material.lightMap = getTexture( parameter.texture );
            break;
          case 'shininess':
            if ( parameter.float && material.shininess ) material.shininess = parameter.float;
            break;
          case 'emission':
            if ( parameter.color && material.emissive ) material.emissive.fromArray( parameter.color );
            if ( parameter.texture ) material.emissiveMap = getTexture( parameter.texture );
            break;

        }

      }

      //

      var transparent = parameters[ 'transparent' ];
      var transparency = parameters[ 'transparency' ];

      // <transparency> does not exist but <transparent>

      if ( transparency === undefined && transparent ) {

        transparency = {
          float: 1
        };

      }

      // <transparent> does not exist but <transparency>

      if ( transparent === undefined && transparency ) {

        transparent = {
          opaque: 'A_ONE',
          data: {
            color: [ 1, 1, 1, 1 ]
          } };

      }

      if ( transparent && transparency ) {

        // handle case if a texture exists but no color

        if ( transparent.data.texture ) {

          // we do not set an alpha map (see #13792)

          material.transparent = true;

        } else {

          var color = transparent.data.color;

          switch ( transparent.opaque ) {

            case 'A_ONE':
              material.opacity = color[ 3 ] * transparency.float;
              break;
            case 'RGB_ZERO':
              material.opacity = 1 - ( color[ 0 ] * transparency.float );
              break;
            case 'A_ZERO':
              material.opacity = 1 - ( color[ 3 ] * transparency.float );
              break;
            case 'RGB_ONE':
              material.opacity = color[ 0 ] * transparency.float;
              break;
            default:
              console.warn( 'THREE.ColladaLoader: Invalid opaque type "%s" of transparent tag.', transparent.opaque );

          }

          if ( material.opacity < 1 ) material.transparent = true;

        }

      }

      //

      if ( extra !== undefined && extra.technique !== undefined && extra.technique.double_sided === 1 ) {

        material.side = THREE.DoubleSide;

      }

      return material;

    }

    function getMaterial( id ) {

      return getBuild( library.materials[ id ], buildMaterial );

    }

    // camera

    function parseCamera( xml ) {

      var data = {
        name: xml.getAttribute( 'name' )
      };

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'optics':
            data.optics = parseCameraOptics( child );
            break;

        }

      }

      library.cameras[ xml.getAttribute( 'id' ) ] = data;

    }

    function parseCameraOptics( xml ) {

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        switch ( child.nodeName ) {

          case 'technique_common':
            return parseCameraTechnique( child );

        }

      }

      return {};

    }

    function parseCameraTechnique( xml ) {

      var data = {};

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        switch ( child.nodeName ) {

          case 'perspective':
          case 'orthographic':

            data.technique = child.nodeName;
            data.parameters = parseCameraParameters( child );

            break;

        }

      }

      return data;

    }

    function parseCameraParameters( xml ) {

      var data = {};

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        switch ( child.nodeName ) {

          case 'xfov':
          case 'yfov':
          case 'xmag':
          case 'ymag':
          case 'znear':
          case 'zfar':
          case 'aspect_ratio':
            data[ child.nodeName ] = parseFloat( child.textContent );
            break;

        }

      }

      return data;

    }

    function buildCamera( data ) {

      var camera;

      switch ( data.optics.technique ) {

        case 'perspective':
          camera = new THREE.PerspectiveCamera(
            data.optics.parameters.yfov,
            data.optics.parameters.aspect_ratio,
            data.optics.parameters.znear,
            data.optics.parameters.zfar
          );
          break;

        case 'orthographic':
          var ymag = data.optics.parameters.ymag;
          var xmag = data.optics.parameters.xmag;
          var aspectRatio = data.optics.parameters.aspect_ratio;

          xmag = ( xmag === undefined ) ? ( ymag * aspectRatio ) : xmag;
          ymag = ( ymag === undefined ) ? ( xmag / aspectRatio ) : ymag;

          xmag *= 0.5;
          ymag *= 0.5;

          camera = new THREE.OrthographicCamera(
            - xmag, xmag, ymag, - ymag, // left, right, top, bottom
            data.optics.parameters.znear,
            data.optics.parameters.zfar
          );
          break;

        default:
          camera = new THREE.PerspectiveCamera();
          break;

      }

      camera.name = data.name;

      return camera;

    }

    function getCamera( id ) {

      var data = library.cameras[ id ];

      if ( data !== undefined ) {

        return getBuild( data, buildCamera );

      }

      console.warn( 'THREE.ColladaLoader: Couldn\'t find camera with ID:', id );

      return null;

    }

    // light

    function parseLight( xml ) {

      var data = {};

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'technique_common':
            data = parseLightTechnique( child );
            break;

        }

      }

      library.lights[ xml.getAttribute( 'id' ) ] = data;

    }

    function parseLightTechnique( xml ) {

      var data = {};

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'directional':
          case 'point':
          case 'spot':
          case 'ambient':

            data.technique = child.nodeName;
            data.parameters = parseLightParameters( child );

        }

      }

      return data;

    }

    function parseLightParameters( xml ) {

      var data = {};

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'color':
            var array = parseFloats( child.textContent );
            data.color = new THREE.Color().fromArray( array );
            break;

          case 'falloff_angle':
            data.falloffAngle = parseFloat( child.textContent );
            break;

          case 'quadratic_attenuation':
            var f = parseFloat( child.textContent );
            data.distance = f ? Math.sqrt( 1 / f ) : 0;
            break;

        }

      }

      return data;

    }

    function buildLight( data ) {

      var light;

      switch ( data.technique ) {

        case 'directional':
          light = new THREE.DirectionalLight();
          break;

        case 'point':
          light = new THREE.PointLight();
          break;

        case 'spot':
          light = new THREE.SpotLight();
          break;

        case 'ambient':
          light = new THREE.AmbientLight();
          break;

      }

      if ( data.parameters.color ) light.color.copy( data.parameters.color );
      if ( data.parameters.distance ) light.distance = data.parameters.distance;

      return light;

    }

    function getLight( id ) {

      var data = library.lights[ id ];

      if ( data !== undefined ) {

        return getBuild( data, buildLight );

      }

      console.warn( 'THREE.ColladaLoader: Couldn\'t find light with ID:', id );

      return null;

    }

    // geometry

    function parseGeometry( xml ) {

      var data = {
        name: xml.getAttribute( 'name' ),
        sources: {},
        vertices: {},
        primitives: []
      };

      var mesh = getElementsByTagName( xml, 'mesh' )[ 0 ];

      // the following tags inside geometry are not supported yet (see https://github.com/mrdoob/three.js/pull/12606): convex_mesh, spline, brep
      if ( mesh === undefined ) return;

      for ( var i = 0; i < mesh.childNodes.length; i ++ ) {

        var child = mesh.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        var id = child.getAttribute( 'id' );

        switch ( child.nodeName ) {

          case 'source':
            data.sources[ id ] = parseSource( child );
            break;

          case 'vertices':
            // data.sources[ id ] = data.sources[ parseId( getElementsByTagName( child, 'input' )[ 0 ].getAttribute( 'source' ) ) ];
            data.vertices = parseGeometryVertices( child );
            break;

          case 'polygons':
            console.warn( 'THREE.ColladaLoader: Unsupported primitive type: ', child.nodeName );
            break;

          case 'lines':
          case 'linestrips':
          case 'polylist':
          case 'triangles':
            data.primitives.push( parseGeometryPrimitive( child ) );
            break;

          default:
            console.log( child );

        }

      }

      library.geometries[ xml.getAttribute( 'id' ) ] = data;

    }

    function parseSource( xml ) {

      var data = {
        array: [],
        stride: 3
      };

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'float_array':
            data.array = parseFloats( child.textContent );
            break;

          case 'Name_array':
            data.array = parseStrings( child.textContent );
            break;

          case 'technique_common':
            var accessor = getElementsByTagName( child, 'accessor' )[ 0 ];

            if ( accessor !== undefined ) {

              data.stride = parseInt( accessor.getAttribute( 'stride' ) );

            }
            break;

        }

      }

      return data;

    }

    function parseGeometryVertices( xml ) {

      var data = {};

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        data[ child.getAttribute( 'semantic' ) ] = parseId( child.getAttribute( 'source' ) );

      }

      return data;

    }

    function parseGeometryPrimitive( xml ) {

      var primitive = {
        type: xml.nodeName,
        material: xml.getAttribute( 'material' ),
        count: parseInt( xml.getAttribute( 'count' ) ),
        inputs: {},
        stride: 0,
        hasUV: false
      };

      for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'input':
            var id = parseId( child.getAttribute( 'source' ) );
            var semantic = child.getAttribute( 'semantic' );
            var offset = parseInt( child.getAttribute( 'offset' ) );
            var set = parseInt( child.getAttribute( 'set' ) );
            var inputname = ( set > 0 ? semantic + set : semantic );
            primitive.inputs[ inputname ] = { id: id, offset: offset };
            primitive.stride = Math.max( primitive.stride, offset + 1 );
            if ( semantic === 'TEXCOORD' ) primitive.hasUV = true;
            break;

          case 'vcount':
            primitive.vcount = parseInts( child.textContent );
            break;

          case 'p':
            primitive.p = parseInts( child.textContent );
            break;

        }

      }

      return primitive;

    }

    function groupPrimitives( primitives ) {

      var build = {};

      for ( var i = 0; i < primitives.length; i ++ ) {

        var primitive = primitives[ i ];

        if ( build[ primitive.type ] === undefined ) build[ primitive.type ] = [];

        build[ primitive.type ].push( primitive );

      }

      return build;

    }

    function checkUVCoordinates( primitives ) {

      var count = 0;

      for ( var i = 0, l = primitives.length; i < l; i ++ ) {

        var primitive = primitives[ i ];

        if ( primitive.hasUV === true ) {

          count ++;

        }

      }

      if ( count > 0 && count < primitives.length ) {

        primitives.uvsNeedsFix = true;

      }

    }

    function buildGeometry( data ) {

      var build = {};

      var sources = data.sources;
      var vertices = data.vertices;
      var primitives = data.primitives;

      if ( primitives.length === 0 ) return {};

      // our goal is to create one buffer geometry for a single type of primitives
      // first, we group all primitives by their type

      var groupedPrimitives = groupPrimitives( primitives );

      for ( var type in groupedPrimitives ) {

        var primitiveType = groupedPrimitives[ type ];

        // second, ensure consistent uv coordinates for each type of primitives (polylist,triangles or lines)

        checkUVCoordinates( primitiveType );

        // third, create a buffer geometry for each type of primitives

        build[ type ] = buildGeometryType( primitiveType, sources, vertices );

      }

      return build;

    }

    function buildGeometryType( primitives, sources, vertices ) {

      var build = {};

      var position = { array: [], stride: 0 };
      var normal = { array: [], stride: 0 };
      var uv = { array: [], stride: 0 };
      var uv2 = { array: [], stride: 0 };
      var color = { array: [], stride: 0 };

      var skinIndex = { array: [], stride: 4 };
      var skinWeight = { array: [], stride: 4 };

      var geometry = new THREE.BufferGeometry();

      var materialKeys = [];

      var start = 0;

      for ( var p = 0; p < primitives.length; p ++ ) {

        var primitive = primitives[ p ];
        var inputs = primitive.inputs;

        // groups

        var count = 0;

        switch ( primitive.type ) {

          case 'lines':
          case 'linestrips':
            count = primitive.count * 2;
            break;

          case 'triangles':
            count = primitive.count * 3;
            break;

          case 'polylist':

            for ( var g = 0; g < primitive.count; g ++ ) {

              var vc = primitive.vcount[ g ];

              switch ( vc ) {

                case 3:
                  count += 3; // single triangle
                  break;

                case 4:
                  count += 6; // quad, subdivided into two triangles
                  break;

                default:
                  count += ( vc - 2 ) * 3; // polylist with more than four vertices
                  break;

              }

            }

            break;

          default:
            console.warn( 'THREE.ColladaLoader: Unknow primitive type:', primitive.type );

        }

        geometry.addGroup( start, count, p );
        start += count;

        // material

        if ( primitive.material ) {

          materialKeys.push( primitive.material );

        }

        // geometry data

        for ( var name in inputs ) {

          var input = inputs[ name ];

          switch ( name ) {

            case 'VERTEX':
              for ( var key in vertices ) {

                var id = vertices[ key ];

                switch ( key ) {

                  case 'POSITION':
                    var prevLength = position.array.length;
                    buildGeometryData( primitive, sources[ id ], input.offset, position.array );
                    position.stride = sources[ id ].stride;

                    if ( sources.skinWeights && sources.skinIndices ) {

                      buildGeometryData( primitive, sources.skinIndices, input.offset, skinIndex.array );
                      buildGeometryData( primitive, sources.skinWeights, input.offset, skinWeight.array );

                    }

                    // see #3803

                    if ( primitive.hasUV === false && primitives.uvsNeedsFix === true ) {

                      var count = ( position.array.length - prevLength ) / position.stride;

                      for ( var i = 0; i < count; i ++ ) {

                        // fill missing uv coordinates

                        uv.array.push( 0, 0 );

                      }

                    }
                    break;

                  case 'NORMAL':
                    buildGeometryData( primitive, sources[ id ], input.offset, normal.array );
                    normal.stride = sources[ id ].stride;
                    break;

                  case 'COLOR':
                    buildGeometryData( primitive, sources[ id ], input.offset, color.array );
                    color.stride = sources[ id ].stride;
                    break;

                  case 'TEXCOORD':
                    buildGeometryData( primitive, sources[ id ], input.offset, uv.array );
                    uv.stride = sources[ id ].stride;
                    break;

                  case 'TEXCOORD1':
                    buildGeometryData( primitive, sources[ id ], input.offset, uv2.array );
                    uv.stride = sources[ id ].stride;
                    break;

                  default:
                    console.warn( 'THREE.ColladaLoader: Semantic "%s" not handled in geometry build process.', key );

                }

              }
              break;

            case 'NORMAL':
              buildGeometryData( primitive, sources[ input.id ], input.offset, normal.array );
              normal.stride = sources[ input.id ].stride;
              break;

            case 'COLOR':
              buildGeometryData( primitive, sources[ input.id ], input.offset, color.array );
              color.stride = sources[ input.id ].stride;
              break;

            case 'TEXCOORD':
              buildGeometryData( primitive, sources[ input.id ], input.offset, uv.array );
              uv.stride = sources[ input.id ].stride;
              break;

            case 'TEXCOORD1':
              buildGeometryData( primitive, sources[ input.id ], input.offset, uv2.array );
              uv2.stride = sources[ input.id ].stride;
              break;

          }

        }

      }

      // build geometry

      if ( position.array.length > 0 ) geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( position.array, position.stride ) );
      if ( normal.array.length > 0 ) geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normal.array, normal.stride ) );
      if ( color.array.length > 0 ) geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( color.array, color.stride ) );
      if ( uv.array.length > 0 ) geometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( uv.array, uv.stride ) );
      if ( uv2.array.length > 0 ) geometry.addAttribute( 'uv2', new THREE.Float32BufferAttribute( uv2.array, uv2.stride ) );

      if ( skinIndex.array.length > 0 ) geometry.addAttribute( 'skinIndex', new THREE.Float32BufferAttribute( skinIndex.array, skinIndex.stride ) );
      if ( skinWeight.array.length > 0 ) geometry.addAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeight.array, skinWeight.stride ) );

      build.data = geometry;
      build.type = primitives[ 0 ].type;
      build.materialKeys = materialKeys;

      return build;

    }

    function buildGeometryData( primitive, source, offset, array ) {

      var indices = primitive.p;
      var stride = primitive.stride;
      var vcount = primitive.vcount;

      function pushVector( i ) {

        var index = indices[ i + offset ] * sourceStride;
        var length = index + sourceStride;

        for ( ; index < length; index ++ ) {

          array.push( sourceArray[ index ] );

        }

      }

      var sourceArray = source.array;
      var sourceStride = source.stride;

      if ( primitive.vcount !== undefined ) {

        var index = 0;

        for ( var i = 0, l = vcount.length; i < l; i ++ ) {

          var count = vcount[ i ];

          if ( count === 4 ) {

            var a = index + stride * 0;
            var b = index + stride * 1;
            var c = index + stride * 2;
            var d = index + stride * 3;

            pushVector( a ); pushVector( b ); pushVector( d );
            pushVector( b ); pushVector( c ); pushVector( d );

          } else if ( count === 3 ) {

            var a = index + stride * 0;
            var b = index + stride * 1;
            var c = index + stride * 2;

            pushVector( a ); pushVector( b ); pushVector( c );

          } else if ( count > 4 ) {

            for ( var k = 1, kl = ( count - 2 ); k <= kl; k ++ ) {

              var a = index + stride * 0;
              var b = index + stride * k;
              var c = index + stride * ( k + 1 );

              pushVector( a ); pushVector( b ); pushVector( c );

            }

          }

          index += stride * count;

        }

      } else {

        for ( var i = 0, l = indices.length; i < l; i += stride ) {

          pushVector( i );

        }

      }

    }

    function getGeometry( id ) {

      return getBuild( library.geometries[ id ], buildGeometry );

    }

    // kinematics

    function parseKinematicsModel( xml ) {

      var data = {
        name: xml.getAttribute( 'name' ) || '',
        joints: {},
        links: []
      };

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'technique_common':
            parseKinematicsTechniqueCommon( child, data );
            break;

        }

      }

      library.kinematicsModels[ xml.getAttribute( 'id' ) ] = data;

    }

    function buildKinematicsModel( data ) {

      if ( data.build !== undefined ) return data.build;

      return data;

    }

    function getKinematicsModel( id ) {

      return getBuild( library.kinematicsModels[ id ], buildKinematicsModel );

    }

    function parseKinematicsTechniqueCommon( xml, data ) {

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'joint':
            data.joints[ child.getAttribute( 'sid' ) ] = parseKinematicsJoint( child );
            break;

          case 'link':
            data.links.push( parseKinematicsLink( child ) );
            break;

        }

      }

    }

    function parseKinematicsJoint( xml ) {

      var data;

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'prismatic':
          case 'revolute':
            data = parseKinematicsJointParameter( child );
            break;

        }

      }

      return data;

    }

    function parseKinematicsJointParameter( xml, data ) {

      var data = {
        sid: xml.getAttribute( 'sid' ),
        name: xml.getAttribute( 'name' ) || '',
        axis: new THREE.Vector3(),
        limits: {
          min: 0,
          max: 0
        },
        type: xml.nodeName,
        static: false,
        zeroPosition: 0,
        middlePosition: 0
      };

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'axis':
            var array = parseFloats( child.textContent );
            data.axis.fromArray( array );
            break;
          case 'limits':
            var max = child.getElementsByTagName( 'max' )[ 0 ];
            var min = child.getElementsByTagName( 'min' )[ 0 ];

            data.limits.max = parseFloat( max.textContent );
            data.limits.min = parseFloat( min.textContent );
            break;

        }

      }

      // if min is equal to or greater than max, consider the joint static

      if ( data.limits.min >= data.limits.max ) {

        data.static = true;

      }

      // calculate middle position

      data.middlePosition = ( data.limits.min + data.limits.max ) / 2.0;

      return data;

    }

    function parseKinematicsLink( xml ) {

      var data = {
        sid: xml.getAttribute( 'sid' ),
        name: xml.getAttribute( 'name' ) || '',
        attachments: [],
        transforms: []
      };

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'attachment_full':
            data.attachments.push( parseKinematicsAttachment( child ) );
            break;

          case 'matrix':
          case 'translate':
          case 'rotate':
            data.transforms.push( parseKinematicsTransform( child ) );
            break;

        }

      }

      return data;

    }

    function parseKinematicsAttachment( xml ) {

      var data = {
        joint: xml.getAttribute( 'joint' ).split( '/' ).pop(),
        transforms: [],
        links: []
      };

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'link':
            data.links.push( parseKinematicsLink( child ) );
            break;

          case 'matrix':
          case 'translate':
          case 'rotate':
            data.transforms.push( parseKinematicsTransform( child ) );
            break;

        }

      }

      return data;

    }

    function parseKinematicsTransform( xml ) {

      var data = {
        type: xml.nodeName
      };

      var array = parseFloats( xml.textContent );

      switch ( data.type ) {

        case 'matrix':
          data.obj = new THREE.Matrix4();
          data.obj.fromArray( array ).transpose();
          break;

        case 'translate':
          data.obj = new THREE.Vector3();
          data.obj.fromArray( array );
          break;

        case 'rotate':
          data.obj = new THREE.Vector3();
          data.obj.fromArray( array );
          data.angle = THREE.MathUtils.degToRad( array[ 3 ] );
          break;

      }

      return data;

    }

    // physics

    function parsePhysicsModel( xml ) {

      var data = {
        name: xml.getAttribute( 'name' ) || '',
        rigidBodies: {}
      };

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'rigid_body':
            data.rigidBodies[ child.getAttribute( 'name' ) ] = {};
            parsePhysicsRigidBody( child, data.rigidBodies[ child.getAttribute( 'name' ) ] );
            break;

        }

      }

      library.physicsModels[ xml.getAttribute( 'id' ) ] = data;

    }

    function parsePhysicsRigidBody( xml, data ) {

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'technique_common':
            parsePhysicsTechniqueCommon( child, data );
            break;

        }

      }

    }

    function parsePhysicsTechniqueCommon( xml, data ) {

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'inertia':
            data.inertia = parseFloats( child.textContent );
            break;

          case 'mass':
            data.mass = parseFloats( child.textContent )[ 0 ];
            break;

        }

      }

    }

    // scene

    function parseKinematicsScene( xml ) {

      var data = {
        bindJointAxis: []
      };

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'bind_joint_axis':
            data.bindJointAxis.push( parseKinematicsBindJointAxis( child ) );
            break;

        }

      }

      library.kinematicsScenes[ parseId( xml.getAttribute( 'url' ) ) ] = data;

    }

    function parseKinematicsBindJointAxis( xml ) {

      var data = {
        target: xml.getAttribute( 'target' ).split( '/' ).pop()
      };

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'axis':
            var param = child.getElementsByTagName( 'param' )[ 0 ];
            data.axis = param.textContent;
            var tmpJointIndex = data.axis.split( 'inst_' ).pop().split( 'axis' )[ 0 ];
            data.jointIndex = tmpJointIndex.substr( 0, tmpJointIndex.length - 1 );
            break;

        }

      }

      return data;

    }

    function buildKinematicsScene( data ) {

      if ( data.build !== undefined ) return data.build;

      return data;

    }

    function getKinematicsScene( id ) {

      return getBuild( library.kinematicsScenes[ id ], buildKinematicsScene );

    }

    function setupKinematics() {

      var kinematicsModelId = Object.keys( library.kinematicsModels )[ 0 ];
      var kinematicsSceneId = Object.keys( library.kinematicsScenes )[ 0 ];
      var visualSceneId = Object.keys( library.visualScenes )[ 0 ];

      if ( kinematicsModelId === undefined || kinematicsSceneId === undefined ) return;

      var kinematicsModel = getKinematicsModel( kinematicsModelId );
      var kinematicsScene = getKinematicsScene( kinematicsSceneId );
      var visualScene = getVisualScene( visualSceneId );

      var bindJointAxis = kinematicsScene.bindJointAxis;
      var jointMap = {};

      for ( var i = 0, l = bindJointAxis.length; i < l; i ++ ) {

        var axis = bindJointAxis[ i ];

        // the result of the following query is an element of type 'translate', 'rotate','scale' or 'matrix'

        var targetElement = collada.querySelector( '[sid="' + axis.target + '"]' );

        if ( targetElement ) {

          // get the parent of the transfrom element

          var parentVisualElement = targetElement.parentElement;

          // connect the joint of the kinematics model with the element in the visual scene

          connect( axis.jointIndex, parentVisualElement );

        }

      }

      function connect( jointIndex, visualElement ) {

        var visualElementName = visualElement.getAttribute( 'name' );
        var joint = kinematicsModel.joints[ jointIndex ];

        visualScene.traverse( function ( object ) {

          if ( object.name === visualElementName ) {

            jointMap[ jointIndex ] = {
              object: object,
              transforms: buildTransformList( visualElement ),
              joint: joint,
              position: joint.zeroPosition
            };

          }

        } );

      }

      var m0 = new THREE.Matrix4();

      kinematics = {

        joints: kinematicsModel && kinematicsModel.joints,

        getJointValue: function ( jointIndex ) {

          var jointData = jointMap[ jointIndex ];

          if ( jointData ) {

            return jointData.position;

          } else {

            console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' doesn\'t exist.' );

          }

        },

        setJointValue: function ( jointIndex, value ) {

          var jointData = jointMap[ jointIndex ];

          if ( jointData ) {

            var joint = jointData.joint;

            if ( value > joint.limits.max || value < joint.limits.min ) {

              console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' value ' + value + ' outside of limits (min: ' + joint.limits.min + ', max: ' + joint.limits.max + ').' );

            } else if ( joint.static ) {

              console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' is static.' );

            } else {

              var object = jointData.object;
              var axis = joint.axis;
              var transforms = jointData.transforms;

              matrix.identity();

              // each update, we have to apply all transforms in the correct order

              for ( var i = 0; i < transforms.length; i ++ ) {

                var transform = transforms[ i ];

                // if there is a connection of the transform node with a joint, apply the joint value

                if ( transform.sid && transform.sid.indexOf( jointIndex ) !== - 1 ) {

                  switch ( joint.type ) {

                    case 'revolute':
                      matrix.multiply( m0.makeRotationAxis( axis, THREE.MathUtils.degToRad( value ) ) );
                      break;

                    case 'prismatic':
                      matrix.multiply( m0.makeTranslation( axis.x * value, axis.y * value, axis.z * value ) );
                      break;

                    default:
                      console.warn( 'THREE.ColladaLoader: Unknown joint type: ' + joint.type );
                      break;

                  }

                } else {

                  switch ( transform.type ) {

                    case 'matrix':
                      matrix.multiply( transform.obj );
                      break;

                    case 'translate':
                      matrix.multiply( m0.makeTranslation( transform.obj.x, transform.obj.y, transform.obj.z ) );
                      break;

                    case 'scale':
                      matrix.scale( transform.obj );
                      break;

                    case 'rotate':
                      matrix.multiply( m0.makeRotationAxis( transform.obj, transform.angle ) );
                      break;

                  }

                }

              }

              object.matrix.copy( matrix );
              object.matrix.decompose( object.position, object.quaternion, object.scale );

              jointMap[ jointIndex ].position = value;

            }

          } else {

            console.log( 'THREE.ColladaLoader: ' + jointIndex + ' does not exist.' );

          }

        }

      };

    }

    function buildTransformList( node ) {

      var transforms = [];

      var xml = collada.querySelector( '[id="' + node.id + '"]' );

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'matrix':
            var array = parseFloats( child.textContent );
            var matrix = new THREE.Matrix4().fromArray( array ).transpose();
            transforms.push( {
              sid: child.getAttribute( 'sid' ),
              type: child.nodeName,
              obj: matrix
            } );
            break;

          case 'translate':
          case 'scale':
            var array = parseFloats( child.textContent );
            var vector = new THREE.Vector3().fromArray( array );
            transforms.push( {
              sid: child.getAttribute( 'sid' ),
              type: child.nodeName,
              obj: vector
            } );
            break;

          case 'rotate':
            var array = parseFloats( child.textContent );
            var vector = new THREE.Vector3().fromArray( array );
            var angle = THREE.MathUtils.degToRad( array[ 3 ] );
            transforms.push( {
              sid: child.getAttribute( 'sid' ),
              type: child.nodeName,
              obj: vector,
              angle: angle
            } );
            break;

        }

      }

      return transforms;

    }

    // nodes

    function prepareNodes( xml ) {

      var elements = xml.getElementsByTagName( 'node' );

      // ensure all node elements have id attributes

      for ( var i = 0; i < elements.length; i ++ ) {

        var element = elements[ i ];

        if ( element.hasAttribute( 'id' ) === false ) {

          element.setAttribute( 'id', generateId() );

        }

      }

    }

    var matrix = new THREE.Matrix4();
    var vector = new THREE.Vector3();

    function parseNode( xml ) {

      var data = {
        name: xml.getAttribute( 'name' ) || '',
        type: xml.getAttribute( 'type' ),
        id: xml.getAttribute( 'id' ),
        sid: xml.getAttribute( 'sid' ),
        matrix: new THREE.Matrix4(),
        nodes: [],
        instanceCameras: [],
        instanceControllers: [],
        instanceLights: [],
        instanceGeometries: [],
        instanceNodes: [],
        transforms: {}
      };

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        if ( child.nodeType !== 1 ) continue;

        switch ( child.nodeName ) {

          case 'node':
            data.nodes.push( child.getAttribute( 'id' ) );
            parseNode( child );
            break;

          case 'instance_camera':
            data.instanceCameras.push( parseId( child.getAttribute( 'url' ) ) );
            break;

          case 'instance_controller':
            data.instanceControllers.push( parseNodeInstance( child ) );
            break;

          case 'instance_light':
            data.instanceLights.push( parseId( child.getAttribute( 'url' ) ) );
            break;

          case 'instance_geometry':
            data.instanceGeometries.push( parseNodeInstance( child ) );
            break;

          case 'instance_node':
            data.instanceNodes.push( parseId( child.getAttribute( 'url' ) ) );
            break;

          case 'matrix':
            var array = parseFloats( child.textContent );
            data.matrix.multiply( matrix.fromArray( array ).transpose() );
            data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
            break;

          case 'translate':
            var array = parseFloats( child.textContent );
            vector.fromArray( array );
            data.matrix.multiply( matrix.makeTranslation( vector.x, vector.y, vector.z ) );
            data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
            break;

          case 'rotate':
            var array = parseFloats( child.textContent );
            var angle = THREE.MathUtils.degToRad( array[ 3 ] );
            data.matrix.multiply( matrix.makeRotationAxis( vector.fromArray( array ), angle ) );
            data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
            break;

          case 'scale':
            var array = parseFloats( child.textContent );
            data.matrix.scale( vector.fromArray( array ) );
            data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
            break;

          case 'extra':
            break;

          default:
            console.log( child );

        }

      }

      if ( hasNode( data.id ) ) {

        console.warn( 'THREE.ColladaLoader: There is already a node with ID %s. Exclude current node from further processing.', data.id );

      } else {

        library.nodes[ data.id ] = data;

      }

      return data;

    }

    function parseNodeInstance( xml ) {

      var data = {
        id: parseId( xml.getAttribute( 'url' ) ),
        materials: {},
        skeletons: []
      };

      for ( var i = 0; i < xml.childNodes.length; i ++ ) {

        var child = xml.childNodes[ i ];

        switch ( child.nodeName ) {

          case 'bind_material':
            var instances = child.getElementsByTagName( 'instance_material' );

            for ( var j = 0; j < instances.length; j ++ ) {

              var instance = instances[ j ];
              var symbol = instance.getAttribute( 'symbol' );
              var target = instance.getAttribute( 'target' );

              data.materials[ symbol ] = parseId( target );

            }

            break;

          case 'skeleton':
            data.skeletons.push( parseId( child.textContent ) );
            break;

          default:
            break;

        }

      }

      return data;

    }

    function buildSkeleton( skeletons, joints ) {

      var boneData = [];
      var sortedBoneData = [];

      var i, j, data;

      // a skeleton can have multiple root bones. collada expresses this
      // situtation with multiple "skeleton" tags per controller instance

      for ( i = 0; i < skeletons.length; i ++ ) {

        var skeleton = skeletons[ i ];

        var root;

        if ( hasNode( skeleton ) ) {

          root = getNode( skeleton );
          buildBoneHierarchy( root, joints, boneData );

        } else if ( hasVisualScene( skeleton ) ) {

          // handle case where the skeleton refers to the visual scene (#13335)

          var visualScene = library.visualScenes[ skeleton ];
          var children = visualScene.children;

          for ( var j = 0; j < children.length; j ++ ) {

            var child = children[ j ];

            if ( child.type === 'JOINT' ) {

              var root = getNode( child.id );
              buildBoneHierarchy( root, joints, boneData );

            }

          }

        } else {

          console.error( 'THREE.ColladaLoader: Unable to find root bone of skeleton with ID:', skeleton );

        }

      }

      // sort bone data (the order is defined in the corresponding controller)

      for ( i = 0; i < joints.length; i ++ ) {

        for ( j = 0; j < boneData.length; j ++ ) {

          data = boneData[ j ];

          if ( data.bone.name === joints[ i ].name ) {

            sortedBoneData[ i ] = data;
            data.processed = true;
            break;

          }

        }

      }

      // add unprocessed bone data at the end of the list

      for ( i = 0; i < boneData.length; i ++ ) {

        data = boneData[ i ];

        if ( data.processed === false ) {

          sortedBoneData.push( data );
          data.processed = true;

        }

      }

      // setup arrays for skeleton creation

      var bones = [];
      var boneInverses = [];

      for ( i = 0; i < sortedBoneData.length; i ++ ) {

        data = sortedBoneData[ i ];

        bones.push( data.bone );
        boneInverses.push( data.boneInverse );

      }

      return new THREE.Skeleton( bones, boneInverses );

    }

    function buildBoneHierarchy( root, joints, boneData ) {

      // setup bone data from visual scene

      root.traverse( function ( object ) {

        if ( object.isBone === true ) {

          var boneInverse;

          // retrieve the boneInverse from the controller data

          for ( var i = 0; i < joints.length; i ++ ) {

            var joint = joints[ i ];

            if ( joint.name === object.name ) {

              boneInverse = joint.boneInverse;
              break;

            }

          }

          if ( boneInverse === undefined ) {

            // Unfortunately, there can be joints in the visual scene that are not part of the
            // corresponding controller. In this case, we have to create a dummy boneInverse matrix
            // for the respective bone. This bone won't affect any vertices, because there are no skin indices
            // and weights defined for it. But we still have to add the bone to the sorted bone list in order to
            // ensure a correct animation of the model.

            boneInverse = new THREE.Matrix4();

          }

          boneData.push( { bone: object, boneInverse: boneInverse, processed: false } );

        }

      } );

    }

    function buildNode( data ) {

      var objects = [];

      var matrix = data.matrix;
      var nodes = data.nodes;
      var type = data.type;
      var instanceCameras = data.instanceCameras;
      var instanceControllers = data.instanceControllers;
      var instanceLights = data.instanceLights;
      var instanceGeometries = data.instanceGeometries;
      var instanceNodes = data.instanceNodes;

      // nodes

      for ( var i = 0, l = nodes.length; i < l; i ++ ) {

        objects.push( getNode( nodes[ i ] ) );

      }

      // instance cameras

      for ( var i = 0, l = instanceCameras.length; i < l; i ++ ) {

        var instanceCamera = getCamera( instanceCameras[ i ] );

        if ( instanceCamera !== null ) {

          objects.push( instanceCamera.clone() );

        }

      }

      // instance controllers

      for ( var i = 0, l = instanceControllers.length; i < l; i ++ ) {

        var instance = instanceControllers[ i ];
        var controller = getController( instance.id );
        var geometries = getGeometry( controller.id );
        var newObjects = buildObjects( geometries, instance.materials );

        var skeletons = instance.skeletons;
        var joints = controller.skin.joints;

        var skeleton = buildSkeleton( skeletons, joints );

        for ( var j = 0, jl = newObjects.length; j < jl; j ++ ) {

          var object = newObjects[ j ];

          if ( object.isSkinnedMesh ) {

            object.bind( skeleton, controller.skin.bindMatrix );
            object.normalizeSkinWeights();

          }

          objects.push( object );

        }

      }

      // instance lights

      for ( var i = 0, l = instanceLights.length; i < l; i ++ ) {

        var instanceLight = getLight( instanceLights[ i ] );

        if ( instanceLight !== null ) {

          objects.push( instanceLight.clone() );

        }

      }

      // instance geometries

      for ( var i = 0, l = instanceGeometries.length; i < l; i ++ ) {

        var instance = instanceGeometries[ i ];

        // a single geometry instance in collada can lead to multiple object3Ds.
        // this is the case when primitives are combined like triangles and lines

        var geometries = getGeometry( instance.id );
        var newObjects = buildObjects( geometries, instance.materials );

        for ( var j = 0, jl = newObjects.length; j < jl; j ++ ) {

          objects.push( newObjects[ j ] );

        }

      }

      // instance nodes

      for ( var i = 0, l = instanceNodes.length; i < l; i ++ ) {

        objects.push( getNode( instanceNodes[ i ] ).clone() );

      }

      var object;

      if ( nodes.length === 0 && objects.length === 1 ) {

        object = objects[ 0 ];

      } else {

        object = ( type === 'JOINT' ) ? new THREE.Bone() : new THREE.Group();

        for ( var i = 0; i < objects.length; i ++ ) {

          object.add( objects[ i ] );

        }

      }

      if ( object.name === '' ) {

        object.name = ( type === 'JOINT' ) ? data.sid : data.name;

      }

      object.matrix.copy( matrix );
      object.matrix.decompose( object.position, object.quaternion, object.scale );

      return object;

    }

    var fallbackMaterial = new THREE.MeshBasicMaterial( { color: 0xff00ff } );

    function resolveMaterialBinding( keys, instanceMaterials ) {

      var materials = [];

      for ( var i = 0, l = keys.length; i < l; i ++ ) {

        var id = instanceMaterials[ keys[ i ] ];

        if ( id === undefined ) {

          console.warn( 'THREE.ColladaLoader: Material with key %s not found. Apply fallback material.', keys[ i ] );
          materials.push( fallbackMaterial );

        } else {

          materials.push( getMaterial( id ) );

        }

      }

      return materials;

    }

    function buildObjects( geometries, instanceMaterials ) {

      var objects = [];

      for ( var type in geometries ) {

        var geometry = geometries[ type ];

        var materials = resolveMaterialBinding( geometry.materialKeys, instanceMaterials );

        // handle case if no materials are defined

        if ( materials.length === 0 ) {

          if ( type === 'lines' || type === 'linestrips' ) {

            materials.push( new THREE.LineBasicMaterial() );

          } else {

            materials.push( new THREE.MeshPhongMaterial() );

          }

        }

        // regard skinning

        var skinning = ( geometry.data.attributes.skinIndex !== undefined );

        if ( skinning ) {

          for ( var i = 0, l = materials.length; i < l; i ++ ) {

            materials[ i ].skinning = true;

          }

        }

        // choose between a single or multi materials (material array)

        var material = ( materials.length === 1 ) ? materials[ 0 ] : materials;

        // now create a specific 3D object

        var object;

        switch ( type ) {

          case 'lines':
            object = new THREE.LineSegments( geometry.data, material );
            break;

          case 'linestrips':
            object = new THREE.Line( geometry.data, material );
            break;

          case 'triangles':
          case 'polylist':
            if ( skinning ) {

              object = new THREE.SkinnedMesh( geometry.data, material );

            } else {

              object = new THREE.Mesh( geometry.data, material );

            }
            break;

        }

        objects.push( object );

      }

      return objects;

    }

    function hasNode( id ) {

      return library.nodes[ id ] !== undefined;

    }

    function getNode( id ) {

      return getBuild( library.nodes[ id ], buildNode );

    }

    // visual scenes

    function parseVisualScene( xml ) {

      var data = {
        name: xml.getAttribute( 'name' ),
        children: []
      };

      prepareNodes( xml );

      var elements = getElementsByTagName( xml, 'node' );

      for ( var i = 0; i < elements.length; i ++ ) {

        data.children.push( parseNode( elements[ i ] ) );

      }

      library.visualScenes[ xml.getAttribute( 'id' ) ] = data;

    }

    function buildVisualScene( data ) {

      var group = new THREE.Group();
      group.name = data.name;

      var children = data.children;

      for ( var i = 0; i < children.length; i ++ ) {

        var child = children[ i ];

        group.add( getNode( child.id ) );

      }

      return group;

    }

    function hasVisualScene( id ) {

      return library.visualScenes[ id ] !== undefined;

    }

    function getVisualScene( id ) {

      return getBuild( library.visualScenes[ id ], buildVisualScene );

    }

    // scenes

    function parseScene( xml ) {

      var instance = getElementsByTagName( xml, 'instance_visual_scene' )[ 0 ];
      return getVisualScene( parseId( instance.getAttribute( 'url' ) ) );

    }

    function setupAnimations() {

      var clips = library.clips;

      if ( isEmpty( clips ) === true ) {

        if ( isEmpty( library.animations ) === false ) {

          // if there are animations but no clips, we create a default clip for playback

          var tracks = [];

          for ( var id in library.animations ) {

            var animationTracks = getAnimation( id );

            for ( var i = 0, l = animationTracks.length; i < l; i ++ ) {

              tracks.push( animationTracks[ i ] );

            }

          }

          animations.push( new THREE.AnimationClip( 'default', - 1, tracks ) );

        }

      } else {

        for ( var id in clips ) {

          animations.push( getAnimationClip( id ) );

        }

      }

    }

    if ( text.length === 0 ) {

      return { scene: new THREE.Scene() };

    }

    var xml = new DOMParser().parseFromString( text, 'application/xml' );

    var collada = getElementsByTagName( xml, 'COLLADA' )[ 0 ];

    // metadata

    var version = collada.getAttribute( 'version' );
    console.log( 'THREE.ColladaLoader: File version', version );

    var asset = parseAsset( getElementsByTagName( collada, 'asset' )[ 0 ] );
    var textureLoader = new THREE.TextureLoader( this.manager );
    textureLoader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

    var tgaLoader;

    if ( THREE.TGALoader ) {

      tgaLoader = new THREE.TGALoader( this.manager );
      tgaLoader.setPath( this.resourcePath || path );

    }

    //

    var animations = [];
    var kinematics = {};
    var count = 0;

    //

    var library = {
      animations: {},
      clips: {},
      controllers: {},
      images: {},
      effects: {},
      materials: {},
      cameras: {},
      lights: {},
      geometries: {},
      nodes: {},
      visualScenes: {},
      kinematicsModels: {},
      physicsModels: {},
      kinematicsScenes: {}
    };

    parseLibrary( collada, 'library_animations', 'animation', parseAnimation );
    parseLibrary( collada, 'library_animation_clips', 'animation_clip', parseAnimationClip );
    parseLibrary( collada, 'library_controllers', 'controller', parseController );
    parseLibrary( collada, 'library_images', 'image', parseImage );
    parseLibrary( collada, 'library_effects', 'effect', parseEffect );
    parseLibrary( collada, 'library_materials', 'material', parseMaterial );
    parseLibrary( collada, 'library_cameras', 'camera', parseCamera );
    parseLibrary( collada, 'library_lights', 'light', parseLight );
    parseLibrary( collada, 'library_geometries', 'geometry', parseGeometry );
    parseLibrary( collada, 'library_nodes', 'node', parseNode );
    parseLibrary( collada, 'library_visual_scenes', 'visual_scene', parseVisualScene );
    parseLibrary( collada, 'library_kinematics_models', 'kinematics_model', parseKinematicsModel );
    parseLibrary( collada, 'library_physics_models', 'physics_model', parsePhysicsModel );
    parseLibrary( collada, 'scene', 'instance_kinematics_scene', parseKinematicsScene );

    buildLibrary( library.animations, buildAnimation );
    buildLibrary( library.clips, buildAnimationClip );
    buildLibrary( library.controllers, buildController );
    buildLibrary( library.images, buildImage );
    buildLibrary( library.effects, buildEffect );
    buildLibrary( library.materials, buildMaterial );
    buildLibrary( library.cameras, buildCamera );
    buildLibrary( library.lights, buildLight );
    buildLibrary( library.geometries, buildGeometry );
    buildLibrary( library.visualScenes, buildVisualScene );

    setupAnimations();
    setupKinematics();

    var scene = parseScene( getElementsByTagName( collada, 'scene' )[ 0 ] );

    if ( asset.upAxis === 'Z_UP' ) {

      scene.quaternion.setFromEuler( new THREE.Euler( - Math.PI / 2, 0, 0 ) );

    }

    scene.scale.multiplyScalar( asset.unit );

    return {
      animations: animations,
      kinematics: kinematics,
      library: library,
      scene: scene
    };

  }

};


/***/ }),

/***/ "./lib/FBXLoader.js":
/*!**************************!*\
  !*** ./lib/FBXLoader.js ***!
  \**************************/
/***/ ((module) => {

/**
 * @author Kyle-Larson https://github.com/Kyle-Larson
 * @author Takahiro https://github.com/takahirox
 * @author Lewy Blue https://github.com/looeee
 *
 * Loader loads FBX file and generates Group representing FBX scene.
 * Requires FBX file to be >= 7.0 and in ASCII or >= 6400 in Binary format
 * Versions lower than this may load but will probably have errors
 *
 * Needs Support:
 *  Morph normals / blend shape normals
 *
 * FBX format references:
 * 	https://wiki.blender.org/index.php/User:Mont29/Foundation/FBX_File_Structure
 * 	http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_index_html (C++ SDK reference)
 *
 * 	Binary format specification:
 *		https://code.blender.org/2013/08/fbx-binary-file-format-specification/
 */


module.exports = THREE.FBXLoader = ( function () {

	var fbxTree;
	var connections;
	var sceneGraph;

	function FBXLoader( manager ) {

		this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	}

	FBXLoader.prototype = {

		constructor: FBXLoader,

		crossOrigin: 'anonymous',

		load: function ( url, onLoad, onProgress, onError ) {
			var self = this;

			var resourceDirectory = THREE.LoaderUtils.extractUrlBase( url );

			var loader = new THREE.FileLoader( this.manager );
			loader.setResponseType( 'arraybuffer' );
			loader.load( url, function ( buffer ) {

				try {

					var scene = self.parse( buffer, resourceDirectory );
					onLoad( scene );

				} catch ( error ) {

					setTimeout( function () {

						if ( onError ) onError( error );

						self.manager.itemError( url );

					}, 0 );

				}

			}, onProgress, onError );
		},

		setCrossOrigin: function ( value ) {

			this.crossOrigin = value;
			return this;

		},

		parse: function ( FBXBuffer, resourceDirectory ) {

			if ( isFbxFormatBinary( FBXBuffer ) ) {

				fbxTree = new BinaryParser().parse( FBXBuffer );

			} else {

				var FBXText = convertArrayBufferToString( FBXBuffer );

				if ( ! isFbxFormatASCII( FBXText ) ) {

					throw new Error( 'THREE.FBXLoader: Unknown format.' );

				}

				if ( getFbxVersion( FBXText ) < 7000 ) {

					throw new Error( 'THREE.FBXLoader: FBX version not supported, FileVersion: ' + getFbxVersion( FBXText ) );

				}

				fbxTree = new TextParser().parse( FBXText );

			}

			//console.log( FBXTree );

			var textureLoader = new THREE.TextureLoader( this.manager ).setPath( resourceDirectory ).setCrossOrigin( this.crossOrigin );

			return new FBXTreeParser( textureLoader ).parse( fbxTree );

		}

	};

	// Parse the FBXTree object returned by the BinaryParser or TextParser and return a THREE.Group
	function FBXTreeParser( textureLoader ) {

		this.textureLoader = textureLoader;

	}

	FBXTreeParser.prototype = {

		constructor: FBXTreeParser,

		parse: function () {

			connections = this.parseConnections();

			var images = this.parseImages();
			var textures = this.parseTextures( images );
			var materials = this.parseMaterials( textures );
			var deformers = this.parseDeformers();
			var geometryMap = new GeometryParser().parse( deformers );

			this.parseScene( deformers, geometryMap, materials );

			return sceneGraph;

		},

		// Parses FBXTree.Connections which holds parent-child connections between objects (e.g. material -> texture, model->geometry )
		// and details the connection type
		parseConnections: function () {

			var connectionMap = new Map();

			if ( 'Connections' in fbxTree ) {

				var rawConnections = fbxTree.Connections.connections;

				rawConnections.forEach( function ( rawConnection ) {

					var fromID = rawConnection[ 0 ];
					var toID = rawConnection[ 1 ];
					var relationship = rawConnection[ 2 ];

					if ( ! connectionMap.has( fromID ) ) {

						connectionMap.set( fromID, {
							parents: [],
							children: []
						} );

					}

					var parentRelationship = { ID: toID, relationship: relationship };
					connectionMap.get( fromID ).parents.push( parentRelationship );

					if ( ! connectionMap.has( toID ) ) {

						connectionMap.set( toID, {
							parents: [],
							children: []
						} );

					}

					var childRelationship = { ID: fromID, relationship: relationship };
					connectionMap.get( toID ).children.push( childRelationship );

				} );

			}

			return connectionMap;

		},

		// Parse FBXTree.Objects.Video for embedded image data
		// These images are connected to textures in FBXTree.Objects.Textures
		// via FBXTree.Connections.
		parseImages: function () {

			var images = {};
			var blobs = {};

			if ( 'Video' in fbxTree.Objects ) {

				var videoNodes = fbxTree.Objects.Video;

				for ( var nodeID in videoNodes ) {

					var videoNode = videoNodes[ nodeID ];

					var id = parseInt( nodeID );

					images[ id ] = videoNode.RelativeFilename || videoNode.Filename;

					// raw image data is in videoNode.Content
					if ( 'Content' in videoNode ) {

						var arrayBufferContent = ( videoNode.Content instanceof ArrayBuffer ) && ( videoNode.Content.byteLength > 0 );
						var base64Content = ( typeof videoNode.Content === 'string' ) && ( videoNode.Content !== '' );

						if ( arrayBufferContent || base64Content ) {

							var image = this.parseImage( videoNodes[ nodeID ] );

							blobs[ videoNode.RelativeFilename || videoNode.Filename ] = image;

						}

					}

				}

			}

			for ( var id in images ) {

				var filename = images[ id ];

				if ( blobs[ filename ] !== undefined ) images[ id ] = blobs[ filename ];
				else images[ id ] = images[ id ].split( '\\' ).pop();

			}

			return images;

		},

		// Parse embedded image data in FBXTree.Video.Content
		parseImage: function ( videoNode ) {

			var content = videoNode.Content;
			var fileName = videoNode.RelativeFilename || videoNode.Filename;
			var extension = fileName.slice( fileName.lastIndexOf( '.' ) + 1 ).toLowerCase();

			var type;

			switch ( extension ) {

				case 'bmp':

					type = 'image/bmp';
					break;

				case 'jpg':
				case 'jpeg':

					type = 'image/jpeg';
					break;

				case 'png':

					type = 'image/png';
					break;

				case 'tif':

					type = 'image/tiff';
					break;

				case 'tga':

					if ( typeof THREE.TGALoader !== 'function' ) {

						console.warn( 'FBXLoader: THREE.TGALoader is required to load TGA textures' );
						return;

					} else {

						if ( THREE.Loader.Handlers.get( '.tga' ) === null ) {

							THREE.Loader.Handlers.add( /\.tga$/i, new THREE.TGALoader() );

						}

						type = 'image/tga';
						break;

					}

				default:

					console.warn( 'FBXLoader: Image type "' + extension + '" is not supported.' );
					return;

			}

			if ( typeof content === 'string' ) { // ASCII format

				return 'data:' + type + ';base64,' + content;

			} else { // Binary Format

				var array = new Uint8Array( content );
				return window.URL.createObjectURL( new Blob( [ array ], { type: type } ) );

			}

		},

		// Parse nodes in FBXTree.Objects.Texture
		// These contain details such as UV scaling, cropping, rotation etc and are connected
		// to images in FBXTree.Objects.Video
		parseTextures: function ( images ) {

			var textureMap = new Map();

			if ( 'Texture' in fbxTree.Objects ) {

				var textureNodes = fbxTree.Objects.Texture;
				for ( var nodeID in textureNodes ) {

					var texture = this.parseTexture( textureNodes[ nodeID ], images );
					textureMap.set( parseInt( nodeID ), texture );

				}

			}

			return textureMap;

		},

		// Parse individual node in FBXTree.Objects.Texture
		parseTexture: function ( textureNode, images ) {

			var texture = this.loadTexture( textureNode, images );

			texture.ID = textureNode.id;

			texture.name = textureNode.attrName;

			var wrapModeU = textureNode.WrapModeU;
			var wrapModeV = textureNode.WrapModeV;

			var valueU = wrapModeU !== undefined ? wrapModeU.value : 0;
			var valueV = wrapModeV !== undefined ? wrapModeV.value : 0;

			// http://download.autodesk.com/us/fbx/SDKdocs/FBX_SDK_Help/files/fbxsdkref/class_k_fbx_texture.html#889640e63e2e681259ea81061b85143a
			// 0: repeat(default), 1: clamp

			texture.wrapS = valueU === 0 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
			texture.wrapT = valueV === 0 ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

			if ( 'Scaling' in textureNode ) {

				var values = textureNode.Scaling.value;

				texture.repeat.x = values[ 0 ];
				texture.repeat.y = values[ 1 ];

			}

			return texture;

		},

		// load a texture specified as a blob or data URI, or via an external URL using THREE.TextureLoader
		loadTexture: function ( textureNode, images ) {

			var fileName;

			var currentPath = this.textureLoader.path;

			var children = connections.get( textureNode.id ).children;

			if ( children !== undefined && children.length > 0 && images[ children[ 0 ].ID ] !== undefined ) {

				fileName = images[ children[ 0 ].ID ];

				if ( fileName.indexOf( 'blob:' ) === 0 || fileName.indexOf( 'data:' ) === 0 ) {

					this.textureLoader.setPath( undefined );

				}

			}

			var texture;

			var extension = textureNode.FileName.slice( - 3 ).toLowerCase();

			if ( extension === 'tga' ) {

				var loader = THREE.Loader.Handlers.get( '.tga' );

				if ( loader === null ) {

					console.warn( 'FBXLoader: TGALoader not found, creating empty placeholder texture for', fileName );
					texture = new THREE.Texture();

				} else {

					texture = loader.load( fileName );

				}

			} else if ( extension === 'psd' ) {

				console.warn( 'FBXLoader: PSD textures are not supported, creating empty placeholder texture for', fileName );
				texture = new THREE.Texture();

			} else {

				texture = this.textureLoader.load( fileName );

			}

			this.textureLoader.setPath( currentPath );

			return texture;

		},

		// Parse nodes in FBXTree.Objects.Material
		parseMaterials: function ( textureMap ) {

			var materialMap = new Map();

			if ( 'Material' in fbxTree.Objects ) {

				var materialNodes = fbxTree.Objects.Material;

				for ( var nodeID in materialNodes ) {

					var material = this.parseMaterial( materialNodes[ nodeID ], textureMap );

					if ( material !== null ) materialMap.set( parseInt( nodeID ), material );

				}

			}

			return materialMap;

		},

		// Parse single node in FBXTree.Objects.Material
		// Materials are connected to texture maps in FBXTree.Objects.Textures
		// FBX format currently only supports Lambert and Phong shading models
		parseMaterial: function ( materialNode, textureMap ) {

			var ID = materialNode.id;
			var name = materialNode.attrName;
			var type = materialNode.ShadingModel;

			// Case where FBX wraps shading model in property object.
			if ( typeof type === 'object' ) {

				type = type.value;

			}

			// Ignore unused materials which don't have any connections.
			if ( ! connections.has( ID ) ) return null;

			var parameters = this.parseParameters( materialNode, textureMap, ID );

			var material;

			switch ( type.toLowerCase() ) {

				case 'phong':
					material = new THREE.MeshPhongMaterial();
					break;
				case 'lambert':
					material = new THREE.MeshLambertMaterial();
					break;
				default:
					console.warn( 'THREE.FBXLoader: unknown material type "%s". Defaulting to MeshPhongMaterial.', type );
					material = new THREE.MeshPhongMaterial( { color: 0x3300ff } );
					break;

			}

			material.setValues( parameters );
			material.name = name;

			return material;

		},

		// Parse FBX material and return parameters suitable for a three.js material
		// Also parse the texture map and return any textures associated with the material
		parseParameters: function ( materialNode, textureMap, ID ) {

			var parameters = {};

			if ( materialNode.BumpFactor ) {

				parameters.bumpScale = materialNode.BumpFactor.value;

			}
			if ( materialNode.Diffuse ) {

				parameters.color = new THREE.Color().fromArray( materialNode.Diffuse.value );

			} else if ( materialNode.DiffuseColor && materialNode.DiffuseColor.type === 'Color' ) {

				// The blender exporter exports diffuse here instead of in materialNode.Diffuse
				parameters.color = new THREE.Color().fromArray( materialNode.DiffuseColor.value );

			}
			if ( materialNode.DisplacementFactor ) {

				parameters.displacementScale = materialNode.DisplacementFactor.value;

			}
			if ( materialNode.Emissive ) {

				parameters.emissive = new THREE.Color().fromArray( materialNode.Emissive.value );

			} else if ( materialNode.EmissiveColor && materialNode.EmissiveColor.type === 'Color' ) {

				// The blender exporter exports emissive color here instead of in materialNode.Emissive
				parameters.emissive = new THREE.Color().fromArray( materialNode.EmissiveColor.value );

			}
			if ( materialNode.EmissiveFactor ) {

				parameters.emissiveIntensity = parseFloat( materialNode.EmissiveFactor.value );

			}
			if ( materialNode.Opacity ) {

				parameters.opacity = parseFloat( materialNode.Opacity.value );

			}
			if ( parameters.opacity < 1.0 ) {

				parameters.transparent = true;

			}
			if ( materialNode.ReflectionFactor ) {

				parameters.reflectivity = materialNode.ReflectionFactor.value;

			}
			if ( materialNode.Shininess ) {

				parameters.shininess = materialNode.Shininess.value;

			}
			if ( materialNode.Specular ) {

				parameters.specular = new THREE.Color().fromArray( materialNode.Specular.value );

			} else if ( materialNode.SpecularColor && materialNode.SpecularColor.type === 'Color' ) {

				// The blender exporter exports specular color here instead of in materialNode.Specular
				parameters.specular = new THREE.Color().fromArray( materialNode.SpecularColor.value );

			}

			var self = this;
			connections.get( ID ).children.forEach( function ( child ) {

				var type = child.relationship;

				switch ( type ) {

					case 'Bump':
						parameters.bumpMap = self.getTexture( textureMap, child.ID );
						break;

					case 'DiffuseColor':
						parameters.map = self.getTexture( textureMap, child.ID );
						break;

					case 'DisplacementColor':
						parameters.displacementMap = self.getTexture( textureMap, child.ID );
						break;


					case 'EmissiveColor':
						parameters.emissiveMap = self.getTexture( textureMap, child.ID );
						break;

					case 'NormalMap':
						parameters.normalMap = self.getTexture( textureMap, child.ID );
						break;

					case 'ReflectionColor':
						parameters.envMap = self.getTexture( textureMap, child.ID );
						parameters.envMap.mapping = THREE.EquirectangularReflectionMapping;
						break;

					case 'SpecularColor':
						parameters.specularMap = self.getTexture( textureMap, child.ID );
						break;

					case 'TransparentColor':
						parameters.alphaMap = self.getTexture( textureMap, child.ID );
						parameters.transparent = true;
						break;

					case 'AmbientColor':
					case 'ShininessExponent': // AKA glossiness map
					case 'SpecularFactor': // AKA specularLevel
					case 'VectorDisplacementColor': // NOTE: Seems to be a copy of DisplacementColor
					default:
						console.warn( 'THREE.FBXLoader: %s map is not supported in three.js, skipping texture.', type );
						break;

				}

			} );

			return parameters;

		},

		// get a texture from the textureMap for use by a material.
		getTexture: function ( textureMap, id ) {

			// if the texture is a layered texture, just use the first layer and issue a warning
			if ( 'LayeredTexture' in fbxTree.Objects && id in fbxTree.Objects.LayeredTexture ) {

				console.warn( 'THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer.' );
				id = connections.get( id ).children[ 0 ].ID;

			}

			return textureMap.get( id );

		},

		// Parse nodes in FBXTree.Objects.Deformer
		// Deformer node can contain skinning or Vertex Cache animation data, however only skinning is supported here
		// Generates map of Skeleton-like objects for use later when generating and binding skeletons.
		parseDeformers: function () {

			var skeletons = {};
			var morphTargets = {};

			if ( 'Deformer' in fbxTree.Objects ) {

				var DeformerNodes = fbxTree.Objects.Deformer;

				for ( var nodeID in DeformerNodes ) {

					var deformerNode = DeformerNodes[ nodeID ];

					var relationships = connections.get( parseInt( nodeID ) );

					if ( deformerNode.attrType === 'Skin' ) {

						var skeleton = this.parseSkeleton( relationships, DeformerNodes );
						skeleton.ID = nodeID;

						if ( relationships.parents.length > 1 ) console.warn( 'THREE.FBXLoader: skeleton attached to more than one geometry is not supported.' );
						skeleton.geometryID = relationships.parents[ 0 ].ID;

						skeletons[ nodeID ] = skeleton;

					} else if ( deformerNode.attrType === 'BlendShape' ) {

						var morphTarget = {
							id: nodeID,
						};

						morphTarget.rawTargets = this.parseMorphTargets( relationships, DeformerNodes );
						morphTarget.id = nodeID;

						if ( relationships.parents.length > 1 ) console.warn( 'THREE.FBXLoader: morph target attached to more than one geometry is not supported.' );

						morphTargets[ nodeID ] = morphTarget;

					}

				}

			}

			return {

				skeletons: skeletons,
				morphTargets: morphTargets,

			};

		},

		// Parse single nodes in FBXTree.Objects.Deformer
		// The top level skeleton node has type 'Skin' and sub nodes have type 'Cluster'
		// Each skin node represents a skeleton and each cluster node represents a bone
		parseSkeleton: function ( relationships, deformerNodes ) {

			var rawBones = [];

			relationships.children.forEach( function ( child ) {

				var boneNode = deformerNodes[ child.ID ];

				if ( boneNode.attrType !== 'Cluster' ) return;

				var rawBone = {

					ID: child.ID,
					indices: [],
					weights: [],
					transform: new THREE.Matrix4().fromArray( boneNode.Transform.a ),
					transformLink: new THREE.Matrix4().fromArray( boneNode.TransformLink.a ),
					linkMode: boneNode.Mode,

				};

				if ( 'Indexes' in boneNode ) {

					rawBone.indices = boneNode.Indexes.a;
					rawBone.weights = boneNode.Weights.a;

				}

				rawBones.push( rawBone );

			} );

			return {

				rawBones: rawBones,
				bones: []

			};

		},

		// The top level morph deformer node has type "BlendShape" and sub nodes have type "BlendShapeChannel"
		parseMorphTargets: function ( relationships, deformerNodes ) {

			var rawMorphTargets = [];

			for ( var i = 0; i < relationships.children.length; i ++ ) {

				if ( i === 8 ) {

					console.warn( 'FBXLoader: maximum of 8 morph targets supported. Ignoring additional targets.' );

					break;

				}

				var child = relationships.children[ i ];

				var morphTargetNode = deformerNodes[ child.ID ];

				var rawMorphTarget = {

					name: morphTargetNode.attrName,
					initialWeight: morphTargetNode.DeformPercent,
					id: morphTargetNode.id,
					fullWeights: morphTargetNode.FullWeights.a

				};

				if ( morphTargetNode.attrType !== 'BlendShapeChannel' ) return;

				var targetRelationships = connections.get( parseInt( child.ID ) );

				targetRelationships.children.forEach( function ( child ) {

					if ( child.relationship === undefined ) rawMorphTarget.geoID = child.ID;

				} );

				rawMorphTargets.push( rawMorphTarget );

			}

			return rawMorphTargets;

		},

		// create the main THREE.Group() to be returned by the loader
		parseScene: function ( deformers, geometryMap, materialMap ) {

			sceneGraph = new THREE.Group();

			var modelMap = this.parseModels( deformers.skeletons, geometryMap, materialMap );

			var modelNodes = fbxTree.Objects.Model;

			var self = this;
			modelMap.forEach( function ( model ) {

				var modelNode = modelNodes[ model.ID ];
				self.setLookAtProperties( model, modelNode );

				var parentConnections = connections.get( model.ID ).parents;

				parentConnections.forEach( function ( connection ) {

					var parent = modelMap.get( connection.ID );
					if ( parent !== undefined ) parent.add( model );

				} );

				if ( model.parent === null ) {

					sceneGraph.add( model );

				}


			} );

			this.bindSkeleton( deformers.skeletons, geometryMap, modelMap );

			this.createAmbientLight();

			this.setupMorphMaterials();

			var animations = new AnimationParser().parse();

			// if all the models where already combined in a single group, just return that
			if ( sceneGraph.children.length === 1 && sceneGraph.children[ 0 ].isGroup ) {

				sceneGraph.children[ 0 ].animations = animations;
				sceneGraph = sceneGraph.children[ 0 ];

			}

			sceneGraph.animations = animations;

		},

		// parse nodes in FBXTree.Objects.Model
		parseModels: function ( skeletons, geometryMap, materialMap ) {

			var modelMap = new Map();
			var modelNodes = fbxTree.Objects.Model;

			for ( var nodeID in modelNodes ) {

				var id = parseInt( nodeID );
				var node = modelNodes[ nodeID ];
				var relationships = connections.get( id );

				var model = this.buildSkeleton( relationships, skeletons, id, node.attrName );

				if ( ! model ) {

					switch ( node.attrType ) {

						case 'Camera':
							model = this.createCamera( relationships );
							break;
						case 'Light':
							model = this.createLight( relationships );
							break;
						case 'Mesh':
							model = this.createMesh( relationships, geometryMap, materialMap );
							break;
						case 'NurbsCurve':
							model = this.createCurve( relationships, geometryMap );
							break;
						case 'LimbNode': // usually associated with a Bone, however if a Bone was not created we'll make a Group instead
						case 'Null':
						default:
							model = new THREE.Group();
							break;

					}

					model.name = THREE.PropertyBinding.sanitizeNodeName( node.attrName );
					model.ID = id;

				}

				this.setModelTransforms( model, node );
				modelMap.set( id, model );

			}

			return modelMap;

		},

		buildSkeleton: function ( relationships, skeletons, id, name ) {

			var bone = null;

			relationships.parents.forEach( function ( parent ) {

				for ( var ID in skeletons ) {

					var skeleton = skeletons[ ID ];

					skeleton.rawBones.forEach( function ( rawBone, i ) {

						if ( rawBone.ID === parent.ID ) {

							var subBone = bone;
							bone = new THREE.Bone();
							bone.matrixWorld.copy( rawBone.transformLink );

							// set name and id here - otherwise in cases where "subBone" is created it will not have a name / id
							bone.name = THREE.PropertyBinding.sanitizeNodeName( name );
							bone.ID = id;

							skeleton.bones[ i ] = bone;

							// In cases where a bone is shared between multiple meshes
							// duplicate the bone here and and it as a child of the first bone
							if ( subBone !== null ) {

								bone.add( subBone );

							}

						}

					} );

				}

			} );

			return bone;

		},

		// create a THREE.PerspectiveCamera or THREE.OrthographicCamera
		createCamera: function ( relationships ) {

			var model;
			var cameraAttribute;

			relationships.children.forEach( function ( child ) {

				var attr = fbxTree.Objects.NodeAttribute[ child.ID ];

				if ( attr !== undefined ) {

					cameraAttribute = attr;

				}

			} );

			if ( cameraAttribute === undefined ) {

				model = new THREE.Object3D();

			} else {

				var type = 0;
				if ( cameraAttribute.CameraProjectionType !== undefined && cameraAttribute.CameraProjectionType.value === 1 ) {

					type = 1;

				}

				var nearClippingPlane = 1;
				if ( cameraAttribute.NearPlane !== undefined ) {

					nearClippingPlane = cameraAttribute.NearPlane.value / 1000;

				}

				var farClippingPlane = 1000;
				if ( cameraAttribute.FarPlane !== undefined ) {

					farClippingPlane = cameraAttribute.FarPlane.value / 1000;

				}


				var width = window.innerWidth;
				var height = window.innerHeight;

				if ( cameraAttribute.AspectWidth !== undefined && cameraAttribute.AspectHeight !== undefined ) {

					width = cameraAttribute.AspectWidth.value;
					height = cameraAttribute.AspectHeight.value;

				}

				var aspect = width / height;

				var fov = 45;
				if ( cameraAttribute.FieldOfView !== undefined ) {

					fov = cameraAttribute.FieldOfView.value;

				}

				var focalLength = cameraAttribute.FocalLength ? cameraAttribute.FocalLength.value : null;

				switch ( type ) {

					case 0: // Perspective
						model = new THREE.PerspectiveCamera( fov, aspect, nearClippingPlane, farClippingPlane );
						if ( focalLength !== null ) model.setFocalLength( focalLength );
						break;

					case 1: // Orthographic
						model = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, nearClippingPlane, farClippingPlane );
						break;

					default:
						console.warn( 'THREE.FBXLoader: Unknown camera type ' + type + '.' );
						model = new THREE.Object3D();
						break;

				}

			}

			return model;

		},

		// Create a THREE.DirectionalLight, THREE.PointLight or THREE.SpotLight
		createLight: function ( relationships ) {

			var model;
			var lightAttribute;

			relationships.children.forEach( function ( child ) {

				var attr = fbxTree.Objects.NodeAttribute[ child.ID ];

				if ( attr !== undefined ) {

					lightAttribute = attr;

				}

			} );

			if ( lightAttribute === undefined ) {

				model = new THREE.Object3D();

			} else {

				var type;

				// LightType can be undefined for Point lights
				if ( lightAttribute.LightType === undefined ) {

					type = 0;

				} else {

					type = lightAttribute.LightType.value;

				}

				var color = 0xffffff;

				if ( lightAttribute.Color !== undefined ) {

					color = new THREE.Color().fromArray( lightAttribute.Color.value );

				}

				var intensity = ( lightAttribute.Intensity === undefined ) ? 1 : lightAttribute.Intensity.value / 100;

				// light disabled
				if ( lightAttribute.CastLightOnObject !== undefined && lightAttribute.CastLightOnObject.value === 0 ) {

					intensity = 0;

				}

				var distance = 0;
				if ( lightAttribute.FarAttenuationEnd !== undefined ) {

					if ( lightAttribute.EnableFarAttenuation !== undefined && lightAttribute.EnableFarAttenuation.value === 0 ) {

						distance = 0;

					} else {

						distance = lightAttribute.FarAttenuationEnd.value;

					}

				}

				// TODO: could this be calculated linearly from FarAttenuationStart to FarAttenuationEnd?
				var decay = 1;

				switch ( type ) {

					case 0: // Point
						model = new THREE.PointLight( color, intensity, distance, decay );
						break;

					case 1: // Directional
						model = new THREE.DirectionalLight( color, intensity );
						break;

					case 2: // Spot
						var angle = Math.PI / 3;

						if ( lightAttribute.InnerAngle !== undefined ) {

							angle = THREE.MathUtils.degToRad( lightAttribute.InnerAngle.value );

						}

						var penumbra = 0;
						if ( lightAttribute.OuterAngle !== undefined ) {

						// TODO: this is not correct - FBX calculates outer and inner angle in degrees
						// with OuterAngle > InnerAngle && OuterAngle <= Math.PI
						// while three.js uses a penumbra between (0, 1) to attenuate the inner angle
							penumbra = THREE.MathUtils.degToRad( lightAttribute.OuterAngle.value );
							penumbra = Math.max( penumbra, 1 );

						}

						model = new THREE.SpotLight( color, intensity, distance, angle, penumbra, decay );
						break;

					default:
						console.warn( 'THREE.FBXLoader: Unknown light type ' + lightAttribute.LightType.value + ', defaulting to a THREE.PointLight.' );
						model = new THREE.PointLight( color, intensity );
						break;

				}

				if ( lightAttribute.CastShadows !== undefined && lightAttribute.CastShadows.value === 1 ) {

					model.castShadow = true;

				}

			}

			return model;

		},

		createMesh: function ( relationships, geometryMap, materialMap ) {

			var model;
			var geometry = null;
			var material = null;
			var materials = [];

			// get geometry and materials(s) from connections
			relationships.children.forEach( function ( child ) {

				if ( geometryMap.has( child.ID ) ) {

					geometry = geometryMap.get( child.ID );

				}

				if ( materialMap.has( child.ID ) ) {

					materials.push( materialMap.get( child.ID ) );

				}

			} );

			if ( materials.length > 1 ) {

				material = materials;

			} else if ( materials.length > 0 ) {

				material = materials[ 0 ];

			} else {

				material = new THREE.MeshPhongMaterial( { color: 0xcccccc } );
				materials.push( material );

			}

			if ( 'color' in geometry.attributes ) {

				materials.forEach( function ( material ) {

					material.vertexColors = THREE.VertexColors;

				} );

			}

			if ( geometry.FBX_Deformer ) {

				materials.forEach( function ( material ) {

					material.skinning = true;

				} );

				model = new THREE.SkinnedMesh( geometry, material );

			} else {

				model = new THREE.Mesh( geometry, material );

			}

			return model;

		},

		createCurve: function ( relationships, geometryMap ) {

			var geometry = relationships.children.reduce( function ( geo, child ) {

				if ( geometryMap.has( child.ID ) ) geo = geometryMap.get( child.ID );

				return geo;

			}, null );

			// FBX does not list materials for Nurbs lines, so we'll just put our own in here.
			var material = new THREE.LineBasicMaterial( { color: 0x3300ff, linewidth: 1 } );
			return new THREE.Line( geometry, material );

		},

		// parse the model node for transform details and apply them to the model
		setModelTransforms: function ( model, modelNode ) {

			var transformData = {};

			if ( 'RotationOrder' in modelNode ) transformData.eulerOrder = parseInt( modelNode.RotationOrder.value );
			if ( 'Lcl_Translation' in modelNode ) transformData.translation = modelNode.Lcl_Translation.value;
			if ( 'RotationOffset' in modelNode ) transformData.rotationOffset = modelNode.RotationOffset.value;
			if ( 'Lcl_Rotation' in modelNode ) transformData.rotation = modelNode.Lcl_Rotation.value;
			if ( 'PreRotation' in modelNode ) transformData.preRotation = modelNode.PreRotation.value;
			if ( 'PostRotation' in modelNode ) transformData.postRotation = modelNode.PostRotation.value;
			if ( 'Lcl_Scaling' in modelNode ) transformData.scale = modelNode.Lcl_Scaling.value;

			var transform = generateTransform( transformData );

			model.applyMatrix( transform );

		},

		setLookAtProperties: function ( model, modelNode ) {

			if ( 'LookAtProperty' in modelNode ) {

				var children = connections.get( model.ID ).children;

				children.forEach( function ( child ) {

					if ( child.relationship === 'LookAtProperty' ) {

						var lookAtTarget = fbxTree.Objects.Model[ child.ID ];

						if ( 'Lcl_Translation' in lookAtTarget ) {

							var pos = lookAtTarget.Lcl_Translation.value;

							// DirectionalLight, SpotLight
							if ( model.target !== undefined ) {

								model.target.position.fromArray( pos );
								sceneGraph.add( model.target );

							} else { // Cameras and other Object3Ds

								model.lookAt( new THREE.Vector3().fromArray( pos ) );

							}

						}

					}

				} );

			}

		},

		bindSkeleton: function ( skeletons, geometryMap, modelMap ) {

			var bindMatrices = this.parsePoseNodes();

			for ( var ID in skeletons ) {

				var skeleton = skeletons[ ID ];

				var parents = connections.get( parseInt( skeleton.ID ) ).parents;

				parents.forEach( function ( parent ) {

					if ( geometryMap.has( parent.ID ) ) {

						var geoID = parent.ID;
						var geoRelationships = connections.get( geoID );

						geoRelationships.parents.forEach( function ( geoConnParent ) {

							if ( modelMap.has( geoConnParent.ID ) ) {

								var model = modelMap.get( geoConnParent.ID );

								model.bind( new THREE.Skeleton( skeleton.bones ), bindMatrices[ geoConnParent.ID ] );

							}

						} );

					}

				} );

			}

		},

		parsePoseNodes: function () {

			var bindMatrices = {};

			if ( 'Pose' in fbxTree.Objects ) {

				var BindPoseNode = fbxTree.Objects.Pose;

				for ( var nodeID in BindPoseNode ) {

					if ( BindPoseNode[ nodeID ].attrType === 'BindPose' ) {

						var poseNodes = BindPoseNode[ nodeID ].PoseNode;

						if ( Array.isArray( poseNodes ) ) {

							poseNodes.forEach( function ( poseNode ) {

								bindMatrices[ poseNode.Node ] = new THREE.Matrix4().fromArray( poseNode.Matrix.a );

							} );

						} else {

							bindMatrices[ poseNodes.Node ] = new THREE.Matrix4().fromArray( poseNodes.Matrix.a );

						}

					}

				}

			}

			return bindMatrices;

		},

		// Parse ambient color in FBXTree.GlobalSettings - if it's not set to black (default), create an ambient light
		createAmbientLight: function () {

			if ( 'GlobalSettings' in fbxTree && 'AmbientColor' in fbxTree.GlobalSettings ) {

				var ambientColor = fbxTree.GlobalSettings.AmbientColor.value;
				var r = ambientColor[ 0 ];
				var g = ambientColor[ 1 ];
				var b = ambientColor[ 2 ];

				if ( r !== 0 || g !== 0 || b !== 0 ) {

					var color = new THREE.Color( r, g, b );
					sceneGraph.add( new THREE.AmbientLight( color, 1 ) );

				}

			}

		},

		setupMorphMaterials: function () {

			sceneGraph.traverse( function ( child ) {

				if ( child.isMesh ) {

					if ( child.geometry.morphAttributes.position || child.geometry.morphAttributes.normal ) {

						var uuid = child.uuid;
						var matUuid = child.material.uuid;

						// if a geometry has morph targets, it cannot share the material with other geometries
						var sharedMat = false;

						sceneGraph.traverse( function ( child ) {

							if ( child.isMesh ) {

								if ( child.material.uuid === matUuid && child.uuid !== uuid ) sharedMat = true;

							}

						} );

						if ( sharedMat === true ) child.material = child.material.clone();

						child.material.morphTargets = true;

					}

				}

			} );

		},

	};

	// parse Geometry data from FBXTree and return map of BufferGeometries
	function GeometryParser() {}

	GeometryParser.prototype = {

		constructor: GeometryParser,

		// Parse nodes in FBXTree.Objects.Geometry
		parse: function ( deformers ) {

			var geometryMap = new Map();

			if ( 'Geometry' in fbxTree.Objects ) {

				var geoNodes = fbxTree.Objects.Geometry;

				for ( var nodeID in geoNodes ) {

					var relationships = connections.get( parseInt( nodeID ) );
					var geo = this.parseGeometry( relationships, geoNodes[ nodeID ], deformers );

					geometryMap.set( parseInt( nodeID ), geo );

				}

			}

			return geometryMap;

		},

		// Parse single node in FBXTree.Objects.Geometry
		parseGeometry: function ( relationships, geoNode, deformers ) {

			switch ( geoNode.attrType ) {

				case 'Mesh':
					return this.parseMeshGeometry( relationships, geoNode, deformers );
					break;

				case 'NurbsCurve':
					return this.parseNurbsGeometry( geoNode );
					break;

			}

		},

		// Parse single node mesh geometry in FBXTree.Objects.Geometry
		parseMeshGeometry: function ( relationships, geoNode, deformers ) {

			var skeletons = deformers.skeletons;
			var morphTargets = deformers.morphTargets;

			var modelNodes = relationships.parents.map( function ( parent ) {

				return fbxTree.Objects.Model[ parent.ID ];

			} );

			// don't create geometry if it is not associated with any models
			if ( modelNodes.length === 0 ) return;

			var skeleton = relationships.children.reduce( function ( skeleton, child ) {

				if ( skeletons[ child.ID ] !== undefined ) skeleton = skeletons[ child.ID ];

				return skeleton;

			}, null );

			var morphTarget = relationships.children.reduce( function ( morphTarget, child ) {

				if ( morphTargets[ child.ID ] !== undefined ) morphTarget = morphTargets[ child.ID ];

				return morphTarget;

			}, null );

			// TODO: if there is more than one model associated with the geometry, AND the models have
			// different geometric transforms, then this will cause problems
			// if ( modelNodes.length > 1 ) { }

			// For now just assume one model and get the preRotations from that
			var modelNode = modelNodes[ 0 ];

			var transformData = {};

			if ( 'RotationOrder' in modelNode ) transformData.eulerOrder = modelNode.RotationOrder.value;
			if ( 'GeometricTranslation' in modelNode ) transformData.translation = modelNode.GeometricTranslation.value;
			if ( 'GeometricRotation' in modelNode ) transformData.rotation = modelNode.GeometricRotation.value;
			if ( 'GeometricScaling' in modelNode ) transformData.scale = modelNode.GeometricScaling.value;

			var transform = generateTransform( transformData );

			return this.genGeometry( geoNode, skeleton, morphTarget, transform );

		},

		// Generate a THREE.BufferGeometry from a node in FBXTree.Objects.Geometry
		genGeometry: function ( geoNode, skeleton, morphTarget, preTransform ) {

			var geo = new THREE.BufferGeometry();
			if ( geoNode.attrName ) geo.name = geoNode.attrName;

			var geoInfo = this.parseGeoNode( geoNode, skeleton );
			var buffers = this.genBuffers( geoInfo );

			var positionAttribute = new THREE.Float32BufferAttribute( buffers.vertex, 3 );

			preTransform.applyToBufferAttribute( positionAttribute );

			geo.addAttribute( 'position', positionAttribute );

			if ( buffers.colors.length > 0 ) {

				geo.addAttribute( 'color', new THREE.Float32BufferAttribute( buffers.colors, 3 ) );

			}

			if ( skeleton ) {

				geo.addAttribute( 'skinIndex', new THREE.Uint16BufferAttribute( buffers.weightsIndices, 4 ) );

				geo.addAttribute( 'skinWeight', new THREE.Float32BufferAttribute( buffers.vertexWeights, 4 ) );

				// used later to bind the skeleton to the model
				geo.FBX_Deformer = skeleton;

			}

			if ( buffers.normal.length > 0 ) {

				var normalAttribute = new THREE.Float32BufferAttribute( buffers.normal, 3 );

				var normalMatrix = new THREE.Matrix3().getNormalMatrix( preTransform );
				normalMatrix.applyToBufferAttribute( normalAttribute );

				geo.addAttribute( 'normal', normalAttribute );

			}

			buffers.uvs.forEach( function ( uvBuffer, i ) {

				// subsequent uv buffers are called 'uv1', 'uv2', ...
				var name = 'uv' + ( i + 1 ).toString();

				// the first uv buffer is just called 'uv'
				if ( i === 0 ) {

					name = 'uv';

				}

				geo.addAttribute( name, new THREE.Float32BufferAttribute( buffers.uvs[ i ], 2 ) );

			} );

			if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

				// Convert the material indices of each vertex into rendering groups on the geometry.
				var prevMaterialIndex = buffers.materialIndex[ 0 ];
				var startIndex = 0;

				buffers.materialIndex.forEach( function ( currentIndex, i ) {

					if ( currentIndex !== prevMaterialIndex ) {

						geo.addGroup( startIndex, i - startIndex, prevMaterialIndex );

						prevMaterialIndex = currentIndex;
						startIndex = i;

					}

				} );

				// the loop above doesn't add the last group, do that here.
				if ( geo.groups.length > 0 ) {

					var lastGroup = geo.groups[ geo.groups.length - 1 ];
					var lastIndex = lastGroup.start + lastGroup.count;

					if ( lastIndex !== buffers.materialIndex.length ) {

						geo.addGroup( lastIndex, buffers.materialIndex.length - lastIndex, prevMaterialIndex );

					}

				}

				// case where there are multiple materials but the whole geometry is only
				// using one of them
				if ( geo.groups.length === 0 ) {

					geo.addGroup( 0, buffers.materialIndex.length, buffers.materialIndex[ 0 ] );

				}

			}

			this.addMorphTargets( geo, geoNode, morphTarget, preTransform );

			return geo;

		},

		parseGeoNode: function ( geoNode, skeleton ) {

			var geoInfo = {};

			geoInfo.vertexPositions = ( geoNode.Vertices !== undefined ) ? geoNode.Vertices.a : [];
			geoInfo.vertexIndices = ( geoNode.PolygonVertexIndex !== undefined ) ? geoNode.PolygonVertexIndex.a : [];

			if ( geoNode.LayerElementColor ) {

				geoInfo.color = this.parseVertexColors( geoNode.LayerElementColor[ 0 ] );

			}

			if ( geoNode.LayerElementMaterial ) {

				geoInfo.material = this.parseMaterialIndices( geoNode.LayerElementMaterial[ 0 ] );

			}

			if ( geoNode.LayerElementNormal ) {

				geoInfo.normal = this.parseNormals( geoNode.LayerElementNormal[ 0 ] );

			}

			if ( geoNode.LayerElementUV ) {

				geoInfo.uv = [];

				var i = 0;
				while ( geoNode.LayerElementUV[ i ] ) {

					geoInfo.uv.push( this.parseUVs( geoNode.LayerElementUV[ i ] ) );
					i ++;

				}

			}

			geoInfo.weightTable = {};

			if ( skeleton !== null ) {

				geoInfo.skeleton = skeleton;

				skeleton.rawBones.forEach( function ( rawBone, i ) {

					// loop over the bone's vertex indices and weights
					rawBone.indices.forEach( function ( index, j ) {

						if ( geoInfo.weightTable[ index ] === undefined ) geoInfo.weightTable[ index ] = [];

						geoInfo.weightTable[ index ].push( {

							id: i,
							weight: rawBone.weights[ j ],

						} );

					} );

				} );

			}

			return geoInfo;

		},

		genBuffers: function ( geoInfo ) {

			var buffers = {
				vertex: [],
				normal: [],
				colors: [],
				uvs: [],
				materialIndex: [],
				vertexWeights: [],
				weightsIndices: [],
			};

			var polygonIndex = 0;
			var faceLength = 0;
			var displayedWeightsWarning = false;

			// these will hold data for a single face
			var facePositionIndexes = [];
			var faceNormals = [];
			var faceColors = [];
			var faceUVs = [];
			var faceWeights = [];
			var faceWeightIndices = [];

			var self = this;
			geoInfo.vertexIndices.forEach( function ( vertexIndex, polygonVertexIndex ) {

				var endOfFace = false;

				// Face index and vertex index arrays are combined in a single array
				// A cube with quad faces looks like this:
				// PolygonVertexIndex: *24 {
				//  a: 0, 1, 3, -3, 2, 3, 5, -5, 4, 5, 7, -7, 6, 7, 1, -1, 1, 7, 5, -4, 6, 0, 2, -5
				//  }
				// Negative numbers mark the end of a face - first face here is 0, 1, 3, -3
				// to find index of last vertex bit shift the index: ^ - 1
				if ( vertexIndex < 0 ) {

					vertexIndex = vertexIndex ^ - 1; // equivalent to ( x * -1 ) - 1
					endOfFace = true;

				}

				var weightIndices = [];
				var weights = [];

				facePositionIndexes.push( vertexIndex * 3, vertexIndex * 3 + 1, vertexIndex * 3 + 2 );

				if ( geoInfo.color ) {

					var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.color );

					faceColors.push( data[ 0 ], data[ 1 ], data[ 2 ] );

				}

				if ( geoInfo.skeleton ) {

					if ( geoInfo.weightTable[ vertexIndex ] !== undefined ) {

						geoInfo.weightTable[ vertexIndex ].forEach( function ( wt ) {

							weights.push( wt.weight );
							weightIndices.push( wt.id );

						} );


					}

					if ( weights.length > 4 ) {

						if ( ! displayedWeightsWarning ) {

							console.warn( 'THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights.' );
							displayedWeightsWarning = true;

						}

						var wIndex = [ 0, 0, 0, 0 ];
						var Weight = [ 0, 0, 0, 0 ];

						weights.forEach( function ( weight, weightIndex ) {

							var currentWeight = weight;
							var currentIndex = weightIndices[ weightIndex ];

							Weight.forEach( function ( comparedWeight, comparedWeightIndex, comparedWeightArray ) {

								if ( currentWeight > comparedWeight ) {

									comparedWeightArray[ comparedWeightIndex ] = currentWeight;
									currentWeight = comparedWeight;

									var tmp = wIndex[ comparedWeightIndex ];
									wIndex[ comparedWeightIndex ] = currentIndex;
									currentIndex = tmp;

								}

							} );

						} );

						weightIndices = wIndex;
						weights = Weight;

					}

					// if the weight array is shorter than 4 pad with 0s
					while ( weights.length < 4 ) {

						weights.push( 0 );
						weightIndices.push( 0 );

					}

					for ( var i = 0; i < 4; ++ i ) {

						faceWeights.push( weights[ i ] );
						faceWeightIndices.push( weightIndices[ i ] );

					}

				}

				if ( geoInfo.normal ) {

					var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.normal );

					faceNormals.push( data[ 0 ], data[ 1 ], data[ 2 ] );

				}

				if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

					var materialIndex = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.material )[ 0 ];

				}

				if ( geoInfo.uv ) {

					geoInfo.uv.forEach( function ( uv, i ) {

						var data = getData( polygonVertexIndex, polygonIndex, vertexIndex, uv );

						if ( faceUVs[ i ] === undefined ) {

							faceUVs[ i ] = [];

						}

						faceUVs[ i ].push( data[ 0 ] );
						faceUVs[ i ].push( data[ 1 ] );

					} );

				}

				faceLength ++;

				if ( endOfFace ) {

					self.genFace( buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength );

					polygonIndex ++;
					faceLength = 0;

					// reset arrays for the next face
					facePositionIndexes = [];
					faceNormals = [];
					faceColors = [];
					faceUVs = [];
					faceWeights = [];
					faceWeightIndices = [];

				}

			} );

			return buffers;

		},

		// Generate data for a single face in a geometry. If the face is a quad then split it into 2 tris
		genFace: function ( buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength ) {

			for ( var i = 2; i < faceLength; i ++ ) {

				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ 0 ] ] );
				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ 1 ] ] );
				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ 2 ] ] );

				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ ( i - 1 ) * 3 ] ] );
				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ ( i - 1 ) * 3 + 1 ] ] );
				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ ( i - 1 ) * 3 + 2 ] ] );

				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i * 3 ] ] );
				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i * 3 + 1 ] ] );
				buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i * 3 + 2 ] ] );

				if ( geoInfo.skeleton ) {

					buffers.vertexWeights.push( faceWeights[ 0 ] );
					buffers.vertexWeights.push( faceWeights[ 1 ] );
					buffers.vertexWeights.push( faceWeights[ 2 ] );
					buffers.vertexWeights.push( faceWeights[ 3 ] );

					buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 ] );
					buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 + 1 ] );
					buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 + 2 ] );
					buffers.vertexWeights.push( faceWeights[ ( i - 1 ) * 4 + 3 ] );

					buffers.vertexWeights.push( faceWeights[ i * 4 ] );
					buffers.vertexWeights.push( faceWeights[ i * 4 + 1 ] );
					buffers.vertexWeights.push( faceWeights[ i * 4 + 2 ] );
					buffers.vertexWeights.push( faceWeights[ i * 4 + 3 ] );

					buffers.weightsIndices.push( faceWeightIndices[ 0 ] );
					buffers.weightsIndices.push( faceWeightIndices[ 1 ] );
					buffers.weightsIndices.push( faceWeightIndices[ 2 ] );
					buffers.weightsIndices.push( faceWeightIndices[ 3 ] );

					buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 ] );
					buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 + 1 ] );
					buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 + 2 ] );
					buffers.weightsIndices.push( faceWeightIndices[ ( i - 1 ) * 4 + 3 ] );

					buffers.weightsIndices.push( faceWeightIndices[ i * 4 ] );
					buffers.weightsIndices.push( faceWeightIndices[ i * 4 + 1 ] );
					buffers.weightsIndices.push( faceWeightIndices[ i * 4 + 2 ] );
					buffers.weightsIndices.push( faceWeightIndices[ i * 4 + 3 ] );

				}

				if ( geoInfo.color ) {

					buffers.colors.push( faceColors[ 0 ] );
					buffers.colors.push( faceColors[ 1 ] );
					buffers.colors.push( faceColors[ 2 ] );

					buffers.colors.push( faceColors[ ( i - 1 ) * 3 ] );
					buffers.colors.push( faceColors[ ( i - 1 ) * 3 + 1 ] );
					buffers.colors.push( faceColors[ ( i - 1 ) * 3 + 2 ] );

					buffers.colors.push( faceColors[ i * 3 ] );
					buffers.colors.push( faceColors[ i * 3 + 1 ] );
					buffers.colors.push( faceColors[ i * 3 + 2 ] );

				}

				if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

					buffers.materialIndex.push( materialIndex );
					buffers.materialIndex.push( materialIndex );
					buffers.materialIndex.push( materialIndex );

				}

				if ( geoInfo.normal ) {

					buffers.normal.push( faceNormals[ 0 ] );
					buffers.normal.push( faceNormals[ 1 ] );
					buffers.normal.push( faceNormals[ 2 ] );

					buffers.normal.push( faceNormals[ ( i - 1 ) * 3 ] );
					buffers.normal.push( faceNormals[ ( i - 1 ) * 3 + 1 ] );
					buffers.normal.push( faceNormals[ ( i - 1 ) * 3 + 2 ] );

					buffers.normal.push( faceNormals[ i * 3 ] );
					buffers.normal.push( faceNormals[ i * 3 + 1 ] );
					buffers.normal.push( faceNormals[ i * 3 + 2 ] );

				}

				if ( geoInfo.uv ) {

					geoInfo.uv.forEach( function ( uv, j ) {

						if ( buffers.uvs[ j ] === undefined ) buffers.uvs[ j ] = [];

						buffers.uvs[ j ].push( faceUVs[ j ][ 0 ] );
						buffers.uvs[ j ].push( faceUVs[ j ][ 1 ] );

						buffers.uvs[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 ] );
						buffers.uvs[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 + 1 ] );

						buffers.uvs[ j ].push( faceUVs[ j ][ i * 2 ] );
						buffers.uvs[ j ].push( faceUVs[ j ][ i * 2 + 1 ] );

					} );

				}

			}

		},

		addMorphTargets: function ( parentGeo, parentGeoNode, morphTarget, preTransform ) {

			if ( morphTarget === null ) return;

			parentGeo.morphAttributes.position = [];
			parentGeo.morphAttributes.normal = [];

			var self = this;
			morphTarget.rawTargets.forEach( function ( rawTarget ) {

				var morphGeoNode = fbxTree.Objects.Geometry[ rawTarget.geoID ];

				if ( morphGeoNode !== undefined ) {

					self.genMorphGeometry( parentGeo, parentGeoNode, morphGeoNode, preTransform );

				}

			} );

		},

		// a morph geometry node is similar to a standard  node, and the node is also contained
		// in FBXTree.Objects.Geometry, however it can only have attributes for position, normal
		// and a special attribute Index defining which vertices of the original geometry are affected
		// Normal and position attributes only have data for the vertices that are affected by the morph
		genMorphGeometry: function ( parentGeo, parentGeoNode, morphGeoNode, preTransform ) {

			var morphGeo = new THREE.BufferGeometry();
			if ( morphGeoNode.attrName ) morphGeo.name = morphGeoNode.attrName;

			var vertexIndices = ( parentGeoNode.PolygonVertexIndex !== undefined ) ? parentGeoNode.PolygonVertexIndex.a : [];

			// make a copy of the parent's vertex positions
			var vertexPositions = ( parentGeoNode.Vertices !== undefined ) ? parentGeoNode.Vertices.a.slice() : [];

			var morphPositions = ( morphGeoNode.Vertices !== undefined ) ? morphGeoNode.Vertices.a : [];
			var indices = ( morphGeoNode.Indexes !== undefined ) ? morphGeoNode.Indexes.a : [];

			for ( var i = 0; i < indices.length; i ++ ) {

				var morphIndex = indices[ i ] * 3;

				// FBX format uses blend shapes rather than morph targets. This can be converted
				// by additively combining the blend shape positions with the original geometry's positions
				vertexPositions[ morphIndex ] += morphPositions[ i * 3 ];
				vertexPositions[ morphIndex + 1 ] += morphPositions[ i * 3 + 1 ];
				vertexPositions[ morphIndex + 2 ] += morphPositions[ i * 3 + 2 ];

			}

			// TODO: add morph normal support
			var morphGeoInfo = {
				vertexIndices: vertexIndices,
				vertexPositions: vertexPositions,
			};

			var morphBuffers = this.genBuffers( morphGeoInfo );

			var positionAttribute = new THREE.Float32BufferAttribute( morphBuffers.vertex, 3 );
			positionAttribute.name = morphGeoNode.attrName;

			preTransform.applyToBufferAttribute( positionAttribute );

			parentGeo.morphAttributes.position.push( positionAttribute );

		},

		// Parse normal from FBXTree.Objects.Geometry.LayerElementNormal if it exists
		parseNormals: function ( NormalNode ) {

			var mappingType = NormalNode.MappingInformationType;
			var referenceType = NormalNode.ReferenceInformationType;
			var buffer = NormalNode.Normals.a;
			var indexBuffer = [];
			if ( referenceType === 'IndexToDirect' ) {

				if ( 'NormalIndex' in NormalNode ) {

					indexBuffer = NormalNode.NormalIndex.a;

				} else if ( 'NormalsIndex' in NormalNode ) {

					indexBuffer = NormalNode.NormalsIndex.a;

				}

			}

			return {
				dataSize: 3,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		},

		// Parse UVs from FBXTree.Objects.Geometry.LayerElementUV if it exists
		parseUVs: function ( UVNode ) {

			var mappingType = UVNode.MappingInformationType;
			var referenceType = UVNode.ReferenceInformationType;
			var buffer = UVNode.UV.a;
			var indexBuffer = [];
			if ( referenceType === 'IndexToDirect' ) {

				indexBuffer = UVNode.UVIndex.a;

			}

			return {
				dataSize: 2,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		},

		// Parse Vertex Colors from FBXTree.Objects.Geometry.LayerElementColor if it exists
		parseVertexColors: function ( ColorNode ) {

			var mappingType = ColorNode.MappingInformationType;
			var referenceType = ColorNode.ReferenceInformationType;
			var buffer = ColorNode.Colors.a;
			var indexBuffer = [];
			if ( referenceType === 'IndexToDirect' ) {

				indexBuffer = ColorNode.ColorIndex.a;

			}

			return {
				dataSize: 4,
				buffer: buffer,
				indices: indexBuffer,
				mappingType: mappingType,
				referenceType: referenceType
			};

		},

		// Parse mapping and material data in FBXTree.Objects.Geometry.LayerElementMaterial if it exists
		parseMaterialIndices: function ( MaterialNode ) {

			var mappingType = MaterialNode.MappingInformationType;
			var referenceType = MaterialNode.ReferenceInformationType;

			if ( mappingType === 'NoMappingInformation' ) {

				return {
					dataSize: 1,
					buffer: [ 0 ],
					indices: [ 0 ],
					mappingType: 'AllSame',
					referenceType: referenceType
				};

			}

			var materialIndexBuffer = MaterialNode.Materials.a;

			// Since materials are stored as indices, there's a bit of a mismatch between FBX and what
			// we expect.So we create an intermediate buffer that points to the index in the buffer,
			// for conforming with the other functions we've written for other data.
			var materialIndices = [];

			for ( var i = 0; i < materialIndexBuffer.length; ++ i ) {

				materialIndices.push( i );

			}

			return {
				dataSize: 1,
				buffer: materialIndexBuffer,
				indices: materialIndices,
				mappingType: mappingType,
				referenceType: referenceType
			};

		},

		// Generate a NurbGeometry from a node in FBXTree.Objects.Geometry
		parseNurbsGeometry: function ( geoNode ) {

			if ( THREE.NURBSCurve === undefined ) {

				console.error( 'THREE.FBXLoader: The loader relies on THREE.NURBSCurve for any nurbs present in the model. Nurbs will show up as empty geometry.' );
				return new THREE.BufferGeometry();

			}

			var order = parseInt( geoNode.Order );

			if ( isNaN( order ) ) {

				console.error( 'THREE.FBXLoader: Invalid Order %s given for geometry ID: %s', geoNode.Order, geoNode.id );
				return new THREE.BufferGeometry();

			}

			var degree = order - 1;

			var knots = geoNode.KnotVector.a;
			var controlPoints = [];
			var pointsValues = geoNode.Points.a;

			for ( var i = 0, l = pointsValues.length; i < l; i += 4 ) {

				controlPoints.push( new THREE.Vector4().fromArray( pointsValues, i ) );

			}

			var startKnot, endKnot;

			if ( geoNode.Form === 'Closed' ) {

				controlPoints.push( controlPoints[ 0 ] );

			} else if ( geoNode.Form === 'Periodic' ) {

				startKnot = degree;
				endKnot = knots.length - 1 - startKnot;

				for ( var i = 0; i < degree; ++ i ) {

					controlPoints.push( controlPoints[ i ] );

				}

			}

			var curve = new THREE.NURBSCurve( degree, knots, controlPoints, startKnot, endKnot );
			var vertices = curve.getPoints( controlPoints.length * 7 );

			var positions = new Float32Array( vertices.length * 3 );

			vertices.forEach( function ( vertex, i ) {

				vertex.toArray( positions, i * 3 );

			} );

			var geometry = new THREE.BufferGeometry();
			geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );

			return geometry;

		},

	};

	// parse animation data from FBXTree
	function AnimationParser() {}

	AnimationParser.prototype = {

		constructor: AnimationParser,

		// take raw animation clips and turn them into three.js animation clips
		parse: function () {

			var animationClips = [];


			var rawClips = this.parseClips();

			if ( rawClips === undefined ) return animationClips;

			for ( var key in rawClips ) {

				var rawClip = rawClips[ key ];

				var clip = this.addClip( rawClip );

				animationClips.push( clip );

			}

			return animationClips;

		},

		parseClips: function () {

			// since the actual transformation data is stored in FBXTree.Objects.AnimationCurve,
			// if this is undefined we can safely assume there are no animations
			if ( fbxTree.Objects.AnimationCurve === undefined ) return undefined;

			var curveNodesMap = this.parseAnimationCurveNodes();

			this.parseAnimationCurves( curveNodesMap );

			var layersMap = this.parseAnimationLayers( curveNodesMap );
			var rawClips = this.parseAnimStacks( layersMap );

			return rawClips;

		},

		// parse nodes in FBXTree.Objects.AnimationCurveNode
		// each AnimationCurveNode holds data for an animation transform for a model (e.g. left arm rotation )
		// and is referenced by an AnimationLayer
		parseAnimationCurveNodes: function () {

			var rawCurveNodes = fbxTree.Objects.AnimationCurveNode;

			var curveNodesMap = new Map();

			for ( var nodeID in rawCurveNodes ) {

				var rawCurveNode = rawCurveNodes[ nodeID ];

				if ( rawCurveNode.attrName.match( /S|R|T|DeformPercent/ ) !== null ) {

					var curveNode = {

						id: rawCurveNode.id,
						attr: rawCurveNode.attrName,
						curves: {},

					};

					curveNodesMap.set( curveNode.id, curveNode );

				}

			}

			return curveNodesMap;

		},

		// parse nodes in FBXTree.Objects.AnimationCurve and connect them up to
		// previously parsed AnimationCurveNodes. Each AnimationCurve holds data for a single animated
		// axis ( e.g. times and values of x rotation)
		parseAnimationCurves: function ( curveNodesMap ) {

			var rawCurves = fbxTree.Objects.AnimationCurve;

			// TODO: Many values are identical up to roundoff error, but won't be optimised
			// e.g. position times: [0, 0.4, 0. 8]
			// position values: [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.235384487103147e-7, 93.67520904541016, -0.9982695579528809]
			// clearly, this should be optimised to
			// times: [0], positions [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809]
			// this shows up in nearly every FBX file, and generally time array is length > 100

			for ( var nodeID in rawCurves ) {

				var animationCurve = {

					id: rawCurves[ nodeID ].id,
					times: rawCurves[ nodeID ].KeyTime.a.map( convertFBXTimeToSeconds ),
					values: rawCurves[ nodeID ].KeyValueFloat.a,

				};

				var relationships = connections.get( animationCurve.id );

				if ( relationships !== undefined ) {

					var animationCurveID = relationships.parents[ 0 ].ID;
					var animationCurveRelationship = relationships.parents[ 0 ].relationship;

					if ( animationCurveRelationship.match( /X/ ) ) {

						curveNodesMap.get( animationCurveID ).curves[ 'x' ] = animationCurve;

					} else if ( animationCurveRelationship.match( /Y/ ) ) {

						curveNodesMap.get( animationCurveID ).curves[ 'y' ] = animationCurve;

					} else if ( animationCurveRelationship.match( /Z/ ) ) {

						curveNodesMap.get( animationCurveID ).curves[ 'z' ] = animationCurve;

					} else if ( animationCurveRelationship.match( /d|DeformPercent/ ) && curveNodesMap.has( animationCurveID ) ) {

						curveNodesMap.get( animationCurveID ).curves[ 'morph' ] = animationCurve;

					}

				}

			}

		},

		// parse nodes in FBXTree.Objects.AnimationLayer. Each layers holds references
		// to various AnimationCurveNodes and is referenced by an AnimationStack node
		// note: theoretically a stack can have multiple layers, however in practice there always seems to be one per stack
		parseAnimationLayers: function ( curveNodesMap ) {

			var rawLayers = fbxTree.Objects.AnimationLayer;

			var layersMap = new Map();

			for ( var nodeID in rawLayers ) {

				var layerCurveNodes = [];

				var connection = connections.get( parseInt( nodeID ) );

				if ( connection !== undefined ) {

					// all the animationCurveNodes used in the layer
					var children = connection.children;

					var self = this;
					children.forEach( function ( child, i ) {

						if ( curveNodesMap.has( child.ID ) ) {

							var curveNode = curveNodesMap.get( child.ID );

							// check that the curves are defined for at least one axis, otherwise ignore the curveNode
							if ( curveNode.curves.x !== undefined || curveNode.curves.y !== undefined || curveNode.curves.z !== undefined ) {

								if ( layerCurveNodes[ i ] === undefined ) {

									var modelID;

									connections.get( child.ID ).parents.forEach( function ( parent ) {

										if ( parent.relationship !== undefined ) modelID = parent.ID;

									} );

									var rawModel = fbxTree.Objects.Model[ modelID.toString() ];

									var node = {

										modelName: THREE.PropertyBinding.sanitizeNodeName( rawModel.attrName ),
										initialPosition: [ 0, 0, 0 ],
										initialRotation: [ 0, 0, 0 ],
										initialScale: [ 1, 1, 1 ],
										transform: self.getModelAnimTransform( rawModel ),

									};

									// if the animated model is pre rotated, we'll have to apply the pre rotations to every
									// animation value as well
									if ( 'PreRotation' in rawModel ) node.preRotations = rawModel.PreRotation.value;
									if ( 'PostRotation' in rawModel ) node.postRotations = rawModel.PostRotation.value;

									layerCurveNodes[ i ] = node;

								}

								layerCurveNodes[ i ][ curveNode.attr ] = curveNode;

							} else if ( curveNode.curves.morph !== undefined ) {

								if ( layerCurveNodes[ i ] === undefined ) {

									var deformerID;

									connections.get( child.ID ).parents.forEach( function ( parent ) {

										if ( parent.relationship !== undefined ) deformerID = parent.ID;

									} );

									var morpherID = connections.get( deformerID ).parents[ 0 ].ID;
									var geoID = connections.get( morpherID ).parents[ 0 ].ID;

									// assuming geometry is not used in more than one model
									var modelID = connections.get( geoID ).parents[ 0 ].ID;

									var rawModel = fbxTree.Objects.Model[ modelID ];

									var node = {

										modelName: THREE.PropertyBinding.sanitizeNodeName( rawModel.attrName ),
										morphName: fbxTree.Objects.Deformer[ deformerID ].attrName,

									};

									layerCurveNodes[ i ] = node;

								}

								layerCurveNodes[ i ][ curveNode.attr ] = curveNode;

							}

						}

					} );

					layersMap.set( parseInt( nodeID ), layerCurveNodes );

				}

			}

			return layersMap;

		},

		getModelAnimTransform: function ( modelNode ) {

			var transformData = {};

			if ( 'RotationOrder' in modelNode ) transformData.eulerOrder = parseInt( modelNode.RotationOrder.value );

			if ( 'Lcl_Translation' in modelNode ) transformData.translation = modelNode.Lcl_Translation.value;
			if ( 'RotationOffset' in modelNode ) transformData.rotationOffset = modelNode.RotationOffset.value;

			if ( 'Lcl_Rotation' in modelNode ) transformData.rotation = modelNode.Lcl_Rotation.value;
			if ( 'PreRotation' in modelNode ) transformData.preRotation = modelNode.PreRotation.value;

			if ( 'PostRotation' in modelNode ) transformData.postRotation = modelNode.PostRotation.value;

			if ( 'Lcl_Scaling' in modelNode ) transformData.scale = modelNode.Lcl_Scaling.value;

			return generateTransform( transformData );

		},

		// parse nodes in FBXTree.Objects.AnimationStack. These are the top level node in the animation
		// hierarchy. Each Stack node will be used to create a THREE.AnimationClip
		parseAnimStacks: function ( layersMap ) {

			var rawStacks = fbxTree.Objects.AnimationStack;

			// connect the stacks (clips) up to the layers
			var rawClips = {};

			for ( var nodeID in rawStacks ) {

				var children = connections.get( parseInt( nodeID ) ).children;

				if ( children.length > 1 ) {

					// it seems like stacks will always be associated with a single layer. But just in case there are files
					// where there are multiple layers per stack, we'll display a warning
					console.warn( 'THREE.FBXLoader: Encountered an animation stack with multiple layers, this is currently not supported. Ignoring subsequent layers.' );

				}

				var layer = layersMap.get( children[ 0 ].ID );

				rawClips[ nodeID ] = {

					name: rawStacks[ nodeID ].attrName,
					layer: layer,

				};

			}

			return rawClips;

		},

		addClip: function ( rawClip ) {

			var tracks = [];

			var self = this;
			rawClip.layer.forEach( function ( rawTracks ) {

				tracks = tracks.concat( self.generateTracks( rawTracks ) );

			} );

			return new THREE.AnimationClip( rawClip.name, - 1, tracks );

		},

		generateTracks: function ( rawTracks ) {

			var tracks = [];

			var initialPosition = new THREE.Vector3();
			var initialRotation = new THREE.Quaternion();
			var initialScale = new THREE.Vector3();

			if ( rawTracks.transform ) rawTracks.transform.decompose( initialPosition, initialRotation, initialScale );

			initialPosition = initialPosition.toArray();
			initialRotation = new THREE.Euler().setFromQuaternion( initialRotation ).toArray(); // todo: euler order
			initialScale = initialScale.toArray();

			if ( rawTracks.T !== undefined && Object.keys( rawTracks.T.curves ).length > 0 ) {

				var positionTrack = this.generateVectorTrack( rawTracks.modelName, rawTracks.T.curves, initialPosition, 'position' );
				if ( positionTrack !== undefined ) tracks.push( positionTrack );

			}

			if ( rawTracks.R !== undefined && Object.keys( rawTracks.R.curves ).length > 0 ) {

				var rotationTrack = this.generateRotationTrack( rawTracks.modelName, rawTracks.R.curves, initialRotation, rawTracks.preRotations, rawTracks.postRotations );
				if ( rotationTrack !== undefined ) tracks.push( rotationTrack );

			}

			if ( rawTracks.S !== undefined && Object.keys( rawTracks.S.curves ).length > 0 ) {

				var scaleTrack = this.generateVectorTrack( rawTracks.modelName, rawTracks.S.curves, initialScale, 'scale' );
				if ( scaleTrack !== undefined ) tracks.push( scaleTrack );

			}

			if ( rawTracks.DeformPercent !== undefined ) {

				var morphTrack = this.generateMorphTrack( rawTracks );
				if ( morphTrack !== undefined ) tracks.push( morphTrack );

			}

			return tracks;

		},

		generateVectorTrack: function ( modelName, curves, initialValue, type ) {

			var times = this.getTimesForAllAxes( curves );
			var values = this.getKeyframeTrackValues( times, curves, initialValue );

			return new THREE.VectorKeyframeTrack( modelName + '.' + type, times, values );

		},

		generateRotationTrack: function ( modelName, curves, initialValue, preRotations, postRotations ) {

			if ( curves.x !== undefined ) {

				this.interpolateRotations( curves.x );
				curves.x.values = curves.x.values.map( THREE.MathUtils.degToRad );

			}
			if ( curves.y !== undefined ) {

				this.interpolateRotations( curves.y );
				curves.y.values = curves.y.values.map( THREE.MathUtils.degToRad );

			}
			if ( curves.z !== undefined ) {

				this.interpolateRotations( curves.z );
				curves.z.values = curves.z.values.map( THREE.MathUtils.degToRad );

			}

			var times = this.getTimesForAllAxes( curves );
			var values = this.getKeyframeTrackValues( times, curves, initialValue );

			if ( preRotations !== undefined ) {

				preRotations = preRotations.map( THREE.MathUtils.degToRad );
				preRotations.push( 'ZYX' );

				preRotations = new THREE.Euler().fromArray( preRotations );
				preRotations = new THREE.Quaternion().setFromEuler( preRotations );

			}

			if ( postRotations !== undefined ) {

				postRotations = postRotations.map( THREE.MathUtils.degToRad );
				postRotations.push( 'ZYX' );

				postRotations = new THREE.Euler().fromArray( postRotations );
				postRotations = new THREE.Quaternion().setFromEuler( postRotations ).inverse();

			}

			var quaternion = new THREE.Quaternion();
			var euler = new THREE.Euler();

			var quaternionValues = [];

			for ( var i = 0; i < values.length; i += 3 ) {

				euler.set( values[ i ], values[ i + 1 ], values[ i + 2 ], 'ZYX' );

				quaternion.setFromEuler( euler );

				if ( preRotations !== undefined ) quaternion.premultiply( preRotations );
				if ( postRotations !== undefined ) quaternion.multiply( postRotations );

				quaternion.toArray( quaternionValues, ( i / 3 ) * 4 );

			}

			return new THREE.QuaternionKeyframeTrack( modelName + '.quaternion', times, quaternionValues );

		},

		generateMorphTrack: function ( rawTracks ) {

			var curves = rawTracks.DeformPercent.curves.morph;
			var values = curves.values.map( function ( val ) {

				return val / 100;

			} );

			var morphNum = sceneGraph.getObjectByName( rawTracks.modelName ).morphTargetDictionary[ rawTracks.morphName ];

			return new THREE.NumberKeyframeTrack( rawTracks.modelName + '.morphTargetInfluences[' + morphNum + ']', curves.times, values );

		},

		// For all animated objects, times are defined separately for each axis
		// Here we'll combine the times into one sorted array without duplicates
		getTimesForAllAxes: function ( curves ) {

			var times = [];

			// first join together the times for each axis, if defined
			if ( curves.x !== undefined ) times = times.concat( curves.x.times );
			if ( curves.y !== undefined ) times = times.concat( curves.y.times );
			if ( curves.z !== undefined ) times = times.concat( curves.z.times );

			// then sort them and remove duplicates
			times = times.sort( function ( a, b ) {

				return a - b;

			} ).filter( function ( elem, index, array ) {

				return array.indexOf( elem ) == index;

			} );

			return times;

		},

		getKeyframeTrackValues: function ( times, curves, initialValue ) {

			var prevValue = initialValue;

			var values = [];

			var xIndex = - 1;
			var yIndex = - 1;
			var zIndex = - 1;

			times.forEach( function ( time ) {

				if ( curves.x ) xIndex = curves.x.times.indexOf( time );
				if ( curves.y ) yIndex = curves.y.times.indexOf( time );
				if ( curves.z ) zIndex = curves.z.times.indexOf( time );

				// if there is an x value defined for this frame, use that
				if ( xIndex !== - 1 ) {

					var xValue = curves.x.values[ xIndex ];
					values.push( xValue );
					prevValue[ 0 ] = xValue;

				} else {

					// otherwise use the x value from the previous frame
					values.push( prevValue[ 0 ] );

				}

				if ( yIndex !== - 1 ) {

					var yValue = curves.y.values[ yIndex ];
					values.push( yValue );
					prevValue[ 1 ] = yValue;

				} else {

					values.push( prevValue[ 1 ] );

				}

				if ( zIndex !== - 1 ) {

					var zValue = curves.z.values[ zIndex ];
					values.push( zValue );
					prevValue[ 2 ] = zValue;

				} else {

					values.push( prevValue[ 2 ] );

				}

			} );

			return values;

		},

		// Rotations are defined as Euler angles which can have values  of any size
		// These will be converted to quaternions which don't support values greater than
		// PI, so we'll interpolate large rotations
		interpolateRotations: function ( curve ) {

			for ( var i = 1; i < curve.values.length; i ++ ) {

				var initialValue = curve.values[ i - 1 ];
				var valuesSpan = curve.values[ i ] - initialValue;

				var absoluteSpan = Math.abs( valuesSpan );

				if ( absoluteSpan >= 180 ) {

					var numSubIntervals = absoluteSpan / 180;

					var step = valuesSpan / numSubIntervals;
					var nextValue = initialValue + step;

					var initialTime = curve.times[ i - 1 ];
					var timeSpan = curve.times[ i ] - initialTime;
					var interval = timeSpan / numSubIntervals;
					var nextTime = initialTime + interval;

					var interpolatedTimes = [];
					var interpolatedValues = [];

					while ( nextTime < curve.times[ i ] ) {

						interpolatedTimes.push( nextTime );
						nextTime += interval;

						interpolatedValues.push( nextValue );
						nextValue += step;

					}

					curve.times = inject( curve.times, i, interpolatedTimes );
					curve.values = inject( curve.values, i, interpolatedValues );

				}

			}

		},

	};

	// parse an FBX file in ASCII format
	function TextParser() {}

	TextParser.prototype = {

		constructor: TextParser,

		getPrevNode: function () {

			return this.nodeStack[ this.currentIndent - 2 ];

		},

		getCurrentNode: function () {

			return this.nodeStack[ this.currentIndent - 1 ];

		},

		getCurrentProp: function () {

			return this.currentProp;

		},

		pushStack: function ( node ) {

			this.nodeStack.push( node );
			this.currentIndent += 1;

		},

		popStack: function () {

			this.nodeStack.pop();
			this.currentIndent -= 1;

		},

		setCurrentProp: function ( val, name ) {

			this.currentProp = val;
			this.currentPropName = name;

		},

		parse: function ( text ) {

			this.currentIndent = 0;
			console.log("FBXTree: ", FBXTree);
			this.allNodes = new FBXTree();
			this.nodeStack = [];
			this.currentProp = [];
			this.currentPropName = '';

			var self = this;

			var split = text.split( /[\r\n]+/ );

			split.forEach( function ( line, i ) {

				var matchComment = line.match( /^[\s\t]*;/ );
				var matchEmpty = line.match( /^[\s\t]*$/ );

				if ( matchComment || matchEmpty ) return;

				var matchBeginning = line.match( '^\\t{' + self.currentIndent + '}(\\w+):(.*){', '' );
				var matchProperty = line.match( '^\\t{' + ( self.currentIndent ) + '}(\\w+):[\\s\\t\\r\\n](.*)' );
				var matchEnd = line.match( '^\\t{' + ( self.currentIndent - 1 ) + '}}' );

				if ( matchBeginning ) {

					self.parseNodeBegin( line, matchBeginning );

				} else if ( matchProperty ) {

					self.parseNodeProperty( line, matchProperty, split[ ++ i ] );

				} else if ( matchEnd ) {

					self.popStack();

				} else if ( line.match( /^[^\s\t}]/ ) ) {

					// large arrays are split over multiple lines terminated with a ',' character
					// if this is encountered the line needs to be joined to the previous line
					self.parseNodePropertyContinued( line );

				}

			} );

			return this.allNodes;

		},

		parseNodeBegin: function ( line, property ) {

			var nodeName = property[ 1 ].trim().replace( /^"/, '' ).replace( /"$/, '' );

			var nodeAttrs = property[ 2 ].split( ',' ).map( function ( attr ) {

				return attr.trim().replace( /^"/, '' ).replace( /"$/, '' );

			} );

			var node = { name: nodeName };
			var attrs = this.parseNodeAttr( nodeAttrs );

			var currentNode = this.getCurrentNode();

			// a top node
			if ( this.currentIndent === 0 ) {

				this.allNodes.add( nodeName, node );

			} else { // a subnode

				// if the subnode already exists, append it
				if ( nodeName in currentNode ) {

				// special case Pose needs PoseNodes as an array
					if ( nodeName === 'PoseNode' ) {

						currentNode.PoseNode.push( node );

					} else if ( currentNode[ nodeName ].id !== undefined ) {

						currentNode[ nodeName ] = {};
						currentNode[ nodeName ][ currentNode[ nodeName ].id ] = currentNode[ nodeName ];

					}

					if ( attrs.id !== '' ) currentNode[ nodeName ][ attrs.id ] = node;

				} else if ( typeof attrs.id === 'number' ) {

					currentNode[ nodeName ] = {};
					currentNode[ nodeName ][ attrs.id ] = node;

				} else if ( nodeName !== 'Properties70' ) {

					if ( nodeName === 'PoseNode' )	currentNode[ nodeName ] = [ node ];
					else currentNode[ nodeName ] = node;

				}

			}

			if ( typeof attrs.id === 'number' ) node.id = attrs.id;
			if ( attrs.name !== '' ) node.attrName = attrs.name;
			if ( attrs.type !== '' ) node.attrType = attrs.type;

			this.pushStack( node );

		},

		parseNodeAttr: function ( attrs ) {

			var id = attrs[ 0 ];

			if ( attrs[ 0 ] !== '' ) {

				id = parseInt( attrs[ 0 ] );

				if ( isNaN( id ) ) {

					id = attrs[ 0 ];

				}

			}

			var name = '', type = '';

			if ( attrs.length > 1 ) {

				name = attrs[ 1 ].replace( /^(\w+)::/, '' );
				type = attrs[ 2 ];

			}

			return { id: id, name: name, type: type };

		},

		parseNodeProperty: function ( line, property, contentLine ) {

			var propName = property[ 1 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();
			var propValue = property[ 2 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();

			// for special case: base64 image data follows "Content: ," line
			//	Content: ,
			//	 "/9j/4RDaRXhpZgAATU0A..."
			if ( propName === 'Content' && propValue === ',' ) {

				propValue = contentLine.replace( /"/g, '' ).replace( /,$/, '' ).trim();

			}

			var currentNode = this.getCurrentNode();
			var parentName = currentNode.name;

			if ( parentName === 'Properties70' ) {

				this.parseNodeSpecialProperty( line, propName, propValue );
				return;

			}

			// Connections
			if ( propName === 'C' ) {

				var connProps = propValue.split( ',' ).slice( 1 );
				var from = parseInt( connProps[ 0 ] );
				var to = parseInt( connProps[ 1 ] );

				var rest = propValue.split( ',' ).slice( 3 );

				rest = rest.map( function ( elem ) {

					return elem.trim().replace( /^"/, '' );

				} );

				propName = 'connections';
				propValue = [ from, to ];
				append( propValue, rest );

				if ( currentNode[ propName ] === undefined ) {

					currentNode[ propName ] = [];

				}

			}

			// Node
			if ( propName === 'Node' ) currentNode.id = propValue;

			// connections
			if ( propName in currentNode && Array.isArray( currentNode[ propName ] ) ) {

				currentNode[ propName ].push( propValue );

			} else {

				if ( propName !== 'a' ) currentNode[ propName ] = propValue;
				else currentNode.a = propValue;

			}

			this.setCurrentProp( currentNode, propName );

			// convert string to array, unless it ends in ',' in which case more will be added to it
			if ( propName === 'a' && propValue.slice( - 1 ) !== ',' ) {

				currentNode.a = parseNumberArray( propValue );

			}

		},

		parseNodePropertyContinued: function ( line ) {

			var currentNode = this.getCurrentNode();

			currentNode.a += line;

			// if the line doesn't end in ',' we have reached the end of the property value
			// so convert the string to an array
			if ( line.slice( - 1 ) !== ',' ) {

				currentNode.a = parseNumberArray( currentNode.a );

			}

		},

		// parse "Property70"
		parseNodeSpecialProperty: function ( line, propName, propValue ) {

			// split this
			// P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
			// into array like below
			// ["Lcl Scaling", "Lcl Scaling", "", "A", "1,1,1" ]
			var props = propValue.split( '",' ).map( function ( prop ) {

				return prop.trim().replace( /^\"/, '' ).replace( /\s/, '_' );

			} );

			var innerPropName = props[ 0 ];
			var innerPropType1 = props[ 1 ];
			var innerPropType2 = props[ 2 ];
			var innerPropFlag = props[ 3 ];
			var innerPropValue = props[ 4 ];

			// cast values where needed, otherwise leave as strings
			switch ( innerPropType1 ) {

				case 'int':
				case 'enum':
				case 'bool':
				case 'ULongLong':
				case 'double':
				case 'Number':
				case 'FieldOfView':
					innerPropValue = parseFloat( innerPropValue );
					break;

				case 'Color':
				case 'ColorRGB':
				case 'Vector3D':
				case 'Lcl_Translation':
				case 'Lcl_Rotation':
				case 'Lcl_Scaling':
					innerPropValue = parseNumberArray( innerPropValue );
					break;

			}

			// CAUTION: these props must append to parent's parent
			this.getPrevNode()[ innerPropName ] = {

				'type': innerPropType1,
				'type2': innerPropType2,
				'flag': innerPropFlag,
				'value': innerPropValue

			};

			this.setCurrentProp( this.getPrevNode(), innerPropName );

		},

	};

	// Parse an FBX file in Binary format
	function BinaryParser() {}

	BinaryParser.prototype = {

		constructor: BinaryParser,

		parse: function ( buffer ) {

			var reader = new BinaryReader( buffer );
			reader.skip( 23 ); // skip magic 23 bytes

			var version = reader.getUint32();

			console.log( 'THREE.FBXLoader: FBX binary version: ' + version );

			var allNodes = new FBXTree();

			while ( ! this.endOfContent( reader ) ) {

				var node = this.parseNode( reader, version );
				if ( node !== null ) allNodes.add( node.name, node );

			}

			return allNodes;

		},

		// Check if reader has reached the end of content.
		endOfContent: function ( reader ) {

			// footer size: 160bytes + 16-byte alignment padding
			// - 16bytes: magic
			// - padding til 16-byte alignment (at least 1byte?)
			//	(seems like some exporters embed fixed 15 or 16bytes?)
			// - 4bytes: magic
			// - 4bytes: version
			// - 120bytes: zero
			// - 16bytes: magic
			if ( reader.size() % 16 === 0 ) {

				return ( ( reader.getOffset() + 160 + 16 ) & ~ 0xf ) >= reader.size();

			} else {

				return reader.getOffset() + 160 + 16 >= reader.size();

			}

		},

		// recursively parse nodes until the end of the file is reached
		parseNode: function ( reader, version ) {

			var node = {};

			// The first three data sizes depends on version.
			var endOffset = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();
			var numProperties = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();

			// note: do not remove this even if you get a linter warning as it moves the buffer forward
			var propertyListLen = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();

			var nameLen = reader.getUint8();
			var name = reader.getString( nameLen );

			// Regards this node as NULL-record if endOffset is zero
			if ( endOffset === 0 ) return null;

			var propertyList = [];

			for ( var i = 0; i < numProperties; i ++ ) {

				propertyList.push( this.parseProperty( reader ) );

			}

			// Regards the first three elements in propertyList as id, attrName, and attrType
			var id = propertyList.length > 0 ? propertyList[ 0 ] : '';
			var attrName = propertyList.length > 1 ? propertyList[ 1 ] : '';
			var attrType = propertyList.length > 2 ? propertyList[ 2 ] : '';

			// check if this node represents just a single property
			// like (name, 0) set or (name2, [0, 1, 2]) set of {name: 0, name2: [0, 1, 2]}
			node.singleProperty = ( numProperties === 1 && reader.getOffset() === endOffset ) ? true : false;

			while ( endOffset > reader.getOffset() ) {

				var subNode = this.parseNode( reader, version );

				if ( subNode !== null ) this.parseSubNode( name, node, subNode );

			}

			node.propertyList = propertyList; // raw property list used by parent

			if ( typeof id === 'number' ) node.id = id;
			if ( attrName !== '' ) node.attrName = attrName;
			if ( attrType !== '' ) node.attrType = attrType;
			if ( name !== '' ) node.name = name;

			return node;

		},

		parseSubNode: function ( name, node, subNode ) {

			// special case: child node is single property
			if ( subNode.singleProperty === true ) {

				var value = subNode.propertyList[ 0 ];

				if ( Array.isArray( value ) ) {

					node[ subNode.name ] = subNode;

					subNode.a = value;

				} else {

					node[ subNode.name ] = value;

				}

			} else if ( name === 'Connections' && subNode.name === 'C' ) {

				var array = [];

				subNode.propertyList.forEach( function ( property, i ) {

					// first Connection is FBX type (OO, OP, etc.). We'll discard these
					if ( i !== 0 ) array.push( property );

				} );

				if ( node.connections === undefined ) {

					node.connections = [];

				}

				node.connections.push( array );

			} else if ( subNode.name === 'Properties70' ) {

				var keys = Object.keys( subNode );

				keys.forEach( function ( key ) {

					node[ key ] = subNode[ key ];

				} );

			} else if ( name === 'Properties70' && subNode.name === 'P' ) {

				var innerPropName = subNode.propertyList[ 0 ];
				var innerPropType1 = subNode.propertyList[ 1 ];
				var innerPropType2 = subNode.propertyList[ 2 ];
				var innerPropFlag = subNode.propertyList[ 3 ];
				var innerPropValue;

				if ( innerPropName.indexOf( 'Lcl ' ) === 0 ) innerPropName = innerPropName.replace( 'Lcl ', 'Lcl_' );
				if ( innerPropType1.indexOf( 'Lcl ' ) === 0 ) innerPropType1 = innerPropType1.replace( 'Lcl ', 'Lcl_' );

				if ( innerPropType1 === 'Color' || innerPropType1 === 'ColorRGB' || innerPropType1 === 'Vector' || innerPropType1 === 'Vector3D' || innerPropType1.indexOf( 'Lcl_' ) === 0 ) {

					innerPropValue = [
						subNode.propertyList[ 4 ],
						subNode.propertyList[ 5 ],
						subNode.propertyList[ 6 ]
					];

				} else {

					innerPropValue = subNode.propertyList[ 4 ];

				}

				// this will be copied to parent, see above
				node[ innerPropName ] = {

					'type': innerPropType1,
					'type2': innerPropType2,
					'flag': innerPropFlag,
					'value': innerPropValue

				};

			} else if ( node[ subNode.name ] === undefined ) {

				if ( typeof subNode.id === 'number' ) {

					node[ subNode.name ] = {};
					node[ subNode.name ][ subNode.id ] = subNode;

				} else {

					node[ subNode.name ] = subNode;

				}

			} else {

				if ( subNode.name === 'PoseNode' ) {

					if ( ! Array.isArray( node[ subNode.name ] ) ) {

						node[ subNode.name ] = [ node[ subNode.name ] ];

					}

					node[ subNode.name ].push( subNode );

				} else if ( node[ subNode.name ][ subNode.id ] === undefined ) {

					node[ subNode.name ][ subNode.id ] = subNode;

				}

			}

		},

		parseProperty: function ( reader ) {

			var type = reader.getString( 1 );

			switch ( type ) {

				case 'C':
					return reader.getBoolean();

				case 'D':
					return reader.getFloat64();

				case 'F':
					return reader.getFloat32();

				case 'I':
					return reader.getInt32();

				case 'L':
					return reader.getInt64();

				case 'R':
					var length = reader.getUint32();
					return reader.getArrayBuffer( length );

				case 'S':
					var length = reader.getUint32();
					return reader.getString( length );

				case 'Y':
					return reader.getInt16();

				case 'b':
				case 'c':
				case 'd':
				case 'f':
				case 'i':
				case 'l':

					var arrayLength = reader.getUint32();
					var encoding = reader.getUint32(); // 0: non-compressed, 1: compressed
					var compressedLength = reader.getUint32();

					if ( encoding === 0 ) {

						switch ( type ) {

							case 'b':
							case 'c':
								return reader.getBooleanArray( arrayLength );

							case 'd':
								return reader.getFloat64Array( arrayLength );

							case 'f':
								return reader.getFloat32Array( arrayLength );

							case 'i':
								return reader.getInt32Array( arrayLength );

							case 'l':
								return reader.getInt64Array( arrayLength );

						}

					}

					if ( typeof Zlib === 'undefined' ) {

						console.error( 'THREE.FBXLoader: External library Inflate.min.js required, obtain or import from https://github.com/imaya/zlib.js' );

					}

					var inflate = new Zlib.Inflate( new Uint8Array( reader.getArrayBuffer( compressedLength ) ) ); // eslint-disable-line no-undef
					var reader2 = new BinaryReader( inflate.decompress().buffer );

					switch ( type ) {

						case 'b':
						case 'c':
							return reader2.getBooleanArray( arrayLength );

						case 'd':
							return reader2.getFloat64Array( arrayLength );

						case 'f':
							return reader2.getFloat32Array( arrayLength );

						case 'i':
							return reader2.getInt32Array( arrayLength );

						case 'l':
							return reader2.getInt64Array( arrayLength );

					}

				default:
					throw new Error( 'THREE.FBXLoader: Unknown property type ' + type );

			}

		}

	};

	function BinaryReader( buffer, littleEndian ) {

		this.dv = new DataView( buffer );
		this.offset = 0;
		this.littleEndian = ( littleEndian !== undefined ) ? littleEndian : true;

	}

	BinaryReader.prototype = {

		constructor: BinaryReader,

		getOffset: function () {

			return this.offset;

		},

		size: function () {

			return this.dv.buffer.byteLength;

		},

		skip: function ( length ) {

			this.offset += length;

		},

		// seems like true/false representation depends on exporter.
		// true: 1 or 'Y'(=0x59), false: 0 or 'T'(=0x54)
		// then sees LSB.
		getBoolean: function () {

			return ( this.getUint8() & 1 ) === 1;

		},

		getBooleanArray: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getBoolean() );

			}

			return a;

		},

		getUint8: function () {

			var value = this.dv.getUint8( this.offset );
			this.offset += 1;
			return value;

		},

		getInt16: function () {

			var value = this.dv.getInt16( this.offset, this.littleEndian );
			this.offset += 2;
			return value;

		},

		getInt32: function () {

			var value = this.dv.getInt32( this.offset, this.littleEndian );
			this.offset += 4;
			return value;

		},

		getInt32Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getInt32() );

			}

			return a;

		},

		getUint32: function () {

			var value = this.dv.getUint32( this.offset, this.littleEndian );
			this.offset += 4;
			return value;

		},

		// JavaScript doesn't support 64-bit integer so calculate this here
		// 1 << 32 will return 1 so using multiply operation instead here.
		// There's a possibility that this method returns wrong value if the value
		// is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
		// TODO: safely handle 64-bit integer
		getInt64: function () {

			var low, high;

			if ( this.littleEndian ) {

				low = this.getUint32();
				high = this.getUint32();

			} else {

				high = this.getUint32();
				low = this.getUint32();

			}

			// calculate negative value
			if ( high & 0x80000000 ) {

				high = ~ high & 0xFFFFFFFF;
				low = ~ low & 0xFFFFFFFF;

				if ( low === 0xFFFFFFFF ) high = ( high + 1 ) & 0xFFFFFFFF;

				low = ( low + 1 ) & 0xFFFFFFFF;

				return - ( high * 0x100000000 + low );

			}

			return high * 0x100000000 + low;

		},

		getInt64Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getInt64() );

			}

			return a;

		},

		// Note: see getInt64() comment
		getUint64: function () {

			var low, high;

			if ( this.littleEndian ) {

				low = this.getUint32();
				high = this.getUint32();

			} else {

				high = this.getUint32();
				low = this.getUint32();

			}

			return high * 0x100000000 + low;

		},

		getFloat32: function () {

			var value = this.dv.getFloat32( this.offset, this.littleEndian );
			this.offset += 4;
			return value;

		},

		getFloat32Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getFloat32() );

			}

			return a;

		},

		getFloat64: function () {

			var value = this.dv.getFloat64( this.offset, this.littleEndian );
			this.offset += 8;
			return value;

		},

		getFloat64Array: function ( size ) {

			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a.push( this.getFloat64() );

			}

			return a;

		},

		getArrayBuffer: function ( size ) {

			var value = this.dv.buffer.slice( this.offset, this.offset + size );
			this.offset += size;
			return value;

		},

		getString: function ( size ) {

			// note: safari 9 doesn't support Uint8Array.indexOf; create intermediate array instead
			var a = [];

			for ( var i = 0; i < size; i ++ ) {

				a[ i ] = this.getUint8();

			}

			var nullByte = a.indexOf( 0 );
			if ( nullByte >= 0 ) a = a.slice( 0, nullByte );

			return THREE.LoaderUtils.decodeText( new Uint8Array( a ) );

		}

	};

	// FBXTree holds a representation of the FBX data, returned by the TextParser ( FBX ASCII format)
	// and BinaryParser( FBX Binary format)
	function FBXTree() {}

	FBXTree.prototype = {

		constructor: FBXTree,

		add: function ( key, val ) {

			this[ key ] = val;

		},

	};

	// ************** UTILITY FUNCTIONS **************

	function isFbxFormatBinary( buffer ) {

		var CORRECT = 'Kaydara FBX Binary  \0';

		return buffer.byteLength >= CORRECT.length && CORRECT === convertArrayBufferToString( buffer, 0, CORRECT.length );

	}

	function isFbxFormatASCII( text ) {

		var CORRECT = [ 'K', 'a', 'y', 'd', 'a', 'r', 'a', '\\', 'F', 'B', 'X', '\\', 'B', 'i', 'n', 'a', 'r', 'y', '\\', '\\' ];

		var cursor = 0;

		function read( offset ) {

			var result = text[ offset - 1 ];
			text = text.slice( cursor + offset );
			cursor ++;
			return result;

		}

		for ( var i = 0; i < CORRECT.length; ++ i ) {

			var num = read( 1 );
			if ( num === CORRECT[ i ] ) {

				return false;

			}

		}

		return true;

	}

	function getFbxVersion( text ) {

		var versionRegExp = /FBXVersion: (\d+)/;
		var match = text.match( versionRegExp );
		if ( match ) {

			var version = parseInt( match[ 1 ] );
			return version;

		}
		throw new Error( 'THREE.FBXLoader: Cannot find the version number for the file given.' );

	}

	// Converts FBX ticks into real time seconds.
	function convertFBXTimeToSeconds( time ) {

		return time / 46186158000;

	}

	var dataArray = [];

	// extracts the data from the correct position in the FBX array based on indexing type
	function getData( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

		var index;

		switch ( infoObject.mappingType ) {

			case 'ByPolygonVertex' :
				index = polygonVertexIndex;
				break;
			case 'ByPolygon' :
				index = polygonIndex;
				break;
			case 'ByVertice' :
				index = vertexIndex;
				break;
			case 'AllSame' :
				index = infoObject.indices[ 0 ];
				break;
			default :
				console.warn( 'THREE.FBXLoader: unknown attribute mapping type ' + infoObject.mappingType );

		}

		if ( infoObject.referenceType === 'IndexToDirect' ) index = infoObject.indices[ index ];

		var from = index * infoObject.dataSize;
		var to = from + infoObject.dataSize;

		return slice( dataArray, infoObject.buffer, from, to );

	}

	var tempMat = new THREE.Matrix4();
	var tempEuler = new THREE.Euler();
	var tempVec = new THREE.Vector3();
	var translation = new THREE.Vector3();
	var rotation = new THREE.Matrix4();

	// generate transformation from FBX transform data
	// ref: https://help.autodesk.com/view/FBX/2017/ENU/?guid=__files_GUID_10CDD63C_79C1_4F2D_BB28_AD2BE65A02ED_htm
	// transformData = {
	//	 eulerOrder: int,
	//	 translation: [],
	//   rotationOffset: [],
	//	 preRotation
	//	 rotation
	//	 postRotation
	//   scale
	// }
	// all entries are optional
	function generateTransform( transformData ) {

		var transform = new THREE.Matrix4();
		translation.set( 0, 0, 0 );
		rotation.identity();

		var order = ( transformData.eulerOrder ) ? getEulerOrder( transformData.eulerOrder ) : getEulerOrder( 0 );

		if ( transformData.translation ) translation.fromArray( transformData.translation );
		if ( transformData.rotationOffset ) translation.add( tempVec.fromArray( transformData.rotationOffset ) );

		if ( transformData.rotation ) {

			var array = transformData.rotation.map( THREE.MathUtils.degToRad );
			array.push( order );
			rotation.makeRotationFromEuler( tempEuler.fromArray( array ) );

		}

		if ( transformData.preRotation ) {

			var array = transformData.preRotation.map( THREE.MathUtils.degToRad );
			array.push( order );
			tempMat.makeRotationFromEuler( tempEuler.fromArray( array ) );

			rotation.premultiply( tempMat );

		}

		if ( transformData.postRotation ) {

			var array = transformData.postRotation.map( THREE.MathUtils.degToRad );
			array.push( order );
			tempMat.makeRotationFromEuler( tempEuler.fromArray( array ) );

			tempMat.getInverse( tempMat );

			rotation.multiply( tempMat );

		}

		if ( transformData.scale ) transform.scale( tempVec.fromArray( transformData.scale ) );

		transform.setPosition( translation );
		transform.multiply( rotation );

		return transform;

	}

	// Returns the three.js intrinsic Euler order corresponding to FBX extrinsic Euler order
	// ref: http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_class_fbx_euler_html
	function getEulerOrder( order ) {

		var enums = [
			'ZYX', // -> XYZ extrinsic
			'YZX', // -> XZY extrinsic
			'XZY', // -> YZX extrinsic
			'ZXY', // -> YXZ extrinsic
			'YXZ', // -> ZXY extrinsic
			'XYZ', // -> ZYX extrinsic
		//'SphericXYZ', // not possible to support
		];

		if ( order === 6 ) {

			console.warn( 'THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect.' );
			return enums[ 0 ];

		}

		return enums[ order ];

	}

	// Parses comma separated list of numbers and returns them an array.
	// Used internally by the TextParser
	function parseNumberArray( value ) {

		var array = value.split( ',' ).map( function ( val ) {

			return parseFloat( val );

		} );

		return array;

	}

	function convertArrayBufferToString( buffer, from, to ) {

		if ( from === undefined ) from = 0;
		if ( to === undefined ) to = buffer.byteLength;

		return THREE.LoaderUtils.decodeText( new Uint8Array( buffer, from, to ) );

	}

	function append( a, b ) {

		for ( var i = 0, j = a.length, l = b.length; i < l; i ++, j ++ ) {

			a[ j ] = b[ i ];

		}

	}

	function slice( a, b, from, to ) {

		for ( var i = from, j = 0; i < to; i ++, j ++ ) {

			a[ j ] = b[ i ];

		}

		return a;

	}

	// inject array a2 into array a1 at index
	function inject( a1, index, a2 ) {

		return a1.slice( 0, index ).concat( a2 ).concat( a1.slice( index ) );

	}

	return FBXLoader;

} )();


/***/ }),

/***/ "./lib/GamepadButton.js":
/*!******************************!*\
  !*** ./lib/GamepadButton.js ***!
  \******************************/
/***/ ((module) => {

module.exports = Object.assign(function GamepadButton () {}, {
	FACE_1: 0,
	FACE_2: 1,
	FACE_3: 2,
	FACE_4: 3,

	L_SHOULDER_1: 4,
	R_SHOULDER_1: 5,
	L_SHOULDER_2: 6,
	R_SHOULDER_2: 7,

	SELECT: 8,
	START: 9,

	DPAD_UP: 12,
	DPAD_DOWN: 13,
	DPAD_LEFT: 14,
	DPAD_RIGHT: 15,

	VENDOR: 16,
});


/***/ }),

/***/ "./lib/GamepadButtonEvent.js":
/*!***********************************!*\
  !*** ./lib/GamepadButtonEvent.js ***!
  \***********************************/
/***/ ((module) => {

function GamepadButtonEvent (type, index, details) {
  this.type = type;
  this.index = index;
  this.pressed = details.pressed;
  this.value = details.value;
}

module.exports = GamepadButtonEvent;


/***/ }),

/***/ "./lib/fetch-script.js":
/*!*****************************!*\
  !*** ./lib/fetch-script.js ***!
  \*****************************/
/***/ ((module) => {

/**
 * Source: https://github.com/Adobe-Marketing-Cloud/fetch-script
 */

function getScriptId() {
  return 'script_' + Date.now() + '_' + Math.ceil(Math.random() * 100000);
}

function createScript(url, id) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.id = id;
  script.src = url;

  return script;
}

function removeScript(id) {
  const script = document.getElementById(id);
  const parent = script.parentNode;

  try {
    parent && parent.removeChild(script);
  } catch (e) {
    // ignore
  }
}

function appendScript(script) {
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(script, firstScript);
}

function fetchScriptInternal(url, options, Promise) {
  return new Promise(function(resolve, reject) {
    const timeout = options.timeout || 5000;
    const scriptId = getScriptId();
    const script = createScript(url, scriptId);

    const timeoutId = setTimeout(function() {
      reject(new Error('Script request to ' + url + ' timed out'));

      removeScript(scriptId);
    }, timeout);

    const disableTimeout = function(timeoutId) { clearTimeout(timeoutId); };

    script.addEventListener('load', function(e) {
      resolve({ok: true});

      disableTimeout(timeoutId);
      removeScript(scriptId);
    });

    script.addEventListener('error', function(e) {
      reject(new Error('Script request to ' + url + ' failed ' + e));

      disableTimeout(timeoutId);
      removeScript(scriptId);
    });

    appendScript(script);
  });
}

function fetchScript(settings) {
  settings = settings || {};
  return function (url, options) {
    options = options || {};
    return fetchScriptInternal(url, options, settings.Promise || Promise);
  };
}

module.exports = fetchScript;


/***/ }),

/***/ "./lib/keyboard.polyfill.js":
/*!**********************************!*\
  !*** ./lib/keyboard.polyfill.js ***!
  \**********************************/
/***/ (() => {

/**
 * Polyfill for the additional KeyboardEvent properties defined in the D3E and
 * D4E draft specifications, by @inexorabletash.
 *
 * See: https://github.com/inexorabletash/polyfill
 */
(function(global) {
  var nativeKeyboardEvent = ('KeyboardEvent' in global);
  if (!nativeKeyboardEvent)
    global.KeyboardEvent = function KeyboardEvent() { throw TypeError('Illegal constructor'); };

  if (!('DOM_KEY_LOCATION_STANDARD' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_STANDARD = 0x00; // Default or unknown location
  if (!('DOM_KEY_LOCATION_LEFT' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_LEFT          = 0x01; // e.g. Left Alt key
  if (!('DOM_KEY_LOCATION_RIGHT' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_RIGHT         = 0x02; // e.g. Right Alt key
  if (!('DOM_KEY_LOCATION_NUMPAD' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD        = 0x03; // e.g. Numpad 0 or +

  var STANDARD = window.KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
      LEFT = window.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
      RIGHT = window.KeyboardEvent.DOM_KEY_LOCATION_RIGHT,
      NUMPAD = window.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD;

  //--------------------------------------------------------------------
  //
  // Utilities
  //
  //--------------------------------------------------------------------

  function contains(s, ss) { return String(s).indexOf(ss) !== -1; }

  var os = (function() {
    if (contains(navigator.platform, 'Win')) { return 'win'; }
    if (contains(navigator.platform, 'Mac')) { return 'mac'; }
    if (contains(navigator.platform, 'CrOS')) { return 'cros'; }
    if (contains(navigator.platform, 'Linux')) { return 'linux'; }
    if (contains(navigator.userAgent, 'iPad') || contains(navigator.platform, 'iPod') || contains(navigator.platform, 'iPhone')) { return 'ios'; }
    return '';
  } ());

  var browser = (function() {
    if (contains(navigator.userAgent, 'Chrome/')) { return 'chrome'; }
    if (contains(navigator.vendor, 'Apple')) { return 'safari'; }
    if (contains(navigator.userAgent, 'MSIE')) { return 'ie'; }
    if (contains(navigator.userAgent, 'Gecko/')) { return 'moz'; }
    if (contains(navigator.userAgent, 'Opera/')) { return 'opera'; }
    return '';
  } ());

  var browser_os = browser + '-' + os;

  function mergeIf(baseTable, select, table) {
    if (browser_os === select || browser === select || os === select) {
      Object.keys(table).forEach(function(keyCode) {
        baseTable[keyCode] = table[keyCode];
      });
    }
  }

  function remap(o, key) {
    var r = {};
    Object.keys(o).forEach(function(k) {
      var item = o[k];
      if (key in item) {
        r[item[key]] = item;
      }
    });
    return r;
  }

  function invert(o) {
    var r = {};
    Object.keys(o).forEach(function(k) {
      r[o[k]] = k;
    });
    return r;
  }

  //--------------------------------------------------------------------
  //
  // Generic Mappings
  //
  //--------------------------------------------------------------------

  // "keyInfo" is a dictionary:
  //   code: string - name from DOM Level 3 KeyboardEvent code Values
  //     https://dvcs.w3.org/hg/dom3events/raw-file/tip/html/DOM3Events-code.html
  //   location (optional): number - one of the DOM_KEY_LOCATION values
  //   keyCap (optional): string - keyboard label in en-US locale
  // USB code Usage ID from page 0x07 unless otherwise noted (Informative)

  // Map of keyCode to keyInfo
  var keyCodeToInfoTable = {
    // 0x01 - VK_LBUTTON
    // 0x02 - VK_RBUTTON
    0x03: { code: 'Cancel' }, // [USB: 0x9b] char \x0018 ??? (Not in D3E)
    // 0x04 - VK_MBUTTON
    // 0x05 - VK_XBUTTON1
    // 0x06 - VK_XBUTTON2
    0x06: { code: 'Help' }, // [USB: 0x75] ???
    // 0x07 - undefined
    0x08: { code: 'Backspace' }, // [USB: 0x2a] Labelled Delete on Macintosh keyboards.
    0x09: { code: 'Tab' }, // [USB: 0x2b]
    // 0x0A-0x0B - reserved
    0X0C: { code: 'Clear' }, // [USB: 0x9c] NumPad Center (Not in D3E)
    0X0D: { code: 'Enter' }, // [USB: 0x28]
    // 0x0E-0x0F - undefined

    0x10: { code: 'Shift' },
    0x11: { code: 'Control' },
    0x12: { code: 'Alt' },
    0x13: { code: 'Pause' }, // [USB: 0x48]
    0x14: { code: 'CapsLock' }, // [USB: 0x39]
    0x15: { code: 'KanaMode' }, // [USB: 0x88] - "HangulMode" for Korean layout
    0x16: { code: 'HangulMode' }, // [USB: 0x90] 0x15 as well in MSDN VK table ???
    0x17: { code: 'JunjaMode' }, // (Not in D3E)
    0x18: { code: 'FinalMode' }, // (Not in D3E)
    0x19: { code: 'KanjiMode' }, // [USB: 0x91] - "HanjaMode" for Korean layout
    // 0x1A - undefined
    0x1B: { code: 'Escape' }, // [USB: 0x29]
    0x1C: { code: 'Convert' }, // [USB: 0x8a]
    0x1D: { code: 'NonConvert' }, // [USB: 0x8b]
    0x1E: { code: 'Accept' }, // (Not in D3E)
    0x1F: { code: 'ModeChange' }, // (Not in D3E)

    0x20: { code: 'Space' }, // [USB: 0x2c]
    0x21: { code: 'PageUp' }, // [USB: 0x4b]
    0x22: { code: 'PageDown' }, // [USB: 0x4e]
    0x23: { code: 'End' }, // [USB: 0x4d]
    0x24: { code: 'Home' }, // [USB: 0x4a]
    0x25: { code: 'ArrowLeft' }, // [USB: 0x50]
    0x26: { code: 'ArrowUp' }, // [USB: 0x52]
    0x27: { code: 'ArrowRight' }, // [USB: 0x4f]
    0x28: { code: 'ArrowDown' }, // [USB: 0x51]
    0x29: { code: 'Select' }, // (Not in D3E)
    0x2A: { code: 'Print' }, // (Not in D3E)
    0x2B: { code: 'Execute' }, // [USB: 0x74] (Not in D3E)
    0x2C: { code: 'PrintScreen' }, // [USB: 0x46]
    0x2D: { code: 'Insert' }, // [USB: 0x49]
    0x2E: { code: 'Delete' }, // [USB: 0x4c]
    0x2F: { code: 'Help' }, // [USB: 0x75] ???

    0x30: { code: 'Digit0', keyCap: '0' }, // [USB: 0x27] 0)
    0x31: { code: 'Digit1', keyCap: '1' }, // [USB: 0x1e] 1!
    0x32: { code: 'Digit2', keyCap: '2' }, // [USB: 0x1f] 2@
    0x33: { code: 'Digit3', keyCap: '3' }, // [USB: 0x20] 3#
    0x34: { code: 'Digit4', keyCap: '4' }, // [USB: 0x21] 4$
    0x35: { code: 'Digit5', keyCap: '5' }, // [USB: 0x22] 5%
    0x36: { code: 'Digit6', keyCap: '6' }, // [USB: 0x23] 6^
    0x37: { code: 'Digit7', keyCap: '7' }, // [USB: 0x24] 7&
    0x38: { code: 'Digit8', keyCap: '8' }, // [USB: 0x25] 8*
    0x39: { code: 'Digit9', keyCap: '9' }, // [USB: 0x26] 9(
    // 0x3A-0x40 - undefined

    0x41: { code: 'KeyA', keyCap: 'a' }, // [USB: 0x04]
    0x42: { code: 'KeyB', keyCap: 'b' }, // [USB: 0x05]
    0x43: { code: 'KeyC', keyCap: 'c' }, // [USB: 0x06]
    0x44: { code: 'KeyD', keyCap: 'd' }, // [USB: 0x07]
    0x45: { code: 'KeyE', keyCap: 'e' }, // [USB: 0x08]
    0x46: { code: 'KeyF', keyCap: 'f' }, // [USB: 0x09]
    0x47: { code: 'KeyG', keyCap: 'g' }, // [USB: 0x0a]
    0x48: { code: 'KeyH', keyCap: 'h' }, // [USB: 0x0b]
    0x49: { code: 'KeyI', keyCap: 'i' }, // [USB: 0x0c]
    0x4A: { code: 'KeyJ', keyCap: 'j' }, // [USB: 0x0d]
    0x4B: { code: 'KeyK', keyCap: 'k' }, // [USB: 0x0e]
    0x4C: { code: 'KeyL', keyCap: 'l' }, // [USB: 0x0f]
    0x4D: { code: 'KeyM', keyCap: 'm' }, // [USB: 0x10]
    0x4E: { code: 'KeyN', keyCap: 'n' }, // [USB: 0x11]
    0x4F: { code: 'KeyO', keyCap: 'o' }, // [USB: 0x12]

    0x50: { code: 'KeyP', keyCap: 'p' }, // [USB: 0x13]
    0x51: { code: 'KeyQ', keyCap: 'q' }, // [USB: 0x14]
    0x52: { code: 'KeyR', keyCap: 'r' }, // [USB: 0x15]
    0x53: { code: 'KeyS', keyCap: 's' }, // [USB: 0x16]
    0x54: { code: 'KeyT', keyCap: 't' }, // [USB: 0x17]
    0x55: { code: 'KeyU', keyCap: 'u' }, // [USB: 0x18]
    0x56: { code: 'KeyV', keyCap: 'v' }, // [USB: 0x19]
    0x57: { code: 'KeyW', keyCap: 'w' }, // [USB: 0x1a]
    0x58: { code: 'KeyX', keyCap: 'x' }, // [USB: 0x1b]
    0x59: { code: 'KeyY', keyCap: 'y' }, // [USB: 0x1c]
    0x5A: { code: 'KeyZ', keyCap: 'z' }, // [USB: 0x1d]
    0x5B: { code: 'OSLeft', location: LEFT }, // [USB: 0xe3]
    0x5C: { code: 'OSRight', location: RIGHT }, // [USB: 0xe7]
    0x5D: { code: 'ContextMenu' }, // [USB: 0x65] Context Menu
    // 0x5E - reserved
    0x5F: { code: 'Standby' }, // [USB: 0x82] Sleep

    0x60: { code: 'Numpad0', keyCap: '0', location: NUMPAD }, // [USB: 0x62]
    0x61: { code: 'Numpad1', keyCap: '1', location: NUMPAD }, // [USB: 0x59]
    0x62: { code: 'Numpad2', keyCap: '2', location: NUMPAD }, // [USB: 0x5a]
    0x63: { code: 'Numpad3', keyCap: '3', location: NUMPAD }, // [USB: 0x5b]
    0x64: { code: 'Numpad4', keyCap: '4', location: NUMPAD }, // [USB: 0x5c]
    0x65: { code: 'Numpad5', keyCap: '5', location: NUMPAD }, // [USB: 0x5d]
    0x66: { code: 'Numpad6', keyCap: '6', location: NUMPAD }, // [USB: 0x5e]
    0x67: { code: 'Numpad7', keyCap: '7', location: NUMPAD }, // [USB: 0x5f]
    0x68: { code: 'Numpad8', keyCap: '8', location: NUMPAD }, // [USB: 0x60]
    0x69: { code: 'Numpad9', keyCap: '9', location: NUMPAD }, // [USB: 0x61]
    0x6A: { code: 'NumpadMultiply', keyCap: '*', location: NUMPAD }, // [USB: 0x55]
    0x6B: { code: 'NumpadAdd', keyCap: '+', location: NUMPAD }, // [USB: 0x57]
    0x6C: { code: 'NumpadComma', keyCap: ',', location: NUMPAD }, // [USB: 0x85]
    0x6D: { code: 'NumpadSubtract', keyCap: '-', location: NUMPAD }, // [USB: 0x56]
    0x6E: { code: 'NumpadDecimal', keyCap: '.', location: NUMPAD }, // [USB: 0x63]
    0x6F: { code: 'NumpadDivide', keyCap: '/', location: NUMPAD }, // [USB: 0x54]

    0x70: { code: 'F1' }, // [USB: 0x3a]
    0x71: { code: 'F2' }, // [USB: 0x3b]
    0x72: { code: 'F3' }, // [USB: 0x3c]
    0x73: { code: 'F4' }, // [USB: 0x3d]
    0x74: { code: 'F5' }, // [USB: 0x3e]
    0x75: { code: 'F6' }, // [USB: 0x3f]
    0x76: { code: 'F7' }, // [USB: 0x40]
    0x77: { code: 'F8' }, // [USB: 0x41]
    0x78: { code: 'F9' }, // [USB: 0x42]
    0x79: { code: 'F10' }, // [USB: 0x43]
    0x7A: { code: 'F11' }, // [USB: 0x44]
    0x7B: { code: 'F12' }, // [USB: 0x45]
    0x7C: { code: 'F13' }, // [USB: 0x68]
    0x7D: { code: 'F14' }, // [USB: 0x69]
    0x7E: { code: 'F15' }, // [USB: 0x6a]
    0x7F: { code: 'F16' }, // [USB: 0x6b]

    0x80: { code: 'F17' }, // [USB: 0x6c]
    0x81: { code: 'F18' }, // [USB: 0x6d]
    0x82: { code: 'F19' }, // [USB: 0x6e]
    0x83: { code: 'F20' }, // [USB: 0x6f]
    0x84: { code: 'F21' }, // [USB: 0x70]
    0x85: { code: 'F22' }, // [USB: 0x71]
    0x86: { code: 'F23' }, // [USB: 0x72]
    0x87: { code: 'F24' }, // [USB: 0x73]
    // 0x88-0x8F - unassigned

    0x90: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
    0x91: { code: 'ScrollLock' }, // [USB: 0x47]
    // 0x92-0x96 - OEM specific
    // 0x97-0x9F - unassigned

    // NOTE: 0xA0-0xA5 usually mapped to 0x10-0x12 in browsers
    0xA0: { code: 'ShiftLeft', location: LEFT }, // [USB: 0xe1]
    0xA1: { code: 'ShiftRight', location: RIGHT }, // [USB: 0xe5]
    0xA2: { code: 'ControlLeft', location: LEFT }, // [USB: 0xe0]
    0xA3: { code: 'ControlRight', location: RIGHT }, // [USB: 0xe4]
    0xA4: { code: 'AltLeft', location: LEFT }, // [USB: 0xe2]
    0xA5: { code: 'AltRight', location: RIGHT }, // [USB: 0xe6]

    0xA6: { code: 'BrowserBack' }, // [USB: 0x0c/0x0224]
    0xA7: { code: 'BrowserForward' }, // [USB: 0x0c/0x0225]
    0xA8: { code: 'BrowserRefresh' }, // [USB: 0x0c/0x0227]
    0xA9: { code: 'BrowserStop' }, // [USB: 0x0c/0x0226]
    0xAA: { code: 'BrowserSearch' }, // [USB: 0x0c/0x0221]
    0xAB: { code: 'BrowserFavorites' }, // [USB: 0x0c/0x0228]
    0xAC: { code: 'BrowserHome' }, // [USB: 0x0c/0x0222]
    0xAD: { code: 'VolumeMute' }, // [USB: 0x7f]
    0xAE: { code: 'VolumeDown' }, // [USB: 0x81]
    0xAF: { code: 'VolumeUp' }, // [USB: 0x80]

    0xB0: { code: 'MediaTrackNext' }, // [USB: 0x0c/0x00b5]
    0xB1: { code: 'MediaTrackPrevious' }, // [USB: 0x0c/0x00b6]
    0xB2: { code: 'MediaStop' }, // [USB: 0x0c/0x00b7]
    0xB3: { code: 'MediaPlayPause' }, // [USB: 0x0c/0x00cd]
    0xB4: { code: 'LaunchMail' }, // [USB: 0x0c/0x018a]
    0xB5: { code: 'MediaSelect' },
    0xB6: { code: 'LaunchApp1' },
    0xB7: { code: 'LaunchApp2' },
    // 0xB8-0xB9 - reserved
    0xBA: { code: 'Semicolon',  keyCap: ';' }, // [USB: 0x33] ;: (US Standard 101)
    0xBB: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
    0xBC: { code: 'Comma', keyCap: ',' }, // [USB: 0x36] ,<
    0xBD: { code: 'Minus', keyCap: '-' }, // [USB: 0x2d] -_
    0xBE: { code: 'Period', keyCap: '.' }, // [USB: 0x37] .>
    0xBF: { code: 'Slash', keyCap: '/' }, // [USB: 0x38] /? (US Standard 101)

    0xC0: { code: 'Backquote', keyCap: '`' }, // [USB: 0x35] `~ (US Standard 101)
    // 0xC1-0xCF - reserved

    // 0xD0-0xD7 - reserved
    // 0xD8-0xDA - unassigned
    0xDB: { code: 'BracketLeft', keyCap: '[' }, // [USB: 0x2f] [{ (US Standard 101)
    0xDC: { code: 'Backslash',  keyCap: '\\' }, // [USB: 0x31] \| (US Standard 101)
    0xDD: { code: 'BracketRight', keyCap: ']' }, // [USB: 0x30] ]} (US Standard 101)
    0xDE: { code: 'Quote', keyCap: '\'' }, // [USB: 0x34] '" (US Standard 101)
    // 0xDF - miscellaneous/varies

    // 0xE0 - reserved
    // 0xE1 - OEM specific
    0xE2: { code: 'IntlBackslash',  keyCap: '\\' }, // [USB: 0x64] \| (UK Standard 102)
    // 0xE3-0xE4 - OEM specific
    0xE5: { code: 'Process' }, // (Not in D3E)
    // 0xE6 - OEM specific
    // 0xE7 - VK_PACKET
    // 0xE8 - unassigned
    // 0xE9-0xEF - OEM specific

    // 0xF0-0xF5 - OEM specific
    0xF6: { code: 'Attn' }, // [USB: 0x9a] (Not in D3E)
    0xF7: { code: 'CrSel' }, // [USB: 0xa3] (Not in D3E)
    0xF8: { code: 'ExSel' }, // [USB: 0xa4] (Not in D3E)
    0xF9: { code: 'EraseEof' }, // (Not in D3E)
    0xFA: { code: 'Play' }, // (Not in D3E)
    0xFB: { code: 'ZoomToggle' }, // (Not in D3E)
    // 0xFC - VK_NONAME - reserved
    // 0xFD - VK_PA1
    0xFE: { code: 'Clear' } // [USB: 0x9c] (Not in D3E)
  };

  // No legacy keyCode, but listed in D3E:

  // code: usb
  // 'IntlHash': 0x070032,
  // 'IntlRo': 0x070087,
  // 'IntlYen': 0x070089,
  // 'NumpadBackspace': 0x0700bb,
  // 'NumpadClear': 0x0700d8,
  // 'NumpadClearEntry': 0x0700d9,
  // 'NumpadMemoryAdd': 0x0700d3,
  // 'NumpadMemoryClear': 0x0700d2,
  // 'NumpadMemoryRecall': 0x0700d1,
  // 'NumpadMemoryStore': 0x0700d0,
  // 'NumpadMemorySubtract': 0x0700d4,
  // 'NumpadParenLeft': 0x0700b6,
  // 'NumpadParenRight': 0x0700b7,

  //--------------------------------------------------------------------
  //
  // Browser/OS Specific Mappings
  //
  //--------------------------------------------------------------------

  mergeIf(keyCodeToInfoTable,
          'moz', {
            0x3B: { code: 'Semicolon', keyCap: ';' }, // [USB: 0x33] ;: (US Standard 101)
            0x3D: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
            0x6B: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
            0x6D: { code: 'Minus', keyCap: '-' }, // [USB: 0x2d] -_
            0xBB: { code: 'NumpadAdd', keyCap: '+', location: NUMPAD }, // [USB: 0x57]
            0xBD: { code: 'NumpadSubtract', keyCap: '-', location: NUMPAD } // [USB: 0x56]
          });

  mergeIf(keyCodeToInfoTable,
          'moz-mac', {
            0x0C: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
            0xAD: { code: 'Minus', keyCap: '-' } // [USB: 0x2d] -_
          });

  mergeIf(keyCodeToInfoTable,
          'moz-win', {
            0xAD: { code: 'Minus', keyCap: '-' } // [USB: 0x2d] -_
          });

  mergeIf(keyCodeToInfoTable,
          'chrome-mac', {
            0x5D: { code: 'OSRight', location: RIGHT } // [USB: 0xe7]
          });

  // Windows via Bootcamp (!)
  if (false) {}

  mergeIf(keyCodeToInfoTable,
          'safari', {
            0x03: { code: 'Enter' }, // [USB: 0x28] old Safari
            0x19: { code: 'Tab' } // [USB: 0x2b] old Safari for Shift+Tab
          });

  mergeIf(keyCodeToInfoTable,
          'ios', {
            0x0A: { code: 'Enter', location: STANDARD } // [USB: 0x28]
          });

  mergeIf(keyCodeToInfoTable,
          'safari-mac', {
            0x5B: { code: 'OSLeft', location: LEFT }, // [USB: 0xe3]
            0x5D: { code: 'OSRight', location: RIGHT }, // [USB: 0xe7]
            0xE5: { code: 'KeyQ', keyCap: 'Q' } // [USB: 0x14] On alternate presses, Ctrl+Q sends this
          });

  //--------------------------------------------------------------------
  //
  // Identifier Mappings
  //
  //--------------------------------------------------------------------

  // Cases where newer-ish browsers send keyIdentifier which can be
  // used to disambiguate keys.

  // keyIdentifierTable[keyIdentifier] -> keyInfo

  var keyIdentifierTable = {};
  if ('cros' === os) {
    keyIdentifierTable['U+00A0'] = { code: 'ShiftLeft', location: LEFT };
    keyIdentifierTable['U+00A1'] = { code: 'ShiftRight', location: RIGHT };
    keyIdentifierTable['U+00A2'] = { code: 'ControlLeft', location: LEFT };
    keyIdentifierTable['U+00A3'] = { code: 'ControlRight', location: RIGHT };
    keyIdentifierTable['U+00A4'] = { code: 'AltLeft', location: LEFT };
    keyIdentifierTable['U+00A5'] = { code: 'AltRight', location: RIGHT };
  }
  if ('chrome-mac' === browser_os) {
    keyIdentifierTable['U+0010'] = { code: 'ContextMenu' };
  }
  if ('safari-mac' === browser_os) {
    keyIdentifierTable['U+0010'] = { code: 'ContextMenu' };
  }
  if ('ios' === os) {
    // These only generate keyup events
    keyIdentifierTable['U+0010'] = { code: 'Function' };

    keyIdentifierTable['U+001C'] = { code: 'ArrowLeft' };
    keyIdentifierTable['U+001D'] = { code: 'ArrowRight' };
    keyIdentifierTable['U+001E'] = { code: 'ArrowUp' };
    keyIdentifierTable['U+001F'] = { code: 'ArrowDown' };

    keyIdentifierTable['U+0001'] = { code: 'Home' }; // [USB: 0x4a] Fn + ArrowLeft
    keyIdentifierTable['U+0004'] = { code: 'End' }; // [USB: 0x4d] Fn + ArrowRight
    keyIdentifierTable['U+000B'] = { code: 'PageUp' }; // [USB: 0x4b] Fn + ArrowUp
    keyIdentifierTable['U+000C'] = { code: 'PageDown' }; // [USB: 0x4e] Fn + ArrowDown
  }

  //--------------------------------------------------------------------
  //
  // Location Mappings
  //
  //--------------------------------------------------------------------

  // Cases where newer-ish browsers send location/keyLocation which
  // can be used to disambiguate keys.

  // locationTable[location][keyCode] -> keyInfo
  var locationTable = [];
  locationTable[LEFT] = {
    0x10: { code: 'ShiftLeft', location: LEFT }, // [USB: 0xe1]
    0x11: { code: 'ControlLeft', location: LEFT }, // [USB: 0xe0]
    0x12: { code: 'AltLeft', location: LEFT } // [USB: 0xe2]
  };
  locationTable[RIGHT] = {
    0x10: { code: 'ShiftRight', location: RIGHT }, // [USB: 0xe5]
    0x11: { code: 'ControlRight', location: RIGHT }, // [USB: 0xe4]
    0x12: { code: 'AltRight', location: RIGHT } // [USB: 0xe6]
  };
  locationTable[NUMPAD] = {
    0x0D: { code: 'NumpadEnter', location: NUMPAD } // [USB: 0x58]
  };

  mergeIf(locationTable[NUMPAD], 'moz', {
    0x6D: { code: 'NumpadSubtract', location: NUMPAD }, // [USB: 0x56]
    0x6B: { code: 'NumpadAdd', location: NUMPAD } // [USB: 0x57]
  });
  mergeIf(locationTable[LEFT], 'moz-mac', {
    0xE0: { code: 'OSLeft', location: LEFT } // [USB: 0xe3]
  });
  mergeIf(locationTable[RIGHT], 'moz-mac', {
    0xE0: { code: 'OSRight', location: RIGHT } // [USB: 0xe7]
  });
  mergeIf(locationTable[RIGHT], 'moz-win', {
    0x5B: { code: 'OSRight', location: RIGHT } // [USB: 0xe7]
  });


  mergeIf(locationTable[RIGHT], 'mac', {
    0x5D: { code: 'OSRight', location: RIGHT } // [USB: 0xe7]
  });

  mergeIf(locationTable[NUMPAD], 'chrome-mac', {
    0x0C: { code: 'NumLock', location: NUMPAD } // [USB: 0x53]
  });

  mergeIf(locationTable[NUMPAD], 'safari-mac', {
    0x0C: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
    0xBB: { code: 'NumpadAdd', location: NUMPAD }, // [USB: 0x57]
    0xBD: { code: 'NumpadSubtract', location: NUMPAD }, // [USB: 0x56]
    0xBE: { code: 'NumpadDecimal', location: NUMPAD }, // [USB: 0x63]
    0xBF: { code: 'NumpadDivide', location: NUMPAD } // [USB: 0x54]
  });


  //--------------------------------------------------------------------
  //
  // Key Values
  //
  //--------------------------------------------------------------------

  // Mapping from `code` values to `key` values. Values defined at:
  // https://dvcs.w3.org/hg/dom3events/raw-file/tip/html/DOM3Events-key.html
  // Entries are only provided when `key` differs from `code`. If
  // printable, `shiftKey` has the shifted printable character. This
  // assumes US Standard 101 layout

  var codeToKeyTable = {
    // Modifier Keys
    ShiftLeft: { key: 'Shift' },
    ShiftRight: { key: 'Shift' },
    ControlLeft: { key: 'Control' },
    ControlRight: { key: 'Control' },
    AltLeft: { key: 'Alt' },
    AltRight: { key: 'Alt' },
    OSLeft: { key: 'OS' },
    OSRight: { key: 'OS' },

    // Whitespace Keys
    NumpadEnter: { key: 'Enter' },
    Space: { key: ' ' },

    // Printable Keys
    Digit0: { key: '0', shiftKey: ')' },
    Digit1: { key: '1', shiftKey: '!' },
    Digit2: { key: '2', shiftKey: '@' },
    Digit3: { key: '3', shiftKey: '#' },
    Digit4: { key: '4', shiftKey: '$' },
    Digit5: { key: '5', shiftKey: '%' },
    Digit6: { key: '6', shiftKey: '^' },
    Digit7: { key: '7', shiftKey: '&' },
    Digit8: { key: '8', shiftKey: '*' },
    Digit9: { key: '9', shiftKey: '(' },
    KeyA: { key: 'a', shiftKey: 'A' },
    KeyB: { key: 'b', shiftKey: 'B' },
    KeyC: { key: 'c', shiftKey: 'C' },
    KeyD: { key: 'd', shiftKey: 'D' },
    KeyE: { key: 'e', shiftKey: 'E' },
    KeyF: { key: 'f', shiftKey: 'F' },
    KeyG: { key: 'g', shiftKey: 'G' },
    KeyH: { key: 'h', shiftKey: 'H' },
    KeyI: { key: 'i', shiftKey: 'I' },
    KeyJ: { key: 'j', shiftKey: 'J' },
    KeyK: { key: 'k', shiftKey: 'K' },
    KeyL: { key: 'l', shiftKey: 'L' },
    KeyM: { key: 'm', shiftKey: 'M' },
    KeyN: { key: 'n', shiftKey: 'N' },
    KeyO: { key: 'o', shiftKey: 'O' },
    KeyP: { key: 'p', shiftKey: 'P' },
    KeyQ: { key: 'q', shiftKey: 'Q' },
    KeyR: { key: 'r', shiftKey: 'R' },
    KeyS: { key: 's', shiftKey: 'S' },
    KeyT: { key: 't', shiftKey: 'T' },
    KeyU: { key: 'u', shiftKey: 'U' },
    KeyV: { key: 'v', shiftKey: 'V' },
    KeyW: { key: 'w', shiftKey: 'W' },
    KeyX: { key: 'x', shiftKey: 'X' },
    KeyY: { key: 'y', shiftKey: 'Y' },
    KeyZ: { key: 'z', shiftKey: 'Z' },
    Numpad0: { key: '0' },
    Numpad1: { key: '1' },
    Numpad2: { key: '2' },
    Numpad3: { key: '3' },
    Numpad4: { key: '4' },
    Numpad5: { key: '5' },
    Numpad6: { key: '6' },
    Numpad7: { key: '7' },
    Numpad8: { key: '8' },
    Numpad9: { key: '9' },
    NumpadMultiply: { key: '*' },
    NumpadAdd: { key: '+' },
    NumpadComma: { key: ',' },
    NumpadSubtract: { key: '-' },
    NumpadDecimal: { key: '.' },
    NumpadDivide: { key: '/' },
    Semicolon: { key: ';', shiftKey: ':' },
    Equal: { key: '=', shiftKey: '+' },
    Comma: { key: ',', shiftKey: '<' },
    Minus: { key: '-', shiftKey: '_' },
    Period: { key: '.', shiftKey: '>' },
    Slash: { key: '/', shiftKey: '?' },
    Backquote: { key: '`', shiftKey: '~' },
    BracketLeft: { key: '[', shiftKey: '{' },
    Backslash: { key: '\\', shiftKey: '|' },
    BracketRight: { key: ']', shiftKey: '}' },
    Quote: { key: '\'', shiftKey: '"' },
    IntlBackslash: { key: '\\', shiftKey: '|' }
  };

  mergeIf(codeToKeyTable, 'mac', {
    OSLeft: { key: 'Meta' },
    OSRight: { key: 'Meta' }
  });

  // Corrections for 'key' names in older browsers (e.g. FF36-)
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.key#Key_values
  var keyFixTable = {
    Esc: 'Escape',
    Nonconvert: 'NonConvert',
    Left: 'ArrowLeft',
    Up: 'ArrowUp',
    Right: 'ArrowRight',
    Down: 'ArrowDown',
    Del: 'Delete',
    Menu: 'ContextMenu',
    MediaNextTrack: 'MediaTrackNext',
    MediaPreviousTrack: 'MediaTrackPrevious',
    SelectMedia: 'MediaSelect',
    HalfWidth: 'Hankaku',
    FullWidth: 'Zenkaku',
    RomanCharacters: 'Romaji',
    Crsel: 'CrSel',
    Exsel: 'ExSel',
    Zoom: 'ZoomToggle'
  };

  //--------------------------------------------------------------------
  //
  // Exported Functions
  //
  //--------------------------------------------------------------------


  var codeTable = remap(keyCodeToInfoTable, 'code');

  try {
    var nativeLocation = nativeKeyboardEvent && ('location' in new KeyboardEvent(''));
  } catch (_) {}

  function keyInfoForEvent(event) {
    var keyCode = 'keyCode' in event ? event.keyCode : 'which' in event ? event.which : 0;

    var keyInfo = (function(){
      if (nativeLocation || 'keyLocation' in event) {
        var location = nativeLocation ? event.location : event.keyLocation;
        if (location && keyCode in locationTable[location]) {
          return locationTable[location][keyCode];
        }
      }
      if ('keyIdentifier' in event && event.keyIdentifier in keyIdentifierTable) {
        return keyIdentifierTable[event.keyIdentifier];
      }
      if (keyCode in keyCodeToInfoTable) {
        return keyCodeToInfoTable[keyCode];
      }
      return null;
    }());

    // TODO: Track these down and move to general tables
    if (false) {}

    if (!keyInfo)
      return null;

    var key = (function() {
      var entry = codeToKeyTable[keyInfo.code];
      if (!entry) return keyInfo.code;
      return (event.shiftKey && 'shiftKey' in entry) ? entry.shiftKey : entry.key;
    }());

    return {
      code: keyInfo.code,
      key: key,
      location: keyInfo.location,
      keyCap: keyInfo.keyCap
    };
  }

  function queryKeyCap(code, locale) {
    code = String(code);
    if (!codeTable.hasOwnProperty(code)) return 'Undefined';
    if (locale && String(locale).toLowerCase() !== 'en-us') throw Error('Unsupported locale');
    var keyInfo = codeTable[code];
    return keyInfo.keyCap || keyInfo.code || 'Undefined';
  }

  if ('KeyboardEvent' in global && 'defineProperty' in Object) {
    (function() {
      function define(o, p, v) {
        if (p in o) return;
        Object.defineProperty(o, p, v);
      }

      define(KeyboardEvent.prototype, 'code', { get: function() {
        var keyInfo = keyInfoForEvent(this);
        return keyInfo ? keyInfo.code : '';
      }});

      // Fix for nonstandard `key` values (FF36-)
      if ('key' in KeyboardEvent.prototype) {
        var desc = Object.getOwnPropertyDescriptor(KeyboardEvent.prototype, 'key');
        Object.defineProperty(KeyboardEvent.prototype, 'key', { get: function() {
          var key = desc.get.call(this);
          return keyFixTable.hasOwnProperty(key) ? keyFixTable[key] : key;
        }});
      }

      define(KeyboardEvent.prototype, 'key', { get: function() {
        var keyInfo = keyInfoForEvent(this);
        return (keyInfo && 'key' in keyInfo) ? keyInfo.key : 'Unidentified';
      }});

      define(KeyboardEvent.prototype, 'location', { get: function() {
        var keyInfo = keyInfoForEvent(this);
        return (keyInfo && 'location' in keyInfo) ? keyInfo.location : STANDARD;
      }});

      define(KeyboardEvent.prototype, 'locale', { get: function() {
        return '';
      }});
    }());
  }

  if (!('queryKeyCap' in global.KeyboardEvent))
    global.KeyboardEvent.queryKeyCap = queryKeyCap;

  // Helper for IE8-
  global.identifyKey = function(event) {
    if ('code' in event)
      return;

    var keyInfo = keyInfoForEvent(event);
    event.code = keyInfo ? keyInfo.code : '';
    event.key = (keyInfo && 'key' in keyInfo) ? keyInfo.key : 'Unidentified';
    event.location = ('location' in event) ? event.location :
      ('keyLocation' in event) ? event.keyLocation :
      (keyInfo && 'location' in keyInfo) ? keyInfo.location : STANDARD;
    event.locale = '';
  };

} (window));


/***/ }),

/***/ "./node_modules/nipplejs/dist/nipplejs.js":
/*!************************************************!*\
  !*** ./node_modules/nipplejs/dist/nipplejs.js ***!
  \************************************************/
/***/ ((module) => {

!function(t,i){ true?module.exports=i():0}(window,(function(){return function(t){var i={};function e(o){if(i[o])return i[o].exports;var n=i[o]={i:o,l:!1,exports:{}};return t[o].call(n.exports,n,n.exports,e),n.l=!0,n.exports}return e.m=t,e.c=i,e.d=function(t,i,o){e.o(t,i)||Object.defineProperty(t,i,{enumerable:!0,get:o})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,i){if(1&i&&(t=e(t)),8&i)return t;if(4&i&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(e.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&i&&"string"!=typeof t)for(var n in t)e.d(o,n,function(i){return t[i]}.bind(null,n));return o},e.n=function(t){var i=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(i,"a",i),i},e.o=function(t,i){return Object.prototype.hasOwnProperty.call(t,i)},e.p="",e(e.s=0)}([function(t,i,e){"use strict";e.r(i);var o,n=function(t,i){var e=i.x-t.x,o=i.y-t.y;return Math.sqrt(e*e+o*o)},s=function(t){return t*(Math.PI/180)},r=function(t){return t*(180/Math.PI)},d=new Map,a=function(t){d.has(t)&&clearTimeout(d.get(t)),d.set(t,setTimeout(t,100))},p=function(t,i,e){for(var o,n=i.split(/[ ,]+/g),s=0;s<n.length;s+=1)o=n[s],t.addEventListener?t.addEventListener(o,e,!1):t.attachEvent&&t.attachEvent(o,e)},c=function(t,i,e){for(var o,n=i.split(/[ ,]+/g),s=0;s<n.length;s+=1)o=n[s],t.removeEventListener?t.removeEventListener(o,e):t.detachEvent&&t.detachEvent(o,e)},l=function(t){return t.preventDefault(),t.type.match(/^touch/)?t.changedTouches:t},h=function(){return{x:void 0!==window.pageXOffset?window.pageXOffset:(document.documentElement||document.body.parentNode||document.body).scrollLeft,y:void 0!==window.pageYOffset?window.pageYOffset:(document.documentElement||document.body.parentNode||document.body).scrollTop}},u=function(t,i){i.top||i.right||i.bottom||i.left?(t.style.top=i.top,t.style.right=i.right,t.style.bottom=i.bottom,t.style.left=i.left):(t.style.left=i.x+"px",t.style.top=i.y+"px")},f=function(t,i,e){var o=y(t);for(var n in o)if(o.hasOwnProperty(n))if("string"==typeof i)o[n]=i+" "+e;else{for(var s="",r=0,d=i.length;r<d;r+=1)s+=i[r]+" "+e+", ";o[n]=s.slice(0,-2)}return o},y=function(t){var i={};i[t]="";return["webkit","Moz","o"].forEach((function(e){i[e+t.charAt(0).toUpperCase()+t.slice(1)]=""})),i},m=function(t,i){for(var e in i)i.hasOwnProperty(e)&&(t[e]=i[e]);return t},v=function(t,i){if(t.length)for(var e=0,o=t.length;e<o;e+=1)i(t[e]);else i(t)},g=!!("ontouchstart"in window),b=!!window.PointerEvent,x=!!window.MSPointerEvent,O={start:"mousedown",move:"mousemove",end:"mouseup"},w={};function _(){}b?o={start:"pointerdown",move:"pointermove",end:"pointerup, pointercancel"}:x?o={start:"MSPointerDown",move:"MSPointerMove",end:"MSPointerUp"}:g?(o={start:"touchstart",move:"touchmove",end:"touchend, touchcancel"},w=O):o=O,_.prototype.on=function(t,i){var e,o=t.split(/[ ,]+/g);this._handlers_=this._handlers_||{};for(var n=0;n<o.length;n+=1)e=o[n],this._handlers_[e]=this._handlers_[e]||[],this._handlers_[e].push(i);return this},_.prototype.off=function(t,i){return this._handlers_=this._handlers_||{},void 0===t?this._handlers_={}:void 0===i?this._handlers_[t]=null:this._handlers_[t]&&this._handlers_[t].indexOf(i)>=0&&this._handlers_[t].splice(this._handlers_[t].indexOf(i),1),this},_.prototype.trigger=function(t,i){var e,o=this,n=t.split(/[ ,]+/g);o._handlers_=o._handlers_||{};for(var s=0;s<n.length;s+=1)e=n[s],o._handlers_[e]&&o._handlers_[e].length&&o._handlers_[e].forEach((function(t){t.call(o,{type:e,target:o},i)}))},_.prototype.config=function(t){this.options=this.defaults||{},t&&(this.options=function(t,i){var e={};for(var o in t)t.hasOwnProperty(o)&&i.hasOwnProperty(o)?e[o]=i[o]:t.hasOwnProperty(o)&&(e[o]=t[o]);return e}(this.options,t))},_.prototype.bindEvt=function(t,i){var e=this;return e._domHandlers_=e._domHandlers_||{},e._domHandlers_[i]=function(){"function"==typeof e["on"+i]?e["on"+i].apply(e,arguments):console.warn('[WARNING] : Missing "on'+i+'" handler.')},p(t,o[i],e._domHandlers_[i]),w[i]&&p(t,w[i],e._domHandlers_[i]),e},_.prototype.unbindEvt=function(t,i){return this._domHandlers_=this._domHandlers_||{},c(t,o[i],this._domHandlers_[i]),w[i]&&c(t,w[i],this._domHandlers_[i]),delete this._domHandlers_[i],this};var T=_;function k(t,i){return this.identifier=i.identifier,this.position=i.position,this.frontPosition=i.frontPosition,this.collection=t,this.defaults={size:100,threshold:.1,color:"white",fadeTime:250,dataOnly:!1,restJoystick:!0,restOpacity:.5,mode:"dynamic",zone:document.body,lockX:!1,lockY:!1,shape:"circle"},this.config(i),"dynamic"===this.options.mode&&(this.options.restOpacity=0),this.id=k.id,k.id+=1,this.buildEl().stylize(),this.instance={el:this.ui.el,on:this.on.bind(this),off:this.off.bind(this),show:this.show.bind(this),hide:this.hide.bind(this),add:this.addToDom.bind(this),remove:this.removeFromDom.bind(this),destroy:this.destroy.bind(this),setPosition:this.setPosition.bind(this),resetDirection:this.resetDirection.bind(this),computeDirection:this.computeDirection.bind(this),trigger:this.trigger.bind(this),position:this.position,frontPosition:this.frontPosition,ui:this.ui,identifier:this.identifier,id:this.id,options:this.options},this.instance}k.prototype=new T,k.constructor=k,k.id=0,k.prototype.buildEl=function(t){return this.ui={},this.options.dataOnly||(this.ui.el=document.createElement("div"),this.ui.back=document.createElement("div"),this.ui.front=document.createElement("div"),this.ui.el.className="nipple collection_"+this.collection.id,this.ui.back.className="back",this.ui.front.className="front",this.ui.el.setAttribute("id","nipple_"+this.collection.id+"_"+this.id),this.ui.el.appendChild(this.ui.back),this.ui.el.appendChild(this.ui.front)),this},k.prototype.stylize=function(){if(this.options.dataOnly)return this;var t=this.options.fadeTime+"ms",i=function(t,i){var e=y(t);for(var o in e)e.hasOwnProperty(o)&&(e[o]=i);return e}("borderRadius","50%"),e=f("transition","opacity",t),o={};return o.el={position:"absolute",opacity:this.options.restOpacity,display:"block",zIndex:999},o.back={position:"absolute",display:"block",width:this.options.size+"px",height:this.options.size+"px",marginLeft:-this.options.size/2+"px",marginTop:-this.options.size/2+"px",background:this.options.color,opacity:".5"},o.front={width:this.options.size/2+"px",height:this.options.size/2+"px",position:"absolute",display:"block",marginLeft:-this.options.size/4+"px",marginTop:-this.options.size/4+"px",background:this.options.color,opacity:".5",transform:"translate(0px, 0px)"},m(o.el,e),"circle"===this.options.shape&&m(o.back,i),m(o.front,i),this.applyStyles(o),this},k.prototype.applyStyles=function(t){for(var i in this.ui)if(this.ui.hasOwnProperty(i))for(var e in t[i])this.ui[i].style[e]=t[i][e];return this},k.prototype.addToDom=function(){return this.options.dataOnly||document.body.contains(this.ui.el)||this.options.zone.appendChild(this.ui.el),this},k.prototype.removeFromDom=function(){return this.options.dataOnly||!document.body.contains(this.ui.el)||this.options.zone.removeChild(this.ui.el),this},k.prototype.destroy=function(){clearTimeout(this.removeTimeout),clearTimeout(this.showTimeout),clearTimeout(this.restTimeout),this.trigger("destroyed",this.instance),this.removeFromDom(),this.off()},k.prototype.show=function(t){var i=this;return i.options.dataOnly||(clearTimeout(i.removeTimeout),clearTimeout(i.showTimeout),clearTimeout(i.restTimeout),i.addToDom(),i.restCallback(),setTimeout((function(){i.ui.el.style.opacity=1}),0),i.showTimeout=setTimeout((function(){i.trigger("shown",i.instance),"function"==typeof t&&t.call(this)}),i.options.fadeTime)),i},k.prototype.hide=function(t){var i=this;if(i.options.dataOnly)return i;if(i.ui.el.style.opacity=i.options.restOpacity,clearTimeout(i.removeTimeout),clearTimeout(i.showTimeout),clearTimeout(i.restTimeout),i.removeTimeout=setTimeout((function(){var e="dynamic"===i.options.mode?"none":"block";i.ui.el.style.display=e,"function"==typeof t&&t.call(i),i.trigger("hidden",i.instance)}),i.options.fadeTime),i.options.restJoystick){var e=i.options.restJoystick,o={};o.x=!0===e||!1!==e.x?0:i.instance.frontPosition.x,o.y=!0===e||!1!==e.y?0:i.instance.frontPosition.y,i.setPosition(t,o)}return i},k.prototype.setPosition=function(t,i){var e=this;e.frontPosition={x:i.x,y:i.y};var o=e.options.fadeTime+"ms",n={};n.front=f("transition",["transform"],o);var s={front:{}};s.front={transform:"translate("+e.frontPosition.x+"px,"+e.frontPosition.y+"px)"},e.applyStyles(n),e.applyStyles(s),e.restTimeout=setTimeout((function(){"function"==typeof t&&t.call(e),e.restCallback()}),e.options.fadeTime)},k.prototype.restCallback=function(){var t={};t.front=f("transition","none",""),this.applyStyles(t),this.trigger("rested",this.instance)},k.prototype.resetDirection=function(){this.direction={x:!1,y:!1,angle:!1}},k.prototype.computeDirection=function(t){var i,e,o,n=t.angle.radian,s=Math.PI/4,r=Math.PI/2;if(n>s&&n<3*s&&!t.lockX?i="up":n>-s&&n<=s&&!t.lockY?i="left":n>3*-s&&n<=-s&&!t.lockX?i="down":t.lockY||(i="right"),t.lockY||(e=n>-r&&n<r?"left":"right"),t.lockX||(o=n>0?"up":"down"),t.force>this.options.threshold){var d,a={};for(d in this.direction)this.direction.hasOwnProperty(d)&&(a[d]=this.direction[d]);var p={};for(d in this.direction={x:e,y:o,angle:i},t.direction=this.direction,a)a[d]===this.direction[d]&&(p[d]=!0);if(p.x&&p.y&&p.angle)return t;p.x&&p.y||this.trigger("plain",t),p.x||this.trigger("plain:"+e,t),p.y||this.trigger("plain:"+o,t),p.angle||this.trigger("dir dir:"+i,t)}else this.resetDirection();return t};var P=k;function E(t,i){this.nipples=[],this.idles=[],this.actives=[],this.ids=[],this.pressureIntervals={},this.manager=t,this.id=E.id,E.id+=1,this.defaults={zone:document.body,multitouch:!1,maxNumberOfNipples:10,mode:"dynamic",position:{top:0,left:0},catchDistance:200,size:100,threshold:.1,color:"white",fadeTime:250,dataOnly:!1,restJoystick:!0,restOpacity:.5,lockX:!1,lockY:!1,shape:"circle",dynamicPage:!1,follow:!1},this.config(i),"static"!==this.options.mode&&"semi"!==this.options.mode||(this.options.multitouch=!1),this.options.multitouch||(this.options.maxNumberOfNipples=1);var e=getComputedStyle(this.options.zone.parentElement);return e&&"flex"===e.display&&(this.parentIsFlex=!0),this.updateBox(),this.prepareNipples(),this.bindings(),this.begin(),this.nipples}E.prototype=new T,E.constructor=E,E.id=0,E.prototype.prepareNipples=function(){var t=this.nipples;t.on=this.on.bind(this),t.off=this.off.bind(this),t.options=this.options,t.destroy=this.destroy.bind(this),t.ids=this.ids,t.id=this.id,t.processOnMove=this.processOnMove.bind(this),t.processOnEnd=this.processOnEnd.bind(this),t.get=function(i){if(void 0===i)return t[0];for(var e=0,o=t.length;e<o;e+=1)if(t[e].identifier===i)return t[e];return!1}},E.prototype.bindings=function(){this.bindEvt(this.options.zone,"start"),this.options.zone.style.touchAction="none",this.options.zone.style.msTouchAction="none"},E.prototype.begin=function(){var t=this.options;if("static"===t.mode){var i=this.createNipple(t.position,this.manager.getIdentifier());i.add(),this.idles.push(i)}},E.prototype.createNipple=function(t,i){var e=this.manager.scroll,o={},n=this.options,s=this.parentIsFlex?e.x:e.x+this.box.left,r=this.parentIsFlex?e.y:e.y+this.box.top;if(t.x&&t.y)o={x:t.x-s,y:t.y-r};else if(t.top||t.right||t.bottom||t.left){var d=document.createElement("DIV");d.style.display="hidden",d.style.top=t.top,d.style.right=t.right,d.style.bottom=t.bottom,d.style.left=t.left,d.style.position="absolute",n.zone.appendChild(d);var a=d.getBoundingClientRect();n.zone.removeChild(d),o=t,t={x:a.left+e.x,y:a.top+e.y}}var p=new P(this,{color:n.color,size:n.size,threshold:n.threshold,fadeTime:n.fadeTime,dataOnly:n.dataOnly,restJoystick:n.restJoystick,restOpacity:n.restOpacity,mode:n.mode,identifier:i,position:t,zone:n.zone,frontPosition:{x:0,y:0},shape:n.shape});return n.dataOnly||(u(p.ui.el,o),u(p.ui.front,p.frontPosition)),this.nipples.push(p),this.trigger("added "+p.identifier+":added",p),this.manager.trigger("added "+p.identifier+":added",p),this.bindNipple(p),p},E.prototype.updateBox=function(){this.box=this.options.zone.getBoundingClientRect()},E.prototype.bindNipple=function(t){var i,e=this,o=function(t,o){i=t.type+" "+o.id+":"+t.type,e.trigger(i,o)};t.on("destroyed",e.onDestroyed.bind(e)),t.on("shown hidden rested dir plain",o),t.on("dir:up dir:right dir:down dir:left",o),t.on("plain:up plain:right plain:down plain:left",o)},E.prototype.pressureFn=function(t,i,e){var o=this,n=0;clearInterval(o.pressureIntervals[e]),o.pressureIntervals[e]=setInterval(function(){var e=t.force||t.pressure||t.webkitForce||0;e!==n&&(i.trigger("pressure",e),o.trigger("pressure "+i.identifier+":pressure",e),n=e)}.bind(o),100)},E.prototype.onstart=function(t){var i=this,e=i.options,o=t;t=l(t),i.updateBox();return v(t,(function(n){i.actives.length<e.maxNumberOfNipples?i.processOnStart(n):o.type.match(/^touch/)&&(Object.keys(i.manager.ids).forEach((function(e){if(Object.values(o.touches).findIndex((function(t){return t.identifier===e}))<0){var n=[t[0]];n.identifier=e,i.processOnEnd(n)}})),i.actives.length<e.maxNumberOfNipples&&i.processOnStart(n))})),i.manager.bindDocument(),!1},E.prototype.processOnStart=function(t){var i,e=this,o=e.options,s=e.manager.getIdentifier(t),r=t.force||t.pressure||t.webkitForce||0,d={x:t.pageX,y:t.pageY},a=e.getOrCreate(s,d);a.identifier!==s&&e.manager.removeIdentifier(a.identifier),a.identifier=s;var p=function(i){i.trigger("start",i),e.trigger("start "+i.id+":start",i),i.show(),r>0&&e.pressureFn(t,i,i.identifier),e.processOnMove(t)};if((i=e.idles.indexOf(a))>=0&&e.idles.splice(i,1),e.actives.push(a),e.ids.push(a.identifier),"semi"!==o.mode)p(a);else{if(!(n(d,a.position)<=o.catchDistance))return a.destroy(),void e.processOnStart(t);p(a)}return a},E.prototype.getOrCreate=function(t,i){var e,o=this.options;return/(semi|static)/.test(o.mode)?(e=this.idles[0])?(this.idles.splice(0,1),e):"semi"===o.mode?this.createNipple(i,t):(console.warn("Coudln't find the needed nipple."),!1):e=this.createNipple(i,t)},E.prototype.processOnMove=function(t){var i=this.options,e=this.manager.getIdentifier(t),o=this.nipples.get(e),d=this.manager.scroll;if(function(t){return isNaN(t.buttons)?0!==t.pressure:0!==t.buttons}(t)){if(!o)return console.error("Found zombie joystick with ID "+e),void this.manager.removeIdentifier(e);if(i.dynamicPage){var a=o.el.getBoundingClientRect();o.position={x:d.x+a.left,y:d.y+a.top}}o.identifier=e;var p=o.options.size/2,c={x:t.pageX,y:t.pageY};i.lockX&&(c.y=o.position.y),i.lockY&&(c.x=o.position.x);var l,h,u,f,y,m,v,g,b,x,O=n(c,o.position),w=(l=c,h=o.position,u=h.x-l.x,f=h.y-l.y,r(Math.atan2(f,u))),_=s(w),T=O/p,k={distance:O,position:c};if("circle"===o.options.shape?(y=Math.min(O,p),v=o.position,g=y,x={x:0,y:0},b=s(b=w),x.x=v.x-g*Math.cos(b),x.y=v.y-g*Math.sin(b),m=x):(m=function(t,i,e){return{x:Math.min(Math.max(t.x,i.x-e),i.x+e),y:Math.min(Math.max(t.y,i.y-e),i.y+e)}}(c,o.position,p),y=n(m,o.position)),i.follow){if(O>p){var P=c.x-m.x,E=c.y-m.y;o.position.x+=P,o.position.y+=E,o.el.style.top=o.position.y-(this.box.top+d.y)+"px",o.el.style.left=o.position.x-(this.box.left+d.x)+"px",O=n(c,o.position)}}else c=m,O=y;var I=c.x-o.position.x,z=c.y-o.position.y;o.frontPosition={x:I,y:z},i.dataOnly||(o.ui.front.style.transform="translate("+I+"px,"+z+"px)");var D={identifier:o.identifier,position:c,force:T,pressure:t.force||t.pressure||t.webkitForce||0,distance:O,angle:{radian:_,degree:w},vector:{x:I/p,y:-z/p},raw:k,instance:o,lockX:i.lockX,lockY:i.lockY};(D=o.computeDirection(D)).angle={radian:s(180-w),degree:180-w},o.trigger("move",D),this.trigger("move "+o.id+":move",D)}else this.processOnEnd(t)},E.prototype.processOnEnd=function(t){var i=this,e=i.options,o=i.manager.getIdentifier(t),n=i.nipples.get(o),s=i.manager.removeIdentifier(n.identifier);n&&(e.dataOnly||n.hide((function(){"dynamic"===e.mode&&(n.trigger("removed",n),i.trigger("removed "+n.id+":removed",n),i.manager.trigger("removed "+n.id+":removed",n),n.destroy())})),clearInterval(i.pressureIntervals[n.identifier]),n.resetDirection(),n.trigger("end",n),i.trigger("end "+n.id+":end",n),i.ids.indexOf(n.identifier)>=0&&i.ids.splice(i.ids.indexOf(n.identifier),1),i.actives.indexOf(n)>=0&&i.actives.splice(i.actives.indexOf(n),1),/(semi|static)/.test(e.mode)?i.idles.push(n):i.nipples.indexOf(n)>=0&&i.nipples.splice(i.nipples.indexOf(n),1),i.manager.unbindDocument(),/(semi|static)/.test(e.mode)&&(i.manager.ids[s.id]=s.identifier))},E.prototype.onDestroyed=function(t,i){this.nipples.indexOf(i)>=0&&this.nipples.splice(this.nipples.indexOf(i),1),this.actives.indexOf(i)>=0&&this.actives.splice(this.actives.indexOf(i),1),this.idles.indexOf(i)>=0&&this.idles.splice(this.idles.indexOf(i),1),this.ids.indexOf(i.identifier)>=0&&this.ids.splice(this.ids.indexOf(i.identifier),1),this.manager.removeIdentifier(i.identifier),this.manager.unbindDocument()},E.prototype.destroy=function(){for(var t in this.unbindEvt(this.options.zone,"start"),this.nipples.forEach((function(t){t.destroy()})),this.pressureIntervals)this.pressureIntervals.hasOwnProperty(t)&&clearInterval(this.pressureIntervals[t]);this.trigger("destroyed",this.nipples),this.manager.unbindDocument(),this.off()};var I=E;function z(t){var i=this;i.ids={},i.index=0,i.collections=[],i.scroll=h(),i.config(t),i.prepareCollections();var e=function(){var t;i.collections.forEach((function(e){e.forEach((function(e){t=e.el.getBoundingClientRect(),e.position={x:i.scroll.x+t.left,y:i.scroll.y+t.top}}))}))};p(window,"resize",(function(){a(e)}));var o=function(){i.scroll=h()};return p(window,"scroll",(function(){a(o)})),i.collections}z.prototype=new T,z.constructor=z,z.prototype.prepareCollections=function(){var t=this;t.collections.create=t.create.bind(t),t.collections.on=t.on.bind(t),t.collections.off=t.off.bind(t),t.collections.destroy=t.destroy.bind(t),t.collections.get=function(i){var e;return t.collections.every((function(t){return!(e=t.get(i))})),e}},z.prototype.create=function(t){return this.createCollection(t)},z.prototype.createCollection=function(t){var i=new I(this,t);return this.bindCollection(i),this.collections.push(i),i},z.prototype.bindCollection=function(t){var i,e=this,o=function(t,o){i=t.type+" "+o.id+":"+t.type,e.trigger(i,o)};t.on("destroyed",e.onDestroyed.bind(e)),t.on("shown hidden rested dir plain",o),t.on("dir:up dir:right dir:down dir:left",o),t.on("plain:up plain:right plain:down plain:left",o)},z.prototype.bindDocument=function(){this.binded||(this.bindEvt(document,"move").bindEvt(document,"end"),this.binded=!0)},z.prototype.unbindDocument=function(t){Object.keys(this.ids).length&&!0!==t||(this.unbindEvt(document,"move").unbindEvt(document,"end"),this.binded=!1)},z.prototype.getIdentifier=function(t){var i;return t?void 0===(i=void 0===t.identifier?t.pointerId:t.identifier)&&(i=this.latest||0):i=this.index,void 0===this.ids[i]&&(this.ids[i]=this.index,this.index+=1),this.latest=i,this.ids[i]},z.prototype.removeIdentifier=function(t){var i={};for(var e in this.ids)if(this.ids[e]===t){i.id=e,i.identifier=this.ids[e],delete this.ids[e];break}return i},z.prototype.onmove=function(t){return this.onAny("move",t),!1},z.prototype.onend=function(t){return this.onAny("end",t),!1},z.prototype.oncancel=function(t){return this.onAny("end",t),!1},z.prototype.onAny=function(t,i){var e,o=this,n="processOn"+t.charAt(0).toUpperCase()+t.slice(1);i=l(i);var s=function(t,i,e){e.ids.indexOf(i)>=0&&(e[n](t),t._found_=!0)};return v(i,(function(t){e=o.getIdentifier(t),v(o.collections,s.bind(null,t,e)),t._found_||o.removeIdentifier(e)})),!1},z.prototype.destroy=function(){this.unbindDocument(!0),this.ids={},this.index=0,this.collections.forEach((function(t){t.destroy()})),this.off()},z.prototype.onDestroyed=function(t,i){if(this.collections.indexOf(i)<0)return!1;this.collections.splice(this.collections.indexOf(i),1)};var D=new z;i.default={create:function(t){return D.create(t)},factory:D}}]).default}));

/***/ }),

/***/ "./node_modules/three-pathfinding/dist/three-pathfinding.module.js":
/*!*************************************************************************!*\
  !*** ./node_modules/three-pathfinding/dist/three-pathfinding.module.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Pathfinding: () => (/* binding */ v),
/* harmony export */   PathfindingHelper: () => (/* binding */ w)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
class p{static roundNumber(t,e){const r=Math.pow(10,e);return Math.round(t*r)/r}static sample(t){return t[Math.floor(Math.random()*t.length)]}static distanceToSquared(t,e){var r=t.x-e.x,s=t.y-e.y,n=t.z-e.z;return r*r+s*s+n*n}static isPointInPoly(t,e){for(var r=!1,s=-1,n=t.length,o=n-1;++s<n;o=s)(t[s].z<=e.z&&e.z<t[o].z||t[o].z<=e.z&&e.z<t[s].z)&&e.x<(t[o].x-t[s].x)*(e.z-t[s].z)/(t[o].z-t[s].z)+t[s].x&&(r=!r);return r}static isVectorInPolygon(t,e,r){var s=1e5,n=-1e5,o=[];return e.vertexIds.forEach(t=>{s=Math.min(r[t].y,s),n=Math.max(r[t].y,n),o.push(r[t])}),!!(t.y<n+.5&&t.y>s-.5&&this.isPointInPoly(o,t))}static triarea2(t,e,r){return(r.x-t.x)*(e.z-t.z)-(e.x-t.x)*(r.z-t.z)}static vequal(t,e){return this.distanceToSquared(t,e)<1e-5}static mergeVertices(r,s=1e-4){s=Math.max(s,Number.EPSILON);for(var n={},o=r.getIndex(),i=r.getAttribute("position"),h=o?o.count:i.count,c=0,a=[],u=[],l=Math.log10(1/s),d=Math.pow(10,l),p=0;p<h;p++){var g=o?o.getX(p):p,f="";f+=~~(i.getX(g)*d)+",",f+=~~(i.getY(g)*d)+",",(f+=~~(i.getZ(g)*d)+",")in n?a.push(n[f]):(u.push(i.getX(g)),u.push(i.getY(g)),u.push(i.getZ(g)),n[f]=c,a.push(c),c++)}const v=new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(u),i.itemSize,i.normalized),b=new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry;return b.setAttribute("position",v),b.setIndex(a),b}}class g{constructor(t){this.content=[],this.scoreFunction=t}push(t){this.content.push(t),this.sinkDown(this.content.length-1)}pop(){const t=this.content[0],e=this.content.pop();return this.content.length>0&&(this.content[0]=e,this.bubbleUp(0)),t}remove(t){const e=this.content.indexOf(t),r=this.content.pop();e!==this.content.length-1&&(this.content[e]=r,this.scoreFunction(r)<this.scoreFunction(t)?this.sinkDown(e):this.bubbleUp(e))}size(){return this.content.length}rescoreElement(t){this.sinkDown(this.content.indexOf(t))}sinkDown(t){const e=this.content[t];for(;t>0;){const r=(t+1>>1)-1,s=this.content[r];if(!(this.scoreFunction(e)<this.scoreFunction(s)))break;this.content[r]=e,this.content[t]=s,t=r}}bubbleUp(t){const e=this.content.length,r=this.content[t],s=this.scoreFunction(r);for(;;){const n=t+1<<1,o=n-1;let i,h=null;if(o<e&&(i=this.scoreFunction(this.content[o]),i<s&&(h=o)),n<e&&this.scoreFunction(this.content[n])<(null===h?s:i)&&(h=n),null===h)break;this.content[t]=this.content[h],this.content[h]=r,t=h}}}class f{constructor(){this.portals=[]}push(t,e){void 0===e&&(e=t),this.portals.push({left:t,right:e})}stringPull(){const t=this.portals,e=[];let r,s,n,o=0,i=0,h=0;r=t[0].left,s=t[0].left,n=t[0].right,e.push(r);for(let c=1;c<t.length;c++){const a=t[c].left,u=t[c].right;if(p.triarea2(r,n,u)<=0){if(!(p.vequal(r,n)||p.triarea2(r,s,u)>0)){e.push(s),r=s,o=i,s=r,n=r,i=o,h=o,c=o;continue}n=u,h=c}if(p.triarea2(r,s,a)>=0){if(!(p.vequal(r,s)||p.triarea2(r,n,a)<0)){e.push(n),r=n,o=h,s=r,n=r,i=o,h=o,c=o;continue}s=a,i=c}}return 0!==e.length&&p.vequal(e[e.length-1],t[t.length-1].left)||e.push(t[t.length-1].left),this.path=e,e}}class v{constructor(){this.zones={}}static createZone(t,e=1e-4){return class{static buildZone(t,e){const s=this._buildNavigationMesh(t,e),n={};s.vertices.forEach(t=>{t.x=p.roundNumber(t.x,2),t.y=p.roundNumber(t.y,2),t.z=p.roundNumber(t.z,2)}),n.vertices=s.vertices;const o=this._buildPolygonGroups(s);return n.groups=new Array(o.length),o.forEach((t,e)=>{const s=new Map;t.forEach((t,e)=>{s.set(t,e)});const o=new Array(t.length);t.forEach((t,e)=>{const i=[];t.neighbours.forEach(t=>i.push(s.get(t)));const h=[];t.neighbours.forEach(e=>h.push(this._getSharedVerticesInOrder(t,e)));const c=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(0,0,0);c.add(n.vertices[t.vertexIds[0]]),c.add(n.vertices[t.vertexIds[1]]),c.add(n.vertices[t.vertexIds[2]]),c.divideScalar(3),c.x=p.roundNumber(c.x,2),c.y=p.roundNumber(c.y,2),c.z=p.roundNumber(c.z,2),o[e]={id:e,neighbours:i,vertexIds:t.vertexIds,centroid:c,portals:h}}),n.groups[e]=o}),n}static _buildNavigationMesh(t,e){return t=p.mergeVertices(t,e),this._buildPolygonsFromGeometry(t)}static _spreadGroupId(t){let e=new Set([t]);for(;e.size>0;){const r=e;e=new Set,r.forEach(r=>{r.group=t.group,r.neighbours.forEach(t=>{void 0===t.group&&e.add(t)})})}}static _buildPolygonGroups(t){const e=[];return t.polygons.forEach(t=>{void 0!==t.group?e[t.group].push(t):(t.group=e.length,this._spreadGroupId(t),e.push([t]))}),e}static _buildPolygonNeighbours(t,e){const r=new Set,s=e[t.vertexIds[1]],n=e[t.vertexIds[2]];return e[t.vertexIds[0]].forEach(e=>{e!==t&&(s.includes(e)||n.includes(e))&&r.add(e)}),s.forEach(e=>{e!==t&&n.includes(e)&&r.add(e)}),r}static _buildPolygonsFromGeometry(t){const e=[],s=[],n=t.attributes.position,o=t.index,i=[];for(let t=0;t<n.count;t++)s.push((new three__WEBPACK_IMPORTED_MODULE_0__.Vector3).fromBufferAttribute(n,t)),i[t]=[];for(let r=0;r<t.index.count;r+=3){const t=o.getX(r),s=o.getX(r+1),n=o.getX(r+2),h={vertexIds:[t,s,n],neighbours:null};e.push(h),i[t].push(h),i[s].push(h),i[n].push(h)}return e.forEach(t=>{t.neighbours=this._buildPolygonNeighbours(t,i)}),{polygons:e,vertices:s}}static _getSharedVerticesInOrder(t,e){const r=t.vertexIds,s=r[0],n=r[1],o=r[2],i=e.vertexIds,h=i.includes(s),c=i.includes(n),a=i.includes(o);return h&&c&&a?Array.from(r):h&&c?[s,n]:c&&a?[n,o]:h&&a?[o,s]:(console.warn("Error processing navigation mesh neighbors; neighbors with <2 shared vertices found."),[])}}.buildZone(t,e)}setZoneData(t,e){this.zones[t]=e}getRandomNode(t,e,s,n){if(!this.zones[t])return new three__WEBPACK_IMPORTED_MODULE_0__.Vector3;s=s||null,n=n||0;const o=[];return this.zones[t].groups[e].forEach(t=>{s&&n?p.distanceToSquared(s,t.centroid)<n*n&&o.push(t.centroid):o.push(t.centroid)}),p.sample(o)||new three__WEBPACK_IMPORTED_MODULE_0__.Vector3}getClosestNode(t,e,r,s=!1){const n=this.zones[e].vertices;let o=null,i=Infinity;return this.zones[e].groups[r].forEach(e=>{const r=p.distanceToSquared(e.centroid,t);r<i&&(!s||p.isVectorInPolygon(t,e,n))&&(o=e,i=r)}),o}findPath(t,e,s,n){const o=this.zones[s].groups[n],i=this.zones[s].vertices,h=this.getClosestNode(t,s,n,!0),c=this.getClosestNode(e,s,n,!0);if(!h||!c)return null;const a=class{static init(t){for(let e=0;e<t.length;e++){const r=t[e];r.f=0,r.g=0,r.h=0,r.cost=1,r.visited=!1,r.closed=!1,r.parent=null}}static cleanUp(t){for(let e=0;e<t.length;e++){const r=t[e];delete r.f,delete r.g,delete r.h,delete r.cost,delete r.visited,delete r.closed,delete r.parent}}static heap(){return new g(function(t){return t.f})}static search(t,e,r){this.init(t);const s=this.heap();for(s.push(e);s.size()>0;){const e=s.pop();if(e===r){let t=e;const r=[];for(;t.parent;)r.push(t),t=t.parent;return this.cleanUp(r),r.reverse()}e.closed=!0;const n=this.neighbours(t,e);for(let t=0,o=n.length;t<o;t++){const o=n[t];if(o.closed)continue;const i=e.g+o.cost,h=o.visited;if(!h||i<o.g){if(o.visited=!0,o.parent=e,!o.centroid||!r.centroid)throw new Error("Unexpected state");o.h=o.h||this.heuristic(o.centroid,r.centroid),o.g=i,o.f=o.g+o.h,h?s.rescoreElement(o):s.push(o)}}}return[]}static heuristic(t,e){return p.distanceToSquared(t,e)}static neighbours(t,e){const r=[];for(let s=0;s<e.neighbours.length;s++)r.push(t[e.neighbours[s]]);return r}}.search(o,h,c),u=function(t,e){for(var r=0;r<t.neighbours.length;r++)if(t.neighbours[r]===e.id)return t.portals[r]},l=new f;l.push(t);for(let t=0;t<a.length;t++){const e=a[t],r=a[t+1];if(r){const t=u(e,r);l.push(i[t[0]],i[t[1]])}}l.push(e),l.stringPull();const d=l.path.map(t=>new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(t.x,t.y,t.z));return d.shift(),d}}v.prototype.getGroup=function(){const t=new three__WEBPACK_IMPORTED_MODULE_0__.Plane;return function(e,r,s=!1){if(!this.zones[e])return null;let n=null,o=Math.pow(50,2);const i=this.zones[e];for(let e=0;e<i.groups.length;e++){const h=i.groups[e];for(const c of h){if(s&&(t.setFromCoplanarPoints(i.vertices[c.vertexIds[0]],i.vertices[c.vertexIds[1]],i.vertices[c.vertexIds[2]]),Math.abs(t.distanceToPoint(r))<.01)&&p.isPointInPoly([i.vertices[c.vertexIds[0]],i.vertices[c.vertexIds[1]],i.vertices[c.vertexIds[2]]],r))return e;const h=p.distanceToSquared(c.centroid,r);h<o&&(n=e,o=h)}}return n}}(),v.prototype.clampStep=function(){const t=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3,e=new three__WEBPACK_IMPORTED_MODULE_0__.Plane,o=new three__WEBPACK_IMPORTED_MODULE_0__.Triangle,i=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3;let h,c,a=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3;return function(r,s,n,u,l,d){const p=this.zones[u].vertices,g=this.zones[u].groups[l],f=[n],v={};v[n.id]=0,h=void 0,a.set(0,0,0),c=Infinity,e.setFromCoplanarPoints(p[n.vertexIds[0]],p[n.vertexIds[1]],p[n.vertexIds[2]]),e.projectPoint(s,t),i.copy(t);for(let e=f.pop();e;e=f.pop()){o.set(p[e.vertexIds[0]],p[e.vertexIds[1]],p[e.vertexIds[2]]),o.closestPointToPoint(i,t),t.distanceToSquared(i)<c&&(h=e,a.copy(t),c=t.distanceToSquared(i));const r=v[e.id];if(!(r>2))for(let t=0;t<e.neighbours.length;t++){const s=g[e.neighbours[t]];s.id in v||(f.push(s),v[s.id]=r+1)}}return d.copy(a),h}}();const b={PLAYER:new three__WEBPACK_IMPORTED_MODULE_0__.Color(15631215).convertSRGBToLinear().getHex(),TARGET:new three__WEBPACK_IMPORTED_MODULE_0__.Color(14469912).convertSRGBToLinear().getHex(),PATH:new three__WEBPACK_IMPORTED_MODULE_0__.Color(41903).convertSRGBToLinear().getHex(),WAYPOINT:new three__WEBPACK_IMPORTED_MODULE_0__.Color(41903).convertSRGBToLinear().getHex(),CLAMPED_STEP:new three__WEBPACK_IMPORTED_MODULE_0__.Color(14472114).convertSRGBToLinear().getHex(),CLOSEST_NODE:new three__WEBPACK_IMPORTED_MODULE_0__.Color(4417387).convertSRGBToLinear().getHex()};class w extends three__WEBPACK_IMPORTED_MODULE_0__.Object3D{constructor(){super(),this._playerMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.SphereBufferGeometry(.25,32,32),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:b.PLAYER})),this._targetMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.BoxBufferGeometry(.3,.3,.3),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:b.TARGET})),this._nodeMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.BoxBufferGeometry(.1,.8,.1),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:b.CLOSEST_NODE})),this._stepMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.BoxBufferGeometry(.1,1,.1),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:b.CLAMPED_STEP})),this._pathMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Object3D,this._pathLineMaterial=new three__WEBPACK_IMPORTED_MODULE_0__.LineBasicMaterial({color:b.PATH,linewidth:2}),this._pathPointMaterial=new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:b.WAYPOINT}),this._pathPointGeometry=new three__WEBPACK_IMPORTED_MODULE_0__.SphereBufferGeometry(.08),this._markers=[this._playerMarker,this._targetMarker,this._nodeMarker,this._stepMarker,this._pathMarker],this._markers.forEach(t=>{t.visible=!1,this.add(t)})}setPath(r){for(;this._pathMarker.children.length;)this._pathMarker.children[0].visible=!1,this._pathMarker.remove(this._pathMarker.children[0]);r=[this._playerMarker.position].concat(r);const s=new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry;s.setAttribute("position",new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(3*r.length),3));for(let t=0;t<r.length;t++)s.attributes.position.setXYZ(t,r[t].x,r[t].y+.2,r[t].z);this._pathMarker.add(new three__WEBPACK_IMPORTED_MODULE_0__.Line(s,this._pathLineMaterial));for(let t=0;t<r.length-1;t++){const e=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(this._pathPointGeometry,this._pathPointMaterial);e.position.copy(r[t]),e.position.y+=.2,this._pathMarker.add(e)}return this._pathMarker.visible=!0,this}setPlayerPosition(t){return this._playerMarker.position.copy(t),this._playerMarker.visible=!0,this}setTargetPosition(t){return this._targetMarker.position.copy(t),this._targetMarker.visible=!0,this}setNodePosition(t){return this._nodeMarker.position.copy(t),this._nodeMarker.visible=!0,this}setStepPosition(t){return this._stepMarker.position.copy(t),this._stepMarker.visible=!0,this}reset(){for(;this._pathMarker.children.length;)this._pathMarker.children[0].visible=!1,this._pathMarker.remove(this._pathMarker.children[0]);return this._markers.forEach(t=>{t.visible=!1}),this}}
//# sourceMappingURL=three-pathfinding.module.js.map


/***/ }),

/***/ "./src/controls/checkpoint-controls.js":
/*!*********************************************!*\
  !*** ./src/controls/checkpoint-controls.js ***!
  \*********************************************/
/***/ ((module) => {

const EPS = 0.1;

module.exports = AFRAME.registerComponent('checkpoint-controls', {
  schema: {
    enabled: {default: true},
    mode: {default: 'teleport', oneOf: ['teleport', 'animate']},
    animateSpeed: {default: 3.0}
  },

  init: function () {
    this.active = true;
    this.checkpoint = null;

    this.isNavMeshConstrained = false;

    this.offset = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();
  },

  play: function () { this.active = true; },
  pause: function () { this.active = false; },

  setCheckpoint: function (checkpoint) {
    const el = this.el;

    if (!this.active) return;
    if (this.checkpoint === checkpoint) return;

    if (this.checkpoint) {
      el.emit('navigation-end', {checkpoint: this.checkpoint});
    }

    this.checkpoint = checkpoint;
    this.sync();

    // Ignore new checkpoint if we're already there.
    if (this.position.distanceTo(this.targetPosition) < EPS) {
      this.checkpoint = null;
      return;
    }

    el.emit('navigation-start', {checkpoint: checkpoint});

    if (this.data.mode === 'teleport') {
      this.el.setAttribute('position', this.targetPosition);
      this.checkpoint = null;
      el.emit('navigation-end', {checkpoint: checkpoint});
      el.components['movement-controls'].updateNavLocation();
    }
  },

  isVelocityActive: function () {
    return !!(this.active && this.checkpoint);
  },

  getVelocity: function () {
    if (!this.active) return;

    const data = this.data;
    const offset = this.offset;
    const position = this.position;
    const targetPosition = this.targetPosition;
    const checkpoint = this.checkpoint;

    this.sync();
    if (position.distanceTo(targetPosition) < EPS) {
      this.checkpoint = null;
      this.el.emit('navigation-end', {checkpoint: checkpoint});
      return offset.set(0, 0, 0);
    }
    offset.setLength(data.animateSpeed);
    return offset;
  },

  sync: function () {
    const offset = this.offset;
    const position = this.position;
    const targetPosition = this.targetPosition;

    position.copy(this.el.getAttribute('position'));
    this.checkpoint.object3D.getWorldPosition(targetPosition);
    targetPosition.add(this.checkpoint.components.checkpoint.getOffset());
    offset.copy(targetPosition).sub(position);
  }
});


/***/ }),

/***/ "./src/controls/gamepad-controls.js":
/*!******************************************!*\
  !*** ./src/controls/gamepad-controls.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Gamepad controls for A-Frame.
 *
 * Stripped-down version of: https://github.com/donmccurdy/aframe-gamepad-controls
 *
 * For more information about the Gamepad API, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
 */

const GamepadButton = __webpack_require__(/*! ../../lib/GamepadButton */ "./lib/GamepadButton.js"),
    GamepadButtonEvent = __webpack_require__(/*! ../../lib/GamepadButtonEvent */ "./lib/GamepadButtonEvent.js");

const JOYSTICK_EPS = 0.2;

const Hand = {
  LEFT: 'left',
  RIGHT: 'right'
};

const Joystick = {
  MOVEMENT: 1,
  ROTATION: 2
};

module.exports = AFRAME.registerComponent('gamepad-controls', {

  /*******************************************************************
   * Statics
   */

  GamepadButton: GamepadButton,

  /*******************************************************************
   * Schema
   */

  schema: {
    // Enable/disable gamepad-controls
    enabled: { default: true },

    // Rotation sensitivity
    rotationSensitivity: { default: 2.0 },
  },

  /*******************************************************************
   * Core
   */

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    const sceneEl = this.el.sceneEl;

    this.system = sceneEl.systems['tracked-controls-webxr'] || {controllers: []};

    this.prevTime = window.performance.now();

    // Button state
    this.buttons = {};

    // Rotation
    const rotation = this.el.object3D.rotation;
    this.pitch = new THREE.Object3D();
    this.pitch.rotation.x = rotation.x;
    this.yaw = new THREE.Object3D();
    this.yaw.position.y = 10;
    this.yaw.rotation.y = rotation.y;
    this.yaw.add(this.pitch);

    this._lookVector = new THREE.Vector2();
    this._moveVector = new THREE.Vector2();
    this._dpadVector = new THREE.Vector2();

    sceneEl.addBehavior(this);
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function () { this.tick(); },

  /**
   * Called on each iteration of main render loop.
   */
  tick: function (t, dt) {
    this.updateButtonState();
    this.updateRotation(dt);
  },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () { },

  /*******************************************************************
   * Movement
   */

  isVelocityActive: function () {
    if (!this.data.enabled || !this.isConnected()) return false;

    const dpad = this._dpadVector;
    const joystick = this._moveVector;

    this.getDpad(dpad);
    this.getJoystick(Joystick.MOVEMENT, joystick);

    const inputX = dpad.x || joystick.x;
    const inputY = dpad.y || joystick.y;

    return Math.abs(inputX) > JOYSTICK_EPS || Math.abs(inputY) > JOYSTICK_EPS;
  },

  getVelocityDelta: function () {
    const dpad = this._dpadVector;
    const joystick = this._moveVector;

    this.getDpad(dpad);
    this.getJoystick(Joystick.MOVEMENT, joystick);

    const inputX = dpad.x || joystick.x;
    const inputY = dpad.y || joystick.y;
    const dVelocity = new THREE.Vector3();

    if (Math.abs(inputX) > JOYSTICK_EPS) {
      dVelocity.x += inputX;
    }
    if (Math.abs(inputY) > JOYSTICK_EPS) {
      dVelocity.z += inputY;
    }

    return dVelocity;
  },

  /*******************************************************************
   * Rotation
   */

  isRotationActive: function () {
    if (!this.data.enabled || !this.isConnected()) return false;

    const joystick = this._lookVector;

    this.getJoystick(Joystick.ROTATION, joystick);

    return Math.abs(joystick.x) > JOYSTICK_EPS || Math.abs(joystick.y) > JOYSTICK_EPS;
  },

  updateRotation: function (dt) {
    if (!this.isRotationActive()) return;

    const data = this.data;
    const yaw = this.yaw;
    const pitch = this.pitch;

    // First copy camera rig pitch/yaw, it may have been changed from
    // another component.
    yaw.rotation.y = this.el.object3D.rotation.y;
    pitch.rotation.x = this.el.object3D.rotation.x;

    const lookVector = this._lookVector;

    this.getJoystick(Joystick.ROTATION, lookVector);

    if (Math.abs(lookVector.x) <= JOYSTICK_EPS) lookVector.x = 0;
    if (Math.abs(lookVector.y) <= JOYSTICK_EPS) lookVector.y = 0;

    lookVector.multiplyScalar(data.rotationSensitivity * dt / 1000);
    yaw.rotation.y -= lookVector.x;
    pitch.rotation.x -= lookVector.y;
    pitch.rotation.x = Math.max(- Math.PI / 2, Math.min(Math.PI / 2, pitch.rotation.x));
    this.el.object3D.rotation.set(pitch.rotation.x, yaw.rotation.y, 0);
  },

  /*******************************************************************
   * Button events
   */

  updateButtonState: function () {
    const gamepad = this.getGamepad(Hand.RIGHT);
    if (this.data.enabled && gamepad) {

      // Fire DOM events for button state changes.
      for (var i = 0; i < gamepad.buttons.length; i++) {
        if (gamepad.buttons[i].pressed && !this.buttons[i]) {
          this.emit(new GamepadButtonEvent('gamepadbuttondown', i, gamepad.buttons[i]));
        } else if (!gamepad.buttons[i].pressed && this.buttons[i]) {
          this.emit(new GamepadButtonEvent('gamepadbuttonup', i, gamepad.buttons[i]));
        }
        this.buttons[i] = gamepad.buttons[i].pressed;
      }

    } else if (Object.keys(this.buttons)) {
      // Reset state if controls are disabled or controller is lost.
      this.buttons = {};
    }
  },

  emit: function (event) {
    // Emit original event.
    this.el.emit(event.type, event);

    // Emit convenience event, identifying button index.
    this.el.emit(
      event.type + ':' + event.index,
      new GamepadButtonEvent(event.type, event.index, event)
    );
  },

  /*******************************************************************
   * Gamepad state
   */

  /**
   * Returns the Gamepad instance attached to the component. If connected,
   * a proxy-controls component may provide access to Gamepad input from a
   * remote device.
   *
   * @param {string} handPreference
   * @return {Gamepad}
   */
  getGamepad: (function () {
    const _xrGamepads = [];
    const _empty = [];

    return function (handPreference) {
      // https://github.com/donmccurdy/aframe-proxy-controls
      const proxyControls = this.el.sceneEl.components['proxy-controls'];
      const proxyGamepad = proxyControls && proxyControls.isConnected()
        && proxyControls.getGamepad(0);
      if (proxyGamepad) return proxyGamepad;

      // https://www.w3.org/TR/webxr/#dom-xrinputsource-handedness
      _xrGamepads.length = 0;
      for (let i = 0; i < this.system.controllers.length; i++) {
        const xrController = this.system.controllers[i];
        const xrGamepad = xrController ? xrController.gamepad : null;
        _xrGamepads.push(xrGamepad);
        if (xrGamepad && xrController.handedness === handPreference) return xrGamepad;
      }

      // https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/hand
      const navGamepads = navigator.getGamepads ? navigator.getGamepads() : _empty;
      for (let i = 0; i < navGamepads.length; i++) {
        const navGamepad = navGamepads[i];
        if (navGamepad && navGamepad.hand === handPreference) return navGamepad;
      }

      return _xrGamepads[0] || navGamepads[0];
    };
  })(),

  /**
   * Returns the state of the given button.
   * @param  {number} index The button (0-N) for which to find state.
   * @return {GamepadButton}
   */
  getButton: function (index) {
    return this.getGamepad(Hand.RIGHT).buttons[index];
  },

  /**
   * Returns state of the given axis. Axes are labelled 0-N, where 0-1 will
   * represent X/Y on the first joystick, and 2-3 X/Y on the second.
   * @param  {number} index The axis (0-N) for which to find state.
   * @return {number} On the interval [-1,1].
   */
  getAxis: function (index) {
    return this.getGamepad(index > 1 ? Hand.RIGHT : Hand.LEFT).axes[index];
  },

  /**
   * Returns the state of the specified joystick as a THREE.Vector2.
   * @param  {Joystick} role
   * @param  {THREE.Vector2} target
   * @return {THREE.Vector2}
   */
  getJoystick: function (index, target) {
    const gamepad = this.getGamepad(index === Joystick.MOVEMENT ? Hand.LEFT : Hand.RIGHT);
    // gamepad can be null here if it becomes disconnected even if isConnected() was called
    // in the same tick before calling getJoystick.
    if (!gamepad) {
      return target.set(0, 0);
    }
    if (gamepad.mapping === 'xr-standard') {
      // See: https://github.com/donmccurdy/aframe-extras/issues/307
      switch (index) {
        case Joystick.MOVEMENT: return target.set(gamepad.axes[2], gamepad.axes[3]);
        case Joystick.ROTATION: return target.set(gamepad.axes[2], 0);
      }
    } else {
      switch (index) {
        case Joystick.MOVEMENT: return target.set(gamepad.axes[0], gamepad.axes[1]);
        case Joystick.ROTATION: return target.set(gamepad.axes[2], gamepad.axes[3]);
      }
    }
    throw new Error('Unexpected joystick index "%d".', index);
  },

  /**
   * Returns the state of the dpad as a THREE.Vector2.
   * @param {THREE.Vector2} target
   * @return {THREE.Vector2}
   */
  getDpad: function (target) {
    const gamepad = this.getGamepad(Hand.LEFT);
    if (!gamepad) {
      return target.set(0, 0);
    }
    if (!gamepad.buttons[GamepadButton.DPAD_RIGHT]) {
      return target.set(0, 0);
    }
    return target.set(
      (gamepad.buttons[GamepadButton.DPAD_RIGHT].pressed ? 1 : 0)
      + (gamepad.buttons[GamepadButton.DPAD_LEFT].pressed ? -1 : 0),
      (gamepad.buttons[GamepadButton.DPAD_UP].pressed ? -1 : 0)
      + (gamepad.buttons[GamepadButton.DPAD_DOWN].pressed ? 1 : 0)
    );
  },

  /**
   * Returns true if the gamepad is currently connected to the system.
   * @return {boolean}
   */
  isConnected: function () {
    const gamepad = this.getGamepad(Hand.LEFT);
    return !!(gamepad && gamepad.connected);
  },

  /**
   * Returns a string containing some information about the controller. Result
   * may vary across browsers, for a given controller.
   * @return {string}
   */
  getID: function () {
    return this.getGamepad(Hand.LEFT).id;
  }
});


/***/ }),

/***/ "./src/controls/index.js":
/*!*******************************!*\
  !*** ./src/controls/index.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(/*! ./checkpoint-controls */ "./src/controls/checkpoint-controls.js");
__webpack_require__(/*! ./gamepad-controls */ "./src/controls/gamepad-controls.js");
__webpack_require__(/*! ./keyboard-controls */ "./src/controls/keyboard-controls.js");
__webpack_require__(/*! ./touch-controls */ "./src/controls/touch-controls.js");
__webpack_require__(/*! ./movement-controls */ "./src/controls/movement-controls.js");
__webpack_require__(/*! ./trackpad-controls */ "./src/controls/trackpad-controls.js");
__webpack_require__(/*! ./nipple-controls */ "./src/controls/nipple-controls.js");


/***/ }),

/***/ "./src/controls/keyboard-controls.js":
/*!*******************************************!*\
  !*** ./src/controls/keyboard-controls.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* global AFRAME, THREE */
/* eslint-disable no-prototype-builtins */
__webpack_require__(/*! ../../lib/keyboard.polyfill */ "./lib/keyboard.polyfill.js");

const PROXY_FLAG = '__keyboard-controls-proxy';

const KeyboardEvent = window.KeyboardEvent;

/**
 * Keyboard Controls component.
 *
 * Stripped-down version of: https://github.com/donmccurdy/aframe-keyboard-controls
 *
 * Bind keyboard events to components, or control your entities with the WASD keys.
 *
 * Why use KeyboardEvent.code? "This is set to a string representing the key that was pressed to
 * generate the KeyboardEvent, without taking the current keyboard layout (e.g., QWERTY vs.
 * Dvorak), locale (e.g., English vs. French), or any modifier keys into account. This is useful
 * when you care about which physical key was pressed, rather thanwhich character it corresponds
 * to. For example, if you’re a writing a game, you might want a certain set of keys to move the
 * player in different directions, and that mapping should ideally be independent of keyboard
 * layout. See: https://developers.google.com/web/updates/2016/04/keyboardevent-keys-codes
 *
 * @namespace wasd-controls
 * keys the entity moves and if you release it will stop. Easing simulates friction.
 * to the entity when pressing the keys.
 * @param {bool} [enabled=true] - To completely enable or disable the controls
 */
module.exports = AFRAME.registerComponent('keyboard-controls', {
  schema: {
    enabled:           { default: true },
    debug:             { default: false }
  },

  init: function () {
    this.dVelocity = new THREE.Vector3();
    this.localKeys = {};
    this.listeners = {
      keydown: this.onKeyDown.bind(this),
      keyup: this.onKeyUp.bind(this),
      blur: this.onBlur.bind(this),
      onContextMenu: this.onContextMenu.bind(this),
    };
  },

  /*******************************************************************
  * Movement
  */

  isVelocityActive: function () {
    return this.data.enabled && !!Object.keys(this.getKeys()).length;
  },

  getVelocityDelta: function () {
    const data = this.data;
    const keys = this.getKeys();

    this.dVelocity.set(0, 0, 0);
    if (data.enabled) {
      if (keys.KeyW || keys.ArrowUp)    { this.dVelocity.z -= 1; }
      if (keys.KeyA || keys.ArrowLeft)  { this.dVelocity.x -= 1; }
      if (keys.KeyS || keys.ArrowDown)  { this.dVelocity.z += 1; }
      if (keys.KeyD || keys.ArrowRight) { this.dVelocity.x += 1; }
    }

    return this.dVelocity.clone();
  },

  /*******************************************************************
  * Events
  */

  play: function () {
    this.attachEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
  },

  attachEventListeners: function () {
    window.addEventListener("contextmenu", this.listeners.onContextMenu, false);
    window.addEventListener("keydown", this.listeners.keydown, false);
    window.addEventListener("keyup", this.listeners.keyup, false);
    window.addEventListener("blur", this.listeners.blur, false);
  },

  onContextMenu: function () {
    for (const code in this.localKeys) {
      if (this.localKeys.hasOwnProperty(code)) {
        delete this.localKeys[code];
      }
    }
  },

  removeEventListeners: function () {
    window.removeEventListener('keydown', this.listeners.keydown);
    window.removeEventListener('keyup', this.listeners.keyup);
    window.removeEventListener('blur', this.listeners.blur);
  },

  onKeyDown: function (event) {
    if (AFRAME.utils.shouldCaptureKeyEvent(event)) {
      this.localKeys[event.code] = true;
      this.emit(event);
    }
  },

  onKeyUp: function (event) {
    if (AFRAME.utils.shouldCaptureKeyEvent(event)) {
      delete this.localKeys[event.code];
      this.emit(event);
    }
  },

  onBlur: function () {
    for (const code in this.localKeys) {
      if (this.localKeys.hasOwnProperty(code)) {
        delete this.localKeys[code];
      }
    }
  },

  emit: function (event) {
    // TODO - keydown only initially?
    // TODO - where the f is the spacebar

    // Emit original event.
    if (PROXY_FLAG in event) {
      // TODO - Method never triggered.
      this.el.emit(event.type, event);
    }

    // Emit convenience event, identifying key.
    this.el.emit(event.type + ':' + event.code, new KeyboardEvent(event.type, event));
    if (this.data.debug) console.log(event.type + ':' + event.code);
  },

  /*******************************************************************
  * Accessors
  */

  isPressed: function (code) {
    return code in this.getKeys();
  },

  getKeys: function () {
    if (this.isProxied()) {
      return this.el.sceneEl.components['proxy-controls'].getKeyboard();
    }
    return this.localKeys;
  },

  isProxied: function () {
    const proxyControls = this.el.sceneEl.components['proxy-controls'];
    return proxyControls && proxyControls.isConnected();
  }

});


/***/ }),

/***/ "./src/controls/movement-controls.js":
/*!*******************************************!*\
  !*** ./src/controls/movement-controls.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * Movement Controls
 *
 * @author Don McCurdy <dm@donmccurdy.com>
 */

const COMPONENT_SUFFIX = '-controls',
    MAX_DELTA = 0.2, // ms
    EPS = 10e-6;

module.exports = AFRAME.registerComponent('movement-controls', {

  /*******************************************************************
   * Schema
   */

  dependencies: ['rotation'],

  schema: {
    enabled:            { default: true },
    controls:           { default: ['gamepad', 'trackpad', 'keyboard', 'touch'] },
    speed:              { default: 0.3, min: 0 },
    fly:                { default: false },
    constrainToNavMesh: { default: false },
    camera:             { default: '[movement-controls] [camera]', type: 'selector' }
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function () {
    const el = this.el;
    if (!this.data.camera) {
      this.data.camera = el.querySelector('[camera]')
    }
    this.velocityCtrl = null;

    this.velocity = new THREE.Vector3();
    this.heading = new THREE.Quaternion();

    // Navigation
    this.navGroup = null;
    this.navNode = null;

    if (el.sceneEl.hasLoaded) {
      this.injectControls();
    } else {
      el.sceneEl.addEventListener('loaded', this.injectControls.bind(this));
    }
  },

  update: function (prevData) {
    const el = this.el;
    const data = this.data;
    const nav = el.sceneEl.systems.nav;
    if (el.sceneEl.hasLoaded) {
      this.injectControls();
    }
    if (nav && data.constrainToNavMesh !== prevData.constrainToNavMesh) {
      data.constrainToNavMesh
        ? nav.addAgent(this)
        : nav.removeAgent(this);
    }
    if (data.enabled !== prevData.enabled) {
      // Propagate the enabled change to all controls
      for (let i = 0; i < data.controls.length; i++) {
        const name = data.controls[i] + COMPONENT_SUFFIX;
        this.el.setAttribute(name, { enabled: this.data.enabled });
      }
    }
  },

  injectControls: function () {
    const data = this.data;

    for (let i = 0; i < data.controls.length; i++) {
      const name = data.controls[i] + COMPONENT_SUFFIX;
      this.el.setAttribute(name, { enabled: this.data.enabled });
    }
  },

  updateNavLocation: function () {
    this.navGroup = null;
    this.navNode = null;
  },

  /*******************************************************************
   * Tick
   */

  tick: (function () {
    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    const clampedEnd = new THREE.Vector3();

    return function (t, dt) {
      if (!dt) return;

      const el = this.el;
      const data = this.data;

      if (!data.enabled) return;

      this.updateVelocityCtrl();
      const velocityCtrl = this.velocityCtrl;
      const velocity = this.velocity;

      if (!velocityCtrl) return;

      // Update velocity. If FPS is too low, reset.
      if (dt / 1000 > MAX_DELTA) {
        velocity.set(0, 0, 0);
      } else {
        this.updateVelocity(dt);
      }

      if (data.constrainToNavMesh
          && velocityCtrl.isNavMeshConstrained !== false) {

        if (velocity.lengthSq() < EPS) return;

        start.copy(el.object3D.position);
        end
          .copy(velocity)
          .multiplyScalar(dt / 1000)
          .add(start);

        const nav = el.sceneEl.systems.nav;
        this.navGroup = this.navGroup === null ? nav.getGroup(start) : this.navGroup;
        this.navNode = this.navNode || nav.getNode(start, this.navGroup);
        this.navNode = nav.clampStep(start, end, this.navGroup, this.navNode, clampedEnd);
        el.object3D.position.copy(clampedEnd);
      } else if (el.hasAttribute('velocity')) {
        el.setAttribute('velocity', velocity);
      } else {
        el.object3D.position.x += velocity.x * dt / 1000;
        el.object3D.position.y += velocity.y * dt / 1000;
        el.object3D.position.z += velocity.z * dt / 1000;
      }

    };
  }()),

  /*******************************************************************
   * Movement
   */

  updateVelocityCtrl: function () {
    const data = this.data;
    if (data.enabled) {
      for (let i = 0, l = data.controls.length; i < l; i++) {
        const control = this.el.components[data.controls[i] + COMPONENT_SUFFIX];
        if (control && control.isVelocityActive()) {
          this.velocityCtrl = control;
          return;
        }
      }
      this.velocityCtrl = null;
    }
  },

  updateVelocity: (function () {
    const vector2 = new THREE.Vector2();
    const quaternion = new THREE.Quaternion();

    return function (dt) {
      let dVelocity;
      const el = this.el;
      const control = this.velocityCtrl;
      const velocity = this.velocity;
      const data = this.data;

      if (control) {
        if (control.getVelocityDelta) {
          dVelocity = control.getVelocityDelta(dt);
        } else if (control.getVelocity) {
          velocity.copy(control.getVelocity());
          return;
        } else if (control.getPositionDelta) {
          velocity.copy(control.getPositionDelta(dt).multiplyScalar(1000 / dt));
          return;
        } else {
          throw new Error('Incompatible movement controls: ', control);
        }
      }

      if (el.hasAttribute('velocity') && !data.constrainToNavMesh) {
        velocity.copy(this.el.getAttribute('velocity'));
      }

      if (dVelocity && data.enabled) {
        const cameraEl = data.camera;

        // Rotate to heading
        quaternion.copy(cameraEl.object3D.quaternion);
        quaternion.premultiply(el.object3D.quaternion);
        dVelocity.applyQuaternion(quaternion);

        const factor = dVelocity.length();
        if (data.fly) {
          velocity.copy(dVelocity);
          velocity.multiplyScalar(this.data.speed * 16.66667);
        } else {
          vector2.set(dVelocity.x, dVelocity.z);
          vector2.setLength(factor * this.data.speed * 16.66667);
          velocity.x = vector2.x;
          velocity.y = 0;
          velocity.z = vector2.y;
        }
      }
    };

  }())
});


/***/ }),

/***/ "./src/controls/nipple-controls.js":
/*!*****************************************!*\
  !*** ./src/controls/nipple-controls.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var nipplejs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! nipplejs */ "./node_modules/nipplejs/dist/nipplejs.js");
/* harmony import */ var nipplejs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(nipplejs__WEBPACK_IMPORTED_MODULE_0__);
/* global AFRAME, THREE */


AFRAME.registerComponent("nipple-controls", {
  schema: {
    enabled: { default: true },
    mode: { default: "dynamic", oneOf: ["static", "semi", "dynamic"] },
    rotationSensitivity: { default: 1.0 },
    moveJoystickEnabled: { default: true },
    lookJoystickEnabled: { default: true },
    sideMargin: { default: "30px" },
    bottomMargin: { default: "70px" },
    moveJoystickPosition: { default: "left", oneOf: ["left", "right"] },
    lookJoystickPosition: { default: "right", oneOf: ["left", "right"] },
  },

  init() {
    this.dVelocity = new THREE.Vector3();
    this.lookVector = new THREE.Vector2();
    const lookControls = this.el.querySelector("[look-controls]").components["look-controls"];
    this.pitchObject = lookControls.pitchObject;
    this.yawObject = lookControls.yawObject;
    this.rigRotation = this.el.object3D.rotation;
    this.moveData = undefined;
    this.lookData = undefined;
    this.moving = false;
    this.rotating = false;
  },

  update(oldData) {
    if (
      this.data.moveJoystickPosition !== oldData.moveJoystickPosition ||
      this.data.sideMargin !== oldData.sideMargin ||
      this.data.bottomMargin !== oldData.bottomMargin ||
      this.data.mode !== oldData.mode
    ) {
      this.removeMoveJoystick();
    }
    if (
      this.data.lookJoystickPosition !== oldData.lookJoystickPosition ||
      this.data.sideMargin !== oldData.sideMargin ||
      this.data.bottomMargin !== oldData.bottomMargin ||
      this.data.mode !== oldData.mode
    ) {
      this.removeLookJoystick();
    }
    if (this.data.enabled && this.data.moveJoystickEnabled) {
      this.createMoveJoystick();
    } else {
      this.removeMoveJoystick();
    }
    if (this.data.enabled && this.data.lookJoystickEnabled) {
      this.createLookJoystick();
    } else {
      this.removeLookJoystick();
    }
  },

  pause() {
    this.moving = false;
    this.rotating = false;
  },

  remove() {
    this.removeMoveJoystick();
    this.removeLookJoystick();
  },

  isVelocityActive() {
    return this.data.enabled && this.moving;
  },

  getVelocityDelta() {
    this.dVelocity.set(0, 0, 0);
    if (this.isVelocityActive()) {
      const force = this.moveData.force < 1 ? this.moveData.force : 1;
      const angle = this.moveData.angle.radian;
      const x = Math.cos(angle) * force;
      const z = -Math.sin(angle) * force;
      this.dVelocity.set(x, 0, z);
    }
    return this.dVelocity; // We don't do a clone() here, the Vector3 will be modified by the calling code but that's fine.
  },

  isRotationActive() {
    return this.data.enabled && this.rotating;
  },

  updateRotation(dt) {
    if (!this.isRotationActive()) return;

    const force = this.lookData.force < 1 ? this.lookData.force : 1;
    const angle = this.lookData.angle.radian;
    const lookVector = this.lookVector;
    lookVector.x = Math.cos(angle) * force;
    lookVector.y = Math.sin(angle) * force;
    lookVector.multiplyScalar((this.data.rotationSensitivity * dt) / 1000);

    this.yawObject.rotation.y -= lookVector.x;
    let x = this.pitchObject.rotation.x + lookVector.y;
    x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, x));
    this.pitchObject.rotation.x = x;
  },

  tick: function (t, dt) {
    this.updateRotation(dt);
  },

  initLeftZone() {
    const leftZone = document.createElement("div");
    leftZone.setAttribute("id", "joystickLeftZone");
    leftZone.setAttribute(
      "style",
      `position:absolute;${this.data.moveJoystickPosition}:${this.data.sideMargin};bottom:${this.data.bottomMargin};z-index:1`
    );
    document.body.appendChild(leftZone);
    this.leftZone = leftZone;
  },

  initRightZone() {
    const rightZone = document.createElement("div");
    rightZone.setAttribute("id", "joystickRightZone");
    rightZone.setAttribute(
      "style",
      `position:absolute;${this.data.lookJoystickPosition}:${this.data.sideMargin};bottom:${this.data.bottomMargin};z-index:1`
    );
    document.body.appendChild(rightZone);
    this.rightZone = rightZone;
  },

  createMoveJoystick() {
    if (this.moveJoystick) return;
    this.initLeftZone();
    const options = {
      mode: this.data.mode,
      zone: this.leftZone,
      color: "white",
      fadeTime: 0,
    };
    this.leftZone.style.width = "100px";
    if (this.data.mode === "static") {
      this.leftZone.style.height = "100px";
      options.position = { left: "50%", bottom: "50%" };
    } else {
      this.leftZone.style.height = "400px";
    }

    this.moveJoystick = nipplejs__WEBPACK_IMPORTED_MODULE_0___default().create(options);
    this.moveJoystick.on("move", (evt, data) => {
      this.moveData = data;
      this.moving = true;
    });
    this.moveJoystick.on("end", (evt, data) => {
      this.moving = false;
    });
  },

  createLookJoystick() {
    if (this.lookJoystick) return;
    this.initRightZone();
    const options = {
      mode: this.data.mode,
      zone: this.rightZone,
      color: "white",
      fadeTime: 0,
    };
    this.rightZone.style.width = "100px";
    if (this.data.mode === "static") {
      this.rightZone.style.height = "100px";
      options.position = { left: "50%", bottom: "50%" };
    } else {
      this.rightZone.style.height = "400px";
    }

    this.lookJoystick = nipplejs__WEBPACK_IMPORTED_MODULE_0___default().create(options);
    this.lookJoystick.on("move", (evt, data) => {
      this.lookData = data;
      this.rotating = true;
    });
    this.lookJoystick.on("end", (evt, data) => {
      this.rotating = false;
    });
  },

  removeMoveJoystick() {
    if (this.moveJoystick) {
      this.moveJoystick.destroy();
      this.moveJoystick = undefined;
    }

    this.moveData = undefined;

    if (this.leftZone && this.leftZone.parentNode) {
      this.leftZone.remove();
      this.leftZone = undefined;
    }
  },

  removeLookJoystick() {
    if (this.lookJoystick) {
      this.lookJoystick.destroy();
      this.lookJoystick = undefined;
    }

    this.lookData = undefined;

    if (this.rightZone && this.rightZone.parentNode) {
      this.rightZone.remove();
      this.rightZone = undefined;
    }
  },
});


/***/ }),

/***/ "./src/controls/touch-controls.js":
/*!****************************************!*\
  !*** ./src/controls/touch-controls.js ***!
  \****************************************/
/***/ ((module) => {

/**
 * Touch-to-move-forward controls for mobile.
 */
module.exports = AFRAME.registerComponent('touch-controls', {
  schema: {
    enabled: { default: true },
    reverseEnabled: { default: true }
  },

  init: function () {
    this.dVelocity = new THREE.Vector3();
    this.bindMethods();
    this.direction = 0;
  },

  play: function () {
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
    this.dVelocity.set(0, 0, 0);
  },

  remove: function () {
    this.pause();
  },

  addEventListeners: function () {
    const sceneEl = this.el.sceneEl;
    const canvasEl = sceneEl.canvas;

    if (!canvasEl) {
      sceneEl.addEventListener('render-target-loaded', this.addEventListeners.bind(this));
      return;
    }

    canvasEl.addEventListener('touchstart', this.onTouchStart);
    canvasEl.addEventListener('touchend', this.onTouchEnd);
    const vrModeUI = sceneEl.getAttribute('vr-mode-ui');
    if (vrModeUI && vrModeUI.cardboardModeEnabled) {
      sceneEl.addEventListener('enter-vr', this.onEnterVR);
    }
  },

  removeEventListeners: function () {
    const canvasEl = this.el.sceneEl && this.el.sceneEl.canvas;
    if (!canvasEl) { return; }

    canvasEl.removeEventListener('touchstart', this.onTouchStart);
    canvasEl.removeEventListener('touchend', this.onTouchEnd);
    this.el.sceneEl.removeEventListener('enter-vr', this.onEnterVR)
  },

  isVelocityActive: function () {
    return this.data.enabled && !!this.direction;
  },

  getVelocityDelta: function () {
    this.dVelocity.z = this.direction;
    return this.dVelocity.clone();
  },

  bindMethods: function () {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onEnterVR = this.onEnterVR.bind(this);
  },

  onTouchStart: function (e) {
    this.direction = -1;
    if (this.data.reverseEnabled && e.touches && e.touches.length === 2) {
      this.direction = 1;
    }
    e.preventDefault();
  },

  onTouchEnd: function (e) {
    this.direction = 0;
    e.preventDefault();
  },

  onEnterVR: function () {
    // This is to make the Cardboard button on Chrome Android working
    const xrSession = this.el.sceneEl.xrSession;
    if (!xrSession) { return; }
    xrSession.addEventListener('selectstart', this.onTouchStart);
    xrSession.addEventListener('selectend', this.onTouchEnd);
  }
});


/***/ }),

/***/ "./src/controls/trackpad-controls.js":
/*!*******************************************!*\
  !*** ./src/controls/trackpad-controls.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * 3dof (Gear VR, Daydream) controls for mobile.
 */
module.exports = AFRAME.registerComponent('trackpad-controls', {
  schema: {
    enabled: { default: true },
    enableNegX: { default: true },
    enablePosX: { default: true },
    enableNegZ: { default: true },
    enablePosZ: { default: true },
    mode: { default: 'touch', oneOf: ['swipe', 'touch', 'press'] }

  },

  init: function () {
    this.dVelocity = new THREE.Vector3();
    this.zVel      = 0;
    this.xVel      = 0;
    this.bindMethods();
  },

  play: function () {
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
    this.dVelocity.set(0, 0, 0);
  },

  remove: function () {
    this.pause();
  },

  addEventListeners: function () {
    const data = this.data;
    const sceneEl = this.el.sceneEl;

    sceneEl.addEventListener('axismove', this.onAxisMove);

    switch (data.mode) {
      case 'swipe':
      case 'touch':
        sceneEl.addEventListener('trackpadtouchstart', this.onTouchStart);
        sceneEl.addEventListener('trackpadtouchend', this.onTouchEnd);
        break;

      case 'press':
        sceneEl.addEventListener('trackpaddown', this.onTouchStart);
        sceneEl.addEventListener('trackpadup', this.onTouchEnd);
        break;
    }

  },

  removeEventListeners: function () {
    const sceneEl = this.el.sceneEl;

    sceneEl.removeEventListener('axismove', this.onAxisMove);
    sceneEl.removeEventListener('trackpadtouchstart', this.onTouchStart);
    sceneEl.removeEventListener('trackpadtouchend', this.onTouchEnd);
    sceneEl.removeEventListener('trackpaddown', this.onTouchStart);
    sceneEl.removeEventListener('trackpadup', this.onTouchEnd);
  },

  isVelocityActive: function () {
    return this.data.enabled && this.isMoving;
  },

  getVelocityDelta: function () {
    this.dVelocity.z = this.isMoving ? -this.zVel : 1;
    this.dVelocity.x = this.isMoving ? this.xVel : 1;
    return this.dVelocity.clone();
  },

  bindMethods: function () {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onAxisMove = this.onAxisMove.bind(this);
  },

  onTouchStart: function (e) {
    switch(this.data.mode){
      case 'swipe':
        this.canRecordAxis = true;
        this.startingAxisData = [];
        break;
      case 'touch':
        this.isMoving = true;
        break;
      case 'press':
        this.isMoving = true;
        break;
    }

    e.preventDefault();
  },

  onTouchEnd: function (e) {
    if(this.data.mode == 'swipe') {
        this.startingAxisData = [];
    }

    this.isMoving = false;
    e.preventDefault();
  },

  onAxisMove: function(e){
    switch (this.data.mode) {
      case 'swipe':
        return this.handleSwipeAxis(e);
      case 'touch':
      case 'press':
        return this.handleTouchAxis(e);
    }
  },

  handleSwipeAxis: function(e) {
    const data = this.data;
    const axisData = e.detail.axis;

    if(this.startingAxisData.length === 0 && this.canRecordAxis){
      this.canRecordAxis = false;
      this.startingAxisData[0] = axisData[0];
      this.startingAxisData[1] = axisData[1];
    }

    if(this.startingAxisData.length > 0){
      let velX = 0;
      let velZ = 0;

      if (data.enableNegX && axisData[0] < this.startingAxisData[0]) {
        velX = -1;
      }

      if (data.enablePosX && axisData[0] > this.startingAxisData[0]) {
        velX = 1;
      }

      if (data.enablePosZ && axisData[1] > this.startingAxisData[1]) {
        velZ = -1;
      }

      if (data.enableNegZ && axisData[1] < this.startingAxisData[1]) {
        velZ = 1;
      }

      const absChangeZ  = Math.abs(this.startingAxisData[1] - axisData[1]);
      const absChangeX  = Math.abs(this.startingAxisData[0] - axisData[0]);

      if (absChangeX > absChangeZ) {
        this.zVel = 0;
        this.xVel = velX;
        this.isMoving = true;
      } else {
        this.xVel = 0;
        this.zVel = velZ;
        this.isMoving = true;
      }

    }
  },

  handleTouchAxis: function(e) {
    const data = this.data;
    const axisData = e.detail.axis;

    let velX = 0;
    let velZ = 0;

    if (data.enableNegX && axisData[0] < 0) {
      velX = -1;
    }

    if (data.enablePosX && axisData[0] > 0) {
      velX = 1;
    }

    if (data.enablePosZ && axisData[1] > 0) {
      velZ = -1;
    }

    if (data.enableNegZ && axisData[1] < 0) {
      velZ = 1;
    }

    if (Math.abs(axisData[0]) > Math.abs(axisData[1])) {
      this.zVel = 0;
      this.xVel = velX;
    } else {
      this.xVel = 0;
      this.zVel = velZ;
    }

  }

});



/***/ }),

/***/ "./src/loaders/animation-mixer.js":
/*!****************************************!*\
  !*** ./src/loaders/animation-mixer.js ***!
  \****************************************/
/***/ ((module) => {

const LoopMode = {
  once: THREE.LoopOnce,
  repeat: THREE.LoopRepeat,
  pingpong: THREE.LoopPingPong
};

/**
 * animation-mixer
 *
 * Player for animation clips. Intended to be compatible with any model format that supports
 * skeletal or morph animations through THREE.AnimationMixer.
 * See: https://threejs.org/docs/?q=animation#Reference/Animation/AnimationMixer
 */
module.exports = AFRAME.registerComponent('animation-mixer', {
  schema: {
    clip: { default: '*' },
    useRegExp: {default: false},
    duration: { default: 0 },
    clampWhenFinished: { default: false, type: 'boolean' },
    crossFadeDuration: { default: 0 },
    loop: { default: 'repeat', oneOf: Object.keys(LoopMode) },
    repetitions: { default: Infinity, min: 0 },
    timeScale: { default: 1 },
    startAt: { default: 0 }
  },

  init: function () {
    /** @type {THREE.Mesh} */
    this.model = null;
    /** @type {THREE.AnimationMixer} */
    this.mixer = null;
    /** @type {Array<THREE.AnimationAction>} */
    this.activeActions = [];

    const model = this.el.getObject3D('mesh');

    if (model) {
      this.load(model);
    } else {
      this.el.addEventListener('model-loaded', (e) => {
        this.load(e.detail.model);
      });
    }
  },

  load: function (model) {
    const el = this.el;
    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);
    this.mixer.addEventListener('loop', (e) => {
      el.emit('animation-loop', { action: e.action, loopDelta: e.loopDelta });
    });
    this.mixer.addEventListener('finished', (e) => {
      el.emit('animation-finished', { action: e.action, direction: e.direction });
    });
    if (this.data.clip) this.update({});
  },

  remove: function () {
    if (this.mixer) this.mixer.stopAllAction();
  },

  update: function (prevData) {
    if (!prevData) return;

    const data = this.data;
    const changes = AFRAME.utils.diff(data, prevData);

    // If selected clips have changed, restart animation.
    if ('clip' in changes) {
      this.stopAction();
      if (data.clip) this.playAction();
      return;
    }

    // Otherwise, modify running actions.
    this.activeActions.forEach((action) => {
      if ('duration' in changes && data.duration) {
        action.setDuration(data.duration);
      }
      if ('clampWhenFinished' in changes) {
        action.clampWhenFinished = data.clampWhenFinished;
      }
      if ('loop' in changes || 'repetitions' in changes) {
        action.setLoop(LoopMode[data.loop], data.repetitions);
      }
      if ('timeScale' in changes) {
        action.setEffectiveTimeScale(data.timeScale);
      }
    });
  },

  stopAction: function () {
    const data = this.data;
    for (let i = 0; i < this.activeActions.length; i++) {
      data.crossFadeDuration
        ? this.activeActions[i].fadeOut(data.crossFadeDuration)
        : this.activeActions[i].stop();
    }
    this.activeActions.length = 0;
  },

  playAction: function () {
    if (!this.mixer) return;

    const model = this.model,
      data = this.data,
      clips = model.animations || (model.geometry || {}).animations || [];

    if (!clips.length) return;

    const re = data.useRegExp ? data.clip : wildcardToRegExp(data.clip);

    for (let clip, i = 0; (clip = clips[i]); i++) {
      if (clip.name.match(re)) {
        const action = this.mixer.clipAction(clip, model);

        action.enabled = true;
        action.clampWhenFinished = data.clampWhenFinished;
        if (data.duration) action.setDuration(data.duration);
        if (data.timeScale !== 1) action.setEffectiveTimeScale(data.timeScale);
        // animation-mixer.startAt and AnimationAction.startAt have very different meanings.
        // animation-mixer.startAt indicates which frame in the animation to start at, in msecs.
        // AnimationAction.startAt indicates when to start the animation (from the 1st frame),
        // measured in global mixer time, in seconds.
        action.startAt(this.mixer.time - data.startAt / 1000);
        action
          .setLoop(LoopMode[data.loop], data.repetitions)
          .fadeIn(data.crossFadeDuration)
          .play();
        this.activeActions.push(action);
      }
    }
  },

  tick: function (t, dt) {
    if (this.mixer && !isNaN(dt)) this.mixer.update(dt / 1000);
  }
});

/**
 * Creates a RegExp from the given string, converting asterisks to .* expressions,
 * and escaping all other characters.
 */
function wildcardToRegExp(s) {
  return new RegExp('^' + s.split(/\*+/).map(regExpEscape).join('.*') + '$');
}

/**
 * RegExp-escapes all characters in the given string.
 */
function regExpEscape(s) {
  return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}


/***/ }),

/***/ "./src/loaders/collada-model-legacy.js":
/*!*********************************************!*\
  !*** ./src/loaders/collada-model-legacy.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

THREE.ColladaLoader = __webpack_require__(/*! ../../lib/ColladaLoader */ "./lib/ColladaLoader.js");

/**
 * collada-model-legacy
 *
 * Loader for COLLADA (.dae) format.
 */
module.exports.Component = AFRAME.registerComponent('collada-model-legacy', {
  schema: {type: 'asset'},

  init: function () {
    this.model = null;
    this.loader = new THREE.ColladaLoader();
  },

  update: function () {
    var self = this;
    var el = this.el;
    var src = this.data;
    var rendererSystem = this.el.sceneEl.systems.renderer;

    if (!src) { return; }

    this.remove();

    this.loader.load(src, function (colladaModel) {
      self.model = colladaModel.scene;
      self.model.traverse(function (object) {
        if (object.isMesh) {
          var material = object.material;
          if (material.color) rendererSystem.applyColorCorrection(material.color);
          if (material.map) rendererSystem.applyColorCorrection(material.map);
          if (material.emissive) rendererSystem.applyColorCorrection(material.emissive);
          if (material.emissiveMap) rendererSystem.applyColorCorrection(material.emissiveMap);
        }
      });
      el.setObject3D('mesh', self.model);
      el.emit('model-loaded', {format: 'collada', model: self.model});
    });
  },

  remove: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  }
});


/***/ }),

/***/ "./src/loaders/fbx-model.js":
/*!**********************************!*\
  !*** ./src/loaders/fbx-model.js ***!
  \**********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

THREE.FBXLoader = __webpack_require__(/*! ../../lib/FBXLoader */ "./lib/FBXLoader.js");

/**
 * fbx-model
 *
 * Loader for FBX format. Supports ASCII, but *not* binary, models.
 */
module.exports = AFRAME.registerComponent('fbx-model', {
  schema: {
    src:         { type: 'asset' },
    crossorigin: { default: '' }
  },

  init: function () {
    this.model = null;
  },

  update: function () {
    const data = this.data;
    if (!data.src) return;

    this.remove();
    const loader = new THREE.FBXLoader();
    if (data.crossorigin) loader.setCrossOrigin(data.crossorigin);
    loader.load(data.src, this.load.bind(this));
  },

  load: function (model) {
    this.model = model;
    this.el.setObject3D('mesh', model);
    this.el.emit('model-loaded', {format: 'fbx', model: model});
  },

  remove: function () {
    if (this.model) this.el.removeObject3D('mesh');
  }
});


/***/ }),

/***/ "./src/loaders/gltf-model-legacy.js":
/*!******************************************!*\
  !*** ./src/loaders/gltf-model-legacy.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const fetchScript = __webpack_require__(/*! ../../lib/fetch-script */ "./lib/fetch-script.js")();

const LOADER_SRC = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r86/examples/js/loaders/GLTFLoader.js';

const loadLoader = (function () {
  let promise;
  return function () {
    promise = promise || fetchScript(LOADER_SRC);
    return promise;
  };
}());

/**
 * Legacy loader for glTF 1.0 models.
 * Asynchronously loads THREE.GLTFLoader from jsdelivr.
 */
module.exports = AFRAME.registerComponent('gltf-model-legacy', {
  schema: {type: 'model'},

  init: function () {
    this.model = null;
    this.loader = null;
    this.loaderPromise = loadLoader().then(() => {
      this.loader = new THREE.GLTFLoader();
      this.loader.setCrossOrigin('Anonymous');
    });
  },

  update: function () {
    const self = this;
    const el = this.el;
    const src = this.data;

    if (!src) { return; }

    this.remove();

    this.loaderPromise.then(() => {
      this.loader.load(src, function gltfLoaded (gltfModel) {
        self.model = gltfModel.scene;
        self.model.animations = gltfModel.animations;
        el.setObject3D('mesh', self.model);
        el.emit('model-loaded', {format: 'gltf', model: self.model});
      });
    });
  },

  remove: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  }
});


/***/ }),

/***/ "./src/loaders/index.js":
/*!******************************!*\
  !*** ./src/loaders/index.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(/*! ./animation-mixer */ "./src/loaders/animation-mixer.js");
__webpack_require__(/*! ./collada-model-legacy */ "./src/loaders/collada-model-legacy.js");
__webpack_require__(/*! ./fbx-model */ "./src/loaders/fbx-model.js");
__webpack_require__(/*! ./gltf-model-legacy */ "./src/loaders/gltf-model-legacy.js");
__webpack_require__(/*! ./object-model */ "./src/loaders/object-model.js");


/***/ }),

/***/ "./src/loaders/object-model.js":
/*!*************************************!*\
  !*** ./src/loaders/object-model.js ***!
  \*************************************/
/***/ ((module) => {

/**
 * object-model
 *
 * Loader for THREE.js JSON format. Somewhat confusingly, there are two different THREE.js formats,
 * both having the .json extension. This loader supports only THREE.ObjectLoader, which typically
 * includes multiple meshes or an entire scene.
 *
 * Check the console for errors, if in doubt. You may need to use `json-model` or
 * `blend-character-model` for some .js and .json files.
 *
 * See: https://clara.io/learn/user-guide/data_exchange/threejs_export
 */
module.exports = AFRAME.registerComponent('object-model', {
  schema: {
    src:         { type: 'asset' },
    crossorigin: { default: '' }
  },

  init: function () {
    this.model = null;
  },

  update: function () {
    let loader;
    const data = this.data;
    if (!data.src) return;

    this.remove();
    loader = new THREE.ObjectLoader();
    if (data.crossorigin) loader.setCrossOrigin(data.crossorigin);
    loader.load(data.src, (object) => {

      // Enable skinning, if applicable.
      object.traverse((o) => {
        if (o instanceof THREE.SkinnedMesh && o.material) {
          o.material.skinning = !!((o.geometry && o.geometry.bones) || []).length;
        }
      });

      this.load(object);
    });
  },

  load: function (model) {
    this.model = model;
    this.el.setObject3D('mesh', model);
    this.el.emit('model-loaded', {format: 'json', model: model});
  },

  remove: function () {
    if (this.model) this.el.removeObject3D('mesh');
  }
});


/***/ }),

/***/ "./src/misc/checkpoint.js":
/*!********************************!*\
  !*** ./src/misc/checkpoint.js ***!
  \********************************/
/***/ ((module) => {

module.exports = AFRAME.registerComponent('checkpoint', {
  schema: {
    offset: {default: {x: 0, y: 0, z: 0}, type: 'vec3'}
  },

  init: function () {
    this.active = false;
    this.targetEl = null;
    this.fire = this.fire.bind(this);
    this.offset = new THREE.Vector3();
  },

  update: function () {
    this.offset.copy(this.data.offset);
  },

  play: function () { this.el.addEventListener('click', this.fire); },
  pause: function () { this.el.removeEventListener('click', this.fire); },
  remove: function () { this.pause(); },

  fire: function () {
    const targetEl = this.el.sceneEl.querySelector('[checkpoint-controls]');
    if (!targetEl) {
      throw new Error('No `checkpoint-controls` component found.');
    }
    targetEl.components['checkpoint-controls'].setCheckpoint(this.el);
  },

  getOffset: function () {
    return this.offset.copy(this.data.offset);
  }
});


/***/ }),

/***/ "./src/misc/cube-env-map.js":
/*!**********************************!*\
  !*** ./src/misc/cube-env-map.js ***!
  \**********************************/
/***/ ((module) => {

/**
 * @param  {Array<THREE.Material>|THREE.Material} material
 * @return {Array<THREE.Material>}
 */
function ensureMaterialArray (material) {
  if (!material) {
    return [];
  } else if (Array.isArray(material)) {
    return material;
  } else if (material.materials) {
    return material.materials;
  } else {
    return [material];
  }
}

/**
 * @param  {THREE.Object3D} mesh
 * @param  {Array<string>} materialNames
 * @param  {THREE.Texture} envMap
 * @param  {number} reflectivity  [description]
 */
function applyEnvMap (mesh, materialNames, envMap, reflectivity) {
  if (!mesh) return;

  materialNames = materialNames || [];

  mesh.traverse((node) => {

    if (!node.isMesh) return;

    const meshMaterials = ensureMaterialArray(node.material);

    meshMaterials.forEach((material) => {

      if (material && !('envMap' in material)) return;
      if (materialNames.length && materialNames.indexOf(material.name) === -1) return;

      material.envMap = envMap;
      material.reflectivity = reflectivity;
      material.needsUpdate = true;

    });

  });
}

/**
 * Specifies an envMap on an entity, without replacing any existing material
 * properties.
 */
module.exports = AFRAME.registerComponent('cube-env-map', {
  multiple: true,

  schema: {
    path: {default: ''},
    extension: {default: 'jpg', oneOf: ['jpg', 'png']},
    enableBackground: {default: false},
    reflectivity: {default: 1, min: 0, max: 1},
    materials: {default: []}
  },

  init: function () {
    const data = this.data;

    this.texture = new THREE.CubeTextureLoader().load([
      data.path + 'posx.' + data.extension, data.path + 'negx.' + data.extension,
      data.path + 'posy.' + data.extension, data.path + 'negy.' + data.extension,
      data.path + 'posz.' + data.extension, data.path + 'negz.' + data.extension
    ]);
    this.texture.format = THREE.RGBAFormat;

    this.object3dsetHandler = () => {
      const mesh = this.el.getObject3D('mesh');
      const data = this.data;
      applyEnvMap(mesh, data.materials, this.texture, data.reflectivity);
    };

    this.object3dsetHandler();
    this.el.addEventListener('object3dset', this.object3dsetHandler);
    
  },

  update: function (oldData) {
    const data = this.data;
    const mesh = this.el.getObject3D('mesh');

    let addedMaterialNames = [];
    let removedMaterialNames = [];

    if (data.materials.length) {
      if (oldData.materials) {
        addedMaterialNames = data.materials.filter((name) => !oldData.materials.includes(name));
        removedMaterialNames = oldData.materials.filter((name) => !data.materials.includes(name));
      } else {
        addedMaterialNames = data.materials;
      }
    }
    if (addedMaterialNames.length) {
      applyEnvMap(mesh, addedMaterialNames, this.texture, data.reflectivity);
    }
    if (removedMaterialNames.length) {
      applyEnvMap(mesh, removedMaterialNames, null, 1);
    }

    if (oldData.materials && data.reflectivity !== oldData.reflectivity) {
      const maintainedMaterialNames = data.materials
        .filter((name) => oldData.materials.includes(name));
      if (maintainedMaterialNames.length) {
        applyEnvMap(mesh, maintainedMaterialNames, this.texture, data.reflectivity);
      }
    }

    if (this.data.enableBackground && !oldData.enableBackground) {
      this.setBackground(this.texture);
    } else if (!this.data.enableBackground && oldData.enableBackground) {
      this.setBackground(null);
    }
  },

  remove: function () {
    this.el.removeEventListener('object3dset', this.object3dsetHandler);
    const mesh = this.el.getObject3D('mesh');
    const data = this.data;

    applyEnvMap(mesh, data.materials, null, 1);
    if (data.enableBackground) this.setBackground(null);
  },

  setBackground: function (texture) {
    this.el.sceneEl.object3D.background = texture;
  }
});

/***/ }),

/***/ "./src/misc/grab.js":
/*!**************************!*\
  !*** ./src/misc/grab.js ***!
  \**************************/
/***/ ((module) => {

/* global CANNON */

/**
 * Based on aframe/examples/showcase/tracked-controls.
 *
 * Handles events coming from the hand-controls.
 * Determines if the entity is grabbed or released.
 * Updates its position to move along the controller.
 */
module.exports = AFRAME.registerComponent('grab', {
  init: function () {
    this.system = this.el.sceneEl.systems.physics;

    this.GRABBED_STATE = 'grabbed';

    this.grabbing = false;
    this.hitEl =      /** @type {AFRAME.Element}    */ null;
    this.physics =    /** @type {AFRAME.System}     */ this.el.sceneEl.systems.physics;
    this.constraint = /** @type {CANNON.Constraint} */ null;

    // Bind event handlers
    this.onHit = this.onHit.bind(this);
    this.onGripOpen = this.onGripOpen.bind(this);
    this.onGripClose = this.onGripClose.bind(this);
  },

  play: function () {
    const el = this.el;
    el.addEventListener('hit', this.onHit);
    el.addEventListener('gripdown', this.onGripClose);
    el.addEventListener('gripup', this.onGripOpen);
    el.addEventListener('trackpaddown', this.onGripClose);
    el.addEventListener('trackpadup', this.onGripOpen);
    el.addEventListener('triggerdown', this.onGripClose);
    el.addEventListener('triggerup', this.onGripOpen);
  },

  pause: function () {
    const el = this.el;
    el.removeEventListener('hit', this.onHit);
    el.removeEventListener('gripdown', this.onGripClose);
    el.removeEventListener('gripup', this.onGripOpen);
    el.removeEventListener('trackpaddown', this.onGripClose);
    el.removeEventListener('trackpadup', this.onGripOpen);
    el.removeEventListener('triggerdown', this.onGripClose);
    el.removeEventListener('triggerup', this.onGripOpen);
  },

  onGripClose: function () {
    this.grabbing = true;
  },

  onGripOpen: function () {
    const hitEl = this.hitEl;
    this.grabbing = false;
    if (!hitEl) { return; }
    hitEl.removeState(this.GRABBED_STATE);
    this.hitEl = undefined;
    this.system.removeConstraint(this.constraint);
    this.constraint = null;
  },

  onHit: function (evt) {
    const hitEl = evt.detail.el;
    // If the element is already grabbed (it could be grabbed by another controller).
    // If the hand is not grabbing the element does not stick.
    // If we're already grabbing something you can't grab again.
    if (hitEl.is(this.GRABBED_STATE) || !this.grabbing || this.hitEl) { return; }
    hitEl.addState(this.GRABBED_STATE);
    this.hitEl = hitEl;
    this.constraint = new CANNON.LockConstraint(this.el.body, hitEl.body);
    this.system.addConstraint(this.constraint);
  }
});


/***/ }),

/***/ "./src/misc/index.js":
/*!***************************!*\
  !*** ./src/misc/index.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(/*! ./checkpoint */ "./src/misc/checkpoint.js");
__webpack_require__(/*! ./cube-env-map */ "./src/misc/cube-env-map.js");
__webpack_require__(/*! ./grab */ "./src/misc/grab.js");
__webpack_require__(/*! ./normal-material */ "./src/misc/normal-material.js");
__webpack_require__(/*! ./sphere-collider */ "./src/misc/sphere-collider.js");


/***/ }),

/***/ "./src/misc/normal-material.js":
/*!*************************************!*\
  !*** ./src/misc/normal-material.js ***!
  \*************************************/
/***/ ((module) => {

/**
 * Recursively applies a MeshNormalMaterial to the entity, such that
 * face colors are determined by their orientation. Helpful for
 * debugging geometry
 */
module.exports = AFRAME.registerComponent('normal-material', {
  init: function () {
    this.material = new THREE.MeshNormalMaterial({flatShading: true});
    this.applyMaterial = this.applyMaterial.bind(this);
    this.el.addEventListener('object3dset', this.applyMaterial);
    this.applyMaterial();
  },

  remove: function () {
    this.el.removeEventListener('object3dset', this.applyMaterial);
  },

  applyMaterial: function () {
    this.el.object3D.traverse((node) => {
      if (node.isMesh) node.material = this.material;
    });
  }
});


/***/ }),

/***/ "./src/misc/sphere-collider.js":
/*!*************************************!*\
  !*** ./src/misc/sphere-collider.js ***!
  \*************************************/
/***/ ((module) => {

/**
 * Based on aframe/examples/showcase/tracked-controls.
 *
 * Implement bounding sphere collision detection for entities with a mesh.
 * Sets the specified state on the intersected entities.
 *
 * @property {string} objects - Selector of the entities to test for collision.
 * @property {string} state - State to set on collided entities.
 *
 */
module.exports = AFRAME.registerComponent('sphere-collider', {
  schema: {
    enabled: {default: true},
    interval: {default: 80},
    objects: {default: ''},
    state: {default: 'collided'},
    radius: {default: 0.05},
    watch: {default: true}
  },

  init: function () {
    /** @type {MutationObserver} */
    this.observer = null;
    /** @type {Array<Element>} Elements to watch for collisions. */
    this.els = [];
    /** @type {Array<Element>} Elements currently in collision state. */
    this.collisions = [];
    this.prevCheckTime = undefined;

    this.eventDetail = {};
    this.handleHit = this.handleHit.bind(this);
    this.handleHitEnd = this.handleHitEnd.bind(this);
  },

  play: function () {
    const sceneEl = this.el.sceneEl;

    if (this.data.watch) {
      this.observer = new MutationObserver(this.update.bind(this, null));
      this.observer.observe(sceneEl, {childList: true, subtree: true});
    }
  },

  pause: function () {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  },

  /**
   * Update list of entities to test for collision.
   */
  update: function () {
    const data = this.data;
    let objectEls;

    // Push entities into list of els to intersect.
    if (data.objects) {
      objectEls = this.el.sceneEl.querySelectorAll(data.objects);
    } else {
      // If objects not defined, intersect with everything.
      objectEls = this.el.sceneEl.children;
    }
    // Convert from NodeList to Array
    this.els = Array.prototype.slice.call(objectEls);
  },

  tick: (function () {
    const position = new THREE.Vector3(),
        meshPosition = new THREE.Vector3(),
        colliderScale = new THREE.Vector3(),
        size = new THREE.Vector3(),
        box = new THREE.Box3(),
        collisions = [],
        distanceMap = new Map();
    return function (time) {
      if (!this.data.enabled) { return; }

      // Only check for intersection if interval time has passed.
      const prevCheckTime = this.prevCheckTime;
      if (prevCheckTime && (time - prevCheckTime < this.data.interval)) { return; }
      // Update check time.
      this.prevCheckTime = time;

      const el = this.el,
          data = this.data,
          mesh = el.getObject3D('mesh');
      let colliderRadius;

      if (!mesh) { return; }

      collisions.length = 0;
      distanceMap.clear();
      el.object3D.getWorldPosition(position);
      el.object3D.getWorldScale(colliderScale);
      colliderRadius = data.radius * scaleFactor(colliderScale);
      // Update collision list.
      this.els.forEach(intersect);

      // Emit events and add collision states, in order of distance.
      collisions
        .sort((a, b) => distanceMap.get(a) > distanceMap.get(b) ? 1 : -1)
        .forEach(this.handleHit);

      // Remove collision state from other elements.
      this.collisions
        .filter((el) => !distanceMap.has(el))
        .forEach(this.handleHitEnd);

      // Store new collisions
      copyArray(this.collisions, collisions);

      // Bounding sphere collision detection
      function intersect (el) {
        let radius, mesh, distance, extent;

        if (!el.isEntity) { return; }

        mesh = el.getObject3D('mesh');

        if (!mesh) { return; }

        box.setFromObject(mesh).getSize(size);
        extent = Math.max(size.x, size.y, size.z) / 2;
        radius = Math.sqrt(2 * extent * extent);
        box.getCenter(meshPosition);

        if (!radius) { return; }

        distance = position.distanceTo(meshPosition);
        if (distance < radius + colliderRadius) {
          collisions.push(el);
          distanceMap.set(el, distance);
        }
      }
      // use max of scale factors to maintain bounding sphere collision
      function scaleFactor (scaleVec) {
        return Math.max(scaleVec.x, scaleVec.y, scaleVec.z);
      }
    };
  })(),

  handleHit: function (targetEl) {
    targetEl.emit('hit');
    targetEl.addState(this.data.state);
    this.eventDetail.el = targetEl;
    this.el.emit('hit', this.eventDetail);
  },
  handleHitEnd: function (targetEl) {
    targetEl.emit('hitend');
    targetEl.removeState(this.data.state);
    this.eventDetail.el = targetEl;
    this.el.emit('hitend', this.eventDetail);
  }
});

function copyArray (dest, source) {
  dest.length = 0;
  for (let i = 0; i < source.length; i++) { dest[i] = source[i]; }
}


/***/ }),

/***/ "./src/pathfinding/index.js":
/*!**********************************!*\
  !*** ./src/pathfinding/index.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(/*! ./nav-mesh */ "./src/pathfinding/nav-mesh.js");
__webpack_require__(/*! ./nav-agent */ "./src/pathfinding/nav-agent.js");
__webpack_require__(/*! ./system */ "./src/pathfinding/system.js");


/***/ }),

/***/ "./src/pathfinding/nav-agent.js":
/*!**************************************!*\
  !*** ./src/pathfinding/nav-agent.js ***!
  \**************************************/
/***/ ((module) => {

module.exports = AFRAME.registerComponent('nav-agent', {
  schema: {
    destination: {type: 'vec3'},
    active: {default: false},
    speed: {default: 2}
  },
  init: function () {
    this.system = this.el.sceneEl.systems.nav;
    this.system.addAgent(this);
    this.group = null;
    this.path = [];
    this.raycaster = new THREE.Raycaster();
  },
  remove: function () {
    this.system.removeAgent(this);
  },
  update: function () {
    this.path.length = 0;
  },
  updateNavLocation: function () {
    this.group = null;
    this.path = [];
  },
  tick: (function () {
    const vDest = new THREE.Vector3();
    const vDelta = new THREE.Vector3();
    const vNext = new THREE.Vector3();

    return function (t, dt) {
      const el = this.el;
      const data = this.data;
      const raycaster = this.raycaster;
      const speed = data.speed * dt / 1000;

      if (!data.active) return;

      // Use PatrolJS pathfinding system to get shortest path to target.
      if (!this.path.length) {
        const position = this.el.object3D.position;
        this.group = this.group || this.system.getGroup(position);
        this.path = this.system.getPath(position, vDest.copy(data.destination), this.group) || [];
        el.emit('navigation-start');
      }

      // If no path is found, exit.
      if (!this.path.length) {
        console.warn('[nav] Unable to find path to %o.', data.destination);
        this.el.setAttribute('nav-agent', {active: false});
        el.emit('navigation-end');
        return;
      }

      // Current segment is a vector from current position to next waypoint.
      const vCurrent = el.object3D.position;
      const vWaypoint = this.path[0];
      vDelta.subVectors(vWaypoint, vCurrent);

      const distance = vDelta.length();
      let gazeTarget;

      if (distance < speed) {
        // If <1 step from current waypoint, discard it and move toward next.
        this.path.shift();

        // After discarding the last waypoint, exit pathfinding.
        if (!this.path.length) {
          this.el.setAttribute('nav-agent', {active: false});
          el.emit('navigation-end');
          return;
        }

        vNext.copy(vCurrent);
        gazeTarget = this.path[0];
      } else {
        // If still far away from next waypoint, find next position for
        // the current frame.
        vNext.copy(vDelta.setLength(speed)).add(vCurrent);
        gazeTarget = vWaypoint;
      }

      // Look at the next waypoint.
      gazeTarget.y = vCurrent.y;
      el.object3D.lookAt(gazeTarget);

      // Raycast against the nav mesh, to keep the agent moving along the
      // ground, not traveling in a straight line from higher to lower waypoints.
      raycaster.ray.origin.copy(vNext);
      raycaster.ray.origin.y += 1.5;
      raycaster.ray.direction = {x:0, y:-1, z:0};
      const intersections = raycaster.intersectObject(this.system.getNavMesh());

      if (!intersections.length) {
        // Raycasting failed. Step toward the waypoint and hope for the best.
        vCurrent.copy(vNext);
      } else {
        // Re-project next position onto nav mesh.
        vDelta.subVectors(intersections[0].point, vCurrent);
        vCurrent.add(vDelta.setLength(speed));
      }

    };
  }())
});


/***/ }),

/***/ "./src/pathfinding/nav-mesh.js":
/*!*************************************!*\
  !*** ./src/pathfinding/nav-mesh.js ***!
  \*************************************/
/***/ ((module) => {

/**
 * nav-mesh
 *
 * Waits for a mesh to be loaded on the current entity, then sets it as the
 * nav mesh in the pathfinding system.
 */
module.exports = AFRAME.registerComponent('nav-mesh', {
  schema: {
    nodeName: {type: 'string'}
  },

  init: function () {
    this.system = this.el.sceneEl.systems.nav;
    this.hasLoadedNavMesh = false;
    this.nodeName = this.data.nodeName;
    this.el.addEventListener('object3dset', this.loadNavMesh.bind(this));
  },

  play: function () {
    if (!this.hasLoadedNavMesh) this.loadNavMesh();
  },

  loadNavMesh: function () {
    var self = this;
    const object = this.el.getObject3D('mesh');
    const scene = this.el.sceneEl.object3D;

    if (!object) return;

    let navMesh;
    object.traverse((node) => {
      if (node.isMesh &&
          (!self.nodeName || node.name === self.nodeName)) navMesh = node;
    });

    if (!navMesh) return;

    const navMeshGeometry = navMesh.geometry.clone();
    navMesh.updateWorldMatrix(true, false);
    navMeshGeometry.applyMatrix4(navMesh.matrixWorld);
    this.system.setNavMeshGeometry(navMeshGeometry);
    this.hasLoadedNavMesh = true;
  }
});


/***/ }),

/***/ "./src/pathfinding/system.js":
/*!***********************************!*\
  !*** ./src/pathfinding/system.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { Pathfinding } = __webpack_require__(/*! three-pathfinding */ "./node_modules/three-pathfinding/dist/three-pathfinding.module.js");

const pathfinder = new Pathfinding();
const ZONE = 'level';

/**
 * nav
 *
 * Pathfinding system, using PatrolJS.
 */
module.exports = AFRAME.registerSystem('nav', {
  init: function () {
    this.navMesh = null;
    this.agents = new Set();
  },

  /**
   * @param {THREE.Geometry} geometry
   */
  setNavMeshGeometry: function (geometry) {
    this.navMesh = new THREE.Mesh(geometry);
    pathfinder.setZoneData(ZONE, Pathfinding.createZone(geometry));
    Array.from(this.agents).forEach((agent) => agent.updateNavLocation());
  },

  /**
   * @return {THREE.Mesh}
   */
  getNavMesh: function () {
    return this.navMesh;
  },

  /**
   * @param {NavAgent} ctrl
   */
  addAgent: function (ctrl) {
    this.agents.add(ctrl);
  },

  /**
   * @param {NavAgent} ctrl
   */
  removeAgent: function (ctrl) {
    this.agents.delete(ctrl);
  },

  /**
   * @param  {THREE.Vector3} start
   * @param  {THREE.Vector3} end
   * @param  {number} groupID
   * @return {Array<THREE.Vector3>}
   */
  getPath: function (start, end, groupID) {
    return this.navMesh
      ? pathfinder.findPath(start, end, ZONE, groupID)
      : null;
  },

  /**
   * @param {THREE.Vector3} position
   * @return {number}
   */
  getGroup: function (position) {
    return this.navMesh
      ? pathfinder.getGroup(ZONE, position)
      : null;
  },

  /**
   * @param  {THREE.Vector3} position
   * @param  {number} groupID
   * @return {Node}
   */
  getNode: function (position, groupID) {
    return this.navMesh
      ? pathfinder.getClosestNode(position, ZONE, groupID, true)
      : null;
  },

  /**
   * @param  {THREE.Vector3} start Starting position.
   * @param  {THREE.Vector3} end Desired ending position.
   * @param  {number} groupID
   * @param  {Node} node
   * @param  {THREE.Vector3} endTarget (Output) Adjusted step end position.
   * @return {Node} Current node, after step is taken.
   */
  clampStep: function (start, end, groupID, node, endTarget) {
    if (!this.navMesh) {
      endTarget.copy(end);
      return null;
    } else if (!node) {
      endTarget.copy(end);
      return this.getNode(end, groupID);
    }
    return pathfinder.clampStep(start, end, node, ZONE, groupID, endTarget);
  }
});


/***/ }),

/***/ "./src/primitives/a-grid.js":
/*!**********************************!*\
  !*** ./src/primitives/a-grid.js ***!
  \**********************************/
/***/ ((module) => {

/**
 * Flat grid.
 *
 * Defaults to 75x75.
 */
module.exports = AFRAME.registerPrimitive('a-grid', {
  defaultComponents: {
    geometry: {
      primitive: 'plane',
      width: 75,
      height: 75
    },
    rotation: {x: -90, y: 0, z: 0},
    material: {
      src: 'url(https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v1.16.3/assets/grid.png)',
      repeat: '75 75'
    }
  },
  mappings: {
    width: 'geometry.width',
    height: 'geometry.height',
    src: 'material.src'
  }
});


/***/ }),

/***/ "./src/primitives/a-ocean.js":
/*!***********************************!*\
  !*** ./src/primitives/a-ocean.js ***!
  \***********************************/
/***/ ((module) => {

/**
 * Flat-shaded ocean primitive.
 *
 * Based on a Codrops tutorial:
 * http://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
 */
module.exports.Primitive = AFRAME.registerPrimitive('a-ocean', {
  defaultComponents: {
    ocean: {},
    rotation: {x: -90, y: 0, z: 0}
  },
  mappings: {
    width: 'ocean.width',
    depth: 'ocean.depth',
    density: 'ocean.density',
    amplitude: 'ocean.amplitude',
    amplitudeVariance: 'ocean.amplitudeVariance',
    speed: 'ocean.speed',
    speedVariance: 'ocean.speedVariance',
    color: 'ocean.color',
    opacity: 'ocean.opacity'
  }
});

module.exports.Component = AFRAME.registerComponent('ocean', {
  schema: {
    // Dimensions of the ocean area.
    width: {default: 10, min: 0},
    depth: {default: 10, min: 0},

    // Density of waves.
    density: {default: 10},

    // Wave amplitude and variance.
    amplitude: {default: 0.1},
    amplitudeVariance: {default: 0.3},

    // Wave speed and variance.
    speed: {default: 1},
    speedVariance: {default: 2},

    // Material.
    color: {default: '#7AD2F7', type: 'color'},
    opacity: {default: 0.8}
  },

  /**
   * Use play() instead of init(), because component mappings – unavailable as dependencies – are
   * not guaranteed to have parsed when this component is initialized.
   */
  play: function () {
    const el = this.el;
    const data = this.data;
    let material = el.components.material;

    const geometry = new THREE.PlaneGeometry(data.width, data.depth, data.density, data.density);
    this.waves = [];
    const posAttribute = geometry.getAttribute('position');
    for (let i = 0; i < posAttribute.count; i++) {
      this.waves.push({
        z: posAttribute.getZ(i),
        ang: Math.random() * Math.PI * 2,
        amp: data.amplitude + Math.random() * data.amplitudeVariance,
        speed: (data.speed + Math.random() * data.speedVariance) / 1000 // radians / frame
      });
    }

    if (!material) {
      material = {};
      material.material = new THREE.MeshPhongMaterial({
        color: data.color,
        transparent: data.opacity < 1,
        opacity: data.opacity,
        flatShading: true,
      });
    }

    this.mesh = new THREE.Mesh(geometry, material.material);
    el.setObject3D('mesh', this.mesh);
  },

  remove: function () {
    this.el.removeObject3D('mesh');
  },

  tick: function (t, dt) {
    if (!dt) return;

    const posAttribute = this.mesh.geometry.getAttribute('position');
    for (let i = 0; i < posAttribute.count; i++){
      const vprops = this.waves[i];
      const value = vprops.z + Math.sin(vprops.ang) * vprops.amp;
      posAttribute.setZ(i, value);
      vprops.ang += vprops.speed * dt;
    }
    posAttribute.needsUpdate = true;
  }
});


/***/ }),

/***/ "./src/primitives/a-tube.js":
/*!**********************************!*\
  !*** ./src/primitives/a-tube.js ***!
  \**********************************/
/***/ ((module) => {

/**
 * Tube following a custom path.
 *
 * Usage:
 *
 * ```html
 * <a-tube path="5 0 5, 5 0 -5, -5 0 -5" radius="0.5"></a-tube>
 * ```
 */
module.exports.Primitive = AFRAME.registerPrimitive('a-tube', {
  defaultComponents: {
    tube:           {},
  },
  mappings: {
    path:           'tube.path',
    segments:       'tube.segments',
    radius:         'tube.radius',
    'radial-segments': 'tube.radialSegments',
    closed:         'tube.closed'
  }
});

module.exports.Component = AFRAME.registerComponent('tube', {
  schema: {
    path:           {default: []},
    segments:       {default: 64},
    radius:         {default: 1},
    radialSegments: {default: 8},
    closed:         {default: false}
  },

  init: function () {
    const el = this.el,
        data = this.data;
    let material = el.components.material;

    if (!data.path.length) {
      console.error('[a-tube] `path` property expected but not found.');
      return;
    }

    const curve = new THREE.CatmullRomCurve3(data.path.map(function (point) {
      point = point.split(' ');
      return new THREE.Vector3(Number(point[0]), Number(point[1]), Number(point[2]));
    }));
    const geometry = new THREE.TubeGeometry(
      curve, data.segments, data.radius, data.radialSegments, data.closed
    );

    if (!material) {
      material = {};
      material.material = new THREE.MeshPhongMaterial();
    }

    this.mesh = new THREE.Mesh(geometry, material.material);
    this.el.setObject3D('mesh', this.mesh);
  },

  update: function (prevData) {
    if (!Object.keys(prevData).length) return;

    this.remove();
    this.init();
  },

  remove: function () {
    if (this.mesh) this.el.removeObject3D('mesh');
  }
});


/***/ }),

/***/ "./src/primitives/index.js":
/*!*********************************!*\
  !*** ./src/primitives/index.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(/*! ./a-grid */ "./src/primitives/a-grid.js");
__webpack_require__(/*! ./a-ocean */ "./src/primitives/a-ocean.js");
__webpack_require__(/*! ./a-tube */ "./src/primitives/a-tube.js");


/***/ }),

/***/ "three":
/*!************************!*\
  !*** external "THREE" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_three__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!******************!*\
  !*** ./index.js ***!
  \******************/
__webpack_require__(/*! ./src/controls */ "./src/controls/index.js");
__webpack_require__(/*! ./src/loaders */ "./src/loaders/index.js");
__webpack_require__(/*! ./src/misc */ "./src/misc/index.js");
__webpack_require__(/*! ./src/pathfinding */ "./src/pathfinding/index.js");
__webpack_require__(/*! ./src/primitives */ "./src/primitives/index.js");

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=aframe-extras.js.map