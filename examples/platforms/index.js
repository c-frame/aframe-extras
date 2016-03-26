/* Platforms
——————————————————————————————————————————————*/

document.querySelector('a-scene').addEventListener('render-target-loaded', function () {
  var MAP_SIZE = 10,
      PLATFORM_SIZE = 5,
      NUM_PLATFORMS = 50;

  var platformsEl = document.querySelector('#platforms');

  var dims = ''
    + 'width: ' + PLATFORM_SIZE + '; '
    + 'height: ' + PLATFORM_SIZE + '; '
    + 'depth: ' + PLATFORM_SIZE + ';';

  var v, box;
  for (var i = 0;  i < NUM_PLATFORMS; i++) {
    v = {
      x: (Math.floor(Math.random() * MAP_SIZE) - PLATFORM_SIZE) * PLATFORM_SIZE,
      y: (Math.floor(Math.random() * MAP_SIZE)                ) * PLATFORM_SIZE + PLATFORM_SIZE / 2,
      z: (Math.floor(Math.random() * MAP_SIZE) - PLATFORM_SIZE) * PLATFORM_SIZE
    };
    box = document.createElement('a-cube');
    box.setAttribute('color', '#39BB82');
    box.setAttribute('width', PLATFORM_SIZE);
    box.setAttribute('height', PLATFORM_SIZE);
    box.setAttribute('depth', PLATFORM_SIZE);
    box.setAttribute('static-body', dims);
    box.setAttribute('position', v.x + ' ' + v.y + ' ' + v.z);
    platformsEl.appendChild(box);
  }

  console.info('Platforms loaded.');
});
