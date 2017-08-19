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
