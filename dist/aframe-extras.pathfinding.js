(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./src/pathfinding').registerAll();
},{"./src/pathfinding":4}],2:[function(require,module,exports){

/*
  PatrolJS - Navigation mesh toolkit for ThreeJS
  http://github.com/nickjanssen/patroljs
  Licensed under MIT
*/

(function (exports) {

  var _ = require('underscore');
  var THREE = window.THREE;
  // stub in the browser
  var ProgressBar = function () {
    return {
      tick: function () {}
    };
  };

  var computeCentroids = function (geometry) {
    var f, fl, face;

    for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

      face = geometry.faces[ f ];
      face.centroid = new THREE.Vector3( 0, 0, 0 );

      face.centroid.add( geometry.vertices[ face.a ] );
      face.centroid.add( geometry.vertices[ face.b ] );
      face.centroid.add( geometry.vertices[ face.c ] );
      face.centroid.divideScalar( 3 );

    }
  };


    function roundNumber(number, decimals) {
        var newnumber = new Number(number + '').toFixed(parseInt(decimals));
        return parseFloat(newnumber);
    }

  var nodeIdCount = 1;
  var polygonId = 1;

  var bar;
  var barConfig = {
      // complete: "X",
      // incomplete: ".",
      width: 30
  };

  var mergeVertexIds = function (aList, bList) {

    var sharedVertices = [];

    _.each(aList, function (vId) {
      if (_.contains(bList, vId)) {
        sharedVertices.push(vId);
      }
    });

    if (sharedVertices.length < 2) return [];

    // console.log("TRYING aList:", aList, ", bList:", bList, ", sharedVertices:", sharedVertices);

    if (_.contains(sharedVertices, aList[0]) && _.contains(sharedVertices, aList[aList.length - 1])) {
      // Vertices on both edges are bad, so shift them once to the left
      aList.push(aList.shift());
    }

    if (_.contains(sharedVertices, bList[0]) && _.contains(sharedVertices, bList[bList.length - 1])) {
      // Vertices on both edges are bad, so shift them once to the left
      bList.push(bList.shift());
    }

    // Again!
    sharedVertices = [];

    _.each(aList, function (vId) {
      if (_.contains(bList, vId)) {
        sharedVertices.push(vId);
      }
    });

    var clockwiseMostSharedVertex = sharedVertices[1];
    var counterClockwiseMostSharedVertex = sharedVertices[0];


    var cList = _.clone(aList);
    while (cList[0] !== clockwiseMostSharedVertex) {
      cList.push(cList.shift());
    }

    var c = 0;

    var temp = _.clone(bList);
    while (temp[0] !== counterClockwiseMostSharedVertex) {
      temp.push(temp.shift());

      if (c++ > 10) debugger;
    }

    // Shave
    temp.shift();
    temp.pop();

    cList = cList.concat(temp);

    // console.log("aList:", aList, ", bList:", bList, ", cList:", cList, ", sharedVertices:", sharedVertices);

    return cList;
  };

  var setPolygonCentroid = function (polygon, navigationMesh) {
    var sum = new THREE.Vector3();

    var vertices = navigationMesh.vertices;

    _.each(polygon.vertexIds, function (vId) {
      sum.add(vertices[vId]);
    });

    sum.divideScalar(polygon.vertexIds.length);

    polygon.centroid.copy(sum);
  };

  var cleanPolygon = function (polygon, navigationMesh) {

    var newVertexIds = [];

    var vertices = navigationMesh.vertices;

    for (var i = 0; i < polygon.vertexIds.length; i++) {

      var vertex = vertices[polygon.vertexIds[i]];

      var nextVertexId, previousVertexId;
      var nextVertex, previousVertex;

      // console.log("nextVertex: ", nextVertex);

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

      // console.log(angle);

      if (angle > Math.PI - 0.01 && angle < Math.PI + 0.01) {
        // Unneccesary vertex
        // console.log("Unneccesary vertex: ", polygon.vertexIds[i]);
        // console.log("Angle between "+previousVertexId+", "+polygon.vertexIds[i]+" "+nextVertexId+" was: ", angle);


        // Remove the neighbours who had this vertex
        var goodNeighbours = [];
        _.each(polygon.neighbours, function (neighbour) {
          if (!_.contains(neighbour.vertexIds, polygon.vertexIds[i])) {
            goodNeighbours.push(neighbour);
          }
        });
        polygon.neighbours = goodNeighbours;


        // TODO cleanup the list of vertices and rebuild vertexIds for all polygons
      } else {
        newVertexIds.push(polygon.vertexIds[i]);
      }

    }

    // console.log("New vertexIds: ", newVertexIds);

    polygon.vertexIds = newVertexIds;

    setPolygonCentroid(polygon, navigationMesh);

  };

  var isConvex = function (polygon, navigationMesh) {

    var vertices = navigationMesh.vertices;

    if (polygon.vertexIds.length < 3) return false;

    var convex = true;

    var total = 0;

    var results = [];

    for (var i = 0; i < polygon.vertexIds.length; i++) {

      var vertex = vertices[polygon.vertexIds[i]];

      var nextVertex, previousVertex;

      // console.log("nextVertex: ", nextVertex);

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

      // console.log(angle);
      if (angle === Math.PI || angle === 0) return false;

      var r = a.cross(b).y;
      results.push(r);
      // console.log("pushed: ", r);
    }

    // if ( total > (polygon.vertexIds.length-2)*Math.PI ) return false;

    _.each(results, function (r) {
      if (r === 0) convex = false;
    });

    if (results[0] > 0) {
      _.each(results, function (r) {
        if (r < 0) convex = false;
      });
    } else {
      _.each(results, function (r) {
        if (r > 0) convex = false;
      });
    }

    // console.log("allowed: "+total+", max: "+(polygon.vertexIds.length-2)*Math.PI);
    // if ( total > (polygon.vertexIds.length-2)*Math.PI ) convex = false;

    // console.log("Convex: "+(convex ? "true": "false"));



    return convex;
  };

  var buildPolygonGroups = function (navigationMesh) {

    var polygons = navigationMesh.polygons;
    var vertices = navigationMesh.vertices;

    bar = new ProgressBar('Building polygon groups[:bar] :percent', _.extend(barConfig, {
      total: polygons.length
    }));

    var polygonGroups = [];
    var groupCount = 0;

    var spreadGroupId = function (polygon) {
      _.each(polygon.neighbours, function (neighbour) {
        if (_.isUndefined(neighbour.group)) {
          neighbour.group = polygon.group;
          spreadGroupId(neighbour);
        }
      });
    };

    _.each(polygons, function (polygon, i) {

      bar.tick();

      if (_.isUndefined(polygon.group)) {
        polygon.group = groupCount++;
        // Spread it
        spreadGroupId(polygon);
      }

      if (!polygonGroups[polygon.group]) polygonGroups[polygon.group] = [];

      polygonGroups[polygon.group].push(polygon);
    });


    // Separate groups for testing
    // var count = 0;
    // _.each(polygonGroups, function(polygonGroup) {
    //     var done = {};
    //     count += 0.01;
    //     _.each(polygonGroup, function(polygon) {
    //         _.each(polygon.vertexIds, function(vId) {
    //             if ( !done[vId] ) vertices[vId].y += count;
    //             done[vId] = true;
    //         });
    //     });
    // });


    console.log("Groups built: ", polygonGroups.length);

    return polygonGroups;
  };

  function array_intersect() {
    var i, all, shortest, nShortest, n, len, ret = [],
      obj = {},
      nOthers;
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
      n = (i === shortest) ? 0 : (i || shortest); //Read the shortest array first. Read the first array instead of the shortest
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

  var buildPolygonNeighbours = function (polygon, navigationMesh) {
    polygon.neighbours = [];

    // All other nodes that contain at least two of our vertices are our neighbours
    for (var i = 0, len = navigationMesh.polygons.length; i < len; i++) {
      if (polygon === navigationMesh.polygons[i]) continue;

      // Don't check polygons that are too far, since the intersection tests take a long time
      if (polygon.centroid.distanceToSquared(navigationMesh.polygons[i].centroid) > 100 * 100) continue;

      var matches = array_intersect(polygon.vertexIds, navigationMesh.polygons[i].vertexIds);
      // var matches = _.intersection(polygon.vertexIds, navigationMesh.polygons[i].vertexIds);

      if (matches.length >= 2) {
        polygon.neighbours.push(navigationMesh.polygons[i]);
      }
    }
  };

  var buildPolygonsFromGeometry = function (geometry) {

    console.log("Vertices:", geometry.vertices.length, "polygons:", geometry.faces.length);

    var polygons = [];
    var vertices = geometry.vertices;
    var faceVertexUvs = geometry.faceVertexUvs;

    bar = new ProgressBar('Building polygons      [:bar] :percent', _.extend(barConfig, {
      total: geometry.faces.length
    }));

    // Convert the faces into a custom format that supports more than 3 vertices
    _.each(geometry.faces, function (face) {
      bar.tick();
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

    bar = new ProgressBar('Calculating neighbours [:bar] :percent', _.extend(barConfig, {
      total: polygons.length
    }));

    // Build a list of adjacent polygons
    _.each(polygons, function (polygon) {
      bar.tick();
      buildPolygonNeighbours(polygon, navigationMesh);
    });

    return navigationMesh;
  };

  var cleanNavigationMesh = function (navigationMesh) {

    var polygons = navigationMesh.polygons;
    var vertices = navigationMesh.vertices;


    // Remove steep triangles
    var up = new THREE.Vector3(0, 1, 0);
    polygons = _.filter(polygons, function (polygon) {
      var angle = Math.acos(up.dot(polygon.normal));
      return angle < (Math.PI / 4);
    });


    // Remove unnecessary edges using the Hertel-Mehlhorn algorithm

    // 1. Find a pair of adjacent nodes (i.e., two nodes that share an edge between them)
    //    whose normals are nearly identical (i.e., their surfaces face the same direction).


    var newPolygons = [];

    _.each(polygons, function (polygon) {

      if (polygon.toBeDeleted) return;

      var keepLooking = true;

      while (keepLooking) {
        keepLooking = false;

        _.each(polygon.neighbours, function (otherPolygon) {

          if (polygon === otherPolygon) return;

          if (Math.acos(polygon.normal.dot(otherPolygon.normal)) < 0.01) {
            // That's pretty equal alright!

            // Merge otherPolygon with polygon

            var testVertexIdList = [];

            var testPolygon = {
              vertexIds: mergeVertexIds(polygon.vertexIds, otherPolygon.vertexIds),
              neighbours: polygon.neighbours,
              normal: polygon.normal.clone(),
              centroid: polygon.centroid.clone()
            };

            cleanPolygon(testPolygon, navigationMesh);

            if (isConvex(testPolygon, navigationMesh)) {
              otherPolygon.toBeDeleted = true;


              // Inherit the neighbours from the to be merged polygon, except ourself
              _.each(otherPolygon.neighbours, function (otherPolygonNeighbour) {

                // Set this poly to be merged to be no longer our neighbour
                otherPolygonNeighbour.neighbours = _.without(otherPolygonNeighbour.neighbours, otherPolygon);

                if (otherPolygonNeighbour !== polygon) {
                  // Tell the old Polygon's neighbours about the new neighbour who has merged
                  otherPolygonNeighbour.neighbours.push(polygon);
                } else {
                  // For ourself, we don't need to know about ourselves
                  // But we inherit the old neighbours
                  polygon.neighbours = polygon.neighbours.concat(otherPolygon.neighbours);
                  polygon.neighbours = _.uniq(polygon.neighbours);

                  // Without ourselves in it!
                  polygon.neighbours = _.without(polygon.neighbours, polygon);
                }
              });

              polygon.vertexIds = mergeVertexIds(polygon.vertexIds, otherPolygon.vertexIds);

              // console.log(polygon.vertexIds);
              // console.log("Merge!");

              cleanPolygon(polygon, navigationMesh);

              keepLooking = true;
            }

          }
        });
      }


      if (!polygon.toBeDeleted) {
        newPolygons.push(polygon);
      }

    });

    var isUsed = function (vId) {
      var contains = false;
      _.each(newPolygons, function (p) {
        if (!contains && _.contains(p.vertexIds, vId)) {
          contains = true;
        }
      });
      return contains;
    };

    // Clean vertices
    var keepChecking = false;
    for (var i = 0; i < vertices.length; i++) {
      if (!isUsed(i)) {

        // Decrement all vertices that are higher than i
        _.each(newPolygons, function (p) {
          for (var j = 0; j < p.vertexIds.length; j++) {
            if (p.vertexIds[j] > i) {
              p.vertexIds[j] --;
            }
          }
        });

        vertices.splice(i, 1);
        i--;
      }

    };


    navigationMesh.polygons = newPolygons;
    navigationMesh.vertices = vertices;

  };

  var buildNavigationMesh = function (geometry) {

    // Prepare geometry
    computeCentroids(geometry);
    geometry.mergeVertices();
    // THREE.GeometryUtils.triangulateQuads(geometry);

    // console.log("vertices:", geometry.vertices.length, "polygons:", geometry.faces.length);

    var navigationMesh = buildPolygonsFromGeometry(geometry);

    // cleanNavigationMesh(navigationMesh);
    // console.log("Pre-clean:", navigationMesh.polygons.length, "polygons,", navigationMesh.vertices.length, "vertices.");

    // console.log("")
    // console.log("Vertices:", navigationMesh.vertices.length, "polygons,", navigationMesh.polygons.length, "vertices.");

    return navigationMesh;
  };

  var getSharedVerticesInOrder = function (a, b) {

    var aList = a.vertexIds;
    var bList = b.vertexIds;

    var sharedVertices = [];

    _.each(aList, function (vId) {
      if (_.contains(bList, vId)) {
        sharedVertices.push(vId);
      }
    });

    if (sharedVertices.length < 2) return [];

    // console.log("TRYING aList:", aList, ", bList:", bList, ", sharedVertices:", sharedVertices);

    if (_.contains(sharedVertices, aList[0]) && _.contains(sharedVertices, aList[aList.length - 1])) {
      // Vertices on both edges are bad, so shift them once to the left
      aList.push(aList.shift());
    }

    if (_.contains(sharedVertices, bList[0]) && _.contains(sharedVertices, bList[bList.length - 1])) {
      // Vertices on both edges are bad, so shift them once to the left
      bList.push(bList.shift());
    }

    // Again!
    sharedVertices = [];

    _.each(aList, function (vId) {
      if (_.contains(bList, vId)) {
        sharedVertices.push(vId);
      }
    });

    return sharedVertices;
  };

  var groupNavMesh = function (navigationMesh) {

    var saveObj = {};

    _.each(navigationMesh.vertices, function (v) {
      v.x = roundNumber(v.x, 2);
      v.y = roundNumber(v.y, 2);
      v.z = roundNumber(v.z, 2);
    });

    saveObj.vertices = navigationMesh.vertices;

    var groups = buildPolygonGroups(navigationMesh);

    saveObj.groups = [];

    var findPolygonIndex = function (group, p) {
      for (var i = 0; i < group.length; i++) {
        if (p === group[i]) return i;
      }
    };

    bar = new ProgressBar('Grouping               [:bar] :percent', _.extend(barConfig, {
      total: groups.length
    }));

    _.each(groups, function (group) {

      bar.tick();

      var newGroup = [];

      _.each(group, function (p) {

        var neighbours = [];

        _.each(p.neighbours, function (n) {
          neighbours.push(findPolygonIndex(group, n));
        });


        // Build a portal list to each neighbour
        var portals = [];
        _.each(p.neighbours, function (n) {
          portals.push(getSharedVerticesInOrder(p, n));
        });


        p.centroid.x = roundNumber(p.centroid.x, 2);
        p.centroid.y = roundNumber(p.centroid.y, 2);
        p.centroid.z = roundNumber(p.centroid.z, 2);

        newGroup.push({
          id: findPolygonIndex(group, p),
          neighbours: neighbours,
          vertexIds: p.vertexIds,
          centroid: p.centroid,
          portals: portals
        });

      });

      saveObj.groups.push(newGroup);
    });

    return saveObj;
  };

  // javascript-astar
  // http://github.com/bgrins/javascript-astar
  // Freely distributable under the MIT License.
  // Implements the astar search algorithm in javascript using a binary heap.

  function BinaryHeap(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  BinaryHeap.prototype = {
    push: function (element) {
      // Add the new element to the end of the array.
      this.content.push(element);

      // Allow it to sink down.
      this.sinkDown(this.content.length - 1);
    },
    pop: function () {
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
    },
    remove: function (node) {
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
    },
    size: function () {
      return this.content.length;
    },
    rescoreElement: function (node) {
      this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function (n) {
      // Fetch the element that has to be sunk.
      var element = this.content[n];

      // When at 0, an element can not sink any further.
      while (n > 0) {

        // Compute the parent element's index, and fetch it.
        var parentN = ((n + 1) >> 1) - 1,
          parent = this.content[parentN];
        // Swap the elements if the parent is greater.
        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
          this.content[parentN] = element;
          this.content[n] = parent;
          // Update 'n' to continue at the new position.
          n = parentN;
        }

        // Found a parent that is less, no need to sink any further.
        else {
          break;
        }
      }
    },
    bubbleUp: function (n) {
      // Look up the target element and its score.
      var length = this.content.length,
        element = this.content[n],
        elemScore = this.scoreFunction(element);

      while (true) {
        // Compute the indices of the child elements.
        var child2N = (n + 1) << 1,
          child1N = child2N - 1;
        // This is used to store the new position of the element,
        // if any.
        var swap = null;
        // If the first child exists (is inside the array)...
        if (child1N < length) {
          // Look it up and compute its score.
          var child1 = this.content[child1N],
            child1Score = this.scoreFunction(child1);

          // If the score is less than our element's, we need to swap.
          if (child1Score < elemScore)
            swap = child1N;
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
  };

  var distanceToSquared = function (a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var dz = a.z - b.z;

    return dx * dx + dy * dy + dz * dz;
  };

  var astar = {
    init: function (graph) {
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
    },
    cleanUp: function (graph) {
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
    },
    heap: function () {
      return new BinaryHeap(function (node) {
        return node.f;
      });
    },
    search: function (graph, start, end) {
      astar.init(graph);
      //heuristic = heuristic || astar.manhattan;


      var openHeap = astar.heap();

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
        var neighbours = astar.neighbours(graph, currentNode);

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
            if (!neighbour.centroid || !end.centroid) debugger;
            neighbour.h = neighbour.h || astar.heuristic(neighbour.centroid, end.centroid);
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
    },
    heuristic: function (pos1, pos2) {
      return distanceToSquared(pos1, pos2);
    },
    neighbours: function (graph, node) {
      var ret = [];

      for (var e = 0; e < node.neighbours.length; e++) {
        ret.push(graph[node.neighbours[e]]);
      }

      return ret;
    }
  };


  var distanceToSquared = function (a, b) {

    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var dz = a.z - b.z;

    return dx * dx + dy * dy + dz * dz;

  };


  //+ Jonas Raoni Soares Silva
  //@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]
  function isPointInPoly(poly, pt) {
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
      ((poly[i].z <= pt.z && pt.z < poly[j].z) || (poly[j].z <= pt.z && pt.z < poly[i].z)) && (pt.x < (poly[j].x - poly[i].x) * (pt.z - poly[i].z) / (poly[j].z - poly[i].z) + poly[i].x) && (c = !c);
    return c;
  }

  function isVectorInPolygon(vector, polygon, vertices) {

    // reference point will be the centroid of the polygon
    // We need to rotate the vector as well as all the points which the polygon uses

    var center = polygon.centroid;

    var lowestPoint = 100000;
    var highestPoint = -100000;

    var polygonVertices = [];

    _.each(polygon.vertexIds, function (vId) {
      lowestPoint = Math.min(vertices[vId].y, lowestPoint);
      highestPoint = Math.max(vertices[vId].y, highestPoint);
      polygonVertices.push(vertices[vId]);
    });

    if (vector.y < highestPoint + 0.5 && vector.y > lowestPoint - 0.5 &&
      isPointInPoly(polygonVertices, vector)) {
      return true;
    }
    return false;
  }


  function triarea2(a, b, c) {
    var ax = b.x - a.x;
    var az = b.z - a.z;
    var bx = c.x - a.x;
    var bz = c.z - a.z;
    return bx * az - ax * bz;
  }

  function vequal(a, b) {
    return distanceToSquared(a, b) < 0.00001;
  }

  function Channel() {
    this.portals = [];
  }

  Channel.prototype.push = function (p1, p2) {
    if (p2 === undefined) p2 = p1;
    this.portals.push({
      left: p1,
      right: p2
    });
  };

  Channel.prototype.stringPull = function () {
    var portals = this.portals;
    var pts = [];
    // Init scan state
    var portalApex, portalLeft, portalRight;
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
      if (triarea2(portalApex, portalRight, right) <= 0.0) {
        if (vequal(portalApex, portalRight) || triarea2(portalApex, portalLeft, right) > 0.0) {
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
      if (triarea2(portalApex, portalLeft, left) >= 0.0) {
        if (vequal(portalApex, portalLeft) || triarea2(portalApex, portalRight, left) < 0.0) {
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

    if ((pts.length === 0) || (!vequal(pts[pts.length - 1], portals[portals.length - 1].left))) {
      // Append last point to path.
      pts.push(portals[portals.length - 1].left);
    }

    this.path = pts;
    return pts;
  };

  var zoneNodes = {};
  var path = null;

  _.extend(exports, {
    buildNodes: function (geometry) {
      var navigationMesh = buildNavigationMesh(geometry);

      var zoneNodes = groupNavMesh(navigationMesh);

      return zoneNodes;
    },
    setZoneData: function (zone, data) {
      zoneNodes[zone] = data;
    },
    getGroup: function (zone, position) {

      if (!zoneNodes[zone]) return null;

      var closestNodeGroup = null;

      var distance = Math.pow(50, 2);

      _.each(zoneNodes[zone].groups, function (group, index) {
        _.each(group, function (node) {
          var measuredDistance = distanceToSquared(node.centroid, position);
          if (measuredDistance < distance) {
            closestNodeGroup = index;
            distance = measuredDistance;
          }
        });
      });

      return closestNodeGroup;
    },
    getRandomNode: function (zone, group, nearPosition, nearRange) {

      if (!zoneNodes[zone]) return new THREE.Vector3();

      nearPosition = nearPosition || null;
      nearRange = nearRange || 0;

      var candidates = [];

      var polygons = zoneNodes[zone].groups[group];

      _.each(polygons, function (p) {
        if (nearPosition && nearRange) {
          if (distanceToSquared(nearPosition, p.centroid) < nearRange * nearRange) {
            candidates.push(p.centroid);
          }
        } else {
          candidates.push(p.centroid);
        }
      });

      return _.sample(candidates) || new THREE.Vector3();
    },
    findPath: function (startPosition, targetPosition, zone, group) {

      var allNodes = zoneNodes[zone].groups[group];
      var vertices = zoneNodes[zone].vertices;

      var closestNode = null;
      var distance = Math.pow(50, 2);

      _.each(allNodes, function (node) {
        var measuredDistance = distanceToSquared(node.centroid, startPosition);
        if (measuredDistance < distance) {
          closestNode = node;
          distance = measuredDistance;
        }
      }, this);


      var farthestNode = null;
      distance = Math.pow(50, 2);

      _.each(allNodes, function (node) {
        var measuredDistance = distanceToSquared(node.centroid, targetPosition);
        if (measuredDistance < distance &&
          isVectorInPolygon(targetPosition, node, vertices)) {
          farthestNode = node;
          distance = measuredDistance;
        }
      }, this);

      // If we can't find any node, just go straight to the target
      if (!closestNode || !farthestNode) {
        return null;
      }

      var paths = astar.search(allNodes, closestNode, farthestNode);

      var getPortalFromTo = function (a, b) {
        for (var i = 0; i < a.neighbours.length; i++) {
          if (a.neighbours[i] === b.id) {
            return a.portals[i];
          }
        }
      };

      // We got the corridor
      // Now pull the rope

      var channel = new Channel();

      channel.push(startPosition);

      for (var i = 0; i < paths.length; i++) {
        var polygon = paths[i];

        var nextPolygon = paths[i + 1];

        if (nextPolygon) {
          var portals = getPortalFromTo(polygon, nextPolygon);
          channel.push(
            vertices[portals[0]],
            vertices[portals[1]]
          );
        }

      }

      channel.push(targetPosition);

      channel.stringPull();


      var threeVectors = [];

      _.each(channel.path, function (c) {
        var vec = new THREE.Vector3(c.x, c.y, c.z);

        // console.log(vec.clone().sub(startPosition).length());

        // Ensure the intermediate steps aren't too close to the start position
        // var dist = vec.clone().sub(startPosition).lengthSq();
        // if (dist > 0.01 * 0.01) {
          threeVectors.push(vec);
        // }


      });

      // We don't need the first one, as we already know our start position
      threeVectors.shift();

      return threeVectors;
    }
  });

})(typeof exports === 'undefined' ? this['patrol'] = {} : exports);

},{"underscore":3}],3:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],4:[function(require,module,exports){
module.exports = {
  'nav-mesh':    require('./nav-mesh'),
  'nav-controller':     require('./nav-controller'),
  'system':      require('./system'),

  registerAll: function (AFRAME) {
    if (this._registered) return;

    AFRAME = AFRAME || window.AFRAME;

    if (!AFRAME.components['nav-mesh']) {
      AFRAME.registerComponent('nav-mesh', this['nav-mesh']);
    }

    if (!AFRAME.components['nav-controller']) {
      AFRAME.registerComponent('nav-controller',  this['nav-controller']);
    }

    if (!AFRAME.systems.nav) {
      AFRAME.registerSystem('nav', this.system);
    }

    this._registered = true;
  }
};

},{"./nav-controller":5,"./nav-mesh":6,"./system":7}],5:[function(require,module,exports){
module.exports = {
  schema: {
    destination: {type: 'vec3'},
    active: {default: false},
    speed: {default: 2}
  },
  init: function () {
    this.system = this.el.sceneEl.systems.nav;
    this.system.addController(this);
    this.path = [];
    this.raycaster = new THREE.Raycaster();
  },
  remove: function () {
    this.system.removeController(this);
  },
  update: function () {
    this.path.length = 0;
  },
  tick: (function () {
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
        this.path = this.system.getPath(this.el.object3D, vDest.copy(data.destination));
        this.path = this.path || [];
        el.emit('nav-start');
      }

      // If no path is found, exit.
      if (!this.path.length) {
        console.warn('[nav] Unable to find path to %o.', data.destination);
        this.el.setAttribute('nav-controller', {active: false});
        el.emit('nav-end');
        return;
      }

      // Current segment is a vector from current position to next waypoint.
      var vCurrent = el.object3D.position;
      var vWaypoint = this.path[0];
      vDelta.subVectors(vWaypoint, vCurrent);

      var distance = vDelta.length();
      var gazeTarget;

      if (distance < speed) {
        // If <1 step from current waypoint, discard it and move toward next.
        this.path.shift();

        // After discarding the last waypoint, exit pathfinding.
        if (!this.path.length) {
          this.el.setAttribute('nav-controller', {active: false});
          el.emit('nav-end');
          return;
        } else {
          gazeTarget = this.path[0];
        }
      } else {
        // If still far away from next waypoint, find next position for
        // the current frame.
        vNext.copy(vDelta.setLength(speed)).add(vCurrent);
        gazeTarget = vWaypoint;
      }

      // Look at the next waypoint.
      gazeTarget.y = vCurrent.y;
      el.object3D.lookAt(gazeTarget);

      // Raycast against the nav mesh, to keep the controller moving along the
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
  }())
};

},{}],6:[function(require,module,exports){
/**
 * nav-mesh
 *
 * Waits for a mesh to be loaded on the current entity, then sets it as the
 * nav mesh in the pathfinding system.
 */
module.exports = {
  init: function () {
    this.system = this.el.sceneEl.systems.nav;
    this.loadNavMesh();
    this.el.addEventListener('model-loaded', this.loadNavMesh.bind(this));
  },

  loadNavMesh: function () {
    var object = this.el.getObject3D('mesh');

    if (!object) return;

    var navMesh;
    object.traverse(function (node) {
      if (node.isMesh) navMesh = node;
    });

    if (!navMesh) return;

    this.system.setNavMesh(navMesh);
  }
};

},{}],7:[function(require,module,exports){
var patrol = require('../../lib/patrol');
window._ = require('underscore');

/**
 * nav
 *
 * Pathfinding system, using PatrolJS.
 */
module.exports = {
  init: function () {
    this.navMesh = null;
    this.nodes = null;
    this.controllers = new Set();
  },

  /**
   * @param {THREE.Mesh} mesh
   */
  setNavMesh: function (mesh) {
    var geometry = mesh.geometry.isBufferGeometry
      ? new THREE.Geometry().fromBufferGeometry(mesh.geometry)
      : mesh.geometry;
    this.navMesh = new THREE.Mesh(geometry);
    this.nodes = patrol.buildNodes(this.navMesh.geometry);
    patrol.setZoneData('level', this.nodes);
  },

  /**
   * @return {THREE.Mesh}
   */
  getNavMesh: function () {
    return this.navMesh;
  },

  /**
   * @param {NavController} ctrl
   */
  addController: function (ctrl) {
    this.controllers.add(ctrl);
  },

  /**
   * @param {NavController} ctrl
   */
  removeController: function (ctrl) {
    this.controllers.remove(ctrl);
  },

  /**
   * @param  {NavController} ctrl
   * @param  {THREE.Vector3} target
   * @return {Array<THREE.Vector3>}
   */
  getPath: function (ctrl, target) {
    var start = ctrl.el.object3D.position;
    // TODO(donmccurdy): Current group should be cached.
    var group = patrol.getGroup('level', start);
    return patrol.findPath(start, target, 'level', group);
  }
};

},{"../../lib/patrol":2,"underscore":3}]},{},[1]);
