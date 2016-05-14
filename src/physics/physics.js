

module.exports = {
  schema: {
    gravity:      { default: -9.8 },

    // Never step more than four frames at once. Effectively pauses the scene
    // when out of focus, and prevents weird "jumps" when focus returns.
    maxInterval:      { default: 4 / 60 },

    // If true, show wireframes around physics bodies.
    debug:        { default: false },
  },

  update: function (previousData) {
    var data = this.data;
    for (var opt in data) {
      if (!previousData || data[opt] !== previousData[opt]) {
        this.system.setOption(opt, data[opt]);
      }
    }
  }
};
