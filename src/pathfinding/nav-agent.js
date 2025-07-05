AFRAME.registerComponent('nav-agent', {
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
