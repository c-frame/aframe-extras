/**
 * Wrapper for THREE.AnimationHandler.
 *
 * Updates animations for all objects at each tick. Should only be attached
 * to the scene.
 */
module.exports = {
	init: function () {
		if (this.el.tagName !== 'A-SCENE') {
			throw new Error('[animation-handler] Component must be attached to a-scene.');
		}
	},
	tick: function (t, dt) {
		THREE.AnimationHandler.update(dt);
	}
};
