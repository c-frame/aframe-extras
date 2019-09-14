(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require('./src/loaders');

},{"./src/loaders":9}],2:[function(require,module,exports){
'use strict';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

module.exports = THREE.ColladaLoader = function (manager) {

  this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;
};

THREE.ColladaLoader.prototype = {

  constructor: THREE.ColladaLoader,

  crossOrigin: 'anonymous',

  load: function load(url, onLoad, onProgress, onError) {

    var scope = this;

    var path = scope.path === undefined ? THREE.LoaderUtils.extractUrlBase(url) : scope.path;

    var loader = new THREE.FileLoader(scope.manager);
    loader.setPath(scope.path);
    loader.load(url, function (text) {

      onLoad(scope.parse(text, path));
    }, onProgress, onError);
  },

  setPath: function setPath(value) {

    this.path = value;
    return this;
  },

  setResourcePath: function setResourcePath(value) {

    this.resourcePath = value;
    return this;
  },

  options: {

    set convertUpAxis(value) {

      console.warn('THREE.ColladaLoader: options.convertUpAxis() has been removed. Up axis is converted automatically.');
    }

  },

  setCrossOrigin: function setCrossOrigin(value) {

    this.crossOrigin = value;
    return this;
  },

  parse: function parse(text, path) {

    function getElementsByTagName(xml, name) {

      // Non recursive xml.getElementsByTagName() ...

      var array = [];
      var childNodes = xml.childNodes;

      for (var i = 0, l = childNodes.length; i < l; i++) {

        var child = childNodes[i];

        if (child.nodeName === name) {

          array.push(child);
        }
      }

      return array;
    }

    function parseStrings(text) {

      if (text.length === 0) return [];

      var parts = text.trim().split(/\s+/);
      var array = new Array(parts.length);

      for (var i = 0, l = parts.length; i < l; i++) {

        array[i] = parts[i];
      }

      return array;
    }

    function parseFloats(text) {

      if (text.length === 0) return [];

      var parts = text.trim().split(/\s+/);
      var array = new Array(parts.length);

      for (var i = 0, l = parts.length; i < l; i++) {

        array[i] = parseFloat(parts[i]);
      }

      return array;
    }

    function parseInts(text) {

      if (text.length === 0) return [];

      var parts = text.trim().split(/\s+/);
      var array = new Array(parts.length);

      for (var i = 0, l = parts.length; i < l; i++) {

        array[i] = parseInt(parts[i]);
      }

      return array;
    }

    function parseId(text) {

      return text.substring(1);
    }

    function generateId() {

      return 'three_default_' + count++;
    }

    function isEmpty(object) {

      return Object.keys(object).length === 0;
    }

    // asset

    function parseAsset(xml) {

      return {
        unit: parseAssetUnit(getElementsByTagName(xml, 'unit')[0]),
        upAxis: parseAssetUpAxis(getElementsByTagName(xml, 'up_axis')[0])
      };
    }

    function parseAssetUnit(xml) {

      if (xml !== undefined && xml.hasAttribute('meter') === true) {

        return parseFloat(xml.getAttribute('meter'));
      } else {

        return 1; // default 1 meter
      }
    }

    function parseAssetUpAxis(xml) {

      return xml !== undefined ? xml.textContent : 'Y_UP';
    }

    // library

    function parseLibrary(xml, libraryName, nodeName, parser) {

      var library = getElementsByTagName(xml, libraryName)[0];

      if (library !== undefined) {

        var elements = getElementsByTagName(library, nodeName);

        for (var i = 0; i < elements.length; i++) {

          parser(elements[i]);
        }
      }
    }

    function buildLibrary(data, builder) {

      for (var name in data) {

        var object = data[name];
        object.build = builder(data[name]);
      }
    }

    // get

    function getBuild(data, builder) {

      if (data.build !== undefined) return data.build;

      data.build = builder(data);

      return data.build;
    }

    // animation

    function parseAnimation(xml) {

      var data = {
        sources: {},
        samplers: {},
        channels: {}
      };

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        var id;

        switch (child.nodeName) {

          case 'source':
            id = child.getAttribute('id');
            data.sources[id] = parseSource(child);
            break;

          case 'sampler':
            id = child.getAttribute('id');
            data.samplers[id] = parseAnimationSampler(child);
            break;

          case 'channel':
            id = child.getAttribute('target');
            data.channels[id] = parseAnimationChannel(child);
            break;

          default:
            console.log(child);

        }
      }

      library.animations[xml.getAttribute('id')] = data;
    }

    function parseAnimationSampler(xml) {

      var data = {
        inputs: {}
      };

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'input':
            var id = parseId(child.getAttribute('source'));
            var semantic = child.getAttribute('semantic');
            data.inputs[semantic] = id;
            break;

        }
      }

      return data;
    }

    function parseAnimationChannel(xml) {

      var data = {};

      var target = xml.getAttribute('target');

      // parsing SID Addressing Syntax

      var parts = target.split('/');

      var id = parts.shift();
      var sid = parts.shift();

      // check selection syntax

      var arraySyntax = sid.indexOf('(') !== -1;
      var memberSyntax = sid.indexOf('.') !== -1;

      if (memberSyntax) {

        //  member selection access

        parts = sid.split('.');
        sid = parts.shift();
        data.member = parts.shift();
      } else if (arraySyntax) {

        // array-access syntax. can be used to express fields in one-dimensional vectors or two-dimensional matrices.

        var indices = sid.split('(');
        sid = indices.shift();

        for (var i = 0; i < indices.length; i++) {

          indices[i] = parseInt(indices[i].replace(/\)/, ''));
        }

        data.indices = indices;
      }

      data.id = id;
      data.sid = sid;

      data.arraySyntax = arraySyntax;
      data.memberSyntax = memberSyntax;

      data.sampler = parseId(xml.getAttribute('source'));

      return data;
    }

    function buildAnimation(data) {

      var tracks = [];

      var channels = data.channels;
      var samplers = data.samplers;
      var sources = data.sources;

      for (var target in channels) {

        if (channels.hasOwnProperty(target)) {

          var channel = channels[target];
          var sampler = samplers[channel.sampler];

          var inputId = sampler.inputs.INPUT;
          var outputId = sampler.inputs.OUTPUT;

          var inputSource = sources[inputId];
          var outputSource = sources[outputId];

          var animation = buildAnimationChannel(channel, inputSource, outputSource);

          createKeyframeTracks(animation, tracks);
        }
      }

      return tracks;
    }

    function getAnimation(id) {

      return getBuild(library.animations[id], buildAnimation);
    }

    function buildAnimationChannel(channel, inputSource, outputSource) {

      var node = library.nodes[channel.id];
      var object3D = getNode(node.id);

      var transform = node.transforms[channel.sid];
      var defaultMatrix = node.matrix.clone().transpose();

      var time, stride;
      var i, il, j, jl;

      var data = {};

      // the collada spec allows the animation of data in various ways.
      // depending on the transform type (matrix, translate, rotate, scale), we execute different logic

      switch (transform) {

        case 'matrix':

          for (i = 0, il = inputSource.array.length; i < il; i++) {

            time = inputSource.array[i];
            stride = i * outputSource.stride;

            if (data[time] === undefined) data[time] = {};

            if (channel.arraySyntax === true) {

              var value = outputSource.array[stride];
              var index = channel.indices[0] + 4 * channel.indices[1];

              data[time][index] = value;
            } else {

              for (j = 0, jl = outputSource.stride; j < jl; j++) {

                data[time][j] = outputSource.array[stride + j];
              }
            }
          }

          break;

        case 'translate':
          console.warn('THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform);
          break;

        case 'rotate':
          console.warn('THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform);
          break;

        case 'scale':
          console.warn('THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform);
          break;

      }

      var keyframes = prepareAnimationData(data, defaultMatrix);

      var animation = {
        name: object3D.uuid,
        keyframes: keyframes
      };

      return animation;
    }

    function prepareAnimationData(data, defaultMatrix) {

      var keyframes = [];

      // transfer data into a sortable array

      for (var time in data) {

        keyframes.push({ time: parseFloat(time), value: data[time] });
      }

      // ensure keyframes are sorted by time

      keyframes.sort(ascending);

      // now we clean up all animation data, so we can use them for keyframe tracks

      for (var i = 0; i < 16; i++) {

        transformAnimationData(keyframes, i, defaultMatrix.elements[i]);
      }

      return keyframes;

      // array sort function

      function ascending(a, b) {

        return a.time - b.time;
      }
    }

    var position = new THREE.Vector3();
    var scale = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();

    function createKeyframeTracks(animation, tracks) {

      var keyframes = animation.keyframes;
      var name = animation.name;

      var times = [];
      var positionData = [];
      var quaternionData = [];
      var scaleData = [];

      for (var i = 0, l = keyframes.length; i < l; i++) {

        var keyframe = keyframes[i];

        var time = keyframe.time;
        var value = keyframe.value;

        matrix.fromArray(value).transpose();
        matrix.decompose(position, quaternion, scale);

        times.push(time);
        positionData.push(position.x, position.y, position.z);
        quaternionData.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
        scaleData.push(scale.x, scale.y, scale.z);
      }

      if (positionData.length > 0) tracks.push(new THREE.VectorKeyframeTrack(name + '.position', times, positionData));
      if (quaternionData.length > 0) tracks.push(new THREE.QuaternionKeyframeTrack(name + '.quaternion', times, quaternionData));
      if (scaleData.length > 0) tracks.push(new THREE.VectorKeyframeTrack(name + '.scale', times, scaleData));

      return tracks;
    }

    function transformAnimationData(keyframes, property, defaultValue) {

      var keyframe;

      var empty = true;
      var i, l;

      // check, if values of a property are missing in our keyframes

      for (i = 0, l = keyframes.length; i < l; i++) {

        keyframe = keyframes[i];

        if (keyframe.value[property] === undefined) {

          keyframe.value[property] = null; // mark as missing
        } else {

          empty = false;
        }
      }

      if (empty === true) {

        // no values at all, so we set a default value

        for (i = 0, l = keyframes.length; i < l; i++) {

          keyframe = keyframes[i];

          keyframe.value[property] = defaultValue;
        }
      } else {

        // filling gaps

        createMissingKeyframes(keyframes, property);
      }
    }

    function createMissingKeyframes(keyframes, property) {

      var prev, next;

      for (var i = 0, l = keyframes.length; i < l; i++) {

        var keyframe = keyframes[i];

        if (keyframe.value[property] === null) {

          prev = getPrev(keyframes, i, property);
          next = getNext(keyframes, i, property);

          if (prev === null) {

            keyframe.value[property] = next.value[property];
            continue;
          }

          if (next === null) {

            keyframe.value[property] = prev.value[property];
            continue;
          }

          interpolate(keyframe, prev, next, property);
        }
      }
    }

    function getPrev(keyframes, i, property) {

      while (i >= 0) {

        var keyframe = keyframes[i];

        if (keyframe.value[property] !== null) return keyframe;

        i--;
      }

      return null;
    }

    function getNext(keyframes, i, property) {

      while (i < keyframes.length) {

        var keyframe = keyframes[i];

        if (keyframe.value[property] !== null) return keyframe;

        i++;
      }

      return null;
    }

    function interpolate(key, prev, next, property) {

      if (next.time - prev.time === 0) {

        key.value[property] = prev.value[property];
        return;
      }

      key.value[property] = (key.time - prev.time) * (next.value[property] - prev.value[property]) / (next.time - prev.time) + prev.value[property];
    }

    // animation clips

    function parseAnimationClip(xml) {

      var data = {
        name: xml.getAttribute('id') || 'default',
        start: parseFloat(xml.getAttribute('start') || 0),
        end: parseFloat(xml.getAttribute('end') || 0),
        animations: []
      };

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'instance_animation':
            data.animations.push(parseId(child.getAttribute('url')));
            break;

        }
      }

      library.clips[xml.getAttribute('id')] = data;
    }

    function buildAnimationClip(data) {

      var tracks = [];

      var name = data.name;
      var duration = data.end - data.start || -1;
      var animations = data.animations;

      for (var i = 0, il = animations.length; i < il; i++) {

        var animationTracks = getAnimation(animations[i]);

        for (var j = 0, jl = animationTracks.length; j < jl; j++) {

          tracks.push(animationTracks[j]);
        }
      }

      return new THREE.AnimationClip(name, duration, tracks);
    }

    function getAnimationClip(id) {

      return getBuild(library.clips[id], buildAnimationClip);
    }

    // controller

    function parseController(xml) {

      var data = {};

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'skin':
            // there is exactly one skin per controller
            data.id = parseId(child.getAttribute('source'));
            data.skin = parseSkin(child);
            break;

          case 'morph':
            data.id = parseId(child.getAttribute('source'));
            console.warn('THREE.ColladaLoader: Morph target animation not supported yet.');
            break;

        }
      }

      library.controllers[xml.getAttribute('id')] = data;
    }

    function parseSkin(xml) {

      var data = {
        sources: {}
      };

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'bind_shape_matrix':
            data.bindShapeMatrix = parseFloats(child.textContent);
            break;

          case 'source':
            var id = child.getAttribute('id');
            data.sources[id] = parseSource(child);
            break;

          case 'joints':
            data.joints = parseJoints(child);
            break;

          case 'vertex_weights':
            data.vertexWeights = parseVertexWeights(child);
            break;

        }
      }

      return data;
    }

    function parseJoints(xml) {

      var data = {
        inputs: {}
      };

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'input':
            var semantic = child.getAttribute('semantic');
            var id = parseId(child.getAttribute('source'));
            data.inputs[semantic] = id;
            break;

        }
      }

      return data;
    }

    function parseVertexWeights(xml) {

      var data = {
        inputs: {}
      };

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'input':
            var semantic = child.getAttribute('semantic');
            var id = parseId(child.getAttribute('source'));
            var offset = parseInt(child.getAttribute('offset'));
            data.inputs[semantic] = { id: id, offset: offset };
            break;

          case 'vcount':
            data.vcount = parseInts(child.textContent);
            break;

          case 'v':
            data.v = parseInts(child.textContent);
            break;

        }
      }

      return data;
    }

    function buildController(data) {

      var build = {
        id: data.id
      };

      var geometry = library.geometries[build.id];

      if (data.skin !== undefined) {

        build.skin = buildSkin(data.skin);

        // we enhance the 'sources' property of the corresponding geometry with our skin data

        geometry.sources.skinIndices = build.skin.indices;
        geometry.sources.skinWeights = build.skin.weights;
      }

      return build;
    }

    function buildSkin(data) {

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

      var jointSource = data.sources[data.joints.inputs.JOINT];
      var inverseSource = data.sources[data.joints.inputs.INV_BIND_MATRIX];

      var weights = sources[vertexWeights.inputs.WEIGHT.id].array;
      var stride = 0;

      var i, j, l;

      // procces skin data for each vertex

      for (i = 0, l = vcount.length; i < l; i++) {

        var jointCount = vcount[i]; // this is the amount of joints that affect a single vertex
        var vertexSkinData = [];

        for (j = 0; j < jointCount; j++) {

          var skinIndex = v[stride + jointOffset];
          var weightId = v[stride + weightOffset];
          var skinWeight = weights[weightId];

          vertexSkinData.push({ index: skinIndex, weight: skinWeight });

          stride += 2;
        }

        // we sort the joints in descending order based on the weights.
        // this ensures, we only procced the most important joints of the vertex

        vertexSkinData.sort(descending);

        // now we provide for each vertex a set of four index and weight values.
        // the order of the skin data matches the order of vertices

        for (j = 0; j < BONE_LIMIT; j++) {

          var d = vertexSkinData[j];

          if (d !== undefined) {

            build.indices.array.push(d.index);
            build.weights.array.push(d.weight);
          } else {

            build.indices.array.push(0);
            build.weights.array.push(0);
          }
        }
      }

      // setup bind matrix

      if (data.bindShapeMatrix) {

        build.bindMatrix = new THREE.Matrix4().fromArray(data.bindShapeMatrix).transpose();
      } else {

        build.bindMatrix = new THREE.Matrix4().identity();
      }

      // process bones and inverse bind matrix data

      for (i = 0, l = jointSource.array.length; i < l; i++) {

        var name = jointSource.array[i];
        var boneInverse = new THREE.Matrix4().fromArray(inverseSource.array, i * inverseSource.stride).transpose();

        build.joints.push({ name: name, boneInverse: boneInverse });
      }

      return build;

      // array sort function

      function descending(a, b) {

        return b.weight - a.weight;
      }
    }

    function getController(id) {

      return getBuild(library.controllers[id], buildController);
    }

    // image

    function parseImage(xml) {

      var data = {
        init_from: getElementsByTagName(xml, 'init_from')[0].textContent
      };

      library.images[xml.getAttribute('id')] = data;
    }

    function buildImage(data) {

      if (data.build !== undefined) return data.build;

      return data.init_from;
    }

    function getImage(id) {

      var data = library.images[id];

      if (data !== undefined) {

        return getBuild(data, buildImage);
      }

      console.warn('THREE.ColladaLoader: Couldn\'t find image with ID:', id);

      return null;
    }

    // effect

    function parseEffect(xml) {

      var data = {};

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'profile_COMMON':
            data.profile = parseEffectProfileCOMMON(child);
            break;

        }
      }

      library.effects[xml.getAttribute('id')] = data;
    }

    function parseEffectProfileCOMMON(xml) {

      var data = {
        surfaces: {},
        samplers: {}
      };

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'newparam':
            parseEffectNewparam(child, data);
            break;

          case 'technique':
            data.technique = parseEffectTechnique(child);
            break;

          case 'extra':
            data.extra = parseEffectExtra(child);
            break;

        }
      }

      return data;
    }

    function parseEffectNewparam(xml, data) {

      var sid = xml.getAttribute('sid');

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'surface':
            data.surfaces[sid] = parseEffectSurface(child);
            break;

          case 'sampler2D':
            data.samplers[sid] = parseEffectSampler(child);
            break;

        }
      }
    }

    function parseEffectSurface(xml) {

      var data = {};

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'init_from':
            data.init_from = child.textContent;
            break;

        }
      }

      return data;
    }

    function parseEffectSampler(xml) {

      var data = {};

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'source':
            data.source = child.textContent;
            break;

        }
      }

      return data;
    }

    function parseEffectTechnique(xml) {

      var data = {};

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'constant':
          case 'lambert':
          case 'blinn':
          case 'phong':
            data.type = child.nodeName;
            data.parameters = parseEffectParameters(child);
            break;

        }
      }

      return data;
    }

    function parseEffectParameters(xml) {

      var data = {};

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'emission':
          case 'diffuse':
          case 'specular':
          case 'bump':
          case 'ambient':
          case 'shininess':
          case 'transparency':
            data[child.nodeName] = parseEffectParameter(child);
            break;
          case 'transparent':
            data[child.nodeName] = {
              opaque: child.getAttribute('opaque'),
              data: parseEffectParameter(child)
            };
            break;

        }
      }

      return data;
    }

    function parseEffectParameter(xml) {

      var data = {};

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'color':
            data[child.nodeName] = parseFloats(child.textContent);
            break;

          case 'float':
            data[child.nodeName] = parseFloat(child.textContent);
            break;

          case 'texture':
            data[child.nodeName] = { id: child.getAttribute('texture'), extra: parseEffectParameterTexture(child) };
            break;

        }
      }

      return data;
    }

    function parseEffectParameterTexture(xml) {

      var data = {
        technique: {}
      };

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'extra':
            parseEffectParameterTextureExtra(child, data);
            break;

        }
      }

      return data;
    }

    function parseEffectParameterTextureExtra(xml, data) {

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'technique':
            parseEffectParameterTextureExtraTechnique(child, data);
            break;

        }
      }
    }

    function parseEffectParameterTextureExtraTechnique(xml, data) {

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'repeatU':
          case 'repeatV':
          case 'offsetU':
          case 'offsetV':
            data.technique[child.nodeName] = parseFloat(child.textContent);
            break;

          case 'wrapU':
          case 'wrapV':

            // some files have values for wrapU/wrapV which become NaN via parseInt

            if (child.textContent.toUpperCase() === 'TRUE') {

              data.technique[child.nodeName] = 1;
            } else if (child.textContent.toUpperCase() === 'FALSE') {

              data.technique[child.nodeName] = 0;
            } else {

              data.technique[child.nodeName] = parseInt(child.textContent);
            }

            break;

        }
      }
    }

    function parseEffectExtra(xml) {

      var data = {};

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'technique':
            data.technique = parseEffectExtraTechnique(child);
            break;

        }
      }

      return data;
    }

    function parseEffectExtraTechnique(xml) {

      var data = {};

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'double_sided':
            data[child.nodeName] = parseInt(child.textContent);
            break;

        }
      }

      return data;
    }

    function buildEffect(data) {

      return data;
    }

    function getEffect(id) {

      return getBuild(library.effects[id], buildEffect);
    }

    // material

    function parseMaterial(xml) {

      var data = {
        name: xml.getAttribute('name')
      };

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'instance_effect':
            data.url = parseId(child.getAttribute('url'));
            break;

        }
      }

      library.materials[xml.getAttribute('id')] = data;
    }

    function getTextureLoader(image) {

      var loader;

      var extension = image.slice((image.lastIndexOf('.') - 1 >>> 0) + 2); // http://www.jstips.co/en/javascript/get-file-extension/
      extension = extension.toLowerCase();

      switch (extension) {

        case 'tga':
          loader = tgaLoader;
          break;

        default:
          loader = textureLoader;

      }

      return loader;
    }

    function buildMaterial(data) {

      var effect = getEffect(data.url);
      var technique = effect.profile.technique;
      var extra = effect.profile.extra;

      var material;

      switch (technique.type) {

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

      function getTexture(textureObject) {

        var sampler = effect.profile.samplers[textureObject.id];
        var image = null;

        // get image

        if (sampler !== undefined) {

          var surface = effect.profile.surfaces[sampler.source];
          image = getImage(surface.init_from);
        } else {

          console.warn('THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530).');
          image = getImage(textureObject.id);
        }

        // create texture if image is avaiable

        if (image !== null) {

          var loader = getTextureLoader(image);

          if (loader !== undefined) {

            var texture = loader.load(image);

            var extra = textureObject.extra;

            if (extra !== undefined && extra.technique !== undefined && isEmpty(extra.technique) === false) {

              var technique = extra.technique;

              texture.wrapS = technique.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
              texture.wrapT = technique.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

              texture.offset.set(technique.offsetU || 0, technique.offsetV || 0);
              texture.repeat.set(technique.repeatU || 1, technique.repeatV || 1);
            } else {

              texture.wrapS = THREE.RepeatWrapping;
              texture.wrapT = THREE.RepeatWrapping;
            }

            return texture;
          } else {

            console.warn('THREE.ColladaLoader: Loader for texture %s not found.', image);

            return null;
          }
        } else {

          console.warn('THREE.ColladaLoader: Couldn\'t create texture with ID:', textureObject.id);

          return null;
        }
      }

      var parameters = technique.parameters;

      for (var key in parameters) {

        var parameter = parameters[key];

        switch (key) {

          case 'diffuse':
            if (parameter.color) material.color.fromArray(parameter.color);
            if (parameter.texture) material.map = getTexture(parameter.texture);
            break;
          case 'specular':
            if (parameter.color && material.specular) material.specular.fromArray(parameter.color);
            if (parameter.texture) material.specularMap = getTexture(parameter.texture);
            break;
          case 'bump':
            if (parameter.texture) material.normalMap = getTexture(parameter.texture);
            break;
          case 'ambient':
            if (parameter.texture) material.lightMap = getTexture(parameter.texture);
            break;
          case 'shininess':
            if (parameter.float && material.shininess) material.shininess = parameter.float;
            break;
          case 'emission':
            if (parameter.color && material.emissive) material.emissive.fromArray(parameter.color);
            if (parameter.texture) material.emissiveMap = getTexture(parameter.texture);
            break;

        }
      }

      //

      var transparent = parameters['transparent'];
      var transparency = parameters['transparency'];

      // <transparency> does not exist but <transparent>

      if (transparency === undefined && transparent) {

        transparency = {
          float: 1
        };
      }

      // <transparent> does not exist but <transparency>

      if (transparent === undefined && transparency) {

        transparent = {
          opaque: 'A_ONE',
          data: {
            color: [1, 1, 1, 1]
          } };
      }

      if (transparent && transparency) {

        // handle case if a texture exists but no color

        if (transparent.data.texture) {

          // we do not set an alpha map (see #13792)

          material.transparent = true;
        } else {

          var color = transparent.data.color;

          switch (transparent.opaque) {

            case 'A_ONE':
              material.opacity = color[3] * transparency.float;
              break;
            case 'RGB_ZERO':
              material.opacity = 1 - color[0] * transparency.float;
              break;
            case 'A_ZERO':
              material.opacity = 1 - color[3] * transparency.float;
              break;
            case 'RGB_ONE':
              material.opacity = color[0] * transparency.float;
              break;
            default:
              console.warn('THREE.ColladaLoader: Invalid opaque type "%s" of transparent tag.', transparent.opaque);

          }

          if (material.opacity < 1) material.transparent = true;
        }
      }

      //

      if (extra !== undefined && extra.technique !== undefined && extra.technique.double_sided === 1) {

        material.side = THREE.DoubleSide;
      }

      return material;
    }

    function getMaterial(id) {

      return getBuild(library.materials[id], buildMaterial);
    }

    // camera

    function parseCamera(xml) {

      var data = {
        name: xml.getAttribute('name')
      };

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'optics':
            data.optics = parseCameraOptics(child);
            break;

        }
      }

      library.cameras[xml.getAttribute('id')] = data;
    }

    function parseCameraOptics(xml) {

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        switch (child.nodeName) {

          case 'technique_common':
            return parseCameraTechnique(child);

        }
      }

      return {};
    }

    function parseCameraTechnique(xml) {

      var data = {};

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        switch (child.nodeName) {

          case 'perspective':
          case 'orthographic':

            data.technique = child.nodeName;
            data.parameters = parseCameraParameters(child);

            break;

        }
      }

      return data;
    }

    function parseCameraParameters(xml) {

      var data = {};

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        switch (child.nodeName) {

          case 'xfov':
          case 'yfov':
          case 'xmag':
          case 'ymag':
          case 'znear':
          case 'zfar':
          case 'aspect_ratio':
            data[child.nodeName] = parseFloat(child.textContent);
            break;

        }
      }

      return data;
    }

    function buildCamera(data) {

      var camera;

      switch (data.optics.technique) {

        case 'perspective':
          camera = new THREE.PerspectiveCamera(data.optics.parameters.yfov, data.optics.parameters.aspect_ratio, data.optics.parameters.znear, data.optics.parameters.zfar);
          break;

        case 'orthographic':
          var ymag = data.optics.parameters.ymag;
          var xmag = data.optics.parameters.xmag;
          var aspectRatio = data.optics.parameters.aspect_ratio;

          xmag = xmag === undefined ? ymag * aspectRatio : xmag;
          ymag = ymag === undefined ? xmag / aspectRatio : ymag;

          xmag *= 0.5;
          ymag *= 0.5;

          camera = new THREE.OrthographicCamera(-xmag, xmag, ymag, -ymag, // left, right, top, bottom
          data.optics.parameters.znear, data.optics.parameters.zfar);
          break;

        default:
          camera = new THREE.PerspectiveCamera();
          break;

      }

      camera.name = data.name;

      return camera;
    }

    function getCamera(id) {

      var data = library.cameras[id];

      if (data !== undefined) {

        return getBuild(data, buildCamera);
      }

      console.warn('THREE.ColladaLoader: Couldn\'t find camera with ID:', id);

      return null;
    }

    // light

    function parseLight(xml) {

      var data = {};

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'technique_common':
            data = parseLightTechnique(child);
            break;

        }
      }

      library.lights[xml.getAttribute('id')] = data;
    }

    function parseLightTechnique(xml) {

      var data = {};

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'directional':
          case 'point':
          case 'spot':
          case 'ambient':

            data.technique = child.nodeName;
            data.parameters = parseLightParameters(child);

        }
      }

      return data;
    }

    function parseLightParameters(xml) {

      var data = {};

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'color':
            var array = parseFloats(child.textContent);
            data.color = new THREE.Color().fromArray(array);
            break;

          case 'falloff_angle':
            data.falloffAngle = parseFloat(child.textContent);
            break;

          case 'quadratic_attenuation':
            var f = parseFloat(child.textContent);
            data.distance = f ? Math.sqrt(1 / f) : 0;
            break;

        }
      }

      return data;
    }

    function buildLight(data) {

      var light;

      switch (data.technique) {

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

      if (data.parameters.color) light.color.copy(data.parameters.color);
      if (data.parameters.distance) light.distance = data.parameters.distance;

      return light;
    }

    function getLight(id) {

      var data = library.lights[id];

      if (data !== undefined) {

        return getBuild(data, buildLight);
      }

      console.warn('THREE.ColladaLoader: Couldn\'t find light with ID:', id);

      return null;
    }

    // geometry

    function parseGeometry(xml) {

      var data = {
        name: xml.getAttribute('name'),
        sources: {},
        vertices: {},
        primitives: []
      };

      var mesh = getElementsByTagName(xml, 'mesh')[0];

      // the following tags inside geometry are not supported yet (see https://github.com/mrdoob/three.js/pull/12606): convex_mesh, spline, brep
      if (mesh === undefined) return;

      for (var i = 0; i < mesh.childNodes.length; i++) {

        var child = mesh.childNodes[i];

        if (child.nodeType !== 1) continue;

        var id = child.getAttribute('id');

        switch (child.nodeName) {

          case 'source':
            data.sources[id] = parseSource(child);
            break;

          case 'vertices':
            // data.sources[ id ] = data.sources[ parseId( getElementsByTagName( child, 'input' )[ 0 ].getAttribute( 'source' ) ) ];
            data.vertices = parseGeometryVertices(child);
            break;

          case 'polygons':
            console.warn('THREE.ColladaLoader: Unsupported primitive type: ', child.nodeName);
            break;

          case 'lines':
          case 'linestrips':
          case 'polylist':
          case 'triangles':
            data.primitives.push(parseGeometryPrimitive(child));
            break;

          default:
            console.log(child);

        }
      }

      library.geometries[xml.getAttribute('id')] = data;
    }

    function parseSource(xml) {

      var data = {
        array: [],
        stride: 3
      };

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'float_array':
            data.array = parseFloats(child.textContent);
            break;

          case 'Name_array':
            data.array = parseStrings(child.textContent);
            break;

          case 'technique_common':
            var accessor = getElementsByTagName(child, 'accessor')[0];

            if (accessor !== undefined) {

              data.stride = parseInt(accessor.getAttribute('stride'));
            }
            break;

        }
      }

      return data;
    }

    function parseGeometryVertices(xml) {

      var data = {};

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        data[child.getAttribute('semantic')] = parseId(child.getAttribute('source'));
      }

      return data;
    }

    function parseGeometryPrimitive(xml) {

      var primitive = {
        type: xml.nodeName,
        material: xml.getAttribute('material'),
        count: parseInt(xml.getAttribute('count')),
        inputs: {},
        stride: 0,
        hasUV: false
      };

      for (var i = 0, l = xml.childNodes.length; i < l; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'input':
            var id = parseId(child.getAttribute('source'));
            var semantic = child.getAttribute('semantic');
            var offset = parseInt(child.getAttribute('offset'));
            var set = parseInt(child.getAttribute('set'));
            var inputname = set > 0 ? semantic + set : semantic;
            primitive.inputs[inputname] = { id: id, offset: offset };
            primitive.stride = Math.max(primitive.stride, offset + 1);
            if (semantic === 'TEXCOORD') primitive.hasUV = true;
            break;

          case 'vcount':
            primitive.vcount = parseInts(child.textContent);
            break;

          case 'p':
            primitive.p = parseInts(child.textContent);
            break;

        }
      }

      return primitive;
    }

    function groupPrimitives(primitives) {

      var build = {};

      for (var i = 0; i < primitives.length; i++) {

        var primitive = primitives[i];

        if (build[primitive.type] === undefined) build[primitive.type] = [];

        build[primitive.type].push(primitive);
      }

      return build;
    }

    function checkUVCoordinates(primitives) {

      var count = 0;

      for (var i = 0, l = primitives.length; i < l; i++) {

        var primitive = primitives[i];

        if (primitive.hasUV === true) {

          count++;
        }
      }

      if (count > 0 && count < primitives.length) {

        primitives.uvsNeedsFix = true;
      }
    }

    function buildGeometry(data) {

      var build = {};

      var sources = data.sources;
      var vertices = data.vertices;
      var primitives = data.primitives;

      if (primitives.length === 0) return {};

      // our goal is to create one buffer geometry for a single type of primitives
      // first, we group all primitives by their type

      var groupedPrimitives = groupPrimitives(primitives);

      for (var type in groupedPrimitives) {

        var primitiveType = groupedPrimitives[type];

        // second, ensure consistent uv coordinates for each type of primitives (polylist,triangles or lines)

        checkUVCoordinates(primitiveType);

        // third, create a buffer geometry for each type of primitives

        build[type] = buildGeometryType(primitiveType, sources, vertices);
      }

      return build;
    }

    function buildGeometryType(primitives, sources, vertices) {

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

      for (var p = 0; p < primitives.length; p++) {

        var primitive = primitives[p];
        var inputs = primitive.inputs;

        // groups

        var count = 0;

        switch (primitive.type) {

          case 'lines':
          case 'linestrips':
            count = primitive.count * 2;
            break;

          case 'triangles':
            count = primitive.count * 3;
            break;

          case 'polylist':

            for (var g = 0; g < primitive.count; g++) {

              var vc = primitive.vcount[g];

              switch (vc) {

                case 3:
                  count += 3; // single triangle
                  break;

                case 4:
                  count += 6; // quad, subdivided into two triangles
                  break;

                default:
                  count += (vc - 2) * 3; // polylist with more than four vertices
                  break;

              }
            }

            break;

          default:
            console.warn('THREE.ColladaLoader: Unknow primitive type:', primitive.type);

        }

        geometry.addGroup(start, count, p);
        start += count;

        // material

        if (primitive.material) {

          materialKeys.push(primitive.material);
        }

        // geometry data

        for (var name in inputs) {

          var input = inputs[name];

          switch (name) {

            case 'VERTEX':
              for (var key in vertices) {

                var id = vertices[key];

                switch (key) {

                  case 'POSITION':
                    var prevLength = position.array.length;
                    buildGeometryData(primitive, sources[id], input.offset, position.array);
                    position.stride = sources[id].stride;

                    if (sources.skinWeights && sources.skinIndices) {

                      buildGeometryData(primitive, sources.skinIndices, input.offset, skinIndex.array);
                      buildGeometryData(primitive, sources.skinWeights, input.offset, skinWeight.array);
                    }

                    // see #3803

                    if (primitive.hasUV === false && primitives.uvsNeedsFix === true) {

                      var count = (position.array.length - prevLength) / position.stride;

                      for (var i = 0; i < count; i++) {

                        // fill missing uv coordinates

                        uv.array.push(0, 0);
                      }
                    }
                    break;

                  case 'NORMAL':
                    buildGeometryData(primitive, sources[id], input.offset, normal.array);
                    normal.stride = sources[id].stride;
                    break;

                  case 'COLOR':
                    buildGeometryData(primitive, sources[id], input.offset, color.array);
                    color.stride = sources[id].stride;
                    break;

                  case 'TEXCOORD':
                    buildGeometryData(primitive, sources[id], input.offset, uv.array);
                    uv.stride = sources[id].stride;
                    break;

                  case 'TEXCOORD1':
                    buildGeometryData(primitive, sources[id], input.offset, uv2.array);
                    uv.stride = sources[id].stride;
                    break;

                  default:
                    console.warn('THREE.ColladaLoader: Semantic "%s" not handled in geometry build process.', key);

                }
              }
              break;

            case 'NORMAL':
              buildGeometryData(primitive, sources[input.id], input.offset, normal.array);
              normal.stride = sources[input.id].stride;
              break;

            case 'COLOR':
              buildGeometryData(primitive, sources[input.id], input.offset, color.array);
              color.stride = sources[input.id].stride;
              break;

            case 'TEXCOORD':
              buildGeometryData(primitive, sources[input.id], input.offset, uv.array);
              uv.stride = sources[input.id].stride;
              break;

            case 'TEXCOORD1':
              buildGeometryData(primitive, sources[input.id], input.offset, uv2.array);
              uv2.stride = sources[input.id].stride;
              break;

          }
        }
      }

      // build geometry

      if (position.array.length > 0) geometry.addAttribute('position', new THREE.Float32BufferAttribute(position.array, position.stride));
      if (normal.array.length > 0) geometry.addAttribute('normal', new THREE.Float32BufferAttribute(normal.array, normal.stride));
      if (color.array.length > 0) geometry.addAttribute('color', new THREE.Float32BufferAttribute(color.array, color.stride));
      if (uv.array.length > 0) geometry.addAttribute('uv', new THREE.Float32BufferAttribute(uv.array, uv.stride));
      if (uv2.array.length > 0) geometry.addAttribute('uv2', new THREE.Float32BufferAttribute(uv2.array, uv2.stride));

      if (skinIndex.array.length > 0) geometry.addAttribute('skinIndex', new THREE.Float32BufferAttribute(skinIndex.array, skinIndex.stride));
      if (skinWeight.array.length > 0) geometry.addAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeight.array, skinWeight.stride));

      build.data = geometry;
      build.type = primitives[0].type;
      build.materialKeys = materialKeys;

      return build;
    }

    function buildGeometryData(primitive, source, offset, array) {

      var indices = primitive.p;
      var stride = primitive.stride;
      var vcount = primitive.vcount;

      function pushVector(i) {

        var index = indices[i + offset] * sourceStride;
        var length = index + sourceStride;

        for (; index < length; index++) {

          array.push(sourceArray[index]);
        }
      }

      var sourceArray = source.array;
      var sourceStride = source.stride;

      if (primitive.vcount !== undefined) {

        var index = 0;

        for (var i = 0, l = vcount.length; i < l; i++) {

          var count = vcount[i];

          if (count === 4) {

            var a = index + stride * 0;
            var b = index + stride * 1;
            var c = index + stride * 2;
            var d = index + stride * 3;

            pushVector(a);pushVector(b);pushVector(d);
            pushVector(b);pushVector(c);pushVector(d);
          } else if (count === 3) {

            var a = index + stride * 0;
            var b = index + stride * 1;
            var c = index + stride * 2;

            pushVector(a);pushVector(b);pushVector(c);
          } else if (count > 4) {

            for (var k = 1, kl = count - 2; k <= kl; k++) {

              var a = index + stride * 0;
              var b = index + stride * k;
              var c = index + stride * (k + 1);

              pushVector(a);pushVector(b);pushVector(c);
            }
          }

          index += stride * count;
        }
      } else {

        for (var i = 0, l = indices.length; i < l; i += stride) {

          pushVector(i);
        }
      }
    }

    function getGeometry(id) {

      return getBuild(library.geometries[id], buildGeometry);
    }

    // kinematics

    function parseKinematicsModel(xml) {

      var data = {
        name: xml.getAttribute('name') || '',
        joints: {},
        links: []
      };

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'technique_common':
            parseKinematicsTechniqueCommon(child, data);
            break;

        }
      }

      library.kinematicsModels[xml.getAttribute('id')] = data;
    }

    function buildKinematicsModel(data) {

      if (data.build !== undefined) return data.build;

      return data;
    }

    function getKinematicsModel(id) {

      return getBuild(library.kinematicsModels[id], buildKinematicsModel);
    }

    function parseKinematicsTechniqueCommon(xml, data) {

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'joint':
            data.joints[child.getAttribute('sid')] = parseKinematicsJoint(child);
            break;

          case 'link':
            data.links.push(parseKinematicsLink(child));
            break;

        }
      }
    }

    function parseKinematicsJoint(xml) {

      var data;

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'prismatic':
          case 'revolute':
            data = parseKinematicsJointParameter(child);
            break;

        }
      }

      return data;
    }

    function parseKinematicsJointParameter(xml, data) {

      var data = {
        sid: xml.getAttribute('sid'),
        name: xml.getAttribute('name') || '',
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

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'axis':
            var array = parseFloats(child.textContent);
            data.axis.fromArray(array);
            break;
          case 'limits':
            var max = child.getElementsByTagName('max')[0];
            var min = child.getElementsByTagName('min')[0];

            data.limits.max = parseFloat(max.textContent);
            data.limits.min = parseFloat(min.textContent);
            break;

        }
      }

      // if min is equal to or greater than max, consider the joint static

      if (data.limits.min >= data.limits.max) {

        data.static = true;
      }

      // calculate middle position

      data.middlePosition = (data.limits.min + data.limits.max) / 2.0;

      return data;
    }

    function parseKinematicsLink(xml) {

      var data = {
        sid: xml.getAttribute('sid'),
        name: xml.getAttribute('name') || '',
        attachments: [],
        transforms: []
      };

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'attachment_full':
            data.attachments.push(parseKinematicsAttachment(child));
            break;

          case 'matrix':
          case 'translate':
          case 'rotate':
            data.transforms.push(parseKinematicsTransform(child));
            break;

        }
      }

      return data;
    }

    function parseKinematicsAttachment(xml) {

      var data = {
        joint: xml.getAttribute('joint').split('/').pop(),
        transforms: [],
        links: []
      };

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'link':
            data.links.push(parseKinematicsLink(child));
            break;

          case 'matrix':
          case 'translate':
          case 'rotate':
            data.transforms.push(parseKinematicsTransform(child));
            break;

        }
      }

      return data;
    }

    function parseKinematicsTransform(xml) {

      var data = {
        type: xml.nodeName
      };

      var array = parseFloats(xml.textContent);

      switch (data.type) {

        case 'matrix':
          data.obj = new THREE.Matrix4();
          data.obj.fromArray(array).transpose();
          break;

        case 'translate':
          data.obj = new THREE.Vector3();
          data.obj.fromArray(array);
          break;

        case 'rotate':
          data.obj = new THREE.Vector3();
          data.obj.fromArray(array);
          data.angle = THREE.Math.degToRad(array[3]);
          break;

      }

      return data;
    }

    // physics

    function parsePhysicsModel(xml) {

      var data = {
        name: xml.getAttribute('name') || '',
        rigidBodies: {}
      };

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'rigid_body':
            data.rigidBodies[child.getAttribute('name')] = {};
            parsePhysicsRigidBody(child, data.rigidBodies[child.getAttribute('name')]);
            break;

        }
      }

      library.physicsModels[xml.getAttribute('id')] = data;
    }

    function parsePhysicsRigidBody(xml, data) {

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'technique_common':
            parsePhysicsTechniqueCommon(child, data);
            break;

        }
      }
    }

    function parsePhysicsTechniqueCommon(xml, data) {

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'inertia':
            data.inertia = parseFloats(child.textContent);
            break;

          case 'mass':
            data.mass = parseFloats(child.textContent)[0];
            break;

        }
      }
    }

    // scene

    function parseKinematicsScene(xml) {

      var data = {
        bindJointAxis: []
      };

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'bind_joint_axis':
            data.bindJointAxis.push(parseKinematicsBindJointAxis(child));
            break;

        }
      }

      library.kinematicsScenes[parseId(xml.getAttribute('url'))] = data;
    }

    function parseKinematicsBindJointAxis(xml) {

      var data = {
        target: xml.getAttribute('target').split('/').pop()
      };

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'axis':
            var param = child.getElementsByTagName('param')[0];
            data.axis = param.textContent;
            var tmpJointIndex = data.axis.split('inst_').pop().split('axis')[0];
            data.jointIndex = tmpJointIndex.substr(0, tmpJointIndex.length - 1);
            break;

        }
      }

      return data;
    }

    function buildKinematicsScene(data) {

      if (data.build !== undefined) return data.build;

      return data;
    }

    function getKinematicsScene(id) {

      return getBuild(library.kinematicsScenes[id], buildKinematicsScene);
    }

    function setupKinematics() {

      var kinematicsModelId = Object.keys(library.kinematicsModels)[0];
      var kinematicsSceneId = Object.keys(library.kinematicsScenes)[0];
      var visualSceneId = Object.keys(library.visualScenes)[0];

      if (kinematicsModelId === undefined || kinematicsSceneId === undefined) return;

      var kinematicsModel = getKinematicsModel(kinematicsModelId);
      var kinematicsScene = getKinematicsScene(kinematicsSceneId);
      var visualScene = getVisualScene(visualSceneId);

      var bindJointAxis = kinematicsScene.bindJointAxis;
      var jointMap = {};

      for (var i = 0, l = bindJointAxis.length; i < l; i++) {

        var axis = bindJointAxis[i];

        // the result of the following query is an element of type 'translate', 'rotate','scale' or 'matrix'

        var targetElement = collada.querySelector('[sid="' + axis.target + '"]');

        if (targetElement) {

          // get the parent of the transfrom element

          var parentVisualElement = targetElement.parentElement;

          // connect the joint of the kinematics model with the element in the visual scene

          connect(axis.jointIndex, parentVisualElement);
        }
      }

      function connect(jointIndex, visualElement) {

        var visualElementName = visualElement.getAttribute('name');
        var joint = kinematicsModel.joints[jointIndex];

        visualScene.traverse(function (object) {

          if (object.name === visualElementName) {

            jointMap[jointIndex] = {
              object: object,
              transforms: buildTransformList(visualElement),
              joint: joint,
              position: joint.zeroPosition
            };
          }
        });
      }

      var m0 = new THREE.Matrix4();

      kinematics = {

        joints: kinematicsModel && kinematicsModel.joints,

        getJointValue: function getJointValue(jointIndex) {

          var jointData = jointMap[jointIndex];

          if (jointData) {

            return jointData.position;
          } else {

            console.warn('THREE.ColladaLoader: Joint ' + jointIndex + ' doesn\'t exist.');
          }
        },

        setJointValue: function setJointValue(jointIndex, value) {

          var jointData = jointMap[jointIndex];

          if (jointData) {

            var joint = jointData.joint;

            if (value > joint.limits.max || value < joint.limits.min) {

              console.warn('THREE.ColladaLoader: Joint ' + jointIndex + ' value ' + value + ' outside of limits (min: ' + joint.limits.min + ', max: ' + joint.limits.max + ').');
            } else if (joint.static) {

              console.warn('THREE.ColladaLoader: Joint ' + jointIndex + ' is static.');
            } else {

              var object = jointData.object;
              var axis = joint.axis;
              var transforms = jointData.transforms;

              matrix.identity();

              // each update, we have to apply all transforms in the correct order

              for (var i = 0; i < transforms.length; i++) {

                var transform = transforms[i];

                // if there is a connection of the transform node with a joint, apply the joint value

                if (transform.sid && transform.sid.indexOf(jointIndex) !== -1) {

                  switch (joint.type) {

                    case 'revolute':
                      matrix.multiply(m0.makeRotationAxis(axis, THREE.Math.degToRad(value)));
                      break;

                    case 'prismatic':
                      matrix.multiply(m0.makeTranslation(axis.x * value, axis.y * value, axis.z * value));
                      break;

                    default:
                      console.warn('THREE.ColladaLoader: Unknown joint type: ' + joint.type);
                      break;

                  }
                } else {

                  switch (transform.type) {

                    case 'matrix':
                      matrix.multiply(transform.obj);
                      break;

                    case 'translate':
                      matrix.multiply(m0.makeTranslation(transform.obj.x, transform.obj.y, transform.obj.z));
                      break;

                    case 'scale':
                      matrix.scale(transform.obj);
                      break;

                    case 'rotate':
                      matrix.multiply(m0.makeRotationAxis(transform.obj, transform.angle));
                      break;

                  }
                }
              }

              object.matrix.copy(matrix);
              object.matrix.decompose(object.position, object.quaternion, object.scale);

              jointMap[jointIndex].position = value;
            }
          } else {

            console.log('THREE.ColladaLoader: ' + jointIndex + ' does not exist.');
          }
        }

      };
    }

    function buildTransformList(node) {

      var transforms = [];

      var xml = collada.querySelector('[id="' + node.id + '"]');

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'matrix':
            var array = parseFloats(child.textContent);
            var matrix = new THREE.Matrix4().fromArray(array).transpose();
            transforms.push({
              sid: child.getAttribute('sid'),
              type: child.nodeName,
              obj: matrix
            });
            break;

          case 'translate':
          case 'scale':
            var array = parseFloats(child.textContent);
            var vector = new THREE.Vector3().fromArray(array);
            transforms.push({
              sid: child.getAttribute('sid'),
              type: child.nodeName,
              obj: vector
            });
            break;

          case 'rotate':
            var array = parseFloats(child.textContent);
            var vector = new THREE.Vector3().fromArray(array);
            var angle = THREE.Math.degToRad(array[3]);
            transforms.push({
              sid: child.getAttribute('sid'),
              type: child.nodeName,
              obj: vector,
              angle: angle
            });
            break;

        }
      }

      return transforms;
    }

    // nodes

    function prepareNodes(xml) {

      var elements = xml.getElementsByTagName('node');

      // ensure all node elements have id attributes

      for (var i = 0; i < elements.length; i++) {

        var element = elements[i];

        if (element.hasAttribute('id') === false) {

          element.setAttribute('id', generateId());
        }
      }
    }

    var matrix = new THREE.Matrix4();
    var vector = new THREE.Vector3();

    function parseNode(xml) {

      var data = {
        name: xml.getAttribute('name') || '',
        type: xml.getAttribute('type'),
        id: xml.getAttribute('id'),
        sid: xml.getAttribute('sid'),
        matrix: new THREE.Matrix4(),
        nodes: [],
        instanceCameras: [],
        instanceControllers: [],
        instanceLights: [],
        instanceGeometries: [],
        instanceNodes: [],
        transforms: {}
      };

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        if (child.nodeType !== 1) continue;

        switch (child.nodeName) {

          case 'node':
            data.nodes.push(child.getAttribute('id'));
            parseNode(child);
            break;

          case 'instance_camera':
            data.instanceCameras.push(parseId(child.getAttribute('url')));
            break;

          case 'instance_controller':
            data.instanceControllers.push(parseNodeInstance(child));
            break;

          case 'instance_light':
            data.instanceLights.push(parseId(child.getAttribute('url')));
            break;

          case 'instance_geometry':
            data.instanceGeometries.push(parseNodeInstance(child));
            break;

          case 'instance_node':
            data.instanceNodes.push(parseId(child.getAttribute('url')));
            break;

          case 'matrix':
            var array = parseFloats(child.textContent);
            data.matrix.multiply(matrix.fromArray(array).transpose());
            data.transforms[child.getAttribute('sid')] = child.nodeName;
            break;

          case 'translate':
            var array = parseFloats(child.textContent);
            vector.fromArray(array);
            data.matrix.multiply(matrix.makeTranslation(vector.x, vector.y, vector.z));
            data.transforms[child.getAttribute('sid')] = child.nodeName;
            break;

          case 'rotate':
            var array = parseFloats(child.textContent);
            var angle = THREE.Math.degToRad(array[3]);
            data.matrix.multiply(matrix.makeRotationAxis(vector.fromArray(array), angle));
            data.transforms[child.getAttribute('sid')] = child.nodeName;
            break;

          case 'scale':
            var array = parseFloats(child.textContent);
            data.matrix.scale(vector.fromArray(array));
            data.transforms[child.getAttribute('sid')] = child.nodeName;
            break;

          case 'extra':
            break;

          default:
            console.log(child);

        }
      }

      if (hasNode(data.id)) {

        console.warn('THREE.ColladaLoader: There is already a node with ID %s. Exclude current node from further processing.', data.id);
      } else {

        library.nodes[data.id] = data;
      }

      return data;
    }

    function parseNodeInstance(xml) {

      var data = {
        id: parseId(xml.getAttribute('url')),
        materials: {},
        skeletons: []
      };

      for (var i = 0; i < xml.childNodes.length; i++) {

        var child = xml.childNodes[i];

        switch (child.nodeName) {

          case 'bind_material':
            var instances = child.getElementsByTagName('instance_material');

            for (var j = 0; j < instances.length; j++) {

              var instance = instances[j];
              var symbol = instance.getAttribute('symbol');
              var target = instance.getAttribute('target');

              data.materials[symbol] = parseId(target);
            }

            break;

          case 'skeleton':
            data.skeletons.push(parseId(child.textContent));
            break;

          default:
            break;

        }
      }

      return data;
    }

    function buildSkeleton(skeletons, joints) {

      var boneData = [];
      var sortedBoneData = [];

      var i, j, data;

      // a skeleton can have multiple root bones. collada expresses this
      // situtation with multiple "skeleton" tags per controller instance

      for (i = 0; i < skeletons.length; i++) {

        var skeleton = skeletons[i];

        var root;

        if (hasNode(skeleton)) {

          root = getNode(skeleton);
          buildBoneHierarchy(root, joints, boneData);
        } else if (hasVisualScene(skeleton)) {

          // handle case where the skeleton refers to the visual scene (#13335)

          var visualScene = library.visualScenes[skeleton];
          var children = visualScene.children;

          for (var j = 0; j < children.length; j++) {

            var child = children[j];

            if (child.type === 'JOINT') {

              var root = getNode(child.id);
              buildBoneHierarchy(root, joints, boneData);
            }
          }
        } else {

          console.error('THREE.ColladaLoader: Unable to find root bone of skeleton with ID:', skeleton);
        }
      }

      // sort bone data (the order is defined in the corresponding controller)

      for (i = 0; i < joints.length; i++) {

        for (j = 0; j < boneData.length; j++) {

          data = boneData[j];

          if (data.bone.name === joints[i].name) {

            sortedBoneData[i] = data;
            data.processed = true;
            break;
          }
        }
      }

      // add unprocessed bone data at the end of the list

      for (i = 0; i < boneData.length; i++) {

        data = boneData[i];

        if (data.processed === false) {

          sortedBoneData.push(data);
          data.processed = true;
        }
      }

      // setup arrays for skeleton creation

      var bones = [];
      var boneInverses = [];

      for (i = 0; i < sortedBoneData.length; i++) {

        data = sortedBoneData[i];

        bones.push(data.bone);
        boneInverses.push(data.boneInverse);
      }

      return new THREE.Skeleton(bones, boneInverses);
    }

    function buildBoneHierarchy(root, joints, boneData) {

      // setup bone data from visual scene

      root.traverse(function (object) {

        if (object.isBone === true) {

          var boneInverse;

          // retrieve the boneInverse from the controller data

          for (var i = 0; i < joints.length; i++) {

            var joint = joints[i];

            if (joint.name === object.name) {

              boneInverse = joint.boneInverse;
              break;
            }
          }

          if (boneInverse === undefined) {

            // Unfortunately, there can be joints in the visual scene that are not part of the
            // corresponding controller. In this case, we have to create a dummy boneInverse matrix
            // for the respective bone. This bone won't affect any vertices, because there are no skin indices
            // and weights defined for it. But we still have to add the bone to the sorted bone list in order to
            // ensure a correct animation of the model.

            boneInverse = new THREE.Matrix4();
          }

          boneData.push({ bone: object, boneInverse: boneInverse, processed: false });
        }
      });
    }

    function buildNode(data) {

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

      for (var i = 0, l = nodes.length; i < l; i++) {

        objects.push(getNode(nodes[i]));
      }

      // instance cameras

      for (var i = 0, l = instanceCameras.length; i < l; i++) {

        var instanceCamera = getCamera(instanceCameras[i]);

        if (instanceCamera !== null) {

          objects.push(instanceCamera.clone());
        }
      }

      // instance controllers

      for (var i = 0, l = instanceControllers.length; i < l; i++) {

        var instance = instanceControllers[i];
        var controller = getController(instance.id);
        var geometries = getGeometry(controller.id);
        var newObjects = buildObjects(geometries, instance.materials);

        var skeletons = instance.skeletons;
        var joints = controller.skin.joints;

        var skeleton = buildSkeleton(skeletons, joints);

        for (var j = 0, jl = newObjects.length; j < jl; j++) {

          var object = newObjects[j];

          if (object.isSkinnedMesh) {

            object.bind(skeleton, controller.skin.bindMatrix);
            object.normalizeSkinWeights();
          }

          objects.push(object);
        }
      }

      // instance lights

      for (var i = 0, l = instanceLights.length; i < l; i++) {

        var instanceLight = getLight(instanceLights[i]);

        if (instanceLight !== null) {

          objects.push(instanceLight.clone());
        }
      }

      // instance geometries

      for (var i = 0, l = instanceGeometries.length; i < l; i++) {

        var instance = instanceGeometries[i];

        // a single geometry instance in collada can lead to multiple object3Ds.
        // this is the case when primitives are combined like triangles and lines

        var geometries = getGeometry(instance.id);
        var newObjects = buildObjects(geometries, instance.materials);

        for (var j = 0, jl = newObjects.length; j < jl; j++) {

          objects.push(newObjects[j]);
        }
      }

      // instance nodes

      for (var i = 0, l = instanceNodes.length; i < l; i++) {

        objects.push(getNode(instanceNodes[i]).clone());
      }

      var object;

      if (nodes.length === 0 && objects.length === 1) {

        object = objects[0];
      } else {

        object = type === 'JOINT' ? new THREE.Bone() : new THREE.Group();

        for (var i = 0; i < objects.length; i++) {

          object.add(objects[i]);
        }
      }

      if (object.name === '') {

        object.name = type === 'JOINT' ? data.sid : data.name;
      }

      object.matrix.copy(matrix);
      object.matrix.decompose(object.position, object.quaternion, object.scale);

      return object;
    }

    var fallbackMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });

    function resolveMaterialBinding(keys, instanceMaterials) {

      var materials = [];

      for (var i = 0, l = keys.length; i < l; i++) {

        var id = instanceMaterials[keys[i]];

        if (id === undefined) {

          console.warn('THREE.ColladaLoader: Material with key %s not found. Apply fallback material.', keys[i]);
          materials.push(fallbackMaterial);
        } else {

          materials.push(getMaterial(id));
        }
      }

      return materials;
    }

    function buildObjects(geometries, instanceMaterials) {

      var objects = [];

      for (var type in geometries) {

        var geometry = geometries[type];

        var materials = resolveMaterialBinding(geometry.materialKeys, instanceMaterials);

        // handle case if no materials are defined

        if (materials.length === 0) {

          if (type === 'lines' || type === 'linestrips') {

            materials.push(new THREE.LineBasicMaterial());
          } else {

            materials.push(new THREE.MeshPhongMaterial());
          }
        }

        // regard skinning

        var skinning = geometry.data.attributes.skinIndex !== undefined;

        if (skinning) {

          for (var i = 0, l = materials.length; i < l; i++) {

            materials[i].skinning = true;
          }
        }

        // choose between a single or multi materials (material array)

        var material = materials.length === 1 ? materials[0] : materials;

        // now create a specific 3D object

        var object;

        switch (type) {

          case 'lines':
            object = new THREE.LineSegments(geometry.data, material);
            break;

          case 'linestrips':
            object = new THREE.Line(geometry.data, material);
            break;

          case 'triangles':
          case 'polylist':
            if (skinning) {

              object = new THREE.SkinnedMesh(geometry.data, material);
            } else {

              object = new THREE.Mesh(geometry.data, material);
            }
            break;

        }

        objects.push(object);
      }

      return objects;
    }

    function hasNode(id) {

      return library.nodes[id] !== undefined;
    }

    function getNode(id) {

      return getBuild(library.nodes[id], buildNode);
    }

    // visual scenes

    function parseVisualScene(xml) {

      var data = {
        name: xml.getAttribute('name'),
        children: []
      };

      prepareNodes(xml);

      var elements = getElementsByTagName(xml, 'node');

      for (var i = 0; i < elements.length; i++) {

        data.children.push(parseNode(elements[i]));
      }

      library.visualScenes[xml.getAttribute('id')] = data;
    }

    function buildVisualScene(data) {

      var group = new THREE.Group();
      group.name = data.name;

      var children = data.children;

      for (var i = 0; i < children.length; i++) {

        var child = children[i];

        group.add(getNode(child.id));
      }

      return group;
    }

    function hasVisualScene(id) {

      return library.visualScenes[id] !== undefined;
    }

    function getVisualScene(id) {

      return getBuild(library.visualScenes[id], buildVisualScene);
    }

    // scenes

    function parseScene(xml) {

      var instance = getElementsByTagName(xml, 'instance_visual_scene')[0];
      return getVisualScene(parseId(instance.getAttribute('url')));
    }

    function setupAnimations() {

      var clips = library.clips;

      if (isEmpty(clips) === true) {

        if (isEmpty(library.animations) === false) {

          // if there are animations but no clips, we create a default clip for playback

          var tracks = [];

          for (var id in library.animations) {

            var animationTracks = getAnimation(id);

            for (var i = 0, l = animationTracks.length; i < l; i++) {

              tracks.push(animationTracks[i]);
            }
          }

          animations.push(new THREE.AnimationClip('default', -1, tracks));
        }
      } else {

        for (var id in clips) {

          animations.push(getAnimationClip(id));
        }
      }
    }

    if (text.length === 0) {

      return { scene: new THREE.Scene() };
    }

    var xml = new DOMParser().parseFromString(text, 'application/xml');

    var collada = getElementsByTagName(xml, 'COLLADA')[0];

    // metadata

    var version = collada.getAttribute('version');
    console.log('THREE.ColladaLoader: File version', version);

    var asset = parseAsset(getElementsByTagName(collada, 'asset')[0]);
    var textureLoader = new THREE.TextureLoader(this.manager);
    textureLoader.setPath(this.resourcePath || path).setCrossOrigin(this.crossOrigin);

    var tgaLoader;

    if (THREE.TGALoader) {

      tgaLoader = new THREE.TGALoader(this.manager);
      tgaLoader.setPath(this.resourcePath || path);
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

    parseLibrary(collada, 'library_animations', 'animation', parseAnimation);
    parseLibrary(collada, 'library_animation_clips', 'animation_clip', parseAnimationClip);
    parseLibrary(collada, 'library_controllers', 'controller', parseController);
    parseLibrary(collada, 'library_images', 'image', parseImage);
    parseLibrary(collada, 'library_effects', 'effect', parseEffect);
    parseLibrary(collada, 'library_materials', 'material', parseMaterial);
    parseLibrary(collada, 'library_cameras', 'camera', parseCamera);
    parseLibrary(collada, 'library_lights', 'light', parseLight);
    parseLibrary(collada, 'library_geometries', 'geometry', parseGeometry);
    parseLibrary(collada, 'library_nodes', 'node', parseNode);
    parseLibrary(collada, 'library_visual_scenes', 'visual_scene', parseVisualScene);
    parseLibrary(collada, 'library_kinematics_models', 'kinematics_model', parseKinematicsModel);
    parseLibrary(collada, 'library_physics_models', 'physics_model', parsePhysicsModel);
    parseLibrary(collada, 'scene', 'instance_kinematics_scene', parseKinematicsScene);

    buildLibrary(library.animations, buildAnimation);
    buildLibrary(library.clips, buildAnimationClip);
    buildLibrary(library.controllers, buildController);
    buildLibrary(library.images, buildImage);
    buildLibrary(library.effects, buildEffect);
    buildLibrary(library.materials, buildMaterial);
    buildLibrary(library.cameras, buildCamera);
    buildLibrary(library.lights, buildLight);
    buildLibrary(library.geometries, buildGeometry);
    buildLibrary(library.visualScenes, buildVisualScene);

    setupAnimations();
    setupKinematics();

    var scene = parseScene(getElementsByTagName(collada, 'scene')[0]);

    if (asset.upAxis === 'Z_UP') {

      scene.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    }

    scene.scale.multiplyScalar(asset.unit);

    return {
      animations: animations,
      kinematics: kinematics,
      library: library,
      scene: scene
    };
  }

};

},{}],3:[function(require,module,exports){
'use strict';

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
	return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
	return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

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

module.exports = THREE.FBXLoader = function () {

	var fbxTree;
	var connections;
	var sceneGraph;

	function FBXLoader(manager) {

		this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;
	}

	FBXLoader.prototype = {

		constructor: FBXLoader,

		crossOrigin: 'anonymous',

		load: function load(url, onLoad, onProgress, onError) {
			var self = this;

			var resourceDirectory = THREE.LoaderUtils.extractUrlBase(url);

			var loader = new THREE.FileLoader(this.manager);
			loader.setResponseType('arraybuffer');
			loader.load(url, function (buffer) {

				try {

					var scene = self.parse(buffer, resourceDirectory);
					onLoad(scene);
				} catch (error) {

					setTimeout(function () {

						if (onError) onError(error);

						self.manager.itemError(url);
					}, 0);
				}
			}, onProgress, onError);
		},

		setCrossOrigin: function setCrossOrigin(value) {

			this.crossOrigin = value;
			return this;
		},

		parse: function parse(FBXBuffer, resourceDirectory) {

			if (isFbxFormatBinary(FBXBuffer)) {

				fbxTree = new BinaryParser().parse(FBXBuffer);
			} else {

				var FBXText = convertArrayBufferToString(FBXBuffer);

				if (!isFbxFormatASCII(FBXText)) {

					throw new Error('THREE.FBXLoader: Unknown format.');
				}

				if (getFbxVersion(FBXText) < 7000) {

					throw new Error('THREE.FBXLoader: FBX version not supported, FileVersion: ' + getFbxVersion(FBXText));
				}

				fbxTree = new TextParser().parse(FBXText);
			}

			//console.log( FBXTree );

			var textureLoader = new THREE.TextureLoader(this.manager).setPath(resourceDirectory).setCrossOrigin(this.crossOrigin);

			return new FBXTreeParser(textureLoader).parse(fbxTree);
		}

	};

	// Parse the FBXTree object returned by the BinaryParser or TextParser and return a THREE.Group
	function FBXTreeParser(textureLoader) {

		this.textureLoader = textureLoader;
	}

	FBXTreeParser.prototype = {

		constructor: FBXTreeParser,

		parse: function parse() {

			connections = this.parseConnections();

			var images = this.parseImages();
			var textures = this.parseTextures(images);
			var materials = this.parseMaterials(textures);
			var deformers = this.parseDeformers();
			var geometryMap = new GeometryParser().parse(deformers);

			this.parseScene(deformers, geometryMap, materials);

			return sceneGraph;
		},

		// Parses FBXTree.Connections which holds parent-child connections between objects (e.g. material -> texture, model->geometry )
		// and details the connection type
		parseConnections: function parseConnections() {

			var connectionMap = new Map();

			if ('Connections' in fbxTree) {

				var rawConnections = fbxTree.Connections.connections;

				rawConnections.forEach(function (rawConnection) {

					var fromID = rawConnection[0];
					var toID = rawConnection[1];
					var relationship = rawConnection[2];

					if (!connectionMap.has(fromID)) {

						connectionMap.set(fromID, {
							parents: [],
							children: []
						});
					}

					var parentRelationship = { ID: toID, relationship: relationship };
					connectionMap.get(fromID).parents.push(parentRelationship);

					if (!connectionMap.has(toID)) {

						connectionMap.set(toID, {
							parents: [],
							children: []
						});
					}

					var childRelationship = { ID: fromID, relationship: relationship };
					connectionMap.get(toID).children.push(childRelationship);
				});
			}

			return connectionMap;
		},

		// Parse FBXTree.Objects.Video for embedded image data
		// These images are connected to textures in FBXTree.Objects.Textures
		// via FBXTree.Connections.
		parseImages: function parseImages() {

			var images = {};
			var blobs = {};

			if ('Video' in fbxTree.Objects) {

				var videoNodes = fbxTree.Objects.Video;

				for (var nodeID in videoNodes) {

					var videoNode = videoNodes[nodeID];

					var id = parseInt(nodeID);

					images[id] = videoNode.RelativeFilename || videoNode.Filename;

					// raw image data is in videoNode.Content
					if ('Content' in videoNode) {

						var arrayBufferContent = videoNode.Content instanceof ArrayBuffer && videoNode.Content.byteLength > 0;
						var base64Content = typeof videoNode.Content === 'string' && videoNode.Content !== '';

						if (arrayBufferContent || base64Content) {

							var image = this.parseImage(videoNodes[nodeID]);

							blobs[videoNode.RelativeFilename || videoNode.Filename] = image;
						}
					}
				}
			}

			for (var id in images) {

				var filename = images[id];

				if (blobs[filename] !== undefined) images[id] = blobs[filename];else images[id] = images[id].split('\\').pop();
			}

			return images;
		},

		// Parse embedded image data in FBXTree.Video.Content
		parseImage: function parseImage(videoNode) {

			var content = videoNode.Content;
			var fileName = videoNode.RelativeFilename || videoNode.Filename;
			var extension = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase();

			var type;

			switch (extension) {

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

					if (typeof THREE.TGALoader !== 'function') {

						console.warn('FBXLoader: THREE.TGALoader is required to load TGA textures');
						return;
					} else {

						if (THREE.Loader.Handlers.get('.tga') === null) {

							THREE.Loader.Handlers.add(/\.tga$/i, new THREE.TGALoader());
						}

						type = 'image/tga';
						break;
					}

				default:

					console.warn('FBXLoader: Image type "' + extension + '" is not supported.');
					return;

			}

			if (typeof content === 'string') {
				// ASCII format

				return 'data:' + type + ';base64,' + content;
			} else {
				// Binary Format

				var array = new Uint8Array(content);
				return window.URL.createObjectURL(new Blob([array], { type: type }));
			}
		},

		// Parse nodes in FBXTree.Objects.Texture
		// These contain details such as UV scaling, cropping, rotation etc and are connected
		// to images in FBXTree.Objects.Video
		parseTextures: function parseTextures(images) {

			var textureMap = new Map();

			if ('Texture' in fbxTree.Objects) {

				var textureNodes = fbxTree.Objects.Texture;
				for (var nodeID in textureNodes) {

					var texture = this.parseTexture(textureNodes[nodeID], images);
					textureMap.set(parseInt(nodeID), texture);
				}
			}

			return textureMap;
		},

		// Parse individual node in FBXTree.Objects.Texture
		parseTexture: function parseTexture(textureNode, images) {

			var texture = this.loadTexture(textureNode, images);

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

			if ('Scaling' in textureNode) {

				var values = textureNode.Scaling.value;

				texture.repeat.x = values[0];
				texture.repeat.y = values[1];
			}

			return texture;
		},

		// load a texture specified as a blob or data URI, or via an external URL using THREE.TextureLoader
		loadTexture: function loadTexture(textureNode, images) {

			var fileName;

			var currentPath = this.textureLoader.path;

			var children = connections.get(textureNode.id).children;

			if (children !== undefined && children.length > 0 && images[children[0].ID] !== undefined) {

				fileName = images[children[0].ID];

				if (fileName.indexOf('blob:') === 0 || fileName.indexOf('data:') === 0) {

					this.textureLoader.setPath(undefined);
				}
			}

			var texture;

			var extension = textureNode.FileName.slice(-3).toLowerCase();

			if (extension === 'tga') {

				var loader = THREE.Loader.Handlers.get('.tga');

				if (loader === null) {

					console.warn('FBXLoader: TGALoader not found, creating empty placeholder texture for', fileName);
					texture = new THREE.Texture();
				} else {

					texture = loader.load(fileName);
				}
			} else if (extension === 'psd') {

				console.warn('FBXLoader: PSD textures are not supported, creating empty placeholder texture for', fileName);
				texture = new THREE.Texture();
			} else {

				texture = this.textureLoader.load(fileName);
			}

			this.textureLoader.setPath(currentPath);

			return texture;
		},

		// Parse nodes in FBXTree.Objects.Material
		parseMaterials: function parseMaterials(textureMap) {

			var materialMap = new Map();

			if ('Material' in fbxTree.Objects) {

				var materialNodes = fbxTree.Objects.Material;

				for (var nodeID in materialNodes) {

					var material = this.parseMaterial(materialNodes[nodeID], textureMap);

					if (material !== null) materialMap.set(parseInt(nodeID), material);
				}
			}

			return materialMap;
		},

		// Parse single node in FBXTree.Objects.Material
		// Materials are connected to texture maps in FBXTree.Objects.Textures
		// FBX format currently only supports Lambert and Phong shading models
		parseMaterial: function parseMaterial(materialNode, textureMap) {

			var ID = materialNode.id;
			var name = materialNode.attrName;
			var type = materialNode.ShadingModel;

			// Case where FBX wraps shading model in property object.
			if ((typeof type === 'undefined' ? 'undefined' : _typeof(type)) === 'object') {

				type = type.value;
			}

			// Ignore unused materials which don't have any connections.
			if (!connections.has(ID)) return null;

			var parameters = this.parseParameters(materialNode, textureMap, ID);

			var material;

			switch (type.toLowerCase()) {

				case 'phong':
					material = new THREE.MeshPhongMaterial();
					break;
				case 'lambert':
					material = new THREE.MeshLambertMaterial();
					break;
				default:
					console.warn('THREE.FBXLoader: unknown material type "%s". Defaulting to MeshPhongMaterial.', type);
					material = new THREE.MeshPhongMaterial({ color: 0x3300ff });
					break;

			}

			material.setValues(parameters);
			material.name = name;

			return material;
		},

		// Parse FBX material and return parameters suitable for a three.js material
		// Also parse the texture map and return any textures associated with the material
		parseParameters: function parseParameters(materialNode, textureMap, ID) {

			var parameters = {};

			if (materialNode.BumpFactor) {

				parameters.bumpScale = materialNode.BumpFactor.value;
			}
			if (materialNode.Diffuse) {

				parameters.color = new THREE.Color().fromArray(materialNode.Diffuse.value);
			} else if (materialNode.DiffuseColor && materialNode.DiffuseColor.type === 'Color') {

				// The blender exporter exports diffuse here instead of in materialNode.Diffuse
				parameters.color = new THREE.Color().fromArray(materialNode.DiffuseColor.value);
			}
			if (materialNode.DisplacementFactor) {

				parameters.displacementScale = materialNode.DisplacementFactor.value;
			}
			if (materialNode.Emissive) {

				parameters.emissive = new THREE.Color().fromArray(materialNode.Emissive.value);
			} else if (materialNode.EmissiveColor && materialNode.EmissiveColor.type === 'Color') {

				// The blender exporter exports emissive color here instead of in materialNode.Emissive
				parameters.emissive = new THREE.Color().fromArray(materialNode.EmissiveColor.value);
			}
			if (materialNode.EmissiveFactor) {

				parameters.emissiveIntensity = parseFloat(materialNode.EmissiveFactor.value);
			}
			if (materialNode.Opacity) {

				parameters.opacity = parseFloat(materialNode.Opacity.value);
			}
			if (parameters.opacity < 1.0) {

				parameters.transparent = true;
			}
			if (materialNode.ReflectionFactor) {

				parameters.reflectivity = materialNode.ReflectionFactor.value;
			}
			if (materialNode.Shininess) {

				parameters.shininess = materialNode.Shininess.value;
			}
			if (materialNode.Specular) {

				parameters.specular = new THREE.Color().fromArray(materialNode.Specular.value);
			} else if (materialNode.SpecularColor && materialNode.SpecularColor.type === 'Color') {

				// The blender exporter exports specular color here instead of in materialNode.Specular
				parameters.specular = new THREE.Color().fromArray(materialNode.SpecularColor.value);
			}

			var self = this;
			connections.get(ID).children.forEach(function (child) {

				var type = child.relationship;

				switch (type) {

					case 'Bump':
						parameters.bumpMap = self.getTexture(textureMap, child.ID);
						break;

					case 'DiffuseColor':
						parameters.map = self.getTexture(textureMap, child.ID);
						break;

					case 'DisplacementColor':
						parameters.displacementMap = self.getTexture(textureMap, child.ID);
						break;

					case 'EmissiveColor':
						parameters.emissiveMap = self.getTexture(textureMap, child.ID);
						break;

					case 'NormalMap':
						parameters.normalMap = self.getTexture(textureMap, child.ID);
						break;

					case 'ReflectionColor':
						parameters.envMap = self.getTexture(textureMap, child.ID);
						parameters.envMap.mapping = THREE.EquirectangularReflectionMapping;
						break;

					case 'SpecularColor':
						parameters.specularMap = self.getTexture(textureMap, child.ID);
						break;

					case 'TransparentColor':
						parameters.alphaMap = self.getTexture(textureMap, child.ID);
						parameters.transparent = true;
						break;

					case 'AmbientColor':
					case 'ShininessExponent': // AKA glossiness map
					case 'SpecularFactor': // AKA specularLevel
					case 'VectorDisplacementColor': // NOTE: Seems to be a copy of DisplacementColor
					default:
						console.warn('THREE.FBXLoader: %s map is not supported in three.js, skipping texture.', type);
						break;

				}
			});

			return parameters;
		},

		// get a texture from the textureMap for use by a material.
		getTexture: function getTexture(textureMap, id) {

			// if the texture is a layered texture, just use the first layer and issue a warning
			if ('LayeredTexture' in fbxTree.Objects && id in fbxTree.Objects.LayeredTexture) {

				console.warn('THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer.');
				id = connections.get(id).children[0].ID;
			}

			return textureMap.get(id);
		},

		// Parse nodes in FBXTree.Objects.Deformer
		// Deformer node can contain skinning or Vertex Cache animation data, however only skinning is supported here
		// Generates map of Skeleton-like objects for use later when generating and binding skeletons.
		parseDeformers: function parseDeformers() {

			var skeletons = {};
			var morphTargets = {};

			if ('Deformer' in fbxTree.Objects) {

				var DeformerNodes = fbxTree.Objects.Deformer;

				for (var nodeID in DeformerNodes) {

					var deformerNode = DeformerNodes[nodeID];

					var relationships = connections.get(parseInt(nodeID));

					if (deformerNode.attrType === 'Skin') {

						var skeleton = this.parseSkeleton(relationships, DeformerNodes);
						skeleton.ID = nodeID;

						if (relationships.parents.length > 1) console.warn('THREE.FBXLoader: skeleton attached to more than one geometry is not supported.');
						skeleton.geometryID = relationships.parents[0].ID;

						skeletons[nodeID] = skeleton;
					} else if (deformerNode.attrType === 'BlendShape') {

						var morphTarget = {
							id: nodeID
						};

						morphTarget.rawTargets = this.parseMorphTargets(relationships, DeformerNodes);
						morphTarget.id = nodeID;

						if (relationships.parents.length > 1) console.warn('THREE.FBXLoader: morph target attached to more than one geometry is not supported.');

						morphTargets[nodeID] = morphTarget;
					}
				}
			}

			return {

				skeletons: skeletons,
				morphTargets: morphTargets

			};
		},

		// Parse single nodes in FBXTree.Objects.Deformer
		// The top level skeleton node has type 'Skin' and sub nodes have type 'Cluster'
		// Each skin node represents a skeleton and each cluster node represents a bone
		parseSkeleton: function parseSkeleton(relationships, deformerNodes) {

			var rawBones = [];

			relationships.children.forEach(function (child) {

				var boneNode = deformerNodes[child.ID];

				if (boneNode.attrType !== 'Cluster') return;

				var rawBone = {

					ID: child.ID,
					indices: [],
					weights: [],
					transform: new THREE.Matrix4().fromArray(boneNode.Transform.a),
					transformLink: new THREE.Matrix4().fromArray(boneNode.TransformLink.a),
					linkMode: boneNode.Mode

				};

				if ('Indexes' in boneNode) {

					rawBone.indices = boneNode.Indexes.a;
					rawBone.weights = boneNode.Weights.a;
				}

				rawBones.push(rawBone);
			});

			return {

				rawBones: rawBones,
				bones: []

			};
		},

		// The top level morph deformer node has type "BlendShape" and sub nodes have type "BlendShapeChannel"
		parseMorphTargets: function parseMorphTargets(relationships, deformerNodes) {

			var rawMorphTargets = [];

			for (var i = 0; i < relationships.children.length; i++) {

				if (i === 8) {

					console.warn('FBXLoader: maximum of 8 morph targets supported. Ignoring additional targets.');

					break;
				}

				var child = relationships.children[i];

				var morphTargetNode = deformerNodes[child.ID];

				var rawMorphTarget = {

					name: morphTargetNode.attrName,
					initialWeight: morphTargetNode.DeformPercent,
					id: morphTargetNode.id,
					fullWeights: morphTargetNode.FullWeights.a

				};

				if (morphTargetNode.attrType !== 'BlendShapeChannel') return;

				var targetRelationships = connections.get(parseInt(child.ID));

				targetRelationships.children.forEach(function (child) {

					if (child.relationship === undefined) rawMorphTarget.geoID = child.ID;
				});

				rawMorphTargets.push(rawMorphTarget);
			}

			return rawMorphTargets;
		},

		// create the main THREE.Group() to be returned by the loader
		parseScene: function parseScene(deformers, geometryMap, materialMap) {

			sceneGraph = new THREE.Group();

			var modelMap = this.parseModels(deformers.skeletons, geometryMap, materialMap);

			var modelNodes = fbxTree.Objects.Model;

			var self = this;
			modelMap.forEach(function (model) {

				var modelNode = modelNodes[model.ID];
				self.setLookAtProperties(model, modelNode);

				var parentConnections = connections.get(model.ID).parents;

				parentConnections.forEach(function (connection) {

					var parent = modelMap.get(connection.ID);
					if (parent !== undefined) parent.add(model);
				});

				if (model.parent === null) {

					sceneGraph.add(model);
				}
			});

			this.bindSkeleton(deformers.skeletons, geometryMap, modelMap);

			this.createAmbientLight();

			this.setupMorphMaterials();

			var animations = new AnimationParser().parse();

			// if all the models where already combined in a single group, just return that
			if (sceneGraph.children.length === 1 && sceneGraph.children[0].isGroup) {

				sceneGraph.children[0].animations = animations;
				sceneGraph = sceneGraph.children[0];
			}

			sceneGraph.animations = animations;
		},

		// parse nodes in FBXTree.Objects.Model
		parseModels: function parseModels(skeletons, geometryMap, materialMap) {

			var modelMap = new Map();
			var modelNodes = fbxTree.Objects.Model;

			for (var nodeID in modelNodes) {

				var id = parseInt(nodeID);
				var node = modelNodes[nodeID];
				var relationships = connections.get(id);

				var model = this.buildSkeleton(relationships, skeletons, id, node.attrName);

				if (!model) {

					switch (node.attrType) {

						case 'Camera':
							model = this.createCamera(relationships);
							break;
						case 'Light':
							model = this.createLight(relationships);
							break;
						case 'Mesh':
							model = this.createMesh(relationships, geometryMap, materialMap);
							break;
						case 'NurbsCurve':
							model = this.createCurve(relationships, geometryMap);
							break;
						case 'LimbNode': // usually associated with a Bone, however if a Bone was not created we'll make a Group instead
						case 'Null':
						default:
							model = new THREE.Group();
							break;

					}

					model.name = THREE.PropertyBinding.sanitizeNodeName(node.attrName);
					model.ID = id;
				}

				this.setModelTransforms(model, node);
				modelMap.set(id, model);
			}

			return modelMap;
		},

		buildSkeleton: function buildSkeleton(relationships, skeletons, id, name) {

			var bone = null;

			relationships.parents.forEach(function (parent) {

				for (var ID in skeletons) {

					var skeleton = skeletons[ID];

					skeleton.rawBones.forEach(function (rawBone, i) {

						if (rawBone.ID === parent.ID) {

							var subBone = bone;
							bone = new THREE.Bone();
							bone.matrixWorld.copy(rawBone.transformLink);

							// set name and id here - otherwise in cases where "subBone" is created it will not have a name / id
							bone.name = THREE.PropertyBinding.sanitizeNodeName(name);
							bone.ID = id;

							skeleton.bones[i] = bone;

							// In cases where a bone is shared between multiple meshes
							// duplicate the bone here and and it as a child of the first bone
							if (subBone !== null) {

								bone.add(subBone);
							}
						}
					});
				}
			});

			return bone;
		},

		// create a THREE.PerspectiveCamera or THREE.OrthographicCamera
		createCamera: function createCamera(relationships) {

			var model;
			var cameraAttribute;

			relationships.children.forEach(function (child) {

				var attr = fbxTree.Objects.NodeAttribute[child.ID];

				if (attr !== undefined) {

					cameraAttribute = attr;
				}
			});

			if (cameraAttribute === undefined) {

				model = new THREE.Object3D();
			} else {

				var type = 0;
				if (cameraAttribute.CameraProjectionType !== undefined && cameraAttribute.CameraProjectionType.value === 1) {

					type = 1;
				}

				var nearClippingPlane = 1;
				if (cameraAttribute.NearPlane !== undefined) {

					nearClippingPlane = cameraAttribute.NearPlane.value / 1000;
				}

				var farClippingPlane = 1000;
				if (cameraAttribute.FarPlane !== undefined) {

					farClippingPlane = cameraAttribute.FarPlane.value / 1000;
				}

				var width = window.innerWidth;
				var height = window.innerHeight;

				if (cameraAttribute.AspectWidth !== undefined && cameraAttribute.AspectHeight !== undefined) {

					width = cameraAttribute.AspectWidth.value;
					height = cameraAttribute.AspectHeight.value;
				}

				var aspect = width / height;

				var fov = 45;
				if (cameraAttribute.FieldOfView !== undefined) {

					fov = cameraAttribute.FieldOfView.value;
				}

				var focalLength = cameraAttribute.FocalLength ? cameraAttribute.FocalLength.value : null;

				switch (type) {

					case 0:
						// Perspective
						model = new THREE.PerspectiveCamera(fov, aspect, nearClippingPlane, farClippingPlane);
						if (focalLength !== null) model.setFocalLength(focalLength);
						break;

					case 1:
						// Orthographic
						model = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, nearClippingPlane, farClippingPlane);
						break;

					default:
						console.warn('THREE.FBXLoader: Unknown camera type ' + type + '.');
						model = new THREE.Object3D();
						break;

				}
			}

			return model;
		},

		// Create a THREE.DirectionalLight, THREE.PointLight or THREE.SpotLight
		createLight: function createLight(relationships) {

			var model;
			var lightAttribute;

			relationships.children.forEach(function (child) {

				var attr = fbxTree.Objects.NodeAttribute[child.ID];

				if (attr !== undefined) {

					lightAttribute = attr;
				}
			});

			if (lightAttribute === undefined) {

				model = new THREE.Object3D();
			} else {

				var type;

				// LightType can be undefined for Point lights
				if (lightAttribute.LightType === undefined) {

					type = 0;
				} else {

					type = lightAttribute.LightType.value;
				}

				var color = 0xffffff;

				if (lightAttribute.Color !== undefined) {

					color = new THREE.Color().fromArray(lightAttribute.Color.value);
				}

				var intensity = lightAttribute.Intensity === undefined ? 1 : lightAttribute.Intensity.value / 100;

				// light disabled
				if (lightAttribute.CastLightOnObject !== undefined && lightAttribute.CastLightOnObject.value === 0) {

					intensity = 0;
				}

				var distance = 0;
				if (lightAttribute.FarAttenuationEnd !== undefined) {

					if (lightAttribute.EnableFarAttenuation !== undefined && lightAttribute.EnableFarAttenuation.value === 0) {

						distance = 0;
					} else {

						distance = lightAttribute.FarAttenuationEnd.value;
					}
				}

				// TODO: could this be calculated linearly from FarAttenuationStart to FarAttenuationEnd?
				var decay = 1;

				switch (type) {

					case 0:
						// Point
						model = new THREE.PointLight(color, intensity, distance, decay);
						break;

					case 1:
						// Directional
						model = new THREE.DirectionalLight(color, intensity);
						break;

					case 2:
						// Spot
						var angle = Math.PI / 3;

						if (lightAttribute.InnerAngle !== undefined) {

							angle = THREE.Math.degToRad(lightAttribute.InnerAngle.value);
						}

						var penumbra = 0;
						if (lightAttribute.OuterAngle !== undefined) {

							// TODO: this is not correct - FBX calculates outer and inner angle in degrees
							// with OuterAngle > InnerAngle && OuterAngle <= Math.PI
							// while three.js uses a penumbra between (0, 1) to attenuate the inner angle
							penumbra = THREE.Math.degToRad(lightAttribute.OuterAngle.value);
							penumbra = Math.max(penumbra, 1);
						}

						model = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
						break;

					default:
						console.warn('THREE.FBXLoader: Unknown light type ' + lightAttribute.LightType.value + ', defaulting to a THREE.PointLight.');
						model = new THREE.PointLight(color, intensity);
						break;

				}

				if (lightAttribute.CastShadows !== undefined && lightAttribute.CastShadows.value === 1) {

					model.castShadow = true;
				}
			}

			return model;
		},

		createMesh: function createMesh(relationships, geometryMap, materialMap) {

			var model;
			var geometry = null;
			var material = null;
			var materials = [];

			// get geometry and materials(s) from connections
			relationships.children.forEach(function (child) {

				if (geometryMap.has(child.ID)) {

					geometry = geometryMap.get(child.ID);
				}

				if (materialMap.has(child.ID)) {

					materials.push(materialMap.get(child.ID));
				}
			});

			if (materials.length > 1) {

				material = materials;
			} else if (materials.length > 0) {

				material = materials[0];
			} else {

				material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
				materials.push(material);
			}

			if ('color' in geometry.attributes) {

				materials.forEach(function (material) {

					material.vertexColors = THREE.VertexColors;
				});
			}

			if (geometry.FBX_Deformer) {

				materials.forEach(function (material) {

					material.skinning = true;
				});

				model = new THREE.SkinnedMesh(geometry, material);
			} else {

				model = new THREE.Mesh(geometry, material);
			}

			return model;
		},

		createCurve: function createCurve(relationships, geometryMap) {

			var geometry = relationships.children.reduce(function (geo, child) {

				if (geometryMap.has(child.ID)) geo = geometryMap.get(child.ID);

				return geo;
			}, null);

			// FBX does not list materials for Nurbs lines, so we'll just put our own in here.
			var material = new THREE.LineBasicMaterial({ color: 0x3300ff, linewidth: 1 });
			return new THREE.Line(geometry, material);
		},

		// parse the model node for transform details and apply them to the model
		setModelTransforms: function setModelTransforms(model, modelNode) {

			var transformData = {};

			if ('RotationOrder' in modelNode) transformData.eulerOrder = parseInt(modelNode.RotationOrder.value);
			if ('Lcl_Translation' in modelNode) transformData.translation = modelNode.Lcl_Translation.value;
			if ('RotationOffset' in modelNode) transformData.rotationOffset = modelNode.RotationOffset.value;
			if ('Lcl_Rotation' in modelNode) transformData.rotation = modelNode.Lcl_Rotation.value;
			if ('PreRotation' in modelNode) transformData.preRotation = modelNode.PreRotation.value;
			if ('PostRotation' in modelNode) transformData.postRotation = modelNode.PostRotation.value;
			if ('Lcl_Scaling' in modelNode) transformData.scale = modelNode.Lcl_Scaling.value;

			var transform = generateTransform(transformData);

			model.applyMatrix(transform);
		},

		setLookAtProperties: function setLookAtProperties(model, modelNode) {

			if ('LookAtProperty' in modelNode) {

				var children = connections.get(model.ID).children;

				children.forEach(function (child) {

					if (child.relationship === 'LookAtProperty') {

						var lookAtTarget = fbxTree.Objects.Model[child.ID];

						if ('Lcl_Translation' in lookAtTarget) {

							var pos = lookAtTarget.Lcl_Translation.value;

							// DirectionalLight, SpotLight
							if (model.target !== undefined) {

								model.target.position.fromArray(pos);
								sceneGraph.add(model.target);
							} else {
								// Cameras and other Object3Ds

								model.lookAt(new THREE.Vector3().fromArray(pos));
							}
						}
					}
				});
			}
		},

		bindSkeleton: function bindSkeleton(skeletons, geometryMap, modelMap) {

			var bindMatrices = this.parsePoseNodes();

			for (var ID in skeletons) {

				var skeleton = skeletons[ID];

				var parents = connections.get(parseInt(skeleton.ID)).parents;

				parents.forEach(function (parent) {

					if (geometryMap.has(parent.ID)) {

						var geoID = parent.ID;
						var geoRelationships = connections.get(geoID);

						geoRelationships.parents.forEach(function (geoConnParent) {

							if (modelMap.has(geoConnParent.ID)) {

								var model = modelMap.get(geoConnParent.ID);

								model.bind(new THREE.Skeleton(skeleton.bones), bindMatrices[geoConnParent.ID]);
							}
						});
					}
				});
			}
		},

		parsePoseNodes: function parsePoseNodes() {

			var bindMatrices = {};

			if ('Pose' in fbxTree.Objects) {

				var BindPoseNode = fbxTree.Objects.Pose;

				for (var nodeID in BindPoseNode) {

					if (BindPoseNode[nodeID].attrType === 'BindPose') {

						var poseNodes = BindPoseNode[nodeID].PoseNode;

						if (Array.isArray(poseNodes)) {

							poseNodes.forEach(function (poseNode) {

								bindMatrices[poseNode.Node] = new THREE.Matrix4().fromArray(poseNode.Matrix.a);
							});
						} else {

							bindMatrices[poseNodes.Node] = new THREE.Matrix4().fromArray(poseNodes.Matrix.a);
						}
					}
				}
			}

			return bindMatrices;
		},

		// Parse ambient color in FBXTree.GlobalSettings - if it's not set to black (default), create an ambient light
		createAmbientLight: function createAmbientLight() {

			if ('GlobalSettings' in fbxTree && 'AmbientColor' in fbxTree.GlobalSettings) {

				var ambientColor = fbxTree.GlobalSettings.AmbientColor.value;
				var r = ambientColor[0];
				var g = ambientColor[1];
				var b = ambientColor[2];

				if (r !== 0 || g !== 0 || b !== 0) {

					var color = new THREE.Color(r, g, b);
					sceneGraph.add(new THREE.AmbientLight(color, 1));
				}
			}
		},

		setupMorphMaterials: function setupMorphMaterials() {

			sceneGraph.traverse(function (child) {

				if (child.isMesh) {

					if (child.geometry.morphAttributes.position || child.geometry.morphAttributes.normal) {

						var uuid = child.uuid;
						var matUuid = child.material.uuid;

						// if a geometry has morph targets, it cannot share the material with other geometries
						var sharedMat = false;

						sceneGraph.traverse(function (child) {

							if (child.isMesh) {

								if (child.material.uuid === matUuid && child.uuid !== uuid) sharedMat = true;
							}
						});

						if (sharedMat === true) child.material = child.material.clone();

						child.material.morphTargets = true;
					}
				}
			});
		}

	};

	// parse Geometry data from FBXTree and return map of BufferGeometries
	function GeometryParser() {}

	GeometryParser.prototype = {

		constructor: GeometryParser,

		// Parse nodes in FBXTree.Objects.Geometry
		parse: function parse(deformers) {

			var geometryMap = new Map();

			if ('Geometry' in fbxTree.Objects) {

				var geoNodes = fbxTree.Objects.Geometry;

				for (var nodeID in geoNodes) {

					var relationships = connections.get(parseInt(nodeID));
					var geo = this.parseGeometry(relationships, geoNodes[nodeID], deformers);

					geometryMap.set(parseInt(nodeID), geo);
				}
			}

			return geometryMap;
		},

		// Parse single node in FBXTree.Objects.Geometry
		parseGeometry: function parseGeometry(relationships, geoNode, deformers) {

			switch (geoNode.attrType) {

				case 'Mesh':
					return this.parseMeshGeometry(relationships, geoNode, deformers);
					break;

				case 'NurbsCurve':
					return this.parseNurbsGeometry(geoNode);
					break;

			}
		},

		// Parse single node mesh geometry in FBXTree.Objects.Geometry
		parseMeshGeometry: function parseMeshGeometry(relationships, geoNode, deformers) {

			var skeletons = deformers.skeletons;
			var morphTargets = deformers.morphTargets;

			var modelNodes = relationships.parents.map(function (parent) {

				return fbxTree.Objects.Model[parent.ID];
			});

			// don't create geometry if it is not associated with any models
			if (modelNodes.length === 0) return;

			var skeleton = relationships.children.reduce(function (skeleton, child) {

				if (skeletons[child.ID] !== undefined) skeleton = skeletons[child.ID];

				return skeleton;
			}, null);

			var morphTarget = relationships.children.reduce(function (morphTarget, child) {

				if (morphTargets[child.ID] !== undefined) morphTarget = morphTargets[child.ID];

				return morphTarget;
			}, null);

			// TODO: if there is more than one model associated with the geometry, AND the models have
			// different geometric transforms, then this will cause problems
			// if ( modelNodes.length > 1 ) { }

			// For now just assume one model and get the preRotations from that
			var modelNode = modelNodes[0];

			var transformData = {};

			if ('RotationOrder' in modelNode) transformData.eulerOrder = modelNode.RotationOrder.value;
			if ('GeometricTranslation' in modelNode) transformData.translation = modelNode.GeometricTranslation.value;
			if ('GeometricRotation' in modelNode) transformData.rotation = modelNode.GeometricRotation.value;
			if ('GeometricScaling' in modelNode) transformData.scale = modelNode.GeometricScaling.value;

			var transform = generateTransform(transformData);

			return this.genGeometry(geoNode, skeleton, morphTarget, transform);
		},

		// Generate a THREE.BufferGeometry from a node in FBXTree.Objects.Geometry
		genGeometry: function genGeometry(geoNode, skeleton, morphTarget, preTransform) {

			var geo = new THREE.BufferGeometry();
			if (geoNode.attrName) geo.name = geoNode.attrName;

			var geoInfo = this.parseGeoNode(geoNode, skeleton);
			var buffers = this.genBuffers(geoInfo);

			var positionAttribute = new THREE.Float32BufferAttribute(buffers.vertex, 3);

			preTransform.applyToBufferAttribute(positionAttribute);

			geo.addAttribute('position', positionAttribute);

			if (buffers.colors.length > 0) {

				geo.addAttribute('color', new THREE.Float32BufferAttribute(buffers.colors, 3));
			}

			if (skeleton) {

				geo.addAttribute('skinIndex', new THREE.Uint16BufferAttribute(buffers.weightsIndices, 4));

				geo.addAttribute('skinWeight', new THREE.Float32BufferAttribute(buffers.vertexWeights, 4));

				// used later to bind the skeleton to the model
				geo.FBX_Deformer = skeleton;
			}

			if (buffers.normal.length > 0) {

				var normalAttribute = new THREE.Float32BufferAttribute(buffers.normal, 3);

				var normalMatrix = new THREE.Matrix3().getNormalMatrix(preTransform);
				normalMatrix.applyToBufferAttribute(normalAttribute);

				geo.addAttribute('normal', normalAttribute);
			}

			buffers.uvs.forEach(function (uvBuffer, i) {

				// subsequent uv buffers are called 'uv1', 'uv2', ...
				var name = 'uv' + (i + 1).toString();

				// the first uv buffer is just called 'uv'
				if (i === 0) {

					name = 'uv';
				}

				geo.addAttribute(name, new THREE.Float32BufferAttribute(buffers.uvs[i], 2));
			});

			if (geoInfo.material && geoInfo.material.mappingType !== 'AllSame') {

				// Convert the material indices of each vertex into rendering groups on the geometry.
				var prevMaterialIndex = buffers.materialIndex[0];
				var startIndex = 0;

				buffers.materialIndex.forEach(function (currentIndex, i) {

					if (currentIndex !== prevMaterialIndex) {

						geo.addGroup(startIndex, i - startIndex, prevMaterialIndex);

						prevMaterialIndex = currentIndex;
						startIndex = i;
					}
				});

				// the loop above doesn't add the last group, do that here.
				if (geo.groups.length > 0) {

					var lastGroup = geo.groups[geo.groups.length - 1];
					var lastIndex = lastGroup.start + lastGroup.count;

					if (lastIndex !== buffers.materialIndex.length) {

						geo.addGroup(lastIndex, buffers.materialIndex.length - lastIndex, prevMaterialIndex);
					}
				}

				// case where there are multiple materials but the whole geometry is only
				// using one of them
				if (geo.groups.length === 0) {

					geo.addGroup(0, buffers.materialIndex.length, buffers.materialIndex[0]);
				}
			}

			this.addMorphTargets(geo, geoNode, morphTarget, preTransform);

			return geo;
		},

		parseGeoNode: function parseGeoNode(geoNode, skeleton) {

			var geoInfo = {};

			geoInfo.vertexPositions = geoNode.Vertices !== undefined ? geoNode.Vertices.a : [];
			geoInfo.vertexIndices = geoNode.PolygonVertexIndex !== undefined ? geoNode.PolygonVertexIndex.a : [];

			if (geoNode.LayerElementColor) {

				geoInfo.color = this.parseVertexColors(geoNode.LayerElementColor[0]);
			}

			if (geoNode.LayerElementMaterial) {

				geoInfo.material = this.parseMaterialIndices(geoNode.LayerElementMaterial[0]);
			}

			if (geoNode.LayerElementNormal) {

				geoInfo.normal = this.parseNormals(geoNode.LayerElementNormal[0]);
			}

			if (geoNode.LayerElementUV) {

				geoInfo.uv = [];

				var i = 0;
				while (geoNode.LayerElementUV[i]) {

					geoInfo.uv.push(this.parseUVs(geoNode.LayerElementUV[i]));
					i++;
				}
			}

			geoInfo.weightTable = {};

			if (skeleton !== null) {

				geoInfo.skeleton = skeleton;

				skeleton.rawBones.forEach(function (rawBone, i) {

					// loop over the bone's vertex indices and weights
					rawBone.indices.forEach(function (index, j) {

						if (geoInfo.weightTable[index] === undefined) geoInfo.weightTable[index] = [];

						geoInfo.weightTable[index].push({

							id: i,
							weight: rawBone.weights[j]

						});
					});
				});
			}

			return geoInfo;
		},

		genBuffers: function genBuffers(geoInfo) {

			var buffers = {
				vertex: [],
				normal: [],
				colors: [],
				uvs: [],
				materialIndex: [],
				vertexWeights: [],
				weightsIndices: []
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
			geoInfo.vertexIndices.forEach(function (vertexIndex, polygonVertexIndex) {

				var endOfFace = false;

				// Face index and vertex index arrays are combined in a single array
				// A cube with quad faces looks like this:
				// PolygonVertexIndex: *24 {
				//  a: 0, 1, 3, -3, 2, 3, 5, -5, 4, 5, 7, -7, 6, 7, 1, -1, 1, 7, 5, -4, 6, 0, 2, -5
				//  }
				// Negative numbers mark the end of a face - first face here is 0, 1, 3, -3
				// to find index of last vertex bit shift the index: ^ - 1
				if (vertexIndex < 0) {

					vertexIndex = vertexIndex ^ -1; // equivalent to ( x * -1 ) - 1
					endOfFace = true;
				}

				var weightIndices = [];
				var weights = [];

				facePositionIndexes.push(vertexIndex * 3, vertexIndex * 3 + 1, vertexIndex * 3 + 2);

				if (geoInfo.color) {

					var data = getData(polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.color);

					faceColors.push(data[0], data[1], data[2]);
				}

				if (geoInfo.skeleton) {

					if (geoInfo.weightTable[vertexIndex] !== undefined) {

						geoInfo.weightTable[vertexIndex].forEach(function (wt) {

							weights.push(wt.weight);
							weightIndices.push(wt.id);
						});
					}

					if (weights.length > 4) {

						if (!displayedWeightsWarning) {

							console.warn('THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights.');
							displayedWeightsWarning = true;
						}

						var wIndex = [0, 0, 0, 0];
						var Weight = [0, 0, 0, 0];

						weights.forEach(function (weight, weightIndex) {

							var currentWeight = weight;
							var currentIndex = weightIndices[weightIndex];

							Weight.forEach(function (comparedWeight, comparedWeightIndex, comparedWeightArray) {

								if (currentWeight > comparedWeight) {

									comparedWeightArray[comparedWeightIndex] = currentWeight;
									currentWeight = comparedWeight;

									var tmp = wIndex[comparedWeightIndex];
									wIndex[comparedWeightIndex] = currentIndex;
									currentIndex = tmp;
								}
							});
						});

						weightIndices = wIndex;
						weights = Weight;
					}

					// if the weight array is shorter than 4 pad with 0s
					while (weights.length < 4) {

						weights.push(0);
						weightIndices.push(0);
					}

					for (var i = 0; i < 4; ++i) {

						faceWeights.push(weights[i]);
						faceWeightIndices.push(weightIndices[i]);
					}
				}

				if (geoInfo.normal) {

					var data = getData(polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.normal);

					faceNormals.push(data[0], data[1], data[2]);
				}

				if (geoInfo.material && geoInfo.material.mappingType !== 'AllSame') {

					var materialIndex = getData(polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.material)[0];
				}

				if (geoInfo.uv) {

					geoInfo.uv.forEach(function (uv, i) {

						var data = getData(polygonVertexIndex, polygonIndex, vertexIndex, uv);

						if (faceUVs[i] === undefined) {

							faceUVs[i] = [];
						}

						faceUVs[i].push(data[0]);
						faceUVs[i].push(data[1]);
					});
				}

				faceLength++;

				if (endOfFace) {

					self.genFace(buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength);

					polygonIndex++;
					faceLength = 0;

					// reset arrays for the next face
					facePositionIndexes = [];
					faceNormals = [];
					faceColors = [];
					faceUVs = [];
					faceWeights = [];
					faceWeightIndices = [];
				}
			});

			return buffers;
		},

		// Generate data for a single face in a geometry. If the face is a quad then split it into 2 tris
		genFace: function genFace(buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength) {

			for (var i = 2; i < faceLength; i++) {

				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[0]]);
				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[1]]);
				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[2]]);

				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[(i - 1) * 3]]);
				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[(i - 1) * 3 + 1]]);
				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[(i - 1) * 3 + 2]]);

				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[i * 3]]);
				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[i * 3 + 1]]);
				buffers.vertex.push(geoInfo.vertexPositions[facePositionIndexes[i * 3 + 2]]);

				if (geoInfo.skeleton) {

					buffers.vertexWeights.push(faceWeights[0]);
					buffers.vertexWeights.push(faceWeights[1]);
					buffers.vertexWeights.push(faceWeights[2]);
					buffers.vertexWeights.push(faceWeights[3]);

					buffers.vertexWeights.push(faceWeights[(i - 1) * 4]);
					buffers.vertexWeights.push(faceWeights[(i - 1) * 4 + 1]);
					buffers.vertexWeights.push(faceWeights[(i - 1) * 4 + 2]);
					buffers.vertexWeights.push(faceWeights[(i - 1) * 4 + 3]);

					buffers.vertexWeights.push(faceWeights[i * 4]);
					buffers.vertexWeights.push(faceWeights[i * 4 + 1]);
					buffers.vertexWeights.push(faceWeights[i * 4 + 2]);
					buffers.vertexWeights.push(faceWeights[i * 4 + 3]);

					buffers.weightsIndices.push(faceWeightIndices[0]);
					buffers.weightsIndices.push(faceWeightIndices[1]);
					buffers.weightsIndices.push(faceWeightIndices[2]);
					buffers.weightsIndices.push(faceWeightIndices[3]);

					buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4]);
					buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4 + 1]);
					buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4 + 2]);
					buffers.weightsIndices.push(faceWeightIndices[(i - 1) * 4 + 3]);

					buffers.weightsIndices.push(faceWeightIndices[i * 4]);
					buffers.weightsIndices.push(faceWeightIndices[i * 4 + 1]);
					buffers.weightsIndices.push(faceWeightIndices[i * 4 + 2]);
					buffers.weightsIndices.push(faceWeightIndices[i * 4 + 3]);
				}

				if (geoInfo.color) {

					buffers.colors.push(faceColors[0]);
					buffers.colors.push(faceColors[1]);
					buffers.colors.push(faceColors[2]);

					buffers.colors.push(faceColors[(i - 1) * 3]);
					buffers.colors.push(faceColors[(i - 1) * 3 + 1]);
					buffers.colors.push(faceColors[(i - 1) * 3 + 2]);

					buffers.colors.push(faceColors[i * 3]);
					buffers.colors.push(faceColors[i * 3 + 1]);
					buffers.colors.push(faceColors[i * 3 + 2]);
				}

				if (geoInfo.material && geoInfo.material.mappingType !== 'AllSame') {

					buffers.materialIndex.push(materialIndex);
					buffers.materialIndex.push(materialIndex);
					buffers.materialIndex.push(materialIndex);
				}

				if (geoInfo.normal) {

					buffers.normal.push(faceNormals[0]);
					buffers.normal.push(faceNormals[1]);
					buffers.normal.push(faceNormals[2]);

					buffers.normal.push(faceNormals[(i - 1) * 3]);
					buffers.normal.push(faceNormals[(i - 1) * 3 + 1]);
					buffers.normal.push(faceNormals[(i - 1) * 3 + 2]);

					buffers.normal.push(faceNormals[i * 3]);
					buffers.normal.push(faceNormals[i * 3 + 1]);
					buffers.normal.push(faceNormals[i * 3 + 2]);
				}

				if (geoInfo.uv) {

					geoInfo.uv.forEach(function (uv, j) {

						if (buffers.uvs[j] === undefined) buffers.uvs[j] = [];

						buffers.uvs[j].push(faceUVs[j][0]);
						buffers.uvs[j].push(faceUVs[j][1]);

						buffers.uvs[j].push(faceUVs[j][(i - 1) * 2]);
						buffers.uvs[j].push(faceUVs[j][(i - 1) * 2 + 1]);

						buffers.uvs[j].push(faceUVs[j][i * 2]);
						buffers.uvs[j].push(faceUVs[j][i * 2 + 1]);
					});
				}
			}
		},

		addMorphTargets: function addMorphTargets(parentGeo, parentGeoNode, morphTarget, preTransform) {

			if (morphTarget === null) return;

			parentGeo.morphAttributes.position = [];
			parentGeo.morphAttributes.normal = [];

			var self = this;
			morphTarget.rawTargets.forEach(function (rawTarget) {

				var morphGeoNode = fbxTree.Objects.Geometry[rawTarget.geoID];

				if (morphGeoNode !== undefined) {

					self.genMorphGeometry(parentGeo, parentGeoNode, morphGeoNode, preTransform);
				}
			});
		},

		// a morph geometry node is similar to a standard  node, and the node is also contained
		// in FBXTree.Objects.Geometry, however it can only have attributes for position, normal
		// and a special attribute Index defining which vertices of the original geometry are affected
		// Normal and position attributes only have data for the vertices that are affected by the morph
		genMorphGeometry: function genMorphGeometry(parentGeo, parentGeoNode, morphGeoNode, preTransform) {

			var morphGeo = new THREE.BufferGeometry();
			if (morphGeoNode.attrName) morphGeo.name = morphGeoNode.attrName;

			var vertexIndices = parentGeoNode.PolygonVertexIndex !== undefined ? parentGeoNode.PolygonVertexIndex.a : [];

			// make a copy of the parent's vertex positions
			var vertexPositions = parentGeoNode.Vertices !== undefined ? parentGeoNode.Vertices.a.slice() : [];

			var morphPositions = morphGeoNode.Vertices !== undefined ? morphGeoNode.Vertices.a : [];
			var indices = morphGeoNode.Indexes !== undefined ? morphGeoNode.Indexes.a : [];

			for (var i = 0; i < indices.length; i++) {

				var morphIndex = indices[i] * 3;

				// FBX format uses blend shapes rather than morph targets. This can be converted
				// by additively combining the blend shape positions with the original geometry's positions
				vertexPositions[morphIndex] += morphPositions[i * 3];
				vertexPositions[morphIndex + 1] += morphPositions[i * 3 + 1];
				vertexPositions[morphIndex + 2] += morphPositions[i * 3 + 2];
			}

			// TODO: add morph normal support
			var morphGeoInfo = {
				vertexIndices: vertexIndices,
				vertexPositions: vertexPositions
			};

			var morphBuffers = this.genBuffers(morphGeoInfo);

			var positionAttribute = new THREE.Float32BufferAttribute(morphBuffers.vertex, 3);
			positionAttribute.name = morphGeoNode.attrName;

			preTransform.applyToBufferAttribute(positionAttribute);

			parentGeo.morphAttributes.position.push(positionAttribute);
		},

		// Parse normal from FBXTree.Objects.Geometry.LayerElementNormal if it exists
		parseNormals: function parseNormals(NormalNode) {

			var mappingType = NormalNode.MappingInformationType;
			var referenceType = NormalNode.ReferenceInformationType;
			var buffer = NormalNode.Normals.a;
			var indexBuffer = [];
			if (referenceType === 'IndexToDirect') {

				if ('NormalIndex' in NormalNode) {

					indexBuffer = NormalNode.NormalIndex.a;
				} else if ('NormalsIndex' in NormalNode) {

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
		parseUVs: function parseUVs(UVNode) {

			var mappingType = UVNode.MappingInformationType;
			var referenceType = UVNode.ReferenceInformationType;
			var buffer = UVNode.UV.a;
			var indexBuffer = [];
			if (referenceType === 'IndexToDirect') {

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
		parseVertexColors: function parseVertexColors(ColorNode) {

			var mappingType = ColorNode.MappingInformationType;
			var referenceType = ColorNode.ReferenceInformationType;
			var buffer = ColorNode.Colors.a;
			var indexBuffer = [];
			if (referenceType === 'IndexToDirect') {

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
		parseMaterialIndices: function parseMaterialIndices(MaterialNode) {

			var mappingType = MaterialNode.MappingInformationType;
			var referenceType = MaterialNode.ReferenceInformationType;

			if (mappingType === 'NoMappingInformation') {

				return {
					dataSize: 1,
					buffer: [0],
					indices: [0],
					mappingType: 'AllSame',
					referenceType: referenceType
				};
			}

			var materialIndexBuffer = MaterialNode.Materials.a;

			// Since materials are stored as indices, there's a bit of a mismatch between FBX and what
			// we expect.So we create an intermediate buffer that points to the index in the buffer,
			// for conforming with the other functions we've written for other data.
			var materialIndices = [];

			for (var i = 0; i < materialIndexBuffer.length; ++i) {

				materialIndices.push(i);
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
		parseNurbsGeometry: function parseNurbsGeometry(geoNode) {

			if (THREE.NURBSCurve === undefined) {

				console.error('THREE.FBXLoader: The loader relies on THREE.NURBSCurve for any nurbs present in the model. Nurbs will show up as empty geometry.');
				return new THREE.BufferGeometry();
			}

			var order = parseInt(geoNode.Order);

			if (isNaN(order)) {

				console.error('THREE.FBXLoader: Invalid Order %s given for geometry ID: %s', geoNode.Order, geoNode.id);
				return new THREE.BufferGeometry();
			}

			var degree = order - 1;

			var knots = geoNode.KnotVector.a;
			var controlPoints = [];
			var pointsValues = geoNode.Points.a;

			for (var i = 0, l = pointsValues.length; i < l; i += 4) {

				controlPoints.push(new THREE.Vector4().fromArray(pointsValues, i));
			}

			var startKnot, endKnot;

			if (geoNode.Form === 'Closed') {

				controlPoints.push(controlPoints[0]);
			} else if (geoNode.Form === 'Periodic') {

				startKnot = degree;
				endKnot = knots.length - 1 - startKnot;

				for (var i = 0; i < degree; ++i) {

					controlPoints.push(controlPoints[i]);
				}
			}

			var curve = new THREE.NURBSCurve(degree, knots, controlPoints, startKnot, endKnot);
			var vertices = curve.getPoints(controlPoints.length * 7);

			var positions = new Float32Array(vertices.length * 3);

			vertices.forEach(function (vertex, i) {

				vertex.toArray(positions, i * 3);
			});

			var geometry = new THREE.BufferGeometry();
			geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));

			return geometry;
		}

	};

	// parse animation data from FBXTree
	function AnimationParser() {}

	AnimationParser.prototype = {

		constructor: AnimationParser,

		// take raw animation clips and turn them into three.js animation clips
		parse: function parse() {

			var animationClips = [];

			var rawClips = this.parseClips();

			if (rawClips === undefined) return animationClips;

			for (var key in rawClips) {

				var rawClip = rawClips[key];

				var clip = this.addClip(rawClip);

				animationClips.push(clip);
			}

			return animationClips;
		},

		parseClips: function parseClips() {

			// since the actual transformation data is stored in FBXTree.Objects.AnimationCurve,
			// if this is undefined we can safely assume there are no animations
			if (fbxTree.Objects.AnimationCurve === undefined) return undefined;

			var curveNodesMap = this.parseAnimationCurveNodes();

			this.parseAnimationCurves(curveNodesMap);

			var layersMap = this.parseAnimationLayers(curveNodesMap);
			var rawClips = this.parseAnimStacks(layersMap);

			return rawClips;
		},

		// parse nodes in FBXTree.Objects.AnimationCurveNode
		// each AnimationCurveNode holds data for an animation transform for a model (e.g. left arm rotation )
		// and is referenced by an AnimationLayer
		parseAnimationCurveNodes: function parseAnimationCurveNodes() {

			var rawCurveNodes = fbxTree.Objects.AnimationCurveNode;

			var curveNodesMap = new Map();

			for (var nodeID in rawCurveNodes) {

				var rawCurveNode = rawCurveNodes[nodeID];

				if (rawCurveNode.attrName.match(/S|R|T|DeformPercent/) !== null) {

					var curveNode = {

						id: rawCurveNode.id,
						attr: rawCurveNode.attrName,
						curves: {}

					};

					curveNodesMap.set(curveNode.id, curveNode);
				}
			}

			return curveNodesMap;
		},

		// parse nodes in FBXTree.Objects.AnimationCurve and connect them up to
		// previously parsed AnimationCurveNodes. Each AnimationCurve holds data for a single animated
		// axis ( e.g. times and values of x rotation)
		parseAnimationCurves: function parseAnimationCurves(curveNodesMap) {

			var rawCurves = fbxTree.Objects.AnimationCurve;

			// TODO: Many values are identical up to roundoff error, but won't be optimised
			// e.g. position times: [0, 0.4, 0. 8]
			// position values: [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.235384487103147e-7, 93.67520904541016, -0.9982695579528809]
			// clearly, this should be optimised to
			// times: [0], positions [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809]
			// this shows up in nearly every FBX file, and generally time array is length > 100

			for (var nodeID in rawCurves) {

				var animationCurve = {

					id: rawCurves[nodeID].id,
					times: rawCurves[nodeID].KeyTime.a.map(convertFBXTimeToSeconds),
					values: rawCurves[nodeID].KeyValueFloat.a

				};

				var relationships = connections.get(animationCurve.id);

				if (relationships !== undefined) {

					var animationCurveID = relationships.parents[0].ID;
					var animationCurveRelationship = relationships.parents[0].relationship;

					if (animationCurveRelationship.match(/X/)) {

						curveNodesMap.get(animationCurveID).curves['x'] = animationCurve;
					} else if (animationCurveRelationship.match(/Y/)) {

						curveNodesMap.get(animationCurveID).curves['y'] = animationCurve;
					} else if (animationCurveRelationship.match(/Z/)) {

						curveNodesMap.get(animationCurveID).curves['z'] = animationCurve;
					} else if (animationCurveRelationship.match(/d|DeformPercent/) && curveNodesMap.has(animationCurveID)) {

						curveNodesMap.get(animationCurveID).curves['morph'] = animationCurve;
					}
				}
			}
		},

		// parse nodes in FBXTree.Objects.AnimationLayer. Each layers holds references
		// to various AnimationCurveNodes and is referenced by an AnimationStack node
		// note: theoretically a stack can have multiple layers, however in practice there always seems to be one per stack
		parseAnimationLayers: function parseAnimationLayers(curveNodesMap) {

			var rawLayers = fbxTree.Objects.AnimationLayer;

			var layersMap = new Map();

			for (var nodeID in rawLayers) {

				var layerCurveNodes = [];

				var connection = connections.get(parseInt(nodeID));

				if (connection !== undefined) {

					// all the animationCurveNodes used in the layer
					var children = connection.children;

					var self = this;
					children.forEach(function (child, i) {

						if (curveNodesMap.has(child.ID)) {

							var curveNode = curveNodesMap.get(child.ID);

							// check that the curves are defined for at least one axis, otherwise ignore the curveNode
							if (curveNode.curves.x !== undefined || curveNode.curves.y !== undefined || curveNode.curves.z !== undefined) {

								if (layerCurveNodes[i] === undefined) {

									var modelID;

									connections.get(child.ID).parents.forEach(function (parent) {

										if (parent.relationship !== undefined) modelID = parent.ID;
									});

									var rawModel = fbxTree.Objects.Model[modelID.toString()];

									var node = {

										modelName: THREE.PropertyBinding.sanitizeNodeName(rawModel.attrName),
										initialPosition: [0, 0, 0],
										initialRotation: [0, 0, 0],
										initialScale: [1, 1, 1],
										transform: self.getModelAnimTransform(rawModel)

									};

									// if the animated model is pre rotated, we'll have to apply the pre rotations to every
									// animation value as well
									if ('PreRotation' in rawModel) node.preRotations = rawModel.PreRotation.value;
									if ('PostRotation' in rawModel) node.postRotations = rawModel.PostRotation.value;

									layerCurveNodes[i] = node;
								}

								layerCurveNodes[i][curveNode.attr] = curveNode;
							} else if (curveNode.curves.morph !== undefined) {

								if (layerCurveNodes[i] === undefined) {

									var deformerID;

									connections.get(child.ID).parents.forEach(function (parent) {

										if (parent.relationship !== undefined) deformerID = parent.ID;
									});

									var morpherID = connections.get(deformerID).parents[0].ID;
									var geoID = connections.get(morpherID).parents[0].ID;

									// assuming geometry is not used in more than one model
									var modelID = connections.get(geoID).parents[0].ID;

									var rawModel = fbxTree.Objects.Model[modelID];

									var node = {

										modelName: THREE.PropertyBinding.sanitizeNodeName(rawModel.attrName),
										morphName: fbxTree.Objects.Deformer[deformerID].attrName

									};

									layerCurveNodes[i] = node;
								}

								layerCurveNodes[i][curveNode.attr] = curveNode;
							}
						}
					});

					layersMap.set(parseInt(nodeID), layerCurveNodes);
				}
			}

			return layersMap;
		},

		getModelAnimTransform: function getModelAnimTransform(modelNode) {

			var transformData = {};

			if ('RotationOrder' in modelNode) transformData.eulerOrder = parseInt(modelNode.RotationOrder.value);

			if ('Lcl_Translation' in modelNode) transformData.translation = modelNode.Lcl_Translation.value;
			if ('RotationOffset' in modelNode) transformData.rotationOffset = modelNode.RotationOffset.value;

			if ('Lcl_Rotation' in modelNode) transformData.rotation = modelNode.Lcl_Rotation.value;
			if ('PreRotation' in modelNode) transformData.preRotation = modelNode.PreRotation.value;

			if ('PostRotation' in modelNode) transformData.postRotation = modelNode.PostRotation.value;

			if ('Lcl_Scaling' in modelNode) transformData.scale = modelNode.Lcl_Scaling.value;

			return generateTransform(transformData);
		},

		// parse nodes in FBXTree.Objects.AnimationStack. These are the top level node in the animation
		// hierarchy. Each Stack node will be used to create a THREE.AnimationClip
		parseAnimStacks: function parseAnimStacks(layersMap) {

			var rawStacks = fbxTree.Objects.AnimationStack;

			// connect the stacks (clips) up to the layers
			var rawClips = {};

			for (var nodeID in rawStacks) {

				var children = connections.get(parseInt(nodeID)).children;

				if (children.length > 1) {

					// it seems like stacks will always be associated with a single layer. But just in case there are files
					// where there are multiple layers per stack, we'll display a warning
					console.warn('THREE.FBXLoader: Encountered an animation stack with multiple layers, this is currently not supported. Ignoring subsequent layers.');
				}

				var layer = layersMap.get(children[0].ID);

				rawClips[nodeID] = {

					name: rawStacks[nodeID].attrName,
					layer: layer

				};
			}

			return rawClips;
		},

		addClip: function addClip(rawClip) {

			var tracks = [];

			var self = this;
			rawClip.layer.forEach(function (rawTracks) {

				tracks = tracks.concat(self.generateTracks(rawTracks));
			});

			return new THREE.AnimationClip(rawClip.name, -1, tracks);
		},

		generateTracks: function generateTracks(rawTracks) {

			var tracks = [];

			var initialPosition = new THREE.Vector3();
			var initialRotation = new THREE.Quaternion();
			var initialScale = new THREE.Vector3();

			if (rawTracks.transform) rawTracks.transform.decompose(initialPosition, initialRotation, initialScale);

			initialPosition = initialPosition.toArray();
			initialRotation = new THREE.Euler().setFromQuaternion(initialRotation).toArray(); // todo: euler order
			initialScale = initialScale.toArray();

			if (rawTracks.T !== undefined && Object.keys(rawTracks.T.curves).length > 0) {

				var positionTrack = this.generateVectorTrack(rawTracks.modelName, rawTracks.T.curves, initialPosition, 'position');
				if (positionTrack !== undefined) tracks.push(positionTrack);
			}

			if (rawTracks.R !== undefined && Object.keys(rawTracks.R.curves).length > 0) {

				var rotationTrack = this.generateRotationTrack(rawTracks.modelName, rawTracks.R.curves, initialRotation, rawTracks.preRotations, rawTracks.postRotations);
				if (rotationTrack !== undefined) tracks.push(rotationTrack);
			}

			if (rawTracks.S !== undefined && Object.keys(rawTracks.S.curves).length > 0) {

				var scaleTrack = this.generateVectorTrack(rawTracks.modelName, rawTracks.S.curves, initialScale, 'scale');
				if (scaleTrack !== undefined) tracks.push(scaleTrack);
			}

			if (rawTracks.DeformPercent !== undefined) {

				var morphTrack = this.generateMorphTrack(rawTracks);
				if (morphTrack !== undefined) tracks.push(morphTrack);
			}

			return tracks;
		},

		generateVectorTrack: function generateVectorTrack(modelName, curves, initialValue, type) {

			var times = this.getTimesForAllAxes(curves);
			var values = this.getKeyframeTrackValues(times, curves, initialValue);

			return new THREE.VectorKeyframeTrack(modelName + '.' + type, times, values);
		},

		generateRotationTrack: function generateRotationTrack(modelName, curves, initialValue, preRotations, postRotations) {

			if (curves.x !== undefined) {

				this.interpolateRotations(curves.x);
				curves.x.values = curves.x.values.map(THREE.Math.degToRad);
			}
			if (curves.y !== undefined) {

				this.interpolateRotations(curves.y);
				curves.y.values = curves.y.values.map(THREE.Math.degToRad);
			}
			if (curves.z !== undefined) {

				this.interpolateRotations(curves.z);
				curves.z.values = curves.z.values.map(THREE.Math.degToRad);
			}

			var times = this.getTimesForAllAxes(curves);
			var values = this.getKeyframeTrackValues(times, curves, initialValue);

			if (preRotations !== undefined) {

				preRotations = preRotations.map(THREE.Math.degToRad);
				preRotations.push('ZYX');

				preRotations = new THREE.Euler().fromArray(preRotations);
				preRotations = new THREE.Quaternion().setFromEuler(preRotations);
			}

			if (postRotations !== undefined) {

				postRotations = postRotations.map(THREE.Math.degToRad);
				postRotations.push('ZYX');

				postRotations = new THREE.Euler().fromArray(postRotations);
				postRotations = new THREE.Quaternion().setFromEuler(postRotations).inverse();
			}

			var quaternion = new THREE.Quaternion();
			var euler = new THREE.Euler();

			var quaternionValues = [];

			for (var i = 0; i < values.length; i += 3) {

				euler.set(values[i], values[i + 1], values[i + 2], 'ZYX');

				quaternion.setFromEuler(euler);

				if (preRotations !== undefined) quaternion.premultiply(preRotations);
				if (postRotations !== undefined) quaternion.multiply(postRotations);

				quaternion.toArray(quaternionValues, i / 3 * 4);
			}

			return new THREE.QuaternionKeyframeTrack(modelName + '.quaternion', times, quaternionValues);
		},

		generateMorphTrack: function generateMorphTrack(rawTracks) {

			var curves = rawTracks.DeformPercent.curves.morph;
			var values = curves.values.map(function (val) {

				return val / 100;
			});

			var morphNum = sceneGraph.getObjectByName(rawTracks.modelName).morphTargetDictionary[rawTracks.morphName];

			return new THREE.NumberKeyframeTrack(rawTracks.modelName + '.morphTargetInfluences[' + morphNum + ']', curves.times, values);
		},

		// For all animated objects, times are defined separately for each axis
		// Here we'll combine the times into one sorted array without duplicates
		getTimesForAllAxes: function getTimesForAllAxes(curves) {

			var times = [];

			// first join together the times for each axis, if defined
			if (curves.x !== undefined) times = times.concat(curves.x.times);
			if (curves.y !== undefined) times = times.concat(curves.y.times);
			if (curves.z !== undefined) times = times.concat(curves.z.times);

			// then sort them and remove duplicates
			times = times.sort(function (a, b) {

				return a - b;
			}).filter(function (elem, index, array) {

				return array.indexOf(elem) == index;
			});

			return times;
		},

		getKeyframeTrackValues: function getKeyframeTrackValues(times, curves, initialValue) {

			var prevValue = initialValue;

			var values = [];

			var xIndex = -1;
			var yIndex = -1;
			var zIndex = -1;

			times.forEach(function (time) {

				if (curves.x) xIndex = curves.x.times.indexOf(time);
				if (curves.y) yIndex = curves.y.times.indexOf(time);
				if (curves.z) zIndex = curves.z.times.indexOf(time);

				// if there is an x value defined for this frame, use that
				if (xIndex !== -1) {

					var xValue = curves.x.values[xIndex];
					values.push(xValue);
					prevValue[0] = xValue;
				} else {

					// otherwise use the x value from the previous frame
					values.push(prevValue[0]);
				}

				if (yIndex !== -1) {

					var yValue = curves.y.values[yIndex];
					values.push(yValue);
					prevValue[1] = yValue;
				} else {

					values.push(prevValue[1]);
				}

				if (zIndex !== -1) {

					var zValue = curves.z.values[zIndex];
					values.push(zValue);
					prevValue[2] = zValue;
				} else {

					values.push(prevValue[2]);
				}
			});

			return values;
		},

		// Rotations are defined as Euler angles which can have values  of any size
		// These will be converted to quaternions which don't support values greater than
		// PI, so we'll interpolate large rotations
		interpolateRotations: function interpolateRotations(curve) {

			for (var i = 1; i < curve.values.length; i++) {

				var initialValue = curve.values[i - 1];
				var valuesSpan = curve.values[i] - initialValue;

				var absoluteSpan = Math.abs(valuesSpan);

				if (absoluteSpan >= 180) {

					var numSubIntervals = absoluteSpan / 180;

					var step = valuesSpan / numSubIntervals;
					var nextValue = initialValue + step;

					var initialTime = curve.times[i - 1];
					var timeSpan = curve.times[i] - initialTime;
					var interval = timeSpan / numSubIntervals;
					var nextTime = initialTime + interval;

					var interpolatedTimes = [];
					var interpolatedValues = [];

					while (nextTime < curve.times[i]) {

						interpolatedTimes.push(nextTime);
						nextTime += interval;

						interpolatedValues.push(nextValue);
						nextValue += step;
					}

					curve.times = inject(curve.times, i, interpolatedTimes);
					curve.values = inject(curve.values, i, interpolatedValues);
				}
			}
		}

	};

	// parse an FBX file in ASCII format
	function TextParser() {}

	TextParser.prototype = {

		constructor: TextParser,

		getPrevNode: function getPrevNode() {

			return this.nodeStack[this.currentIndent - 2];
		},

		getCurrentNode: function getCurrentNode() {

			return this.nodeStack[this.currentIndent - 1];
		},

		getCurrentProp: function getCurrentProp() {

			return this.currentProp;
		},

		pushStack: function pushStack(node) {

			this.nodeStack.push(node);
			this.currentIndent += 1;
		},

		popStack: function popStack() {

			this.nodeStack.pop();
			this.currentIndent -= 1;
		},

		setCurrentProp: function setCurrentProp(val, name) {

			this.currentProp = val;
			this.currentPropName = name;
		},

		parse: function parse(text) {

			this.currentIndent = 0;
			console.log("FBXTree: ", FBXTree);
			this.allNodes = new FBXTree();
			this.nodeStack = [];
			this.currentProp = [];
			this.currentPropName = '';

			var self = this;

			var split = text.split(/[\r\n]+/);

			split.forEach(function (line, i) {

				var matchComment = line.match(/^[\s\t]*;/);
				var matchEmpty = line.match(/^[\s\t]*$/);

				if (matchComment || matchEmpty) return;

				var matchBeginning = line.match('^\\t{' + self.currentIndent + '}(\\w+):(.*){', '');
				var matchProperty = line.match('^\\t{' + self.currentIndent + '}(\\w+):[\\s\\t\\r\\n](.*)');
				var matchEnd = line.match('^\\t{' + (self.currentIndent - 1) + '}}');

				if (matchBeginning) {

					self.parseNodeBegin(line, matchBeginning);
				} else if (matchProperty) {

					self.parseNodeProperty(line, matchProperty, split[++i]);
				} else if (matchEnd) {

					self.popStack();
				} else if (line.match(/^[^\s\t}]/)) {

					// large arrays are split over multiple lines terminated with a ',' character
					// if this is encountered the line needs to be joined to the previous line
					self.parseNodePropertyContinued(line);
				}
			});

			return this.allNodes;
		},

		parseNodeBegin: function parseNodeBegin(line, property) {

			var nodeName = property[1].trim().replace(/^"/, '').replace(/"$/, '');

			var nodeAttrs = property[2].split(',').map(function (attr) {

				return attr.trim().replace(/^"/, '').replace(/"$/, '');
			});

			var node = { name: nodeName };
			var attrs = this.parseNodeAttr(nodeAttrs);

			var currentNode = this.getCurrentNode();

			// a top node
			if (this.currentIndent === 0) {

				this.allNodes.add(nodeName, node);
			} else {
				// a subnode

				// if the subnode already exists, append it
				if (nodeName in currentNode) {

					// special case Pose needs PoseNodes as an array
					if (nodeName === 'PoseNode') {

						currentNode.PoseNode.push(node);
					} else if (currentNode[nodeName].id !== undefined) {

						currentNode[nodeName] = {};
						currentNode[nodeName][currentNode[nodeName].id] = currentNode[nodeName];
					}

					if (attrs.id !== '') currentNode[nodeName][attrs.id] = node;
				} else if (typeof attrs.id === 'number') {

					currentNode[nodeName] = {};
					currentNode[nodeName][attrs.id] = node;
				} else if (nodeName !== 'Properties70') {

					if (nodeName === 'PoseNode') currentNode[nodeName] = [node];else currentNode[nodeName] = node;
				}
			}

			if (typeof attrs.id === 'number') node.id = attrs.id;
			if (attrs.name !== '') node.attrName = attrs.name;
			if (attrs.type !== '') node.attrType = attrs.type;

			this.pushStack(node);
		},

		parseNodeAttr: function parseNodeAttr(attrs) {

			var id = attrs[0];

			if (attrs[0] !== '') {

				id = parseInt(attrs[0]);

				if (isNaN(id)) {

					id = attrs[0];
				}
			}

			var name = '',
			    type = '';

			if (attrs.length > 1) {

				name = attrs[1].replace(/^(\w+)::/, '');
				type = attrs[2];
			}

			return { id: id, name: name, type: type };
		},

		parseNodeProperty: function parseNodeProperty(line, property, contentLine) {

			var propName = property[1].replace(/^"/, '').replace(/"$/, '').trim();
			var propValue = property[2].replace(/^"/, '').replace(/"$/, '').trim();

			// for special case: base64 image data follows "Content: ," line
			//	Content: ,
			//	 "/9j/4RDaRXhpZgAATU0A..."
			if (propName === 'Content' && propValue === ',') {

				propValue = contentLine.replace(/"/g, '').replace(/,$/, '').trim();
			}

			var currentNode = this.getCurrentNode();
			var parentName = currentNode.name;

			if (parentName === 'Properties70') {

				this.parseNodeSpecialProperty(line, propName, propValue);
				return;
			}

			// Connections
			if (propName === 'C') {

				var connProps = propValue.split(',').slice(1);
				var from = parseInt(connProps[0]);
				var to = parseInt(connProps[1]);

				var rest = propValue.split(',').slice(3);

				rest = rest.map(function (elem) {

					return elem.trim().replace(/^"/, '');
				});

				propName = 'connections';
				propValue = [from, to];
				append(propValue, rest);

				if (currentNode[propName] === undefined) {

					currentNode[propName] = [];
				}
			}

			// Node
			if (propName === 'Node') currentNode.id = propValue;

			// connections
			if (propName in currentNode && Array.isArray(currentNode[propName])) {

				currentNode[propName].push(propValue);
			} else {

				if (propName !== 'a') currentNode[propName] = propValue;else currentNode.a = propValue;
			}

			this.setCurrentProp(currentNode, propName);

			// convert string to array, unless it ends in ',' in which case more will be added to it
			if (propName === 'a' && propValue.slice(-1) !== ',') {

				currentNode.a = parseNumberArray(propValue);
			}
		},

		parseNodePropertyContinued: function parseNodePropertyContinued(line) {

			var currentNode = this.getCurrentNode();

			currentNode.a += line;

			// if the line doesn't end in ',' we have reached the end of the property value
			// so convert the string to an array
			if (line.slice(-1) !== ',') {

				currentNode.a = parseNumberArray(currentNode.a);
			}
		},

		// parse "Property70"
		parseNodeSpecialProperty: function parseNodeSpecialProperty(line, propName, propValue) {

			// split this
			// P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
			// into array like below
			// ["Lcl Scaling", "Lcl Scaling", "", "A", "1,1,1" ]
			var props = propValue.split('",').map(function (prop) {

				return prop.trim().replace(/^\"/, '').replace(/\s/, '_');
			});

			var innerPropName = props[0];
			var innerPropType1 = props[1];
			var innerPropType2 = props[2];
			var innerPropFlag = props[3];
			var innerPropValue = props[4];

			// cast values where needed, otherwise leave as strings
			switch (innerPropType1) {

				case 'int':
				case 'enum':
				case 'bool':
				case 'ULongLong':
				case 'double':
				case 'Number':
				case 'FieldOfView':
					innerPropValue = parseFloat(innerPropValue);
					break;

				case 'Color':
				case 'ColorRGB':
				case 'Vector3D':
				case 'Lcl_Translation':
				case 'Lcl_Rotation':
				case 'Lcl_Scaling':
					innerPropValue = parseNumberArray(innerPropValue);
					break;

			}

			// CAUTION: these props must append to parent's parent
			this.getPrevNode()[innerPropName] = {

				'type': innerPropType1,
				'type2': innerPropType2,
				'flag': innerPropFlag,
				'value': innerPropValue

			};

			this.setCurrentProp(this.getPrevNode(), innerPropName);
		}

	};

	// Parse an FBX file in Binary format
	function BinaryParser() {}

	BinaryParser.prototype = {

		constructor: BinaryParser,

		parse: function parse(buffer) {

			var reader = new BinaryReader(buffer);
			reader.skip(23); // skip magic 23 bytes

			var version = reader.getUint32();

			console.log('THREE.FBXLoader: FBX binary version: ' + version);

			var allNodes = new FBXTree();

			while (!this.endOfContent(reader)) {

				var node = this.parseNode(reader, version);
				if (node !== null) allNodes.add(node.name, node);
			}

			return allNodes;
		},

		// Check if reader has reached the end of content.
		endOfContent: function endOfContent(reader) {

			// footer size: 160bytes + 16-byte alignment padding
			// - 16bytes: magic
			// - padding til 16-byte alignment (at least 1byte?)
			//	(seems like some exporters embed fixed 15 or 16bytes?)
			// - 4bytes: magic
			// - 4bytes: version
			// - 120bytes: zero
			// - 16bytes: magic
			if (reader.size() % 16 === 0) {

				return (reader.getOffset() + 160 + 16 & ~0xf) >= reader.size();
			} else {

				return reader.getOffset() + 160 + 16 >= reader.size();
			}
		},

		// recursively parse nodes until the end of the file is reached
		parseNode: function parseNode(reader, version) {

			var node = {};

			// The first three data sizes depends on version.
			var endOffset = version >= 7500 ? reader.getUint64() : reader.getUint32();
			var numProperties = version >= 7500 ? reader.getUint64() : reader.getUint32();

			// note: do not remove this even if you get a linter warning as it moves the buffer forward
			var propertyListLen = version >= 7500 ? reader.getUint64() : reader.getUint32();

			var nameLen = reader.getUint8();
			var name = reader.getString(nameLen);

			// Regards this node as NULL-record if endOffset is zero
			if (endOffset === 0) return null;

			var propertyList = [];

			for (var i = 0; i < numProperties; i++) {

				propertyList.push(this.parseProperty(reader));
			}

			// Regards the first three elements in propertyList as id, attrName, and attrType
			var id = propertyList.length > 0 ? propertyList[0] : '';
			var attrName = propertyList.length > 1 ? propertyList[1] : '';
			var attrType = propertyList.length > 2 ? propertyList[2] : '';

			// check if this node represents just a single property
			// like (name, 0) set or (name2, [0, 1, 2]) set of {name: 0, name2: [0, 1, 2]}
			node.singleProperty = numProperties === 1 && reader.getOffset() === endOffset ? true : false;

			while (endOffset > reader.getOffset()) {

				var subNode = this.parseNode(reader, version);

				if (subNode !== null) this.parseSubNode(name, node, subNode);
			}

			node.propertyList = propertyList; // raw property list used by parent

			if (typeof id === 'number') node.id = id;
			if (attrName !== '') node.attrName = attrName;
			if (attrType !== '') node.attrType = attrType;
			if (name !== '') node.name = name;

			return node;
		},

		parseSubNode: function parseSubNode(name, node, subNode) {

			// special case: child node is single property
			if (subNode.singleProperty === true) {

				var value = subNode.propertyList[0];

				if (Array.isArray(value)) {

					node[subNode.name] = subNode;

					subNode.a = value;
				} else {

					node[subNode.name] = value;
				}
			} else if (name === 'Connections' && subNode.name === 'C') {

				var array = [];

				subNode.propertyList.forEach(function (property, i) {

					// first Connection is FBX type (OO, OP, etc.). We'll discard these
					if (i !== 0) array.push(property);
				});

				if (node.connections === undefined) {

					node.connections = [];
				}

				node.connections.push(array);
			} else if (subNode.name === 'Properties70') {

				var keys = Object.keys(subNode);

				keys.forEach(function (key) {

					node[key] = subNode[key];
				});
			} else if (name === 'Properties70' && subNode.name === 'P') {

				var innerPropName = subNode.propertyList[0];
				var innerPropType1 = subNode.propertyList[1];
				var innerPropType2 = subNode.propertyList[2];
				var innerPropFlag = subNode.propertyList[3];
				var innerPropValue;

				if (innerPropName.indexOf('Lcl ') === 0) innerPropName = innerPropName.replace('Lcl ', 'Lcl_');
				if (innerPropType1.indexOf('Lcl ') === 0) innerPropType1 = innerPropType1.replace('Lcl ', 'Lcl_');

				if (innerPropType1 === 'Color' || innerPropType1 === 'ColorRGB' || innerPropType1 === 'Vector' || innerPropType1 === 'Vector3D' || innerPropType1.indexOf('Lcl_') === 0) {

					innerPropValue = [subNode.propertyList[4], subNode.propertyList[5], subNode.propertyList[6]];
				} else {

					innerPropValue = subNode.propertyList[4];
				}

				// this will be copied to parent, see above
				node[innerPropName] = {

					'type': innerPropType1,
					'type2': innerPropType2,
					'flag': innerPropFlag,
					'value': innerPropValue

				};
			} else if (node[subNode.name] === undefined) {

				if (typeof subNode.id === 'number') {

					node[subNode.name] = {};
					node[subNode.name][subNode.id] = subNode;
				} else {

					node[subNode.name] = subNode;
				}
			} else {

				if (subNode.name === 'PoseNode') {

					if (!Array.isArray(node[subNode.name])) {

						node[subNode.name] = [node[subNode.name]];
					}

					node[subNode.name].push(subNode);
				} else if (node[subNode.name][subNode.id] === undefined) {

					node[subNode.name][subNode.id] = subNode;
				}
			}
		},

		parseProperty: function parseProperty(reader) {

			var type = reader.getString(1);

			switch (type) {

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
					return reader.getArrayBuffer(length);

				case 'S':
					var length = reader.getUint32();
					return reader.getString(length);

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

					if (encoding === 0) {

						switch (type) {

							case 'b':
							case 'c':
								return reader.getBooleanArray(arrayLength);

							case 'd':
								return reader.getFloat64Array(arrayLength);

							case 'f':
								return reader.getFloat32Array(arrayLength);

							case 'i':
								return reader.getInt32Array(arrayLength);

							case 'l':
								return reader.getInt64Array(arrayLength);

						}
					}

					if (typeof Zlib === 'undefined') {

						console.error('THREE.FBXLoader: External library Inflate.min.js required, obtain or import from https://github.com/imaya/zlib.js');
					}

					var inflate = new Zlib.Inflate(new Uint8Array(reader.getArrayBuffer(compressedLength))); // eslint-disable-line no-undef
					var reader2 = new BinaryReader(inflate.decompress().buffer);

					switch (type) {

						case 'b':
						case 'c':
							return reader2.getBooleanArray(arrayLength);

						case 'd':
							return reader2.getFloat64Array(arrayLength);

						case 'f':
							return reader2.getFloat32Array(arrayLength);

						case 'i':
							return reader2.getInt32Array(arrayLength);

						case 'l':
							return reader2.getInt64Array(arrayLength);

					}

				default:
					throw new Error('THREE.FBXLoader: Unknown property type ' + type);

			}
		}

	};

	function BinaryReader(buffer, littleEndian) {

		this.dv = new DataView(buffer);
		this.offset = 0;
		this.littleEndian = littleEndian !== undefined ? littleEndian : true;
	}

	BinaryReader.prototype = {

		constructor: BinaryReader,

		getOffset: function getOffset() {

			return this.offset;
		},

		size: function size() {

			return this.dv.buffer.byteLength;
		},

		skip: function skip(length) {

			this.offset += length;
		},

		// seems like true/false representation depends on exporter.
		// true: 1 or 'Y'(=0x59), false: 0 or 'T'(=0x54)
		// then sees LSB.
		getBoolean: function getBoolean() {

			return (this.getUint8() & 1) === 1;
		},

		getBooleanArray: function getBooleanArray(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getBoolean());
			}

			return a;
		},

		getUint8: function getUint8() {

			var value = this.dv.getUint8(this.offset);
			this.offset += 1;
			return value;
		},

		getInt16: function getInt16() {

			var value = this.dv.getInt16(this.offset, this.littleEndian);
			this.offset += 2;
			return value;
		},

		getInt32: function getInt32() {

			var value = this.dv.getInt32(this.offset, this.littleEndian);
			this.offset += 4;
			return value;
		},

		getInt32Array: function getInt32Array(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getInt32());
			}

			return a;
		},

		getUint32: function getUint32() {

			var value = this.dv.getUint32(this.offset, this.littleEndian);
			this.offset += 4;
			return value;
		},

		// JavaScript doesn't support 64-bit integer so calculate this here
		// 1 << 32 will return 1 so using multiply operation instead here.
		// There's a possibility that this method returns wrong value if the value
		// is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
		// TODO: safely handle 64-bit integer
		getInt64: function getInt64() {

			var low, high;

			if (this.littleEndian) {

				low = this.getUint32();
				high = this.getUint32();
			} else {

				high = this.getUint32();
				low = this.getUint32();
			}

			// calculate negative value
			if (high & 0x80000000) {

				high = ~high & 0xFFFFFFFF;
				low = ~low & 0xFFFFFFFF;

				if (low === 0xFFFFFFFF) high = high + 1 & 0xFFFFFFFF;

				low = low + 1 & 0xFFFFFFFF;

				return -(high * 0x100000000 + low);
			}

			return high * 0x100000000 + low;
		},

		getInt64Array: function getInt64Array(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getInt64());
			}

			return a;
		},

		// Note: see getInt64() comment
		getUint64: function getUint64() {

			var low, high;

			if (this.littleEndian) {

				low = this.getUint32();
				high = this.getUint32();
			} else {

				high = this.getUint32();
				low = this.getUint32();
			}

			return high * 0x100000000 + low;
		},

		getFloat32: function getFloat32() {

			var value = this.dv.getFloat32(this.offset, this.littleEndian);
			this.offset += 4;
			return value;
		},

		getFloat32Array: function getFloat32Array(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getFloat32());
			}

			return a;
		},

		getFloat64: function getFloat64() {

			var value = this.dv.getFloat64(this.offset, this.littleEndian);
			this.offset += 8;
			return value;
		},

		getFloat64Array: function getFloat64Array(size) {

			var a = [];

			for (var i = 0; i < size; i++) {

				a.push(this.getFloat64());
			}

			return a;
		},

		getArrayBuffer: function getArrayBuffer(size) {

			var value = this.dv.buffer.slice(this.offset, this.offset + size);
			this.offset += size;
			return value;
		},

		getString: function getString(size) {

			// note: safari 9 doesn't support Uint8Array.indexOf; create intermediate array instead
			var a = [];

			for (var i = 0; i < size; i++) {

				a[i] = this.getUint8();
			}

			var nullByte = a.indexOf(0);
			if (nullByte >= 0) a = a.slice(0, nullByte);

			return THREE.LoaderUtils.decodeText(new Uint8Array(a));
		}

	};

	// FBXTree holds a representation of the FBX data, returned by the TextParser ( FBX ASCII format)
	// and BinaryParser( FBX Binary format)
	function FBXTree() {}

	FBXTree.prototype = {

		constructor: FBXTree,

		add: function add(key, val) {

			this[key] = val;
		}

	};

	// ************** UTILITY FUNCTIONS **************

	function isFbxFormatBinary(buffer) {

		var CORRECT = 'Kaydara FBX Binary  \0';

		return buffer.byteLength >= CORRECT.length && CORRECT === convertArrayBufferToString(buffer, 0, CORRECT.length);
	}

	function isFbxFormatASCII(text) {

		var CORRECT = ['K', 'a', 'y', 'd', 'a', 'r', 'a', '\\', 'F', 'B', 'X', '\\', 'B', 'i', 'n', 'a', 'r', 'y', '\\', '\\'];

		var cursor = 0;

		function read(offset) {

			var result = text[offset - 1];
			text = text.slice(cursor + offset);
			cursor++;
			return result;
		}

		for (var i = 0; i < CORRECT.length; ++i) {

			var num = read(1);
			if (num === CORRECT[i]) {

				return false;
			}
		}

		return true;
	}

	function getFbxVersion(text) {

		var versionRegExp = /FBXVersion: (\d+)/;
		var match = text.match(versionRegExp);
		if (match) {

			var version = parseInt(match[1]);
			return version;
		}
		throw new Error('THREE.FBXLoader: Cannot find the version number for the file given.');
	}

	// Converts FBX ticks into real time seconds.
	function convertFBXTimeToSeconds(time) {

		return time / 46186158000;
	}

	var dataArray = [];

	// extracts the data from the correct position in the FBX array based on indexing type
	function getData(polygonVertexIndex, polygonIndex, vertexIndex, infoObject) {

		var index;

		switch (infoObject.mappingType) {

			case 'ByPolygonVertex':
				index = polygonVertexIndex;
				break;
			case 'ByPolygon':
				index = polygonIndex;
				break;
			case 'ByVertice':
				index = vertexIndex;
				break;
			case 'AllSame':
				index = infoObject.indices[0];
				break;
			default:
				console.warn('THREE.FBXLoader: unknown attribute mapping type ' + infoObject.mappingType);

		}

		if (infoObject.referenceType === 'IndexToDirect') index = infoObject.indices[index];

		var from = index * infoObject.dataSize;
		var to = from + infoObject.dataSize;

		return slice(dataArray, infoObject.buffer, from, to);
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
	function generateTransform(transformData) {

		var transform = new THREE.Matrix4();
		translation.set(0, 0, 0);
		rotation.identity();

		var order = transformData.eulerOrder ? getEulerOrder(transformData.eulerOrder) : getEulerOrder(0);

		if (transformData.translation) translation.fromArray(transformData.translation);
		if (transformData.rotationOffset) translation.add(tempVec.fromArray(transformData.rotationOffset));

		if (transformData.rotation) {

			var array = transformData.rotation.map(THREE.Math.degToRad);
			array.push(order);
			rotation.makeRotationFromEuler(tempEuler.fromArray(array));
		}

		if (transformData.preRotation) {

			var array = transformData.preRotation.map(THREE.Math.degToRad);
			array.push(order);
			tempMat.makeRotationFromEuler(tempEuler.fromArray(array));

			rotation.premultiply(tempMat);
		}

		if (transformData.postRotation) {

			var array = transformData.postRotation.map(THREE.Math.degToRad);
			array.push(order);
			tempMat.makeRotationFromEuler(tempEuler.fromArray(array));

			tempMat.getInverse(tempMat);

			rotation.multiply(tempMat);
		}

		if (transformData.scale) transform.scale(tempVec.fromArray(transformData.scale));

		transform.setPosition(translation);
		transform.multiply(rotation);

		return transform;
	}

	// Returns the three.js intrinsic Euler order corresponding to FBX extrinsic Euler order
	// ref: http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_class_fbx_euler_html
	function getEulerOrder(order) {

		var enums = ['ZYX', // -> XYZ extrinsic
		'YZX', // -> XZY extrinsic
		'XZY', // -> YZX extrinsic
		'ZXY', // -> YXZ extrinsic
		'YXZ', // -> ZXY extrinsic
		'XYZ'];

		if (order === 6) {

			console.warn('THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect.');
			return enums[0];
		}

		return enums[order];
	}

	// Parses comma separated list of numbers and returns them an array.
	// Used internally by the TextParser
	function parseNumberArray(value) {

		var array = value.split(',').map(function (val) {

			return parseFloat(val);
		});

		return array;
	}

	function convertArrayBufferToString(buffer, from, to) {

		if (from === undefined) from = 0;
		if (to === undefined) to = buffer.byteLength;

		return THREE.LoaderUtils.decodeText(new Uint8Array(buffer, from, to));
	}

	function append(a, b) {

		for (var i = 0, j = a.length, l = b.length; i < l; i++, j++) {

			a[j] = b[i];
		}
	}

	function slice(a, b, from, to) {

		for (var i = from, j = 0; i < to; i++, j++) {

			a[j] = b[i];
		}

		return a;
	}

	// inject array a2 into array a1 at index
	function inject(a1, index, a2) {

		return a1.slice(0, index).concat(a2).concat(a1.slice(index));
	}

	return FBXLoader;
}();

},{}],4:[function(require,module,exports){
'use strict';

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
  var script = document.getElementById(id);
  var parent = script.parentNode;

  try {
    parent && parent.removeChild(script);
  } catch (e) {
    // ignore
  }
}

function appendScript(script) {
  var firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(script, firstScript);
}

function fetchScriptInternal(url, options, Promise) {
  return new Promise(function (resolve, reject) {
    var timeout = options.timeout || 5000;
    var scriptId = getScriptId();
    var script = createScript(url, scriptId);

    var timeoutId = setTimeout(function () {
      reject(new Error('Script request to ' + url + ' timed out'));

      removeScript(scriptId);
    }, timeout);

    var disableTimeout = function disableTimeout(timeoutId) {
      clearTimeout(timeoutId);
    };

    script.addEventListener('load', function (e) {
      resolve({ ok: true });

      disableTimeout(timeoutId);
      removeScript(scriptId);
    });

    script.addEventListener('error', function (e) {
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

},{}],5:[function(require,module,exports){
'use strict';

var LoopMode = {
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
    duration: { default: 0 },
    clampWhenFinished: { default: false, type: 'boolean' },
    crossFadeDuration: { default: 0 },
    loop: { default: 'repeat', oneOf: Object.keys(LoopMode) },
    repetitions: { default: Infinity, min: 0 },
    timeScale: { default: 1 }
  },

  init: function init() {
    var _this = this;

    /** @type {THREE.Mesh} */
    this.model = null;
    /** @type {THREE.AnimationMixer} */
    this.mixer = null;
    /** @type {Array<THREE.AnimationAction>} */
    this.activeActions = [];

    var model = this.el.getObject3D('mesh');

    if (model) {
      this.load(model);
    } else {
      this.el.addEventListener('model-loaded', function (e) {
        _this.load(e.detail.model);
      });
    }
  },

  load: function load(model) {
    var el = this.el;
    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);
    this.mixer.addEventListener('loop', function (e) {
      el.emit('animation-loop', { action: e.action, loopDelta: e.loopDelta });
    });
    this.mixer.addEventListener('finished', function (e) {
      el.emit('animation-finished', { action: e.action, direction: e.direction });
    });
    if (this.data.clip) this.update({});
  },

  remove: function remove() {
    if (this.mixer) this.mixer.stopAllAction();
  },

  update: function update(prevData) {
    if (!prevData) return;

    var data = this.data;
    var changes = AFRAME.utils.diff(data, prevData);

    // If selected clips have changed, restart animation.
    if ('clip' in changes) {
      this.stopAction();
      if (data.clip) this.playAction();
      return;
    }

    // Otherwise, modify running actions.
    this.activeActions.forEach(function (action) {
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

  stopAction: function stopAction() {
    var data = this.data;
    for (var i = 0; i < this.activeActions.length; i++) {
      data.crossFadeDuration ? this.activeActions[i].fadeOut(data.crossFadeDuration) : this.activeActions[i].stop();
    }
    this.activeActions.length = 0;
  },

  playAction: function playAction() {
    if (!this.mixer) return;

    var model = this.model,
        data = this.data,
        clips = model.animations || (model.geometry || {}).animations || [];

    if (!clips.length) return;

    var re = wildcardToRegExp(data.clip);

    for (var clip, i = 0; clip = clips[i]; i++) {
      if (clip.name.match(re)) {
        var action = this.mixer.clipAction(clip, model);
        action.enabled = true;
        action.clampWhenFinished = data.clampWhenFinished;
        if (data.duration) action.setDuration(data.duration);
        if (data.timeScale !== 1) action.setEffectiveTimeScale(data.timeScale);
        action.setLoop(LoopMode[data.loop], data.repetitions).fadeIn(data.crossFadeDuration).play();
        this.activeActions.push(action);
      }
    }
  },

  tick: function tick(t, dt) {
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

},{}],6:[function(require,module,exports){
'use strict';

THREE.ColladaLoader = require('../../lib/ColladaLoader');

/**
 * collada-model-legacy
 *
 * Loader for COLLADA (.dae) format.
 */
module.exports.Component = AFRAME.registerComponent('collada-model-legacy', {
  schema: { type: 'asset' },

  init: function init() {
    this.model = null;
    this.loader = new THREE.ColladaLoader();
  },

  update: function update() {
    var self = this;
    var el = this.el;
    var src = this.data;
    var rendererSystem = this.el.sceneEl.systems.renderer;

    if (!src) {
      return;
    }

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
      el.emit('model-loaded', { format: 'collada', model: self.model });
    });
  },

  remove: function remove() {
    if (!this.model) {
      return;
    }
    this.el.removeObject3D('mesh');
  }
});

},{"../../lib/ColladaLoader":2}],7:[function(require,module,exports){
'use strict';

THREE.FBXLoader = require('../../lib/FBXLoader');

/**
 * fbx-model
 *
 * Loader for FBX format. Supports ASCII, but *not* binary, models.
 */
module.exports = AFRAME.registerComponent('fbx-model', {
  schema: {
    src: { type: 'asset' },
    crossorigin: { default: '' }
  },

  init: function init() {
    this.model = null;
  },

  update: function update() {
    var data = this.data;
    if (!data.src) return;

    this.remove();
    var loader = new THREE.FBXLoader();
    if (data.crossorigin) loader.setCrossOrigin(data.crossorigin);
    loader.load(data.src, this.load.bind(this));
  },

  load: function load(model) {
    this.model = model;
    this.el.setObject3D('mesh', model);
    this.el.emit('model-loaded', { format: 'fbx', model: model });
  },

  remove: function remove() {
    if (this.model) this.el.removeObject3D('mesh');
  }
});

},{"../../lib/FBXLoader":3}],8:[function(require,module,exports){
'use strict';

var fetchScript = require('../../lib/fetch-script')();

var LOADER_SRC = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r86/examples/js/loaders/GLTFLoader.js';

var loadLoader = function () {
  var promise = void 0;
  return function () {
    promise = promise || fetchScript(LOADER_SRC);
    return promise;
  };
}();

/**
 * Legacy loader for glTF 1.0 models.
 * Asynchronously loads THREE.GLTFLoader from rawgit.
 */
module.exports = AFRAME.registerComponent('gltf-model-legacy', {
  schema: { type: 'model' },

  init: function init() {
    var _this = this;

    this.model = null;
    this.loader = null;
    this.loaderPromise = loadLoader().then(function () {
      _this.loader = new THREE.GLTFLoader();
      _this.loader.setCrossOrigin('Anonymous');
    });
  },

  update: function update() {
    var _this2 = this;

    var self = this;
    var el = this.el;
    var src = this.data;

    if (!src) {
      return;
    }

    this.remove();

    this.loaderPromise.then(function () {
      _this2.loader.load(src, function gltfLoaded(gltfModel) {
        self.model = gltfModel.scene;
        self.model.animations = gltfModel.animations;
        el.setObject3D('mesh', self.model);
        el.emit('model-loaded', { format: 'gltf', model: self.model });
      });
    });
  },

  remove: function remove() {
    if (!this.model) {
      return;
    }
    this.el.removeObject3D('mesh');
  }
});

},{"../../lib/fetch-script":4}],9:[function(require,module,exports){
'use strict';

require('./animation-mixer');
require('./collada-model-legacy');
require('./fbx-model');
require('./gltf-model-legacy');
require('./object-model');

},{"./animation-mixer":5,"./collada-model-legacy":6,"./fbx-model":7,"./gltf-model-legacy":8,"./object-model":10}],10:[function(require,module,exports){
'use strict';

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
    src: { type: 'asset' },
    crossorigin: { default: '' }
  },

  init: function init() {
    this.model = null;
  },

  update: function update() {
    var _this = this;

    var loader = void 0;
    var data = this.data;
    if (!data.src) return;

    this.remove();
    loader = new THREE.ObjectLoader();
    if (data.crossorigin) loader.setCrossOrigin(data.crossorigin);
    loader.load(data.src, function (object) {

      // Enable skinning, if applicable.
      object.traverse(function (o) {
        if (o instanceof THREE.SkinnedMesh && o.material) {
          o.material.skinning = !!(o.geometry && o.geometry.bones || []).length;
        }
      });

      _this.load(object);
    });
  },

  load: function load(model) {
    this.model = model;
    this.el.setObject3D('mesh', model);
    this.el.emit('model-loaded', { format: 'json', model: model });
  },

  remove: function remove() {
    if (this.model) this.el.removeObject3D('mesh');
  }
});

},{}]},{},[1]);
