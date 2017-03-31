/**
 * Source: https://github.com/Adobe-Marketing-Cloud/fetch-script
 */

function getScriptId() {
  return 'script_' + Date.now() + '_' + Math.ceil(Math.random() * 100000);
}

function createScript(url, id) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.id = id;
  script.src = url;

  return script;
}

function removeScript(id) {
  const script = document.getElementById(id);
  const parent = script.parentNode;

  try {
    parent && parent.removeChild(script);
  } catch (e) {
    // ignore
  }
}

function appendScript(script) {
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(script, firstScript);
}

function fetchScriptInternal(url, options, Promise) {
  return new Promise(function(resolve, reject) {
    const timeout = options.timeout || 5000;
    const scriptId = getScriptId();
    const script = createScript(url, scriptId);

    const timeoutId = setTimeout(function() {
      reject(new Error('Script request to ' + url + ' timed out'));

      removeScript(scriptId);
    }, timeout);

    const disableTimeout = function(timeoutId) { clearTimeout(timeoutId); };

    script.addEventListener('load', function(e) {
      resolve({ok: true});

      disableTimeout(timeoutId);
      removeScript(scriptId);
    });

    script.addEventListener('error', function(e) {
      reject(new Error('Script request to ' + url + ' failed ' + e));

      disableTimeout(timeoutId);
      removeScript(scriptId);
    });

    appendScript(script);
  });
}

function fetchScript(settings) {
  settings = settings || {};
  return function (url, options) {
    options = options || {};
    return fetchScriptInternal(url, options, settings.Promise || Promise);
  };
}

module.exports = fetchScript;
