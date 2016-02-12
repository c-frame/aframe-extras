/**
 * Adds jump ability on component.
 */
module.exports = {
	schema: {
		on: { default: 'Spacebar' },
		distance: { default: 5 },
		terrain: { default: '#terrain' }
	},
	init: function () {
		this.canJump = true;
	},
	update: function () {},
	tick: function () {},
	remove: function () {}
};
