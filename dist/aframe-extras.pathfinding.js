(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./src/pathfinding').registerAll();
},{"./src/pathfinding":7}],2:[function(require,module,exports){
const BinaryHeap = require('./BinaryHeap');
const utils = require('./utils.js');

class AStar {
  static init (graph) {
    for (let x = 0; x < graph.length; x++) {
      //for(var x in graph) {
      const node = graph[x];
      node.f = 0;
      node.g = 0;
      node.h = 0;
      node.cost = 1.0;
      node.visited = false;
      node.closed = false;
      node.parent = null;
    }
  }

  static cleanUp (graph) {
    for (let x = 0; x < graph.length; x++) {
      const node = graph[x];
      delete node.f;
      delete node.g;
      delete node.h;
      delete node.cost;
      delete node.visited;
      delete node.closed;
      delete node.parent;
    }
  }

  static heap () {
    return new BinaryHeap(function (node) {
      return node.f;
    });
  }

  static search (graph, start, end) {
    this.init(graph);
    //heuristic = heuristic || astar.manhattan;


    const openHeap = this.heap();

    openHeap.push(start);

    while (openHeap.size() > 0) {

      // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
      const currentNode = openHeap.pop();

      // End case -- result has been found, return the traced path.
      if (currentNode === end) {
        let curr = currentNode;
        const ret = [];
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
      const neighbours = this.neighbours(graph, currentNode);

      for (let i = 0, il = neighbours.length; i < il; i++) {
        const neighbour = neighbours[i];

        if (neighbour.closed) {
          // Not a valid node to process, skip to next neighbour.
          continue;
        }

        // The g score is the shortest distance from start to current node.
        // We need to check if the path we have arrived at this neighbour is the shortest one we have seen yet.
        const gScore = currentNode.g + neighbour.cost;
        const beenVisited = neighbour.visited;

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

  static heuristic (pos1, pos2) {
    return utils.distanceToSquared(pos1, pos2);
  }

  static neighbours (graph, node) {
    const ret = [];

    for (let e = 0; e < node.neighbours.length; e++) {
      ret.push(graph[node.neighbours[e]]);
    }

    return ret;
  }
}

module.exports = AStar;

},{"./BinaryHeap":3,"./utils.js":6}],3:[function(require,module,exports){
// javascript-astar
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a binary heap.

class BinaryHeap {
  constructor (scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  push (element) {
    // Add the new element to the end of the array.
    this.content.push(element);

    // Allow it to sink down.
    this.sinkDown(this.content.length - 1);
  }

  pop () {
    // Store the first element so we can return it later.
    const result = this.content[0];
    // Get the element at the end of the array.
    const end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it bubble up.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.bubbleUp(0);
    }
    return result;
  }

  remove (node) {
    const i = this.content.indexOf(node);

    // When it is found, the process seen in 'pop' is repeated
    // to fill up the hole.
    const end = this.content.pop();

    if (i !== this.content.length - 1) {
      this.content[i] = end;

      if (this.scoreFunction(end) < this.scoreFunction(node)) {
        this.sinkDown(i);
      } else {
        this.bubbleUp(i);
      }
    }
  }

  size () {
    return this.content.length;
  }

  rescoreElement (node) {
    this.sinkDown(this.content.indexOf(node));
  }

  sinkDown (n) {
    // Fetch the element that has to be sunk.
    const element = this.content[n];

    // When at 0, an element can not sink any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      const parentN = ((n + 1) >> 1) - 1;
      const parent = this.content[parentN];

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

  bubbleUp (n) {
    // Look up the target element and its score.
    const length = this.content.length,
      element = this.content[n],
      elemScore = this.scoreFunction(element);

    while (true) {
      // Compute the indices of the child elements.
      const child2N = (n + 1) << 1,
        child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      let swap = null;
      let child1Score;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        const child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);

        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) {
          swap = child1N;
        }
      }

      // Do the same checks for the other child.
      if (child2N < length) {
        const child2 = this.content[child2N],
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

}

module.exports = BinaryHeap;

},{}],4:[function(require,module,exports){
const utils = require('./utils');

class Channel {
  constructor () {
    this.portals = [];
  }

  push (p1, p2) {
    if (p2 === undefined) p2 = p1;
    this.portals.push({
      left: p1,
      right: p2
    });
  }

  stringPull () {
    const portals = this.portals;
    const pts = [];
    // Init scan state
    let portalApex, portalLeft, portalRight;
    let apexIndex = 0,
      leftIndex = 0,
      rightIndex = 0;

    portalApex = portals[0].left;
    portalLeft = portals[0].left;
    portalRight = portals[0].right;

    // Add start point.
    pts.push(portalApex);

    for (let i = 1; i < portals.length; i++) {
      const left = portals[i].left;
      const right = portals[i].right;

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

    if ((pts.length === 0) || (!utils.vequal(pts[pts.length - 1], portals[portals.length - 1].left))) {
      // Append last point to path.
      pts.push(portals[portals.length - 1].left);
    }

    this.path = pts;
    return pts;
  }
}

module.exports = Channel;

},{"./utils":6}],5:[function(require,module,exports){
const utils = require('./utils');
const AStar = require('./AStar');
const Channel = require('./Channel');

var polygonId = 1;

var buildPolygonGroups = function (navigationMesh) {

	var polygons = navigationMesh.polygons;

	var polygonGroups = [];
	var groupCount = 0;

	var spreadGroupId = function (polygon) {
		polygon.neighbours.forEach((neighbour) => {
			if (neighbour.group === undefined) {
				neighbour.group = polygon.group;
				spreadGroupId(neighbour);
			}
		});
	};

	polygons.forEach((polygon) => {

		if (polygon.group === undefined) {
			polygon.group = groupCount++;
			// Spread it
			spreadGroupId(polygon);
		}

		if (!polygonGroups[polygon.group]) polygonGroups[polygon.group] = [];

		polygonGroups[polygon.group].push(polygon);
	});

	console.log('Groups built: ', polygonGroups.length);

	return polygonGroups;
};

var buildPolygonNeighbours = function (polygon, navigationMesh) {
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
};

var buildPolygonsFromGeometry = function (geometry) {

	console.log('Vertices:', geometry.vertices.length, 'polygons:', geometry.faces.length);

	var polygons = [];
	var vertices = geometry.vertices;
	var faceVertexUvs = geometry.faceVertexUvs;

	// Convert the faces into a custom format that supports more than 3 vertices
	geometry.faces.forEach((face) => {
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
	polygons.forEach((polygon) => {
		buildPolygonNeighbours(polygon, navigationMesh);
	});

	return navigationMesh;
};

var buildNavigationMesh = function (geometry) {
	// Prepare geometry
	utils.computeCentroids(geometry);
	geometry.mergeVertices();
	return buildPolygonsFromGeometry(geometry);
};

var getSharedVerticesInOrder = function (a, b) {

	var aList = a.vertexIds;
	var bList = b.vertexIds;

	var sharedVertices = [];

	aList.forEach((vId) => {
		if (bList.includes(vId)) {
			sharedVertices.push(vId);
		}
	});

	if (sharedVertices.length < 2) return [];

	// console.log("TRYING aList:", aList, ", bList:", bList, ", sharedVertices:", sharedVertices);

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

	aList.forEach((vId) => {
		if (bList.includes(vId)) {
			sharedVertices.push(vId);
		}
	});

	return sharedVertices;
};

var groupNavMesh = function (navigationMesh) {

	var saveObj = {};

	navigationMesh.vertices.forEach((v) => {
		v.x = utils.roundNumber(v.x, 2);
		v.y = utils.roundNumber(v.y, 2);
		v.z = utils.roundNumber(v.z, 2);
	});

	saveObj.vertices = navigationMesh.vertices;

	var groups = buildPolygonGroups(navigationMesh);

	saveObj.groups = [];

	var findPolygonIndex = function (group, p) {
		for (var i = 0; i < group.length; i++) {
			if (p === group[i]) return i;
		}
	};

	groups.forEach((group) => {

		var newGroup = [];

		group.forEach((p) => {

			var neighbours = [];

			p.neighbours.forEach((n) => {
				neighbours.push(findPolygonIndex(group, n));
			});


			// Build a portal list to each neighbour
			var portals = [];
			p.neighbours.forEach((n) => {
				portals.push(getSharedVerticesInOrder(p, n));
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

		saveObj.groups.push(newGroup);
	});

	return saveObj;
};

var zoneNodes = {};

module.exports = {
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

		zoneNodes[zone].groups.forEach((group, index) => {
			group.forEach((node) => {
				var measuredDistance = utils.distanceToSquared(node.centroid, position);
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

		polygons.forEach((p) => {
			if (nearPosition && nearRange) {
				if (utils.distanceToSquared(nearPosition, p.centroid) < nearRange * nearRange) {
					candidates.push(p.centroid);
				}
			} else {
				candidates.push(p.centroid);
			}
		});

		return utils.sample(candidates) || new THREE.Vector3();
	},
	getClosestNode: function (position, zone, group, checkPolygon = false) {
		const nodes = zoneNodes[zone].groups[group];
		const vertices = zoneNodes[zone].vertices;
		let closestNode = null;
		let closestDistance = Infinity;

		nodes.forEach((node) => {
			const distance = utils.distanceToSquared(node.centroid, position);
			if (distance < closestDistance
					&& (!checkPolygon || utils.isVectorInPolygon(position, node, vertices))) {
				closestNode = node;
				closestDistance = distance;
			}
		});

		return closestNode;
	},
	findPath: function (startPosition, targetPosition, zone, group) {
		const nodes = zoneNodes[zone].groups[group];
		const vertices = zoneNodes[zone].vertices;

		const closestNode = this.getClosestNode(startPosition, zone, group);
		const farthestNode = this.getClosestNode(targetPosition, zone, group, true);

		// If we can't find any node, just go straight to the target
		if (!closestNode || !farthestNode) {
			return null;
		}

		const paths = AStar.search(nodes, closestNode, farthestNode);

		const getPortalFromTo = function (a, b) {
			for (var i = 0; i < a.neighbours.length; i++) {
				if (a.neighbours[i] === b.id) {
					return a.portals[i];
				}
			}
		};

		// We have the corridor, now pull the rope.
		const channel = new Channel();
		channel.push(startPosition);
		for (let i = 0; i < paths.length; i++) {
			const polygon = paths[i];
			const nextPolygon = paths[i + 1];

			if (nextPolygon) {
				const portals = getPortalFromTo(polygon, nextPolygon);
				channel.push(
					vertices[portals[0]],
					vertices[portals[1]]
				);
			}
		}
		channel.push(targetPosition);
		channel.stringPull();

		// Return the path, omitting first position (which is already known).
		const path = channel.path.map((c) => new THREE.Vector3(c.x, c.y, c.z));
		path.shift();
		return path;
	}
};

},{"./AStar":2,"./Channel":4,"./utils":6}],6:[function(require,module,exports){
class Utils {

  static computeCentroids (geometry) {
    var f, fl, face;

    for ( f = 0, fl = geometry.faces.length; f < fl; f ++ ) {

      face = geometry.faces[ f ];
      face.centroid = new THREE.Vector3( 0, 0, 0 );

      face.centroid.add( geometry.vertices[ face.a ] );
      face.centroid.add( geometry.vertices[ face.b ] );
      face.centroid.add( geometry.vertices[ face.c ] );
      face.centroid.divideScalar( 3 );

    }
  }

  static roundNumber (number, decimals) {
    var newnumber = Number(number + '').toFixed(parseInt(decimals));
    return parseFloat(newnumber);
  }

  static sample (list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  static mergeVertexIds (aList, bList) {

    var sharedVertices = [];

    aList.forEach((vID) => {
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

    aList.forEach((vId) => {
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

  static setPolygonCentroid (polygon, navigationMesh) {
    var sum = new THREE.Vector3();

    var vertices = navigationMesh.vertices;

    polygon.vertexIds.forEach((vId) => {
      sum.add(vertices[vId]);
    });

    sum.divideScalar(polygon.vertexIds.length);

    polygon.centroid.copy(sum);
  }

  static cleanPolygon (polygon, navigationMesh) {

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
        polygon.neighbours.forEach((neighbour) => {
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

    // console.log("New vertexIds: ", newVertexIds);

    polygon.vertexIds = newVertexIds;

    setPolygonCentroid(polygon, navigationMesh);

  }

  static isConvex (polygon, navigationMesh) {

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

    results.forEach((r) => {
      if (r === 0) convex = false;
    });

    if (results[0] > 0) {
      results.forEach((r) => {
        if (r < 0) convex = false;
      });
    } else {
      results.forEach((r) => {
        if (r > 0) convex = false;
      });
    }

    return convex;
  }

  static distanceToSquared (a, b) {

    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var dz = a.z - b.z;

    return dx * dx + dy * dy + dz * dz;

  }

  //+ Jonas Raoni Soares Silva
  //@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]
  static isPointInPoly (poly, pt) {
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
      ((poly[i].z <= pt.z && pt.z < poly[j].z) || (poly[j].z <= pt.z && pt.z < poly[i].z)) && (pt.x < (poly[j].x - poly[i].x) * (pt.z - poly[i].z) / (poly[j].z - poly[i].z) + poly[i].x) && (c = !c);
    return c;
  }

  static isVectorInPolygon (vector, polygon, vertices) {

    // reference point will be the centroid of the polygon
    // We need to rotate the vector as well as all the points which the polygon uses

    var lowestPoint = 100000;
    var highestPoint = -100000;

    var polygonVertices = [];

    polygon.vertexIds.forEach((vId) => {
      lowestPoint = Math.min(vertices[vId].y, lowestPoint);
      highestPoint = Math.max(vertices[vId].y, highestPoint);
      polygonVertices.push(vertices[vId]);
    });

    if (vector.y < highestPoint + 0.5 && vector.y > lowestPoint - 0.5 &&
      this.isPointInPoly(polygonVertices, vector)) {
      return true;
    }
    return false;
  }

  static triarea2 (a, b, c) {
    var ax = b.x - a.x;
    var az = b.z - a.z;
    var bx = c.x - a.x;
    var bz = c.z - a.z;
    return bx * az - ax * bz;
  }

  static vequal (a, b) {
    return this.distanceToSquared(a, b) < 0.00001;
  }

  static array_intersect () {
    let i, shortest, nShortest, n, len, ret = [],
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
}



module.exports = Utils;

},{}],7:[function(require,module,exports){
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

},{"./nav-controller":8,"./nav-mesh":9,"./system":10}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
var Path = require('three-pathfinding');

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
    this.nodes = Path.buildNodes(this.navMesh.geometry);
    Path.setZoneData('level', this.nodes);
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
    var group = Path.getGroup('level', start);
    return Path.findPath(start, target, 'level', group);
  }
};

},{"three-pathfinding":5}]},{},[1]);
