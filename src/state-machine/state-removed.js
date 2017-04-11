const StateAdded = require('./state-added');

const Component = AFRAME.utils.extend({}, StateAdded, {
  init: function () {
    StateAdded.init.call(this);
    this.eventType = 'stateremoved';
  }
});

module.exports = AFRAME.registerComponent('state-removed', Component);
