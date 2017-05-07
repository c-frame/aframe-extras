/**
 * @author Kyle-Larson https://github.com/Kyle-Larson
 * @author Don McCurdy
 *
 * Excerpts from FBXLoader2, intended to load FBX files containing _only_ AnimationClip information.
 * Requires FBX file to be >= 7.0 and in ASCII format.
 */

/**
 * Generates a loader for loading FBX files from URL and parsing into
 * a THREE.Group.
 * @param {THREE.LoadingManager} manager - Loading Manager for loader to use.
 */
module.exports = THREE.FBXAnimationLoader = function ( manager ) {

  this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

Object.assign( THREE.FBXAnimationLoader.prototype, {

  /**
   * Loads an ASCII FBX file from URL and parses into a THREE.Group.
   * THREE.Group will have an animations property of AnimationClips
   * of the different animations exported with the FBX.
   * @param {string} url - URL of the FBX file.
   * @param {function(THREE.Group):void} onLoad - Callback for when FBX file is loaded and parsed.
   * @param {function(ProgressEvent):void} onProgress - Callback fired periodically when file is being retrieved from server.
   * @param {function(Event):void} onError - Callback fired when error occurs (Currently only with retrieving file, not with parsing errors).
   */
  load: function ( url, onLoad, onProgress, onError ) {

    var self = this;

    var resourceDirectory = url.split( /[\\\/]/ );
    resourceDirectory.pop();
    resourceDirectory = resourceDirectory.join( '/' ) + '/';

    var loader = new THREE.FileLoader( this.manager );
    loader.load( url, function ( text ) {

      try {

        var clips = self.parse( text, resourceDirectory );

        onLoad( clips );

      } catch ( error ) {

        window.setTimeout( function () {

          if ( onError ) onError( error );

          self.manager.itemError( url );

        }, 0 );

      }

    }, onProgress, onError );

  },

  /**
   * Parses an ASCII FBX file and returns a THREE.Group.
   * THREE.Group will have an animations property of AnimationClips
   * of the different animations within the FBX file.
   * @param {string} FBXText - Contents of FBX file to parse.
   * @param {string} resourceDirectory - Directory to load external assets (e.g. textures ) from.
   * @returns {THREE.Group}
   */
  parse: function ( FBXText, resourceDirectory ) {

    if ( ! isFbxFormatASCII( FBXText ) ) {
      this.manager.itemError( url );
      throw new Error( 'FBXAnimationLoader: FBX Binary format not supported.' );
    }

    if ( getFbxVersion( FBXText ) < 7000 ) {
      this.manager.itemError( url );
      throw new Error( 'FBXAnimationLoader: FBX version not supported for file at ' + url + ', FileVersion: ' + getFbxVersion( text ) );
    }

    var FBXTree = new TextParser().parse( FBXText );

    var connections = parseConnections( FBXTree );
    var sceneGraph = parseScene( FBXTree, connections, new Map(), new Map(), new Map() );

    return sceneGraph.animations;

  }

} );

/**
 * Parses map of relationships between objects.
 * @param {{Connections: { properties: { connections: [number, number, string][]}}}} FBXTree
 * @returns {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>}
 */
function parseConnections( FBXTree ) {

  /**
   * @type {Map<number, { parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>}
   */
  var connectionMap = new Map();

  if ( 'Connections' in FBXTree ) {

    /**
     * @type {[number, number, string][]}
     */
    var connectionArray = FBXTree.Connections.properties.connections;
    for ( var connectionArrayIndex = 0, connectionArrayLength = connectionArray.length; connectionArrayIndex < connectionArrayLength; ++ connectionArrayIndex ) {

      var connection = connectionArray[ connectionArrayIndex ];

      if ( ! connectionMap.has( connection[ 0 ] ) ) {

        connectionMap.set( connection[ 0 ], {
          parents: [],
          children: []
        } );

      }

      var parentRelationship = { ID: connection[ 1 ], relationship: connection[ 2 ] };
      connectionMap.get( connection[ 0 ] ).parents.push( parentRelationship );

      if ( ! connectionMap.has( connection[ 1 ] ) ) {

        connectionMap.set( connection[ 1 ], {
          parents: [],
          children: []
        } );

      }

      var childRelationship = { ID: connection[ 0 ], relationship: connection[ 2 ] };
      connectionMap.get( connection[ 1 ] ).children.push( childRelationship );

    }

  }

  return connectionMap;

}

/**
 * Finally generates Scene graph and Scene graph Objects.
 * @param {{Objects: {subNodes: {Model: Object.<number, FBXModelNode>}}}} FBXTree
 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
 * @param {Map<number, {map: Map<number, {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}>, array: {FBX_ID: number, indices: number[], weights: number[], transform: number[], transformLink: number[], linkMode: string}[], skeleton: THREE.Skeleton|null}>} deformers
 * @param {Map<number, THREE.BufferGeometry>} geometryMap
 * @param {Map<number, THREE.Material>} materialMap
 * @returns {THREE.Group}
 */
function parseScene( FBXTree, connections, deformers, geometryMap, materialMap ) {

  var sceneGraph = new THREE.Group();

  var ModelNode = FBXTree.Objects.subNodes.Model;

  /**
   * @type {Array.<THREE.Object3D>}
   */
  var modelArray = [];

  /**
   * @type {Map.<number, THREE.Object3D>}
   */
  var modelMap = new Map();

  for ( var nodeID in ModelNode ) {

    var id = parseInt( nodeID );
    var node = ModelNode[ nodeID ];
    var conns = connections.get( id );
    var model = null;

    for ( var i = 0; i < conns.parents.length; ++ i ) {

      for ( var FBX_ID in deformers ) {

        var deformer = deformers[ FBX_ID ];
        var subDeformers = deformer.map;
        var subDeformer = subDeformers[ conns.parents[ i ].ID ];

        if ( subDeformer ) {

          model = new THREE.Bone();
          deformer.bones[ subDeformer.index ] = model;

        }

      }

    }

    if ( ! model ) {

      switch ( node.attrType ) {

        case "Mesh":
          /**
           * @type {?THREE.BufferGeometry}
           */
          var geometry = null;

          /**
           * @type {THREE.MultiMaterial|THREE.Material}
           */
          var material = null;

          /**
           * @type {Array.<THREE.Material>}
           */
          var materials = [];

          for ( var childrenIndex = 0, childrenLength = conns.children.length; childrenIndex < childrenLength; ++ childrenIndex ) {

            var child = conns.children[ childrenIndex ];

            if ( geometryMap.has( child.ID ) ) {

              geometry = geometryMap.get( child.ID );

            }

            if ( materialMap.has( child.ID ) ) {

              materials.push( materialMap.get( child.ID ) );

            }

          }
          if ( materials.length > 1 ) {

            material = new THREE.MultiMaterial( materials );

          } else if ( materials.length > 0 ) {

            material = materials[ 0 ];

          } else {

            material = new THREE.MeshBasicMaterial( { color: 0x3300ff } );
            materials.push( material );

          }
          if ( 'color' in geometry.attributes ) {

            for ( var materialIndex = 0, numMaterials = materials.length; materialIndex < numMaterials; ++materialIndex ) {

              materials[ materialIndex ].vertexColors = THREE.VertexColors;

            }

          }
          if ( geometry.FBX_Deformer ) {

            for ( var materialsIndex = 0, materialsLength = materials.length; materialsIndex < materialsLength; ++ materialsIndex ) {

              materials[ materialsIndex ].skinning = true;

            }
            model = new THREE.SkinnedMesh( geometry, material );

          } else {

            model = new THREE.Mesh( geometry, material );

          }
          break;

        case "NurbsCurve":
          var geometry = null;

          for ( var childrenIndex = 0, childrenLength = conns.children.length; childrenIndex < childrenLength; ++ childrenIndex ) {

            var child = conns.children[ childrenIndex ];

            if ( geometryMap.has( child.ID ) ) {

              geometry = geometryMap.get( child.ID );

            }

          }

          // FBX does not list materials for Nurbs lines, so we'll just put our own in here.
          material = new THREE.LineBasicMaterial( { color: 0x3300ff, linewidth: 5 } );
          model = new THREE.Line( geometry, material );
          break;

        default:
          model = new THREE.Object3D();
          break;

      }

    }

    model.name = node.attrName.replace( /:/, '' ).replace( /_/, '' ).replace( /-/, '' );
    model.FBX_ID = id;

    modelArray.push( model );
    modelMap.set( id, model );

  }

  for ( var modelArrayIndex = 0, modelArrayLength = modelArray.length; modelArrayIndex < modelArrayLength; ++ modelArrayIndex ) {

    var model = modelArray[ modelArrayIndex ];

    var node = ModelNode[ model.FBX_ID ];

    if ( 'Lcl_Translation' in node.properties ) {

      model.position.fromArray( parseFloatArray( node.properties.Lcl_Translation.value ) );

    }

    if ( 'Lcl_Rotation' in node.properties ) {

      var rotation = parseFloatArray( node.properties.Lcl_Rotation.value ).map( degreeToRadian );
      rotation.push( 'ZYX' );
      model.rotation.fromArray( rotation );

    }

    if ( 'Lcl_Scaling' in node.properties ) {

      model.scale.fromArray( parseFloatArray( node.properties.Lcl_Scaling.value ) );

    }

    if ( 'PreRotation' in node.properties ) {

      var preRotations = new THREE.Euler().setFromVector3( parseVector3( node.properties.PreRotation ).multiplyScalar( DEG2RAD ), 'ZYX' );
      preRotations = new THREE.Quaternion().setFromEuler( preRotations );
      var currentRotation = new THREE.Quaternion().setFromEuler( model.rotation );
      preRotations.multiply( currentRotation );
      model.rotation.setFromQuaternion( preRotations, 'ZYX' );

    }

    var conns = connections.get( model.FBX_ID );
    for ( var parentIndex = 0; parentIndex < conns.parents.length; parentIndex ++ ) {

      var pIndex = findIndex( modelArray, function ( mod ) {

        return mod.FBX_ID === conns.parents[ parentIndex ].ID;

      } );
      if ( pIndex > - 1 ) {

        modelArray[ pIndex ].add( model );
        break;

      }

    }
    if ( model.parent === null ) {

      sceneGraph.add( model );

    }

  }


  // Now with the bones created, we can update the skeletons and bind them to the skinned meshes.
  sceneGraph.updateMatrixWorld( true );

  // Put skeleton into bind pose.
  var BindPoseNode = FBXTree.Objects.subNodes.Pose;
  for ( var nodeID in BindPoseNode ) {

    if ( BindPoseNode[ nodeID ].attrType === 'BindPose' ) {

      BindPoseNode = BindPoseNode[ nodeID ];
      break;

    }

  }
  if ( BindPoseNode ) {

    var PoseNode = BindPoseNode.subNodes.PoseNode;
    var worldMatrices = new Map();

    for ( var PoseNodeIndex = 0, PoseNodeLength = PoseNode.length; PoseNodeIndex < PoseNodeLength; ++ PoseNodeIndex ) {

      var node = PoseNode[ PoseNodeIndex ];

      var rawMatWrd = parseMatrixArray( node.subNodes.Matrix.properties.a );

      worldMatrices.set( parseInt( node.id ), rawMatWrd );

    }

  }

  //Skeleton is now bound, return objects to starting
  //world positions.
  sceneGraph.updateMatrixWorld( true );

  // Silly hack with the animation parsing.  We're gonna pretend the scene graph has a skeleton
  // to attach animations to, since FBXs treat animations as animations for the entire scene,
  // not just for individual objects.
  sceneGraph.skeleton = {
    bones: modelArray
  };

  var animations = parseAnimations( FBXTree, connections, sceneGraph );

  addAnimations( sceneGraph, animations );

  return sceneGraph;

}

/**
 * Parses animation information from FBXTree and generates an AnimationInfoObject.
 * @param {{Objects: {subNodes: {AnimationCurveNode: any, AnimationCurve: any, AnimationLayer: any, AnimationStack: any}}}} FBXTree
 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
 */
function parseAnimations( FBXTree, connections, sceneGraph ) {

  var rawNodes = FBXTree.Objects.subNodes.AnimationCurveNode;
  var rawCurves = FBXTree.Objects.subNodes.AnimationCurve;
  var rawLayers = FBXTree.Objects.subNodes.AnimationLayer;
  var rawStacks = FBXTree.Objects.subNodes.AnimationStack;

  var returnObject = {
    curves: new Map(),
    layers: {},
    stacks: {},
    length: 0,
    fps: 30,
    frames: 0
  };

  var animationCurveNodes = [];
  for ( var nodeID in rawNodes ) {

    if ( nodeID.match( /\d+/ ) ) {

      var animationNode = parseAnimationNode( FBXTree, rawNodes[ nodeID ], connections, sceneGraph );
      animationCurveNodes.push( animationNode );

    }

  }

  var tmpMap = new Map();
  for ( var animationCurveNodeIndex = 0; animationCurveNodeIndex < animationCurveNodes.length; ++ animationCurveNodeIndex ) {

    if ( animationCurveNodes[ animationCurveNodeIndex ] === null ) {

      continue;

    }
    tmpMap.set( animationCurveNodes[ animationCurveNodeIndex ].id, animationCurveNodes[ animationCurveNodeIndex ] );

  }

  var animationCurves = [];
  for ( nodeID in rawCurves ) {

    if ( nodeID.match( /\d+/ ) ) {

      var animationCurve = parseAnimationCurve( rawCurves[ nodeID ] );
      animationCurves.push( animationCurve );

      if (!connections.get( animationCurve.id )) continue;

      var firstParentConn = connections.get( animationCurve.id ).parents[ 0 ];
      var firstParentID = firstParentConn.ID;
      var firstParentRelationship = firstParentConn.relationship;
      var axis = '';

      if ( firstParentRelationship.match( /X/ ) ) {

        axis = 'x';

      } else if ( firstParentRelationship.match( /Y/ ) ) {

        axis = 'y';

      } else if ( firstParentRelationship.match( /Z/ ) ) {

        axis = 'z';

      } else {

        continue;

      }

      tmpMap.get( firstParentID ).curves[ axis ] = animationCurve;

    }

  }

  tmpMap.forEach( function ( curveNode ) {

    var id = curveNode.containerBoneID;
    if ( ! returnObject.curves.has( id ) ) {

      returnObject.curves.set( id, { T: null, R: null, S: null } );

    }
    returnObject.curves.get( id )[ curveNode.attr ] = curveNode;
    if ( curveNode.attr === 'R' ) {

      var curves = curveNode.curves;
      curves.x.values = curves.x.values.map( degreeToRadian );
      curves.y.values = curves.y.values.map( degreeToRadian );
      curves.z.values = curves.z.values.map( degreeToRadian );

      if ( curveNode.preRotations !== null ) {

        var preRotations = new THREE.Euler().setFromVector3( curveNode.preRotations, 'ZYX' );
        preRotations = new THREE.Quaternion().setFromEuler( preRotations );
        var frameRotation = new THREE.Euler();
        var frameRotationQuaternion = new THREE.Quaternion();
        for ( var frame = 0; frame < curves.x.times.length; ++ frame ) {

          frameRotation.set( curves.x.values[ frame ], curves.y.values[ frame ], curves.z.values[ frame ], 'ZYX' );
          frameRotationQuaternion.setFromEuler( frameRotation ).premultiply( preRotations );
          frameRotation.setFromQuaternion( frameRotationQuaternion, 'ZYX' );
          curves.x.values[ frame ] = frameRotation.x;
          curves.y.values[ frame ] = frameRotation.y;
          curves.z.values[ frame ] = frameRotation.z;

        }

      }

    }

  } );

  for ( var nodeID in rawLayers ) {

    var layer = [];
    var children = connections.get( parseInt( nodeID ) ).children;

    for ( var childIndex = 0; childIndex < children.length; childIndex ++ ) {

      // Skip lockInfluenceWeights
      if ( tmpMap.has( children[ childIndex ].ID ) ) {

        var curveNode = tmpMap.get( children[ childIndex ].ID );
        var boneID = curveNode.containerBoneID;
        if ( layer[ boneID ] === undefined ) {

          layer[ boneID ] = {
            T: null,
            R: null,
            S: null
          };

        }

        layer[ boneID ][ curveNode.attr ] = curveNode;

      }

    }

    returnObject.layers[ nodeID ] = layer;

  }

  for ( var nodeID in rawStacks ) {

    var layers = [];
    var children = connections.get( parseInt( nodeID ) ).children;
    var timestamps = { max: 0, min: Number.MAX_VALUE };

    for ( var childIndex = 0; childIndex < children.length; ++ childIndex ) {

      var currentLayer = returnObject.layers[ children[ childIndex ].ID ];

      if ( currentLayer !== undefined ) {

        layers.push( currentLayer );

        for ( var currentLayerIndex = 0, currentLayerLength = currentLayer.length; currentLayerIndex < currentLayerLength; ++ currentLayerIndex ) {

          var layer = currentLayer[ currentLayerIndex ];

          if ( layer ) {

            getCurveNodeMaxMinTimeStamps( layer, timestamps );

          }

        }

      }

    }

    // Do we have an animation clip with actual length?
    if ( timestamps.max > timestamps.min ) {

      returnObject.stacks[ nodeID ] = {
        name: rawStacks[ nodeID ].attrName,
        layers: layers,
        length: timestamps.max - timestamps.min,
        frames: ( timestamps.max - timestamps.min ) * 30
      };

    }

  }

  return returnObject;

}

/**
 * @param {Object} FBXTree
 * @param {{id: number, attrName: string, properties: Object<string, any>}} animationCurveNode
 * @param {Map<number, {parents: {ID: number, relationship: string}[], children: {ID: number, relationship: string}[]}>} connections
 * @param {{skeleton: {bones: {FBX_ID: number}[]}}} sceneGraph
 */
function parseAnimationNode( FBXTree, animationCurveNode, connections, sceneGraph ) {

  var rawModels = FBXTree.Objects.subNodes.Model;

  var returnObject = {
    /**
     * @type {number}
     */
    id: animationCurveNode.id,

    /**
     * @type {string}
     */
    attr: animationCurveNode.attrName,

    /**
     * @type {number}
     */
    internalID: animationCurveNode.id,

    /**
     * @type {boolean}
     */
    attrX: false,

    /**
     * @type {boolean}
     */
    attrY: false,

    /**
     * @type {boolean}
     */
    attrZ: false,

    /**
     * @type {number}
     */
    containerBoneID: - 1,

    /**
     * @type {number}
     */
    containerID: - 1,

    curves: {
      x: null,
      y: null,
      z: null
    },

    /**
     * @type {number[]}
     */
    preRotations: null
  };

  if ( returnObject.attr.match( /S|R|T/ ) ) {

    for ( var attributeKey in animationCurveNode.properties ) {

      if ( attributeKey.match( /X/ ) ) {

        returnObject.attrX = true;

      }
      if ( attributeKey.match( /Y/ ) ) {

        returnObject.attrY = true;

      }
      if ( attributeKey.match( /Z/ ) ) {

        returnObject.attrZ = true;

      }

    }

  } else {

    return null;

  }

  var conns = connections.get( returnObject.id );
  var containerIndices = conns.parents;

  for ( var containerIndicesIndex = containerIndices.length - 1; containerIndicesIndex >= 0; -- containerIndicesIndex ) {

    var boneID = findIndex( sceneGraph.skeleton.bones, function ( bone ) {

      return bone.FBX_ID === containerIndices[ containerIndicesIndex ].ID;

    } );
    if ( boneID > - 1 ) {

      returnObject.containerBoneID = boneID;
      returnObject.containerID = containerIndices[ containerIndicesIndex ].ID;
      var model = rawModels[ returnObject.containerID.toString() ];
      if ( 'PreRotation' in model.properties ) {

        returnObject.preRotations = parseVector3( model.properties.PreRotation ).multiplyScalar( Math.PI / 180 );

      }
      break;

    }

  }

  return returnObject;

}

/**
 * @param {{id: number, subNodes: {KeyTime: {properties: {a: string}}, KeyValueFloat: {properties: {a: string}}, KeyAttrFlags: {properties: {a: string}}, KeyAttrDataFloat: {properties: {a: string}}}}} animationCurve
 */
function parseAnimationCurve( animationCurve ) {

  return {
    version: null,
    id: animationCurve.id,
    internalID: animationCurve.id,
    times: parseFloatArray( animationCurve.subNodes.KeyTime.properties.a ).map( convertFBXTimeToSeconds ),
    values: parseFloatArray( animationCurve.subNodes.KeyValueFloat.properties.a ),

    attrFlag: parseIntArray( animationCurve.subNodes.KeyAttrFlags.properties.a ),
    attrData: parseFloatArray( animationCurve.subNodes.KeyAttrDataFloat.properties.a )
  };

}

function getCurveNodeMaxMinTimeStamps( layer, timestamps ) {

  if ( layer.R ) {

    getCurveMaxMinTimeStamp( layer.R.curves, timestamps );

  }
  if ( layer.S ) {

    getCurveMaxMinTimeStamp( layer.S.curves, timestamps );

  }
  if ( layer.T ) {

    getCurveMaxMinTimeStamp( layer.T.curves, timestamps );

  }

}

function getCurveMaxMinTimeStamp( curve, timestamps ) {

  if ( curve.x ) {

    getCurveAxisMaxMinTimeStamps( curve.x, timestamps );

  }
  if ( curve.y ) {

    getCurveAxisMaxMinTimeStamps( curve.y, timestamps );

  }
  if ( curve.z ) {

    getCurveAxisMaxMinTimeStamps( curve.z, timestamps );

  }

}

/**
 * Sets the maxTimeStamp and minTimeStamp if one of its timestamps exceeds the maximum or minimum.
 * @param {{times: number[]}} axis
 */
function getCurveAxisMaxMinTimeStamps( axis, timestamps ) {

  timestamps.max = axis.times[ axis.times.length - 1 ] > timestamps.max ? axis.times[ axis.times.length - 1 ] : timestamps.max;
  timestamps.min = axis.times[ 0 ] < timestamps.min ? axis.times[ 0 ] : timestamps.min;

}

function addAnimations( group, animations ) {

  if ( group.animations === undefined ) {

    group.animations = [];

  }

  var stacks = animations.stacks;

  for ( var key in stacks ) {

    var stack = stacks[ key ];

    /**
     * @type {{
     * name: string,
     * fps: number,
     * length: number,
     * hierarchy: Array.<{
     *  parent: number,
     *  name: string,
     *  keys: Array.<{
     *    time: number,
     *    pos: Array.<number>,
     *    rot: Array.<number>,
     *    scl: Array.<number>
     *  }>
     * }>
     * }}
     */
    var animationData = {
      name: stack.name,
      fps: 30,
      length: stack.length,
      hierarchy: []
    };

    var bones = group.skeleton.bones;

    for ( var bonesIndex = 0, bonesLength = bones.length; bonesIndex < bonesLength; ++ bonesIndex ) {

      var bone = bones[ bonesIndex ];

      var name = bone.name.replace( /.*:/, '' );
      var parentIndex = findIndex( bones, function ( parentBone ) {

        return bone.parent === parentBone;

      } );
      animationData.hierarchy.push( { parent: parentIndex, name: name, keys: [] } );

    }

    for ( var frame = 0; frame <= stack.frames; frame ++ ) {

      for ( var bonesIndex = 0, bonesLength = bones.length; bonesIndex < bonesLength; ++ bonesIndex ) {

        var bone = bones[ bonesIndex ];
        var boneIndex = bonesIndex;

        var animationNode = stack.layers[ 0 ][ boneIndex ];

        for ( var hierarchyIndex = 0, hierarchyLength = animationData.hierarchy.length; hierarchyIndex < hierarchyLength; ++ hierarchyIndex ) {

          var node = animationData.hierarchy[ hierarchyIndex ];

          if ( node.name === bone.name ) {

            node.keys.push( generateKey( animations, animationNode, bone, frame ) );

          }

        }

      }

    }

    group.animations.push( THREE.AnimationClip.parseAnimation( animationData, bones ) );

  }

}

var euler = new THREE.Euler();
var quaternion = new THREE.Quaternion();

/**
 * @param {THREE.Bone} bone
 */
function generateKey( animations, animationNode, bone, frame ) {

  var key = {
    time: frame / animations.fps,
    pos: bone.position.toArray(),
    rot: bone.quaternion.toArray(),
    scl: bone.scale.toArray()
  };

  if ( animationNode === undefined ) return key;

  try {

    if ( hasCurve( animationNode, 'T' ) && hasKeyOnFrame( animationNode.T, frame ) ) {

      key.pos = [ animationNode.T.curves.x.values[ frame ], animationNode.T.curves.y.values[ frame ], animationNode.T.curves.z.values[ frame ] ];

    }

    if ( hasCurve( animationNode, 'R' ) && hasKeyOnFrame( animationNode.R, frame ) ) {

      var rotationX = animationNode.R.curves.x.values[ frame ];
      var rotationY = animationNode.R.curves.y.values[ frame ];
      var rotationZ = animationNode.R.curves.z.values[ frame ];

      quaternion.setFromEuler( euler.set( rotationX, rotationY, rotationZ, 'ZYX' ) );
      key.rot = quaternion.toArray();

    }

    if ( hasCurve( animationNode, 'S' ) && hasKeyOnFrame( animationNode.S, frame ) ) {

      key.scl = [ animationNode.S.curves.x.values[ frame ], animationNode.S.curves.y.values[ frame ], animationNode.S.curves.z.values[ frame ] ];

    }

  } catch ( error ) {

    // Curve is not fully plotted.
    console.log( bone );
    console.log( error );

  }

  return key;

}

var AXES = [ 'x', 'y', 'z' ];

function hasCurve( animationNode, attribute ) {

  if ( animationNode === undefined ) {

    return false;

  }

  var attributeNode = animationNode[ attribute ];

  if ( ! attributeNode ) {

    return false;

  }

  return AXES.every( function ( key ) {

    return attributeNode.curves[ key ] !== null;

  } );

}

function hasKeyOnFrame( attributeNode, frame ) {

  return AXES.every( function ( key ) {

    return isKeyExistOnFrame( attributeNode.curves[ key ], frame );

  } );

}

function isKeyExistOnFrame( curve, frame ) {

  return curve.values[ frame ] !== undefined;

}

function TextParser() {}

Object.assign( TextParser.prototype, {

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

  // ----------parse ---------------------------------------------------
  parse: function ( text ) {

    this.currentIndent = 0;
    this.allNodes = new FBXTree();
    this.nodeStack = [];
    this.currentProp = [];
    this.currentPropName = '';

    var split = text.split( "\n" );

    for ( var line in split ) {

      var l = split[ line ];

      // short cut
      if ( l.match( /^[\s\t]*;/ ) ) {

        continue;

      } // skip comment line
      if ( l.match( /^[\s\t]*$/ ) ) {

        continue;

      } // skip empty line

      // beginning of node
      var beginningOfNodeExp = new RegExp( "^\\t{" + this.currentIndent + "}(\\w+):(.*){", '' );
      var match = l.match( beginningOfNodeExp );
      if ( match ) {

        var nodeName = match[ 1 ].trim().replace( /^"/, '' ).replace( /"$/, "" );
        var nodeAttrs = match[ 2 ].split( ',' );

        for ( var i = 0, l = nodeAttrs.length; i < l; i ++ ) {
          nodeAttrs[ i ] = nodeAttrs[ i ].trim().replace( /^"/, '' ).replace( /"$/, '' );
        }

        this.parseNodeBegin( l, nodeName, nodeAttrs || null );
        continue;

      }

      // node's property
      var propExp = new RegExp( "^\\t{" + ( this.currentIndent ) + "}(\\w+):[\\s\\t\\r\\n](.*)" );
      var match = l.match( propExp );
      if ( match ) {

        var propName = match[ 1 ].replace( /^"/, '' ).replace( /"$/, "" ).trim();
        var propValue = match[ 2 ].replace( /^"/, '' ).replace( /"$/, "" ).trim();

        this.parseNodeProperty( l, propName, propValue );
        continue;

      }

      // end of node
      var endOfNodeExp = new RegExp( "^\\t{" + ( this.currentIndent - 1 ) + "}}" );
      if ( l.match( endOfNodeExp ) ) {

        this.nodeEnd();
        continue;

      }

      // for special case,
      //
      //    Vertices: *8670 {
      //      a: 0.0356229953467846,13.9599733352661,-0.399196773.....(snip)
      // -0.0612030513584614,13.960485458374,-0.409748703241348,-0.10.....
      // 0.12490539252758,13.7450733184814,-0.454119384288788,0.09272.....
      // 0.0836158767342567,13.5432004928589,-0.435397416353226,0.028.....
      //
      // these case the lines must contiue with previous line
      if ( l.match( /^[^\s\t}]/ ) ) {

        this.parseNodePropertyContinued( l );

      }

    }

    return this.allNodes;

  },

  parseNodeBegin: function ( line, nodeName, nodeAttrs ) {

    // var nodeName = match[1];
    var node = { 'name': nodeName, properties: {}, 'subNodes': {} };
    var attrs = this.parseNodeAttr( nodeAttrs );
    var currentNode = this.getCurrentNode();

    // a top node
    if ( this.currentIndent === 0 ) {

      this.allNodes.add( nodeName, node );

    } else {

      // a subnode

      // already exists subnode, then append it
      if ( nodeName in currentNode.subNodes ) {

        var tmp = currentNode.subNodes[ nodeName ];

        // console.log( "duped entry found\nkey: " + nodeName + "\nvalue: " + propValue );
        if ( this.isFlattenNode( currentNode.subNodes[ nodeName ] ) ) {


          if ( attrs.id === '' ) {

            currentNode.subNodes[ nodeName ] = [];
            currentNode.subNodes[ nodeName ].push( tmp );

          } else {

            currentNode.subNodes[ nodeName ] = {};
            currentNode.subNodes[ nodeName ][ tmp.id ] = tmp;

          }

        }

        if ( attrs.id === '' ) {

          currentNode.subNodes[ nodeName ].push( node );

        } else {

          currentNode.subNodes[ nodeName ][ attrs.id ] = node;

        }

      } else if ( typeof attrs.id === 'number' || attrs.id.match( /^\d+$/ ) ) {

        currentNode.subNodes[ nodeName ] = {};
        currentNode.subNodes[ nodeName ][ attrs.id ] = node;

      } else {

        currentNode.subNodes[ nodeName ] = node;

      }

    }

    // for this     ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    // NodeAttribute: 1001463072, "NodeAttribute::", "LimbNode" {
    if ( nodeAttrs ) {

      node.id = attrs.id;
      node.attrName = attrs.name;
      node.attrType = attrs.type;

    }

    this.pushStack( node );

  },

  parseNodeAttr: function ( attrs ) {

    var id = attrs[ 0 ];

    if ( attrs[ 0 ] !== "" ) {

      id = parseInt( attrs[ 0 ] );

      if ( isNaN( id ) ) {

        // PolygonVertexIndex: *16380 {
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

  parseNodeProperty: function ( line, propName, propValue ) {

    var currentNode = this.getCurrentNode();
    var parentName = currentNode.name;

    // special case parent node's is like "Properties70"
    // these chilren nodes must treat with careful
    if ( parentName !== undefined ) {

      var propMatch = parentName.match( /Properties(\d)+/ );
      if ( propMatch ) {

        this.parseNodeSpecialProperty( line, propName, propValue );
        return;

      }

    }

    // special case Connections
    if ( propName == 'C' ) {

      var connProps = propValue.split( ',' ).slice( 1 );
      var from = parseInt( connProps[ 0 ] );
      var to = parseInt( connProps[ 1 ] );

      var rest = propValue.split( ',' ).slice( 3 );

      propName = 'connections';
      propValue = [ from, to ];
      append( propValue, rest );

      if ( currentNode.properties[ propName ] === undefined ) {

        currentNode.properties[ propName ] = [];

      }

    }

    // special case Connections
    if ( propName == 'Node' ) {

      var id = parseInt( propValue );
      currentNode.properties.id = id;
      currentNode.id = id;

    }

    // already exists in properties, then append this
    if ( propName in currentNode.properties ) {

      // console.log( "duped entry found\nkey: " + propName + "\nvalue: " + propValue );
      if ( Array.isArray( currentNode.properties[ propName ] ) ) {

        currentNode.properties[ propName ].push( propValue );

      } else {

        currentNode.properties[ propName ] += propValue;

      }

    } else {

      // console.log( propName + ":  " + propValue );
      if ( Array.isArray( currentNode.properties[ propName ] ) ) {

        currentNode.properties[ propName ].push( propValue );

      } else {

        currentNode.properties[ propName ] = propValue;

      }

    }

    this.setCurrentProp( currentNode.properties, propName );

  },

  // TODO:
  parseNodePropertyContinued: function ( line ) {

    this.currentProp[ this.currentPropName ] += line;

  },

  parseNodeSpecialProperty: function ( line, propName, propValue ) {

    // split this
    // P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
    // into array like below
    // ["Lcl Scaling", "Lcl Scaling", "", "A", "1,1,1" ]
    var props = propValue.split( '",' );

    for ( var i = 0, l = props.length; i < l; i ++ ) {
      props[ i ] = props[ i ].trim().replace( /^\"/, '' ).replace( /\s/, '_' );
    }

    var innerPropName = props[ 0 ];
    var innerPropType1 = props[ 1 ];
    var innerPropType2 = props[ 2 ];
    var innerPropFlag = props[ 3 ];
    var innerPropValue = props[ 4 ];

    /*
    if ( innerPropValue === undefined ) {
      innerPropValue = props[3];
    }
    */

    // cast value in its type
    switch ( innerPropType1 ) {

      case "int":
        innerPropValue = parseInt( innerPropValue );
        break;

      case "double":
        innerPropValue = parseFloat( innerPropValue );
        break;

      case "ColorRGB":
      case "Vector3D":
        innerPropValue = parseFloatArray( innerPropValue );
        break;

    }

    // CAUTION: these props must append to parent's parent
    this.getPrevNode().properties[ innerPropName ] = {

      'type': innerPropType1,
      'type2': innerPropType2,
      'flag': innerPropFlag,
      'value': innerPropValue

    };

    this.setCurrentProp( this.getPrevNode().properties, innerPropName );

  },

  nodeEnd: function () {

    this.popStack();

  },

  /* ---------------------------------------------------------------- */
  /*    util                            */
  isFlattenNode: function ( node ) {

    return ( 'subNodes' in node && 'properties' in node ) ? true : false;

  }

} );

function FBXTree() {}

Object.assign( FBXTree.prototype, {

  add: function ( key, val ) {

    this[ key ] = val;

  },

  searchConnectionParent: function ( id ) {

    if ( this.__cache_search_connection_parent === undefined ) {

      this.__cache_search_connection_parent = [];

    }

    if ( this.__cache_search_connection_parent[ id ] !== undefined ) {

      return this.__cache_search_connection_parent[ id ];

    } else {

      this.__cache_search_connection_parent[ id ] = [];

    }

    var conns = this.Connections.properties.connections;

    var results = [];
    for ( var i = 0; i < conns.length; ++ i ) {

      if ( conns[ i ][ 0 ] == id ) {

        // 0 means scene root
        var res = conns[ i ][ 1 ] === 0 ? - 1 : conns[ i ][ 1 ];
        results.push( res );

      }

    }

    if ( results.length > 0 ) {

      append( this.__cache_search_connection_parent[ id ], results );
      return results;

    } else {

      this.__cache_search_connection_parent[ id ] = [ - 1 ];
      return [ - 1 ];

    }

  },

  searchConnectionChildren: function ( id ) {

    if ( this.__cache_search_connection_children === undefined ) {

      this.__cache_search_connection_children = [];

    }

    if ( this.__cache_search_connection_children[ id ] !== undefined ) {

      return this.__cache_search_connection_children[ id ];

    } else {

      this.__cache_search_connection_children[ id ] = [];

    }

    var conns = this.Connections.properties.connections;

    var res = [];
    for ( var i = 0; i < conns.length; ++ i ) {

      if ( conns[ i ][ 1 ] == id ) {

        // 0 means scene root
        res.push( conns[ i ][ 0 ] === 0 ? - 1 : conns[ i ][ 0 ] );
        // there may more than one kid, then search to the end

      }

    }

    if ( res.length > 0 ) {

      append( this.__cache_search_connection_children[ id ], res );
      return res;

    } else {

      this.__cache_search_connection_children[ id ] = [ ];
      return [ ];

    }

  },

  searchConnectionType: function ( id, to ) {

    var key = id + ',' + to; // TODO: to hash
    if ( this.__cache_search_connection_type === undefined ) {

      this.__cache_search_connection_type = {};

    }

    if ( this.__cache_search_connection_type[ key ] !== undefined ) {

      return this.__cache_search_connection_type[ key ];

    } else {

      this.__cache_search_connection_type[ key ] = '';

    }

    var conns = this.Connections.properties.connections;

    for ( var i = 0; i < conns.length; ++ i ) {

      if ( conns[ i ][ 0 ] == id && conns[ i ][ 1 ] == to ) {

        // 0 means scene root
        this.__cache_search_connection_type[ key ] = conns[ i ][ 2 ];
        return conns[ i ][ 2 ];

      }

    }

    this.__cache_search_connection_type[ id ] = null;
    return null;

  }

} );

/**
 * @returns {boolean}
 */
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
    if ( num == CORRECT[ i ] ) {

      return false;

    }

  }

  return true;

}

/**
 * @returns {number}
 */
function getFbxVersion( text ) {

  var versionRegExp = /FBXVersion: (\d+)/;
  var match = text.match( versionRegExp );
  if ( match ) {

    var version = parseInt( match[ 1 ] );
    return version;

  }
  throw new Error( 'FBXAnimationLoader: Cannot find the version number for the file given.' );

}

/**
 * Converts FBX ticks into real time seconds.
 * @param {number} time - FBX tick timestamp to convert.
 * @returns {number} - FBX tick in real world time.
 */
function convertFBXTimeToSeconds( time ) {

  // Constant is FBX ticks per second.
  return time / 46186158000;

}

/**
 * Parses comma separated list of float numbers and returns them in an array.
 * @example
 * // Returns [ 5.6, 9.4, 2.5, 1.4 ]
 * parseFloatArray( "5.6,9.4,2.5,1.4" )
 * @returns {number[]}
 */
function parseFloatArray( string ) {

  var array = string.split( ',' );

  for ( var i = 0, l = array.length; i < l; i ++ ) {

    array[ i ] = parseFloat( array[ i ] );

  }

  return array;

}

/**
 * Parses comma separated list of int numbers and returns them in an array.
 * @example
 * // Returns [ 5, 8, 2, 3 ]
 * parseFloatArray( "5,8,2,3" )
 * @returns {number[]}
 */
function parseIntArray( string ) {

  var array = string.split( ',' );

  for ( var i = 0, l = array.length; i < l; i ++ ) {

    array[ i ] = parseInt( array[ i ] );

  }

  return array;

}

/**
 * Parses Vector3 property from FBXTree.  Property is given as .value.x, .value.y, etc.
 * @param {FBXVector3} property - Property to parse as Vector3.
 * @returns {THREE.Vector3}
 */
function parseVector3( property ) {

  return new THREE.Vector3().fromArray( property.value );

}

/**
 * Parses Color property from FBXTree.  Property is given as .value.x, .value.y, etc.
 * @param {FBXVector3} property - Property to parse as Color.
 * @returns {THREE.Color}
 */
function parseColor( property ) {

  return new THREE.Color().fromArray( property.value );

}

function parseMatrixArray( floatString ) {

  return new THREE.Matrix4().fromArray( parseFloatArray( floatString ) );

}

/**
 * Converts number from degrees into radians.
 * @param {number} value
 * @returns {number}
 */
function degreeToRadian( value ) {

  return value * DEG2RAD;

}

var DEG2RAD = Math.PI / 180;

//

function findIndex( array, func ) {

  for ( var i = 0, l = array.length; i < l; i ++ ) {

    if ( func( array[ i ] ) ) return i;

  }

  return -1;

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

