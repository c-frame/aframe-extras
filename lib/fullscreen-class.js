(function () {

  /**
   * Monkey patch to apply a 'fullscreen' class to A-Frame scenes in fullscreen
   * mode. Allows overlay content to be hidden in iOS Safari, which doesn't
   * have an actual fullscreen API.
   */
  document.addEventListener('DOMContentLoaded', function () {
    var scene = document.querySelector('a-scene');
    scene.addEventListener('fullscreen-enter', function () {
      scene.classList.add('fullscreen');
    });
    scene.addEventListener('fullscreen-enter', function () {
      scene.classList.remove('fullscreen');
    });
  });

}());
