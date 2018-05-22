(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require('./');

},{"./":2}],2:[function(require,module,exports){
'use strict';

require('./src/controls');
require('./src/loaders');
require('./src/misc');
require('./src/pathfinding');
require('./src/primitives');

},{"./src/controls":13,"./src/loaders":21,"./src/misc":28,"./src/pathfinding":34,"./src/primitives":42}],3:[function(require,module,exports){
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
 * Requires FBX file to be >= 7.0 and in ASCII or to be any version in Binary format.
 *
 * Supports:
 *  Mesh Generation (Positional Data)
 *  Normal Data (Per Vertex Drawing Instance)
 *  UV Data (Per Vertex Drawing Instance)
 *  Skinning
 *  Animation
 *  - Separated Animations based on stacks.
 *  - Skeletal & Non-Skeletal Animations
 *  NURBS (Open, Closed and Periodic forms)
 *
 * Needs Support:
 *  Euler rotation order
 *
 *
 * FBX format references:
 *  https://wiki.blender.org/index.php/User:Mont29/Foundation/FBX_File_Structure
 *
 *  Binary format specification:
 *    https://code.blender.org/2013/08/fbx-binary-file-format-specification/
 *    https://wiki.rogiken.org/specifications/file-format/fbx/ (more detail but Japanese)
 */

// Monkeypatch for <r89
THREE.LoaderUtils = {
  extractUrlBase: THREE.Loader.prototype.extractUrlBase,
  decodeText: function decodeText(array) {
    return new TextDecoder().decode(array);
  }
};

(function () {

  module.exports = THREE.FBXLoader = function (manager) {

    this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;
  };

  Object.assign(THREE.FBXLoader.prototype, {

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

          window.setTimeout(function () {

            if (onError) onError(error);

            self.manager.itemError(url);
          }, 0);
        }
      }, onProgress, onError);
    },

    parse: function parse(FBXBuffer, resourceDirectory) {

      var FBXTree;

      if (isFbxFormatBinary(FBXBuffer)) {

        FBXTree = new BinaryParser().parse(FBXBuffer);
      } else {

        var FBXText = convertArrayBufferToString(FBXBuffer);

        if (!isFbxFormatASCII(FBXText)) {

          throw new Error('THREE.FBXLoader: Unknown format.');
        }

        if (getFbxVersion(FBXText) < 7000) {

          throw new Error('THREE.FBXLoader: FBX version not supported, FileVersion: ' + getFbxVersion(FBXText));
        }

        FBXTree = new TextParser().parse(FBXText);
      }

      // console.log( FBXTree );

      var connections = parseConnections(FBXTree);
      var images = parseImages(FBXTree);
      var textures = parseTextures(FBXTree, new THREE.TextureLoader(this.manager).setPath(resourceDirectory), images, connections);
      var materials = parseMaterials(FBXTree, textures, connections);
      var skeletons = parseDeformers(FBXTree, connections);
      var geometryMap = parseGeometries(FBXTree, connections, skeletons);
      var sceneGraph = parseScene(FBXTree, connections, skeletons, geometryMap, materials);

      return sceneGraph;
    }

  });

  // Parses FBXTree.Connections which holds parent-child connections between objects (e.g. material -> texture, model->geometry )
  // and details the connection type
  function parseConnections(FBXTree) {

    var connectionMap = new Map();

    if ('Connections' in FBXTree) {

      var rawConnections = FBXTree.Connections.connections;

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
  }

  // Parse FBXTree.Objects.Video for embedded image data
  // These images are connected to textures in FBXTree.Objects.Textures
  // via FBXTree.Connections.
  function parseImages(FBXTree) {

    var images = {};
    var blobs = {};

    if ('Video' in FBXTree.Objects) {

      var videoNodes = FBXTree.Objects.Video;

      for (var nodeID in videoNodes) {

        var videoNode = videoNodes[nodeID];

        var id = parseInt(nodeID);

        images[id] = videoNode.Filename;

        // raw image data is in videoNode.Content
        if ('Content' in videoNode) {

          var arrayBufferContent = videoNode.Content instanceof ArrayBuffer && videoNode.Content.byteLength > 0;
          var base64Content = typeof videoNode.Content === 'string' && videoNode.Content !== '';

          if (arrayBufferContent || base64Content) {

            var image = parseImage(videoNodes[nodeID]);

            blobs[videoNode.Filename] = image;
          }
        }
      }
    }

    for (var id in images) {

      var filename = images[id];

      if (blobs[filename] !== undefined) images[id] = blobs[filename];else images[id] = images[id].split('\\').pop();
    }

    return images;
  }

  // Parse embedded image data in FBXTree.Video.Content
  function parseImage(videoNode) {

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
  }

  // Parse nodes in FBXTree.Objects.Texture
  // These contain details such as UV scaling, cropping, rotation etc and are connected
  // to images in FBXTree.Objects.Video
  function parseTextures(FBXTree, loader, images, connections) {

    var textureMap = new Map();

    if ('Texture' in FBXTree.Objects) {

      var textureNodes = FBXTree.Objects.Texture;
      for (var nodeID in textureNodes) {

        var texture = parseTexture(textureNodes[nodeID], loader, images, connections);
        textureMap.set(parseInt(nodeID), texture);
      }
    }

    return textureMap;
  }

  // Parse individual node in FBXTree.Objects.Texture
  function parseTexture(textureNode, loader, images, connections) {

    var texture = loadTexture(textureNode, loader, images, connections);

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
  }

  // load a texture specified as a blob or data URI, or via an external URL using THREE.TextureLoader
  function loadTexture(textureNode, loader, images, connections) {

    var fileName;

    var currentPath = loader.path;

    var children = connections.get(textureNode.id).children;

    if (children !== undefined && children.length > 0 && images[children[0].ID] !== undefined) {

      fileName = images[children[0].ID];

      if (fileName.indexOf('blob:') === 0 || fileName.indexOf('data:') === 0) {

        loader.setPath(undefined);
      }
    }

    var texture = loader.load(fileName);

    loader.setPath(currentPath);

    return texture;
  }

  // Parse nodes in FBXTree.Objects.Material
  function parseMaterials(FBXTree, textureMap, connections) {

    var materialMap = new Map();

    if ('Material' in FBXTree.Objects) {

      var materialNodes = FBXTree.Objects.Material;

      for (var nodeID in materialNodes) {

        var material = parseMaterial(FBXTree, materialNodes[nodeID], textureMap, connections);

        if (material !== null) materialMap.set(parseInt(nodeID), material);
      }
    }

    return materialMap;
  }

  // Parse single node in FBXTree.Objects.Material
  // Materials are connected to texture maps in FBXTree.Objects.Textures
  // FBX format currently only supports Lambert and Phong shading models
  function parseMaterial(FBXTree, materialNode, textureMap, connections) {

    var ID = materialNode.id;
    var name = materialNode.attrName;
    var type = materialNode.ShadingModel;

    //Case where FBX wraps shading model in property object.
    if ((typeof type === 'undefined' ? 'undefined' : _typeof(type)) === 'object') {

      type = type.value;
    }

    // Ignore unused materials which don't have any connections.
    if (!connections.has(ID)) return null;

    var parameters = parseParameters(FBXTree, materialNode, textureMap, ID, connections);

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
  }

  // Parse FBX material and return parameters suitable for a three.js material
  // Also parse the texture map and return any textures associated with the material
  function parseParameters(FBXTree, properties, textureMap, ID, connections) {

    var parameters = {};

    if (properties.BumpFactor) {

      parameters.bumpScale = properties.BumpFactor.value;
    }
    if (properties.Diffuse) {

      parameters.color = new THREE.Color().fromArray(properties.Diffuse.value);
    }
    if (properties.DisplacementFactor) {

      parameters.displacementScale = properties.DisplacementFactor.value;
    }
    if (properties.ReflectionFactor) {

      parameters.reflectivity = properties.ReflectionFactor.value;
    }
    if (properties.Specular) {

      parameters.specular = new THREE.Color().fromArray(properties.Specular.value);
    }
    if (properties.Shininess) {

      parameters.shininess = properties.Shininess.value;
    }
    if (properties.Emissive) {

      parameters.emissive = new THREE.Color().fromArray(properties.Emissive.value);
    }
    if (properties.EmissiveFactor) {

      parameters.emissiveIntensity = parseFloat(properties.EmissiveFactor.value);
    }
    if (properties.Opacity) {

      parameters.opacity = parseFloat(properties.Opacity.value);
    }
    if (parameters.opacity < 1.0) {

      parameters.transparent = true;
    }

    connections.get(ID).children.forEach(function (child) {

      var type = child.relationship;

      switch (type) {

        case 'Bump':
          parameters.bumpMap = textureMap.get(child.ID);
          break;

        case 'DiffuseColor':
          parameters.map = getTexture(FBXTree, textureMap, child.ID, connections);
          break;

        case 'DisplacementColor':
          parameters.displacementMap = getTexture(FBXTree, textureMap, child.ID, connections);
          break;

        case 'EmissiveColor':
          parameters.emissiveMap = getTexture(FBXTree, textureMap, child.ID, connections);
          break;

        case 'NormalMap':
          parameters.normalMap = getTexture(FBXTree, textureMap, child.ID, connections);
          break;

        case 'ReflectionColor':
          parameters.envMap = getTexture(FBXTree, textureMap, child.ID, connections);
          parameters.envMap.mapping = THREE.EquirectangularReflectionMapping;
          break;

        case 'SpecularColor':
          parameters.specularMap = getTexture(FBXTree, textureMap, child.ID, connections);
          break;

        case 'TransparentColor':
          parameters.alphaMap = getTexture(FBXTree, textureMap, child.ID, connections);
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
  }

  // get a texture from the textureMap for use by a material.
  function getTexture(FBXTree, textureMap, id, connections) {

    // if the texture is a layered texture, just use the first layer and issue a warning
    if ('LayeredTexture' in FBXTree.Objects && id in FBXTree.Objects.LayeredTexture) {

      console.warn('THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer.');
      id = connections.get(id).children[0].ID;
    }

    return textureMap.get(id);
  }

  // Parse nodes in FBXTree.Objects.Deformer
  // Deformer node can contain skinning or Vertex Cache animation data, however only skinning is supported here
  // Generates map of Skeleton-like objects for use later when generating and binding skeletons.
  function parseDeformers(FBXTree, connections) {

    var skeletons = {};

    if ('Deformer' in FBXTree.Objects) {

      var DeformerNodes = FBXTree.Objects.Deformer;

      for (var nodeID in DeformerNodes) {

        var deformerNode = DeformerNodes[nodeID];

        if (deformerNode.attrType === 'Skin') {

          var relationships = connections.get(parseInt(nodeID));

          var skeleton = parseSkeleton(relationships, DeformerNodes);
          skeleton.ID = nodeID;

          if (relationships.parents.length > 1) console.warn('THREE.FBXLoader: skeleton attached to more than one geometry is not supported.');
          skeleton.geometryID = relationships.parents[0].ID;

          skeletons[nodeID] = skeleton;
        }
      }
    }

    return skeletons;
  }

  // Parse single nodes in FBXTree.Objects.Deformer
  // The top level deformer nodes have type 'Skin' and subDeformer nodes have type 'Cluster'
  // Each skin node represents a skeleton and each cluster node represents a bone
  function parseSkeleton(connections, deformerNodes) {

    var rawBones = [];

    connections.children.forEach(function (child) {

      var subDeformerNode = deformerNodes[child.ID];

      if (subDeformerNode.attrType !== 'Cluster') return;

      var rawBone = {

        ID: child.ID,
        indices: [],
        weights: [],
        transform: new THREE.Matrix4().fromArray(subDeformerNode.Transform.a),
        transformLink: new THREE.Matrix4().fromArray(subDeformerNode.TransformLink.a),
        linkMode: subDeformerNode.Mode

      };

      if ('Indexes' in subDeformerNode) {

        rawBone.indices = subDeformerNode.Indexes.a;
        rawBone.weights = subDeformerNode.Weights.a;
      }

      rawBones.push(rawBone);
    });

    return {

      rawBones: rawBones,
      bones: []

    };
  }

  // Parse nodes in FBXTree.Objects.Geometry
  function parseGeometries(FBXTree, connections, skeletons) {

    var geometryMap = new Map();

    if ('Geometry' in FBXTree.Objects) {

      var geometryNodes = FBXTree.Objects.Geometry;

      for (var nodeID in geometryNodes) {

        var relationships = connections.get(parseInt(nodeID));
        var geo = parseGeometry(FBXTree, relationships, geometryNodes[nodeID], skeletons);

        geometryMap.set(parseInt(nodeID), geo);
      }
    }

    return geometryMap;
  }

  // Parse single node in FBXTree.Objects.Geometry
  function parseGeometry(FBXTree, relationships, geometryNode, skeletons) {

    switch (geometryNode.attrType) {

      case 'Mesh':
        return parseMeshGeometry(FBXTree, relationships, geometryNode, skeletons);
        break;

      case 'NurbsCurve':
        return parseNurbsGeometry(geometryNode);
        break;

    }
  }

  // Parse single node mesh geometry in FBXTree.Objects.Geometry
  function parseMeshGeometry(FBXTree, relationships, geometryNode, skeletons) {

    var modelNodes = relationships.parents.map(function (parent) {

      return FBXTree.Objects.Model[parent.ID];
    });

    // don't create geometry if it is not associated with any models
    if (modelNodes.length === 0) return;

    var skeleton = relationships.children.reduce(function (skeleton, child) {

      if (skeletons[child.ID] !== undefined) skeleton = skeletons[child.ID];

      return skeleton;
    }, null);

    var preTransform = new THREE.Matrix4();

    // TODO: if there is more than one model associated with the geometry, AND the models have
    // different geometric transforms, then this will cause problems
    // if ( modelNodes.length > 1 ) { }

    // For now just assume one model and get the preRotations from that
    var modelNode = modelNodes[0];

    if ('GeometricRotation' in modelNode) {

      var array = modelNode.GeometricRotation.value.map(THREE.Math.degToRad);
      array[3] = 'ZYX';

      preTransform.makeRotationFromEuler(new THREE.Euler().fromArray(array));
    }

    if ('GeometricTranslation' in modelNode) {

      preTransform.setPosition(new THREE.Vector3().fromArray(modelNode.GeometricTranslation.value));
    }

    return genGeometry(FBXTree, relationships, geometryNode, skeleton, preTransform);
  }

  // Generate a THREE.BufferGeometry from a node in FBXTree.Objects.Geometry
  function genGeometry(FBXTree, relationships, geometryNode, skeleton, preTransform) {

    var vertexPositions = geometryNode.Vertices.a;
    var vertexIndices = geometryNode.PolygonVertexIndex.a;

    // create arrays to hold the final data used to build the buffergeometry
    var vertexBuffer = [];
    var normalBuffer = [];
    var colorsBuffer = [];
    var uvsBuffer = [];
    var materialIndexBuffer = [];
    var vertexWeightsBuffer = [];
    var weightsIndicesBuffer = [];

    if (geometryNode.LayerElementColor) {

      var colorInfo = getColors(geometryNode.LayerElementColor[0]);
    }

    if (geometryNode.LayerElementMaterial) {

      var materialInfo = getMaterials(geometryNode.LayerElementMaterial[0]);
    }

    if (geometryNode.LayerElementNormal) {

      var normalInfo = getNormals(geometryNode.LayerElementNormal[0]);
    }

    if (geometryNode.LayerElementUV) {

      var uvInfo = [];
      var i = 0;
      while (geometryNode.LayerElementUV[i]) {

        uvInfo.push(getUVs(geometryNode.LayerElementUV[i]));
        i++;
      }
    }

    var weightTable = {};

    if (skeleton !== null) {

      skeleton.rawBones.forEach(function (rawBone, i) {

        // loop over the bone's vertex indices and weights
        rawBone.indices.forEach(function (index, j) {

          if (weightTable[index] === undefined) weightTable[index] = [];

          weightTable[index].push({

            id: i,
            weight: rawBone.weights[j]

          });
        });
      });
    }

    var polygonIndex = 0;
    var faceLength = 0;
    var displayedWeightsWarning = false;

    // these will hold data for a single face
    var vertexPositionIndexes = [];
    var faceNormals = [];
    var faceColors = [];
    var faceUVs = [];
    var faceWeights = [];
    var faceWeightIndices = [];

    vertexIndices.forEach(function (vertexIndex, polygonVertexIndex) {

      var endOfFace = false;

      // Face index and vertex index arrays are combined in a single array
      // A cube with quad faces looks like this:
      // PolygonVertexIndex: *24 {
      //  a: 0, 1, 3, -3, 2, 3, 5, -5, 4, 5, 7, -7, 6, 7, 1, -1, 1, 7, 5, -4, 6, 0, 2, -5
      //  }
      // Negative numbers mark the end of a face - first face here is 0, 1, 3, -3
      // to find index of last vertex multiply by -1 and subtract 1: -3 * - 1 - 1 = 2
      if (vertexIndex < 0) {

        vertexIndex = vertexIndex ^ -1; // equivalent to ( x * -1 ) - 1
        vertexIndices[polygonVertexIndex] = vertexIndex;
        endOfFace = true;
      }

      var weightIndices = [];
      var weights = [];

      vertexPositionIndexes.push(vertexIndex * 3, vertexIndex * 3 + 1, vertexIndex * 3 + 2);

      if (colorInfo) {

        var data = getData(polygonVertexIndex, polygonIndex, vertexIndex, colorInfo);

        faceColors.push(data[0], data[1], data[2]);
      }

      if (skeleton) {

        if (weightTable[vertexIndex] !== undefined) {

          weightTable[vertexIndex].forEach(function (wt) {

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

      if (normalInfo) {

        var data = getData(polygonVertexIndex, polygonIndex, vertexIndex, normalInfo);

        faceNormals.push(data[0], data[1], data[2]);
      }

      if (materialInfo && materialInfo.mappingType !== 'AllSame') {

        var materialIndex = getData(polygonVertexIndex, polygonIndex, vertexIndex, materialInfo)[0];
      }

      if (uvInfo) {

        uvInfo.forEach(function (uv, i) {

          var data = getData(polygonVertexIndex, polygonIndex, vertexIndex, uv);

          if (faceUVs[i] === undefined) {

            faceUVs[i] = [];
          }

          faceUVs[i].push(data[0]);
          faceUVs[i].push(data[1]);
        });
      }

      faceLength++;

      // we have reached the end of a face - it may have 4 sides though
      // in which case the data is split to represent two 3 sided faces
      if (endOfFace) {

        for (var i = 2; i < faceLength; i++) {

          vertexBuffer.push(vertexPositions[vertexPositionIndexes[0]]);
          vertexBuffer.push(vertexPositions[vertexPositionIndexes[1]]);
          vertexBuffer.push(vertexPositions[vertexPositionIndexes[2]]);

          vertexBuffer.push(vertexPositions[vertexPositionIndexes[(i - 1) * 3]]);
          vertexBuffer.push(vertexPositions[vertexPositionIndexes[(i - 1) * 3 + 1]]);
          vertexBuffer.push(vertexPositions[vertexPositionIndexes[(i - 1) * 3 + 2]]);

          vertexBuffer.push(vertexPositions[vertexPositionIndexes[i * 3]]);
          vertexBuffer.push(vertexPositions[vertexPositionIndexes[i * 3 + 1]]);
          vertexBuffer.push(vertexPositions[vertexPositionIndexes[i * 3 + 2]]);

          if (skeleton) {

            vertexWeightsBuffer.push(faceWeights[0]);
            vertexWeightsBuffer.push(faceWeights[1]);
            vertexWeightsBuffer.push(faceWeights[2]);
            vertexWeightsBuffer.push(faceWeights[3]);

            vertexWeightsBuffer.push(faceWeights[(i - 1) * 4]);
            vertexWeightsBuffer.push(faceWeights[(i - 1) * 4 + 1]);
            vertexWeightsBuffer.push(faceWeights[(i - 1) * 4 + 2]);
            vertexWeightsBuffer.push(faceWeights[(i - 1) * 4 + 3]);

            vertexWeightsBuffer.push(faceWeights[i * 4]);
            vertexWeightsBuffer.push(faceWeights[i * 4 + 1]);
            vertexWeightsBuffer.push(faceWeights[i * 4 + 2]);
            vertexWeightsBuffer.push(faceWeights[i * 4 + 3]);

            weightsIndicesBuffer.push(faceWeightIndices[0]);
            weightsIndicesBuffer.push(faceWeightIndices[1]);
            weightsIndicesBuffer.push(faceWeightIndices[2]);
            weightsIndicesBuffer.push(faceWeightIndices[3]);

            weightsIndicesBuffer.push(faceWeightIndices[(i - 1) * 4]);
            weightsIndicesBuffer.push(faceWeightIndices[(i - 1) * 4 + 1]);
            weightsIndicesBuffer.push(faceWeightIndices[(i - 1) * 4 + 2]);
            weightsIndicesBuffer.push(faceWeightIndices[(i - 1) * 4 + 3]);

            weightsIndicesBuffer.push(faceWeightIndices[i * 4]);
            weightsIndicesBuffer.push(faceWeightIndices[i * 4 + 1]);
            weightsIndicesBuffer.push(faceWeightIndices[i * 4 + 2]);
            weightsIndicesBuffer.push(faceWeightIndices[i * 4 + 3]);
          }

          if (colorInfo) {

            colorsBuffer.push(faceColors[0]);
            colorsBuffer.push(faceColors[1]);
            colorsBuffer.push(faceColors[2]);

            colorsBuffer.push(faceColors[(i - 1) * 3]);
            colorsBuffer.push(faceColors[(i - 1) * 3 + 1]);
            colorsBuffer.push(faceColors[(i - 1) * 3 + 2]);

            colorsBuffer.push(faceColors[i * 3]);
            colorsBuffer.push(faceColors[i * 3 + 1]);
            colorsBuffer.push(faceColors[i * 3 + 2]);
          }

          if (materialInfo && materialInfo.mappingType !== 'AllSame') {

            materialIndexBuffer.push(materialIndex);
            materialIndexBuffer.push(materialIndex);
            materialIndexBuffer.push(materialIndex);
          }

          if (normalInfo) {

            normalBuffer.push(faceNormals[0]);
            normalBuffer.push(faceNormals[1]);
            normalBuffer.push(faceNormals[2]);

            normalBuffer.push(faceNormals[(i - 1) * 3]);
            normalBuffer.push(faceNormals[(i - 1) * 3 + 1]);
            normalBuffer.push(faceNormals[(i - 1) * 3 + 2]);

            normalBuffer.push(faceNormals[i * 3]);
            normalBuffer.push(faceNormals[i * 3 + 1]);
            normalBuffer.push(faceNormals[i * 3 + 2]);
          }

          if (uvInfo) {

            uvInfo.forEach(function (uv, j) {

              if (uvsBuffer[j] === undefined) uvsBuffer[j] = [];

              uvsBuffer[j].push(faceUVs[j][0]);
              uvsBuffer[j].push(faceUVs[j][1]);

              uvsBuffer[j].push(faceUVs[j][(i - 1) * 2]);
              uvsBuffer[j].push(faceUVs[j][(i - 1) * 2 + 1]);

              uvsBuffer[j].push(faceUVs[j][i * 2]);
              uvsBuffer[j].push(faceUVs[j][i * 2 + 1]);
            });
          }
        }

        polygonIndex++;
        faceLength = 0;

        // reset arrays for the next face
        vertexPositionIndexes = [];
        faceNormals = [];
        faceColors = [];
        faceUVs = [];
        faceWeights = [];
        faceWeightIndices = [];
      }
    });

    var geo = new THREE.BufferGeometry();
    geo.name = geometryNode.name;

    var positionAttribute = new THREE.Float32BufferAttribute(vertexBuffer, 3);

    preTransform.applyToBufferAttribute(positionAttribute);

    geo.addAttribute('position', positionAttribute);

    if (colorsBuffer.length > 0) {

      geo.addAttribute('color', new THREE.Float32BufferAttribute(colorsBuffer, 3));
    }

    if (skeleton) {

      geo.addAttribute('skinIndex', new THREE.Float32BufferAttribute(weightsIndicesBuffer, 4));

      geo.addAttribute('skinWeight', new THREE.Float32BufferAttribute(vertexWeightsBuffer, 4));

      // used later to bind the skeleton to the model
      geo.FBX_Deformer = skeleton;
    }

    if (normalBuffer.length > 0) {

      var normalAttribute = new THREE.Float32BufferAttribute(normalBuffer, 3);

      var normalMatrix = new THREE.Matrix3().getNormalMatrix(preTransform);
      normalMatrix.applyToBufferAttribute(normalAttribute);

      geo.addAttribute('normal', normalAttribute);
    }

    uvsBuffer.forEach(function (uvBuffer, i) {

      // subsequent uv buffers are called 'uv1', 'uv2', ...
      var name = 'uv' + (i + 1).toString();

      // the first uv buffer is just called 'uv'
      if (i === 0) {

        name = 'uv';
      }

      geo.addAttribute(name, new THREE.Float32BufferAttribute(uvsBuffer[i], 2));
    });

    if (materialInfo && materialInfo.mappingType !== 'AllSame') {

      // Convert the material indices of each vertex into rendering groups on the geometry.
      var prevMaterialIndex = materialIndexBuffer[0];
      var startIndex = 0;

      materialIndexBuffer.forEach(function (currentIndex, i) {

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

        if (lastIndex !== materialIndexBuffer.length) {

          geo.addGroup(lastIndex, materialIndexBuffer.length - lastIndex, prevMaterialIndex);
        }
      }

      // case where there are multiple materials but the whole geometry is only
      // using one of them
      if (geo.groups.length === 0) {

        geo.addGroup(0, materialIndexBuffer.length, materialIndexBuffer[0]);
      }
    }

    return geo;
  }

  // Parse normal from FBXTree.Objects.Geometry.LayerElementNormal if it exists
  function getNormals(NormalNode) {

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
  }

  // Parse UVs from FBXTree.Objects.Geometry.LayerElementUV if it exists
  function getUVs(UVNode) {

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
  }

  // Parse Vertex Colors from FBXTree.Objects.Geometry.LayerElementColor if it exists
  function getColors(ColorNode) {

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
  }

  // Parse mapping and material data in FBXTree.Objects.Geometry.LayerElementMaterial if it exists
  function getMaterials(MaterialNode) {

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
  }

  // Functions use the infoObject and given indices to return value array of geometry.
  // Parameters:
  // 	- polygonVertexIndex - Index of vertex in draw order (which index of the index buffer refers to this vertex).
  // 	- polygonIndex - Index of polygon in geometry.
  // 	- vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
  // 	- infoObject: can be materialInfo, normalInfo, UVInfo or colorInfo
  // Index type:
  //	- Direct: index is same as polygonVertexIndex
  //	- IndexToDirect: infoObject has it's own set of indices
  var dataArray = [];

  var GetData = {

    ByPolygonVertex: {

      Direct: function Direct(polygonVertexIndex, polygonIndex, vertexIndex, infoObject) {

        var from = polygonVertexIndex * infoObject.dataSize;
        var to = polygonVertexIndex * infoObject.dataSize + infoObject.dataSize;

        return slice(dataArray, infoObject.buffer, from, to);
      },

      IndexToDirect: function IndexToDirect(polygonVertexIndex, polygonIndex, vertexIndex, infoObject) {

        var index = infoObject.indices[polygonVertexIndex];
        var from = index * infoObject.dataSize;
        var to = index * infoObject.dataSize + infoObject.dataSize;

        return slice(dataArray, infoObject.buffer, from, to);
      }

    },

    ByPolygon: {

      Direct: function Direct(polygonVertexIndex, polygonIndex, vertexIndex, infoObject) {

        var from = polygonIndex * infoObject.dataSize;
        var to = polygonIndex * infoObject.dataSize + infoObject.dataSize;

        return slice(dataArray, infoObject.buffer, from, to);
      },

      IndexToDirect: function IndexToDirect(polygonVertexIndex, polygonIndex, vertexIndex, infoObject) {

        var index = infoObject.indices[polygonIndex];
        var from = index * infoObject.dataSize;
        var to = index * infoObject.dataSize + infoObject.dataSize;

        return slice(dataArray, infoObject.buffer, from, to);
      }

    },

    ByVertice: {

      Direct: function Direct(polygonVertexIndex, polygonIndex, vertexIndex, infoObject) {

        var from = vertexIndex * infoObject.dataSize;
        var to = vertexIndex * infoObject.dataSize + infoObject.dataSize;

        return slice(dataArray, infoObject.buffer, from, to);
      }

    },

    AllSame: {

      IndexToDirect: function IndexToDirect(polygonVertexIndex, polygonIndex, vertexIndex, infoObject) {

        var from = infoObject.indices[0] * infoObject.dataSize;
        var to = infoObject.indices[0] * infoObject.dataSize + infoObject.dataSize;

        return slice(dataArray, infoObject.buffer, from, to);
      }

    }

  };

  function getData(polygonVertexIndex, polygonIndex, vertexIndex, infoObject) {

    return GetData[infoObject.mappingType][infoObject.referenceType](polygonVertexIndex, polygonIndex, vertexIndex, infoObject);
  }

  // Generate a NurbGeometry from a node in FBXTree.Objects.Geometry
  function parseNurbsGeometry(geometryNode) {

    if (THREE.NURBSCurve === undefined) {

      console.error('THREE.FBXLoader: The loader relies on THREE.NURBSCurve for any nurbs present in the model. Nurbs will show up as empty geometry.');
      return new THREE.BufferGeometry();
    }

    var order = parseInt(geometryNode.Order);

    if (isNaN(order)) {

      console.error('THREE.FBXLoader: Invalid Order %s given for geometry ID: %s', geometryNode.Order, geometryNode.id);
      return new THREE.BufferGeometry();
    }

    var degree = order - 1;

    var knots = geometryNode.KnotVector.a;
    var controlPoints = [];
    var pointsValues = geometryNode.Points.a;

    for (var i = 0, l = pointsValues.length; i < l; i += 4) {

      controlPoints.push(new THREE.Vector4().fromArray(pointsValues, i));
    }

    var startKnot, endKnot;

    if (geometryNode.Form === 'Closed') {

      controlPoints.push(controlPoints[0]);
    } else if (geometryNode.Form === 'Periodic') {

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

  // create the main THREE.Group() to be returned by the loader
  function parseScene(FBXTree, connections, skeletons, geometryMap, materialMap) {

    var sceneGraph = new THREE.Group();

    var modelMap = parseModels(FBXTree, skeletons, geometryMap, materialMap, connections);

    var modelNodes = FBXTree.Objects.Model;

    modelMap.forEach(function (model) {

      var modelNode = modelNodes[model.ID];
      setLookAtProperties(FBXTree, model, modelNode, connections, sceneGraph);

      var parentConnections = connections.get(model.ID).parents;

      parentConnections.forEach(function (connection) {

        var parent = modelMap.get(connection.ID);
        if (parent !== undefined) parent.add(model);
      });

      if (model.parent === null) {

        sceneGraph.add(model);
      }
    });

    bindSkeleton(FBXTree, skeletons, geometryMap, modelMap, connections);

    addAnimations(FBXTree, connections, sceneGraph);

    createAmbientLight(FBXTree, sceneGraph);

    return sceneGraph;
  }

  // parse nodes in FBXTree.Objects.Model
  function parseModels(FBXTree, skeletons, geometryMap, materialMap, connections) {

    var modelMap = new Map();
    var modelNodes = FBXTree.Objects.Model;

    for (var nodeID in modelNodes) {

      var id = parseInt(nodeID);
      var node = modelNodes[nodeID];
      var relationships = connections.get(id);

      var model = buildSkeleton(relationships, skeletons, id, node.attrName);

      if (!model) {

        switch (node.attrType) {

          case 'Camera':
            model = createCamera(FBXTree, relationships);
            break;
          case 'Light':
            model = createLight(FBXTree, relationships);
            break;
          case 'Mesh':
            model = createMesh(FBXTree, relationships, geometryMap, materialMap);
            break;
          case 'NurbsCurve':
            model = createCurve(relationships, geometryMap);
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

      setModelTransforms(FBXTree, model, node);
      modelMap.set(id, model);
    }

    return modelMap;
  }

  function buildSkeleton(relationships, skeletons, id, name) {

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
  }

  // create a THREE.PerspectiveCamera or THREE.OrthographicCamera
  function createCamera(FBXTree, relationships) {

    var model;
    var cameraAttribute;

    relationships.children.forEach(function (child) {

      var attr = FBXTree.Objects.NodeAttribute[child.ID];

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
  }

  // Create a THREE.DirectionalLight, THREE.PointLight or THREE.SpotLight
  function createLight(FBXTree, relationships) {

    var model;
    var lightAttribute;

    relationships.children.forEach(function (child) {

      var attr = FBXTree.Objects.NodeAttribute[child.ID];

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

          distance = lightAttribute.FarAttenuationEnd.value / 1000;
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
  }

  function createMesh(FBXTree, relationships, geometryMap, materialMap) {

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
  }

  function createCurve(relationships, geometryMap) {

    var geometry = relationships.children.reduce(function (geo, child) {

      if (geometryMap.has(child.ID)) geo = geometryMap.get(child.ID);

      return geo;
    }, null);

    // FBX does not list materials for Nurbs lines, so we'll just put our own in here.
    var material = new THREE.LineBasicMaterial({ color: 0x3300ff, linewidth: 1 });
    return new THREE.Line(geometry, material);
  }

  // Parse ambient color in FBXTree.GlobalSettings - if it's not set to black (default), create an ambient light
  function createAmbientLight(FBXTree, sceneGraph) {

    if ('GlobalSettings' in FBXTree && 'AmbientColor' in FBXTree.GlobalSettings) {

      var ambientColor = FBXTree.GlobalSettings.AmbientColor.value;
      var r = ambientColor[0];
      var g = ambientColor[1];
      var b = ambientColor[2];

      if (r !== 0 || g !== 0 || b !== 0) {

        var color = new THREE.Color(r, g, b);
        sceneGraph.add(new THREE.AmbientLight(color, 1));
      }
    }
  }

  function setLookAtProperties(FBXTree, model, modelNode, connections, sceneGraph) {

    if ('LookAtProperty' in modelNode) {

      var children = connections.get(model.ID).children;

      children.forEach(function (child) {

        if (child.relationship === 'LookAtProperty') {

          var lookAtTarget = FBXTree.Objects.Model[child.ID];

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
  }

  // parse the model node for transform details and apply them to the model
  function setModelTransforms(FBXTree, model, modelNode) {

    // http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_class_fbx_euler_html
    if ('RotationOrder' in modelNode) {

      var enums = ['XYZ', // default
      'XZY', 'YZX', 'ZXY', 'YXZ', 'ZYX', 'SphericXYZ'];

      var value = parseInt(modelNode.RotationOrder.value, 10);

      if (value > 0 && value < 6) {

        // model.rotation.order = enums[ value ];

        // Note: Euler order other than XYZ is currently not supported, so just display a warning for now
        console.warn('THREE.FBXLoader: unsupported Euler Order: %s. Currently only XYZ order is supported. Animations and rotations may be incorrect.', enums[value]);
      } else if (value === 6) {

        console.warn('THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect.');
      }
    }

    if ('Lcl_Translation' in modelNode) {

      model.position.fromArray(modelNode.Lcl_Translation.value);
    }

    if ('Lcl_Rotation' in modelNode) {

      var rotation = modelNode.Lcl_Rotation.value.map(THREE.Math.degToRad);
      rotation.push('ZYX');
      model.rotation.fromArray(rotation);
    }

    if ('Lcl_Scaling' in modelNode) {

      model.scale.fromArray(modelNode.Lcl_Scaling.value);
    }

    if ('PreRotation' in modelNode) {

      var array = modelNode.PreRotation.value.map(THREE.Math.degToRad);
      array[3] = 'ZYX';

      var preRotations = new THREE.Euler().fromArray(array);

      preRotations = new THREE.Quaternion().setFromEuler(preRotations);
      var currentRotation = new THREE.Quaternion().setFromEuler(model.rotation);
      preRotations.multiply(currentRotation);
      model.rotation.setFromQuaternion(preRotations, 'ZYX');
    }
  }

  function bindSkeleton(FBXTree, skeletons, geometryMap, modelMap, connections) {

    var bindMatrices = parsePoseNodes(FBXTree);

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
  }

  function parsePoseNodes(FBXTree) {

    var bindMatrices = {};

    if ('Pose' in FBXTree.Objects) {

      var BindPoseNode = FBXTree.Objects.Pose;

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
  }

  function parseAnimations(FBXTree, connections) {

    // since the actual transformation data is stored in FBXTree.Objects.AnimationCurve,
    // if this is undefined we can safely assume there are no animations
    if (FBXTree.Objects.AnimationCurve === undefined) return undefined;

    var curveNodesMap = parseAnimationCurveNodes(FBXTree);

    parseAnimationCurves(FBXTree, connections, curveNodesMap);

    var layersMap = parseAnimationLayers(FBXTree, connections, curveNodesMap);
    var rawClips = parseAnimStacks(FBXTree, connections, layersMap);

    return rawClips;
  }

  // parse nodes in FBXTree.Objects.AnimationCurveNode
  // each AnimationCurveNode holds data for an animation transform for a model (e.g. left arm rotation )
  // and is referenced by an AnimationLayer
  function parseAnimationCurveNodes(FBXTree) {

    var rawCurveNodes = FBXTree.Objects.AnimationCurveNode;

    var curveNodesMap = new Map();

    for (var nodeID in rawCurveNodes) {

      var rawCurveNode = rawCurveNodes[nodeID];

      if (rawCurveNode.attrName.match(/S|R|T/) !== null) {

        var curveNode = {

          id: rawCurveNode.id,
          attr: rawCurveNode.attrName,
          curves: {}

        };

        curveNodesMap.set(curveNode.id, curveNode);
      }
    }

    return curveNodesMap;
  }

  // parse nodes in FBXTree.Objects.AnimationCurve and connect them up to
  // previously parsed AnimationCurveNodes. Each AnimationCurve holds data for a single animated
  // axis ( e.g. times and values of x rotation)
  function parseAnimationCurves(FBXTree, connections, curveNodesMap) {

    var rawCurves = FBXTree.Objects.AnimationCurve;

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
        var axis = '';

        if (animationCurveRelationship.match(/X/)) {

          axis = 'x';
        } else if (animationCurveRelationship.match(/Y/)) {

          axis = 'y';
        } else if (animationCurveRelationship.match(/Z/)) {

          axis = 'z';
        } else {

          continue;
        }

        curveNodesMap.get(animationCurveID).curves[axis] = animationCurve;
      }
    }
  }

  // parse nodes in FBXTree.Objects.AnimationLayer. Each layers holds references
  // to various AnimationCurveNodes and is referenced by an AnimationStack node
  // note: theoretically a stack can multiple layers, however in practice there always seems to be one per stack
  function parseAnimationLayers(FBXTree, connections, curveNodesMap) {

    var rawLayers = FBXTree.Objects.AnimationLayer;

    var layersMap = new Map();

    for (var nodeID in rawLayers) {

      var layerCurveNodes = [];

      var connection = connections.get(parseInt(nodeID));

      if (connection !== undefined) {

        // all the animationCurveNodes used in the layer
        var children = connection.children;

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

                var rawModel = FBXTree.Objects.Model[modelID.toString()];

                var node = {

                  modelName: THREE.PropertyBinding.sanitizeNodeName(rawModel.attrName),
                  initialPosition: [0, 0, 0],
                  initialRotation: [0, 0, 0],
                  initialScale: [1, 1, 1]

                };

                if ('Lcl_Translation' in rawModel) node.initialPosition = rawModel.Lcl_Translation.value;

                if ('Lcl_Rotation' in rawModel) node.initialRotation = rawModel.Lcl_Rotation.value;

                if ('Lcl_Scaling' in rawModel) node.initialScale = rawModel.Lcl_Scaling.value;

                // if the animated model is pre rotated, we'll have to apply the pre rotations to every
                // animation value as well
                if ('PreRotation' in rawModel) node.preRotations = rawModel.PreRotation.value;

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
  }

  // parse nodes in FBXTree.Objects.AnimationStack. These are the top level node in the animation
  // hierarchy. Each Stack node will be used to create a THREE.AnimationClip
  function parseAnimStacks(FBXTree, connections, layersMap) {

    var rawStacks = FBXTree.Objects.AnimationStack;

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
  }

  // take raw animation data from parseAnimations and connect it up to the loaded models
  function addAnimations(FBXTree, connections, sceneGraph) {

    sceneGraph.animations = [];

    var rawClips = parseAnimations(FBXTree, connections);

    if (rawClips === undefined) return;

    for (var key in rawClips) {

      var rawClip = rawClips[key];

      var clip = addClip(rawClip);

      sceneGraph.animations.push(clip);
    }
  }

  function addClip(rawClip) {

    var tracks = [];

    rawClip.layer.forEach(function (rawTracks) {

      tracks = tracks.concat(generateTracks(rawTracks));
    });

    return new THREE.AnimationClip(rawClip.name, -1, tracks);
  }

  function generateTracks(rawTracks) {

    var tracks = [];

    if (rawTracks.T !== undefined && Object.keys(rawTracks.T.curves).length > 0) {

      var positionTrack = generateVectorTrack(rawTracks.modelName, rawTracks.T.curves, rawTracks.initialPosition, 'position');
      if (positionTrack !== undefined) tracks.push(positionTrack);
    }

    if (rawTracks.R !== undefined && Object.keys(rawTracks.R.curves).length > 0) {

      var rotationTrack = generateRotationTrack(rawTracks.modelName, rawTracks.R.curves, rawTracks.initialRotation, rawTracks.preRotations);
      if (rotationTrack !== undefined) tracks.push(rotationTrack);
    }

    if (rawTracks.S !== undefined && Object.keys(rawTracks.S.curves).length > 0) {

      var scaleTrack = generateVectorTrack(rawTracks.modelName, rawTracks.S.curves, rawTracks.initialScale, 'scale');
      if (scaleTrack !== undefined) tracks.push(scaleTrack);
    }

    return tracks;
  }

  function generateVectorTrack(modelName, curves, initialValue, type) {

    var times = getTimesForAllAxes(curves);
    var values = getKeyframeTrackValues(times, curves, initialValue);

    return new THREE.VectorKeyframeTrack(modelName + '.' + type, times, values);
  }

  function generateRotationTrack(modelName, curves, initialValue, preRotations) {

    if (curves.x !== undefined) curves.x.values = curves.x.values.map(THREE.Math.degToRad);
    if (curves.y !== undefined) curves.y.values = curves.y.values.map(THREE.Math.degToRad);
    if (curves.z !== undefined) curves.z.values = curves.z.values.map(THREE.Math.degToRad);

    var times = getTimesForAllAxes(curves);
    var values = getKeyframeTrackValues(times, curves, initialValue);

    if (preRotations !== undefined) {

      preRotations = preRotations.map(THREE.Math.degToRad);
      preRotations.push('ZYX');

      preRotations = new THREE.Euler().fromArray(preRotations);
      preRotations = new THREE.Quaternion().setFromEuler(preRotations);
    }

    var quaternion = new THREE.Quaternion();
    var euler = new THREE.Euler();

    var quaternionValues = [];

    for (var i = 0; i < values.length; i += 3) {

      euler.set(values[i], values[i + 1], values[i + 2], 'ZYX');

      quaternion.setFromEuler(euler);

      if (preRotations !== undefined) quaternion.premultiply(preRotations);

      quaternion.toArray(quaternionValues, i / 3 * 4);
    }

    return new THREE.QuaternionKeyframeTrack(modelName + '.quaternion', times, quaternionValues);
  }

  function getKeyframeTrackValues(times, curves, initialValue) {

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
  }

  // For all animated objects, times are defined separately for each axis
  // Here we'll combine the times into one sorted array without duplicates
  function getTimesForAllAxes(curves) {

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
  }

  // parse an FBX file in ASCII format
  function TextParser() {}

  Object.assign(TextParser.prototype, {

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
      this.allNodes = new FBXTree();
      this.nodeStack = [];
      this.currentProp = [];
      this.currentPropName = '';

      var self = this;

      var split = text.split('\n');

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

  });

  // Parse an FBX file in Binary format
  function BinaryParser() {}

  Object.assign(BinaryParser.prototype, {

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

          if (window.Zlib === undefined) {

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

  });

  function BinaryReader(buffer, littleEndian) {

    this.dv = new DataView(buffer);
    this.offset = 0;
    this.littleEndian = littleEndian !== undefined ? littleEndian : true;
  }

  Object.assign(BinaryReader.prototype, {

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

      var a = new Uint8Array(size);

      for (var i = 0; i < size; i++) {

        a[i] = this.getUint8();
      }

      var nullByte = a.indexOf(0);
      if (nullByte >= 0) a = a.slice(0, nullByte);

      return THREE.LoaderUtils.decodeText(a);
    }

  });

  // FBXTree holds a representation of the FBX data, returned by the TextParser ( FBX ASCII format)
  // and BinaryParser( FBX Binary format)
  function FBXTree() {}

  Object.assign(FBXTree.prototype, {

    add: function add(key, val) {

      this[key] = val;
    }

  });

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
})();

},{}],4:[function(require,module,exports){
"use strict";

module.exports = Object.assign(function GamepadButton() {}, {
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

	VENDOR: 16
});

},{}],5:[function(require,module,exports){
"use strict";

function GamepadButtonEvent(type, index, details) {
  this.type = type;
  this.index = index;
  this.pressed = details.pressed;
  this.value = details.value;
}

module.exports = GamepadButtonEvent;

},{}],6:[function(require,module,exports){
'use strict';

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

module.exports = THREE.PLYLoader = function (manager) {

  this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;

  this.propertyNameMapping = {};
};

THREE.PLYLoader.prototype = {

  constructor: THREE.PLYLoader,

  load: function load(url, onLoad, onProgress, onError) {

    var scope = this;

    var loader = new THREE.XHRLoader(this.manager);
    loader.setResponseType('arraybuffer');
    loader.load(url, function (text) {

      onLoad(scope.parse(text));
    }, onProgress, onError);
  },

  setPropertyNameMapping: function setPropertyNameMapping(mapping) {

    this.propertyNameMapping = mapping;
  },

  bin2str: function bin2str(buf) {

    var array_buffer = new Uint8Array(buf);
    var str = '';
    for (var i = 0; i < buf.byteLength; i++) {

      str += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian
    }

    return str;
  },

  isASCII: function isASCII(data) {

    var header = this.parseHeader(this.bin2str(data));

    return header.format === "ascii";
  },

  parse: function parse(data) {

    if (data instanceof ArrayBuffer) {

      return this.isASCII(data) ? this.parseASCII(this.bin2str(data)) : this.parseBinary(data);
    } else {

      return this.parseASCII(data);
    }
  },

  parseHeader: function parseHeader(data) {

    var patternHeader = /ply([\s\S]*)end_header\s/;
    var headerText = "";
    var headerLength = 0;
    var result = patternHeader.exec(data);
    if (result !== null) {

      headerText = result[1];
      headerLength = result[0].length;
    }

    var header = {
      comments: [],
      elements: [],
      headerLength: headerLength
    };

    var lines = headerText.split('\n');
    var currentElement = undefined;
    var lineType, lineValues;

    function make_ply_element_property(propertValues, propertyNameMapping) {

      var property = {
        type: propertValues[0]
      };

      if (property.type === 'list') {

        property.name = propertValues[3];
        property.countType = propertValues[1];
        property.itemType = propertValues[2];
      } else {

        property.name = propertValues[1];
      }

      if (property.name in propertyNameMapping) {

        property.name = propertyNameMapping[property.name];
      }

      return property;
    }

    for (var i = 0; i < lines.length; i++) {

      var line = lines[i];
      line = line.trim();
      if (line === "") {

        continue;
      }
      lineValues = line.split(/\s+/);
      lineType = lineValues.shift();
      line = lineValues.join(" ");

      switch (lineType) {

        case "format":

          header.format = lineValues[0];
          header.version = lineValues[1];

          break;

        case "comment":

          header.comments.push(line);

          break;

        case "element":

          if (!(currentElement === undefined)) {

            header.elements.push(currentElement);
          }

          currentElement = Object();
          currentElement.name = lineValues[0];
          currentElement.count = parseInt(lineValues[1]);
          currentElement.properties = [];

          break;

        case "property":

          currentElement.properties.push(make_ply_element_property(lineValues, this.propertyNameMapping));

          break;

        default:

          console.log("unhandled", lineType, lineValues);

      }
    }

    if (!(currentElement === undefined)) {

      header.elements.push(currentElement);
    }

    return header;
  },

  parseASCIINumber: function parseASCIINumber(n, type) {

    switch (type) {

      case 'char':case 'uchar':case 'short':case 'ushort':case 'int':case 'uint':
      case 'int8':case 'uint8':case 'int16':case 'uint16':case 'int32':case 'uint32':

        return parseInt(n);

      case 'float':case 'double':case 'float32':case 'float64':

        return parseFloat(n);

    }
  },

  parseASCIIElement: function parseASCIIElement(properties, line) {

    var values = line.split(/\s+/);

    var element = Object();

    for (var i = 0; i < properties.length; i++) {

      if (properties[i].type === "list") {

        var list = [];
        var n = this.parseASCIINumber(values.shift(), properties[i].countType);

        for (var j = 0; j < n; j++) {

          list.push(this.parseASCIINumber(values.shift(), properties[i].itemType));
        }

        element[properties[i].name] = list;
      } else {

        element[properties[i].name] = this.parseASCIINumber(values.shift(), properties[i].type);
      }
    }

    return element;
  },

  parseASCII: function parseASCII(data) {

    // PLY ascii format specification, as per http://en.wikipedia.org/wiki/PLY_(file_format)

    var geometry = new THREE.Geometry();

    var result;

    var header = this.parseHeader(data);

    var patternBody = /end_header\s([\s\S]*)$/;
    var body = "";
    if ((result = patternBody.exec(data)) !== null) {

      body = result[1];
    }

    var lines = body.split('\n');
    var currentElement = 0;
    var currentElementCount = 0;
    geometry.useColor = false;

    for (var i = 0; i < lines.length; i++) {

      var line = lines[i];
      line = line.trim();
      if (line === "") {

        continue;
      }

      if (currentElementCount >= header.elements[currentElement].count) {

        currentElement++;
        currentElementCount = 0;
      }

      var element = this.parseASCIIElement(header.elements[currentElement].properties, line);

      this.handleElement(geometry, header.elements[currentElement].name, element);

      currentElementCount++;
    }

    return this.postProcess(geometry);
  },

  postProcess: function postProcess(geometry) {

    if (geometry.useColor) {

      for (var i = 0; i < geometry.faces.length; i++) {

        geometry.faces[i].vertexColors = [geometry.colors[geometry.faces[i].a], geometry.colors[geometry.faces[i].b], geometry.colors[geometry.faces[i].c]];
      }

      geometry.elementsNeedUpdate = true;
    }

    geometry.computeBoundingSphere();

    return geometry;
  },

  handleElement: function handleElement(geometry, elementName, element) {

    if (elementName === "vertex") {

      geometry.vertices.push(new THREE.Vector3(element.x, element.y, element.z));

      if ('red' in element && 'green' in element && 'blue' in element) {

        geometry.useColor = true;

        var color = new THREE.Color();
        color.setRGB(element.red / 255.0, element.green / 255.0, element.blue / 255.0);
        geometry.colors.push(color);
      }
    } else if (elementName === "face") {

      // BEGIN: Edits by donmccurdy.
      var vertex_indices = element.vertex_indices || element.vertex_index;
      // END: Edits by donmccurdy.

      if (vertex_indices.length === 3) {

        geometry.faces.push(new THREE.Face3(vertex_indices[0], vertex_indices[1], vertex_indices[2]));
      } else if (vertex_indices.length === 4) {

        geometry.faces.push(new THREE.Face3(vertex_indices[0], vertex_indices[1], vertex_indices[3]), new THREE.Face3(vertex_indices[1], vertex_indices[2], vertex_indices[3]));
      }
    }
  },

  binaryRead: function binaryRead(dataview, at, type, little_endian) {

    switch (type) {

      // corespondences for non-specific length types here match rply:
      case 'int8':case 'char':
        return [dataview.getInt8(at), 1];

      case 'uint8':case 'uchar':
        return [dataview.getUint8(at), 1];

      case 'int16':case 'short':
        return [dataview.getInt16(at, little_endian), 2];

      case 'uint16':case 'ushort':
        return [dataview.getUint16(at, little_endian), 2];

      case 'int32':case 'int':
        return [dataview.getInt32(at, little_endian), 4];

      case 'uint32':case 'uint':
        return [dataview.getUint32(at, little_endian), 4];

      case 'float32':case 'float':
        return [dataview.getFloat32(at, little_endian), 4];

      case 'float64':case 'double':
        return [dataview.getFloat64(at, little_endian), 8];

    }
  },

  binaryReadElement: function binaryReadElement(dataview, at, properties, little_endian) {

    var element = Object();
    var result,
        read = 0;

    for (var i = 0; i < properties.length; i++) {

      if (properties[i].type === "list") {

        var list = [];

        result = this.binaryRead(dataview, at + read, properties[i].countType, little_endian);
        var n = result[0];
        read += result[1];

        for (var j = 0; j < n; j++) {

          result = this.binaryRead(dataview, at + read, properties[i].itemType, little_endian);
          list.push(result[0]);
          read += result[1];
        }

        element[properties[i].name] = list;
      } else {

        result = this.binaryRead(dataview, at + read, properties[i].type, little_endian);
        element[properties[i].name] = result[0];
        read += result[1];
      }
    }

    return [element, read];
  },

  parseBinary: function parseBinary(data) {

    var geometry = new THREE.Geometry();

    var header = this.parseHeader(this.bin2str(data));
    var little_endian = header.format === "binary_little_endian";
    var body = new DataView(data, header.headerLength);
    var result,
        loc = 0;

    for (var currentElement = 0; currentElement < header.elements.length; currentElement++) {

      for (var currentElementCount = 0; currentElementCount < header.elements[currentElement].count; currentElementCount++) {

        result = this.binaryReadElement(body, loc, header.elements[currentElement].properties, little_endian);
        loc += result[1];
        var element = result[0];

        this.handleElement(geometry, header.elements[currentElement].name, element);
      }
    }

    return this.postProcess(geometry);
  }

};

},{}],7:[function(require,module,exports){
"use strict";

module.exports = {
  "size": 5,
  "cellSize": 10,
  "extrudeSettings": {
    "amount": 1,
    "bevelEnabled": true,
    "bevelSegments": 1,
    "steps": 1,
    "bevelSize": 0.5,
    "bevelThickness": 0.5
  },
  "autogenerated": true,
  "cells": [{
    "q": -1,
    "r": 0,
    "s": 1,
    "h": 1,
    "walkable": true,
    "userData": {}
  }, {
    "q": 0,
    "r": -1,
    "s": 1,
    "h": 1,
    "walkable": true,
    "userData": {}
  }, {
    "q": 0,
    "r": 0,
    "s": 0,
    "h": 1,
    "walkable": true,
    "userData": {}
  }, {
    "q": 1,
    "r": -1,
    "s": 0,
    "h": 1,
    "walkable": true,
    "userData": {}
  }, {
    "q": -1,
    "r": 1,
    "s": 0,
    "h": 0,
    "walkable": true,
    "userData": {}
  }, {
    "q": 0,
    "r": 1,
    "s": -1,
    "h": 0,
    "walkable": true,
    "userData": {}
  }, {
    "q": 1,
    "r": 0,
    "s": -1,
    "h": 0,
    "walkable": true,
    "userData": {}
  }]
};

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

var vg = module.exports = { VERSION: "0.1.1", PI: Math.PI, TAU: 2 * Math.PI, DEG_TO_RAD: .0174532925, RAD_TO_DEG: 57.2957795, SQRT3: Math.sqrt(3), TILE: "tile", ENT: "entity", STR: "structure", HEX: "hex", SQR: "square", ABS: "abstract" };vg.Board = function (e, t) {
  if (!e) throw new Error("You must pass in a grid system for the board to use.");this.tiles = [], this.tileGroup = null, this.group = new THREE.Object3D(), this.grid = null, this.overlay = null, this.finder = new vg.AStarFinder(t), vg.Loader.init(), this.setGrid(e);
}, vg.Board.prototype = { setEntityOnTile: function setEntityOnTile(e, t) {
    var i = this.grid.cellToPixel(t.cell);e.position.copy(i), e.position.y += e.heightOffset || 0, e.tile && (e.tile.entity = null), e.tile = t, t.entity = e;
  }, addTile: function addTile(e) {
    var t = this.tiles.indexOf(e);-1 === t && (this.tiles.push(e), this.snapTileToGrid(e), e.position.y = 0, this.tileGroup.add(e.mesh), this.grid.add(e.cell), e.cell.tile = e);
  }, removeTile: function removeTile(e) {
    if (e) {
      var t = this.tiles.indexOf(e);this.grid.remove(e.cell), -1 !== t && this.tiles.splice(t, 1), e.dispose();
    }
  }, removeAllTiles: function removeAllTiles() {
    if (this.tileGroup) for (var e = this.tileGroup.children, t = 0; t < e.length; t++) {
      this.tileGroup.remove(e[t]);
    }
  }, getTileAtCell: function getTileAtCell(e) {
    var t = this.grid.cellToHash(e);return e.tile || ("undefined" != typeof this.grid.cells[t] ? this.grid.cells[t].tile : null);
  }, snapToGrid: function snapToGrid(e) {
    var t = this.grid.pixelToCell(e);e.copy(this.grid.cellToPixel(t));
  }, snapTileToGrid: function snapTileToGrid(e) {
    if (e.cell) e.position.copy(this.grid.cellToPixel(e.cell));else {
      var t = this.grid.pixelToCell(e.position);e.position.copy(this.grid.cellToPixel(t));
    }return e;
  }, getRandomTile: function getRandomTile() {
    var e = vg.Tools.randomInt(0, this.tiles.length - 1);return this.tiles[e];
  }, findPath: function findPath(e, t, i) {
    return this.finder.findPath(e.cell, t.cell, i, this.grid);
  }, setGrid: function setGrid(e) {
    this.group.remove(this.tileGroup), this.grid && e !== this.grid && (this.removeAllTiles(), this.tiles.forEach(function (e) {
      this.grid.remove(e.cell), e.dispose();
    }), this.grid.dispose()), this.grid = e, this.tiles = [], this.tileGroup = new THREE.Object3D(), this.group.add(this.tileGroup);
  }, generateOverlay: function generateOverlay(e) {
    var t = new THREE.LineBasicMaterial({ color: 0, opacity: .3 });this.overlay && this.group.remove(this.overlay), this.overlay = new THREE.Object3D(), this.grid.generateOverlay(e, this.overlay, t), this.group.add(this.overlay);
  }, generateTilemap: function generateTilemap(e) {
    this.reset();var t = this.grid.generateTiles(e);this.tiles = t, this.tileGroup = new THREE.Object3D();for (var i = 0; i < t.length; i++) {
      this.tileGroup.add(t[i].mesh);
    }this.group.add(this.tileGroup);
  }, reset: function reset() {
    this.removeAllTiles(), this.tileGroup && this.group.remove(this.tileGroup);
  } }, vg.Board.prototype.constructor = vg.Board, vg.Cell = function (e, t, i, s) {
  this.q = e || 0, this.r = t || 0, this.s = i || 0, this.h = s || 1, this.tile = null, this.userData = {}, this.walkable = !0, this._calcCost = 0, this._priority = 0, this._visited = !1, this._parent = null, this.uniqueID = vg.LinkedList.generateID();
}, vg.Cell.prototype = { set: function set(e, t, i) {
    return this.q = e, this.r = t, this.s = i, this;
  }, copy: function copy(e) {
    return this.q = e.q, this.r = e.r, this.s = e.s, this.h = e.h, this.tile = e.tile || null, this.userData = e.userData || {}, this.walkable = e.walkable, this;
  }, add: function add(e) {
    return this.q += e.q, this.r += e.r, this.s += e.s, this;
  }, equals: function equals(e) {
    return this.q === e.q && this.r === e.r && this.s === e.s;
  } }, vg.Cell.prototype.constructor = vg.Cell, vg.HexGrid = function (e) {
  e = e || {}, this.type = vg.HEX, this.size = 5, this.cellSize = "undefined" == typeof e.cellSize ? 10 : e.cellSize, this.cells = {}, this.numCells = 0, this.extrudeSettings = null, this.autogenerated = !1;var t,
      i = [];for (t = 0; 6 > t; t++) {
    i.push(this._createVertex(t));
  }for (this.cellShape = new THREE.Shape(), this.cellShape.moveTo(i[0].x, i[0].y), t = 1; 6 > t; t++) {
    this.cellShape.lineTo(i[t].x, i[t].y);
  }this.cellShape.lineTo(i[0].x, i[0].y), this.cellShape.autoClose = !0, this.cellGeo = new THREE.Geometry(), this.cellGeo.vertices = i, this.cellGeo.verticesNeedUpdate = !0, this.cellShapeGeo = new THREE.ShapeGeometry(this.cellShape), this._cellWidth = 2 * this.cellSize, this._cellLength = .5 * vg.SQRT3 * this._cellWidth, this._hashDelimeter = ".", this._directions = [new vg.Cell(1, -1, 0), new vg.Cell(1, 0, -1), new vg.Cell(0, 1, -1), new vg.Cell(-1, 1, 0), new vg.Cell(-1, 0, 1), new vg.Cell(0, -1, 1)], this._diagonals = [new vg.Cell(2, -1, -1), new vg.Cell(1, 1, -2), new vg.Cell(-1, 2, -1), new vg.Cell(-2, 1, 1), new vg.Cell(-1, -1, 2), new vg.Cell(1, -2, 1)], this._list = [], this._vec3 = new THREE.Vector3(), this._cel = new vg.Cell(), this._conversionVec = new THREE.Vector3(), this._geoCache = [], this._matCache = [];
}, vg.HexGrid.TWO_THIRDS = 2 / 3, vg.HexGrid.prototype = { cellToPixel: function cellToPixel(e) {
    return this._vec3.x = e.q * this._cellWidth * .75, this._vec3.y = e.h, this._vec3.z = -((e.s - e.r) * this._cellLength * .5), this._vec3;
  }, pixelToCell: function pixelToCell(e) {
    var t = e.x * (vg.HexGrid.TWO_THIRDS / this.cellSize),
        i = (-e.x / 3 + vg.SQRT3 / 3 * e.z) / this.cellSize;return this._cel.set(t, i, -t - i), this._cubeRound(this._cel);
  }, getCellAt: function getCellAt(e) {
    var t = e.x * (vg.HexGrid.TWO_THIRDS / this.cellSize),
        i = (-e.x / 3 + vg.SQRT3 / 3 * e.z) / this.cellSize;return this._cel.set(t, i, -t - i), this._cubeRound(this._cel), this.cells[this.cellToHash(this._cel)];
  }, getNeighbors: function getNeighbors(e, t, i) {
    var s,
        n,
        l = this._directions.length;for (this._list.length = 0, s = 0; l > s; s++) {
      this._cel.copy(e), this._cel.add(this._directions[s]), n = this.cells[this.cellToHash(this._cel)], !n || i && !i(e, n) || this._list.push(n);
    }if (t) for (s = 0; l > s; s++) {
      this._cel.copy(e), this._cel.add(this._diagonals[s]), n = this.cells[this.cellToHash(this._cel)], !n || i && !i(e, n) || this._list.push(n);
    }return this._list;
  }, getRandomCell: function getRandomCell() {
    var e,
        t = 0,
        i = vg.Tools.randomInt(0, this.numCells);for (e in this.cells) {
      if (t === i) return this.cells[e];t++;
    }return this.cells[e];
  }, cellToHash: function cellToHash(e) {
    return e.q + this._hashDelimeter + e.r + this._hashDelimeter + e.s;
  }, distance: function distance(e, t) {
    var i = Math.max(Math.abs(e.q - t.q), Math.abs(e.r - t.r), Math.abs(e.s - t.s));return i += t.h - e.h;
  }, clearPath: function clearPath() {
    var e, t;for (e in this.cells) {
      t = this.cells[e], t._calcCost = 0, t._priority = 0, t._parent = null, t._visited = !1;
    }
  }, traverse: function traverse(e) {
    var t;for (t in this.cells) {
      e(this.cells[t]);
    }
  }, generateTile: function generateTile(e, t, i) {
    var s = Math.abs(e.h);1 > s && (s = 1);var n = this._geoCache[s];n || (this.extrudeSettings.amount = s, n = new THREE.ExtrudeGeometry(this.cellShape, this.extrudeSettings), this._geoCache[s] = n);var l = new vg.Tile({ size: this.cellSize, scale: t, cell: e, geometry: n, material: i });return e.tile = l, l;
  }, generateTiles: function generateTiles(e) {
    e = e || {};var t = [],
        i = { tileScale: .95, cellSize: this.cellSize, material: null, extrudeSettings: { amount: 1, bevelEnabled: !0, bevelSegments: 1, steps: 1, bevelSize: .5, bevelThickness: .5 } };i = vg.Tools.merge(i, e), this.cellSize = i.cellSize, this._cellWidth = 2 * this.cellSize, this._cellLength = .5 * vg.SQRT3 * this._cellWidth, this.autogenerated = !0, this.extrudeSettings = i.extrudeSettings;var s, n, l;for (s in this.cells) {
      l = this.cells[s], n = this.generateTile(l, i.tileScale, i.material), n.position.copy(this.cellToPixel(l)), n.position.y = 0, t.push(n);
    }return t;
  }, generateTilePoly: function generateTilePoly(e) {
    e || (e = new THREE.MeshBasicMaterial({ color: 2405631 }));var t = new THREE.Mesh(this.cellShapeGeo, e);return this._vec3.set(1, 0, 0), t.rotateOnAxis(this._vec3, vg.PI / 2), t;
  }, generate: function generate(e) {
    e = e || {}, this.size = "undefined" == typeof e.size ? this.size : e.size;var t, i, s, n;for (t = -this.size; t < this.size + 1; t++) {
      for (i = -this.size; i < this.size + 1; i++) {
        s = -t - i, Math.abs(t) <= this.size && Math.abs(i) <= this.size && Math.abs(s) <= this.size && (n = new vg.Cell(t, i, s), this.add(n));
      }
    }
  }, generateOverlay: function generateOverlay(e, t, i) {
    var s,
        n,
        l,
        r = this.cellShape.createPointsGeometry();for (s = -e; e + 1 > s; s++) {
      for (n = -e; e + 1 > n; n++) {
        if (l = -s - n, Math.abs(s) <= e && Math.abs(n) <= e && Math.abs(l) <= e) {
          this._cel.set(s, n, l);var h = new THREE.Line(r, i);h.position.copy(this.cellToPixel(this._cel)), h.rotation.x = 90 * vg.DEG_TO_RAD, t.add(h);
        }
      }
    }
  }, add: function add(e) {
    var t = this.cellToHash(e);if (!this.cells[t]) return this.cells[t] = e, this.numCells++, e;
  }, remove: function remove(e) {
    var t = this.cellToHash(e);this.cells[t] && (delete this.cells[t], this.numCells--);
  }, dispose: function dispose() {
    this.cells = null, this.numCells = 0, this.cellShape = null, this.cellGeo.dispose(), this.cellGeo = null, this.cellShapeGeo.dispose(), this.cellShapeGeo = null, this._list = null, this._vec3 = null, this._conversionVec = null, this._geoCache = null, this._matCache = null;
  }, load: function load(e, t, i) {
    var s = this;vg.Tools.getJSON({ url: e, callback: function callback(e) {
        s.fromJSON(e), t.call(i || null, e);
      }, cache: !1, scope: s });
  }, fromJSON: function fromJSON(e) {
    var t,
        i,
        s = e.cells;for (this.cells = {}, this.numCells = 0, this.size = e.size, this.cellSize = e.cellSize, this._cellWidth = 2 * this.cellSize, this._cellLength = .5 * vg.SQRT3 * this._cellWidth, this.extrudeSettings = e.extrudeSettings, this.autogenerated = e.autogenerated, t = 0; t < s.length; t++) {
      i = new vg.Cell(), i.copy(s[t]), this.add(i);
    }
  }, toJSON: function toJSON() {
    var e,
        t,
        i = { size: this.size, cellSize: this.cellSize, extrudeSettings: this.extrudeSettings, autogenerated: this.autogenerated },
        s = [];for (t in this.cells) {
      e = this.cells[t], s.push({ q: e.q, r: e.r, s: e.s, h: e.h, walkable: e.walkable, userData: e.userData });
    }return i.cells = s, i;
  }, _createVertex: function _createVertex(e) {
    var t = vg.TAU / 6 * e;return new THREE.Vector3(this.cellSize * Math.cos(t), this.cellSize * Math.sin(t), 0);
  }, _cubeRound: function _cubeRound(e) {
    var t = Math.round(e.q),
        i = Math.round(e.r),
        s = Math.round(e.s),
        n = Math.abs(t - e.q),
        l = Math.abs(i - e.r),
        r = Math.abs(s - e.s);return n > l && n > r ? t = -i - s : l > r ? i = -t - s : s = -t - i, this._cel.set(t, i, s);
  } }, vg.HexGrid.prototype.constructor = vg.HexGrid, vg.SqrGrid = function (e) {
  e = e || {}, this.type = vg.SQR, this.size = 5, this.cellSize = "undefined" == typeof e.cellSize ? 10 : e.cellSize, this.cells = {}, this.numCells = 0, this.extrudeSettings = null, this.autogenerated = !1;var t = [];t.push(new THREE.Vector3()), t.push(new THREE.Vector3(-this.cellSize, this.cellSize)), t.push(new THREE.Vector3(this.cellSize, this.cellSize)), t.push(new THREE.Vector3(this.cellSize, -this.cellSize)), this.cellShape = new THREE.Shape(), this.cellShape.moveTo(-this.cellSize, -this.cellSize), this.cellShape.lineTo(-this.cellSize, this.cellSize), this.cellShape.lineTo(this.cellSize, this.cellSize), this.cellShape.lineTo(this.cellSize, -this.cellSize), this.cellShape.lineTo(-this.cellSize, -this.cellSize), this.cellGeo = new THREE.Geometry(), this.cellGeo.vertices = t, this.cellGeo.verticesNeedUpdate = !0, this.cellShapeGeo = new THREE.ShapeGeometry(this.cellShape), this._fullCellSize = 2 * this.cellSize, this._hashDelimeter = ".", this._directions = [new vg.Cell(1, 0, 0), new vg.Cell(0, -1, 0), new vg.Cell(-1, 0, 0), new vg.Cell(0, 1, 0)], this._diagonals = [new vg.Cell(-1, -1, 0), new vg.Cell(-1, 1, 0), new vg.Cell(1, 1, 0), new vg.Cell(1, -1, 0)], this._list = [], this._vec3 = new THREE.Vector3(), this._cel = new vg.Cell(), this._conversionVec = new THREE.Vector3(), this._geoCache = [], this._matCache = [];
}, vg.SqrGrid.prototype = { cellToPixel: function cellToPixel(e) {
    return this._vec3.x = e.q * this._fullCellSize, this._vec3.y = e.h, this._vec3.z = e.r * this._fullCellSize, this._vec3;
  }, pixelToCell: function pixelToCell(e) {
    var t = Math.round(e.x / this._fullCellSize),
        i = Math.round(e.z / this._fullCellSize);return this._cel.set(t, i, 0);
  }, getCellAt: function getCellAt(e) {
    var t = Math.round(e.x / this._fullCellSize),
        i = Math.round(e.z / this._fullCellSize);return this._cel.set(t, i), this.cells[this.cellToHash(this._cel)];
  }, getNeighbors: function getNeighbors(e, t, i) {
    var s,
        n,
        l = this._directions.length;for (this._list.length = 0, s = 0; l > s; s++) {
      this._cel.copy(e), this._cel.add(this._directions[s]), n = this.cells[this.cellToHash(this._cel)], !n || i && !i(e, n) || this._list.push(n);
    }if (t) for (s = 0; l > s; s++) {
      this._cel.copy(e), this._cel.add(this._diagonals[s]), n = this.cells[this.cellToHash(this._cel)], !n || i && !i(e, n) || this._list.push(n);
    }return this._list;
  }, getRandomCell: function getRandomCell() {
    var e,
        t = 0,
        i = vg.Tools.randomInt(0, this.numCells);for (e in this.cells) {
      if (t === i) return this.cells[e];t++;
    }return this.cells[e];
  }, cellToHash: function cellToHash(e) {
    return e.q + this._hashDelimeter + e.r;
  }, distance: function distance(e, t) {
    var i = Math.max(Math.abs(e.q - t.q), Math.abs(e.r - t.r));return i += t.h - e.h;
  }, clearPath: function clearPath() {
    var e, t;for (e in this.cells) {
      t = this.cells[e], t._calcCost = 0, t._priority = 0, t._parent = null, t._visited = !1;
    }
  }, traverse: function traverse(e) {
    var t;for (t in this.cells) {
      e(this.cells[t]);
    }
  }, generateTile: function generateTile(e, t, i) {
    var s = Math.abs(e.h);1 > s && (s = 1);var n = this._geoCache[s];n || (this.extrudeSettings.amount = s, n = new THREE.ExtrudeGeometry(this.cellShape, this.extrudeSettings), this._geoCache[s] = n);var l = new vg.Tile({ size: this.cellSize, scale: t, cell: e, geometry: n, material: i });return e.tile = l, l;
  }, generateTiles: function generateTiles(e) {
    e = e || {};var t = [],
        i = { tileScale: .95, cellSize: this.cellSize, material: null, extrudeSettings: { amount: 1, bevelEnabled: !0, bevelSegments: 1, steps: 1, bevelSize: .5, bevelThickness: .5 } };i = vg.Tools.merge(i, e), this.cellSize = i.cellSize, this._fullCellSize = 2 * this.cellSize, this.autogenerated = !0, this.extrudeSettings = i.extrudeSettings;var s, n, l;for (s in this.cells) {
      l = this.cells[s], n = this.generateTile(l, i.tileScale, i.material), n.position.copy(this.cellToPixel(l)), n.position.y = 0, t.push(n);
    }return t;
  }, generateTilePoly: function generateTilePoly(e) {
    e || (e = new THREE.MeshBasicMaterial({ color: 2405631 }));var t = new THREE.Mesh(this.cellShapeGeo, e);return this._vec3.set(1, 0, 0), t.rotateOnAxis(this._vec3, vg.PI / 2), t;
  }, generate: function generate(e) {
    e = e || {}, this.size = "undefined" == typeof e.size ? this.size : e.size;var t,
        i,
        s,
        n = Math.ceil(this.size / 2);for (t = -n; n > t; t++) {
      for (i = -n; n > i; i++) {
        s = new vg.Cell(t, i + 1), this.add(s);
      }
    }
  }, generateOverlay: function generateOverlay(e, t, i) {
    var s,
        n,
        l = Math.ceil(e / 2);for (s = -l; l > s; s++) {
      for (n = -l; l > n; n++) {
        this._cel.set(s, n);var r = new THREE.Line(this.cellGeo, i);r.position.copy(this.cellToPixel(this._cel)), r.rotation.x = 90 * vg.DEG_TO_RAD, t.add(r);
      }
    }
  }, add: function add(e) {
    var t = this.cellToHash(e);if (!this.cells[t]) return this.cells[t] = e, this.numCells++, e;
  }, remove: function remove(e) {
    var t = this.cellToHash(e);this.cells[t] && (delete this.cells[t], this.numCells--);
  }, dispose: function dispose() {
    this.cells = null, this.numCells = 0, this.cellShape = null, this.cellGeo.dispose(), this.cellGeo = null, this.cellShapeGeo.dispose(), this.cellShapeGeo = null, this._list = null, this._vec3 = null, this._conversionVec = null, this._geoCache = null, this._matCache = null;
  }, load: function load(e, t, i) {
    vg.Tools.getJSON({ url: e, callback: function callback(e) {
        this.fromJSON(e), t.call(i || null, e);
      }, cache: !1, scope: this });
  }, fromJSON: function fromJSON(e) {
    var t,
        i,
        s = e.cells;for (this.cells = {}, this.numCells = 0, this.size = e.size, this.cellSize = e.cellSize, this._fullCellSize = 2 * this.cellSize, this.extrudeSettings = e.extrudeSettings, this.autogenerated = e.autogenerated, t = 0; t < s.length; t++) {
      i = new vg.Cell(), i.copy(s[t]), this.add(i);
    }
  }, toJSON: function toJSON() {
    var e,
        t,
        i = { size: this.size, cellSize: this.cellSize, extrudeSettings: this.extrudeSettings, autogenerated: this.autogenerated },
        s = [];for (t in this.cells) {
      e = this.cells[t], s.push({ q: e.q, r: e.r, s: e.s, h: e.h, walkable: e.walkable, userData: e.userData });
    }return i.cells = s, i;
  } }, vg.SqrGrid.prototype.constructor = vg.SqrGrid, vg.Tile = function (e) {
  e = e || {};var t = { cell: null, geometry: null, material: null };if (t = vg.Tools.merge(t, e), !t.cell || !t.geometry) throw new Error("Missing vg.Tile configuration");this.cell = t.cell, this.cell.tile && this.cell.tile !== this && this.cell.tile.dispose(), this.cell.tile = this, this.uniqueID = vg.Tools.generateID(), this.geometry = t.geometry, this.material = t.material, this.material || (this.material = new THREE.MeshPhongMaterial({ color: vg.Tools.randomizeRGB("30, 30, 30", 13) })), this.objectType = vg.TILE, this.entity = null, this.userData = {}, this.selected = !1, this.highlight = "0x0084cc", this.mesh = new THREE.Mesh(this.geometry, this.material), this.mesh.userData.structure = this, this.position = this.mesh.position, this.rotation = this.mesh.rotation, this.rotation.x = -90 * vg.DEG_TO_RAD, this.mesh.scale.set(t.scale, t.scale, 1), this.material.emissive ? this._emissive = this.material.emissive.getHex() : this._emissive = null;
}, vg.Tile.prototype = { select: function select() {
    return this.material.emissive && this.material.emissive.setHex(this.highlight), this.selected = !0, this;
  }, deselect: function deselect() {
    return null !== this._emissive && this.material.emissive && this.material.emissive.setHex(this._emissive), this.selected = !1, this;
  }, toggle: function toggle() {
    return this.selected ? this.deselect() : this.select(), this;
  }, dispose: function dispose() {
    this.cell && this.cell.tile && (this.cell.tile = null), this.cell = null, this.position = null, this.rotation = null, this.mesh.parent && this.mesh.parent.remove(this.mesh), this.mesh.userData.structure = null, this.mesh = null, this.material = null, this.userData = null, this.entity = null, this.geometry = null, this._emissive = null;
  } }, vg.Tile.prototype.constructor = vg.Tile, function () {
  var e = function e() {
    this.obj = null, this.next = null, this.prev = null, this.free = !0;
  },
      t = function t() {
    this.first = null, this.last = null, this.length = 0, this.objToNodeMap = {}, this.uniqueID = Date.now() + "" + Math.floor(1e3 * Math.random()), this.sortArray = [];
  };t.generateID = function () {
    return Math.random().toString(36).slice(2) + Date.now();
  }, t.prototype = { getNode: function getNode(e) {
      return this.objToNodeMap[e.uniqueID];
    }, addNode: function addNode(i) {
      var s = new e();if (!i.uniqueID) try {
        i.uniqueID = t.generateID();
      } catch (n) {
        return console.error("[LinkedList.addNode] obj passed is immutable: cannot attach necessary identifier"), null;
      }return s.obj = i, s.free = !1, this.objToNodeMap[i.uniqueID] = s, s;
    }, swapObjects: function swapObjects(e, t) {
      this.objToNodeMap[e.obj.uniqueID] = null, this.objToNodeMap[t.uniqueID] = e, e.obj = t;
    }, add: function add(e) {
      var t = this.objToNodeMap[e.uniqueID];if (t) {
        if (t.free === !1) return;t.obj = e, t.free = !1, t.next = null, t.prev = null;
      } else t = this.addNode(e);if (this.first) {
        if (!this.last) throw new Error("[LinkedList.add] No last in the list -- that shouldn't happen here");this.last.next = t, t.prev = this.last, this.last = t, t.next = null;
      } else this.first = t, this.last = t, t.next = null, t.prev = null;this.length++, this.showDebug && this.dump("after add");
    }, has: function has(e) {
      return !!this.objToNodeMap[e.uniqueID];
    }, moveUp: function moveUp(e) {
      this.dump("before move up");var t = this.getNode(e);if (!t) throw "Oops, trying to move an object that isn't in the list";if (t.prev) {
        var i = t.prev,
            s = i.prev;t == this.last && (this.last = i);var n = t.next;s && (s.next = t), t.next = i, t.prev = i.prev, i.next = n, i.prev = t, this.first == i && (this.first = t);
      }
    }, moveDown: function moveDown(e) {
      var t = this.getNode(e);if (!t) throw "Oops, trying to move an object that isn't in the list";if (t.next) {
        var i = t.next;this.moveUp(i.obj), this.last == i && (this.last = t);
      }
    }, sort: function sort(e) {
      var t,
          i,
          s = this.sortArray,
          n = this.first;for (s.length = 0; n;) {
        s.push(n.obj), n = n.next;
      }for (this.clear(), s.sort(e), i = s.length, t = 0; i > t; t++) {
        this.add(s[t]);
      }
    }, remove: function remove(e) {
      var t = this.getNode(e);return !t || t.free ? !1 : (t.prev && (t.prev.next = t.next), t.next && (t.next.prev = t.prev), t.prev || (this.first = t.next), t.next || (this.last = t.prev), t.free = !0, t.prev = null, t.next = null, this.length--, !0);
    }, shift: function shift() {
      var e = this.first;return 0 === this.length ? null : (e.prev && (e.prev.next = e.next), e.next && (e.next.prev = e.prev), this.first = e.next, e.next || (this.last = null), e.free = !0, e.prev = null, e.next = null, this.length--, e.obj);
    }, pop: function pop() {
      var e = this.last;return 0 === this.length ? null : (e.prev && (e.prev.next = e.next), e.next && (e.next.prev = e.prev), this.last = e.prev, e.prev || (this.first = null), e.free = !0, e.prev = null, e.next = null, this.length--, e.obj);
    }, concat: function concat(e) {
      for (var t = e.first; t;) {
        this.add(t.obj), t = t.next;
      }
    }, clear: function clear() {
      for (var e = this.first; e;) {
        e.free = !0, e = e.next;
      }this.first = null, this.length = 0;
    }, dispose: function dispose() {
      for (var e = this.first; e;) {
        e.obj = null, e = e.next;
      }this.first = null, this.objToNodeMap = null;
    }, dump: function dump(e) {
      console.log("====================" + e + "=====================");for (var t = this.first; t;) {
        console.log("{" + t.obj.toString() + "} previous=" + (t.prev ? t.prev.obj : "NULL")), t = t.next();
      }console.log("==================================="), console.log("Last: {" + (this.last ? this.last.obj : "NULL") + "} First: {" + (this.first ? this.first.obj : "NULL") + "}");
    } }, t.prototype.constructor = t, vg.LinkedList = t;
}(), function () {
  var e = function e(_e, t, i, s, n) {
    this._listener = t, this.isOnce = i, this.context = s, this.signal = _e, this._priority = n || 0;
  };e.prototype = { active: !0, params: null, execute: function execute(e) {
      var t, i;return this.active && this._listener && (i = this.params ? this.params.concat(e) : e, t = this._listener.apply(this.context, i), this.isOnce && this.detach()), t;
    }, detach: function detach() {
      return this.isBound() ? this.signal.remove(this._listener, this.context) : null;
    }, isBound: function isBound() {
      return !!this.signal && !!this._listener;
    }, _destroy: function _destroy() {
      delete this.signal, delete this._listener, delete this.context;
    }, toString: function toString() {
      return "[SignalBinding isOnce:" + this.isOnce + ", isBound:" + this.isBound() + ", active:" + this.active + "]";
    } }, e.prototype.constructor = e;var t = function t() {
    this._bindings = [], this._prevParams = null;var e = this;this.dispatch = function () {
      t.prototype.dispatch.apply(e, arguments);
    };
  };t.prototype = { memorize: !1, _shouldPropagate: !0, active: !0, validateListener: function validateListener(e, t) {
      if ("function" != typeof e) throw new Error("Signal: listener is a required param of {fn}() and should be a Function.".replace("{fn}", t));
    }, _registerListener: function _registerListener(t, i, s, n) {
      var l,
          r = this._indexOfListener(t, s);if (-1 !== r) {
        if (l = this._bindings[r], l.isOnce !== i) throw new Error("You cannot add" + (i ? "" : "Once") + "() then add" + (i ? "Once" : "") + "() the same listener without removing the relationship first.");
      } else l = new e(this, t, i, s, n), this._addBinding(l);return this.memorize && this._prevParams && l.execute(this._prevParams), l;
    }, _addBinding: function _addBinding(e) {
      var t = this._bindings.length;do {
        t--;
      } while (this._bindings[t] && e._priority <= this._bindings[t]._priority);this._bindings.splice(t + 1, 0, e);
    }, _indexOfListener: function _indexOfListener(e, t) {
      for (var i, s = this._bindings.length; s--;) {
        if (i = this._bindings[s], i._listener === e && i.context === t) return s;
      }return -1;
    }, has: function has(e, t) {
      return -1 !== this._indexOfListener(e, t);
    }, add: function add(e, t, i) {
      return this.validateListener(e, "add"), this._registerListener(e, !1, t, i);
    }, addOnce: function addOnce(e, t, i) {
      return this.validateListener(e, "addOnce"), this._registerListener(e, !0, t, i);
    }, remove: function remove(e, t) {
      this.validateListener(e, "remove");var i = this._indexOfListener(e, t);return -1 !== i && (this._bindings[i]._destroy(), this._bindings.splice(i, 1)), e;
    }, removeAll: function removeAll(e) {
      "undefined" == typeof e && (e = null);for (var t = this._bindings.length; t--;) {
        e ? this._bindings[t].context === e && (this._bindings[t]._destroy(), this._bindings.splice(t, 1)) : this._bindings[t]._destroy();
      }e || (this._bindings.length = 0);
    }, getNumListeners: function getNumListeners() {
      return this._bindings.length;
    }, halt: function halt() {
      this._shouldPropagate = !1;
    }, dispatch: function dispatch() {
      if (this.active) {
        var e,
            t = Array.prototype.slice.call(arguments),
            i = this._bindings.length;if (this.memorize && (this._prevParams = t), i) {
          e = this._bindings.slice(), this._shouldPropagate = !0;do {
            i--;
          } while (e[i] && this._shouldPropagate && e[i].execute(t) !== !1);
        }
      }
    }, forget: function forget() {
      this._prevParams = null;
    }, dispose: function dispose() {
      this.removeAll(), delete this._bindings, delete this._prevParams;
    }, toString: function toString() {
      return "[Signal active:" + this.active + " numListeners:" + this.getNumListeners() + "]";
    } }, t.prototype.constructor = t, vg.Signal = t;
}(), vg.AStarFinder = function (e) {
  e = e || {};var t = { allowDiagonal: !1, heuristicFilter: null };t = vg.Tools.merge(t, e), this.allowDiagonal = t.allowDiagonal, this.heuristicFilter = t.heuristicFilter, this.list = new vg.LinkedList();
}, vg.AStarFinder.prototype = { findPath: function findPath(e, t, i, s) {
    var n, l, r, h, o, a;for (i = i || this.heuristicFilter, s.clearPath(), this.list.clear(), this.list.add(e); this.list.length > 0;) {
      if (this.list.sort(this.compare), n = this.list.shift(), n._visited = !0, n === t) return vg.PathUtil.backtrace(t);for (r = s.getNeighbors(n, this.allowDiagonal, i), o = 0, a = r.length; a > o; o++) {
        if (h = r[o], h.walkable && (l = n._calcCost + s.distance(n, h), !h._visited || l < h._calcCost)) {
          if (h._visited = !0, h._parent = n, h._calcCost = l, h._priority = l + s.distance(t, h), h === t) return vg.PathUtil.backtrace(t);this.list.add(h);
        }
      }
    }return null;
  }, compare: function compare(e, t) {
    return e._priority - t._priority;
  } }, vg.AStarFinder.prototype.constructor = vg.AStarFinder, vg.PathUtil = { backtrace: function backtrace(e) {
    for (var t = [e]; e._parent;) {
      e = e._parent, t.push(e);
    }return t.reverse();
  }, biBacktrace: function biBacktrace(e, t) {
    var i = this.backtrace(e),
        s = this.backtrace(t);return i.concat(s.reverse());
  }, pathLength: function pathLength(e) {
    var t,
        i,
        s,
        n,
        l,
        r = 0;for (t = 1; t < e.length; ++t) {
      i = e[t - 1], s = e[t], n = i[0] - s[0], l = i[1] - s[1], r += Math.sqrt(n * n + l * l);
    }return r;
  }, interpolate: function interpolate(e, t, i, s) {
    var n,
        l,
        r,
        h,
        o,
        a,
        c = Math.abs,
        u = [];for (r = c(i - e), h = c(s - t), n = i > e ? 1 : -1, l = s > t ? 1 : -1, o = r - h; e !== i || t !== s;) {
      u.push([e, t]), a = 2 * o, a > -h && (o -= h, e += n), r > a && (o += r, t += l);
    }return u;
  }, expandPath: function expandPath(e) {
    var t,
        i,
        s,
        n,
        l,
        r,
        h = [],
        o = e.length;if (2 > o) return h;for (l = 0; o - 1 > l; ++l) {
      for (t = e[l], i = e[l + 1], s = this.interpolate(t[0], t[1], i[0], i[1]), n = s.length, r = 0; n - 1 > r; ++r) {
        h.push(s[r]);
      }
    }return h.push(e[o - 1]), h;
  }, smoothenPath: function smoothenPath(e, t) {
    var i,
        s,
        n,
        l,
        r,
        h,
        o,
        a,
        c,
        u,
        d,
        g,
        p = t.length,
        v = t[0][0],
        f = t[0][1],
        m = t[p - 1][0],
        _ = t[p - 1][1];for (i = v, s = f, r = [[i, s]], o = 2; p > o; ++o) {
      for (c = t[o], n = c[0], l = c[1], u = this.interpolate(i, s, n, l), g = !1, a = 1; a < u.length; ++a) {
        if (d = u[a], !e.isWalkableAt(d[0], d[1])) {
          g = !0;break;
        }
      }g && (h = t[o - 1], r.push(h), i = h[0], s = h[1]);
    }return r.push([m, _]), r;
  }, compressPath: function compressPath(e) {
    if (e.length < 3) return e;var t,
        i,
        s,
        n,
        l,
        r,
        h = [],
        o = e[0][0],
        a = e[0][1],
        c = e[1][0],
        u = e[1][1],
        d = c - o,
        g = u - a;for (l = Math.sqrt(d * d + g * g), d /= l, g /= l, h.push([o, a]), r = 2; r < e.length; r++) {
      t = c, i = u, s = d, n = g, c = e[r][0], u = e[r][1], d = c - t, g = u - i, l = Math.sqrt(d * d + g * g), d /= l, g /= l, (d !== s || g !== n) && h.push([t, i]);
    }return h.push([c, u]), h;
  } }, vg.Loader = { manager: null, imageLoader: null, crossOrigin: !1, init: function init(e) {
    this.crossOrigin = e || !1, this.manager = new THREE.LoadingManager(function () {}, function () {}, function () {
      console.warn("Error loading images");
    }), this.imageLoader = new THREE.ImageLoader(this.manager), this.imageLoader.crossOrigin = e;
  }, loadTexture: function loadTexture(e, t, i, s) {
    var n = new THREE.Texture(null, t);return this.imageLoader.load(e, function (e) {
      n.image = e, n.needsUpdate = !0, i && i(n);
    }, null, function (e) {
      s && s(e);
    }), n.sourceFile = e, n;
  } }, vg.MouseCaster = function (e, t, i) {
  this.down = !1, this.rightDown = !1, this.pickedObject = null, this.selectedObject = null, this.allHits = null, this.active = !0, this.shift = !1, this.ctrl = !1, this.wheel = 0, this.position = new THREE.Vector3(), this.screenPosition = new THREE.Vector2(), this.signal = new vg.Signal(), this.group = e, this._camera = t, this._raycaster = new THREE.Raycaster(), this._preventDefault = !1, i = i || document, i.addEventListener("mousemove", this._onDocumentMouseMove.bind(this), !1), i.addEventListener("mousedown", this._onDocumentMouseDown.bind(this), !1), i.addEventListener("mouseup", this._onDocumentMouseUp.bind(this), !1), i.addEventListener("mousewheel", this._onMouseWheel.bind(this), !1), i.addEventListener("DOMMouseScroll", this._onMouseWheel.bind(this), !1);
}, vg.MouseCaster.OVER = "over", vg.MouseCaster.OUT = "out", vg.MouseCaster.DOWN = "down", vg.MouseCaster.UP = "up", vg.MouseCaster.CLICK = "click", vg.MouseCaster.WHEEL = "wheel", vg.MouseCaster.prototype = { update: function update() {
    if (this.active) {
      this._raycaster.setFromCamera(this.screenPosition, this._camera);var e,
          t,
          i = this._raycaster.intersectObject(this.group, !0);i.length > 0 ? (e = i[0], t = e.object.userData.structure, this.pickedObject != t && (this.pickedObject && this.signal.dispatch(vg.MouseCaster.OUT, this.pickedObject), this.pickedObject = t, this.selectedObject = null, this.signal.dispatch(vg.MouseCaster.OVER, this.pickedObject)), this.position.copy(e.point), this.screenPosition.z = e.distance) : (this.pickedObject && this.signal.dispatch(vg.MouseCaster.OUT, this.pickedObject), this.pickedObject = null, this.selectedObject = null), this.allHits = i;
    }
  }, preventDefault: function preventDefault() {
    this._preventDefault = !0;
  }, _onDocumentMouseDown: function _onDocumentMouseDown(e) {
    return e = e || window.event, e.preventDefault(), this._preventDefault ? (this._preventDefault = !1, !1) : (this.pickedObject && (this.selectedObject = this.pickedObject), this.shift = e.shiftKey, this.ctrl = e.ctrlKey, this.down = 1 === e.which, this.rightDown = 3 === e.which, void this.signal.dispatch(vg.MouseCaster.DOWN, this.pickedObject));
  }, _onDocumentMouseUp: function _onDocumentMouseUp(e) {
    return e.preventDefault(), this._preventDefault ? (this._preventDefault = !1, !1) : (this.shift = e.shiftKey, this.ctrl = e.ctrlKey, this.signal.dispatch(vg.MouseCaster.UP, this.pickedObject), this.selectedObject && this.pickedObject && this.selectedObject.uniqueID === this.pickedObject.uniqueID && this.signal.dispatch(vg.MouseCaster.CLICK, this.pickedObject), this.down = 1 === e.which ? !1 : this.down, void (this.rightDown = 3 === e.which ? !1 : this.rightDown));
  }, _onDocumentMouseMove: function _onDocumentMouseMove(e) {
    e.preventDefault(), this.screenPosition.x = e.clientX / window.innerWidth * 2 - 1, this.screenPosition.y = 2 * -(e.clientY / window.innerHeight) + 1;
  }, _onMouseWheel: function _onMouseWheel(e) {
    if (this.active) {
      e.preventDefault(), e.stopPropagation();var t = 0;void 0 !== e.wheelDelta ? t = e.wheelDelta : void 0 !== e.detail && (t = -e.detail), t > 0 ? this.wheel++ : this.wheel--, this.signal.dispatch(vg.MouseCaster.WHEEL, this.wheel);
    }
  } }, vg.MouseCaster.prototype.constructor = vg.MouseCaster, vg.Scene = function (e, t) {
  var i = { element: document.body, alpha: !0, antialias: !0, clearColor: "#fff", sortObjects: !1, fog: null, light: new THREE.DirectionalLight(16777215), lightPosition: null, cameraType: "PerspectiveCamera", cameraPosition: null, orthoZoom: 4 },
      s = { minDistance: 100, maxDistance: 1e3, zoomSpeed: 2, noZoom: !1 };if (i = vg.Tools.merge(i, e), "boolean" != typeof t && (s = vg.Tools.merge(s, t)), this.renderer = new THREE.WebGLRenderer({ alpha: i.alpha, antialias: i.antialias }), this.renderer.setClearColor(i.clearColor, 0), this.renderer.sortObjects = i.sortObjects, this.width = window.innerWidth, this.height = window.innerHeight, this.orthoZoom = i.orthoZoom, this.container = new THREE.Scene(), this.container.fog = i.fog, this.container.add(new THREE.AmbientLight(14540253)), i.lightPosition || i.light.position.set(-1, 1, -1).normalize(), this.container.add(i.light), "OrthographicCamera" === i.cameraType) {
    var n = window.innerWidth / this.orthoZoom,
        l = window.innerHeight / this.orthoZoom;this.camera = new THREE.OrthographicCamera(n / -2, n / 2, l / 2, l / -2, 1, 5e3);
  } else this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 1, 5e3);this.contolled = !!t, this.contolled && (this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement), this.controls.minDistance = s.minDistance, this.controls.maxDistance = s.maxDistance, this.controls.zoomSpeed = s.zoomSpeed, this.controls.noZoom = s.noZoom), i.cameraPosition && this.camera.position.copy(i.cameraPosition), window.addEventListener("resize", function () {
    if (this.width = window.innerWidth, this.height = window.innerHeight, "OrthographicCamera" === this.camera.type) {
      var e = this.width / this.orthoZoom,
          t = this.height / this.orthoZoom;this.camera.left = e / -2, this.camera.right = e / 2, this.camera.top = t / 2, this.camera.bottom = t / -2;
    } else this.camera.aspect = this.width / this.height;this.camera.updateProjectionMatrix(), this.renderer.setSize(this.width, this.height);
  }.bind(this), !1), this.attachTo(i.element);
}, vg.Scene.prototype = { attachTo: function attachTo(e) {
    e.style.width = this.width + "px", e.style.height = this.height + "px", this.renderer.setPixelRatio(window.devicePixelRatio), this.renderer.setSize(this.width, this.height), e.appendChild(this.renderer.domElement);
  }, add: function add(e) {
    this.container.add(e);
  }, remove: function remove(e) {
    this.container.remove(e);
  }, render: function render() {
    this.contolled && this.controls.update(), this.renderer.render(this.container, this.camera);
  }, updateOrthoZoom: function updateOrthoZoom() {
    if (this.orthoZoom <= 0) return void (this.orthoZoom = 0);var e = this.width / this.orthoZoom,
        t = this.height / this.orthoZoom;this.camera.left = e / -2, this.camera.right = e / 2, this.camera.top = t / 2, this.camera.bottom = t / -2, this.camera.updateProjectionMatrix();
  }, focusOn: function focusOn(e) {
    this.camera.lookAt(e.position);
  } }, vg.Scene.prototype.constructor = vg.Scene, vg.SelectionManager = function (e) {
  this.mouse = e, this.onSelect = new vg.Signal(), this.onDeselect = new vg.Signal(), this.selected = null, this.toggleSelection = !1, this.mouse.signal.add(this.onMouse, this);
}, vg.SelectionManager.prototype = { select: function select(e, t) {
    e && (t = t || !0, this.selected !== e && this.clearSelection(t), e.selected ? this.toggleSelection && (t && this.onDeselect.dispatch(e), e.deselect()) : e.select(), this.selected = e, t && this.onSelect.dispatch(e));
  }, clearSelection: function clearSelection(e) {
    e = e || !0, this.selected && (e && this.onDeselect.dispatch(this.selected), this.selected.deselect()), this.selected = null;
  }, onMouse: function onMouse(e, t) {
    switch (e) {case vg.MouseCaster.DOWN:
        t || this.clearSelection();break;case vg.MouseCaster.CLICK:
        this.select(t);}
  } }, vg.SelectionManager.prototype.constructor = vg.SelectionManager, vg.Tools = { clamp: function clamp(e, t, i) {
    return Math.max(t, Math.min(i, e));
  }, sign: function sign(e) {
    return e && e / Math.abs(e);
  }, random: function random(e, t) {
    return 1 === arguments.length ? Math.random() * e - .5 * e : Math.random() * (t - e) + e;
  }, randomInt: function randomInt(e, t) {
    return 1 === arguments.length ? Math.random() * e - .5 * e | 0 : Math.random() * (t - e + 1) + e | 0;
  }, normalize: function normalize(e, t, i) {
    return (e - t) / (i - t);
  }, getShortRotation: function getShortRotation(e) {
    return e %= this.TAU, e > this.PI ? e -= this.TAU : e < -this.PI && (e += this.TAU), e;
  }, generateID: function generateID() {
    return Math.random().toString(36).slice(2) + Date.now();
  }, isPlainObject: function isPlainObject(e) {
    if ("object" != (typeof e === "undefined" ? "undefined" : _typeof(e)) || e.nodeType || e === e.window) return !1;try {
      if (e.constructor && !Object.prototype.hasOwnProperty.call(e.constructor.prototype, "isPrototypeOf")) return !1;
    } catch (t) {
      return !1;
    }return !0;
  }, merge: function merge(e, t) {
    var i = this,
        s = Array.isArray(t),
        n = s && [] || {};return s ? (e = e || [], n = n.concat(e), t.forEach(function (t, s) {
      "undefined" == typeof n[s] ? n[s] = t : i.isPlainObject(t) ? n[s] = i.merge(e[s], t) : -1 === e.indexOf(t) && n.push(t);
    }), n) : (e && i.isPlainObject(e) && Object.keys(e).forEach(function (t) {
      n[t] = e[t];
    }), Object.keys(t).forEach(function (s) {
      t[s] && i.isPlainObject(t[s]) && e[s] ? n[s] = i.merge(e[s], t[s]) : n[s] = t[s];
    }), n);
  }, now: function now() {
    return window.nwf ? window.nwf.system.Performance.elapsedTime : window.performance.now();
  }, empty: function empty(e) {
    for (; e.lastChild;) {
      e.removeChild(e.lastChild);
    }
  }, radixSort: function radixSort(e, t, i, s) {
    if (t = t || 0, i = i || e.length, s = s || 31, !(t >= i - 1 || 0 > s)) {
      for (var n = t, l = i, r = 1 << s; l > n;) {
        if (e[n] & r) {
          --l;var h = e[n];e[n] = e[l], e[l] = h;
        } else ++n;
      }this.radixSort(e, t, l, s - 1), this.radixSort(e, l, i, s - 1);
    }
  }, randomizeRGB: function randomizeRGB(e, t) {
    var i,
        s,
        n = e.split(","),
        l = "rgb(";for (t = this.randomInt(t), i = 0; 3 > i; i++) {
      s = parseInt(n[i]) + t, 0 > s ? s = 0 : s > 255 && (s = 255), l += s + ",";
    }return l = l.substring(0, l.length - 1), l += ")";
  }, getJSON: function getJSON(e) {
    var t = new XMLHttpRequest(),
        i = "undefined" == typeof e.cache ? !1 : e.cache,
        s = i ? e.url : e.url + "?t=" + Math.floor(1e4 * Math.random()) + Date.now();t.onreadystatechange = function () {
      if (200 === this.status) {
        var t = null;try {
          t = JSON.parse(this.responseText);
        } catch (i) {
          return;
        }return void e.callback.call(e.scope || null, t);
      }0 !== this.status && console.warn("[Tools.getJSON] Error: " + this.status + " (" + this.statusText + ") :: " + e.url);
    }, t.open("GET", s, !0), t.setRequestHeader("Accept", "application/json"), t.setRequestHeader("Content-Type", "application/json"), t.send("");
  } };


},{}],10:[function(require,module,exports){
'use strict';

/**
 * Polyfill for the additional KeyboardEvent properties defined in the D3E and
 * D4E draft specifications, by @inexorabletash.
 *
 * See: https://github.com/inexorabletash/polyfill
 */

(function (global) {
  var nativeKeyboardEvent = 'KeyboardEvent' in global;
  if (!nativeKeyboardEvent) global.KeyboardEvent = function KeyboardEvent() {
    throw TypeError('Illegal constructor');
  };

  if (!('DOM_KEY_LOCATION_STANDARD' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_STANDARD = 0x00; // Default or unknown location
  if (!('DOM_KEY_LOCATION_LEFT' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_LEFT = 0x01; // e.g. Left Alt key
  if (!('DOM_KEY_LOCATION_RIGHT' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_RIGHT = 0x02; // e.g. Right Alt key
  if (!('DOM_KEY_LOCATION_NUMPAD' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD = 0x03; // e.g. Numpad 0 or +

  var STANDARD = window.KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
      LEFT = window.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
      RIGHT = window.KeyboardEvent.DOM_KEY_LOCATION_RIGHT,
      NUMPAD = window.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD;

  //--------------------------------------------------------------------
  //
  // Utilities
  //
  //--------------------------------------------------------------------

  function contains(s, ss) {
    return String(s).indexOf(ss) !== -1;
  }

  var os = function () {
    if (contains(navigator.platform, 'Win')) {
      return 'win';
    }
    if (contains(navigator.platform, 'Mac')) {
      return 'mac';
    }
    if (contains(navigator.platform, 'CrOS')) {
      return 'cros';
    }
    if (contains(navigator.platform, 'Linux')) {
      return 'linux';
    }
    if (contains(navigator.userAgent, 'iPad') || contains(navigator.platform, 'iPod') || contains(navigator.platform, 'iPhone')) {
      return 'ios';
    }
    return '';
  }();

  var browser = function () {
    if (contains(navigator.userAgent, 'Chrome/')) {
      return 'chrome';
    }
    if (contains(navigator.vendor, 'Apple')) {
      return 'safari';
    }
    if (contains(navigator.userAgent, 'MSIE')) {
      return 'ie';
    }
    if (contains(navigator.userAgent, 'Gecko/')) {
      return 'moz';
    }
    if (contains(navigator.userAgent, 'Opera/')) {
      return 'opera';
    }
    return '';
  }();

  var browser_os = browser + '-' + os;

  function mergeIf(baseTable, select, table) {
    if (browser_os === select || browser === select || os === select) {
      Object.keys(table).forEach(function (keyCode) {
        baseTable[keyCode] = table[keyCode];
      });
    }
  }

  function remap(o, key) {
    var r = {};
    Object.keys(o).forEach(function (k) {
      var item = o[k];
      if (key in item) {
        r[item[key]] = item;
      }
    });
    return r;
  }

  function invert(o) {
    var r = {};
    Object.keys(o).forEach(function (k) {
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
    0xBA: { code: 'Semicolon', keyCap: ';' }, // [USB: 0x33] ;: (US Standard 101)
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
    0xDC: { code: 'Backslash', keyCap: '\\' }, // [USB: 0x31] \| (US Standard 101)
    0xDD: { code: 'BracketRight', keyCap: ']' }, // [USB: 0x30] ]} (US Standard 101)
    0xDE: { code: 'Quote', keyCap: '\'' }, // [USB: 0x34] '" (US Standard 101)
    // 0xDF - miscellaneous/varies

    // 0xE0 - reserved
    // 0xE1 - OEM specific
    0xE2: { code: 'IntlBackslash', keyCap: '\\' }, // [USB: 0x64] \| (UK Standard 102)
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
    0xFE: { code: 'Clear' // [USB: 0x9c] (Not in D3E)
    } };

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

  mergeIf(keyCodeToInfoTable, 'moz', {
    0x3B: { code: 'Semicolon', keyCap: ';' }, // [USB: 0x33] ;: (US Standard 101)
    0x3D: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
    0x6B: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
    0x6D: { code: 'Minus', keyCap: '-' }, // [USB: 0x2d] -_
    0xBB: { code: 'NumpadAdd', keyCap: '+', location: NUMPAD }, // [USB: 0x57]
    0xBD: { code: 'NumpadSubtract', keyCap: '-', location: NUMPAD // [USB: 0x56]
    } });

  mergeIf(keyCodeToInfoTable, 'moz-mac', {
    0x0C: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
    0xAD: { code: 'Minus', keyCap: '-' // [USB: 0x2d] -_
    } });

  mergeIf(keyCodeToInfoTable, 'moz-win', {
    0xAD: { code: 'Minus', keyCap: '-' // [USB: 0x2d] -_
    } });

  mergeIf(keyCodeToInfoTable, 'chrome-mac', {
    0x5D: { code: 'OSRight', location: RIGHT // [USB: 0xe7]
    } });

  // Windows via Bootcamp (!)
  if (0) {
    mergeIf(keyCodeToInfoTable, 'chrome-win', {
      0xC0: { code: 'Quote', keyCap: '\'' }, // [USB: 0x34] '" (US Standard 101)
      0xDE: { code: 'Backslash', keyCap: '\\' }, // [USB: 0x31] \| (US Standard 101)
      0xDF: { code: 'Backquote', keyCap: '`' // [USB: 0x35] `~ (US Standard 101)
      } });

    mergeIf(keyCodeToInfoTable, 'ie', {
      0xC0: { code: 'Quote', keyCap: '\'' }, // [USB: 0x34] '" (US Standard 101)
      0xDE: { code: 'Backslash', keyCap: '\\' }, // [USB: 0x31] \| (US Standard 101)
      0xDF: { code: 'Backquote', keyCap: '`' // [USB: 0x35] `~ (US Standard 101)
      } });
  }

  mergeIf(keyCodeToInfoTable, 'safari', {
    0x03: { code: 'Enter' }, // [USB: 0x28] old Safari
    0x19: { code: 'Tab' // [USB: 0x2b] old Safari for Shift+Tab
    } });

  mergeIf(keyCodeToInfoTable, 'ios', {
    0x0A: { code: 'Enter', location: STANDARD // [USB: 0x28]
    } });

  mergeIf(keyCodeToInfoTable, 'safari-mac', {
    0x5B: { code: 'OSLeft', location: LEFT }, // [USB: 0xe3]
    0x5D: { code: 'OSRight', location: RIGHT }, // [USB: 0xe7]
    0xE5: { code: 'KeyQ', keyCap: 'Q' // [USB: 0x14] On alternate presses, Ctrl+Q sends this
    } });

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
    0x12: { code: 'AltLeft', location: LEFT // [USB: 0xe2]
    } };
  locationTable[RIGHT] = {
    0x10: { code: 'ShiftRight', location: RIGHT }, // [USB: 0xe5]
    0x11: { code: 'ControlRight', location: RIGHT }, // [USB: 0xe4]
    0x12: { code: 'AltRight', location: RIGHT // [USB: 0xe6]
    } };
  locationTable[NUMPAD] = {
    0x0D: { code: 'NumpadEnter', location: NUMPAD // [USB: 0x58]
    } };

  mergeIf(locationTable[NUMPAD], 'moz', {
    0x6D: { code: 'NumpadSubtract', location: NUMPAD }, // [USB: 0x56]
    0x6B: { code: 'NumpadAdd', location: NUMPAD // [USB: 0x57]
    } });
  mergeIf(locationTable[LEFT], 'moz-mac', {
    0xE0: { code: 'OSLeft', location: LEFT // [USB: 0xe3]
    } });
  mergeIf(locationTable[RIGHT], 'moz-mac', {
    0xE0: { code: 'OSRight', location: RIGHT // [USB: 0xe7]
    } });
  mergeIf(locationTable[RIGHT], 'moz-win', {
    0x5B: { code: 'OSRight', location: RIGHT // [USB: 0xe7]
    } });

  mergeIf(locationTable[RIGHT], 'mac', {
    0x5D: { code: 'OSRight', location: RIGHT // [USB: 0xe7]
    } });

  mergeIf(locationTable[NUMPAD], 'chrome-mac', {
    0x0C: { code: 'NumLock', location: NUMPAD // [USB: 0x53]
    } });

  mergeIf(locationTable[NUMPAD], 'safari-mac', {
    0x0C: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
    0xBB: { code: 'NumpadAdd', location: NUMPAD }, // [USB: 0x57]
    0xBD: { code: 'NumpadSubtract', location: NUMPAD }, // [USB: 0x56]
    0xBE: { code: 'NumpadDecimal', location: NUMPAD }, // [USB: 0x63]
    0xBF: { code: 'NumpadDivide', location: NUMPAD // [USB: 0x54]
    } });

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
    var nativeLocation = nativeKeyboardEvent && 'location' in new KeyboardEvent('');
  } catch (_) {}

  function keyInfoForEvent(event) {
    var keyCode = 'keyCode' in event ? event.keyCode : 'which' in event ? event.which : 0;

    var keyInfo = function () {
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
    }();

    // TODO: Track these down and move to general tables
    if (0) {
      // TODO: Map these for newerish browsers?
      // TODO: iOS only?
      // TODO: Override with more common keyIdentifier name?
      switch (event.keyIdentifier) {
        case 'U+0010':
          keyInfo = { code: 'Function' };break;
        case 'U+001C':
          keyInfo = { code: 'ArrowLeft' };break;
        case 'U+001D':
          keyInfo = { code: 'ArrowRight' };break;
        case 'U+001E':
          keyInfo = { code: 'ArrowUp' };break;
        case 'U+001F':
          keyInfo = { code: 'ArrowDown' };break;
      }
    }

    if (!keyInfo) return null;

    var key = function () {
      var entry = codeToKeyTable[keyInfo.code];
      if (!entry) return keyInfo.code;
      return event.shiftKey && 'shiftKey' in entry ? entry.shiftKey : entry.key;
    }();

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
    (function () {
      function define(o, p, v) {
        if (p in o) return;
        Object.defineProperty(o, p, v);
      }

      define(KeyboardEvent.prototype, 'code', { get: function get() {
          var keyInfo = keyInfoForEvent(this);
          return keyInfo ? keyInfo.code : '';
        } });

      // Fix for nonstandard `key` values (FF36-)
      if ('key' in KeyboardEvent.prototype) {
        var desc = Object.getOwnPropertyDescriptor(KeyboardEvent.prototype, 'key');
        Object.defineProperty(KeyboardEvent.prototype, 'key', { get: function get() {
            var key = desc.get.call(this);
            return keyFixTable.hasOwnProperty(key) ? keyFixTable[key] : key;
          } });
      }

      define(KeyboardEvent.prototype, 'key', { get: function get() {
          var keyInfo = keyInfoForEvent(this);
          return keyInfo && 'key' in keyInfo ? keyInfo.key : 'Unidentified';
        } });

      define(KeyboardEvent.prototype, 'location', { get: function get() {
          var keyInfo = keyInfoForEvent(this);
          return keyInfo && 'location' in keyInfo ? keyInfo.location : STANDARD;
        } });

      define(KeyboardEvent.prototype, 'locale', { get: function get() {
          return '';
        } });
    })();
  }

  if (!('queryKeyCap' in global.KeyboardEvent)) global.KeyboardEvent.queryKeyCap = queryKeyCap;

  // Helper for IE8-
  global.identifyKey = function (event) {
    if ('code' in event) return;

    var keyInfo = keyInfoForEvent(event);
    event.code = keyInfo ? keyInfo.code : '';
    event.key = keyInfo && 'key' in keyInfo ? keyInfo.key : 'Unidentified';
    event.location = 'location' in event ? event.location : 'keyLocation' in event ? event.keyLocation : keyInfo && 'location' in keyInfo ? keyInfo.location : STANDARD;
    event.locale = '';
  };
})(window);

},{}],11:[function(require,module,exports){
'use strict';

var EPS = 0.1;

module.exports = AFRAME.registerComponent('checkpoint-controls', {
  schema: {
    enabled: { default: true },
    mode: { default: 'teleport', oneOf: ['teleport', 'animate'] },
    animateSpeed: { default: 3.0 }
  },

  init: function init() {
    this.active = true;
    this.checkpoint = null;

    this.isNavMeshConstrained = false;

    this.offset = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();
  },

  play: function play() {
    this.active = true;
  },
  pause: function pause() {
    this.active = false;
  },

  setCheckpoint: function setCheckpoint(checkpoint) {
    var el = this.el;

    if (!this.active) return;
    if (this.checkpoint === checkpoint) return;

    if (this.checkpoint) {
      el.emit('navigation-end', { checkpoint: this.checkpoint });
    }

    this.checkpoint = checkpoint;
    this.sync();

    // Ignore new checkpoint if we're already there.
    if (this.position.distanceTo(this.targetPosition) < EPS) {
      this.checkpoint = null;
      return;
    }

    el.emit('navigation-start', { checkpoint: checkpoint });

    if (this.data.mode === 'teleport') {
      this.el.setAttribute('position', this.targetPosition);
      this.checkpoint = null;
      el.emit('navigation-end', { checkpoint: checkpoint });
      el.components['movement-controls'].updateNavLocation();
    }
  },

  isVelocityActive: function isVelocityActive() {
    return !!(this.active && this.checkpoint);
  },

  getVelocity: function getVelocity() {
    if (!this.active) return;

    var data = this.data;
    var offset = this.offset;
    var position = this.position;
    var targetPosition = this.targetPosition;
    var checkpoint = this.checkpoint;

    this.sync();
    if (position.distanceTo(targetPosition) < EPS) {
      this.checkpoint = null;
      this.el.emit('navigation-end', { checkpoint: checkpoint });
      return offset.set(0, 0, 0);
    }
    offset.setLength(data.animateSpeed);
    return offset;
  },

  sync: function sync() {
    var offset = this.offset;
    var position = this.position;
    var targetPosition = this.targetPosition;

    position.copy(this.el.getAttribute('position'));
    targetPosition.copy(this.checkpoint.object3D.getWorldPosition());
    targetPosition.add(this.checkpoint.components.checkpoint.getOffset());
    offset.copy(targetPosition).sub(position);
  }
});

},{}],12:[function(require,module,exports){
'use strict';

/**
 * Gamepad controls for A-Frame.
 *
 * Stripped-down version of: https://github.com/donmccurdy/aframe-gamepad-controls
 *
 * For more information about the Gamepad API, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
 */

var GamepadButton = require('../../lib/GamepadButton'),
    GamepadButtonEvent = require('../../lib/GamepadButtonEvent');

var JOYSTICK_EPS = 0.2;

module.exports = AFRAME.registerComponent('gamepad-controls', {

  /*******************************************************************
   * Statics
   */

  GamepadButton: GamepadButton,

  /*******************************************************************
   * Schema
   */

  schema: {
    // Controller 0-3
    controller: { default: 0, oneOf: [0, 1, 2, 3] },

    // Enable/disable features
    enabled: { default: true },

    // Debugging
    debug: { default: false },

    // Heading element for rotation
    camera: { default: '[camera]', type: 'selector' },

    // Rotation sensitivity
    rotationSensitivity: { default: 2.0 }
  },

  /*******************************************************************
   * Core
   */

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function init() {
    var scene = this.el.sceneEl;
    this.prevTime = window.performance.now();

    // Button state
    this.buttons = {};

    // Rotation
    var rotation = this.el.object3D.rotation;
    this.pitch = new THREE.Object3D();
    this.pitch.rotation.x = THREE.Math.degToRad(rotation.x);
    this.yaw = new THREE.Object3D();
    this.yaw.position.y = 10;
    this.yaw.rotation.y = THREE.Math.degToRad(rotation.y);
    this.yaw.add(this.pitch);

    scene.addBehavior(this);
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function update() {
    this.tick();
  },

  /**
   * Called on each iteration of main render loop.
   */
  tick: function tick(t, dt) {
    this.updateButtonState();
    this.updateRotation(dt);
  },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function remove() {},

  /*******************************************************************
   * Movement
   */

  isVelocityActive: function isVelocityActive() {
    if (!this.data.enabled || !this.isConnected()) return false;

    var dpad = this.getDpad(),
        joystick0 = this.getJoystick(0),
        inputX = dpad.x || joystick0.x,
        inputY = dpad.y || joystick0.y;

    return Math.abs(inputX) > JOYSTICK_EPS || Math.abs(inputY) > JOYSTICK_EPS;
  },

  getVelocityDelta: function getVelocityDelta() {
    var dpad = this.getDpad(),
        joystick0 = this.getJoystick(0),
        inputX = dpad.x || joystick0.x,
        inputY = dpad.y || joystick0.y,
        dVelocity = new THREE.Vector3();

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

  isRotationActive: function isRotationActive() {
    if (!this.data.enabled || !this.isConnected()) return false;

    var joystick1 = this.getJoystick(1);

    return Math.abs(joystick1.x) > JOYSTICK_EPS || Math.abs(joystick1.y) > JOYSTICK_EPS;
  },

  updateRotation: function updateRotation(dt) {
    if (!this.isRotationActive()) return;

    var data = this.data;
    var yaw = this.yaw;
    var pitch = this.pitch;
    var lookControls = data.camera.components['look-controls'];
    var hasLookControls = lookControls && lookControls.pitchObject && lookControls.yawObject;

    // Sync with look-controls pitch/yaw if available.
    if (hasLookControls) {
      pitch.rotation.copy(lookControls.pitchObject.rotation);
      yaw.rotation.copy(lookControls.yawObject.rotation);
    }

    var lookVector = this.getJoystick(1);

    if (Math.abs(lookVector.x) <= JOYSTICK_EPS) lookVector.x = 0;
    if (Math.abs(lookVector.y) <= JOYSTICK_EPS) lookVector.y = 0;

    lookVector.multiplyScalar(data.rotationSensitivity * dt / 1000);
    yaw.rotation.y -= lookVector.x;
    pitch.rotation.x -= lookVector.y;
    pitch.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.rotation.x));
    data.camera.object3D.rotation.set(pitch.rotation.x, yaw.rotation.y, 0);

    // Sync with look-controls pitch/yaw if available.
    if (hasLookControls) {
      lookControls.pitchObject.rotation.copy(pitch.rotation);
      lookControls.yawObject.rotation.copy(yaw.rotation);
    }
  },

  /*******************************************************************
   * Button events
   */

  updateButtonState: function updateButtonState() {
    var gamepad = this.getGamepad();
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

  emit: function emit(event) {
    // Emit original event.
    this.el.emit(event.type, event);

    // Emit convenience event, identifying button index.
    this.el.emit(event.type + ':' + event.index, new GamepadButtonEvent(event.type, event.index, event));
  },

  /*******************************************************************
   * Gamepad state
   */

  /**
   * Returns the Gamepad instance attached to the component. If connected,
   * a proxy-controls component may provide access to Gamepad input from a
   * remote device.
   *
   * @return {Gamepad}
   */
  getGamepad: function getGamepad() {
    var localGamepad = navigator.getGamepads && navigator.getGamepads()[this.data.controller],
        proxyControls = this.el.sceneEl.components['proxy-controls'],
        proxyGamepad = proxyControls && proxyControls.isConnected() && proxyControls.getGamepad(this.data.controller);
    return proxyGamepad || localGamepad;
  },

  /**
   * Returns the state of the given button.
   * @param  {number} index The button (0-N) for which to find state.
   * @return {GamepadButton}
   */
  getButton: function getButton(index) {
    return this.getGamepad().buttons[index];
  },

  /**
   * Returns state of the given axis. Axes are labelled 0-N, where 0-1 will
   * represent X/Y on the first joystick, and 2-3 X/Y on the second.
   * @param  {number} index The axis (0-N) for which to find state.
   * @return {number} On the interval [-1,1].
   */
  getAxis: function getAxis(index) {
    return this.getGamepad().axes[index];
  },

  /**
   * Returns the state of the given joystick (0 or 1) as a THREE.Vector2.
   * @param  {number} id The joystick (0, 1) for which to find state.
   * @return {THREE.Vector2}
   */
  getJoystick: function getJoystick(index) {
    var gamepad = this.getGamepad();
    switch (index) {
      case 0:
        return new THREE.Vector2(gamepad.axes[0], gamepad.axes[1]);
      case 1:
        return new THREE.Vector2(gamepad.axes[2], gamepad.axes[3]);
      default:
        throw new Error('Unexpected joystick index "%d".', index);
    }
  },

  /**
   * Returns the state of the dpad as a THREE.Vector2.
   * @return {THREE.Vector2}
   */
  getDpad: function getDpad() {
    var gamepad = this.getGamepad();
    if (!gamepad.buttons[GamepadButton.DPAD_RIGHT]) {
      return new THREE.Vector2();
    }
    return new THREE.Vector2((gamepad.buttons[GamepadButton.DPAD_RIGHT].pressed ? 1 : 0) + (gamepad.buttons[GamepadButton.DPAD_LEFT].pressed ? -1 : 0), (gamepad.buttons[GamepadButton.DPAD_UP].pressed ? -1 : 0) + (gamepad.buttons[GamepadButton.DPAD_DOWN].pressed ? 1 : 0));
  },

  /**
   * Returns true if the gamepad is currently connected to the system.
   * @return {boolean}
   */
  isConnected: function isConnected() {
    var gamepad = this.getGamepad();
    return !!(gamepad && gamepad.connected);
  },

  /**
   * Returns a string containing some information about the controller. Result
   * may vary across browsers, for a given controller.
   * @return {string}
   */
  getID: function getID() {
    return this.getGamepad().id;
  }
});

},{"../../lib/GamepadButton":4,"../../lib/GamepadButtonEvent":5}],13:[function(require,module,exports){
'use strict';

require('./checkpoint-controls');
require('./gamepad-controls');
require('./keyboard-controls');
require('./touch-controls');
require('./movement-controls');
require('./trackpad-controls');

},{"./checkpoint-controls":11,"./gamepad-controls":12,"./keyboard-controls":14,"./movement-controls":15,"./touch-controls":16,"./trackpad-controls":17}],14:[function(require,module,exports){
'use strict';

require('../../lib/keyboard.polyfill');

var MAX_DELTA = 0.2,
    PROXY_FLAG = '__keyboard-controls-proxy';

var KeyboardEvent = window.KeyboardEvent;

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
    enabled: { default: true },
    debug: { default: false }
  },

  init: function init() {
    this.dVelocity = new THREE.Vector3();
    this.localKeys = {};
    this.listeners = {
      keydown: this.onKeyDown.bind(this),
      keyup: this.onKeyUp.bind(this),
      blur: this.onBlur.bind(this)
    };
    this.attachEventListeners();
  },

  /*******************************************************************
  * Movement
  */

  isVelocityActive: function isVelocityActive() {
    return this.data.enabled && !!Object.keys(this.getKeys()).length;
  },

  getVelocityDelta: function getVelocityDelta() {
    var data = this.data,
        keys = this.getKeys();

    this.dVelocity.set(0, 0, 0);
    if (data.enabled) {
      if (keys.KeyW || keys.ArrowUp) {
        this.dVelocity.z -= 1;
      }
      if (keys.KeyA || keys.ArrowLeft) {
        this.dVelocity.x -= 1;
      }
      if (keys.KeyS || keys.ArrowDown) {
        this.dVelocity.z += 1;
      }
      if (keys.KeyD || keys.ArrowRight) {
        this.dVelocity.x += 1;
      }
    }

    return this.dVelocity.clone();
  },

  /*******************************************************************
  * Events
  */

  play: function play() {
    this.attachEventListeners();
  },

  pause: function pause() {
    this.removeEventListeners();
  },

  remove: function remove() {
    this.pause();
  },

  attachEventListeners: function attachEventListeners() {
    window.addEventListener('keydown', this.listeners.keydown, false);
    window.addEventListener('keyup', this.listeners.keyup, false);
    window.addEventListener('blur', this.listeners.blur, false);
  },

  removeEventListeners: function removeEventListeners() {
    window.removeEventListener('keydown', this.listeners.keydown);
    window.removeEventListener('keyup', this.listeners.keyup);
    window.removeEventListener('blur', this.listeners.blur);
  },

  onKeyDown: function onKeyDown(event) {
    if (AFRAME.utils.shouldCaptureKeyEvent(event)) {
      this.localKeys[event.code] = true;
      this.emit(event);
    }
  },

  onKeyUp: function onKeyUp(event) {
    if (AFRAME.utils.shouldCaptureKeyEvent(event)) {
      delete this.localKeys[event.code];
      this.emit(event);
    }
  },

  onBlur: function onBlur() {
    for (var code in this.localKeys) {
      if (this.localKeys.hasOwnProperty(code)) {
        delete this.localKeys[code];
      }
    }
  },

  emit: function emit(event) {
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

  isPressed: function isPressed(code) {
    return code in this.getKeys();
  },

  getKeys: function getKeys() {
    if (this.isProxied()) {
      return this.el.sceneEl.components['proxy-controls'].getKeyboard();
    }
    return this.localKeys;
  },

  isProxied: function isProxied() {
    var proxyControls = this.el.sceneEl.components['proxy-controls'];
    return proxyControls && proxyControls.isConnected();
  }

});

},{"../../lib/keyboard.polyfill":10}],15:[function(require,module,exports){
'use strict';

/**
 * Movement Controls
 *
 * @author Don McCurdy <dm@donmccurdy.com>
 */

var COMPONENT_SUFFIX = '-controls',
    MAX_DELTA = 0.2,

// ms
EPS = 10e-6;

module.exports = AFRAME.registerComponent('movement-controls', {

  /*******************************************************************
   * Schema
   */

  dependencies: ['rotation'],

  schema: {
    enabled: { default: true },
    controls: { default: ['gamepad', 'trackpad', 'keyboard', 'touch'] },
    speed: { default: 0.3, min: 0 },
    fly: { default: false },
    constrainToNavMesh: { default: false },
    camera: { default: '[camera]', type: 'selector' }
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function init() {
    var el = this.el;

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

  update: function update(prevData) {
    var el = this.el;
    var data = this.data;
    if (el.sceneEl.hasLoaded) {
      this.injectControls();
    }
    if (data.constrainToNavMesh !== prevData.constrainToNavMesh) {
      var nav = el.sceneEl.systems.nav;
      data.constrainToNavMesh ? nav.addAgent(this) : nav.removeAgent(this);
    }
  },

  injectControls: function injectControls() {
    var data = this.data;
    var name;

    for (var i = 0; i < data.controls.length; i++) {
      name = data.controls[i] + COMPONENT_SUFFIX;
      if (!this.el.components[name]) {
        this.el.setAttribute(name, '');
      }
    }
  },

  updateNavLocation: function updateNavLocation() {
    this.navGroup = null;
    this.navNode = null;
  },

  /*******************************************************************
   * Tick
   */

  tick: function () {
    var start = new THREE.Vector3();
    var end = new THREE.Vector3();
    var clampedEnd = new THREE.Vector3();

    return function (t, dt) {
      if (!dt) return;

      var el = this.el;
      var data = this.data;

      if (!data.enabled) return;

      this.updateVelocityCtrl();
      var velocityCtrl = this.velocityCtrl;
      var velocity = this.velocity;

      if (!velocityCtrl) return;

      // Update velocity. If FPS is too low, reset.
      if (dt / 1000 > MAX_DELTA) {
        velocity.set(0, 0, 0);
      } else {
        this.updateVelocity(dt);
      }

      if (data.constrainToNavMesh && velocityCtrl.isNavMeshConstrained !== false) {

        if (velocity.lengthSq() < EPS) return;

        start.copy(el.object3D.position);
        end.copy(velocity).multiplyScalar(dt / 1000).add(start);

        var nav = el.sceneEl.systems.nav;
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
  }(),

  /*******************************************************************
   * Movement
   */

  updateVelocityCtrl: function updateVelocityCtrl() {
    var data = this.data;
    if (data.enabled) {
      for (var i = 0, l = data.controls.length; i < l; i++) {
        var control = this.el.components[data.controls[i] + COMPONENT_SUFFIX];
        if (control && control.isVelocityActive()) {
          this.velocityCtrl = control;
          return;
        }
      }
      this.velocityCtrl = null;
    }
  },

  updateVelocity: function () {
    var vector2 = new THREE.Vector2();
    // var matrix = new THREE.Matrix4();
    // var matrix2 = new THREE.Matrix4();
    // var position = new THREE.Vector3();
    // var quaternion = new THREE.Quaternion();
    // var scale = new THREE.Vector3();

    return function (dt) {
      var dVelocity = void 0;
      var el = this.el;
      var control = this.velocityCtrl;
      var velocity = this.velocity;
      var data = this.data;

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
        // TODO: Handle rotated rig.
        var cameraEl = data.camera;
        // matrix.copy(cameraEl.object3D.matrixWorld);
        // matrix2.getInverse(el.object3D.matrixWorld);
        // matrix.multiply(matrix2);
        // matrix.decompose(position, quaternion, scale);
        // dVelocity.applyQuaternion(quaternion);

        // Rotate to heading
        dVelocity.applyQuaternion(cameraEl.object3D.quaternion);

        var factor = dVelocity.length();
        if (data.fly) {
          velocity.copy(dVelocity);
          velocity.multiplyScalar(this.data.speed * dt);
        } else {
          vector2.set(dVelocity.x, dVelocity.z);
          vector2.setLength(factor * this.data.speed * dt);
          velocity.x = vector2.x;
          velocity.z = vector2.y;
        }
      }
    };
  }()
});

},{}],16:[function(require,module,exports){
'use strict';

/**
 * Touch-to-move-forward controls for mobile.
 */

module.exports = AFRAME.registerComponent('touch-controls', {
  schema: {
    enabled: { default: true }
  },

  init: function init() {
    this.dVelocity = new THREE.Vector3();
    this.bindMethods();
  },

  play: function play() {
    this.addEventListeners();
  },

  pause: function pause() {
    this.removeEventListeners();
    this.dVelocity.set(0, 0, 0);
  },

  remove: function remove() {
    this.pause();
  },

  addEventListeners: function addEventListeners() {
    var sceneEl = this.el.sceneEl;
    var canvasEl = sceneEl.canvas;

    if (!canvasEl) {
      sceneEl.addEventListener('render-target-loaded', this.addEventListeners.bind(this));
      return;
    }

    canvasEl.addEventListener('touchstart', this.onTouchStart);
    canvasEl.addEventListener('touchend', this.onTouchEnd);
  },

  removeEventListeners: function removeEventListeners() {
    var canvasEl = this.el.sceneEl && this.el.sceneEl.canvas;
    if (!canvasEl) {
      return;
    }

    canvasEl.removeEventListener('touchstart', this.onTouchStart);
    canvasEl.removeEventListener('touchend', this.onTouchEnd);
  },

  isVelocityActive: function isVelocityActive() {
    return this.data.enabled && this.isMoving;
  },

  getVelocityDelta: function getVelocityDelta() {
    this.dVelocity.z = this.isMoving ? -1 : 0;
    return this.dVelocity.clone();
  },

  bindMethods: function bindMethods() {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  },

  onTouchStart: function onTouchStart(e) {
    this.isMoving = true;
    e.preventDefault();
  },

  onTouchEnd: function onTouchEnd(e) {
    this.isMoving = false;
    e.preventDefault();
  }
});

},{}],17:[function(require,module,exports){
'use strict';

/**
 * 3dof (Gear VR, Daydream) controls for mobile.
 */

module.exports = AFRAME.registerComponent('trackpad-controls', {
  schema: {
    enabled: { default: true }
  },

  init: function init() {
    this.dVelocity = new THREE.Vector3();
    this.zVel = 0;
    this.bindMethods();
  },

  play: function play() {
    this.addEventListeners();
  },

  pause: function pause() {
    this.removeEventListeners();
    this.dVelocity.set(0, 0, 0);
  },

  remove: function remove() {
    this.pause();
  },

  addEventListeners: function addEventListeners() {
    var sceneEl = this.el.sceneEl;

    sceneEl.addEventListener('axismove', this.onAxisMove);
    sceneEl.addEventListener('trackpadtouchstart', this.onTouchStart);
    sceneEl.addEventListener('trackpadtouchend', this.onTouchEnd);
  },

  removeEventListeners: function removeEventListeners() {
    var sceneEl = this.el.sceneEl;

    sceneEl.removeEventListener('axismove', this.onAxisMove);
    sceneEl.removeEventListener('trackpadtouchstart', this.onTouchStart);
    sceneEl.removeEventListener('trackpadtouchend', this.onTouchEnd);
  },

  isVelocityActive: function isVelocityActive() {
    return this.data.enabled && this.isMoving;
  },

  getVelocityDelta: function getVelocityDelta() {
    this.dVelocity.z = this.isMoving ? -this.zVel : 1;
    return this.dVelocity.clone();
  },

  bindMethods: function bindMethods() {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onAxisMove = this.onAxisMove.bind(this);
  },

  onTouchStart: function onTouchStart(e) {
    this.isMoving = true;
    e.preventDefault();
  },

  onTouchEnd: function onTouchEnd(e) {
    this.isMoving = false;
    e.preventDefault();
  },

  onAxisMove: function onAxisMove(e) {
    var axis_data = e.detail.axis;

    if (axis_data[1] < 0) {
      this.zVel = 1;
    }

    if (axis_data[1] > 0) {
      this.zVel = -1;
    }
  }

});

},{}],18:[function(require,module,exports){
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
    crossFadeDuration: { default: 0 },
    loop: { default: 'repeat', oneOf: Object.keys(LoopMode) },
    repetitions: { default: Infinity, min: 0 }
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

  update: function update(previousData) {
    if (!previousData) return;

    this.stopAction();

    if (this.data.clip) {
      this.playAction();
    }
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
        if (data.duration) action.setDuration(data.duration);
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

},{}],19:[function(require,module,exports){
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

},{"../../lib/FBXLoader":3}],20:[function(require,module,exports){
'use strict';

var fetchScript = require('../../lib/fetch-script')();

var LOADER_SRC = 'https://rawgit.com/mrdoob/three.js/r86/examples/js/loaders/GLTFLoader.js';

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

},{"../../lib/fetch-script":8}],21:[function(require,module,exports){
'use strict';

require('./animation-mixer');
require('./fbx-model');
require('./gltf-model-legacy');
require('./json-model');
require('./object-model');
require('./ply-model');

},{"./animation-mixer":18,"./fbx-model":19,"./gltf-model-legacy":20,"./json-model":22,"./object-model":23,"./ply-model":24}],22:[function(require,module,exports){
'use strict';

/**
 * json-model
 *
 * Loader for THREE.js JSON format. Somewhat confusingly, there are two different THREE.js formats,
 * both having the .json extension. This loader supports only THREE.JsonLoader, which typically
 * includes only a single mesh.
 *
 * Check the console for errors, if in doubt. You may need to use `object-model` or
 * `blend-character-model` for some .js and .json files.
 *
 * See: https://clara.io/learn/user-guide/data_exchange/threejs_export
 */

module.exports = AFRAME.registerComponent('json-model', {
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
    loader = new THREE.JSONLoader();
    if (data.crossorigin) loader.crossOrigin = data.crossorigin;
    loader.load(data.src, function (geometry, materials) {

      // Attempt to automatically detect common material options.
      materials.forEach(function (mat) {
        mat.vertexColors = (geometry.faces[0] || {}).color ? THREE.FaceColors : THREE.NoColors;
        mat.skinning = !!(geometry.bones || []).length;
        mat.morphTargets = !!(geometry.morphTargets || []).length;
        mat.morphNormals = !!(geometry.morphNormals || []).length;
      });

      var model = (geometry.bones || []).length ? new THREE.SkinnedMesh(geometry, new THREE.MultiMaterial(materials)) : new THREE.Mesh(geometry, new THREE.MultiMaterial(materials));

      _this.load(model);
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

},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
'use strict';

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
module.exports.System = AFRAME.registerSystem('ply-model', {
  init: function init() {
    this.cache = {};
  },

  /**
   * @returns {Promise}
   */
  getOrLoadGeometry: function getOrLoadGeometry(src, skipCache) {
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
  }
});

module.exports.Component = AFRAME.registerComponent('ply-model', {
  schema: {
    skipCache: { type: 'boolean', default: false },
    src: { type: 'asset' }
  },

  init: function init() {
    this.model = null;
  },

  update: function update() {
    var data = this.data;
    var el = this.el;

    if (!data.src) {
      console.warn('[%s] `src` property is required.', this.name);
      return;
    }

    // Get geometry from system, create and set mesh.
    this.system.getOrLoadGeometry(data.src, data.skipCache).then(function (geometry) {
      var model = createModel(geometry);
      el.setObject3D('mesh', model);
      el.emit('model-loaded', { format: 'ply', model: model });
    });
  },

  remove: function remove() {
    if (this.model) {
      this.el.removeObject3D('mesh');
    }
  }
});

function createModel(geometry) {
  return new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
    color: 0xFFFFFF,
    shading: THREE.FlatShading,
    vertexColors: THREE.VertexColors,
    shininess: 0
  }));
}

},{"../../lib/PLYLoader":6}],25:[function(require,module,exports){
'use strict';

module.exports = AFRAME.registerComponent('checkpoint', {
  schema: {
    offset: { default: { x: 0, y: 0, z: 0 }, type: 'vec3' }
  },

  init: function init() {
    this.active = false;
    this.targetEl = null;
    this.fire = this.fire.bind(this);
    this.offset = new THREE.Vector3();
  },

  update: function update() {
    this.offset.copy(this.data.offset);
  },

  play: function play() {
    this.el.addEventListener('click', this.fire);
  },
  pause: function pause() {
    this.el.removeEventListener('click', this.fire);
  },
  remove: function remove() {
    this.pause();
  },

  fire: function fire() {
    var targetEl = this.el.sceneEl.querySelector('[checkpoint-controls]');
    if (!targetEl) {
      throw new Error('No `checkpoint-controls` component found.');
    }
    targetEl.components['checkpoint-controls'].setCheckpoint(this.el);
  },

  getOffset: function getOffset() {
    return this.offset.copy(this.data.offset);
  }
});

},{}],26:[function(require,module,exports){
'use strict';

/**
 * @param  {Array<THREE.Material>|THREE.Material} material
 * @return {Array<THREE.Material>}
 */

function ensureMaterialArray(material) {
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
function applyEnvMap(mesh, materialNames, envMap, reflectivity) {
  if (!mesh) return;

  materialNames = materialNames || [];

  mesh.traverse(function (node) {

    if (!node.isMesh) return;

    var meshMaterials = ensureMaterialArray(node.material);

    meshMaterials.forEach(function (material) {

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
    path: { default: '' },
    extension: { default: 'jpg', oneOf: ['jpg', 'png'] },
    format: { default: 'RGBFormat', oneOf: ['RGBFormat', 'RGBAFormat'] },
    enableBackground: { default: false },
    reflectivity: { default: 1, min: 0, max: 1 },
    materials: { default: [] }
  },

  init: function init() {
    var _this = this;

    var data = this.data;

    this.texture = new THREE.CubeTextureLoader().load([data.path + 'posx.' + data.extension, data.path + 'negx.' + data.extension, data.path + 'posy.' + data.extension, data.path + 'negy.' + data.extension, data.path + 'posz.' + data.extension, data.path + 'negz.' + data.extension]);
    this.texture.format = THREE[data.format];

    this.object3dsetHandler = function () {
      var mesh = _this.el.getObject3D('mesh');
      var data = _this.data;
      applyEnvMap(mesh, data.materials, _this.texture, data.reflectivity);
    };
    this.el.addEventListener('object3dset', this.object3dsetHandler);
  },

  update: function update(oldData) {
    var data = this.data;
    var mesh = this.el.getObject3D('mesh');

    var addedMaterialNames = [];
    var removedMaterialNames = [];

    if (data.materials.length) {
      if (oldData.materials) {
        addedMaterialNames = data.materials.filter(function (name) {
          return !oldData.materials.includes(name);
        });
        removedMaterialNames = oldData.materials.filter(function (name) {
          return !data.materials.includes(name);
        });
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
      var maintainedMaterialNames = data.materials.filter(function (name) {
        return oldData.materials.includes(name);
      });
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

  remove: function remove() {
    this.el.removeEventListener('object3dset', this.object3dsetHandler);
    var mesh = this.el.getObject3D('mesh');
    var data = this.data;

    applyEnvMap(mesh, data.materials, null, 1);
    if (data.enableBackground) this.setBackground(null);
  },

  setBackground: function setBackground(texture) {
    this.el.sceneEl.object3D.background = texture;
  }
});

},{}],27:[function(require,module,exports){
'use strict';

/* global CANNON */

/**
 * Based on aframe/examples/showcase/tracked-controls.
 *
 * Handles events coming from the hand-controls.
 * Determines if the entity is grabbed or released.
 * Updates its position to move along the controller.
 */

module.exports = AFRAME.registerComponent('grab', {
  init: function init() {
    this.system = this.el.sceneEl.systems.physics;

    this.GRABBED_STATE = 'grabbed';

    this.grabbing = false;
    this.hitEl = /** @type {AFRAME.Element}    */null;
    this.physics = /** @type {AFRAME.System}     */this.el.sceneEl.systems.physics;
    this.constraint = /** @type {CANNON.Constraint} */null;

    // Bind event handlers
    this.onHit = this.onHit.bind(this);
    this.onGripOpen = this.onGripOpen.bind(this);
    this.onGripClose = this.onGripClose.bind(this);
  },

  play: function play() {
    var el = this.el;
    el.addEventListener('hit', this.onHit);
    el.addEventListener('gripdown', this.onGripClose);
    el.addEventListener('gripup', this.onGripOpen);
    el.addEventListener('trackpaddown', this.onGripClose);
    el.addEventListener('trackpadup', this.onGripOpen);
    el.addEventListener('triggerdown', this.onGripClose);
    el.addEventListener('triggerup', this.onGripOpen);
  },

  pause: function pause() {
    var el = this.el;
    el.removeEventListener('hit', this.onHit);
    el.removeEventListener('gripdown', this.onGripClose);
    el.removeEventListener('gripup', this.onGripOpen);
    el.removeEventListener('trackpaddown', this.onGripClose);
    el.removeEventListener('trackpadup', this.onGripOpen);
    el.removeEventListener('triggerdown', this.onGripClose);
    el.removeEventListener('triggerup', this.onGripOpen);
  },

  onGripClose: function onGripClose() {
    this.grabbing = true;
  },

  onGripOpen: function onGripOpen() {
    var hitEl = this.hitEl;
    this.grabbing = false;
    if (!hitEl) {
      return;
    }
    hitEl.removeState(this.GRABBED_STATE);
    this.hitEl = undefined;
    this.system.removeConstraint(this.constraint);
    this.constraint = null;
  },

  onHit: function onHit(evt) {
    var hitEl = evt.detail.el;
    // If the element is already grabbed (it could be grabbed by another controller).
    // If the hand is not grabbing the element does not stick.
    // If we're already grabbing something you can't grab again.
    if (!hitEl || hitEl.is(this.GRABBED_STATE) || !this.grabbing || this.hitEl) {
      return;
    }
    hitEl.addState(this.GRABBED_STATE);
    this.hitEl = hitEl;
    this.constraint = new CANNON.LockConstraint(this.el.body, hitEl.body);
    this.system.addConstraint(this.constraint);
  }
});

},{}],28:[function(require,module,exports){
'use strict';

require('./checkpoint');
require('./cube-env-map');
require('./grab');
require('./jump-ability');
require('./kinematic-body');
require('./mesh-smooth');
require('./normal-material');
require('./sphere-collider');

},{"./checkpoint":25,"./cube-env-map":26,"./grab":27,"./jump-ability":29,"./kinematic-body":30,"./mesh-smooth":31,"./normal-material":32,"./sphere-collider":33}],29:[function(require,module,exports){
'use strict';

var ACCEL_G = -9.8,

// m/s^2
EASING = -15; // m/s^2

/**
 * Jump ability.
 */
module.exports = AFRAME.registerComponent('jump-ability', {
  dependencies: ['velocity'],

  /* Schema
  ——————————————————————————————————————————————*/

  schema: {
    on: { default: 'keydown:Space gamepadbuttondown:0' },
    playerHeight: { default: 1.764 },
    maxJumps: { default: 1 },
    distance: { default: 5 },
    debug: { default: false }
  },

  init: function init() {
    this.velocity = 0;
    this.numJumps = 0;

    var beginJump = this.beginJump.bind(this),
        events = this.data.on.split(' ');
    this.bindings = {};
    for (var i = 0; i < events.length; i++) {
      this.bindings[events[i]] = beginJump;
      this.el.addEventListener(events[i], beginJump);
    }
    this.bindings.collide = this.onCollide.bind(this);
    this.el.addEventListener('collide', this.bindings.collide);
  },

  remove: function remove() {
    for (var event in this.bindings) {
      if (this.bindings.hasOwnProperty(event)) {
        this.el.removeEventListener(event, this.bindings[event]);
        delete this.bindings[event];
      }
    }
    this.el.removeEventListener('collide', this.bindings.collide);
    delete this.bindings.collide;
  },

  beginJump: function beginJump() {
    if (this.numJumps < this.data.maxJumps) {
      var data = this.data,
          initialVelocity = Math.sqrt(-2 * data.distance * (ACCEL_G + EASING)),
          v = this.el.getAttribute('velocity');
      this.el.setAttribute('velocity', { x: v.x, y: initialVelocity, z: v.z });
      this.numJumps++;
      this.el.emit('jumpstart');
    }
  },

  onCollide: function onCollide() {
    if (this.numJumps > 0) this.el.emit('jumpend');
    this.numJumps = 0;
  }
});

},{}],30:[function(require,module,exports){
'use strict';

/* global CANNON */

/**
 * Kinematic body.
 *
 * Managed dynamic body, which moves but is not affected (directly) by the
 * physics engine. This is not a true kinematic body, in the sense that we are
 * letting the physics engine _compute_ collisions against it and selectively
 * applying those collisions to the object. The physics engine does not decide
 * the position/velocity/rotation of the element.
 *
 * Used for the camera object, because full physics simulation would create
 * movement that feels unnatural to the player. Bipedal movement does not
 * translate nicely to rigid body physics.
 *
 * See: http://www.learn-cocos2d.com/2013/08/physics-engine-platformer-terrible-idea/
 * And: http://oxleygamedev.blogspot.com/2011/04/player-physics-part-2.html
 */

var EPS = 0.000001;

module.exports = AFRAME.registerComponent('kinematic-body', {
  dependencies: ['velocity'],

  /*******************************************************************
   * Schema
   */

  schema: {
    mass: { default: 5 },
    radius: { default: 1.3 },
    userHeight: { default: 1.6 },
    linearDamping: { default: 0.05 },
    enableSlopes: { default: true }
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function init() {
    this.system = this.el.sceneEl.systems.physics;
    this.system.addComponent(this);

    var el = this.el,
        data = this.data,
        position = new CANNON.Vec3().copy(el.getAttribute('position'));

    this.body = new CANNON.Body({
      material: this.system.getMaterial('staticMaterial'),
      position: position,
      mass: data.mass,
      linearDamping: data.linearDamping,
      fixedRotation: true
    });
    this.body.addShape(new CANNON.Sphere(data.radius), new CANNON.Vec3(0, data.radius - data.height, 0));

    this.body.el = this.el;
    this.el.body = this.body;
    this.system.addBody(this.body);

    if (el.hasAttribute('wasd-controls')) {
      console.warn('[kinematic-body] Not compatible with wasd-controls, use movement-controls.');
    }
  },

  remove: function remove() {
    this.system.removeBody(this.body);
    this.system.removeComponent(this);
    delete this.el.body;
  },

  /*******************************************************************
   * Update
   */

  /**
   * Checks CANNON.World for collisions and attempts to apply them to the
   * element automatically, in a player-friendly way.
   *
   * There's extra logic for horizontal surfaces here. The basic requirements:
   * (1) Only apply gravity when not in contact with _any_ horizontal surface.
   * (2) When moving, project the velocity against exactly one ground surface.
   *     If in contact with two ground surfaces (e.g. ground + ramp), choose
   *     the one that collides with current velocity, if any.
   */
  beforeStep: function beforeStep(t, dt) {
    if (!dt) return;

    var el = this.el;
    var body = this.body;

    body.velocity.copy(el.getAttribute('velocity'));
    body.position.copy(el.getAttribute('position'));
    body.position.y += this.data.userHeight;
  },

  step: function () {
    var velocity = new THREE.Vector3(),
        normalizedVelocity = new THREE.Vector3(),
        currentSurfaceNormal = new THREE.Vector3(),
        groundNormal = new THREE.Vector3();

    return function (t, dt) {
      if (!dt) return;

      var body = this.body,
          data = this.data,
          didCollide = false,
          height = void 0,
          groundHeight = -Infinity,
          groundBody = void 0,
          contacts = this.system.getContacts();

      dt = Math.min(dt, this.system.data.maxInterval * 1000);

      groundNormal.set(0, 0, 0);
      velocity.copy(this.el.getAttribute('velocity'));
      body.velocity.copy(velocity);

      for (var i = 0, contact; contact = contacts[i]; i++) {
        // 1. Find any collisions involving this element. Get the contact
        // normal, and make sure it's oriented _out_ of the other object and
        // enabled (body.collisionReponse is true for both bodies)
        if (!contact.enabled) {
          continue;
        }
        if (body.id === contact.bi.id) {
          contact.ni.negate(currentSurfaceNormal);
        } else if (body.id === contact.bj.id) {
          currentSurfaceNormal.copy(contact.ni);
        } else {
          continue;
        }

        didCollide = body.velocity.dot(currentSurfaceNormal) < -EPS;
        if (didCollide && currentSurfaceNormal.y <= 0.5) {
          // 2. If current trajectory attempts to move _through_ another
          // object, project the velocity against the collision plane to
          // prevent passing through.
          velocity = velocity.projectOnPlane(currentSurfaceNormal);
        } else if (currentSurfaceNormal.y > 0.5) {
          // 3. If in contact with something roughly horizontal (+/- 45º) then
          // consider that the current ground. Only the highest qualifying
          // ground is retained.
          height = body.id === contact.bi.id ? Math.abs(contact.rj.y + contact.bj.position.y) : Math.abs(contact.ri.y + contact.bi.position.y);
          if (height > groundHeight) {
            groundHeight = height;
            groundNormal.copy(currentSurfaceNormal);
            groundBody = body.id === contact.bi.id ? contact.bj : contact.bi;
          }
        }
      }

      normalizedVelocity.copy(velocity).normalize();
      if (groundBody && normalizedVelocity.y < 0.5) {
        if (!data.enableSlopes) {
          groundNormal.set(0, 1, 0);
        } else if (groundNormal.y < 1 - EPS) {
          groundNormal.copy(this.raycastToGround(groundBody, groundNormal));
        }

        // 4. Project trajectory onto the top-most ground object, unless
        // trajectory is > 45º.
        velocity = velocity.projectOnPlane(groundNormal);
      } else if (this.system.driver.world) {
        // 5. If not in contact with anything horizontal, apply world gravity.
        // TODO - Why is the 4x scalar necessary.
        // NOTE: Does not work if physics runs on a worker.
        velocity.add(this.system.driver.world.gravity.scale(dt * 4.0 / 1000));
      }

      // 6. If the ground surface has a velocity, apply it directly to current
      // position, not velocity, to preserve relative velocity.
      if (groundBody && groundBody.el && groundBody.el.components.velocity) {
        var groundVelocity = groundBody.el.getAttribute('velocity');
        body.position.copy({
          x: body.position.x + groundVelocity.x * dt / 1000,
          y: body.position.y + groundVelocity.y * dt / 1000,
          z: body.position.z + groundVelocity.z * dt / 1000
        });
      }

      body.velocity.copy(velocity);

      body.position.y -= data.userHeight;
      this.el.setAttribute('velocity', body.velocity);
      this.el.setAttribute('position', body.position);
    };
  }(),

  /**
   * When walking on complex surfaces (trimeshes, borders between two shapes),
   * the collision normals returned for the player sphere can be very
   * inconsistent. To address this, raycast straight down, find the collision
   * normal, and return whichever normal is more vertical.
   * @param  {CANNON.Body} groundBody
   * @param  {CANNON.Vec3} groundNormal
   * @return {CANNON.Vec3}
   */
  raycastToGround: function raycastToGround(groundBody, groundNormal) {
    var ray = void 0,
        hitNormal = void 0,
        vFrom = this.body.position,
        vTo = this.body.position.clone();

    vTo.y -= this.data.height;
    ray = new CANNON.Ray(vFrom, vTo);
    ray._updateDirection(); // TODO - Report bug.
    ray.intersectBody(groundBody);

    if (!ray.hasHit) return groundNormal;

    // Compare ABS, in case we're projecting against the inside of the face.
    hitNormal = ray.result.hitNormalWorld;
    return Math.abs(hitNormal.y) > Math.abs(groundNormal.y) ? hitNormal : groundNormal;
  }
});

},{}],31:[function(require,module,exports){
'use strict';

/**
 * Apply this component to models that looks "blocky", to have Three.js compute
 * vertex normals on the fly for a "smoother" look.
 */

module.exports = AFRAME.registerComponent('mesh-smooth', {
  init: function init() {
    this.el.addEventListener('model-loaded', function (e) {
      e.detail.model.traverse(function (node) {
        if (node.isMesh) node.geometry.computeVertexNormals();
      });
    });
  }
});

},{}],32:[function(require,module,exports){
'use strict';

/**
 * Recursively applies a MeshNormalMaterial to the entity, such that
 * face colors are determined by their orientation. Helpful for
 * debugging geometry
 */

module.exports = AFRAME.registerComponent('normal-material', {
  init: function init() {
    this.material = new THREE.MeshNormalMaterial({ flatShading: true });
    this.applyMaterial = this.applyMaterial.bind(this);
    this.el.addEventListener('object3dset', this.applyMaterial);
  },

  remove: function remove() {
    this.el.removeEventListener('object3dset', this.applyMaterial);
  },

  applyMaterial: function applyMaterial() {
    var _this = this;

    this.el.object3D.traverse(function (node) {
      if (node.isMesh) node.material = _this.material;
    });
  }
});

},{}],33:[function(require,module,exports){
'use strict';

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
    objects: { default: '' },
    state: { default: 'collided' },
    radius: { default: 0.05 },
    watch: { default: true }
  },

  init: function init() {
    /** @type {MutationObserver} */
    this.observer = null;
    /** @type {Array<Element>} Elements to watch for collisions. */
    this.els = [];
    /** @type {Array<Element>} Elements currently in collision state. */
    this.collisions = [];

    this.handleHit = this.handleHit.bind(this);
    this.handleHitEnd = this.handleHitEnd.bind(this);
  },

  remove: function remove() {
    this.pause();
  },

  play: function play() {
    var sceneEl = this.el.sceneEl;

    if (this.data.watch) {
      this.observer = new MutationObserver(this.update.bind(this, null));
      this.observer.observe(sceneEl, { childList: true, subtree: true });
    }
  },

  pause: function pause() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  },

  /**
   * Update list of entities to test for collision.
   */
  update: function update() {
    var data = this.data;
    var objectEls = void 0;

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

  tick: function () {
    var position = new THREE.Vector3(),
        meshPosition = new THREE.Vector3(),
        colliderScale = new THREE.Vector3(),
        distanceMap = new Map();
    return function () {
      var el = this.el,
          data = this.data,
          mesh = el.getObject3D('mesh'),
          collisions = [];
      var colliderRadius = void 0;

      if (!mesh) {
        return;
      }

      distanceMap.clear();
      position.copy(el.object3D.getWorldPosition());
      el.object3D.getWorldScale(colliderScale);
      colliderRadius = data.radius * scaleFactor(colliderScale);
      // Update collision list.
      this.els.forEach(intersect);

      // Emit events and add collision states, in order of distance.
      collisions.sort(function (a, b) {
        return distanceMap.get(a) > distanceMap.get(b) ? 1 : -1;
      }).forEach(this.handleHit);

      // Remove collision state from current element.
      if (collisions.length === 0) {
        el.emit('hit', { el: null });
      }

      // Remove collision state from other elements.
      this.collisions.filter(function (el) {
        return !distanceMap.has(el);
      }).forEach(this.handleHitEnd);

      // Store new collisions
      this.collisions = collisions;

      // Bounding sphere collision detection
      function intersect(el) {
        var radius = void 0,
            mesh = void 0,
            distance = void 0,
            box = void 0,
            extent = void 0,
            size = void 0;

        if (!el.isEntity) {
          return;
        }

        mesh = el.getObject3D('mesh');

        if (!mesh) {
          return;
        }

        box = new THREE.Box3().setFromObject(mesh);
        size = box.getSize();
        extent = Math.max(size.x, size.y, size.z) / 2;
        radius = Math.sqrt(2 * extent * extent);
        box.getCenter(meshPosition);

        if (!radius) {
          return;
        }

        distance = position.distanceTo(meshPosition);
        if (distance < radius + colliderRadius) {
          collisions.push(el);
          distanceMap.set(el, distance);
        }
      }
      // use max of scale factors to maintain bounding sphere collision
      function scaleFactor(scaleVec) {
        return Math.max.apply(null, scaleVec.toArray());
      }
    };
  }(),

  handleHit: function handleHit(targetEl) {
    targetEl.emit('hit');
    targetEl.addState(this.data.state);
    this.el.emit('hit', { el: targetEl });
  },
  handleHitEnd: function handleHitEnd(targetEl) {
    targetEl.emit('hitend');
    targetEl.removeState(this.data.state);
    this.el.emit('hitend', { el: targetEl });
  }
});

},{}],34:[function(require,module,exports){
'use strict';

require('./nav-mesh');
require('./nav-agent');
require('./system');

},{"./nav-agent":35,"./nav-mesh":36,"./system":37}],35:[function(require,module,exports){
'use strict';

module.exports = AFRAME.registerComponent('nav-agent', {
  schema: {
    destination: { type: 'vec3' },
    active: { default: false },
    speed: { default: 2 }
  },
  init: function init() {
    this.system = this.el.sceneEl.systems.nav;
    this.system.addAgent(this);
    this.group = null;
    this.path = [];
    this.raycaster = new THREE.Raycaster();
  },
  remove: function remove() {
    this.system.removeAgent(this);
  },
  update: function update() {
    this.path.length = 0;
  },
  updateNavLocation: function updateNavLocation() {
    this.group = null;
    this.path = [];
  },
  tick: function () {
    var vDest = new THREE.Vector3();
    var vDelta = new THREE.Vector3();
    var vNext = new THREE.Vector3();

    return function (t, dt) {
      var el = this.el;
      var data = this.data;
      var raycaster = this.raycaster;
      var speed = data.speed * dt / 1000;

      if (!data.active) return;

      // Use PatrolJS pathfinding system to get shortest path to target.
      if (!this.path.length) {
        var position = this.el.object3D.position;
        this.group = this.group || this.system.getGroup(position);
        this.path = this.system.getPath(position, vDest.copy(data.destination), this.group) || [];
        el.emit('nav-start');
      }

      // If no path is found, exit.
      if (!this.path.length) {
        console.warn('[nav] Unable to find path to %o.', data.destination);
        this.el.setAttribute('nav-agent', { active: false });
        el.emit('nav-end');
        return;
      }

      // Current segment is a vector from current position to next waypoint.
      var vCurrent = el.object3D.position;
      var vWaypoint = this.path[0];
      vDelta.subVectors(vWaypoint, vCurrent);

      var distance = vDelta.length();
      var gazeTarget = void 0;

      if (distance < speed) {
        // If <1 step from current waypoint, discard it and move toward next.
        this.path.shift();

        // After discarding the last waypoint, exit pathfinding.
        if (!this.path.length) {
          this.el.setAttribute('nav-agent', { active: false });
          el.emit('nav-end');
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
      raycaster.ray.direction.y = -1;
      var intersections = raycaster.intersectObject(this.system.getNavMesh());

      if (!intersections.length) {
        // Raycasting failed. Step toward the waypoint and hope for the best.
        vCurrent.copy(vNext);
      } else {
        // Re-project next position onto nav mesh.
        vDelta.subVectors(intersections[0].point, vCurrent);
        vCurrent.add(vDelta.setLength(speed));
      }
    };
  }()
});

},{}],36:[function(require,module,exports){
'use strict';

/**
 * nav-mesh
 *
 * Waits for a mesh to be loaded on the current entity, then sets it as the
 * nav mesh in the pathfinding system.
 */

module.exports = AFRAME.registerComponent('nav-mesh', {
  init: function init() {
    this.system = this.el.sceneEl.systems.nav;
    this.hasLoadedNavMesh = false;
    this.el.addEventListener('model-loaded', this.loadNavMesh.bind(this));
  },

  play: function play() {
    if (!this.hasLoadedNavMesh) this.loadNavMesh();
  },

  loadNavMesh: function loadNavMesh() {
    var object = this.el.getObject3D('mesh');
    var scene = this.el.sceneEl.object3D;

    if (!object) return;

    var navMesh = void 0;
    object.traverse(function (node) {
      if (node.isMesh) navMesh = node;
    });

    if (!navMesh) return;

    var navMeshGeometry = navMesh.geometry.isBufferGeometry ? new THREE.Geometry().fromBufferGeometry(navMesh.geometry) : navMesh.geometry.clone();

    scene.updateMatrixWorld();
    navMeshGeometry.applyMatrix(navMesh.matrixWorld);
    this.system.setNavMeshGeometry(navMeshGeometry);

    this.hasLoadedNavMesh = true;
  }
});

},{}],37:[function(require,module,exports){
'use strict';

var Path = require('three-pathfinding');

var pathfinder = new Path();
var ZONE = 'level';

/**
 * nav
 *
 * Pathfinding system, using PatrolJS.
 */
module.exports = AFRAME.registerSystem('nav', {
  init: function init() {
    this.navMesh = null;
    this.agents = new Set();
  },

  /**
   * @param {THREE.Geometry} geometry
   */
  setNavMeshGeometry: function setNavMeshGeometry(geometry) {
    this.navMesh = new THREE.Mesh(geometry);
    pathfinder.setZoneData(ZONE, Path.createZone(geometry));
    Array.from(this.agents).forEach(function (agent) {
      return agent.updateNavLocation();
    });
  },

  /**
   * @return {THREE.Mesh}
   */
  getNavMesh: function getNavMesh() {
    return this.navMesh;
  },

  /**
   * @param {NavAgent} ctrl
   */
  addAgent: function addAgent(ctrl) {
    this.agents.add(ctrl);
  },

  /**
   * @param {NavAgent} ctrl
   */
  removeAgent: function removeAgent(ctrl) {
    this.agents.delete(ctrl);
  },

  /**
   * @param  {THREE.Vector3} start
   * @param  {THREE.Vector3} end
   * @param  {number} groupID
   * @return {Array<THREE.Vector3>}
   */
  getPath: function getPath(start, end, groupID) {
    return this.navMesh ? pathfinder.findPath(start, end, ZONE, groupID) : null;
  },

  /**
   * @param {THREE.Vector3} position
   * @return {number}
   */
  getGroup: function getGroup(position) {
    return this.navMesh ? pathfinder.getGroup(ZONE, position) : null;
  },

  /**
   * @param  {THREE.Vector3} position
   * @param  {number} groupID
   * @return {Node}
   */
  getNode: function getNode(position, groupID) {
    return this.navMesh ? pathfinder.getClosestNode(position, ZONE, groupID, true) : null;
  },

  /**
   * @param  {THREE.Vector3} start Starting position.
   * @param  {THREE.Vector3} end Desired ending position.
   * @param  {number} groupID
   * @param  {Node} node
   * @param  {THREE.Vector3} endTarget (Output) Adjusted step end position.
   * @return {Node} Current node, after step is taken.
   */
  clampStep: function clampStep(start, end, groupID, node, endTarget) {
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

},{"three-pathfinding":47}],38:[function(require,module,exports){
'use strict';

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
    rotation: { x: -90, y: 0, z: 0 },
    material: {
      src: 'url(https://cdn.rawgit.com/donmccurdy/aframe-extras/v1.16.3/assets/grid.png)',
      repeat: '75 75'
    }
  },
  mappings: {
    width: 'geometry.width',
    height: 'geometry.height',
    src: 'material.src'
  }
});

},{}],39:[function(require,module,exports){
'use strict';

var vg = require('../../lib/hex-grid.min.js');
var defaultHexGrid = require('../../lib/default-hex-grid');

/**
 * Hex grid.
 */
module.exports.Primitive = AFRAME.registerPrimitive('a-hexgrid', {
  defaultComponents: {
    'hexgrid': {}
  },
  mappings: {
    src: 'hexgrid.src'
  }
});

module.exports.Component = AFRAME.registerComponent('hexgrid', {
  dependencies: ['material'],
  schema: {
    src: { type: 'asset' }
  },
  init: function init() {
    var _this = this;

    var data = this.data;
    if (data.src) {
      fetch(data.src).then(function (response) {
        return response.json();
      }).then(function (json) {
        return _this.addMesh(json);
      });
    } else {
      this.addMesh(defaultHexGrid);
    }
  },
  addMesh: function addMesh(json) {
    var grid = new vg.HexGrid();
    grid.fromJSON(json);
    var board = new vg.Board(grid);
    board.generateTilemap();
    this.el.setObject3D('mesh', board.group);
    this.addMaterial();
  },
  addMaterial: function addMaterial() {
    var materialComponent = this.el.components.material;
    var material = (materialComponent || {}).material;
    if (!material) return;
    this.el.object3D.traverse(function (node) {
      if (node.isMesh) {
        node.material = material;
      }
    });
  },
  remove: function remove() {
    this.el.removeObject3D('mesh');
  }
});

},{"../../lib/default-hex-grid":7,"../../lib/hex-grid.min.js":9}],40:[function(require,module,exports){
'use strict';

/**
 * Flat-shaded ocean primitive.
 *
 * Based on a Codrops tutorial:
 * http://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
 */

module.exports.Primitive = AFRAME.registerPrimitive('a-ocean', {
  defaultComponents: {
    ocean: {},
    rotation: { x: -90, y: 0, z: 0 }
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
    width: { default: 10, min: 0 },
    depth: { default: 10, min: 0 },

    // Density of waves.
    density: { default: 10 },

    // Wave amplitude and variance.
    amplitude: { default: 0.1 },
    amplitudeVariance: { default: 0.3 },

    // Wave speed and variance.
    speed: { default: 1 },
    speedVariance: { default: 2 },

    // Material.
    color: { default: '#7AD2F7', type: 'color' },
    opacity: { default: 0.8 }
  },

  /**
   * Use play() instead of init(), because component mappings – unavailable as dependencies – are
   * not guaranteed to have parsed when this component is initialized.
   */
  play: function play() {
    var el = this.el,
        data = this.data;
    var material = el.components.material;

    var geometry = new THREE.PlaneGeometry(data.width, data.depth, data.density, data.density);
    geometry.mergeVertices();
    this.waves = [];
    for (var v, i = 0, l = geometry.vertices.length; i < l; i++) {
      v = geometry.vertices[i];
      this.waves.push({
        z: v.z,
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
        shading: THREE.FlatShading
      });
    }

    this.mesh = new THREE.Mesh(geometry, material.material);
    el.setObject3D('mesh', this.mesh);
  },

  remove: function remove() {
    this.el.removeObject3D('mesh');
  },

  tick: function tick(t, dt) {
    if (!dt) return;

    var verts = this.mesh.geometry.vertices;
    for (var v, vprops, i = 0; v = verts[i]; i++) {
      vprops = this.waves[i];
      v.z = vprops.z + Math.sin(vprops.ang) * vprops.amp;
      vprops.ang += vprops.speed * dt;
    }
    this.mesh.geometry.verticesNeedUpdate = true;
  }
});

},{}],41:[function(require,module,exports){
'use strict';

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
    tube: {}
  },
  mappings: {
    path: 'tube.path',
    segments: 'tube.segments',
    radius: 'tube.radius',
    radialSegments: 'tube.radialSegments',
    closed: 'tube.closed'
  }
});

module.exports.Component = AFRAME.registerComponent('tube', {
  schema: {
    path: { default: [] },
    segments: { default: 64 },
    radius: { default: 1 },
    radialSegments: { default: 8 },
    closed: { default: false }
  },

  init: function init() {
    var el = this.el,
        data = this.data;
    var material = el.components.material;

    if (!data.path.length) {
      console.error('[a-tube] `path` property expected but not found.');
      return;
    }

    var curve = new THREE.CatmullRomCurve3(data.path.map(function (point) {
      point = point.split(' ');
      return new THREE.Vector3(Number(point[0]), Number(point[1]), Number(point[2]));
    }));
    var geometry = new THREE.TubeGeometry(curve, data.segments, data.radius, data.radialSegments, data.closed);

    if (!material) {
      material = {};
      material.material = new THREE.MeshPhongMaterial();
    }

    this.mesh = new THREE.Mesh(geometry, material.material);
    this.el.setObject3D('mesh', this.mesh);
  },

  remove: function remove() {
    if (this.mesh) this.el.removeObject3D('mesh');
  }
});

},{}],42:[function(require,module,exports){
'use strict';

require('./a-grid');
require('./a-hexgrid');
require('./a-ocean');
require('./a-tube');

},{"./a-grid":38,"./a-hexgrid":39,"./a-ocean":40,"./a-tube":41}],43:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BinaryHeap = require('./BinaryHeap');
var utils = require('./utils.js');

var AStar = function () {
  function AStar() {
    _classCallCheck(this, AStar);
  }

  _createClass(AStar, null, [{
    key: 'init',
    value: function init(graph) {
      for (var x = 0; x < graph.length; x++) {
        //for(var x in graph) {
        var node = graph[x];
        node.f = 0;
        node.g = 0;
        node.h = 0;
        node.cost = 1.0;
        node.visited = false;
        node.closed = false;
        node.parent = null;
      }
    }
  }, {
    key: 'cleanUp',
    value: function cleanUp(graph) {
      for (var x = 0; x < graph.length; x++) {
        var node = graph[x];
        delete node.f;
        delete node.g;
        delete node.h;
        delete node.cost;
        delete node.visited;
        delete node.closed;
        delete node.parent;
      }
    }
  }, {
    key: 'heap',
    value: function heap() {
      return new BinaryHeap(function (node) {
        return node.f;
      });
    }
  }, {
    key: 'search',
    value: function search(graph, start, end) {
      this.init(graph);
      //heuristic = heuristic || astar.manhattan;


      var openHeap = this.heap();

      openHeap.push(start);

      while (openHeap.size() > 0) {

        // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
        var currentNode = openHeap.pop();

        // End case -- result has been found, return the traced path.
        if (currentNode === end) {
          var curr = currentNode;
          var ret = [];
          while (curr.parent) {
            ret.push(curr);
            curr = curr.parent;
          }
          this.cleanUp(ret);
          return ret.reverse();
        }

        // Normal case -- move currentNode from open to closed, process each of its neighbours.
        currentNode.closed = true;

        // Find all neighbours for the current node. Optionally find diagonal neighbours as well (false by default).
        var neighbours = this.neighbours(graph, currentNode);

        for (var i = 0, il = neighbours.length; i < il; i++) {
          var neighbour = neighbours[i];

          if (neighbour.closed) {
            // Not a valid node to process, skip to next neighbour.
            continue;
          }

          // The g score is the shortest distance from start to current node.
          // We need to check if the path we have arrived at this neighbour is the shortest one we have seen yet.
          var gScore = currentNode.g + neighbour.cost;
          var beenVisited = neighbour.visited;

          if (!beenVisited || gScore < neighbour.g) {

            // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
            neighbour.visited = true;
            neighbour.parent = currentNode;
            if (!neighbour.centroid || !end.centroid) throw new Error('Unexpected state');
            neighbour.h = neighbour.h || this.heuristic(neighbour.centroid, end.centroid);
            neighbour.g = gScore;
            neighbour.f = neighbour.g + neighbour.h;

            if (!beenVisited) {
              // Pushing to heap will put it in proper place based on the 'f' value.
              openHeap.push(neighbour);
            } else {
              // Already seen the node, but since it has been rescored we need to reorder it in the heap
              openHeap.rescoreElement(neighbour);
            }
          }
        }
      }

      // No result was found - empty array signifies failure to find path.
      return [];
    }
  }, {
    key: 'heuristic',
    value: function heuristic(pos1, pos2) {
      return utils.distanceToSquared(pos1, pos2);
    }
  }, {
    key: 'neighbours',
    value: function neighbours(graph, node) {
      var ret = [];

      for (var e = 0; e < node.neighbours.length; e++) {
        ret.push(graph[node.neighbours[e]]);
      }

      return ret;
    }
  }]);

  return AStar;
}();

module.exports = AStar;

},{"./BinaryHeap":44,"./utils.js":48}],44:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// javascript-astar
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a binary heap.

var BinaryHeap = function () {
  function BinaryHeap(scoreFunction) {
    _classCallCheck(this, BinaryHeap);

    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  _createClass(BinaryHeap, [{
    key: "push",
    value: function push(element) {
      // Add the new element to the end of the array.
      this.content.push(element);

      // Allow it to sink down.
      this.sinkDown(this.content.length - 1);
    }
  }, {
    key: "pop",
    value: function pop() {
      // Store the first element so we can return it later.
      var result = this.content[0];
      // Get the element at the end of the array.
      var end = this.content.pop();
      // If there are any elements left, put the end element at the
      // start, and let it bubble up.
      if (this.content.length > 0) {
        this.content[0] = end;
        this.bubbleUp(0);
      }
      return result;
    }
  }, {
    key: "remove",
    value: function remove(node) {
      var i = this.content.indexOf(node);

      // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.
      var end = this.content.pop();

      if (i !== this.content.length - 1) {
        this.content[i] = end;

        if (this.scoreFunction(end) < this.scoreFunction(node)) {
          this.sinkDown(i);
        } else {
          this.bubbleUp(i);
        }
      }
    }
  }, {
    key: "size",
    value: function size() {
      return this.content.length;
    }
  }, {
    key: "rescoreElement",
    value: function rescoreElement(node) {
      this.sinkDown(this.content.indexOf(node));
    }
  }, {
    key: "sinkDown",
    value: function sinkDown(n) {
      // Fetch the element that has to be sunk.
      var element = this.content[n];

      // When at 0, an element can not sink any further.
      while (n > 0) {
        // Compute the parent element's index, and fetch it.
        var parentN = (n + 1 >> 1) - 1;
        var parent = this.content[parentN];

        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
          // Swap the elements if the parent is greater.
          this.content[parentN] = element;
          this.content[n] = parent;
          // Update 'n' to continue at the new position.
          n = parentN;
        } else {
          // Found a parent that is less, no need to sink any further.
          break;
        }
      }
    }
  }, {
    key: "bubbleUp",
    value: function bubbleUp(n) {
      // Look up the target element and its score.
      var length = this.content.length,
          element = this.content[n],
          elemScore = this.scoreFunction(element);

      while (true) {
        // Compute the indices of the child elements.
        var child2N = n + 1 << 1,
            child1N = child2N - 1;
        // This is used to store the new position of the element,
        // if any.
        var swap = null;
        var child1Score = void 0;
        // If the first child exists (is inside the array)...
        if (child1N < length) {
          // Look it up and compute its score.
          var child1 = this.content[child1N];
          child1Score = this.scoreFunction(child1);

          // If the score is less than our element's, we need to swap.
          if (child1Score < elemScore) {
            swap = child1N;
          }
        }

        // Do the same checks for the other child.
        if (child2N < length) {
          var child2 = this.content[child2N],
              child2Score = this.scoreFunction(child2);
          if (child2Score < (swap === null ? elemScore : child1Score)) {
            swap = child2N;
          }
        }

        // If the element needs to be moved, swap it, and continue.
        if (swap !== null) {
          this.content[n] = this.content[swap];
          this.content[swap] = element;
          n = swap;
        }

        // Otherwise, we are done.
        else {
            break;
          }
      }
    }
  }]);

  return BinaryHeap;
}();

module.exports = BinaryHeap;

},{}],45:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = require('./utils');

var polygonId = 1;

var Builder = function () {
  function Builder() {
    _classCallCheck(this, Builder);
  }

  _createClass(Builder, null, [{
    key: 'buildZone',

    /**
     * Constructs groups from the given navigation mesh.
     * @param  {THREE.Geometry} geometry
     * @return {Zone}
     */
    value: function buildZone(geometry) {
      var _this = this;

      var navMesh = this._buildNavigationMesh(geometry);

      var zone = {};

      navMesh.vertices.forEach(function (v) {
        v.x = utils.roundNumber(v.x, 2);
        v.y = utils.roundNumber(v.y, 2);
        v.z = utils.roundNumber(v.z, 2);
      });

      zone.vertices = navMesh.vertices;

      var groups = this._buildPolygonGroups(navMesh);

      zone.groups = [];

      var findPolygonIndex = function findPolygonIndex(group, p) {
        for (var i = 0; i < group.length; i++) {
          if (p === group[i]) return i;
        }
      };

      groups.forEach(function (group) {

        var newGroup = [];

        group.forEach(function (p) {

          var neighbours = p.neighbours.map(function (n) {
            return findPolygonIndex(group, n);
          });

          // Build a portal list to each neighbour
          var portals = p.neighbours.map(function (n) {
            return _this._getSharedVerticesInOrder(p, n);
          });

          p.centroid.x = utils.roundNumber(p.centroid.x, 2);
          p.centroid.y = utils.roundNumber(p.centroid.y, 2);
          p.centroid.z = utils.roundNumber(p.centroid.z, 2);

          newGroup.push({
            id: findPolygonIndex(group, p),
            neighbours: neighbours,
            vertexIds: p.vertexIds,
            centroid: p.centroid,
            portals: portals
          });
        });

        zone.groups.push(newGroup);
      });

      return zone;
    }

    /**
     * Constructs a navigation mesh from the given geometry.
     * @param {THREE.Geometry} geometry
     * @return {Object}
     */

  }, {
    key: '_buildNavigationMesh',
    value: function _buildNavigationMesh(geometry) {
      utils.computeCentroids(geometry);
      geometry.mergeVertices();
      return this._buildPolygonsFromGeometry(geometry);
    }
  }, {
    key: '_buildPolygonGroups',
    value: function _buildPolygonGroups(navigationMesh) {

      var polygons = navigationMesh.polygons;

      var polygonGroups = [];
      var groupCount = 0;

      var spreadGroupId = function spreadGroupId(polygon) {
        polygon.neighbours.forEach(function (neighbour) {
          if (neighbour.group === undefined) {
            neighbour.group = polygon.group;
            spreadGroupId(neighbour);
          }
        });
      };

      polygons.forEach(function (polygon) {

        if (polygon.group === undefined) {
          polygon.group = groupCount++;
          // Spread it
          spreadGroupId(polygon);
        }

        if (!polygonGroups[polygon.group]) polygonGroups[polygon.group] = [];

        polygonGroups[polygon.group].push(polygon);
      });

      return polygonGroups;
    }
  }, {
    key: '_buildPolygonNeighbours',
    value: function _buildPolygonNeighbours(polygon, navigationMesh) {
      polygon.neighbours = [];

      // All other nodes that contain at least two of our vertices are our neighbours
      for (var i = 0, len = navigationMesh.polygons.length; i < len; i++) {
        if (polygon === navigationMesh.polygons[i]) continue;

        // Don't check polygons that are too far, since the intersection tests take a long time
        if (polygon.centroid.distanceToSquared(navigationMesh.polygons[i].centroid) > 100 * 100) continue;

        var matches = utils.array_intersect(polygon.vertexIds, navigationMesh.polygons[i].vertexIds);

        if (matches.length >= 2) {
          polygon.neighbours.push(navigationMesh.polygons[i]);
        }
      }
    }
  }, {
    key: '_buildPolygonsFromGeometry',
    value: function _buildPolygonsFromGeometry(geometry) {
      var _this2 = this;

      var polygons = [];
      var vertices = geometry.vertices;
      var faceVertexUvs = geometry.faceVertexUvs;

      // Convert the faces into a custom format that supports more than 3 vertices
      geometry.faces.forEach(function (face) {
        polygons.push({
          id: polygonId++,
          vertexIds: [face.a, face.b, face.c],
          centroid: face.centroid,
          normal: face.normal,
          neighbours: []
        });
      });

      var navigationMesh = {
        polygons: polygons,
        vertices: vertices,
        faceVertexUvs: faceVertexUvs
      };

      // Build a list of adjacent polygons
      polygons.forEach(function (polygon) {
        _this2._buildPolygonNeighbours(polygon, navigationMesh);
      });

      return navigationMesh;
    }
  }, {
    key: '_getSharedVerticesInOrder',
    value: function _getSharedVerticesInOrder(a, b) {

      var aList = a.vertexIds;
      var bList = b.vertexIds;

      var sharedVertices = [];

      aList.forEach(function (vId) {
        if (bList.includes(vId)) {
          sharedVertices.push(vId);
        }
      });

      if (sharedVertices.length < 2) return [];

      if (sharedVertices.includes(aList[0]) && sharedVertices.includes(aList[aList.length - 1])) {
        // Vertices on both edges are bad, so shift them once to the left
        aList.push(aList.shift());
      }

      if (sharedVertices.includes(bList[0]) && sharedVertices.includes(bList[bList.length - 1])) {
        // Vertices on both edges are bad, so shift them once to the left
        bList.push(bList.shift());
      }

      // Again!
      sharedVertices.length = 0;

      aList.forEach(function (vId) {
        if (bList.includes(vId)) {
          sharedVertices.push(vId);
        }
      });

      return sharedVertices;
    }
  }]);

  return Builder;
}();

module.exports = Builder;

},{"./utils":48}],46:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = require('./utils');

var Channel = function () {
  function Channel() {
    _classCallCheck(this, Channel);

    this.portals = [];
  }

  _createClass(Channel, [{
    key: 'push',
    value: function push(p1, p2) {
      if (p2 === undefined) p2 = p1;
      this.portals.push({
        left: p1,
        right: p2
      });
    }
  }, {
    key: 'stringPull',
    value: function stringPull() {
      var portals = this.portals;
      var pts = [];
      // Init scan state
      var portalApex = void 0,
          portalLeft = void 0,
          portalRight = void 0;
      var apexIndex = 0,
          leftIndex = 0,
          rightIndex = 0;

      portalApex = portals[0].left;
      portalLeft = portals[0].left;
      portalRight = portals[0].right;

      // Add start point.
      pts.push(portalApex);

      for (var i = 1; i < portals.length; i++) {
        var left = portals[i].left;
        var right = portals[i].right;

        // Update right vertex.
        if (utils.triarea2(portalApex, portalRight, right) <= 0.0) {
          if (utils.vequal(portalApex, portalRight) || utils.triarea2(portalApex, portalLeft, right) > 0.0) {
            // Tighten the funnel.
            portalRight = right;
            rightIndex = i;
          } else {
            // Right over left, insert left to path and restart scan from portal left point.
            pts.push(portalLeft);
            // Make current left the new apex.
            portalApex = portalLeft;
            apexIndex = leftIndex;
            // Reset portal
            portalLeft = portalApex;
            portalRight = portalApex;
            leftIndex = apexIndex;
            rightIndex = apexIndex;
            // Restart scan
            i = apexIndex;
            continue;
          }
        }

        // Update left vertex.
        if (utils.triarea2(portalApex, portalLeft, left) >= 0.0) {
          if (utils.vequal(portalApex, portalLeft) || utils.triarea2(portalApex, portalRight, left) < 0.0) {
            // Tighten the funnel.
            portalLeft = left;
            leftIndex = i;
          } else {
            // Left over right, insert right to path and restart scan from portal right point.
            pts.push(portalRight);
            // Make current right the new apex.
            portalApex = portalRight;
            apexIndex = rightIndex;
            // Reset portal
            portalLeft = portalApex;
            portalRight = portalApex;
            leftIndex = apexIndex;
            rightIndex = apexIndex;
            // Restart scan
            i = apexIndex;
            continue;
          }
        }
      }

      if (pts.length === 0 || !utils.vequal(pts[pts.length - 1], portals[portals.length - 1].left)) {
        // Append last point to path.
        pts.push(portals[portals.length - 1].left);
      }

      this.path = pts;
      return pts;
    }
  }]);

  return Channel;
}();

module.exports = Channel;

},{"./utils":48}],47:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global THREE */

var utils = require('./utils');
var AStar = require('./AStar');
var Builder = require('./Builder');
var Channel = require('./Channel');

/**
 * Defines an instance of the pathfinding module, with one or more zones.
 */

var Path = function () {
	function Path() {
		_classCallCheck(this, Path);

		this.zones = {};
	}

	/**
  * (Static) Builds a zone/node set from navigation mesh geometry.
  * @param  {THREE.Geometry} geometry
  * @return {Zone}
  */


	_createClass(Path, [{
		key: 'setZoneData',


		/**
   * Sets data for the given zone.
   * @param {string} zoneID
   * @param {Zone} zone
   */
		value: function setZoneData(zoneID, zone) {
			this.zones[zoneID] = zone;
		}

		/**
   * Returns closest node group ID for given position.
   * @param  {string} zoneID
   * @param  {THREE.Vector3} position
   * @return {number}
   */

	}, {
		key: 'getGroup',
		value: function getGroup(zoneID, position) {
			if (!this.zones[zoneID]) return null;

			var closestNodeGroup = null;
			var distance = Math.pow(50, 2);

			this.zones[zoneID].groups.forEach(function (group, index) {
				group.forEach(function (node) {
					var measuredDistance = utils.distanceToSquared(node.centroid, position);
					if (measuredDistance < distance) {
						closestNodeGroup = index;
						distance = measuredDistance;
					}
				});
			});

			return closestNodeGroup;
		}

		/**
   * Returns a random node within a given range of a given position.
   * @param  {string} zoneID
   * @param  {number} groupID
   * @param  {THREE.Vector3} nearPosition
   * @param  {number} nearRange
   * @return {Node}
   */

	}, {
		key: 'getRandomNode',
		value: function getRandomNode(zoneID, groupID, nearPosition, nearRange) {

			if (!this.zones[zoneID]) return new THREE.Vector3();

			nearPosition = nearPosition || null;
			nearRange = nearRange || 0;

			var candidates = [];
			var polygons = this.zones[zoneID].groups[groupID];

			polygons.forEach(function (p) {
				if (nearPosition && nearRange) {
					if (utils.distanceToSquared(nearPosition, p.centroid) < nearRange * nearRange) {
						candidates.push(p.centroid);
					}
				} else {
					candidates.push(p.centroid);
				}
			});

			return utils.sample(candidates) || new THREE.Vector3();
		}

		/**
   * Returns the closest node to the target position.
   * @param  {THREE.Vector3} position
   * @param  {string}  zoneID
   * @param  {number}  groupID
   * @param  {boolean} checkPolygon
   * @return {Node}
   */

	}, {
		key: 'getClosestNode',
		value: function getClosestNode(position, zoneID, groupID) {
			var checkPolygon = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

			var nodes = this.zones[zoneID].groups[groupID];
			var vertices = this.zones[zoneID].vertices;
			var closestNode = null;
			var closestDistance = Infinity;

			nodes.forEach(function (node) {
				var distance = utils.distanceToSquared(node.centroid, position);
				if (distance < closestDistance && (!checkPolygon || utils.isVectorInPolygon(position, node, vertices))) {
					closestNode = node;
					closestDistance = distance;
				}
			});

			return closestNode;
		}

		/**
   * Returns a path between given start and end points. If a complete path
   * cannot be found, will return the nearest endpoint available.
   *
   * @param  {THREE.Vector3} startPosition Start position.
   * @param  {THREE.Vector3} targetPosition Destination.
   * @param  {string} zoneID ID of current zone.
   * @param  {number} groupID Current group ID.
   * @return {Array<THREE.Vector3>} Array of points defining the path.
   */

	}, {
		key: 'findPath',
		value: function findPath(startPosition, targetPosition, zoneID, groupID) {
			var nodes = this.zones[zoneID].groups[groupID];
			var vertices = this.zones[zoneID].vertices;

			var closestNode = this.getClosestNode(startPosition, zoneID, groupID);
			var farthestNode = this.getClosestNode(targetPosition, zoneID, groupID, true);

			// If we can't find any node, just go straight to the target
			if (!closestNode || !farthestNode) {
				return null;
			}

			var paths = AStar.search(nodes, closestNode, farthestNode);

			var getPortalFromTo = function getPortalFromTo(a, b) {
				for (var i = 0; i < a.neighbours.length; i++) {
					if (a.neighbours[i] === b.id) {
						return a.portals[i];
					}
				}
			};

			// We have the corridor, now pull the rope.
			var channel = new Channel();
			channel.push(startPosition);
			for (var i = 0; i < paths.length; i++) {
				var polygon = paths[i];
				var nextPolygon = paths[i + 1];

				if (nextPolygon) {
					var portals = getPortalFromTo(polygon, nextPolygon);
					channel.push(vertices[portals[0]], vertices[portals[1]]);
				}
			}
			channel.push(targetPosition);
			channel.stringPull();

			// Return the path, omitting first position (which is already known).
			var path = channel.path.map(function (c) {
				return new THREE.Vector3(c.x, c.y, c.z);
			});
			path.shift();
			return path;
		}
	}], [{
		key: 'createZone',
		value: function createZone(geometry) {
			return Builder.buildZone(geometry);
		}
	}]);

	return Path;
}();

/**
 * Clamps a step along the navmesh, given start and desired endpoint. May be
 * used to constrain first-person / WASD controls.
 *
 * @param  {THREE.Vector3} start
 * @param  {THREE.Vector3} end Desired endpoint.
 * @param  {Node} node
 * @param  {string} zoneID
 * @param  {number} groupID
 * @param  {THREE.Vector3} endTarget Updated endpoint.
 * @return {Node} Updated node.
 */


Path.prototype.clampStep = function () {
	var point = new THREE.Vector3();
	var plane = new THREE.Plane();
	var triangle = new THREE.Triangle();

	var closestNode = void 0;
	var closestPoint = new THREE.Vector3();
	var closestDistance = void 0;

	return function (start, end, node, zoneID, groupID, endTarget) {
		var vertices = this.zones[zoneID].vertices;
		var nodes = this.zones[zoneID].groups[groupID];

		var nodeQueue = [node];
		var nodeDepth = {};
		nodeDepth[node.id] = 0;

		closestNode = undefined;
		closestPoint.set(0, 0, 0);
		closestDistance = Infinity;

		// Project the step along the current node.
		plane.setFromCoplanarPoints(vertices[node.vertexIds[0]], vertices[node.vertexIds[1]], vertices[node.vertexIds[2]]);
		plane.projectPoint(end, point);
		end.copy(point);

		for (var currentNode = nodeQueue.pop(); currentNode; currentNode = nodeQueue.pop()) {

			triangle.set(vertices[currentNode.vertexIds[0]], vertices[currentNode.vertexIds[1]], vertices[currentNode.vertexIds[2]]);

			triangle.closestPointToPoint(end, point);

			if (point.distanceToSquared(end) < closestDistance) {
				closestNode = currentNode;
				closestPoint.copy(point);
				closestDistance = point.distanceToSquared(end);
			}

			var depth = nodeDepth[currentNode];
			if (depth > 2) continue;

			for (var i = 0; i < currentNode.neighbours.length; i++) {
				var neighbour = nodes[currentNode.neighbours[i]];
				if (neighbour.id in nodeDepth) continue;

				nodeQueue.push(neighbour);
				nodeDepth[neighbour.id] = depth + 1;
			}
		}

		endTarget.copy(closestPoint);
		return closestNode;
	};
}();

/**
 * Defines a zone of interconnected groups on a navigation mesh.
 *
 * @type {Object}
 * @property {Array<Group>} groups
 * @property {Array<THREE.Vector3} vertices
 */
var Zone = {}; // jshint ignore:line

/**
 * Defines a group within a navigation mesh.
 *
 * @type {Object}
 */
var Group = {}; // jshint ignore:line

/**
 * Defines a node (or polygon) within a group.
 *
 * @type {Object}
 * @property {number} id
 * @property {Array<number>} neighbours IDs of neighboring nodes.
 * @property {Array<number} vertexIds
 * @property {THREE.Vector3} centroid
 * @property {Array<Array<number>>} portals Array of portals, each defined by two vertex IDs.
 * @property {boolean} closed
 * @property {number} cost
 */
var Node = {}; // jshint ignore:line

module.exports = Path;

},{"./AStar":43,"./Builder":45,"./Channel":46,"./utils":48}],48:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = function () {
  function Utils() {
    _classCallCheck(this, Utils);
  }

  _createClass(Utils, null, [{
    key: 'computeCentroids',
    value: function computeCentroids(geometry) {
      var f, fl, face;

      for (f = 0, fl = geometry.faces.length; f < fl; f++) {

        face = geometry.faces[f];
        face.centroid = new THREE.Vector3(0, 0, 0);

        face.centroid.add(geometry.vertices[face.a]);
        face.centroid.add(geometry.vertices[face.b]);
        face.centroid.add(geometry.vertices[face.c]);
        face.centroid.divideScalar(3);
      }
    }
  }, {
    key: 'roundNumber',
    value: function roundNumber(number, decimals) {
      var newnumber = Number(number + '').toFixed(parseInt(decimals));
      return parseFloat(newnumber);
    }
  }, {
    key: 'sample',
    value: function sample(list) {
      return list[Math.floor(Math.random() * list.length)];
    }
  }, {
    key: 'mergeVertexIds',
    value: function mergeVertexIds(aList, bList) {

      var sharedVertices = [];

      aList.forEach(function (vID) {
        if (bList.indexOf(vID) >= 0) {
          sharedVertices.push(vID);
        }
      });

      if (sharedVertices.length < 2) return [];

      if (sharedVertices.includes(aList[0]) && sharedVertices.includes(aList[aList.length - 1])) {
        // Vertices on both edges are bad, so shift them once to the left
        aList.push(aList.shift());
      }

      if (sharedVertices.includes(bList[0]) && sharedVertices.includes(bList[bList.length - 1])) {
        // Vertices on both edges are bad, so shift them once to the left
        bList.push(bList.shift());
      }

      // Again!
      sharedVertices = [];

      aList.forEach(function (vId) {
        if (bList.includes(vId)) {
          sharedVertices.push(vId);
        }
      });

      var clockwiseMostSharedVertex = sharedVertices[1];
      var counterClockwiseMostSharedVertex = sharedVertices[0];

      var cList = aList.slice();
      while (cList[0] !== clockwiseMostSharedVertex) {
        cList.push(cList.shift());
      }

      var c = 0;

      var temp = bList.slice();
      while (temp[0] !== counterClockwiseMostSharedVertex) {
        temp.push(temp.shift());

        if (c++ > 10) throw new Error('Unexpected state');
      }

      // Shave
      temp.shift();
      temp.pop();

      cList = cList.concat(temp);

      return cList;
    }
  }, {
    key: 'setPolygonCentroid',
    value: function setPolygonCentroid(polygon, navigationMesh) {
      var sum = new THREE.Vector3();

      var vertices = navigationMesh.vertices;

      polygon.vertexIds.forEach(function (vId) {
        sum.add(vertices[vId]);
      });

      sum.divideScalar(polygon.vertexIds.length);

      polygon.centroid.copy(sum);
    }
  }, {
    key: 'cleanPolygon',
    value: function cleanPolygon(polygon, navigationMesh) {

      var newVertexIds = [];

      var vertices = navigationMesh.vertices;

      for (var i = 0; i < polygon.vertexIds.length; i++) {

        var vertex = vertices[polygon.vertexIds[i]];

        var nextVertexId, previousVertexId;
        var nextVertex, previousVertex;

        if (i === 0) {
          nextVertexId = polygon.vertexIds[1];
          previousVertexId = polygon.vertexIds[polygon.vertexIds.length - 1];
        } else if (i === polygon.vertexIds.length - 1) {
          nextVertexId = polygon.vertexIds[0];
          previousVertexId = polygon.vertexIds[polygon.vertexIds.length - 2];
        } else {
          nextVertexId = polygon.vertexIds[i + 1];
          previousVertexId = polygon.vertexIds[i - 1];
        }

        nextVertex = vertices[nextVertexId];
        previousVertex = vertices[previousVertexId];

        var a = nextVertex.clone().sub(vertex);
        var b = previousVertex.clone().sub(vertex);

        var angle = a.angleTo(b);

        if (angle > Math.PI - 0.01 && angle < Math.PI + 0.01) {

          // Remove the neighbours who had this vertex
          var goodNeighbours = [];
          polygon.neighbours.forEach(function (neighbour) {
            if (!neighbour.vertexIds.includes(polygon.vertexIds[i])) {
              goodNeighbours.push(neighbour);
            }
          });
          polygon.neighbours = goodNeighbours;

          // TODO cleanup the list of vertices and rebuild vertexIds for all polygons
        } else {
          newVertexIds.push(polygon.vertexIds[i]);
        }
      }

      polygon.vertexIds = newVertexIds;

      this.setPolygonCentroid(polygon, navigationMesh);
    }
  }, {
    key: 'isConvex',
    value: function isConvex(polygon, navigationMesh) {

      var vertices = navigationMesh.vertices;

      if (polygon.vertexIds.length < 3) return false;

      var convex = true;

      var total = 0;

      var results = [];

      for (var i = 0; i < polygon.vertexIds.length; i++) {

        var vertex = vertices[polygon.vertexIds[i]];

        var nextVertex, previousVertex;

        if (i === 0) {
          nextVertex = vertices[polygon.vertexIds[1]];
          previousVertex = vertices[polygon.vertexIds[polygon.vertexIds.length - 1]];
        } else if (i === polygon.vertexIds.length - 1) {
          nextVertex = vertices[polygon.vertexIds[0]];
          previousVertex = vertices[polygon.vertexIds[polygon.vertexIds.length - 2]];
        } else {
          nextVertex = vertices[polygon.vertexIds[i + 1]];
          previousVertex = vertices[polygon.vertexIds[i - 1]];
        }

        var a = nextVertex.clone().sub(vertex);
        var b = previousVertex.clone().sub(vertex);

        var angle = a.angleTo(b);
        total += angle;

        if (angle === Math.PI || angle === 0) return false;

        var r = a.cross(b).y;
        results.push(r);
      }

      // if ( total > (polygon.vertexIds.length-2)*Math.PI ) return false;

      results.forEach(function (r) {
        if (r === 0) convex = false;
      });

      if (results[0] > 0) {
        results.forEach(function (r) {
          if (r < 0) convex = false;
        });
      } else {
        results.forEach(function (r) {
          if (r > 0) convex = false;
        });
      }

      return convex;
    }
  }, {
    key: 'distanceToSquared',
    value: function distanceToSquared(a, b) {

      var dx = a.x - b.x;
      var dy = a.y - b.y;
      var dz = a.z - b.z;

      return dx * dx + dy * dy + dz * dz;
    }

    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]

  }, {
    key: 'isPointInPoly',
    value: function isPointInPoly(poly, pt) {
      for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
        (poly[i].z <= pt.z && pt.z < poly[j].z || poly[j].z <= pt.z && pt.z < poly[i].z) && pt.x < (poly[j].x - poly[i].x) * (pt.z - poly[i].z) / (poly[j].z - poly[i].z) + poly[i].x && (c = !c);
      }return c;
    }
  }, {
    key: 'isVectorInPolygon',
    value: function isVectorInPolygon(vector, polygon, vertices) {

      // reference point will be the centroid of the polygon
      // We need to rotate the vector as well as all the points which the polygon uses

      var lowestPoint = 100000;
      var highestPoint = -100000;

      var polygonVertices = [];

      polygon.vertexIds.forEach(function (vId) {
        lowestPoint = Math.min(vertices[vId].y, lowestPoint);
        highestPoint = Math.max(vertices[vId].y, highestPoint);
        polygonVertices.push(vertices[vId]);
      });

      if (vector.y < highestPoint + 0.5 && vector.y > lowestPoint - 0.5 && this.isPointInPoly(polygonVertices, vector)) {
        return true;
      }
      return false;
    }
  }, {
    key: 'triarea2',
    value: function triarea2(a, b, c) {
      var ax = b.x - a.x;
      var az = b.z - a.z;
      var bx = c.x - a.x;
      var bz = c.z - a.z;
      return bx * az - ax * bz;
    }
  }, {
    key: 'vequal',
    value: function vequal(a, b) {
      return this.distanceToSquared(a, b) < 0.00001;
    }
  }, {
    key: 'array_intersect',
    value: function array_intersect() {
      var i = void 0,
          shortest = void 0,
          nShortest = void 0,
          n = void 0,
          len = void 0,
          ret = [],
          obj = {},
          nOthers = void 0;
      nOthers = arguments.length - 1;
      nShortest = arguments[0].length;
      shortest = 0;
      for (i = 0; i <= nOthers; i++) {
        n = arguments[i].length;
        if (n < nShortest) {
          shortest = i;
          nShortest = n;
        }
      }

      for (i = 0; i <= nOthers; i++) {
        n = i === shortest ? 0 : i || shortest; //Read the shortest array first. Read the first array instead of the shortest
        len = arguments[n].length;
        for (var j = 0; j < len; j++) {
          var elem = arguments[n][j];
          if (obj[elem] === i - 1) {
            if (i === nOthers) {
              ret.push(elem);
              obj[elem] = 0;
            } else {
              obj[elem] = i;
            }
          } else if (i === 0) {
            obj[elem] = 0;
          }
        }
      }
      return ret;
    }
  }]);

  return Utils;
}();

module.exports = Utils;

},{}]},{},[1]);
