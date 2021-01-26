(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require('./src/controls');

},{"./src/controls":7}],2:[function(require,module,exports){
"use strict";

module.exports = Object.assign(function GamepadButton() {}, {
	FACE_1: 0,
	FACE_2: 1,
	FACE_3: 2,
	FACE_4: 3,

	L_SHOULDER_1: 4,
	R_SHOULDER_1: 5,
	L_SHOULDER_2: 6,
	R_SHOULDER_2: 7,

	SELECT: 8,
	START: 9,

	DPAD_UP: 12,
	DPAD_DOWN: 13,
	DPAD_LEFT: 14,
	DPAD_RIGHT: 15,

	VENDOR: 16
});

},{}],3:[function(require,module,exports){
"use strict";

function GamepadButtonEvent(type, index, details) {
  this.type = type;
  this.index = index;
  this.pressed = details.pressed;
  this.value = details.value;
}

module.exports = GamepadButtonEvent;

},{}],4:[function(require,module,exports){
'use strict';

/**
 * Polyfill for the additional KeyboardEvent properties defined in the D3E and
 * D4E draft specifications, by @inexorabletash.
 *
 * See: https://github.com/inexorabletash/polyfill
 */

(function (global) {
  var nativeKeyboardEvent = 'KeyboardEvent' in global;
  if (!nativeKeyboardEvent) global.KeyboardEvent = function KeyboardEvent() {
    throw TypeError('Illegal constructor');
  };

  if (!('DOM_KEY_LOCATION_STANDARD' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_STANDARD = 0x00; // Default or unknown location
  if (!('DOM_KEY_LOCATION_LEFT' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_LEFT = 0x01; // e.g. Left Alt key
  if (!('DOM_KEY_LOCATION_RIGHT' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_RIGHT = 0x02; // e.g. Right Alt key
  if (!('DOM_KEY_LOCATION_NUMPAD' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD = 0x03; // e.g. Numpad 0 or +

  var STANDARD = window.KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
      LEFT = window.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
      RIGHT = window.KeyboardEvent.DOM_KEY_LOCATION_RIGHT,
      NUMPAD = window.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD;

  //--------------------------------------------------------------------
  //
  // Utilities
  //
  //--------------------------------------------------------------------

  function contains(s, ss) {
    return String(s).indexOf(ss) !== -1;
  }

  var os = function () {
    if (contains(navigator.platform, 'Win')) {
      return 'win';
    }
    if (contains(navigator.platform, 'Mac')) {
      return 'mac';
    }
    if (contains(navigator.platform, 'CrOS')) {
      return 'cros';
    }
    if (contains(navigator.platform, 'Linux')) {
      return 'linux';
    }
    if (contains(navigator.userAgent, 'iPad') || contains(navigator.platform, 'iPod') || contains(navigator.platform, 'iPhone')) {
      return 'ios';
    }
    return '';
  }();

  var browser = function () {
    if (contains(navigator.userAgent, 'Chrome/')) {
      return 'chrome';
    }
    if (contains(navigator.vendor, 'Apple')) {
      return 'safari';
    }
    if (contains(navigator.userAgent, 'MSIE')) {
      return 'ie';
    }
    if (contains(navigator.userAgent, 'Gecko/')) {
      return 'moz';
    }
    if (contains(navigator.userAgent, 'Opera/')) {
      return 'opera';
    }
    return '';
  }();

  var browser_os = browser + '-' + os;

  function mergeIf(baseTable, select, table) {
    if (browser_os === select || browser === select || os === select) {
      Object.keys(table).forEach(function (keyCode) {
        baseTable[keyCode] = table[keyCode];
      });
    }
  }

  function remap(o, key) {
    var r = {};
    Object.keys(o).forEach(function (k) {
      var item = o[k];
      if (key in item) {
        r[item[key]] = item;
      }
    });
    return r;
  }

  function invert(o) {
    var r = {};
    Object.keys(o).forEach(function (k) {
      r[o[k]] = k;
    });
    return r;
  }

  //--------------------------------------------------------------------
  //
  // Generic Mappings
  //
  //--------------------------------------------------------------------

  // "keyInfo" is a dictionary:
  //   code: string - name from DOM Level 3 KeyboardEvent code Values
  //     https://dvcs.w3.org/hg/dom3events/raw-file/tip/html/DOM3Events-code.html
  //   location (optional): number - one of the DOM_KEY_LOCATION values
  //   keyCap (optional): string - keyboard label in en-US locale
  // USB code Usage ID from page 0x07 unless otherwise noted (Informative)

  // Map of keyCode to keyInfo
  var keyCodeToInfoTable = {
    // 0x01 - VK_LBUTTON
    // 0x02 - VK_RBUTTON
    0x03: { code: 'Cancel' }, // [USB: 0x9b] char \x0018 ??? (Not in D3E)
    // 0x04 - VK_MBUTTON
    // 0x05 - VK_XBUTTON1
    // 0x06 - VK_XBUTTON2
    0x06: { code: 'Help' }, // [USB: 0x75] ???
    // 0x07 - undefined
    0x08: { code: 'Backspace' }, // [USB: 0x2a] Labelled Delete on Macintosh keyboards.
    0x09: { code: 'Tab' }, // [USB: 0x2b]
    // 0x0A-0x0B - reserved
    0X0C: { code: 'Clear' }, // [USB: 0x9c] NumPad Center (Not in D3E)
    0X0D: { code: 'Enter' }, // [USB: 0x28]
    // 0x0E-0x0F - undefined

    0x10: { code: 'Shift' },
    0x11: { code: 'Control' },
    0x12: { code: 'Alt' },
    0x13: { code: 'Pause' }, // [USB: 0x48]
    0x14: { code: 'CapsLock' }, // [USB: 0x39]
    0x15: { code: 'KanaMode' }, // [USB: 0x88] - "HangulMode" for Korean layout
    0x16: { code: 'HangulMode' }, // [USB: 0x90] 0x15 as well in MSDN VK table ???
    0x17: { code: 'JunjaMode' }, // (Not in D3E)
    0x18: { code: 'FinalMode' }, // (Not in D3E)
    0x19: { code: 'KanjiMode' }, // [USB: 0x91] - "HanjaMode" for Korean layout
    // 0x1A - undefined
    0x1B: { code: 'Escape' }, // [USB: 0x29]
    0x1C: { code: 'Convert' }, // [USB: 0x8a]
    0x1D: { code: 'NonConvert' }, // [USB: 0x8b]
    0x1E: { code: 'Accept' }, // (Not in D3E)
    0x1F: { code: 'ModeChange' }, // (Not in D3E)

    0x20: { code: 'Space' }, // [USB: 0x2c]
    0x21: { code: 'PageUp' }, // [USB: 0x4b]
    0x22: { code: 'PageDown' }, // [USB: 0x4e]
    0x23: { code: 'End' }, // [USB: 0x4d]
    0x24: { code: 'Home' }, // [USB: 0x4a]
    0x25: { code: 'ArrowLeft' }, // [USB: 0x50]
    0x26: { code: 'ArrowUp' }, // [USB: 0x52]
    0x27: { code: 'ArrowRight' }, // [USB: 0x4f]
    0x28: { code: 'ArrowDown' }, // [USB: 0x51]
    0x29: { code: 'Select' }, // (Not in D3E)
    0x2A: { code: 'Print' }, // (Not in D3E)
    0x2B: { code: 'Execute' }, // [USB: 0x74] (Not in D3E)
    0x2C: { code: 'PrintScreen' }, // [USB: 0x46]
    0x2D: { code: 'Insert' }, // [USB: 0x49]
    0x2E: { code: 'Delete' }, // [USB: 0x4c]
    0x2F: { code: 'Help' }, // [USB: 0x75] ???

    0x30: { code: 'Digit0', keyCap: '0' }, // [USB: 0x27] 0)
    0x31: { code: 'Digit1', keyCap: '1' }, // [USB: 0x1e] 1!
    0x32: { code: 'Digit2', keyCap: '2' }, // [USB: 0x1f] 2@
    0x33: { code: 'Digit3', keyCap: '3' }, // [USB: 0x20] 3#
    0x34: { code: 'Digit4', keyCap: '4' }, // [USB: 0x21] 4$
    0x35: { code: 'Digit5', keyCap: '5' }, // [USB: 0x22] 5%
    0x36: { code: 'Digit6', keyCap: '6' }, // [USB: 0x23] 6^
    0x37: { code: 'Digit7', keyCap: '7' }, // [USB: 0x24] 7&
    0x38: { code: 'Digit8', keyCap: '8' }, // [USB: 0x25] 8*
    0x39: { code: 'Digit9', keyCap: '9' }, // [USB: 0x26] 9(
    // 0x3A-0x40 - undefined

    0x41: { code: 'KeyA', keyCap: 'a' }, // [USB: 0x04]
    0x42: { code: 'KeyB', keyCap: 'b' }, // [USB: 0x05]
    0x43: { code: 'KeyC', keyCap: 'c' }, // [USB: 0x06]
    0x44: { code: 'KeyD', keyCap: 'd' }, // [USB: 0x07]
    0x45: { code: 'KeyE', keyCap: 'e' }, // [USB: 0x08]
    0x46: { code: 'KeyF', keyCap: 'f' }, // [USB: 0x09]
    0x47: { code: 'KeyG', keyCap: 'g' }, // [USB: 0x0a]
    0x48: { code: 'KeyH', keyCap: 'h' }, // [USB: 0x0b]
    0x49: { code: 'KeyI', keyCap: 'i' }, // [USB: 0x0c]
    0x4A: { code: 'KeyJ', keyCap: 'j' }, // [USB: 0x0d]
    0x4B: { code: 'KeyK', keyCap: 'k' }, // [USB: 0x0e]
    0x4C: { code: 'KeyL', keyCap: 'l' }, // [USB: 0x0f]
    0x4D: { code: 'KeyM', keyCap: 'm' }, // [USB: 0x10]
    0x4E: { code: 'KeyN', keyCap: 'n' }, // [USB: 0x11]
    0x4F: { code: 'KeyO', keyCap: 'o' }, // [USB: 0x12]

    0x50: { code: 'KeyP', keyCap: 'p' }, // [USB: 0x13]
    0x51: { code: 'KeyQ', keyCap: 'q' }, // [USB: 0x14]
    0x52: { code: 'KeyR', keyCap: 'r' }, // [USB: 0x15]
    0x53: { code: 'KeyS', keyCap: 's' }, // [USB: 0x16]
    0x54: { code: 'KeyT', keyCap: 't' }, // [USB: 0x17]
    0x55: { code: 'KeyU', keyCap: 'u' }, // [USB: 0x18]
    0x56: { code: 'KeyV', keyCap: 'v' }, // [USB: 0x19]
    0x57: { code: 'KeyW', keyCap: 'w' }, // [USB: 0x1a]
    0x58: { code: 'KeyX', keyCap: 'x' }, // [USB: 0x1b]
    0x59: { code: 'KeyY', keyCap: 'y' }, // [USB: 0x1c]
    0x5A: { code: 'KeyZ', keyCap: 'z' }, // [USB: 0x1d]
    0x5B: { code: 'OSLeft', location: LEFT }, // [USB: 0xe3]
    0x5C: { code: 'OSRight', location: RIGHT }, // [USB: 0xe7]
    0x5D: { code: 'ContextMenu' }, // [USB: 0x65] Context Menu
    // 0x5E - reserved
    0x5F: { code: 'Standby' }, // [USB: 0x82] Sleep

    0x60: { code: 'Numpad0', keyCap: '0', location: NUMPAD }, // [USB: 0x62]
    0x61: { code: 'Numpad1', keyCap: '1', location: NUMPAD }, // [USB: 0x59]
    0x62: { code: 'Numpad2', keyCap: '2', location: NUMPAD }, // [USB: 0x5a]
    0x63: { code: 'Numpad3', keyCap: '3', location: NUMPAD }, // [USB: 0x5b]
    0x64: { code: 'Numpad4', keyCap: '4', location: NUMPAD }, // [USB: 0x5c]
    0x65: { code: 'Numpad5', keyCap: '5', location: NUMPAD }, // [USB: 0x5d]
    0x66: { code: 'Numpad6', keyCap: '6', location: NUMPAD }, // [USB: 0x5e]
    0x67: { code: 'Numpad7', keyCap: '7', location: NUMPAD }, // [USB: 0x5f]
    0x68: { code: 'Numpad8', keyCap: '8', location: NUMPAD }, // [USB: 0x60]
    0x69: { code: 'Numpad9', keyCap: '9', location: NUMPAD }, // [USB: 0x61]
    0x6A: { code: 'NumpadMultiply', keyCap: '*', location: NUMPAD }, // [USB: 0x55]
    0x6B: { code: 'NumpadAdd', keyCap: '+', location: NUMPAD }, // [USB: 0x57]
    0x6C: { code: 'NumpadComma', keyCap: ',', location: NUMPAD }, // [USB: 0x85]
    0x6D: { code: 'NumpadSubtract', keyCap: '-', location: NUMPAD }, // [USB: 0x56]
    0x6E: { code: 'NumpadDecimal', keyCap: '.', location: NUMPAD }, // [USB: 0x63]
    0x6F: { code: 'NumpadDivide', keyCap: '/', location: NUMPAD }, // [USB: 0x54]

    0x70: { code: 'F1' }, // [USB: 0x3a]
    0x71: { code: 'F2' }, // [USB: 0x3b]
    0x72: { code: 'F3' }, // [USB: 0x3c]
    0x73: { code: 'F4' }, // [USB: 0x3d]
    0x74: { code: 'F5' }, // [USB: 0x3e]
    0x75: { code: 'F6' }, // [USB: 0x3f]
    0x76: { code: 'F7' }, // [USB: 0x40]
    0x77: { code: 'F8' }, // [USB: 0x41]
    0x78: { code: 'F9' }, // [USB: 0x42]
    0x79: { code: 'F10' }, // [USB: 0x43]
    0x7A: { code: 'F11' }, // [USB: 0x44]
    0x7B: { code: 'F12' }, // [USB: 0x45]
    0x7C: { code: 'F13' }, // [USB: 0x68]
    0x7D: { code: 'F14' }, // [USB: 0x69]
    0x7E: { code: 'F15' }, // [USB: 0x6a]
    0x7F: { code: 'F16' }, // [USB: 0x6b]

    0x80: { code: 'F17' }, // [USB: 0x6c]
    0x81: { code: 'F18' }, // [USB: 0x6d]
    0x82: { code: 'F19' }, // [USB: 0x6e]
    0x83: { code: 'F20' }, // [USB: 0x6f]
    0x84: { code: 'F21' }, // [USB: 0x70]
    0x85: { code: 'F22' }, // [USB: 0x71]
    0x86: { code: 'F23' }, // [USB: 0x72]
    0x87: { code: 'F24' }, // [USB: 0x73]
    // 0x88-0x8F - unassigned

    0x90: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
    0x91: { code: 'ScrollLock' }, // [USB: 0x47]
    // 0x92-0x96 - OEM specific
    // 0x97-0x9F - unassigned

    // NOTE: 0xA0-0xA5 usually mapped to 0x10-0x12 in browsers
    0xA0: { code: 'ShiftLeft', location: LEFT }, // [USB: 0xe1]
    0xA1: { code: 'ShiftRight', location: RIGHT }, // [USB: 0xe5]
    0xA2: { code: 'ControlLeft', location: LEFT }, // [USB: 0xe0]
    0xA3: { code: 'ControlRight', location: RIGHT }, // [USB: 0xe4]
    0xA4: { code: 'AltLeft', location: LEFT }, // [USB: 0xe2]
    0xA5: { code: 'AltRight', location: RIGHT }, // [USB: 0xe6]

    0xA6: { code: 'BrowserBack' }, // [USB: 0x0c/0x0224]
    0xA7: { code: 'BrowserForward' }, // [USB: 0x0c/0x0225]
    0xA8: { code: 'BrowserRefresh' }, // [USB: 0x0c/0x0227]
    0xA9: { code: 'BrowserStop' }, // [USB: 0x0c/0x0226]
    0xAA: { code: 'BrowserSearch' }, // [USB: 0x0c/0x0221]
    0xAB: { code: 'BrowserFavorites' }, // [USB: 0x0c/0x0228]
    0xAC: { code: 'BrowserHome' }, // [USB: 0x0c/0x0222]
    0xAD: { code: 'VolumeMute' }, // [USB: 0x7f]
    0xAE: { code: 'VolumeDown' }, // [USB: 0x81]
    0xAF: { code: 'VolumeUp' }, // [USB: 0x80]

    0xB0: { code: 'MediaTrackNext' }, // [USB: 0x0c/0x00b5]
    0xB1: { code: 'MediaTrackPrevious' }, // [USB: 0x0c/0x00b6]
    0xB2: { code: 'MediaStop' }, // [USB: 0x0c/0x00b7]
    0xB3: { code: 'MediaPlayPause' }, // [USB: 0x0c/0x00cd]
    0xB4: { code: 'LaunchMail' }, // [USB: 0x0c/0x018a]
    0xB5: { code: 'MediaSelect' },
    0xB6: { code: 'LaunchApp1' },
    0xB7: { code: 'LaunchApp2' },
    // 0xB8-0xB9 - reserved
    0xBA: { code: 'Semicolon', keyCap: ';' }, // [USB: 0x33] ;: (US Standard 101)
    0xBB: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
    0xBC: { code: 'Comma', keyCap: ',' }, // [USB: 0x36] ,<
    0xBD: { code: 'Minus', keyCap: '-' }, // [USB: 0x2d] -_
    0xBE: { code: 'Period', keyCap: '.' }, // [USB: 0x37] .>
    0xBF: { code: 'Slash', keyCap: '/' }, // [USB: 0x38] /? (US Standard 101)

    0xC0: { code: 'Backquote', keyCap: '`' }, // [USB: 0x35] `~ (US Standard 101)
    // 0xC1-0xCF - reserved

    // 0xD0-0xD7 - reserved
    // 0xD8-0xDA - unassigned
    0xDB: { code: 'BracketLeft', keyCap: '[' }, // [USB: 0x2f] [{ (US Standard 101)
    0xDC: { code: 'Backslash', keyCap: '\\' }, // [USB: 0x31] \| (US Standard 101)
    0xDD: { code: 'BracketRight', keyCap: ']' }, // [USB: 0x30] ]} (US Standard 101)
    0xDE: { code: 'Quote', keyCap: '\'' }, // [USB: 0x34] '" (US Standard 101)
    // 0xDF - miscellaneous/varies

    // 0xE0 - reserved
    // 0xE1 - OEM specific
    0xE2: { code: 'IntlBackslash', keyCap: '\\' }, // [USB: 0x64] \| (UK Standard 102)
    // 0xE3-0xE4 - OEM specific
    0xE5: { code: 'Process' }, // (Not in D3E)
    // 0xE6 - OEM specific
    // 0xE7 - VK_PACKET
    // 0xE8 - unassigned
    // 0xE9-0xEF - OEM specific

    // 0xF0-0xF5 - OEM specific
    0xF6: { code: 'Attn' }, // [USB: 0x9a] (Not in D3E)
    0xF7: { code: 'CrSel' }, // [USB: 0xa3] (Not in D3E)
    0xF8: { code: 'ExSel' }, // [USB: 0xa4] (Not in D3E)
    0xF9: { code: 'EraseEof' }, // (Not in D3E)
    0xFA: { code: 'Play' }, // (Not in D3E)
    0xFB: { code: 'ZoomToggle' }, // (Not in D3E)
    // 0xFC - VK_NONAME - reserved
    // 0xFD - VK_PA1
    0xFE: { code: 'Clear' // [USB: 0x9c] (Not in D3E)
    } };

  // No legacy keyCode, but listed in D3E:

  // code: usb
  // 'IntlHash': 0x070032,
  // 'IntlRo': 0x070087,
  // 'IntlYen': 0x070089,
  // 'NumpadBackspace': 0x0700bb,
  // 'NumpadClear': 0x0700d8,
  // 'NumpadClearEntry': 0x0700d9,
  // 'NumpadMemoryAdd': 0x0700d3,
  // 'NumpadMemoryClear': 0x0700d2,
  // 'NumpadMemoryRecall': 0x0700d1,
  // 'NumpadMemoryStore': 0x0700d0,
  // 'NumpadMemorySubtract': 0x0700d4,
  // 'NumpadParenLeft': 0x0700b6,
  // 'NumpadParenRight': 0x0700b7,

  //--------------------------------------------------------------------
  //
  // Browser/OS Specific Mappings
  //
  //--------------------------------------------------------------------

  mergeIf(keyCodeToInfoTable, 'moz', {
    0x3B: { code: 'Semicolon', keyCap: ';' }, // [USB: 0x33] ;: (US Standard 101)
    0x3D: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
    0x6B: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
    0x6D: { code: 'Minus', keyCap: '-' }, // [USB: 0x2d] -_
    0xBB: { code: 'NumpadAdd', keyCap: '+', location: NUMPAD }, // [USB: 0x57]
    0xBD: { code: 'NumpadSubtract', keyCap: '-', location: NUMPAD // [USB: 0x56]
    } });

  mergeIf(keyCodeToInfoTable, 'moz-mac', {
    0x0C: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
    0xAD: { code: 'Minus', keyCap: '-' // [USB: 0x2d] -_
    } });

  mergeIf(keyCodeToInfoTable, 'moz-win', {
    0xAD: { code: 'Minus', keyCap: '-' // [USB: 0x2d] -_
    } });

  mergeIf(keyCodeToInfoTable, 'chrome-mac', {
    0x5D: { code: 'OSRight', location: RIGHT // [USB: 0xe7]
    } });

  // Windows via Bootcamp (!)
  if (0) {
    mergeIf(keyCodeToInfoTable, 'chrome-win', {
      0xC0: { code: 'Quote', keyCap: '\'' }, // [USB: 0x34] '" (US Standard 101)
      0xDE: { code: 'Backslash', keyCap: '\\' }, // [USB: 0x31] \| (US Standard 101)
      0xDF: { code: 'Backquote', keyCap: '`' // [USB: 0x35] `~ (US Standard 101)
      } });

    mergeIf(keyCodeToInfoTable, 'ie', {
      0xC0: { code: 'Quote', keyCap: '\'' }, // [USB: 0x34] '" (US Standard 101)
      0xDE: { code: 'Backslash', keyCap: '\\' }, // [USB: 0x31] \| (US Standard 101)
      0xDF: { code: 'Backquote', keyCap: '`' // [USB: 0x35] `~ (US Standard 101)
      } });
  }

  mergeIf(keyCodeToInfoTable, 'safari', {
    0x03: { code: 'Enter' }, // [USB: 0x28] old Safari
    0x19: { code: 'Tab' // [USB: 0x2b] old Safari for Shift+Tab
    } });

  mergeIf(keyCodeToInfoTable, 'ios', {
    0x0A: { code: 'Enter', location: STANDARD // [USB: 0x28]
    } });

  mergeIf(keyCodeToInfoTable, 'safari-mac', {
    0x5B: { code: 'OSLeft', location: LEFT }, // [USB: 0xe3]
    0x5D: { code: 'OSRight', location: RIGHT }, // [USB: 0xe7]
    0xE5: { code: 'KeyQ', keyCap: 'Q' // [USB: 0x14] On alternate presses, Ctrl+Q sends this
    } });

  //--------------------------------------------------------------------
  //
  // Identifier Mappings
  //
  //--------------------------------------------------------------------

  // Cases where newer-ish browsers send keyIdentifier which can be
  // used to disambiguate keys.

  // keyIdentifierTable[keyIdentifier] -> keyInfo

  var keyIdentifierTable = {};
  if ('cros' === os) {
    keyIdentifierTable['U+00A0'] = { code: 'ShiftLeft', location: LEFT };
    keyIdentifierTable['U+00A1'] = { code: 'ShiftRight', location: RIGHT };
    keyIdentifierTable['U+00A2'] = { code: 'ControlLeft', location: LEFT };
    keyIdentifierTable['U+00A3'] = { code: 'ControlRight', location: RIGHT };
    keyIdentifierTable['U+00A4'] = { code: 'AltLeft', location: LEFT };
    keyIdentifierTable['U+00A5'] = { code: 'AltRight', location: RIGHT };
  }
  if ('chrome-mac' === browser_os) {
    keyIdentifierTable['U+0010'] = { code: 'ContextMenu' };
  }
  if ('safari-mac' === browser_os) {
    keyIdentifierTable['U+0010'] = { code: 'ContextMenu' };
  }
  if ('ios' === os) {
    // These only generate keyup events
    keyIdentifierTable['U+0010'] = { code: 'Function' };

    keyIdentifierTable['U+001C'] = { code: 'ArrowLeft' };
    keyIdentifierTable['U+001D'] = { code: 'ArrowRight' };
    keyIdentifierTable['U+001E'] = { code: 'ArrowUp' };
    keyIdentifierTable['U+001F'] = { code: 'ArrowDown' };

    keyIdentifierTable['U+0001'] = { code: 'Home' }; // [USB: 0x4a] Fn + ArrowLeft
    keyIdentifierTable['U+0004'] = { code: 'End' }; // [USB: 0x4d] Fn + ArrowRight
    keyIdentifierTable['U+000B'] = { code: 'PageUp' }; // [USB: 0x4b] Fn + ArrowUp
    keyIdentifierTable['U+000C'] = { code: 'PageDown' }; // [USB: 0x4e] Fn + ArrowDown
  }

  //--------------------------------------------------------------------
  //
  // Location Mappings
  //
  //--------------------------------------------------------------------

  // Cases where newer-ish browsers send location/keyLocation which
  // can be used to disambiguate keys.

  // locationTable[location][keyCode] -> keyInfo
  var locationTable = [];
  locationTable[LEFT] = {
    0x10: { code: 'ShiftLeft', location: LEFT }, // [USB: 0xe1]
    0x11: { code: 'ControlLeft', location: LEFT }, // [USB: 0xe0]
    0x12: { code: 'AltLeft', location: LEFT // [USB: 0xe2]
    } };
  locationTable[RIGHT] = {
    0x10: { code: 'ShiftRight', location: RIGHT }, // [USB: 0xe5]
    0x11: { code: 'ControlRight', location: RIGHT }, // [USB: 0xe4]
    0x12: { code: 'AltRight', location: RIGHT // [USB: 0xe6]
    } };
  locationTable[NUMPAD] = {
    0x0D: { code: 'NumpadEnter', location: NUMPAD // [USB: 0x58]
    } };

  mergeIf(locationTable[NUMPAD], 'moz', {
    0x6D: { code: 'NumpadSubtract', location: NUMPAD }, // [USB: 0x56]
    0x6B: { code: 'NumpadAdd', location: NUMPAD // [USB: 0x57]
    } });
  mergeIf(locationTable[LEFT], 'moz-mac', {
    0xE0: { code: 'OSLeft', location: LEFT // [USB: 0xe3]
    } });
  mergeIf(locationTable[RIGHT], 'moz-mac', {
    0xE0: { code: 'OSRight', location: RIGHT // [USB: 0xe7]
    } });
  mergeIf(locationTable[RIGHT], 'moz-win', {
    0x5B: { code: 'OSRight', location: RIGHT // [USB: 0xe7]
    } });

  mergeIf(locationTable[RIGHT], 'mac', {
    0x5D: { code: 'OSRight', location: RIGHT // [USB: 0xe7]
    } });

  mergeIf(locationTable[NUMPAD], 'chrome-mac', {
    0x0C: { code: 'NumLock', location: NUMPAD // [USB: 0x53]
    } });

  mergeIf(locationTable[NUMPAD], 'safari-mac', {
    0x0C: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
    0xBB: { code: 'NumpadAdd', location: NUMPAD }, // [USB: 0x57]
    0xBD: { code: 'NumpadSubtract', location: NUMPAD }, // [USB: 0x56]
    0xBE: { code: 'NumpadDecimal', location: NUMPAD }, // [USB: 0x63]
    0xBF: { code: 'NumpadDivide', location: NUMPAD // [USB: 0x54]
    } });

  //--------------------------------------------------------------------
  //
  // Key Values
  //
  //--------------------------------------------------------------------

  // Mapping from `code` values to `key` values. Values defined at:
  // https://dvcs.w3.org/hg/dom3events/raw-file/tip/html/DOM3Events-key.html
  // Entries are only provided when `key` differs from `code`. If
  // printable, `shiftKey` has the shifted printable character. This
  // assumes US Standard 101 layout

  var codeToKeyTable = {
    // Modifier Keys
    ShiftLeft: { key: 'Shift' },
    ShiftRight: { key: 'Shift' },
    ControlLeft: { key: 'Control' },
    ControlRight: { key: 'Control' },
    AltLeft: { key: 'Alt' },
    AltRight: { key: 'Alt' },
    OSLeft: { key: 'OS' },
    OSRight: { key: 'OS' },

    // Whitespace Keys
    NumpadEnter: { key: 'Enter' },
    Space: { key: ' ' },

    // Printable Keys
    Digit0: { key: '0', shiftKey: ')' },
    Digit1: { key: '1', shiftKey: '!' },
    Digit2: { key: '2', shiftKey: '@' },
    Digit3: { key: '3', shiftKey: '#' },
    Digit4: { key: '4', shiftKey: '$' },
    Digit5: { key: '5', shiftKey: '%' },
    Digit6: { key: '6', shiftKey: '^' },
    Digit7: { key: '7', shiftKey: '&' },
    Digit8: { key: '8', shiftKey: '*' },
    Digit9: { key: '9', shiftKey: '(' },
    KeyA: { key: 'a', shiftKey: 'A' },
    KeyB: { key: 'b', shiftKey: 'B' },
    KeyC: { key: 'c', shiftKey: 'C' },
    KeyD: { key: 'd', shiftKey: 'D' },
    KeyE: { key: 'e', shiftKey: 'E' },
    KeyF: { key: 'f', shiftKey: 'F' },
    KeyG: { key: 'g', shiftKey: 'G' },
    KeyH: { key: 'h', shiftKey: 'H' },
    KeyI: { key: 'i', shiftKey: 'I' },
    KeyJ: { key: 'j', shiftKey: 'J' },
    KeyK: { key: 'k', shiftKey: 'K' },
    KeyL: { key: 'l', shiftKey: 'L' },
    KeyM: { key: 'm', shiftKey: 'M' },
    KeyN: { key: 'n', shiftKey: 'N' },
    KeyO: { key: 'o', shiftKey: 'O' },
    KeyP: { key: 'p', shiftKey: 'P' },
    KeyQ: { key: 'q', shiftKey: 'Q' },
    KeyR: { key: 'r', shiftKey: 'R' },
    KeyS: { key: 's', shiftKey: 'S' },
    KeyT: { key: 't', shiftKey: 'T' },
    KeyU: { key: 'u', shiftKey: 'U' },
    KeyV: { key: 'v', shiftKey: 'V' },
    KeyW: { key: 'w', shiftKey: 'W' },
    KeyX: { key: 'x', shiftKey: 'X' },
    KeyY: { key: 'y', shiftKey: 'Y' },
    KeyZ: { key: 'z', shiftKey: 'Z' },
    Numpad0: { key: '0' },
    Numpad1: { key: '1' },
    Numpad2: { key: '2' },
    Numpad3: { key: '3' },
    Numpad4: { key: '4' },
    Numpad5: { key: '5' },
    Numpad6: { key: '6' },
    Numpad7: { key: '7' },
    Numpad8: { key: '8' },
    Numpad9: { key: '9' },
    NumpadMultiply: { key: '*' },
    NumpadAdd: { key: '+' },
    NumpadComma: { key: ',' },
    NumpadSubtract: { key: '-' },
    NumpadDecimal: { key: '.' },
    NumpadDivide: { key: '/' },
    Semicolon: { key: ';', shiftKey: ':' },
    Equal: { key: '=', shiftKey: '+' },
    Comma: { key: ',', shiftKey: '<' },
    Minus: { key: '-', shiftKey: '_' },
    Period: { key: '.', shiftKey: '>' },
    Slash: { key: '/', shiftKey: '?' },
    Backquote: { key: '`', shiftKey: '~' },
    BracketLeft: { key: '[', shiftKey: '{' },
    Backslash: { key: '\\', shiftKey: '|' },
    BracketRight: { key: ']', shiftKey: '}' },
    Quote: { key: '\'', shiftKey: '"' },
    IntlBackslash: { key: '\\', shiftKey: '|' }
  };

  mergeIf(codeToKeyTable, 'mac', {
    OSLeft: { key: 'Meta' },
    OSRight: { key: 'Meta' }
  });

  // Corrections for 'key' names in older browsers (e.g. FF36-)
  // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.key#Key_values
  var keyFixTable = {
    Esc: 'Escape',
    Nonconvert: 'NonConvert',
    Left: 'ArrowLeft',
    Up: 'ArrowUp',
    Right: 'ArrowRight',
    Down: 'ArrowDown',
    Del: 'Delete',
    Menu: 'ContextMenu',
    MediaNextTrack: 'MediaTrackNext',
    MediaPreviousTrack: 'MediaTrackPrevious',
    SelectMedia: 'MediaSelect',
    HalfWidth: 'Hankaku',
    FullWidth: 'Zenkaku',
    RomanCharacters: 'Romaji',
    Crsel: 'CrSel',
    Exsel: 'ExSel',
    Zoom: 'ZoomToggle'
  };

  //--------------------------------------------------------------------
  //
  // Exported Functions
  //
  //--------------------------------------------------------------------


  var codeTable = remap(keyCodeToInfoTable, 'code');

  try {
    var nativeLocation = nativeKeyboardEvent && 'location' in new KeyboardEvent('');
  } catch (_) {}

  function keyInfoForEvent(event) {
    var keyCode = 'keyCode' in event ? event.keyCode : 'which' in event ? event.which : 0;

    var keyInfo = function () {
      if (nativeLocation || 'keyLocation' in event) {
        var location = nativeLocation ? event.location : event.keyLocation;
        if (location && keyCode in locationTable[location]) {
          return locationTable[location][keyCode];
        }
      }
      if ('keyIdentifier' in event && event.keyIdentifier in keyIdentifierTable) {
        return keyIdentifierTable[event.keyIdentifier];
      }
      if (keyCode in keyCodeToInfoTable) {
        return keyCodeToInfoTable[keyCode];
      }
      return null;
    }();

    // TODO: Track these down and move to general tables
    if (0) {
      // TODO: Map these for newerish browsers?
      // TODO: iOS only?
      // TODO: Override with more common keyIdentifier name?
      switch (event.keyIdentifier) {
        case 'U+0010':
          keyInfo = { code: 'Function' };break;
        case 'U+001C':
          keyInfo = { code: 'ArrowLeft' };break;
        case 'U+001D':
          keyInfo = { code: 'ArrowRight' };break;
        case 'U+001E':
          keyInfo = { code: 'ArrowUp' };break;
        case 'U+001F':
          keyInfo = { code: 'ArrowDown' };break;
      }
    }

    if (!keyInfo) return null;

    var key = function () {
      var entry = codeToKeyTable[keyInfo.code];
      if (!entry) return keyInfo.code;
      return event.shiftKey && 'shiftKey' in entry ? entry.shiftKey : entry.key;
    }();

    return {
      code: keyInfo.code,
      key: key,
      location: keyInfo.location,
      keyCap: keyInfo.keyCap
    };
  }

  function queryKeyCap(code, locale) {
    code = String(code);
    if (!codeTable.hasOwnProperty(code)) return 'Undefined';
    if (locale && String(locale).toLowerCase() !== 'en-us') throw Error('Unsupported locale');
    var keyInfo = codeTable[code];
    return keyInfo.keyCap || keyInfo.code || 'Undefined';
  }

  if ('KeyboardEvent' in global && 'defineProperty' in Object) {
    (function () {
      function define(o, p, v) {
        if (p in o) return;
        Object.defineProperty(o, p, v);
      }

      define(KeyboardEvent.prototype, 'code', { get: function get() {
          var keyInfo = keyInfoForEvent(this);
          return keyInfo ? keyInfo.code : '';
        } });

      // Fix for nonstandard `key` values (FF36-)
      if ('key' in KeyboardEvent.prototype) {
        var desc = Object.getOwnPropertyDescriptor(KeyboardEvent.prototype, 'key');
        Object.defineProperty(KeyboardEvent.prototype, 'key', { get: function get() {
            var key = desc.get.call(this);
            return keyFixTable.hasOwnProperty(key) ? keyFixTable[key] : key;
          } });
      }

      define(KeyboardEvent.prototype, 'key', { get: function get() {
          var keyInfo = keyInfoForEvent(this);
          return keyInfo && 'key' in keyInfo ? keyInfo.key : 'Unidentified';
        } });

      define(KeyboardEvent.prototype, 'location', { get: function get() {
          var keyInfo = keyInfoForEvent(this);
          return keyInfo && 'location' in keyInfo ? keyInfo.location : STANDARD;
        } });

      define(KeyboardEvent.prototype, 'locale', { get: function get() {
          return '';
        } });
    })();
  }

  if (!('queryKeyCap' in global.KeyboardEvent)) global.KeyboardEvent.queryKeyCap = queryKeyCap;

  // Helper for IE8-
  global.identifyKey = function (event) {
    if ('code' in event) return;

    var keyInfo = keyInfoForEvent(event);
    event.code = keyInfo ? keyInfo.code : '';
    event.key = keyInfo && 'key' in keyInfo ? keyInfo.key : 'Unidentified';
    event.location = 'location' in event ? event.location : 'keyLocation' in event ? event.keyLocation : keyInfo && 'location' in keyInfo ? keyInfo.location : STANDARD;
    event.locale = '';
  };
})(window);

},{}],5:[function(require,module,exports){
'use strict';

var EPS = 0.1;

module.exports = AFRAME.registerComponent('checkpoint-controls', {
  schema: {
    enabled: { default: true },
    mode: { default: 'teleport', oneOf: ['teleport', 'animate'] },
    animateSpeed: { default: 3.0 }
  },

  init: function init() {
    this.active = true;
    this.checkpoint = null;

    this.isNavMeshConstrained = false;

    this.offset = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();
  },

  play: function play() {
    this.active = true;
  },
  pause: function pause() {
    this.active = false;
  },

  setCheckpoint: function setCheckpoint(checkpoint) {
    var el = this.el;

    if (!this.active) return;
    if (this.checkpoint === checkpoint) return;

    if (this.checkpoint) {
      el.emit('navigation-end', { checkpoint: this.checkpoint });
    }

    this.checkpoint = checkpoint;
    this.sync();

    // Ignore new checkpoint if we're already there.
    if (this.position.distanceTo(this.targetPosition) < EPS) {
      this.checkpoint = null;
      return;
    }

    el.emit('navigation-start', { checkpoint: checkpoint });

    if (this.data.mode === 'teleport') {
      this.el.setAttribute('position', this.targetPosition);
      this.checkpoint = null;
      el.emit('navigation-end', { checkpoint: checkpoint });
      el.components['movement-controls'].updateNavLocation();
    }
  },

  isVelocityActive: function isVelocityActive() {
    return !!(this.active && this.checkpoint);
  },

  getVelocity: function getVelocity() {
    if (!this.active) return;

    var data = this.data;
    var offset = this.offset;
    var position = this.position;
    var targetPosition = this.targetPosition;
    var checkpoint = this.checkpoint;

    this.sync();
    if (position.distanceTo(targetPosition) < EPS) {
      this.checkpoint = null;
      this.el.emit('navigation-end', { checkpoint: checkpoint });
      return offset.set(0, 0, 0);
    }
    offset.setLength(data.animateSpeed);
    return offset;
  },

  sync: function sync() {
    var offset = this.offset;
    var position = this.position;
    var targetPosition = this.targetPosition;

    position.copy(this.el.getAttribute('position'));
    this.checkpoint.object3D.getWorldPosition(targetPosition);
    targetPosition.add(this.checkpoint.components.checkpoint.getOffset());
    offset.copy(targetPosition).sub(position);
  }
});

},{}],6:[function(require,module,exports){
'use strict';

/**
 * Gamepad controls for A-Frame.
 *
 * Stripped-down version of: https://github.com/donmccurdy/aframe-gamepad-controls
 *
 * For more information about the Gamepad API, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
 */

var GamepadButton = require('../../lib/GamepadButton'),
    GamepadButtonEvent = require('../../lib/GamepadButtonEvent');

var JOYSTICK_EPS = 0.2;

var Hand = {
  LEFT: 'left',
  RIGHT: 'right'
};

var Joystick = {
  MOVEMENT: 1,
  ROTATION: 2
};

module.exports = AFRAME.registerComponent('gamepad-controls', {

  /*******************************************************************
   * Statics
   */

  GamepadButton: GamepadButton,

  /*******************************************************************
   * Schema
   */

  schema: {
    // Enable/disable gamepad-controls
    enabled: { default: true },

    // Heading element for rotation
    camera: { default: '[camera]', type: 'selector' },

    // Rotation sensitivity
    rotationSensitivity: { default: 2.0 }
  },

  /*******************************************************************
   * Core
   */

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function init() {
    var sceneEl = this.el.sceneEl;

    this.system = sceneEl.systems['tracked-controls-webxr'] || { controllers: [] };

    this.prevTime = window.performance.now();

    // Button state
    this.buttons = {};

    // Rotation
    var rotation = this.el.object3D.rotation;
    this.pitch = new THREE.Object3D();
    this.pitch.rotation.x = THREE.Math.degToRad(rotation.x);
    this.yaw = new THREE.Object3D();
    this.yaw.position.y = 10;
    this.yaw.rotation.y = THREE.Math.degToRad(rotation.y);
    this.yaw.add(this.pitch);

    this._lookVector = new THREE.Vector2();
    this._moveVector = new THREE.Vector2();
    this._dpadVector = new THREE.Vector2();

    sceneEl.addBehavior(this);
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function update() {
    this.tick();
  },

  /**
   * Called on each iteration of main render loop.
   */
  tick: function tick(t, dt) {
    this.updateButtonState();
    this.updateRotation(dt);
  },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function remove() {},

  /*******************************************************************
   * Movement
   */

  isVelocityActive: function isVelocityActive() {
    if (!this.data.enabled || !this.isConnected()) return false;

    var dpad = this._dpadVector;
    var joystick = this._moveVector;

    this.getDpad(dpad);
    this.getJoystick(Joystick.MOVEMENT, joystick);

    var inputX = dpad.x || joystick.x;
    var inputY = dpad.y || joystick.y;

    return Math.abs(inputX) > JOYSTICK_EPS || Math.abs(inputY) > JOYSTICK_EPS;
  },

  getVelocityDelta: function getVelocityDelta() {
    var dpad = this._dpadVector;
    var joystick = this._moveVector;

    this.getDpad(dpad);
    this.getJoystick(Joystick.MOVEMENT, joystick);

    var inputX = dpad.x || joystick.x;
    var inputY = dpad.y || joystick.y;
    var dVelocity = new THREE.Vector3();

    if (Math.abs(inputX) > JOYSTICK_EPS) {
      dVelocity.x += inputX;
    }
    if (Math.abs(inputY) > JOYSTICK_EPS) {
      dVelocity.z += inputY;
    }

    return dVelocity;
  },

  /*******************************************************************
   * Rotation
   */

  isRotationActive: function isRotationActive() {
    if (!this.data.enabled || !this.isConnected()) return false;

    var joystick = this._lookVector;

    this.getJoystick(Joystick.ROTATION, joystick);

    return Math.abs(joystick.x) > JOYSTICK_EPS || Math.abs(joystick.y) > JOYSTICK_EPS;
  },

  updateRotation: function updateRotation(dt) {
    if (!this.isRotationActive()) return;

    var data = this.data;
    var yaw = this.yaw;
    var pitch = this.pitch;
    var lookControls = data.camera.components['look-controls'];
    var hasLookControls = lookControls && lookControls.pitchObject && lookControls.yawObject;

    // Sync with look-controls pitch/yaw if available.
    if (hasLookControls) {
      pitch.rotation.copy(lookControls.pitchObject.rotation);
      yaw.rotation.copy(lookControls.yawObject.rotation);
    }

    var lookVector = this._lookVector;

    this.getJoystick(Joystick.ROTATION, lookVector);

    if (Math.abs(lookVector.x) <= JOYSTICK_EPS) lookVector.x = 0;
    if (Math.abs(lookVector.y) <= JOYSTICK_EPS) lookVector.y = 0;

    lookVector.multiplyScalar(data.rotationSensitivity * dt / 1000);
    yaw.rotation.y -= lookVector.x;
    pitch.rotation.x -= lookVector.y;
    pitch.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.rotation.x));
    data.camera.object3D.rotation.set(pitch.rotation.x, yaw.rotation.y, 0);

    // Sync with look-controls pitch/yaw if available.
    if (hasLookControls) {
      lookControls.pitchObject.rotation.copy(pitch.rotation);
      lookControls.yawObject.rotation.copy(yaw.rotation);
    }
  },

  /*******************************************************************
   * Button events
   */

  updateButtonState: function updateButtonState() {
    var gamepad = this.getGamepad(Hand.RIGHT);
    if (this.data.enabled && gamepad) {

      // Fire DOM events for button state changes.
      for (var i = 0; i < gamepad.buttons.length; i++) {
        if (gamepad.buttons[i].pressed && !this.buttons[i]) {
          this.emit(new GamepadButtonEvent('gamepadbuttondown', i, gamepad.buttons[i]));
        } else if (!gamepad.buttons[i].pressed && this.buttons[i]) {
          this.emit(new GamepadButtonEvent('gamepadbuttonup', i, gamepad.buttons[i]));
        }
        this.buttons[i] = gamepad.buttons[i].pressed;
      }
    } else if (Object.keys(this.buttons)) {
      // Reset state if controls are disabled or controller is lost.
      this.buttons = {};
    }
  },

  emit: function emit(event) {
    // Emit original event.
    this.el.emit(event.type, event);

    // Emit convenience event, identifying button index.
    this.el.emit(event.type + ':' + event.index, new GamepadButtonEvent(event.type, event.index, event));
  },

  /*******************************************************************
   * Gamepad state
   */

  /**
   * Returns the Gamepad instance attached to the component. If connected,
   * a proxy-controls component may provide access to Gamepad input from a
   * remote device.
   *
   * @param {string} handPreference
   * @return {Gamepad}
   */
  getGamepad: function () {
    var _xrGamepads = [];
    var _empty = [];

    return function (handPreference) {
      // https://github.com/donmccurdy/aframe-proxy-controls
      var proxyControls = this.el.sceneEl.components['proxy-controls'];
      var proxyGamepad = proxyControls && proxyControls.isConnected() && proxyControls.getGamepad(0);
      if (proxyGamepad) return proxyGamepad;

      // https://www.w3.org/TR/webxr/#dom-xrinputsource-handedness
      _xrGamepads.length = 0;
      for (var i = 0; i < this.system.controllers.length; i++) {
        var xrController = this.system.controllers[i];
        var xrGamepad = xrController ? xrController.gamepad : null;
        _xrGamepads.push(xrGamepad);
        if (xrGamepad && xrGamepad.handedness === handPreference) return xrGamepad;
      }

      // https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/hand
      var navGamepads = navigator.getGamepads ? navigator.getGamepads() : _empty;
      for (var _i = 0; _i < navGamepads.length; _i++) {
        var navGamepad = navGamepads[_i];
        if (navGamepad && navGamepad.hand === handPreference) return navGamepad;
      }

      return _xrGamepads[0] || navGamepads[0];
    };
  }(),

  /**
   * Returns the state of the given button.
   * @param  {number} index The button (0-N) for which to find state.
   * @return {GamepadButton}
   */
  getButton: function getButton(index) {
    return this.getGamepad(Hand.RIGHT).buttons[index];
  },

  /**
   * Returns state of the given axis. Axes are labelled 0-N, where 0-1 will
   * represent X/Y on the first joystick, and 2-3 X/Y on the second.
   * @param  {number} index The axis (0-N) for which to find state.
   * @return {number} On the interval [-1,1].
   */
  getAxis: function getAxis(index) {
    return this.getGamepad(index > 1 ? Hand.RIGHT : Hand.LEFT).axes[index];
  },

  /**
   * Returns the state of the specified joystick as a THREE.Vector2.
   * @param  {Joystick} role
   * @param  {THREE.Vector2} target
   * @return {THREE.Vector2}
   */
  getJoystick: function getJoystick(index, target) {
    var gamepad = this.getGamepad(index === Joystick.MOVEMENT ? Hand.LEFT : Hand.RIGHT);
    if (gamepad.mapping === 'xr-standard') {
      // See: https://github.com/donmccurdy/aframe-extras/issues/307
      switch (index) {
        case Joystick.MOVEMENT:
          return target.set(gamepad.axes[2], gamepad.axes[3]);
        case Joystick.ROTATION:
          return target.set(gamepad.axes[0], gamepad.axes[1]);
      }
    } else {
      switch (index) {
        case Joystick.MOVEMENT:
          return target.set(gamepad.axes[0], gamepad.axes[1]);
        case Joystick.ROTATION:
          return target.set(gamepad.axes[2], gamepad.axes[3]);
      }
    }
    throw new Error('Unexpected joystick index "%d".', index);
  },

  /**
   * Returns the state of the dpad as a THREE.Vector2.
   * @param {THREE.Vector2} target
   * @return {THREE.Vector2}
   */
  getDpad: function getDpad(target) {
    var gamepad = this.getGamepad(Hand.LEFT);
    if (!gamepad.buttons[GamepadButton.DPAD_RIGHT]) {
      return target.set(0, 0);
    }
    return target.set((gamepad.buttons[GamepadButton.DPAD_RIGHT].pressed ? 1 : 0) + (gamepad.buttons[GamepadButton.DPAD_LEFT].pressed ? -1 : 0), (gamepad.buttons[GamepadButton.DPAD_UP].pressed ? -1 : 0) + (gamepad.buttons[GamepadButton.DPAD_DOWN].pressed ? 1 : 0));
  },

  /**
   * Returns true if the gamepad is currently connected to the system.
   * @return {boolean}
   */
  isConnected: function isConnected() {
    var gamepad = this.getGamepad(Hand.LEFT);
    return !!(gamepad && gamepad.connected);
  },

  /**
   * Returns a string containing some information about the controller. Result
   * may vary across browsers, for a given controller.
   * @return {string}
   */
  getID: function getID() {
    return this.getGamepad(Hand.LEFT).id;
  }
});

},{"../../lib/GamepadButton":2,"../../lib/GamepadButtonEvent":3}],7:[function(require,module,exports){
'use strict';

require('./checkpoint-controls');
require('./gamepad-controls');
require('./keyboard-controls');
require('./touch-controls');
require('./movement-controls');
require('./trackpad-controls');

},{"./checkpoint-controls":5,"./gamepad-controls":6,"./keyboard-controls":8,"./movement-controls":9,"./touch-controls":10,"./trackpad-controls":11}],8:[function(require,module,exports){
'use strict';

require('../../lib/keyboard.polyfill');

var MAX_DELTA = 0.2,
    PROXY_FLAG = '__keyboard-controls-proxy';

var KeyboardEvent = window.KeyboardEvent;

/**
 * Keyboard Controls component.
 *
 * Stripped-down version of: https://github.com/donmccurdy/aframe-keyboard-controls
 *
 * Bind keyboard events to components, or control your entities with the WASD keys.
 *
 * Why use KeyboardEvent.code? "This is set to a string representing the key that was pressed to
 * generate the KeyboardEvent, without taking the current keyboard layout (e.g., QWERTY vs.
 * Dvorak), locale (e.g., English vs. French), or any modifier keys into account. This is useful
 * when you care about which physical key was pressed, rather thanwhich character it corresponds
 * to. For example, if you’re a writing a game, you might want a certain set of keys to move the
 * player in different directions, and that mapping should ideally be independent of keyboard
 * layout. See: https://developers.google.com/web/updates/2016/04/keyboardevent-keys-codes
 *
 * @namespace wasd-controls
 * keys the entity moves and if you release it will stop. Easing simulates friction.
 * to the entity when pressing the keys.
 * @param {bool} [enabled=true] - To completely enable or disable the controls
 */
module.exports = AFRAME.registerComponent('keyboard-controls', {
  schema: {
    enabled: { default: true },
    debug: { default: false }
  },

  init: function init() {
    this.dVelocity = new THREE.Vector3();
    this.localKeys = {};
    this.listeners = {
      keydown: this.onKeyDown.bind(this),
      keyup: this.onKeyUp.bind(this),
      blur: this.onBlur.bind(this),
      onContextMenu: this.onContextMenu.bind(this)
    };
    this.attachEventListeners();
  },

  /*******************************************************************
  * Movement
  */

  isVelocityActive: function isVelocityActive() {
    return this.data.enabled && !!Object.keys(this.getKeys()).length;
  },

  getVelocityDelta: function getVelocityDelta() {
    var data = this.data,
        keys = this.getKeys();

    this.dVelocity.set(0, 0, 0);
    if (data.enabled) {
      if (keys.KeyW || keys.ArrowUp) {
        this.dVelocity.z -= 1;
      }
      if (keys.KeyA || keys.ArrowLeft) {
        this.dVelocity.x -= 1;
      }
      if (keys.KeyS || keys.ArrowDown) {
        this.dVelocity.z += 1;
      }
      if (keys.KeyD || keys.ArrowRight) {
        this.dVelocity.x += 1;
      }
    }

    return this.dVelocity.clone();
  },

  /*******************************************************************
  * Events
  */

  play: function play() {
    this.attachEventListeners();
  },

  pause: function pause() {
    this.removeEventListeners();
  },

  remove: function remove() {
    this.pause();
  },

  attachEventListeners: function attachEventListeners() {
    window.oncontextmenu = this.listeners.onContextMenu;
    window.addEventListener("keydown", this.listeners.keydown, false);
    window.addEventListener("keyup", this.listeners.keyup, false);
    window.addEventListener("blur", this.listeners.blur, false);
  },

  onContextMenu: function onContextMenu() {
    for (var code in this.localKeys) {
      if (this.localKeys.hasOwnProperty(code)) {
        delete this.localKeys[code];
      }
    }
  },

  removeEventListeners: function removeEventListeners() {
    window.removeEventListener('keydown', this.listeners.keydown);
    window.removeEventListener('keyup', this.listeners.keyup);
    window.removeEventListener('blur', this.listeners.blur);
  },

  onKeyDown: function onKeyDown(event) {
    if (AFRAME.utils.shouldCaptureKeyEvent(event)) {
      this.localKeys[event.code] = true;
      this.emit(event);
    }
  },

  onKeyUp: function onKeyUp(event) {
    if (AFRAME.utils.shouldCaptureKeyEvent(event)) {
      delete this.localKeys[event.code];
      this.emit(event);
    }
  },

  onBlur: function onBlur() {
    for (var code in this.localKeys) {
      if (this.localKeys.hasOwnProperty(code)) {
        delete this.localKeys[code];
      }
    }
  },

  emit: function emit(event) {
    // TODO - keydown only initially?
    // TODO - where the f is the spacebar

    // Emit original event.
    if (PROXY_FLAG in event) {
      // TODO - Method never triggered.
      this.el.emit(event.type, event);
    }

    // Emit convenience event, identifying key.
    this.el.emit(event.type + ':' + event.code, new KeyboardEvent(event.type, event));
    if (this.data.debug) console.log(event.type + ':' + event.code);
  },

  /*******************************************************************
  * Accessors
  */

  isPressed: function isPressed(code) {
    return code in this.getKeys();
  },

  getKeys: function getKeys() {
    if (this.isProxied()) {
      return this.el.sceneEl.components['proxy-controls'].getKeyboard();
    }
    return this.localKeys;
  },

  isProxied: function isProxied() {
    var proxyControls = this.el.sceneEl.components['proxy-controls'];
    return proxyControls && proxyControls.isConnected();
  }

});

},{"../../lib/keyboard.polyfill":4}],9:[function(require,module,exports){
'use strict';

/**
 * Movement Controls
 *
 * @author Don McCurdy <dm@donmccurdy.com>
 */

var COMPONENT_SUFFIX = '-controls',
    MAX_DELTA = 0.2,

// ms
EPS = 10e-6;

module.exports = AFRAME.registerComponent('movement-controls', {

  /*******************************************************************
   * Schema
   */

  dependencies: ['rotation'],

  schema: {
    enabled: { default: true },
    controls: { default: ['gamepad', 'trackpad', 'keyboard', 'touch'] },
    speed: { default: 0.3, min: 0 },
    fly: { default: false },
    constrainToNavMesh: { default: false },
    camera: { default: '[movement-controls] [camera]', type: 'selector' }
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function init() {
    var el = this.el;

    this.velocityCtrl = null;

    this.velocity = new THREE.Vector3();
    this.heading = new THREE.Quaternion();

    // Navigation
    this.navGroup = null;
    this.navNode = null;

    if (el.sceneEl.hasLoaded) {
      this.injectControls();
    } else {
      el.sceneEl.addEventListener('loaded', this.injectControls.bind(this));
    }
  },

  update: function update(prevData) {
    var el = this.el;
    var data = this.data;
    var nav = el.sceneEl.systems.nav;
    if (el.sceneEl.hasLoaded) {
      this.injectControls();
    }
    if (nav && data.constrainToNavMesh !== prevData.constrainToNavMesh) {
      data.constrainToNavMesh ? nav.addAgent(this) : nav.removeAgent(this);
    }
  },

  injectControls: function injectControls() {
    var data = this.data;
    var name;

    for (var i = 0; i < data.controls.length; i++) {
      name = data.controls[i] + COMPONENT_SUFFIX;
      if (!this.el.components[name]) {
        this.el.setAttribute(name, '');
      }
    }
  },

  updateNavLocation: function updateNavLocation() {
    this.navGroup = null;
    this.navNode = null;
  },

  /*******************************************************************
   * Tick
   */

  tick: function () {
    var start = new THREE.Vector3();
    var end = new THREE.Vector3();
    var clampedEnd = new THREE.Vector3();

    return function (t, dt) {
      if (!dt) return;

      var el = this.el;
      var data = this.data;

      if (!data.enabled) return;

      this.updateVelocityCtrl();
      var velocityCtrl = this.velocityCtrl;
      var velocity = this.velocity;

      if (!velocityCtrl) return;

      // Update velocity. If FPS is too low, reset.
      if (dt / 1000 > MAX_DELTA) {
        velocity.set(0, 0, 0);
      } else {
        this.updateVelocity(dt);
      }

      if (data.constrainToNavMesh && velocityCtrl.isNavMeshConstrained !== false) {

        if (velocity.lengthSq() < EPS) return;

        start.copy(el.object3D.position);
        end.copy(velocity).multiplyScalar(dt / 1000).add(start);

        var nav = el.sceneEl.systems.nav;
        this.navGroup = this.navGroup === null ? nav.getGroup(start) : this.navGroup;
        this.navNode = this.navNode || nav.getNode(start, this.navGroup);
        this.navNode = nav.clampStep(start, end, this.navGroup, this.navNode, clampedEnd);
        el.object3D.position.copy(clampedEnd);
      } else if (el.hasAttribute('velocity')) {
        el.setAttribute('velocity', velocity);
      } else {
        el.object3D.position.x += velocity.x * dt / 1000;
        el.object3D.position.y += velocity.y * dt / 1000;
        el.object3D.position.z += velocity.z * dt / 1000;
      }
    };
  }(),

  /*******************************************************************
   * Movement
   */

  updateVelocityCtrl: function updateVelocityCtrl() {
    var data = this.data;
    if (data.enabled) {
      for (var i = 0, l = data.controls.length; i < l; i++) {
        var control = this.el.components[data.controls[i] + COMPONENT_SUFFIX];
        if (control && control.isVelocityActive()) {
          this.velocityCtrl = control;
          return;
        }
      }
      this.velocityCtrl = null;
    }
  },

  updateVelocity: function () {
    var vector2 = new THREE.Vector2();
    var quaternion = new THREE.Quaternion();

    return function (dt) {
      var dVelocity = void 0;
      var el = this.el;
      var control = this.velocityCtrl;
      var velocity = this.velocity;
      var data = this.data;

      if (control) {
        if (control.getVelocityDelta) {
          dVelocity = control.getVelocityDelta(dt);
        } else if (control.getVelocity) {
          velocity.copy(control.getVelocity());
          return;
        } else if (control.getPositionDelta) {
          velocity.copy(control.getPositionDelta(dt).multiplyScalar(1000 / dt));
          return;
        } else {
          throw new Error('Incompatible movement controls: ', control);
        }
      }

      if (el.hasAttribute('velocity') && !data.constrainToNavMesh) {
        velocity.copy(this.el.getAttribute('velocity'));
      }

      if (dVelocity && data.enabled) {
        var cameraEl = data.camera;

        // Rotate to heading
        quaternion.copy(cameraEl.object3D.quaternion);
        quaternion.premultiply(el.object3D.quaternion);
        dVelocity.applyQuaternion(quaternion);

        var factor = dVelocity.length();
        if (data.fly) {
          velocity.copy(dVelocity);
          velocity.multiplyScalar(this.data.speed * 16.66667);
        } else {
          vector2.set(dVelocity.x, dVelocity.z);
          vector2.setLength(factor * this.data.speed * 16.66667);
          velocity.x = vector2.x;
          velocity.z = vector2.y;
        }
      }
    };
  }()
});

},{}],10:[function(require,module,exports){
'use strict';

/**
 * Touch-to-move-forward controls for mobile.
 */

module.exports = AFRAME.registerComponent('touch-controls', {
  schema: {
    enabled: { default: true },
    reverseEnabled: { default: true }
  },

  init: function init() {
    this.dVelocity = new THREE.Vector3();
    this.bindMethods();
    this.direction = 0;
  },

  play: function play() {
    this.addEventListeners();
  },

  pause: function pause() {
    this.removeEventListeners();
    this.dVelocity.set(0, 0, 0);
  },

  remove: function remove() {
    this.pause();
  },

  addEventListeners: function addEventListeners() {
    var sceneEl = this.el.sceneEl;
    var canvasEl = sceneEl.canvas;

    if (!canvasEl) {
      sceneEl.addEventListener('render-target-loaded', this.addEventListeners.bind(this));
      return;
    }

    canvasEl.addEventListener('touchstart', this.onTouchStart);
    canvasEl.addEventListener('touchend', this.onTouchEnd);
  },

  removeEventListeners: function removeEventListeners() {
    var canvasEl = this.el.sceneEl && this.el.sceneEl.canvas;
    if (!canvasEl) {
      return;
    }

    canvasEl.removeEventListener('touchstart', this.onTouchStart);
    canvasEl.removeEventListener('touchend', this.onTouchEnd);
  },

  isVelocityActive: function isVelocityActive() {
    return this.data.enabled && !!this.direction;
  },

  getVelocityDelta: function getVelocityDelta() {
    this.dVelocity.z = this.direction;
    return this.dVelocity.clone();
  },

  bindMethods: function bindMethods() {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  },

  onTouchStart: function onTouchStart(e) {
    this.direction = -1;
    if (this.data.reverseEnabled && e.touches.length === 2) {
      this.direction = 1;
    }
    e.preventDefault();
  },

  onTouchEnd: function onTouchEnd(e) {
    this.direction = 0;
    e.preventDefault();
  }
});

},{}],11:[function(require,module,exports){
'use strict';

/**
 * 3dof (Gear VR, Daydream) controls for mobile.
 */

module.exports = AFRAME.registerComponent('trackpad-controls', {
  schema: {
    enabled: { default: true },
    enableNegX: { default: true },
    enablePosX: { default: true },
    enableNegZ: { default: true },
    enablePosZ: { default: true },
    mode: { default: 'touch', oneOf: ['swipe', 'touch', 'press'] }

  },

  init: function init() {
    this.dVelocity = new THREE.Vector3();
    this.zVel = 0;
    this.xVel = 0;
    this.bindMethods();
  },

  play: function play() {
    this.addEventListeners();
  },

  pause: function pause() {
    this.removeEventListeners();
    this.dVelocity.set(0, 0, 0);
  },

  remove: function remove() {
    this.pause();
  },

  addEventListeners: function addEventListeners() {
    var data = this.data;
    var sceneEl = this.el.sceneEl;

    sceneEl.addEventListener('axismove', this.onAxisMove);

    switch (data.mode) {
      case 'swipe':
      case 'touch':
        sceneEl.addEventListener('trackpadtouchstart', this.onTouchStart);
        sceneEl.addEventListener('trackpadtouchend', this.onTouchEnd);
        break;

      case 'press':
        sceneEl.addEventListener('trackpaddown', this.onTouchStart);
        sceneEl.addEventListener('trackpadup', this.onTouchEnd);
        break;
    }
  },

  removeEventListeners: function removeEventListeners() {
    var sceneEl = this.el.sceneEl;

    sceneEl.removeEventListener('axismove', this.onAxisMove);
    sceneEl.removeEventListener('trackpadtouchstart', this.onTouchStart);
    sceneEl.removeEventListener('trackpadtouchend', this.onTouchEnd);
    sceneEl.removeEventListener('trackpaddown', this.onTouchStart);
    sceneEl.removeEventListener('trackpadup', this.onTouchEnd);
  },

  isVelocityActive: function isVelocityActive() {
    return this.data.enabled && this.isMoving;
  },

  getVelocityDelta: function getVelocityDelta() {
    this.dVelocity.z = this.isMoving ? -this.zVel : 1;
    this.dVelocity.x = this.isMoving ? this.xVel : 1;
    return this.dVelocity.clone();
  },

  bindMethods: function bindMethods() {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onAxisMove = this.onAxisMove.bind(this);
  },

  onTouchStart: function onTouchStart(e) {
    switch (this.data.mode) {
      case 'swipe':
        this.canRecordAxis = true;
        this.startingAxisData = [];
        break;
      case 'touch':
        this.isMoving = true;
        break;
      case 'press':
        this.isMoving = true;
        break;
    }

    e.preventDefault();
  },

  onTouchEnd: function onTouchEnd(e) {
    if (this.data.mode == 'swipe') {
      this.startingAxisData = [];
    }

    this.isMoving = false;
    e.preventDefault();
  },

  onAxisMove: function onAxisMove(e) {
    switch (this.data.mode) {
      case 'swipe':
        return this.handleSwipeAxis(e);
      case 'touch':
      case 'press':
        return this.handleTouchAxis(e);
    }
  },

  handleSwipeAxis: function handleSwipeAxis(e) {
    var data = this.data;
    var axisData = e.detail.axis;

    if (this.startingAxisData.length === 0 && this.canRecordAxis) {
      this.canRecordAxis = false;
      this.startingAxisData[0] = axisData[0];
      this.startingAxisData[1] = axisData[1];
    }

    if (this.startingAxisData.length > 0) {
      var velX = 0;
      var velZ = 0;

      if (data.enableNegX && axisData[0] < this.startingAxisData[0]) {
        velX = -1;
      }

      if (data.enablePosX && axisData[0] > this.startingAxisData[0]) {
        velX = 1;
      }

      if (data.enablePosZ && axisData[1] > this.startingAxisData[1]) {
        velZ = -1;
      }

      if (data.enableNegZ && axisData[1] < this.startingAxisData[1]) {
        velZ = 1;
      }

      var absChangeZ = Math.abs(this.startingAxisData[1] - axisData[1]);
      var absChangeX = Math.abs(this.startingAxisData[0] - axisData[0]);

      if (absChangeX > absChangeZ) {
        this.zVel = 0;
        this.xVel = velX;
        this.isMoving = true;
      } else {
        this.xVel = 0;
        this.zVel = velZ;
        this.isMoving = true;
      }
    }
  },

  handleTouchAxis: function handleTouchAxis(e) {
    var data = this.data;
    var axisData = e.detail.axis;

    var velX = 0;
    var velZ = 0;

    if (data.enableNegX && axisData[0] < 0) {
      velX = -1;
    }

    if (data.enablePosX && axisData[0] > 0) {
      velX = 1;
    }

    if (data.enablePosZ && axisData[1] > 0) {
      velZ = -1;
    }

    if (data.enableNegZ && axisData[1] < 0) {
      velZ = 1;
    }

    if (Math.abs(axisData[0]) > Math.abs(axisData[1])) {
      this.zVel = 0;
      this.xVel = velX;
    } else {
      this.xVel = 0;
      this.zVel = velZ;
    }
  }

});

},{}]},{},[1]);
