/* global AFRAME, THREE */
import nipplejs from "nipplejs";

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

    this.moveJoystick = nipplejs.create(options);
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

    this.lookJoystick = nipplejs.create(options);
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
