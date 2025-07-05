(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("THREE"));
	else if(typeof define === 'function' && define.amd)
		define(["THREE"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("THREE")) : factory(root["THREE"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, (__WEBPACK_EXTERNAL_MODULE_three__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/GamepadButton.js":
/*!******************************!*\
  !*** ./lib/GamepadButton.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Object.assign(function GamepadButton () {}, {
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

	VENDOR: 16,
}));


/***/ }),

/***/ "./lib/GamepadButtonEvent.js":
/*!***********************************!*\
  !*** ./lib/GamepadButtonEvent.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function GamepadButtonEvent (type, index, details) {
  this.type = type;
  this.index = index;
  this.pressed = details.pressed;
  this.value = details.value;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GamepadButtonEvent);


/***/ }),

/***/ "./lib/keyboard.polyfill.js":
/*!**********************************!*\
  !*** ./lib/keyboard.polyfill.js ***!
  \**********************************/
/***/ (() => {

/**
 * Polyfill for the additional KeyboardEvent properties defined in the D3E and
 * D4E draft specifications, by @inexorabletash.
 *
 * See: https://github.com/inexorabletash/polyfill
 */
(function(global) {
  var nativeKeyboardEvent = ('KeyboardEvent' in global);
  if (!nativeKeyboardEvent)
    global.KeyboardEvent = function KeyboardEvent() { throw TypeError('Illegal constructor'); };

  if (!('DOM_KEY_LOCATION_STANDARD' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_STANDARD = 0x00; // Default or unknown location
  if (!('DOM_KEY_LOCATION_LEFT' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_LEFT          = 0x01; // e.g. Left Alt key
  if (!('DOM_KEY_LOCATION_RIGHT' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_RIGHT         = 0x02; // e.g. Right Alt key
  if (!('DOM_KEY_LOCATION_NUMPAD' in global.KeyboardEvent)) global.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD        = 0x03; // e.g. Numpad 0 or +

  var STANDARD = window.KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
      LEFT = window.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
      RIGHT = window.KeyboardEvent.DOM_KEY_LOCATION_RIGHT,
      NUMPAD = window.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD;

  //--------------------------------------------------------------------
  //
  // Utilities
  //
  //--------------------------------------------------------------------

  function contains(s, ss) { return String(s).indexOf(ss) !== -1; }

  var os = (function() {
    if (contains(navigator.platform, 'Win')) { return 'win'; }
    if (contains(navigator.platform, 'Mac')) { return 'mac'; }
    if (contains(navigator.platform, 'CrOS')) { return 'cros'; }
    if (contains(navigator.platform, 'Linux')) { return 'linux'; }
    if (contains(navigator.userAgent, 'iPad') || contains(navigator.platform, 'iPod') || contains(navigator.platform, 'iPhone')) { return 'ios'; }
    return '';
  } ());

  var browser = (function() {
    if (contains(navigator.userAgent, 'Chrome/')) { return 'chrome'; }
    if (contains(navigator.vendor, 'Apple')) { return 'safari'; }
    if (contains(navigator.userAgent, 'MSIE')) { return 'ie'; }
    if (contains(navigator.userAgent, 'Gecko/')) { return 'moz'; }
    if (contains(navigator.userAgent, 'Opera/')) { return 'opera'; }
    return '';
  } ());

  var browser_os = browser + '-' + os;

  function mergeIf(baseTable, select, table) {
    if (browser_os === select || browser === select || os === select) {
      Object.keys(table).forEach(function(keyCode) {
        baseTable[keyCode] = table[keyCode];
      });
    }
  }

  function remap(o, key) {
    var r = {};
    Object.keys(o).forEach(function(k) {
      var item = o[k];
      if (key in item) {
        r[item[key]] = item;
      }
    });
    return r;
  }

  function invert(o) {
    var r = {};
    Object.keys(o).forEach(function(k) {
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
    0xBA: { code: 'Semicolon',  keyCap: ';' }, // [USB: 0x33] ;: (US Standard 101)
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
    0xDC: { code: 'Backslash',  keyCap: '\\' }, // [USB: 0x31] \| (US Standard 101)
    0xDD: { code: 'BracketRight', keyCap: ']' }, // [USB: 0x30] ]} (US Standard 101)
    0xDE: { code: 'Quote', keyCap: '\'' }, // [USB: 0x34] '" (US Standard 101)
    // 0xDF - miscellaneous/varies

    // 0xE0 - reserved
    // 0xE1 - OEM specific
    0xE2: { code: 'IntlBackslash',  keyCap: '\\' }, // [USB: 0x64] \| (UK Standard 102)
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
    0xFE: { code: 'Clear' } // [USB: 0x9c] (Not in D3E)
  };

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

  mergeIf(keyCodeToInfoTable,
          'moz', {
            0x3B: { code: 'Semicolon', keyCap: ';' }, // [USB: 0x33] ;: (US Standard 101)
            0x3D: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
            0x6B: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
            0x6D: { code: 'Minus', keyCap: '-' }, // [USB: 0x2d] -_
            0xBB: { code: 'NumpadAdd', keyCap: '+', location: NUMPAD }, // [USB: 0x57]
            0xBD: { code: 'NumpadSubtract', keyCap: '-', location: NUMPAD } // [USB: 0x56]
          });

  mergeIf(keyCodeToInfoTable,
          'moz-mac', {
            0x0C: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
            0xAD: { code: 'Minus', keyCap: '-' } // [USB: 0x2d] -_
          });

  mergeIf(keyCodeToInfoTable,
          'moz-win', {
            0xAD: { code: 'Minus', keyCap: '-' } // [USB: 0x2d] -_
          });

  mergeIf(keyCodeToInfoTable,
          'chrome-mac', {
            0x5D: { code: 'OSRight', location: RIGHT } // [USB: 0xe7]
          });

  // Windows via Bootcamp (!)
  if (false) // removed by dead control flow
{}

  mergeIf(keyCodeToInfoTable,
          'safari', {
            0x03: { code: 'Enter' }, // [USB: 0x28] old Safari
            0x19: { code: 'Tab' } // [USB: 0x2b] old Safari for Shift+Tab
          });

  mergeIf(keyCodeToInfoTable,
          'ios', {
            0x0A: { code: 'Enter', location: STANDARD } // [USB: 0x28]
          });

  mergeIf(keyCodeToInfoTable,
          'safari-mac', {
            0x5B: { code: 'OSLeft', location: LEFT }, // [USB: 0xe3]
            0x5D: { code: 'OSRight', location: RIGHT }, // [USB: 0xe7]
            0xE5: { code: 'KeyQ', keyCap: 'Q' } // [USB: 0x14] On alternate presses, Ctrl+Q sends this
          });

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
    0x12: { code: 'AltLeft', location: LEFT } // [USB: 0xe2]
  };
  locationTable[RIGHT] = {
    0x10: { code: 'ShiftRight', location: RIGHT }, // [USB: 0xe5]
    0x11: { code: 'ControlRight', location: RIGHT }, // [USB: 0xe4]
    0x12: { code: 'AltRight', location: RIGHT } // [USB: 0xe6]
  };
  locationTable[NUMPAD] = {
    0x0D: { code: 'NumpadEnter', location: NUMPAD } // [USB: 0x58]
  };

  mergeIf(locationTable[NUMPAD], 'moz', {
    0x6D: { code: 'NumpadSubtract', location: NUMPAD }, // [USB: 0x56]
    0x6B: { code: 'NumpadAdd', location: NUMPAD } // [USB: 0x57]
  });
  mergeIf(locationTable[LEFT], 'moz-mac', {
    0xE0: { code: 'OSLeft', location: LEFT } // [USB: 0xe3]
  });
  mergeIf(locationTable[RIGHT], 'moz-mac', {
    0xE0: { code: 'OSRight', location: RIGHT } // [USB: 0xe7]
  });
  mergeIf(locationTable[RIGHT], 'moz-win', {
    0x5B: { code: 'OSRight', location: RIGHT } // [USB: 0xe7]
  });


  mergeIf(locationTable[RIGHT], 'mac', {
    0x5D: { code: 'OSRight', location: RIGHT } // [USB: 0xe7]
  });

  mergeIf(locationTable[NUMPAD], 'chrome-mac', {
    0x0C: { code: 'NumLock', location: NUMPAD } // [USB: 0x53]
  });

  mergeIf(locationTable[NUMPAD], 'safari-mac', {
    0x0C: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
    0xBB: { code: 'NumpadAdd', location: NUMPAD }, // [USB: 0x57]
    0xBD: { code: 'NumpadSubtract', location: NUMPAD }, // [USB: 0x56]
    0xBE: { code: 'NumpadDecimal', location: NUMPAD }, // [USB: 0x63]
    0xBF: { code: 'NumpadDivide', location: NUMPAD } // [USB: 0x54]
  });


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
    var nativeLocation = nativeKeyboardEvent && ('location' in new KeyboardEvent(''));
  } catch (_) {}

  function keyInfoForEvent(event) {
    var keyCode = 'keyCode' in event ? event.keyCode : 'which' in event ? event.which : 0;

    var keyInfo = (function(){
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
    }());

    // TODO: Track these down and move to general tables
    if (false) // removed by dead control flow
{}

    if (!keyInfo)
      return null;

    var key = (function() {
      var entry = codeToKeyTable[keyInfo.code];
      if (!entry) return keyInfo.code;
      return (event.shiftKey && 'shiftKey' in entry) ? entry.shiftKey : entry.key;
    }());

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
    (function() {
      function define(o, p, v) {
        if (p in o) return;
        Object.defineProperty(o, p, v);
      }

      define(KeyboardEvent.prototype, 'code', { get: function() {
        var keyInfo = keyInfoForEvent(this);
        return keyInfo ? keyInfo.code : '';
      }});

      // Fix for nonstandard `key` values (FF36-)
      if ('key' in KeyboardEvent.prototype) {
        var desc = Object.getOwnPropertyDescriptor(KeyboardEvent.prototype, 'key');
        Object.defineProperty(KeyboardEvent.prototype, 'key', { get: function() {
          var key = desc.get.call(this);
          return keyFixTable.hasOwnProperty(key) ? keyFixTable[key] : key;
        }});
      }

      define(KeyboardEvent.prototype, 'key', { get: function() {
        var keyInfo = keyInfoForEvent(this);
        return (keyInfo && 'key' in keyInfo) ? keyInfo.key : 'Unidentified';
      }});

      define(KeyboardEvent.prototype, 'location', { get: function() {
        var keyInfo = keyInfoForEvent(this);
        return (keyInfo && 'location' in keyInfo) ? keyInfo.location : STANDARD;
      }});

      define(KeyboardEvent.prototype, 'locale', { get: function() {
        return '';
      }});
    }());
  }

  if (!('queryKeyCap' in global.KeyboardEvent))
    global.KeyboardEvent.queryKeyCap = queryKeyCap;

  // Helper for IE8-
  global.identifyKey = function(event) {
    if ('code' in event)
      return;

    var keyInfo = keyInfoForEvent(event);
    event.code = keyInfo ? keyInfo.code : '';
    event.key = (keyInfo && 'key' in keyInfo) ? keyInfo.key : 'Unidentified';
    event.location = ('location' in event) ? event.location :
      ('keyLocation' in event) ? event.keyLocation :
      (keyInfo && 'location' in keyInfo) ? keyInfo.location : STANDARD;
    event.locale = '';
  };

} (window));


/***/ }),

/***/ "./node_modules/nipplejs/dist/nipplejs.js":
/*!************************************************!*\
  !*** ./node_modules/nipplejs/dist/nipplejs.js ***!
  \************************************************/
/***/ ((module) => {

!function(t,i){ true?module.exports=i():0}(window,function(){return function(t){var i={};function e(o){if(i[o])return i[o].exports;var n=i[o]={i:o,l:!1,exports:{}};return t[o].call(n.exports,n,n.exports,e),n.l=!0,n.exports}return e.m=t,e.c=i,e.d=function(t,i,o){e.o(t,i)||Object.defineProperty(t,i,{enumerable:!0,get:o})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,i){if(1&i&&(t=e(t)),8&i)return t;if(4&i&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(e.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&i&&"string"!=typeof t)for(var n in t)e.d(o,n,function(i){return t[i]}.bind(null,n));return o},e.n=function(t){var i=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(i,"a",i),i},e.o=function(t,i){return Object.prototype.hasOwnProperty.call(t,i)},e.p="",e(e.s=0)}([function(t,i,e){"use strict";e.r(i);var o,n=function(t,i){var e=i.x-t.x,o=i.y-t.y;return Math.sqrt(e*e+o*o)},s=function(t){return t*(Math.PI/180)},r=function(t){return t*(180/Math.PI)},d=new Map,a=function(t){d.has(t)&&clearTimeout(d.get(t)),d.set(t,setTimeout(t,100))},p=function(t,i,e){for(var o,n=i.split(/[ ,]+/g),s=0;s<n.length;s+=1)o=n[s],t.addEventListener?t.addEventListener(o,e,!1):t.attachEvent&&t.attachEvent(o,e)},c=function(t,i,e){for(var o,n=i.split(/[ ,]+/g),s=0;s<n.length;s+=1)o=n[s],t.removeEventListener?t.removeEventListener(o,e):t.detachEvent&&t.detachEvent(o,e)},l=function(t){return t.preventDefault(),t.type.match(/^touch/)?t.changedTouches:t},h=function(){return{x:void 0!==window.pageXOffset?window.pageXOffset:(document.documentElement||document.body.parentNode||document.body).scrollLeft,y:void 0!==window.pageYOffset?window.pageYOffset:(document.documentElement||document.body.parentNode||document.body).scrollTop}},u=function(t,i){i.top||i.right||i.bottom||i.left?(t.style.top=i.top,t.style.right=i.right,t.style.bottom=i.bottom,t.style.left=i.left):(t.style.left=i.x+"px",t.style.top=i.y+"px")},f=function(t,i,e){var o=y(t);for(var n in o)if(o.hasOwnProperty(n))if("string"==typeof i)o[n]=i+" "+e;else{for(var s="",r=0,d=i.length;r<d;r+=1)s+=i[r]+" "+e+", ";o[n]=s.slice(0,-2)}return o},y=function(t){var i={};i[t]="";return["webkit","Moz","o"].forEach(function(e){i[e+t.charAt(0).toUpperCase()+t.slice(1)]=""}),i},m=function(t,i){for(var e in i)i.hasOwnProperty(e)&&(t[e]=i[e]);return t},v=function(t,i){if(t.length)for(var e=0,o=t.length;e<o;e+=1)i(t[e]);else i(t)},g=!!("ontouchstart"in window),b=!!window.PointerEvent,x=!!window.MSPointerEvent,O={start:"mousedown",move:"mousemove",end:"mouseup"},w={};function _(){}b?o={start:"pointerdown",move:"pointermove",end:"pointerup, pointercancel"}:x?o={start:"MSPointerDown",move:"MSPointerMove",end:"MSPointerUp"}:g?(o={start:"touchstart",move:"touchmove",end:"touchend, touchcancel"},w=O):o=O,_.prototype.on=function(t,i){var e,o=t.split(/[ ,]+/g);this._handlers_=this._handlers_||{};for(var n=0;n<o.length;n+=1)e=o[n],this._handlers_[e]=this._handlers_[e]||[],this._handlers_[e].push(i);return this},_.prototype.off=function(t,i){return this._handlers_=this._handlers_||{},void 0===t?this._handlers_={}:void 0===i?this._handlers_[t]=null:this._handlers_[t]&&this._handlers_[t].indexOf(i)>=0&&this._handlers_[t].splice(this._handlers_[t].indexOf(i),1),this},_.prototype.trigger=function(t,i){var e,o=this,n=t.split(/[ ,]+/g);o._handlers_=o._handlers_||{};for(var s=0;s<n.length;s+=1)e=n[s],o._handlers_[e]&&o._handlers_[e].length&&o._handlers_[e].forEach(function(t){t.call(o,{type:e,target:o},i)})},_.prototype.config=function(t){this.options=this.defaults||{},t&&(this.options=function(t,i){var e={};for(var o in t)t.hasOwnProperty(o)&&i.hasOwnProperty(o)?e[o]=i[o]:t.hasOwnProperty(o)&&(e[o]=t[o]);return e}(this.options,t))},_.prototype.bindEvt=function(t,i){var e=this;return e._domHandlers_=e._domHandlers_||{},e._domHandlers_[i]=function(){"function"==typeof e["on"+i]?e["on"+i].apply(e,arguments):console.warn('[WARNING] : Missing "on'+i+'" handler.')},p(t,o[i],e._domHandlers_[i]),w[i]&&p(t,w[i],e._domHandlers_[i]),e},_.prototype.unbindEvt=function(t,i){return this._domHandlers_=this._domHandlers_||{},c(t,o[i],this._domHandlers_[i]),w[i]&&c(t,w[i],this._domHandlers_[i]),delete this._domHandlers_[i],this};var T=_;function k(t,i){return this.identifier=i.identifier,this.position=i.position,this.frontPosition=i.frontPosition,this.collection=t,this.defaults={size:100,threshold:.1,color:"white",fadeTime:250,dataOnly:!1,restJoystick:!0,restOpacity:.5,mode:"dynamic",zone:document.body,lockX:!1,lockY:!1,shape:"circle"},this.config(i),"dynamic"===this.options.mode&&(this.options.restOpacity=0),this.id=k.id,k.id+=1,this.buildEl().stylize(),this.instance={el:this.ui.el,on:this.on.bind(this),off:this.off.bind(this),show:this.show.bind(this),hide:this.hide.bind(this),add:this.addToDom.bind(this),remove:this.removeFromDom.bind(this),destroy:this.destroy.bind(this),setPosition:this.setPosition.bind(this),resetDirection:this.resetDirection.bind(this),computeDirection:this.computeDirection.bind(this),trigger:this.trigger.bind(this),position:this.position,frontPosition:this.frontPosition,ui:this.ui,identifier:this.identifier,id:this.id,options:this.options},this.instance}k.prototype=new T,k.constructor=k,k.id=0,k.prototype.buildEl=function(t){return this.ui={},this.options.dataOnly?this:(this.ui.el=document.createElement("div"),this.ui.back=document.createElement("div"),this.ui.front=document.createElement("div"),this.ui.el.className="nipple collection_"+this.collection.id,this.ui.back.className="back",this.ui.front.className="front",this.ui.el.setAttribute("id","nipple_"+this.collection.id+"_"+this.id),this.ui.el.appendChild(this.ui.back),this.ui.el.appendChild(this.ui.front),this)},k.prototype.stylize=function(){if(this.options.dataOnly)return this;var t=this.options.fadeTime+"ms",i=function(t,i){var e=y(t);for(var o in e)e.hasOwnProperty(o)&&(e[o]=i);return e}("borderRadius","50%"),e=f("transition","opacity",t),o={};return o.el={position:"absolute",opacity:this.options.restOpacity,display:"block",zIndex:999},o.back={position:"absolute",display:"block",width:this.options.size+"px",height:this.options.size+"px",left:0,marginLeft:-this.options.size/2+"px",marginTop:-this.options.size/2+"px",background:this.options.color,opacity:".5"},o.front={width:this.options.size/2+"px",height:this.options.size/2+"px",position:"absolute",display:"block",left:0,marginLeft:-this.options.size/4+"px",marginTop:-this.options.size/4+"px",background:this.options.color,opacity:".5",transform:"translate(0px, 0px)"},m(o.el,e),"circle"===this.options.shape&&m(o.back,i),m(o.front,i),this.applyStyles(o),this},k.prototype.applyStyles=function(t){for(var i in this.ui)if(this.ui.hasOwnProperty(i))for(var e in t[i])this.ui[i].style[e]=t[i][e];return this},k.prototype.addToDom=function(){return this.options.dataOnly||document.body.contains(this.ui.el)?this:(this.options.zone.appendChild(this.ui.el),this)},k.prototype.removeFromDom=function(){return this.options.dataOnly||!document.body.contains(this.ui.el)?this:(this.options.zone.removeChild(this.ui.el),this)},k.prototype.destroy=function(){clearTimeout(this.removeTimeout),clearTimeout(this.showTimeout),clearTimeout(this.restTimeout),this.trigger("destroyed",this.instance),this.removeFromDom(),this.off()},k.prototype.show=function(t){var i=this;return i.options.dataOnly?i:(clearTimeout(i.removeTimeout),clearTimeout(i.showTimeout),clearTimeout(i.restTimeout),i.addToDom(),i.restCallback(),setTimeout(function(){i.ui.el.style.opacity=1},0),i.showTimeout=setTimeout(function(){i.trigger("shown",i.instance),"function"==typeof t&&t.call(this)},i.options.fadeTime),i)},k.prototype.hide=function(t){var i=this;if(i.options.dataOnly)return i;if(i.ui.el.style.opacity=i.options.restOpacity,clearTimeout(i.removeTimeout),clearTimeout(i.showTimeout),clearTimeout(i.restTimeout),i.removeTimeout=setTimeout(function(){var e="dynamic"===i.options.mode?"none":"block";i.ui.el.style.display=e,"function"==typeof t&&t.call(i),i.trigger("hidden",i.instance)},i.options.fadeTime),i.options.restJoystick){var e=i.options.restJoystick,o={};o.x=!0===e||!1!==e.x?0:i.instance.frontPosition.x,o.y=!0===e||!1!==e.y?0:i.instance.frontPosition.y,i.setPosition(t,o)}return i},k.prototype.setPosition=function(t,i){var e=this;e.frontPosition={x:i.x,y:i.y};var o=e.options.fadeTime+"ms",n={};n.front=f("transition",["transform"],o);var s={front:{}};s.front={transform:"translate("+e.frontPosition.x+"px,"+e.frontPosition.y+"px)"},e.applyStyles(n),e.applyStyles(s),e.restTimeout=setTimeout(function(){"function"==typeof t&&t.call(e),e.restCallback()},e.options.fadeTime)},k.prototype.restCallback=function(){var t={};t.front=f("transition","none",""),this.applyStyles(t),this.trigger("rested",this.instance)},k.prototype.resetDirection=function(){this.direction={x:!1,y:!1,angle:!1}},k.prototype.computeDirection=function(t){var i,e,o,n=t.angle.radian,s=Math.PI/4,r=Math.PI/2;if(n>s&&n<3*s&&!t.lockX?i="up":n>-s&&n<=s&&!t.lockY?i="left":n>3*-s&&n<=-s&&!t.lockX?i="down":t.lockY||(i="right"),t.lockY||(e=n>-r&&n<r?"left":"right"),t.lockX||(o=n>0?"up":"down"),t.force>this.options.threshold){var d,a={};for(d in this.direction)this.direction.hasOwnProperty(d)&&(a[d]=this.direction[d]);var p={};for(d in this.direction={x:e,y:o,angle:i},t.direction=this.direction,a)a[d]===this.direction[d]&&(p[d]=!0);if(p.x&&p.y&&p.angle)return t;p.x&&p.y||this.trigger("plain",t),p.x||this.trigger("plain:"+e,t),p.y||this.trigger("plain:"+o,t),p.angle||this.trigger("dir dir:"+i,t)}else this.resetDirection();return t};var P=k;function E(t,i){this.nipples=[],this.idles=[],this.actives=[],this.ids=[],this.pressureIntervals={},this.manager=t,this.id=E.id,E.id+=1,this.defaults={zone:document.body,multitouch:!1,maxNumberOfNipples:10,mode:"dynamic",position:{top:0,left:0},catchDistance:200,size:100,threshold:.1,color:"white",fadeTime:250,dataOnly:!1,restJoystick:!0,restOpacity:.5,lockX:!1,lockY:!1,shape:"circle",dynamicPage:!1,follow:!1},this.config(i),"static"!==this.options.mode&&"semi"!==this.options.mode||(this.options.multitouch=!1),this.options.multitouch||(this.options.maxNumberOfNipples=1);var e=getComputedStyle(this.options.zone.parentElement);return e&&"flex"===e.display&&(this.parentIsFlex=!0),this.updateBox(),this.prepareNipples(),this.bindings(),this.begin(),this.nipples}E.prototype=new T,E.constructor=E,E.id=0,E.prototype.prepareNipples=function(){var t=this.nipples;t.on=this.on.bind(this),t.off=this.off.bind(this),t.options=this.options,t.destroy=this.destroy.bind(this),t.ids=this.ids,t.id=this.id,t.processOnMove=this.processOnMove.bind(this),t.processOnEnd=this.processOnEnd.bind(this),t.get=function(i){if(void 0===i)return t[0];for(var e=0,o=t.length;e<o;e+=1)if(t[e].identifier===i)return t[e];return!1}},E.prototype.bindings=function(){this.bindEvt(this.options.zone,"start"),this.options.zone.style.touchAction="none",this.options.zone.style.msTouchAction="none"},E.prototype.begin=function(){var t=this.options;if("static"===t.mode){var i=this.createNipple(t.position,this.manager.getIdentifier());i.add(),this.idles.push(i)}},E.prototype.createNipple=function(t,i){var e=this.manager.scroll,o={},n=this.options,s=this.parentIsFlex?e.x:e.x+this.box.left,r=this.parentIsFlex?e.y:e.y+this.box.top;if(t.x&&t.y)o={x:t.x-s,y:t.y-r};else if(t.top||t.right||t.bottom||t.left){var d=document.createElement("DIV");d.style.display="hidden",d.style.top=t.top,d.style.right=t.right,d.style.bottom=t.bottom,d.style.left=t.left,d.style.position="absolute",n.zone.appendChild(d);var a=d.getBoundingClientRect();n.zone.removeChild(d),o=t,t={x:a.left+e.x,y:a.top+e.y}}var p=new P(this,{color:n.color,size:n.size,threshold:n.threshold,fadeTime:n.fadeTime,dataOnly:n.dataOnly,restJoystick:n.restJoystick,restOpacity:n.restOpacity,mode:n.mode,identifier:i,position:t,zone:n.zone,frontPosition:{x:0,y:0},shape:n.shape});return n.dataOnly||(u(p.ui.el,o),u(p.ui.front,p.frontPosition)),this.nipples.push(p),this.trigger("added "+p.identifier+":added",p),this.manager.trigger("added "+p.identifier+":added",p),this.bindNipple(p),p},E.prototype.updateBox=function(){this.box=this.options.zone.getBoundingClientRect()},E.prototype.bindNipple=function(t){var i,e=this,o=function(t,o){i=t.type+" "+o.id+":"+t.type,e.trigger(i,o)};t.on("destroyed",e.onDestroyed.bind(e)),t.on("shown hidden rested dir plain",o),t.on("dir:up dir:right dir:down dir:left",o),t.on("plain:up plain:right plain:down plain:left",o)},E.prototype.pressureFn=function(t,i,e){var o=this,n=0;clearInterval(o.pressureIntervals[e]),o.pressureIntervals[e]=setInterval(function(){var e=t.force||t.pressure||t.webkitForce||0;e!==n&&(i.trigger("pressure",e),o.trigger("pressure "+i.identifier+":pressure",e),n=e)}.bind(o),100)},E.prototype.onstart=function(t){var i=this,e=i.options,o=t;t=l(t),i.updateBox();return v(t,function(n){i.actives.length<e.maxNumberOfNipples?i.processOnStart(n):o.type.match(/^touch/)&&(Object.keys(i.manager.ids).forEach(function(e){if(Object.values(o.touches).findIndex(function(t){return t.identifier===e})<0){var n=[t[0]];n.identifier=e,i.processOnEnd(n)}}),i.actives.length<e.maxNumberOfNipples&&i.processOnStart(n))}),i.manager.bindDocument(),!1},E.prototype.processOnStart=function(t){var i,e=this,o=e.options,s=e.manager.getIdentifier(t),r=t.force||t.pressure||t.webkitForce||0,d={x:t.pageX,y:t.pageY},a=e.getOrCreate(s,d);a.identifier!==s&&e.manager.removeIdentifier(a.identifier),a.identifier=s;var p=function(i){i.trigger("start",i),e.trigger("start "+i.id+":start",i),i.show(),r>0&&e.pressureFn(t,i,i.identifier),e.processOnMove(t)};if((i=e.idles.indexOf(a))>=0&&e.idles.splice(i,1),e.actives.push(a),e.ids.push(a.identifier),"semi"!==o.mode)p(a);else{if(!(n(d,a.position)<=o.catchDistance))return a.destroy(),void e.processOnStart(t);p(a)}return a},E.prototype.getOrCreate=function(t,i){var e,o=this.options;return/(semi|static)/.test(o.mode)?(e=this.idles[0])?(this.idles.splice(0,1),e):"semi"===o.mode?this.createNipple(i,t):(console.warn("Coudln't find the needed nipple."),!1):e=this.createNipple(i,t)},E.prototype.processOnMove=function(t){var i=this.options,e=this.manager.getIdentifier(t),o=this.nipples.get(e),d=this.manager.scroll;if(function(t){return isNaN(t.buttons)?0!==t.pressure:0!==t.buttons}(t)){if(!o)return console.error("Found zombie joystick with ID "+e),void this.manager.removeIdentifier(e);if(i.dynamicPage){var a=o.el.getBoundingClientRect();o.position={x:d.x+a.left,y:d.y+a.top}}o.identifier=e;var p=o.options.size/2,c={x:t.pageX,y:t.pageY};i.lockX&&(c.y=o.position.y),i.lockY&&(c.x=o.position.x);var l,h,u,f,y,m,v,g,b,x,O=n(c,o.position),w=(l=c,h=o.position,u=h.x-l.x,f=h.y-l.y,r(Math.atan2(f,u))),_=s(w),T=O/p,k={distance:O,position:c};if("circle"===o.options.shape?(y=Math.min(O,p),v=o.position,g=y,x={x:0,y:0},b=s(b=w),x.x=v.x-g*Math.cos(b),x.y=v.y-g*Math.sin(b),m=x):(m=function(t,i,e){return{x:Math.min(Math.max(t.x,i.x-e),i.x+e),y:Math.min(Math.max(t.y,i.y-e),i.y+e)}}(c,o.position,p),y=n(m,o.position)),i.follow){if(O>p){var P=c.x-m.x,E=c.y-m.y;o.position.x+=P,o.position.y+=E,o.el.style.top=o.position.y-(this.box.top+d.y)+"px",o.el.style.left=o.position.x-(this.box.left+d.x)+"px",O=n(c,o.position)}}else c=m,O=y;var I=c.x-o.position.x,z=c.y-o.position.y;o.frontPosition={x:I,y:z},i.dataOnly||(o.ui.front.style.transform="translate("+I+"px,"+z+"px)");var D={identifier:o.identifier,position:c,force:T,pressure:t.force||t.pressure||t.webkitForce||0,distance:O,angle:{radian:_,degree:w},vector:{x:I/p,y:-z/p},raw:k,instance:o,lockX:i.lockX,lockY:i.lockY};(D=o.computeDirection(D)).angle={radian:s(180-w),degree:180-w},o.trigger("move",D),this.trigger("move "+o.id+":move",D)}else this.processOnEnd(t)},E.prototype.processOnEnd=function(t){var i=this,e=i.options,o=i.manager.getIdentifier(t),n=i.nipples.get(o),s=i.manager.removeIdentifier(n.identifier);n&&(e.dataOnly||n.hide(function(){"dynamic"===e.mode&&(n.trigger("removed",n),i.trigger("removed "+n.id+":removed",n),i.manager.trigger("removed "+n.id+":removed",n),n.destroy())}),clearInterval(i.pressureIntervals[n.identifier]),n.resetDirection(),n.trigger("end",n),i.trigger("end "+n.id+":end",n),i.ids.indexOf(n.identifier)>=0&&i.ids.splice(i.ids.indexOf(n.identifier),1),i.actives.indexOf(n)>=0&&i.actives.splice(i.actives.indexOf(n),1),/(semi|static)/.test(e.mode)?i.idles.push(n):i.nipples.indexOf(n)>=0&&i.nipples.splice(i.nipples.indexOf(n),1),i.manager.unbindDocument(),/(semi|static)/.test(e.mode)&&(i.manager.ids[s.id]=s.identifier))},E.prototype.onDestroyed=function(t,i){this.nipples.indexOf(i)>=0&&this.nipples.splice(this.nipples.indexOf(i),1),this.actives.indexOf(i)>=0&&this.actives.splice(this.actives.indexOf(i),1),this.idles.indexOf(i)>=0&&this.idles.splice(this.idles.indexOf(i),1),this.ids.indexOf(i.identifier)>=0&&this.ids.splice(this.ids.indexOf(i.identifier),1),this.manager.removeIdentifier(i.identifier),this.manager.unbindDocument()},E.prototype.destroy=function(){for(var t in this.unbindEvt(this.options.zone,"start"),this.nipples.forEach(function(t){t.destroy()}),this.pressureIntervals)this.pressureIntervals.hasOwnProperty(t)&&clearInterval(this.pressureIntervals[t]);this.trigger("destroyed",this.nipples),this.manager.unbindDocument(),this.off()};var I=E;function z(t){var i=this;i.ids={},i.index=0,i.collections=[],i.scroll=h(),i.config(t),i.prepareCollections();var e=function(){var t;i.collections.forEach(function(e){e.forEach(function(e){t=e.el.getBoundingClientRect(),e.position={x:i.scroll.x+t.left,y:i.scroll.y+t.top}})})};p(window,"resize",function(){a(e)});var o=function(){i.scroll=h()};return p(window,"scroll",function(){a(o)}),i.collections}z.prototype=new T,z.constructor=z,z.prototype.prepareCollections=function(){var t=this;t.collections.create=t.create.bind(t),t.collections.on=t.on.bind(t),t.collections.off=t.off.bind(t),t.collections.destroy=t.destroy.bind(t),t.collections.get=function(i){var e;return t.collections.every(function(t){return!(e=t.get(i))}),e}},z.prototype.create=function(t){return this.createCollection(t)},z.prototype.createCollection=function(t){var i=new I(this,t);return this.bindCollection(i),this.collections.push(i),i},z.prototype.bindCollection=function(t){var i,e=this,o=function(t,o){i=t.type+" "+o.id+":"+t.type,e.trigger(i,o)};t.on("destroyed",e.onDestroyed.bind(e)),t.on("shown hidden rested dir plain",o),t.on("dir:up dir:right dir:down dir:left",o),t.on("plain:up plain:right plain:down plain:left",o)},z.prototype.bindDocument=function(){this.binded||(this.bindEvt(document,"move").bindEvt(document,"end"),this.binded=!0)},z.prototype.unbindDocument=function(t){Object.keys(this.ids).length&&!0!==t||(this.unbindEvt(document,"move").unbindEvt(document,"end"),this.binded=!1)},z.prototype.getIdentifier=function(t){var i;return t?void 0===(i=void 0===t.identifier?t.pointerId:t.identifier)&&(i=this.latest||0):i=this.index,void 0===this.ids[i]&&(this.ids[i]=this.index,this.index+=1),this.latest=i,this.ids[i]},z.prototype.removeIdentifier=function(t){var i={};for(var e in this.ids)if(this.ids[e]===t){i.id=e,i.identifier=this.ids[e],delete this.ids[e];break}return i},z.prototype.onmove=function(t){return this.onAny("move",t),!1},z.prototype.onend=function(t){return this.onAny("end",t),!1},z.prototype.oncancel=function(t){return this.onAny("end",t),!1},z.prototype.onAny=function(t,i){var e,o=this,n="processOn"+t.charAt(0).toUpperCase()+t.slice(1);i=l(i);return v(i,function(t){e=o.getIdentifier(t),v(o.collections,function(t,i,e){e.ids.indexOf(i)>=0&&(e[n](t),t._found_=!0)}.bind(null,t,e)),t._found_||o.removeIdentifier(e)}),!1},z.prototype.destroy=function(){this.unbindDocument(!0),this.ids={},this.index=0,this.collections.forEach(function(t){t.destroy()}),this.off()},z.prototype.onDestroyed=function(t,i){if(this.collections.indexOf(i)<0)return!1;this.collections.splice(this.collections.indexOf(i),1)};var D=new z;i.default={create:function(t){return D.create(t)},factory:D}}]).default});

/***/ }),

/***/ "./node_modules/three-pathfinding/dist/three-pathfinding.module.js":
/*!*************************************************************************!*\
  !*** ./node_modules/three-pathfinding/dist/three-pathfinding.module.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Pathfinding: () => (/* binding */ f),
/* harmony export */   PathfindingHelper: () => (/* binding */ v)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_0__);
class d{static roundNumber(t,e){const s=Math.pow(10,e);return Math.round(t*s)/s}static sample(t){return t[Math.floor(Math.random()*t.length)]}static distanceToSquared(t,e){var s=t.x-e.x,r=t.y-e.y,n=t.z-e.z;return s*s+r*r+n*n}static isPointInPoly(t,e){for(var s=!1,r=-1,n=t.length,o=n-1;++r<n;o=r)(t[r].z<=e.z&&e.z<t[o].z||t[o].z<=e.z&&e.z<t[r].z)&&e.x<(t[o].x-t[r].x)*(e.z-t[r].z)/(t[o].z-t[r].z)+t[r].x&&(s=!s);return s}static isVectorInPolygon(t,e,s){var r=1e5,n=-1e5,o=[];return e.vertexIds.forEach(t=>{r=Math.min(s[t].y,r),n=Math.max(s[t].y,n),o.push(s[t])}),!!(t.y<n+.5&&t.y>r-.5&&this.isPointInPoly(o,t))}static triarea2(t,e,s){return(s.x-t.x)*(e.z-t.z)-(e.x-t.x)*(s.z-t.z)}static vequal(t,e){return this.distanceToSquared(t,e)<1e-5}static mergeVertices(s,r=1e-4){r=Math.max(r,Number.EPSILON);for(var n={},o=s.getIndex(),i=s.getAttribute("position"),h=o?o.count:i.count,c=0,a=[],u=[],l=Math.log10(1/r),d=Math.pow(10,l),p=0;p<h;p++){var g=o?o.getX(p):p,f="";f+=~~(i.getX(g)*d)+",",f+=~~(i.getY(g)*d)+",",(f+=~~(i.getZ(g)*d)+",")in n?a.push(n[f]):(u.push(i.getX(g)),u.push(i.getY(g)),u.push(i.getZ(g)),n[f]=c,a.push(c),c++)}const v=new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(u),i.itemSize,i.normalized),b=new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry;return b.setAttribute("position",v),b.setIndex(a),b}}class p{constructor(t){this.content=[],this.scoreFunction=t}push(t){this.content.push(t),this.sinkDown(this.content.length-1)}pop(){const t=this.content[0],e=this.content.pop();return this.content.length>0&&(this.content[0]=e,this.bubbleUp(0)),t}remove(t){const e=this.content.indexOf(t),s=this.content.pop();e!==this.content.length-1&&(this.content[e]=s,this.scoreFunction(s)<this.scoreFunction(t)?this.sinkDown(e):this.bubbleUp(e))}size(){return this.content.length}rescoreElement(t){this.sinkDown(this.content.indexOf(t))}sinkDown(t){const e=this.content[t];for(;t>0;){const s=(t+1>>1)-1,r=this.content[s];if(!(this.scoreFunction(e)<this.scoreFunction(r)))break;this.content[s]=e,this.content[t]=r,t=s}}bubbleUp(t){const e=this.content.length,s=this.content[t],r=this.scoreFunction(s);for(;;){const n=t+1<<1,o=n-1;let i,h=null;if(o<e&&(i=this.scoreFunction(this.content[o]),i<r&&(h=o)),n<e&&this.scoreFunction(this.content[n])<(null===h?r:i)&&(h=n),null===h)break;this.content[t]=this.content[h],this.content[h]=s,t=h}}}class g{constructor(){this.portals=[]}push(t,e){void 0===e&&(e=t),this.portals.push({left:t,right:e})}stringPull(){const t=this.portals,e=[];let s,r,n,o=0,i=0,h=0;s=t[0].left,r=t[0].left,n=t[0].right,e.push(s);for(let c=1;c<t.length;c++){const a=t[c].left,u=t[c].right;if(d.triarea2(s,n,u)<=0){if(!(d.vequal(s,n)||d.triarea2(s,r,u)>0)){e.push(r),s=r,o=i,r=s,n=s,i=o,h=o,c=o;continue}n=u,h=c}if(d.triarea2(s,r,a)>=0){if(!(d.vequal(s,r)||d.triarea2(s,n,a)<0)){e.push(n),s=n,o=h,r=s,n=s,i=o,h=o,c=o;continue}r=a,i=c}}return 0!==e.length&&d.vequal(e[e.length-1],t[t.length-1].left)||e.push(t[t.length-1].left),this.path=e,e}}class f{constructor(){this.zones={}}static createZone(t,e=1e-4){return class{static buildZone(t,e){const r=this._buildNavigationMesh(t,e),n={};r.vertices.forEach(t=>{t.x=d.roundNumber(t.x,2),t.y=d.roundNumber(t.y,2),t.z=d.roundNumber(t.z,2)}),n.vertices=r.vertices;const o=this._buildPolygonGroups(r);return n.groups=new Array(o.length),o.forEach((t,e)=>{const r=new Map;t.forEach((t,e)=>{r.set(t,e)});const o=new Array(t.length);t.forEach((t,e)=>{const i=[];t.neighbours.forEach(t=>i.push(r.get(t)));const h=[];t.neighbours.forEach(e=>h.push(this._getSharedVerticesInOrder(t,e)));const c=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(0,0,0);c.add(n.vertices[t.vertexIds[0]]),c.add(n.vertices[t.vertexIds[1]]),c.add(n.vertices[t.vertexIds[2]]),c.divideScalar(3),c.x=d.roundNumber(c.x,2),c.y=d.roundNumber(c.y,2),c.z=d.roundNumber(c.z,2),o[e]={id:e,neighbours:i,vertexIds:t.vertexIds,centroid:c,portals:h}}),n.groups[e]=o}),n}static _buildNavigationMesh(t,e){return t=d.mergeVertices(t,e),this._buildPolygonsFromGeometry(t)}static _spreadGroupId(t){let e=new Set([t]);for(;e.size>0;){const s=e;e=new Set,s.forEach(s=>{s.group=t.group,s.neighbours.forEach(t=>{void 0===t.group&&e.add(t)})})}}static _buildPolygonGroups(t){const e=[];return t.polygons.forEach(t=>{void 0!==t.group?e[t.group].push(t):(t.group=e.length,this._spreadGroupId(t),e.push([t]))}),e}static _buildPolygonNeighbours(t,e){const s=new Set,r=e[t.vertexIds[1]],n=e[t.vertexIds[2]];return e[t.vertexIds[0]].forEach(e=>{e!==t&&(r.includes(e)||n.includes(e))&&s.add(e)}),r.forEach(e=>{e!==t&&n.includes(e)&&s.add(e)}),s}static _buildPolygonsFromGeometry(t){const e=[],r=[],n=t.attributes.position,o=t.index,i=[];for(let t=0;t<n.count;t++)r.push((new three__WEBPACK_IMPORTED_MODULE_0__.Vector3).fromBufferAttribute(n,t)),i[t]=[];for(let s=0;s<t.index.count;s+=3){const t=o.getX(s),r=o.getX(s+1),n=o.getX(s+2),h={vertexIds:[t,r,n],neighbours:null};e.push(h),i[t].push(h),i[r].push(h),i[n].push(h)}return e.forEach(t=>{t.neighbours=this._buildPolygonNeighbours(t,i)}),{polygons:e,vertices:r}}static _getSharedVerticesInOrder(t,e){const s=t.vertexIds,r=s[0],n=s[1],o=s[2],i=e.vertexIds,h=i.includes(r),c=i.includes(n),a=i.includes(o);return h&&c&&a?Array.from(s):h&&c?[r,n]:c&&a?[n,o]:h&&a?[o,r]:(console.warn("Error processing navigation mesh neighbors; neighbors with <2 shared vertices found."),[])}}.buildZone(t,e)}setZoneData(t,e){this.zones[t]=e}getRandomNode(t,e,r,n){if(!this.zones[t])return new three__WEBPACK_IMPORTED_MODULE_0__.Vector3;r=r||null,n=n||0;const o=[];return this.zones[t].groups[e].forEach(t=>{r&&n?d.distanceToSquared(r,t.centroid)<n*n&&o.push(t.centroid):o.push(t.centroid)}),d.sample(o)||new three__WEBPACK_IMPORTED_MODULE_0__.Vector3}getClosestNode(t,e,s,r=!1){const n=this.zones[e].vertices;let o=null,i=Infinity;return this.zones[e].groups[s].forEach(e=>{const s=d.distanceToSquared(e.centroid,t);s<i&&(!r||d.isVectorInPolygon(t,e,n))&&(o=e,i=s)}),o}findPath(t,e,r,n){const o=this.zones[r].groups[n],i=this.zones[r].vertices,h=this.getClosestNode(t,r,n,!0),c=this.getClosestNode(e,r,n,!0);if(!h||!c)return null;const a=class{static init(t){for(let e=0;e<t.length;e++){const s=t[e];s.f=0,s.g=0,s.h=0,s.cost=1,s.visited=!1,s.closed=!1,s.parent=null}}static cleanUp(t){for(let e=0;e<t.length;e++){const s=t[e];delete s.f,delete s.g,delete s.h,delete s.cost,delete s.visited,delete s.closed,delete s.parent}}static heap(){return new p(function(t){return t.f})}static search(t,e,s){this.init(t);const r=this.heap();for(r.push(e);r.size()>0;){const e=r.pop();if(e===s){let t=e;const s=[];for(;t.parent;)s.push(t),t=t.parent;return this.cleanUp(s),s.reverse()}e.closed=!0;const n=this.neighbours(t,e);for(let t=0,o=n.length;t<o;t++){const o=n[t];if(o.closed)continue;const i=e.g+o.cost,h=o.visited;if(!h||i<o.g){if(o.visited=!0,o.parent=e,!o.centroid||!s.centroid)throw new Error("Unexpected state");o.h=o.h||this.heuristic(o.centroid,s.centroid),o.g=i,o.f=o.g+o.h,h?r.rescoreElement(o):r.push(o)}}}return[]}static heuristic(t,e){return d.distanceToSquared(t,e)}static neighbours(t,e){const s=[];for(let r=0;r<e.neighbours.length;r++)s.push(t[e.neighbours[r]]);return s}}.search(o,h,c),u=function(t,e){for(var s=0;s<t.neighbours.length;s++)if(t.neighbours[s]===e.id)return t.portals[s]},l=new g;l.push(t);for(let t=0;t<a.length;t++){const e=a[t],s=a[t+1];if(s){const t=u(e,s);l.push(i[t[0]],i[t[1]])}}l.push(e),l.stringPull();const f=l.path.map(t=>new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(t.x,t.y,t.z));return f.shift(),f}}f.prototype.getGroup=function(){const t=new three__WEBPACK_IMPORTED_MODULE_0__.Plane;return function(e,s,r=!1){if(!this.zones[e])return null;let n=null,o=Math.pow(50,2);const i=this.zones[e];for(let e=0;e<i.groups.length;e++){const h=i.groups[e];for(const c of h){if(r&&(t.setFromCoplanarPoints(i.vertices[c.vertexIds[0]],i.vertices[c.vertexIds[1]],i.vertices[c.vertexIds[2]]),Math.abs(t.distanceToPoint(s))<.01)&&d.isPointInPoly([i.vertices[c.vertexIds[0]],i.vertices[c.vertexIds[1]],i.vertices[c.vertexIds[2]]],s))return e;const h=d.distanceToSquared(c.centroid,s);h<o&&(n=e,o=h)}}return n}}(),f.prototype.clampStep=function(){const t=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3,e=new three__WEBPACK_IMPORTED_MODULE_0__.Plane,o=new three__WEBPACK_IMPORTED_MODULE_0__.Triangle,i=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3;let h,c,a=new three__WEBPACK_IMPORTED_MODULE_0__.Vector3;return function(s,r,n,u,l,d){const p=this.zones[u].vertices,g=this.zones[u].groups[l],f=[n],v={};v[n.id]=0,h=void 0,a.set(0,0,0),c=Infinity,e.setFromCoplanarPoints(p[n.vertexIds[0]],p[n.vertexIds[1]],p[n.vertexIds[2]]),e.projectPoint(r,t),i.copy(t);for(let e=f.pop();e;e=f.pop()){o.set(p[e.vertexIds[0]],p[e.vertexIds[1]],p[e.vertexIds[2]]),o.closestPointToPoint(i,t),t.distanceToSquared(i)<c&&(h=e,a.copy(t),c=t.distanceToSquared(i));const s=v[e.id];if(!(s>2))for(let t=0;t<e.neighbours.length;t++){const r=g[e.neighbours[t]];r.id in v||(f.push(r),v[r.id]=s+1)}}return d.copy(a),h}}();class v extends three__WEBPACK_IMPORTED_MODULE_0__.Object3D{constructor(){super(),this._playerMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.SphereGeometry(.25,32,32),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:15631215})),this._targetMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(.3,.3,.3),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:14469912})),this._nodeMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(.1,.8,.1),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:4417387})),this._stepMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(new three__WEBPACK_IMPORTED_MODULE_0__.BoxGeometry(.1,1,.1),new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:14472114})),this._pathMarker=new three__WEBPACK_IMPORTED_MODULE_0__.Object3D,this._pathLineMaterial=new three__WEBPACK_IMPORTED_MODULE_0__.LineBasicMaterial({color:41903,linewidth:2}),this._pathPointMaterial=new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial({color:41903}),this._pathPointGeometry=new three__WEBPACK_IMPORTED_MODULE_0__.SphereGeometry(.08),this._markers=[this._playerMarker,this._targetMarker,this._nodeMarker,this._stepMarker,this._pathMarker],this._markers.forEach(t=>{t.visible=!1,this.add(t)})}setPath(s){for(;this._pathMarker.children.length;)this._pathMarker.children[0].visible=!1,this._pathMarker.remove(this._pathMarker.children[0]);s=[this._playerMarker.position].concat(s);const r=new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry;r.setAttribute("position",new three__WEBPACK_IMPORTED_MODULE_0__.BufferAttribute(new Float32Array(3*s.length),3));for(let t=0;t<s.length;t++)r.attributes.position.setXYZ(t,s[t].x,s[t].y+.2,s[t].z);this._pathMarker.add(new three__WEBPACK_IMPORTED_MODULE_0__.Line(r,this._pathLineMaterial));for(let t=0;t<s.length-1;t++){const e=new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(this._pathPointGeometry,this._pathPointMaterial);e.position.copy(s[t]),e.position.y+=.2,this._pathMarker.add(e)}return this._pathMarker.visible=!0,this}setPlayerPosition(t){return this._playerMarker.position.copy(t),this._playerMarker.visible=!0,this}setTargetPosition(t){return this._targetMarker.position.copy(t),this._targetMarker.visible=!0,this}setNodePosition(t){return this._nodeMarker.position.copy(t),this._nodeMarker.visible=!0,this}setStepPosition(t){return this._stepMarker.position.copy(t),this._stepMarker.visible=!0,this}reset(){for(;this._pathMarker.children.length;)this._pathMarker.children[0].visible=!1,this._pathMarker.remove(this._pathMarker.children[0]);return this._markers.forEach(t=>{t.visible=!1}),this}}
//# sourceMappingURL=three-pathfinding.module.js.map


/***/ }),

/***/ "./node_modules/three/examples/jsm/curves/NURBSCurve.js":
/*!**************************************************************!*\
  !*** ./node_modules/three/examples/jsm/curves/NURBSCurve.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NURBSCurve: () => (/* binding */ NURBSCurve)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var _curves_NURBSUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../curves/NURBSUtils.js */ "./node_modules/three/examples/jsm/curves/NURBSUtils.js");



/**
 * NURBS curve object
 *
 * Derives from Curve, overriding getPoint and getTangent.
 *
 * Implementation is based on (x, y [, z=0 [, w=1]]) control points with w=weight.
 *
 **/

class NURBSCurve extends three__WEBPACK_IMPORTED_MODULE_0__.Curve {

	constructor(
		degree,
		knots /* array of reals */,
		controlPoints /* array of Vector(2|3|4) */,
		startKnot /* index in knots */,
		endKnot /* index in knots */
	) {

		super();

		this.degree = degree;
		this.knots = knots;
		this.controlPoints = [];
		// Used by periodic NURBS to remove hidden spans
		this.startKnot = startKnot || 0;
		this.endKnot = endKnot || ( this.knots.length - 1 );

		for ( let i = 0; i < controlPoints.length; ++ i ) {

			// ensure Vector4 for control points
			const point = controlPoints[ i ];
			this.controlPoints[ i ] = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4( point.x, point.y, point.z, point.w );

		}

	}

	getPoint( t, optionalTarget = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3() ) {

		const point = optionalTarget;

		const u = this.knots[ this.startKnot ] + t * ( this.knots[ this.endKnot ] - this.knots[ this.startKnot ] ); // linear mapping t->u

		// following results in (wx, wy, wz, w) homogeneous point
		const hpoint = _curves_NURBSUtils_js__WEBPACK_IMPORTED_MODULE_1__.calcBSplinePoint( this.degree, this.knots, this.controlPoints, u );

		if ( hpoint.w !== 1.0 ) {

			// project to 3D space: (wx, wy, wz, w) -> (x, y, z, 1)
			hpoint.divideScalar( hpoint.w );

		}

		return point.set( hpoint.x, hpoint.y, hpoint.z );

	}

	getTangent( t, optionalTarget = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3() ) {

		const tangent = optionalTarget;

		const u = this.knots[ 0 ] + t * ( this.knots[ this.knots.length - 1 ] - this.knots[ 0 ] );
		const ders = _curves_NURBSUtils_js__WEBPACK_IMPORTED_MODULE_1__.calcNURBSDerivatives( this.degree, this.knots, this.controlPoints, u, 1 );
		tangent.copy( ders[ 1 ] ).normalize();

		return tangent;

	}

}




/***/ }),

/***/ "./node_modules/three/examples/jsm/curves/NURBSUtils.js":
/*!**************************************************************!*\
  !*** ./node_modules/three/examples/jsm/curves/NURBSUtils.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   calcBSplineDerivatives: () => (/* binding */ calcBSplineDerivatives),
/* harmony export */   calcBSplinePoint: () => (/* binding */ calcBSplinePoint),
/* harmony export */   calcBasisFunctionDerivatives: () => (/* binding */ calcBasisFunctionDerivatives),
/* harmony export */   calcBasisFunctions: () => (/* binding */ calcBasisFunctions),
/* harmony export */   calcKoverI: () => (/* binding */ calcKoverI),
/* harmony export */   calcNURBSDerivatives: () => (/* binding */ calcNURBSDerivatives),
/* harmony export */   calcRationalCurveDerivatives: () => (/* binding */ calcRationalCurveDerivatives),
/* harmony export */   calcSurfacePoint: () => (/* binding */ calcSurfacePoint),
/* harmony export */   calcVolumePoint: () => (/* binding */ calcVolumePoint),
/* harmony export */   findSpan: () => (/* binding */ findSpan)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");


/**
 * NURBS utils
 *
 * See NURBSCurve and NURBSSurface.
 **/


/**************************************************************
 *	NURBS Utils
 **************************************************************/

/*
Finds knot vector span.

p : degree
u : parametric value
U : knot vector

returns the span
*/
function findSpan( p, u, U ) {

	const n = U.length - p - 1;

	if ( u >= U[ n ] ) {

		return n - 1;

	}

	if ( u <= U[ p ] ) {

		return p;

	}

	let low = p;
	let high = n;
	let mid = Math.floor( ( low + high ) / 2 );

	while ( u < U[ mid ] || u >= U[ mid + 1 ] ) {

		if ( u < U[ mid ] ) {

			high = mid;

		} else {

			low = mid;

		}

		mid = Math.floor( ( low + high ) / 2 );

	}

	return mid;

}


/*
Calculate basis functions. See The NURBS Book, page 70, algorithm A2.2

span : span in which u lies
u    : parametric point
p    : degree
U    : knot vector

returns array[p+1] with basis functions values.
*/
function calcBasisFunctions( span, u, p, U ) {

	const N = [];
	const left = [];
	const right = [];
	N[ 0 ] = 1.0;

	for ( let j = 1; j <= p; ++ j ) {

		left[ j ] = u - U[ span + 1 - j ];
		right[ j ] = U[ span + j ] - u;

		let saved = 0.0;

		for ( let r = 0; r < j; ++ r ) {

			const rv = right[ r + 1 ];
			const lv = left[ j - r ];
			const temp = N[ r ] / ( rv + lv );
			N[ r ] = saved + rv * temp;
			saved = lv * temp;

		}

		N[ j ] = saved;

	}

	return N;

}


/*
Calculate B-Spline curve points. See The NURBS Book, page 82, algorithm A3.1.

p : degree of B-Spline
U : knot vector
P : control points (x, y, z, w)
u : parametric point

returns point for given u
*/
function calcBSplinePoint( p, U, P, u ) {

	const span = findSpan( p, u, U );
	const N = calcBasisFunctions( span, u, p, U );
	const C = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4( 0, 0, 0, 0 );

	for ( let j = 0; j <= p; ++ j ) {

		const point = P[ span - p + j ];
		const Nj = N[ j ];
		const wNj = point.w * Nj;
		C.x += point.x * wNj;
		C.y += point.y * wNj;
		C.z += point.z * wNj;
		C.w += point.w * Nj;

	}

	return C;

}


/*
Calculate basis functions derivatives. See The NURBS Book, page 72, algorithm A2.3.

span : span in which u lies
u    : parametric point
p    : degree
n    : number of derivatives to calculate
U    : knot vector

returns array[n+1][p+1] with basis functions derivatives
*/
function calcBasisFunctionDerivatives( span, u, p, n, U ) {

	const zeroArr = [];
	for ( let i = 0; i <= p; ++ i )
		zeroArr[ i ] = 0.0;

	const ders = [];

	for ( let i = 0; i <= n; ++ i )
		ders[ i ] = zeroArr.slice( 0 );

	const ndu = [];

	for ( let i = 0; i <= p; ++ i )
		ndu[ i ] = zeroArr.slice( 0 );

	ndu[ 0 ][ 0 ] = 1.0;

	const left = zeroArr.slice( 0 );
	const right = zeroArr.slice( 0 );

	for ( let j = 1; j <= p; ++ j ) {

		left[ j ] = u - U[ span + 1 - j ];
		right[ j ] = U[ span + j ] - u;

		let saved = 0.0;

		for ( let r = 0; r < j; ++ r ) {

			const rv = right[ r + 1 ];
			const lv = left[ j - r ];
			ndu[ j ][ r ] = rv + lv;

			const temp = ndu[ r ][ j - 1 ] / ndu[ j ][ r ];
			ndu[ r ][ j ] = saved + rv * temp;
			saved = lv * temp;

		}

		ndu[ j ][ j ] = saved;

	}

	for ( let j = 0; j <= p; ++ j ) {

		ders[ 0 ][ j ] = ndu[ j ][ p ];

	}

	for ( let r = 0; r <= p; ++ r ) {

		let s1 = 0;
		let s2 = 1;

		const a = [];
		for ( let i = 0; i <= p; ++ i ) {

			a[ i ] = zeroArr.slice( 0 );

		}

		a[ 0 ][ 0 ] = 1.0;

		for ( let k = 1; k <= n; ++ k ) {

			let d = 0.0;
			const rk = r - k;
			const pk = p - k;

			if ( r >= k ) {

				a[ s2 ][ 0 ] = a[ s1 ][ 0 ] / ndu[ pk + 1 ][ rk ];
				d = a[ s2 ][ 0 ] * ndu[ rk ][ pk ];

			}

			const j1 = ( rk >= - 1 ) ? 1 : - rk;
			const j2 = ( r - 1 <= pk ) ? k - 1 : p - r;

			for ( let j = j1; j <= j2; ++ j ) {

				a[ s2 ][ j ] = ( a[ s1 ][ j ] - a[ s1 ][ j - 1 ] ) / ndu[ pk + 1 ][ rk + j ];
				d += a[ s2 ][ j ] * ndu[ rk + j ][ pk ];

			}

			if ( r <= pk ) {

				a[ s2 ][ k ] = - a[ s1 ][ k - 1 ] / ndu[ pk + 1 ][ r ];
				d += a[ s2 ][ k ] * ndu[ r ][ pk ];

			}

			ders[ k ][ r ] = d;

			const j = s1;
			s1 = s2;
			s2 = j;

		}

	}

	let r = p;

	for ( let k = 1; k <= n; ++ k ) {

		for ( let j = 0; j <= p; ++ j ) {

			ders[ k ][ j ] *= r;

		}

		r *= p - k;

	}

	return ders;

}


/*
	Calculate derivatives of a B-Spline. See The NURBS Book, page 93, algorithm A3.2.

	p  : degree
	U  : knot vector
	P  : control points
	u  : Parametric points
	nd : number of derivatives

	returns array[d+1] with derivatives
	*/
function calcBSplineDerivatives( p, U, P, u, nd ) {

	const du = nd < p ? nd : p;
	const CK = [];
	const span = findSpan( p, u, U );
	const nders = calcBasisFunctionDerivatives( span, u, p, du, U );
	const Pw = [];

	for ( let i = 0; i < P.length; ++ i ) {

		const point = P[ i ].clone();
		const w = point.w;

		point.x *= w;
		point.y *= w;
		point.z *= w;

		Pw[ i ] = point;

	}

	for ( let k = 0; k <= du; ++ k ) {

		const point = Pw[ span - p ].clone().multiplyScalar( nders[ k ][ 0 ] );

		for ( let j = 1; j <= p; ++ j ) {

			point.add( Pw[ span - p + j ].clone().multiplyScalar( nders[ k ][ j ] ) );

		}

		CK[ k ] = point;

	}

	for ( let k = du + 1; k <= nd + 1; ++ k ) {

		CK[ k ] = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4( 0, 0, 0 );

	}

	return CK;

}


/*
Calculate "K over I"

returns k!/(i!(k-i)!)
*/
function calcKoverI( k, i ) {

	let nom = 1;

	for ( let j = 2; j <= k; ++ j ) {

		nom *= j;

	}

	let denom = 1;

	for ( let j = 2; j <= i; ++ j ) {

		denom *= j;

	}

	for ( let j = 2; j <= k - i; ++ j ) {

		denom *= j;

	}

	return nom / denom;

}


/*
Calculate derivatives (0-nd) of rational curve. See The NURBS Book, page 127, algorithm A4.2.

Pders : result of function calcBSplineDerivatives

returns array with derivatives for rational curve.
*/
function calcRationalCurveDerivatives( Pders ) {

	const nd = Pders.length;
	const Aders = [];
	const wders = [];

	for ( let i = 0; i < nd; ++ i ) {

		const point = Pders[ i ];
		Aders[ i ] = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3( point.x, point.y, point.z );
		wders[ i ] = point.w;

	}

	const CK = [];

	for ( let k = 0; k < nd; ++ k ) {

		const v = Aders[ k ].clone();

		for ( let i = 1; i <= k; ++ i ) {

			v.sub( CK[ k - i ].clone().multiplyScalar( calcKoverI( k, i ) * wders[ i ] ) );

		}

		CK[ k ] = v.divideScalar( wders[ 0 ] );

	}

	return CK;

}


/*
Calculate NURBS curve derivatives. See The NURBS Book, page 127, algorithm A4.2.

p  : degree
U  : knot vector
P  : control points in homogeneous space
u  : parametric points
nd : number of derivatives

returns array with derivatives.
*/
function calcNURBSDerivatives( p, U, P, u, nd ) {

	const Pders = calcBSplineDerivatives( p, U, P, u, nd );
	return calcRationalCurveDerivatives( Pders );

}


/*
Calculate rational B-Spline surface point. See The NURBS Book, page 134, algorithm A4.3.

p, q : degrees of B-Spline surface
U, V : knot vectors
P    : control points (x, y, z, w)
u, v : parametric values

returns point for given (u, v)
*/
function calcSurfacePoint( p, q, U, V, P, u, v, target ) {

	const uspan = findSpan( p, u, U );
	const vspan = findSpan( q, v, V );
	const Nu = calcBasisFunctions( uspan, u, p, U );
	const Nv = calcBasisFunctions( vspan, v, q, V );
	const temp = [];

	for ( let l = 0; l <= q; ++ l ) {

		temp[ l ] = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4( 0, 0, 0, 0 );
		for ( let k = 0; k <= p; ++ k ) {

			const point = P[ uspan - p + k ][ vspan - q + l ].clone();
			const w = point.w;
			point.x *= w;
			point.y *= w;
			point.z *= w;
			temp[ l ].add( point.multiplyScalar( Nu[ k ] ) );

		}

	}

	const Sw = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4( 0, 0, 0, 0 );
	for ( let l = 0; l <= q; ++ l ) {

		Sw.add( temp[ l ].multiplyScalar( Nv[ l ] ) );

	}

	Sw.divideScalar( Sw.w );
	target.set( Sw.x, Sw.y, Sw.z );

}

/*
Calculate rational B-Spline volume point. See The NURBS Book, page 134, algorithm A4.3.

p, q, r   : degrees of B-Splinevolume
U, V, W   : knot vectors
P         : control points (x, y, z, w)
u, v, w   : parametric values

returns point for given (u, v, w)
*/
function calcVolumePoint( p, q, r, U, V, W, P, u, v, w, target ) {

	const uspan = findSpan( p, u, U );
	const vspan = findSpan( q, v, V );
	const wspan = findSpan( r, w, W );
	const Nu = calcBasisFunctions( uspan, u, p, U );
	const Nv = calcBasisFunctions( vspan, v, q, V );
	const Nw = calcBasisFunctions( wspan, w, r, W );
	const temp = [];

	for ( let m = 0; m <= r; ++ m ) {

		temp[ m ] = [];

		for ( let l = 0; l <= q; ++ l ) {

			temp[ m ][ l ] = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4( 0, 0, 0, 0 );
			for ( let k = 0; k <= p; ++ k ) {

				const point = P[ uspan - p + k ][ vspan - q + l ][ wspan - r + m ].clone();
				const w = point.w;
				point.x *= w;
				point.y *= w;
				point.z *= w;
				temp[ m ][ l ].add( point.multiplyScalar( Nu[ k ] ) );

			}

		}

	}
	const Sw = new three__WEBPACK_IMPORTED_MODULE_0__.Vector4( 0, 0, 0, 0 );
	for ( let m = 0; m <= r; ++ m ) {
		for ( let l = 0; l <= q; ++ l ) {

			Sw.add( temp[ m ][ l ].multiplyScalar( Nw[ m ] ).multiplyScalar( Nv[ l ] ) );

		}
	}

	Sw.divideScalar( Sw.w );
	target.set( Sw.x, Sw.y, Sw.z );

}





/***/ }),

/***/ "./node_modules/three/examples/jsm/libs/fflate.module.js":
/*!***************************************************************!*\
  !*** ./node_modules/three/examples/jsm/libs/fflate.module.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AsyncCompress: () => (/* binding */ AsyncGzip),
/* harmony export */   AsyncDecompress: () => (/* binding */ AsyncDecompress),
/* harmony export */   AsyncDeflate: () => (/* binding */ AsyncDeflate),
/* harmony export */   AsyncGunzip: () => (/* binding */ AsyncGunzip),
/* harmony export */   AsyncGzip: () => (/* binding */ AsyncGzip),
/* harmony export */   AsyncInflate: () => (/* binding */ AsyncInflate),
/* harmony export */   AsyncUnzipInflate: () => (/* binding */ AsyncUnzipInflate),
/* harmony export */   AsyncUnzlib: () => (/* binding */ AsyncUnzlib),
/* harmony export */   AsyncZipDeflate: () => (/* binding */ AsyncZipDeflate),
/* harmony export */   AsyncZlib: () => (/* binding */ AsyncZlib),
/* harmony export */   Compress: () => (/* binding */ Gzip),
/* harmony export */   DecodeUTF8: () => (/* binding */ DecodeUTF8),
/* harmony export */   Decompress: () => (/* binding */ Decompress),
/* harmony export */   Deflate: () => (/* binding */ Deflate),
/* harmony export */   EncodeUTF8: () => (/* binding */ EncodeUTF8),
/* harmony export */   FlateErrorCode: () => (/* binding */ FlateErrorCode),
/* harmony export */   Gunzip: () => (/* binding */ Gunzip),
/* harmony export */   Gzip: () => (/* binding */ Gzip),
/* harmony export */   Inflate: () => (/* binding */ Inflate),
/* harmony export */   Unzip: () => (/* binding */ Unzip),
/* harmony export */   UnzipInflate: () => (/* binding */ UnzipInflate),
/* harmony export */   UnzipPassThrough: () => (/* binding */ UnzipPassThrough),
/* harmony export */   Unzlib: () => (/* binding */ Unzlib),
/* harmony export */   Zip: () => (/* binding */ Zip),
/* harmony export */   ZipDeflate: () => (/* binding */ ZipDeflate),
/* harmony export */   ZipPassThrough: () => (/* binding */ ZipPassThrough),
/* harmony export */   Zlib: () => (/* binding */ Zlib),
/* harmony export */   compress: () => (/* binding */ gzip),
/* harmony export */   compressSync: () => (/* binding */ gzipSync),
/* harmony export */   decompress: () => (/* binding */ decompress),
/* harmony export */   decompressSync: () => (/* binding */ decompressSync),
/* harmony export */   deflate: () => (/* binding */ deflate),
/* harmony export */   deflateSync: () => (/* binding */ deflateSync),
/* harmony export */   gunzip: () => (/* binding */ gunzip),
/* harmony export */   gunzipSync: () => (/* binding */ gunzipSync),
/* harmony export */   gzip: () => (/* binding */ gzip),
/* harmony export */   gzipSync: () => (/* binding */ gzipSync),
/* harmony export */   inflate: () => (/* binding */ inflate),
/* harmony export */   inflateSync: () => (/* binding */ inflateSync),
/* harmony export */   strFromU8: () => (/* binding */ strFromU8),
/* harmony export */   strToU8: () => (/* binding */ strToU8),
/* harmony export */   unzip: () => (/* binding */ unzip),
/* harmony export */   unzipSync: () => (/* binding */ unzipSync),
/* harmony export */   unzlib: () => (/* binding */ unzlib),
/* harmony export */   unzlibSync: () => (/* binding */ unzlibSync),
/* harmony export */   zip: () => (/* binding */ zip),
/* harmony export */   zipSync: () => (/* binding */ zipSync),
/* harmony export */   zlib: () => (/* binding */ zlib),
/* harmony export */   zlibSync: () => (/* binding */ zlibSync)
/* harmony export */ });
/*!
fflate - fast JavaScript compression/decompression
<https://101arrowz.github.io/fflate>
Licensed under MIT. https://github.com/101arrowz/fflate/blob/master/LICENSE
version 0.8.2
*/

// DEFLATE is a complex format; to read this code, you should probably check the RFC first:
// https://tools.ietf.org/html/rfc1951
// You may also wish to take a look at the guide I made about this program:
// https://gist.github.com/101arrowz/253f31eb5abc3d9275ab943003ffecad
// Some of the following code is similar to that of UZIP.js:
// https://github.com/photopea/UZIP.js
// However, the vast majority of the codebase has diverged from UZIP.js to increase performance and reduce bundle size.
// Sometimes 0 will appear where -1 would be more appropriate. This is because using a uint
// is better for memory in most engines (I *think*).
var ch2 = {};
var wk = (function (c, id, msg, transfer, cb) {
    var w = new Worker(ch2[id] || (ch2[id] = URL.createObjectURL(new Blob([
        c + ';addEventListener("error",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})'
    ], { type: 'text/javascript' }))));
    w.onmessage = function (e) {
        var d = e.data, ed = d.$e$;
        if (ed) {
            var err = new Error(ed[0]);
            err['code'] = ed[1];
            err.stack = ed[2];
            cb(err, null);
        }
        else
            cb(null, d);
    };
    w.postMessage(msg, transfer);
    return w;
});

// aliases for shorter compressed code (most minifers don't do this)
var u8 = Uint8Array, u16 = Uint16Array, i32 = Int32Array;
// fixed length extra bits
var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, /* unused */ 0, 0, /* impossible */ 0]);
// fixed distance extra bits
var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, /* unused */ 0, 0]);
// code length index map
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
// get base, reverse index map from extra bits
var freb = function (eb, start) {
    var b = new u16(31);
    for (var i = 0; i < 31; ++i) {
        b[i] = start += 1 << eb[i - 1];
    }
    // numbers here are at max 18 bits
    var r = new i32(b[30]);
    for (var i = 1; i < 30; ++i) {
        for (var j = b[i]; j < b[i + 1]; ++j) {
            r[j] = ((j - b[i]) << 5) | i;
        }
    }
    return { b: b, r: r };
};
var _a = freb(fleb, 2), fl = _a.b, revfl = _a.r;
// we can ignore the fact that the other numbers are wrong; they never happen anyway
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0), fd = _b.b, revfd = _b.r;
// map of value to reverse (assuming 16 bits)
var rev = new u16(32768);
for (var i = 0; i < 32768; ++i) {
    // reverse table algorithm from SO
    var x = ((i & 0xAAAA) >> 1) | ((i & 0x5555) << 1);
    x = ((x & 0xCCCC) >> 2) | ((x & 0x3333) << 2);
    x = ((x & 0xF0F0) >> 4) | ((x & 0x0F0F) << 4);
    rev[i] = (((x & 0xFF00) >> 8) | ((x & 0x00FF) << 8)) >> 1;
}
// create huffman tree from u8 "map": index -> code length for code index
// mb (max bits) must be at most 15
// TODO: optimize/split up?
var hMap = (function (cd, mb, r) {
    var s = cd.length;
    // index
    var i = 0;
    // u16 "map": index -> # of codes with bit length = index
    var l = new u16(mb);
    // length of cd must be 288 (total # of codes)
    for (; i < s; ++i) {
        if (cd[i])
            ++l[cd[i] - 1];
    }
    // u16 "map": index -> minimum code for bit length = index
    var le = new u16(mb);
    for (i = 1; i < mb; ++i) {
        le[i] = (le[i - 1] + l[i - 1]) << 1;
    }
    var co;
    if (r) {
        // u16 "map": index -> number of actual bits, symbol for code
        co = new u16(1 << mb);
        // bits to remove for reverser
        var rvb = 15 - mb;
        for (i = 0; i < s; ++i) {
            // ignore 0 lengths
            if (cd[i]) {
                // num encoding both symbol and bits read
                var sv = (i << 4) | cd[i];
                // free bits
                var r_1 = mb - cd[i];
                // start value
                var v = le[cd[i] - 1]++ << r_1;
                // m is end value
                for (var m = v | ((1 << r_1) - 1); v <= m; ++v) {
                    // every 16 bit value starting with the code yields the same result
                    co[rev[v] >> rvb] = sv;
                }
            }
        }
    }
    else {
        co = new u16(s);
        for (i = 0; i < s; ++i) {
            if (cd[i]) {
                co[i] = rev[le[cd[i] - 1]++] >> (15 - cd[i]);
            }
        }
    }
    return co;
});
// fixed length tree
var flt = new u8(288);
for (var i = 0; i < 144; ++i)
    flt[i] = 8;
for (var i = 144; i < 256; ++i)
    flt[i] = 9;
for (var i = 256; i < 280; ++i)
    flt[i] = 7;
for (var i = 280; i < 288; ++i)
    flt[i] = 8;
// fixed distance tree
var fdt = new u8(32);
for (var i = 0; i < 32; ++i)
    fdt[i] = 5;
// fixed length map
var flm = /*#__PURE__*/ hMap(flt, 9, 0), flrm = /*#__PURE__*/ hMap(flt, 9, 1);
// fixed distance map
var fdm = /*#__PURE__*/ hMap(fdt, 5, 0), fdrm = /*#__PURE__*/ hMap(fdt, 5, 1);
// find max of array
var max = function (a) {
    var m = a[0];
    for (var i = 1; i < a.length; ++i) {
        if (a[i] > m)
            m = a[i];
    }
    return m;
};
// read d, starting at bit p and mask with m
var bits = function (d, p, m) {
    var o = (p / 8) | 0;
    return ((d[o] | (d[o + 1] << 8)) >> (p & 7)) & m;
};
// read d, starting at bit p continuing for at least 16 bits
var bits16 = function (d, p) {
    var o = (p / 8) | 0;
    return ((d[o] | (d[o + 1] << 8) | (d[o + 2] << 16)) >> (p & 7));
};
// get end of byte
var shft = function (p) { return ((p + 7) / 8) | 0; };
// typed array slice - allows garbage collector to free original reference,
// while being more compatible than .slice
var slc = function (v, s, e) {
    if (s == null || s < 0)
        s = 0;
    if (e == null || e > v.length)
        e = v.length;
    // can't use .constructor in case user-supplied
    return new u8(v.subarray(s, e));
};
/**
 * Codes for errors generated within this library
 */
var FlateErrorCode = {
    UnexpectedEOF: 0,
    InvalidBlockType: 1,
    InvalidLengthLiteral: 2,
    InvalidDistance: 3,
    StreamFinished: 4,
    NoStreamHandler: 5,
    InvalidHeader: 6,
    NoCallback: 7,
    InvalidUTF8: 8,
    ExtraFieldTooLong: 9,
    InvalidDate: 10,
    FilenameTooLong: 11,
    StreamFinishing: 12,
    InvalidZipData: 13,
    UnknownCompressionMethod: 14
};
// error codes
var ec = [
    'unexpected EOF',
    'invalid block type',
    'invalid length/literal',
    'invalid distance',
    'stream finished',
    'no stream handler',
    ,
    'no callback',
    'invalid UTF-8 data',
    'extra field too long',
    'date not in range 1980-2099',
    'filename too long',
    'stream finishing',
    'invalid zip data'
    // determined by unknown compression method
];
;
var err = function (ind, msg, nt) {
    var e = new Error(msg || ec[ind]);
    e.code = ind;
    if (Error.captureStackTrace)
        Error.captureStackTrace(e, err);
    if (!nt)
        throw e;
    return e;
};
// expands raw DEFLATE data
var inflt = function (dat, st, buf, dict) {
    // source length       dict length
    var sl = dat.length, dl = dict ? dict.length : 0;
    if (!sl || st.f && !st.l)
        return buf || new u8(0);
    var noBuf = !buf;
    // have to estimate size
    var resize = noBuf || st.i != 2;
    // no state
    var noSt = st.i;
    // Assumes roughly 33% compression ratio average
    if (noBuf)
        buf = new u8(sl * 3);
    // ensure buffer can fit at least l elements
    var cbuf = function (l) {
        var bl = buf.length;
        // need to increase size to fit
        if (l > bl) {
            // Double or set to necessary, whichever is greater
            var nbuf = new u8(Math.max(bl * 2, l));
            nbuf.set(buf);
            buf = nbuf;
        }
    };
    //  last chunk         bitpos           bytes
    var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
    // total bits
    var tbts = sl * 8;
    do {
        if (!lm) {
            // BFINAL - this is only 1 when last chunk is next
            final = bits(dat, pos, 1);
            // type: 0 = no compression, 1 = fixed huffman, 2 = dynamic huffman
            var type = bits(dat, pos + 1, 3);
            pos += 3;
            if (!type) {
                // go to end of byte boundary
                var s = shft(pos) + 4, l = dat[s - 4] | (dat[s - 3] << 8), t = s + l;
                if (t > sl) {
                    if (noSt)
                        err(0);
                    break;
                }
                // ensure size
                if (resize)
                    cbuf(bt + l);
                // Copy over uncompressed data
                buf.set(dat.subarray(s, t), bt);
                // Get new bitpos, update byte count
                st.b = bt += l, st.p = pos = t * 8, st.f = final;
                continue;
            }
            else if (type == 1)
                lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
            else if (type == 2) {
                //  literal                            lengths
                var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
                var tl = hLit + bits(dat, pos + 5, 31) + 1;
                pos += 14;
                // length+distance tree
                var ldt = new u8(tl);
                // code length tree
                var clt = new u8(19);
                for (var i = 0; i < hcLen; ++i) {
                    // use index map to get real code
                    clt[clim[i]] = bits(dat, pos + i * 3, 7);
                }
                pos += hcLen * 3;
                // code lengths bits
                var clb = max(clt), clbmsk = (1 << clb) - 1;
                // code lengths map
                var clm = hMap(clt, clb, 1);
                for (var i = 0; i < tl;) {
                    var r = clm[bits(dat, pos, clbmsk)];
                    // bits read
                    pos += r & 15;
                    // symbol
                    var s = r >> 4;
                    // code length to copy
                    if (s < 16) {
                        ldt[i++] = s;
                    }
                    else {
                        //  copy   count
                        var c = 0, n = 0;
                        if (s == 16)
                            n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
                        else if (s == 17)
                            n = 3 + bits(dat, pos, 7), pos += 3;
                        else if (s == 18)
                            n = 11 + bits(dat, pos, 127), pos += 7;
                        while (n--)
                            ldt[i++] = c;
                    }
                }
                //    length tree                 distance tree
                var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
                // max length bits
                lbt = max(lt);
                // max dist bits
                dbt = max(dt);
                lm = hMap(lt, lbt, 1);
                dm = hMap(dt, dbt, 1);
            }
            else
                err(1);
            if (pos > tbts) {
                if (noSt)
                    err(0);
                break;
            }
        }
        // Make sure the buffer can hold this + the largest possible addition
        // Maximum chunk size (practically, theoretically infinite) is 2^17
        if (resize)
            cbuf(bt + 131072);
        var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
        var lpos = pos;
        for (;; lpos = pos) {
            // bits read, code
            var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
            pos += c & 15;
            if (pos > tbts) {
                if (noSt)
                    err(0);
                break;
            }
            if (!c)
                err(2);
            if (sym < 256)
                buf[bt++] = sym;
            else if (sym == 256) {
                lpos = pos, lm = null;
                break;
            }
            else {
                var add = sym - 254;
                // no extra bits needed if less
                if (sym > 264) {
                    // index
                    var i = sym - 257, b = fleb[i];
                    add = bits(dat, pos, (1 << b) - 1) + fl[i];
                    pos += b;
                }
                // dist
                var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
                if (!d)
                    err(3);
                pos += d & 15;
                var dt = fd[dsym];
                if (dsym > 3) {
                    var b = fdeb[dsym];
                    dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
                }
                if (pos > tbts) {
                    if (noSt)
                        err(0);
                    break;
                }
                if (resize)
                    cbuf(bt + 131072);
                var end = bt + add;
                if (bt < dt) {
                    var shift = dl - dt, dend = Math.min(dt, end);
                    if (shift + bt < 0)
                        err(3);
                    for (; bt < dend; ++bt)
                        buf[bt] = dict[shift + bt];
                }
                for (; bt < end; ++bt)
                    buf[bt] = buf[bt - dt];
            }
        }
        st.l = lm, st.p = lpos, st.b = bt, st.f = final;
        if (lm)
            final = 1, st.m = lbt, st.d = dm, st.n = dbt;
    } while (!final);
    // don't reallocate for streams or user buffers
    return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
// starting at p, write the minimum number of bits that can hold v to d
var wbits = function (d, p, v) {
    v <<= p & 7;
    var o = (p / 8) | 0;
    d[o] |= v;
    d[o + 1] |= v >> 8;
};
// starting at p, write the minimum number of bits (>8) that can hold v to d
var wbits16 = function (d, p, v) {
    v <<= p & 7;
    var o = (p / 8) | 0;
    d[o] |= v;
    d[o + 1] |= v >> 8;
    d[o + 2] |= v >> 16;
};
// creates code lengths from a frequency table
var hTree = function (d, mb) {
    // Need extra info to make a tree
    var t = [];
    for (var i = 0; i < d.length; ++i) {
        if (d[i])
            t.push({ s: i, f: d[i] });
    }
    var s = t.length;
    var t2 = t.slice();
    if (!s)
        return { t: et, l: 0 };
    if (s == 1) {
        var v = new u8(t[0].s + 1);
        v[t[0].s] = 1;
        return { t: v, l: 1 };
    }
    t.sort(function (a, b) { return a.f - b.f; });
    // after i2 reaches last ind, will be stopped
    // freq must be greater than largest possible number of symbols
    t.push({ s: -1, f: 25001 });
    var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
    t[0] = { s: -1, f: l.f + r.f, l: l, r: r };
    // efficient algorithm from UZIP.js
    // i0 is lookbehind, i2 is lookahead - after processing two low-freq
    // symbols that combined have high freq, will start processing i2 (high-freq,
    // non-composite) symbols instead
    // see https://reddit.com/r/photopea/comments/ikekht/uzipjs_questions/
    while (i1 != s - 1) {
        l = t[t[i0].f < t[i2].f ? i0++ : i2++];
        r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
        t[i1++] = { s: -1, f: l.f + r.f, l: l, r: r };
    }
    var maxSym = t2[0].s;
    for (var i = 1; i < s; ++i) {
        if (t2[i].s > maxSym)
            maxSym = t2[i].s;
    }
    // code lengths
    var tr = new u16(maxSym + 1);
    // max bits in tree
    var mbt = ln(t[i1 - 1], tr, 0);
    if (mbt > mb) {
        // more algorithms from UZIP.js
        // TODO: find out how this code works (debt)
        //  ind    debt
        var i = 0, dt = 0;
        //    left            cost
        var lft = mbt - mb, cst = 1 << lft;
        t2.sort(function (a, b) { return tr[b.s] - tr[a.s] || a.f - b.f; });
        for (; i < s; ++i) {
            var i2_1 = t2[i].s;
            if (tr[i2_1] > mb) {
                dt += cst - (1 << (mbt - tr[i2_1]));
                tr[i2_1] = mb;
            }
            else
                break;
        }
        dt >>= lft;
        while (dt > 0) {
            var i2_2 = t2[i].s;
            if (tr[i2_2] < mb)
                dt -= 1 << (mb - tr[i2_2]++ - 1);
            else
                ++i;
        }
        for (; i >= 0 && dt; --i) {
            var i2_3 = t2[i].s;
            if (tr[i2_3] == mb) {
                --tr[i2_3];
                ++dt;
            }
        }
        mbt = mb;
    }
    return { t: new u8(tr), l: mbt };
};
// get the max length and assign length codes
var ln = function (n, l, d) {
    return n.s == -1
        ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1))
        : (l[n.s] = d);
};
// length codes generation
var lc = function (c) {
    var s = c.length;
    // Note that the semicolon was intentional
    while (s && !c[--s])
        ;
    var cl = new u16(++s);
    //  ind      num         streak
    var cli = 0, cln = c[0], cls = 1;
    var w = function (v) { cl[cli++] = v; };
    for (var i = 1; i <= s; ++i) {
        if (c[i] == cln && i != s)
            ++cls;
        else {
            if (!cln && cls > 2) {
                for (; cls > 138; cls -= 138)
                    w(32754);
                if (cls > 2) {
                    w(cls > 10 ? ((cls - 11) << 5) | 28690 : ((cls - 3) << 5) | 12305);
                    cls = 0;
                }
            }
            else if (cls > 3) {
                w(cln), --cls;
                for (; cls > 6; cls -= 6)
                    w(8304);
                if (cls > 2)
                    w(((cls - 3) << 5) | 8208), cls = 0;
            }
            while (cls--)
                w(cln);
            cls = 1;
            cln = c[i];
        }
    }
    return { c: cl.subarray(0, cli), n: s };
};
// calculate the length of output from tree, code lengths
var clen = function (cf, cl) {
    var l = 0;
    for (var i = 0; i < cl.length; ++i)
        l += cf[i] * cl[i];
    return l;
};
// writes a fixed block
// returns the new bit pos
var wfblk = function (out, pos, dat) {
    // no need to write 00 as type: TypedArray defaults to 0
    var s = dat.length;
    var o = shft(pos + 2);
    out[o] = s & 255;
    out[o + 1] = s >> 8;
    out[o + 2] = out[o] ^ 255;
    out[o + 3] = out[o + 1] ^ 255;
    for (var i = 0; i < s; ++i)
        out[o + i + 4] = dat[i];
    return (o + 4 + s) * 8;
};
// writes a block
var wblk = function (dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
    wbits(out, p++, final);
    ++lf[256];
    var _a = hTree(lf, 15), dlt = _a.t, mlb = _a.l;
    var _b = hTree(df, 15), ddt = _b.t, mdb = _b.l;
    var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
    var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
    var lcfreq = new u16(19);
    for (var i = 0; i < lclt.length; ++i)
        ++lcfreq[lclt[i] & 31];
    for (var i = 0; i < lcdt.length; ++i)
        ++lcfreq[lcdt[i] & 31];
    var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
    var nlcc = 19;
    for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
        ;
    var flen = (bl + 5) << 3;
    var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
    var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
    if (bs >= 0 && flen <= ftlen && flen <= dtlen)
        return wfblk(out, p, dat.subarray(bs, bs + bl));
    var lm, ll, dm, dl;
    wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
    if (dtlen < ftlen) {
        lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
        var llm = hMap(lct, mlcb, 0);
        wbits(out, p, nlc - 257);
        wbits(out, p + 5, ndc - 1);
        wbits(out, p + 10, nlcc - 4);
        p += 14;
        for (var i = 0; i < nlcc; ++i)
            wbits(out, p + 3 * i, lct[clim[i]]);
        p += 3 * nlcc;
        var lcts = [lclt, lcdt];
        for (var it = 0; it < 2; ++it) {
            var clct = lcts[it];
            for (var i = 0; i < clct.length; ++i) {
                var len = clct[i] & 31;
                wbits(out, p, llm[len]), p += lct[len];
                if (len > 15)
                    wbits(out, p, (clct[i] >> 5) & 127), p += clct[i] >> 12;
            }
        }
    }
    else {
        lm = flm, ll = flt, dm = fdm, dl = fdt;
    }
    for (var i = 0; i < li; ++i) {
        var sym = syms[i];
        if (sym > 255) {
            var len = (sym >> 18) & 31;
            wbits16(out, p, lm[len + 257]), p += ll[len + 257];
            if (len > 7)
                wbits(out, p, (sym >> 23) & 31), p += fleb[len];
            var dst = sym & 31;
            wbits16(out, p, dm[dst]), p += dl[dst];
            if (dst > 3)
                wbits16(out, p, (sym >> 5) & 8191), p += fdeb[dst];
        }
        else {
            wbits16(out, p, lm[sym]), p += ll[sym];
        }
    }
    wbits16(out, p, lm[256]);
    return p + ll[256];
};
// deflate options (nice << 13) | chain
var deo = /*#__PURE__*/ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
// empty
var et = /*#__PURE__*/ new u8(0);
// compresses data into a raw DEFLATE buffer
var dflt = function (dat, lvl, plvl, pre, post, st) {
    var s = st.z || dat.length;
    var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7000)) + post);
    // writing to this writes to the output buffer
    var w = o.subarray(pre, o.length - post);
    var lst = st.l;
    var pos = (st.r || 0) & 7;
    if (lvl) {
        if (pos)
            w[0] = st.r >> 3;
        var opt = deo[lvl - 1];
        var n = opt >> 13, c = opt & 8191;
        var msk_1 = (1 << plvl) - 1;
        //    prev 2-byte val map    curr 2-byte val map
        var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
        var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
        var hsh = function (i) { return (dat[i] ^ (dat[i + 1] << bs1_1) ^ (dat[i + 2] << bs2_1)) & msk_1; };
        // 24576 is an arbitrary number of maximum symbols per block
        // 424 buffer for last block
        var syms = new i32(25000);
        // length/literal freq   distance freq
        var lf = new u16(288), df = new u16(32);
        //  l/lcnt  exbits  index          l/lind  waitdx          blkpos
        var lc_1 = 0, eb = 0, i = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
        for (; i + 2 < s; ++i) {
            // hash value
            var hv = hsh(i);
            // index mod 32768    previous index mod
            var imod = i & 32767, pimod = head[hv];
            prev[imod] = pimod;
            head[hv] = imod;
            // We always should modify head and prev, but only add symbols if
            // this data is not yet processed ("wait" for wait index)
            if (wi <= i) {
                // bytes remaining
                var rem = s - i;
                if ((lc_1 > 7000 || li > 24576) && (rem > 423 || !lst)) {
                    pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
                    li = lc_1 = eb = 0, bs = i;
                    for (var j = 0; j < 286; ++j)
                        lf[j] = 0;
                    for (var j = 0; j < 30; ++j)
                        df[j] = 0;
                }
                //  len    dist   chain
                var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
                if (rem > 2 && hv == hsh(i - dif)) {
                    var maxn = Math.min(n, rem) - 1;
                    var maxd = Math.min(32767, i);
                    // max possible length
                    // not capped at dif because decompressors implement "rolling" index population
                    var ml = Math.min(258, rem);
                    while (dif <= maxd && --ch_1 && imod != pimod) {
                        if (dat[i + l] == dat[i + l - dif]) {
                            var nl = 0;
                            for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                                ;
                            if (nl > l) {
                                l = nl, d = dif;
                                // break out early when we reach "nice" (we are satisfied enough)
                                if (nl > maxn)
                                    break;
                                // now, find the rarest 2-byte sequence within this
                                // length of literals and search for that instead.
                                // Much faster than just using the start
                                var mmd = Math.min(dif, nl - 2);
                                var md = 0;
                                for (var j = 0; j < mmd; ++j) {
                                    var ti = i - dif + j & 32767;
                                    var pti = prev[ti];
                                    var cd = ti - pti & 32767;
                                    if (cd > md)
                                        md = cd, pimod = ti;
                                }
                            }
                        }
                        // check the previous match
                        imod = pimod, pimod = prev[imod];
                        dif += imod - pimod & 32767;
                    }
                }
                // d will be nonzero only when a match was found
                if (d) {
                    // store both dist and len data in one int32
                    // Make sure this is recognized as a len/dist with 28th bit (2^28)
                    syms[li++] = 268435456 | (revfl[l] << 18) | revfd[d];
                    var lin = revfl[l] & 31, din = revfd[d] & 31;
                    eb += fleb[lin] + fdeb[din];
                    ++lf[257 + lin];
                    ++df[din];
                    wi = i + l;
                    ++lc_1;
                }
                else {
                    syms[li++] = dat[i];
                    ++lf[dat[i]];
                }
            }
        }
        for (i = Math.max(i, wi); i < s; ++i) {
            syms[li++] = dat[i];
            ++lf[dat[i]];
        }
        pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
        if (!lst) {
            st.r = (pos & 7) | w[(pos / 8) | 0] << 3;
            // shft(pos) now 1 less if pos & 7 != 0
            pos -= 7;
            st.h = head, st.p = prev, st.i = i, st.w = wi;
        }
    }
    else {
        for (var i = st.w || 0; i < s + lst; i += 65535) {
            // end
            var e = i + 65535;
            if (e >= s) {
                // write final block
                w[(pos / 8) | 0] = lst;
                e = s;
            }
            pos = wfblk(w, pos + 1, dat.subarray(i, e));
        }
        st.i = s;
    }
    return slc(o, 0, pre + shft(pos) + post);
};
// CRC32 table
var crct = /*#__PURE__*/ (function () {
    var t = new Int32Array(256);
    for (var i = 0; i < 256; ++i) {
        var c = i, k = 9;
        while (--k)
            c = ((c & 1) && -306674912) ^ (c >>> 1);
        t[i] = c;
    }
    return t;
})();
// CRC32
var crc = function () {
    var c = -1;
    return {
        p: function (d) {
            // closures have awful performance
            var cr = c;
            for (var i = 0; i < d.length; ++i)
                cr = crct[(cr & 255) ^ d[i]] ^ (cr >>> 8);
            c = cr;
        },
        d: function () { return ~c; }
    };
};
// Adler32
var adler = function () {
    var a = 1, b = 0;
    return {
        p: function (d) {
            // closures have awful performance
            var n = a, m = b;
            var l = d.length | 0;
            for (var i = 0; i != l;) {
                var e = Math.min(i + 2655, l);
                for (; i < e; ++i)
                    m += n += d[i];
                n = (n & 65535) + 15 * (n >> 16), m = (m & 65535) + 15 * (m >> 16);
            }
            a = n, b = m;
        },
        d: function () {
            a %= 65521, b %= 65521;
            return (a & 255) << 24 | (a & 0xFF00) << 8 | (b & 255) << 8 | (b >> 8);
        }
    };
};
;
// deflate with opts
var dopt = function (dat, opt, pre, post, st) {
    if (!st) {
        st = { l: 1 };
        if (opt.dictionary) {
            var dict = opt.dictionary.subarray(-32768);
            var newDat = new u8(dict.length + dat.length);
            newDat.set(dict);
            newDat.set(dat, dict.length);
            dat = newDat;
            st.w = dict.length;
        }
    }
    return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? (st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20) : (12 + opt.mem), pre, post, st);
};
// Walmart object spread
var mrg = function (a, b) {
    var o = {};
    for (var k in a)
        o[k] = a[k];
    for (var k in b)
        o[k] = b[k];
    return o;
};
// worker clone
// This is possibly the craziest part of the entire codebase, despite how simple it may seem.
// The only parameter to this function is a closure that returns an array of variables outside of the function scope.
// We're going to try to figure out the variable names used in the closure as strings because that is crucial for workerization.
// We will return an object mapping of true variable name to value (basically, the current scope as a JS object).
// The reason we can't just use the original variable names is minifiers mangling the toplevel scope.
// This took me three weeks to figure out how to do.
var wcln = function (fn, fnStr, td) {
    var dt = fn();
    var st = fn.toString();
    var ks = st.slice(st.indexOf('[') + 1, st.lastIndexOf(']')).replace(/\s+/g, '').split(',');
    for (var i = 0; i < dt.length; ++i) {
        var v = dt[i], k = ks[i];
        if (typeof v == 'function') {
            fnStr += ';' + k + '=';
            var st_1 = v.toString();
            if (v.prototype) {
                // for global objects
                if (st_1.indexOf('[native code]') != -1) {
                    var spInd = st_1.indexOf(' ', 8) + 1;
                    fnStr += st_1.slice(spInd, st_1.indexOf('(', spInd));
                }
                else {
                    fnStr += st_1;
                    for (var t in v.prototype)
                        fnStr += ';' + k + '.prototype.' + t + '=' + v.prototype[t].toString();
                }
            }
            else
                fnStr += st_1;
        }
        else
            td[k] = v;
    }
    return fnStr;
};
var ch = [];
// clone bufs
var cbfs = function (v) {
    var tl = [];
    for (var k in v) {
        if (v[k].buffer) {
            tl.push((v[k] = new v[k].constructor(v[k])).buffer);
        }
    }
    return tl;
};
// use a worker to execute code
var wrkr = function (fns, init, id, cb) {
    if (!ch[id]) {
        var fnStr = '', td_1 = {}, m = fns.length - 1;
        for (var i = 0; i < m; ++i)
            fnStr = wcln(fns[i], fnStr, td_1);
        ch[id] = { c: wcln(fns[m], fnStr, td_1), e: td_1 };
    }
    var td = mrg({}, ch[id].e);
    return wk(ch[id].c + ';onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=' + init.toString() + '}', id, td, cbfs(td), cb);
};
// base async inflate fn
var bInflt = function () { return [u8, u16, i32, fleb, fdeb, clim, fl, fd, flrm, fdrm, rev, ec, hMap, max, bits, bits16, shft, slc, err, inflt, inflateSync, pbf, gopt]; };
var bDflt = function () { return [u8, u16, i32, fleb, fdeb, clim, revfl, revfd, flm, flt, fdm, fdt, rev, deo, et, hMap, wbits, wbits16, hTree, ln, lc, clen, wfblk, wblk, shft, slc, dflt, dopt, deflateSync, pbf]; };
// gzip extra
var gze = function () { return [gzh, gzhl, wbytes, crc, crct]; };
// gunzip extra
var guze = function () { return [gzs, gzl]; };
// zlib extra
var zle = function () { return [zlh, wbytes, adler]; };
// unzlib extra
var zule = function () { return [zls]; };
// post buf
var pbf = function (msg) { return postMessage(msg, [msg.buffer]); };
// get opts
var gopt = function (o) { return o && {
    out: o.size && new u8(o.size),
    dictionary: o.dictionary
}; };
// async helper
var cbify = function (dat, opts, fns, init, id, cb) {
    var w = wrkr(fns, init, id, function (err, dat) {
        w.terminate();
        cb(err, dat);
    });
    w.postMessage([dat, opts], opts.consume ? [dat.buffer] : []);
    return function () { w.terminate(); };
};
// auto stream
var astrm = function (strm) {
    strm.ondata = function (dat, final) { return postMessage([dat, final], [dat.buffer]); };
    return function (ev) {
        if (ev.data.length) {
            strm.push(ev.data[0], ev.data[1]);
            postMessage([ev.data[0].length]);
        }
        else
            strm.flush();
    };
};
// async stream attach
var astrmify = function (fns, strm, opts, init, id, flush, ext) {
    var t;
    var w = wrkr(fns, init, id, function (err, dat) {
        if (err)
            w.terminate(), strm.ondata.call(strm, err);
        else if (!Array.isArray(dat))
            ext(dat);
        else if (dat.length == 1) {
            strm.queuedSize -= dat[0];
            if (strm.ondrain)
                strm.ondrain(dat[0]);
        }
        else {
            if (dat[1])
                w.terminate();
            strm.ondata.call(strm, err, dat[0], dat[1]);
        }
    });
    w.postMessage(opts);
    strm.queuedSize = 0;
    strm.push = function (d, f) {
        if (!strm.ondata)
            err(5);
        if (t)
            strm.ondata(err(4, 0, 1), null, !!f);
        strm.queuedSize += d.length;
        w.postMessage([d, t = f], [d.buffer]);
    };
    strm.terminate = function () { w.terminate(); };
    if (flush) {
        strm.flush = function () { w.postMessage([]); };
    }
};
// read 2 bytes
var b2 = function (d, b) { return d[b] | (d[b + 1] << 8); };
// read 4 bytes
var b4 = function (d, b) { return (d[b] | (d[b + 1] << 8) | (d[b + 2] << 16) | (d[b + 3] << 24)) >>> 0; };
var b8 = function (d, b) { return b4(d, b) + (b4(d, b + 4) * 4294967296); };
// write bytes
var wbytes = function (d, b, v) {
    for (; v; ++b)
        d[b] = v, v >>>= 8;
};
// gzip header
var gzh = function (c, o) {
    var fn = o.filename;
    c[0] = 31, c[1] = 139, c[2] = 8, c[8] = o.level < 2 ? 4 : o.level == 9 ? 2 : 0, c[9] = 3; // assume Unix
    if (o.mtime != 0)
        wbytes(c, 4, Math.floor(new Date(o.mtime || Date.now()) / 1000));
    if (fn) {
        c[3] = 8;
        for (var i = 0; i <= fn.length; ++i)
            c[i + 10] = fn.charCodeAt(i);
    }
};
// gzip footer: -8 to -4 = CRC, -4 to -0 is length
// gzip start
var gzs = function (d) {
    if (d[0] != 31 || d[1] != 139 || d[2] != 8)
        err(6, 'invalid gzip data');
    var flg = d[3];
    var st = 10;
    if (flg & 4)
        st += (d[10] | d[11] << 8) + 2;
    for (var zs = (flg >> 3 & 1) + (flg >> 4 & 1); zs > 0; zs -= !d[st++])
        ;
    return st + (flg & 2);
};
// gzip length
var gzl = function (d) {
    var l = d.length;
    return (d[l - 4] | d[l - 3] << 8 | d[l - 2] << 16 | d[l - 1] << 24) >>> 0;
};
// gzip header length
var gzhl = function (o) { return 10 + (o.filename ? o.filename.length + 1 : 0); };
// zlib header
var zlh = function (c, o) {
    var lv = o.level, fl = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
    c[0] = 120, c[1] = (fl << 6) | (o.dictionary && 32);
    c[1] |= 31 - ((c[0] << 8) | c[1]) % 31;
    if (o.dictionary) {
        var h = adler();
        h.p(o.dictionary);
        wbytes(c, 2, h.d());
    }
};
// zlib start
var zls = function (d, dict) {
    if ((d[0] & 15) != 8 || (d[0] >> 4) > 7 || ((d[0] << 8 | d[1]) % 31))
        err(6, 'invalid zlib data');
    if ((d[1] >> 5 & 1) == +!dict)
        err(6, 'invalid zlib data: ' + (d[1] & 32 ? 'need' : 'unexpected') + ' dictionary');
    return (d[1] >> 3 & 4) + 2;
};
function StrmOpt(opts, cb) {
    if (typeof opts == 'function')
        cb = opts, opts = {};
    this.ondata = cb;
    return opts;
}
/**
 * Streaming DEFLATE compression
 */
var Deflate = /*#__PURE__*/ (function () {
    function Deflate(opts, cb) {
        if (typeof opts == 'function')
            cb = opts, opts = {};
        this.ondata = cb;
        this.o = opts || {};
        this.s = { l: 0, i: 32768, w: 32768, z: 32768 };
        // Buffer length must always be 0 mod 32768 for index calculations to be correct when modifying head and prev
        // 98304 = 32768 (lookback) + 65536 (common chunk size)
        this.b = new u8(98304);
        if (this.o.dictionary) {
            var dict = this.o.dictionary.subarray(-32768);
            this.b.set(dict, 32768 - dict.length);
            this.s.i = 32768 - dict.length;
        }
    }
    Deflate.prototype.p = function (c, f) {
        this.ondata(dopt(c, this.o, 0, 0, this.s), f);
    };
    /**
     * Pushes a chunk to be deflated
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Deflate.prototype.push = function (chunk, final) {
        if (!this.ondata)
            err(5);
        if (this.s.l)
            err(4);
        var endLen = chunk.length + this.s.z;
        if (endLen > this.b.length) {
            if (endLen > 2 * this.b.length - 32768) {
                var newBuf = new u8(endLen & -32768);
                newBuf.set(this.b.subarray(0, this.s.z));
                this.b = newBuf;
            }
            var split = this.b.length - this.s.z;
            this.b.set(chunk.subarray(0, split), this.s.z);
            this.s.z = this.b.length;
            this.p(this.b, false);
            this.b.set(this.b.subarray(-32768));
            this.b.set(chunk.subarray(split), 32768);
            this.s.z = chunk.length - split + 32768;
            this.s.i = 32766, this.s.w = 32768;
        }
        else {
            this.b.set(chunk, this.s.z);
            this.s.z += chunk.length;
        }
        this.s.l = final & 1;
        if (this.s.z > this.s.w + 8191 || final) {
            this.p(this.b, final || false);
            this.s.w = this.s.i, this.s.i -= 2;
        }
    };
    /**
     * Flushes buffered uncompressed data. Useful to immediately retrieve the
     * deflated output for small inputs.
     */
    Deflate.prototype.flush = function () {
        if (!this.ondata)
            err(5);
        if (this.s.l)
            err(4);
        this.p(this.b, false);
        this.s.w = this.s.i, this.s.i -= 2;
    };
    return Deflate;
}());

/**
 * Asynchronous streaming DEFLATE compression
 */
var AsyncDeflate = /*#__PURE__*/ (function () {
    function AsyncDeflate(opts, cb) {
        astrmify([
            bDflt,
            function () { return [astrm, Deflate]; }
        ], this, StrmOpt.call(this, opts, cb), function (ev) {
            var strm = new Deflate(ev.data);
            onmessage = astrm(strm);
        }, 6, 1);
    }
    return AsyncDeflate;
}());

function deflate(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        err(7);
    return cbify(data, opts, [
        bDflt,
    ], function (ev) { return pbf(deflateSync(ev.data[0], ev.data[1])); }, 0, cb);
}
/**
 * Compresses data with DEFLATE without any wrapper
 * @param data The data to compress
 * @param opts The compression options
 * @returns The deflated version of the data
 */
function deflateSync(data, opts) {
    return dopt(data, opts || {}, 0, 0);
}
/**
 * Streaming DEFLATE decompression
 */
var Inflate = /*#__PURE__*/ (function () {
    function Inflate(opts, cb) {
        // no StrmOpt here to avoid adding to workerizer
        if (typeof opts == 'function')
            cb = opts, opts = {};
        this.ondata = cb;
        var dict = opts && opts.dictionary && opts.dictionary.subarray(-32768);
        this.s = { i: 0, b: dict ? dict.length : 0 };
        this.o = new u8(32768);
        this.p = new u8(0);
        if (dict)
            this.o.set(dict);
    }
    Inflate.prototype.e = function (c) {
        if (!this.ondata)
            err(5);
        if (this.d)
            err(4);
        if (!this.p.length)
            this.p = c;
        else if (c.length) {
            var n = new u8(this.p.length + c.length);
            n.set(this.p), n.set(c, this.p.length), this.p = n;
        }
    };
    Inflate.prototype.c = function (final) {
        this.s.i = +(this.d = final || false);
        var bts = this.s.b;
        var dt = inflt(this.p, this.s, this.o);
        this.ondata(slc(dt, bts, this.s.b), this.d);
        this.o = slc(dt, this.s.b - 32768), this.s.b = this.o.length;
        this.p = slc(this.p, (this.s.p / 8) | 0), this.s.p &= 7;
    };
    /**
     * Pushes a chunk to be inflated
     * @param chunk The chunk to push
     * @param final Whether this is the final chunk
     */
    Inflate.prototype.push = function (chunk, final) {
        this.e(chunk), this.c(final);
    };
    return Inflate;
}());

/**
 * Asynchronous streaming DEFLATE decompression
 */
var AsyncInflate = /*#__PURE__*/ (function () {
    function AsyncInflate(opts, cb) {
        astrmify([
            bInflt,
            function () { return [astrm, Inflate]; }
        ], this, StrmOpt.call(this, opts, cb), function (ev) {
            var strm = new Inflate(ev.data);
            onmessage = astrm(strm);
        }, 7, 0);
    }
    return AsyncInflate;
}());

function inflate(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        err(7);
    return cbify(data, opts, [
        bInflt
    ], function (ev) { return pbf(inflateSync(ev.data[0], gopt(ev.data[1]))); }, 1, cb);
}
/**
 * Expands DEFLATE data with no wrapper
 * @param data The data to decompress
 * @param opts The decompression options
 * @returns The decompressed version of the data
 */
function inflateSync(data, opts) {
    return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
// before you yell at me for not just using extends, my reason is that TS inheritance is hard to workerize.
/**
 * Streaming GZIP compression
 */
var Gzip = /*#__PURE__*/ (function () {
    function Gzip(opts, cb) {
        this.c = crc();
        this.l = 0;
        this.v = 1;
        Deflate.call(this, opts, cb);
    }
    /**
     * Pushes a chunk to be GZIPped
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Gzip.prototype.push = function (chunk, final) {
        this.c.p(chunk);
        this.l += chunk.length;
        Deflate.prototype.push.call(this, chunk, final);
    };
    Gzip.prototype.p = function (c, f) {
        var raw = dopt(c, this.o, this.v && gzhl(this.o), f && 8, this.s);
        if (this.v)
            gzh(raw, this.o), this.v = 0;
        if (f)
            wbytes(raw, raw.length - 8, this.c.d()), wbytes(raw, raw.length - 4, this.l);
        this.ondata(raw, f);
    };
    /**
     * Flushes buffered uncompressed data. Useful to immediately retrieve the
     * GZIPped output for small inputs.
     */
    Gzip.prototype.flush = function () {
        Deflate.prototype.flush.call(this);
    };
    return Gzip;
}());

/**
 * Asynchronous streaming GZIP compression
 */
var AsyncGzip = /*#__PURE__*/ (function () {
    function AsyncGzip(opts, cb) {
        astrmify([
            bDflt,
            gze,
            function () { return [astrm, Deflate, Gzip]; }
        ], this, StrmOpt.call(this, opts, cb), function (ev) {
            var strm = new Gzip(ev.data);
            onmessage = astrm(strm);
        }, 8, 1);
    }
    return AsyncGzip;
}());

function gzip(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        err(7);
    return cbify(data, opts, [
        bDflt,
        gze,
        function () { return [gzipSync]; }
    ], function (ev) { return pbf(gzipSync(ev.data[0], ev.data[1])); }, 2, cb);
}
/**
 * Compresses data with GZIP
 * @param data The data to compress
 * @param opts The compression options
 * @returns The gzipped version of the data
 */
function gzipSync(data, opts) {
    if (!opts)
        opts = {};
    var c = crc(), l = data.length;
    c.p(data);
    var d = dopt(data, opts, gzhl(opts), 8), s = d.length;
    return gzh(d, opts), wbytes(d, s - 8, c.d()), wbytes(d, s - 4, l), d;
}
/**
 * Streaming single or multi-member GZIP decompression
 */
var Gunzip = /*#__PURE__*/ (function () {
    function Gunzip(opts, cb) {
        this.v = 1;
        this.r = 0;
        Inflate.call(this, opts, cb);
    }
    /**
     * Pushes a chunk to be GUNZIPped
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Gunzip.prototype.push = function (chunk, final) {
        Inflate.prototype.e.call(this, chunk);
        this.r += chunk.length;
        if (this.v) {
            var p = this.p.subarray(this.v - 1);
            var s = p.length > 3 ? gzs(p) : 4;
            if (s > p.length) {
                if (!final)
                    return;
            }
            else if (this.v > 1 && this.onmember) {
                this.onmember(this.r - p.length);
            }
            this.p = p.subarray(s), this.v = 0;
        }
        // necessary to prevent TS from using the closure value
        // This allows for workerization to function correctly
        Inflate.prototype.c.call(this, final);
        // process concatenated GZIP
        if (this.s.f && !this.s.l && !final) {
            this.v = shft(this.s.p) + 9;
            this.s = { i: 0 };
            this.o = new u8(0);
            this.push(new u8(0), final);
        }
    };
    return Gunzip;
}());

/**
 * Asynchronous streaming single or multi-member GZIP decompression
 */
var AsyncGunzip = /*#__PURE__*/ (function () {
    function AsyncGunzip(opts, cb) {
        var _this = this;
        astrmify([
            bInflt,
            guze,
            function () { return [astrm, Inflate, Gunzip]; }
        ], this, StrmOpt.call(this, opts, cb), function (ev) {
            var strm = new Gunzip(ev.data);
            strm.onmember = function (offset) { return postMessage(offset); };
            onmessage = astrm(strm);
        }, 9, 0, function (offset) { return _this.onmember && _this.onmember(offset); });
    }
    return AsyncGunzip;
}());

function gunzip(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        err(7);
    return cbify(data, opts, [
        bInflt,
        guze,
        function () { return [gunzipSync]; }
    ], function (ev) { return pbf(gunzipSync(ev.data[0], ev.data[1])); }, 3, cb);
}
/**
 * Expands GZIP data
 * @param data The data to decompress
 * @param opts The decompression options
 * @returns The decompressed version of the data
 */
function gunzipSync(data, opts) {
    var st = gzs(data);
    if (st + 8 > data.length)
        err(6, 'invalid gzip data');
    return inflt(data.subarray(st, -8), { i: 2 }, opts && opts.out || new u8(gzl(data)), opts && opts.dictionary);
}
/**
 * Streaming Zlib compression
 */
var Zlib = /*#__PURE__*/ (function () {
    function Zlib(opts, cb) {
        this.c = adler();
        this.v = 1;
        Deflate.call(this, opts, cb);
    }
    /**
     * Pushes a chunk to be zlibbed
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Zlib.prototype.push = function (chunk, final) {
        this.c.p(chunk);
        Deflate.prototype.push.call(this, chunk, final);
    };
    Zlib.prototype.p = function (c, f) {
        var raw = dopt(c, this.o, this.v && (this.o.dictionary ? 6 : 2), f && 4, this.s);
        if (this.v)
            zlh(raw, this.o), this.v = 0;
        if (f)
            wbytes(raw, raw.length - 4, this.c.d());
        this.ondata(raw, f);
    };
    /**
     * Flushes buffered uncompressed data. Useful to immediately retrieve the
     * zlibbed output for small inputs.
     */
    Zlib.prototype.flush = function () {
        Deflate.prototype.flush.call(this);
    };
    return Zlib;
}());

/**
 * Asynchronous streaming Zlib compression
 */
var AsyncZlib = /*#__PURE__*/ (function () {
    function AsyncZlib(opts, cb) {
        astrmify([
            bDflt,
            zle,
            function () { return [astrm, Deflate, Zlib]; }
        ], this, StrmOpt.call(this, opts, cb), function (ev) {
            var strm = new Zlib(ev.data);
            onmessage = astrm(strm);
        }, 10, 1);
    }
    return AsyncZlib;
}());

function zlib(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        err(7);
    return cbify(data, opts, [
        bDflt,
        zle,
        function () { return [zlibSync]; }
    ], function (ev) { return pbf(zlibSync(ev.data[0], ev.data[1])); }, 4, cb);
}
/**
 * Compress data with Zlib
 * @param data The data to compress
 * @param opts The compression options
 * @returns The zlib-compressed version of the data
 */
function zlibSync(data, opts) {
    if (!opts)
        opts = {};
    var a = adler();
    a.p(data);
    var d = dopt(data, opts, opts.dictionary ? 6 : 2, 4);
    return zlh(d, opts), wbytes(d, d.length - 4, a.d()), d;
}
/**
 * Streaming Zlib decompression
 */
var Unzlib = /*#__PURE__*/ (function () {
    function Unzlib(opts, cb) {
        Inflate.call(this, opts, cb);
        this.v = opts && opts.dictionary ? 2 : 1;
    }
    /**
     * Pushes a chunk to be unzlibbed
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Unzlib.prototype.push = function (chunk, final) {
        Inflate.prototype.e.call(this, chunk);
        if (this.v) {
            if (this.p.length < 6 && !final)
                return;
            this.p = this.p.subarray(zls(this.p, this.v - 1)), this.v = 0;
        }
        if (final) {
            if (this.p.length < 4)
                err(6, 'invalid zlib data');
            this.p = this.p.subarray(0, -4);
        }
        // necessary to prevent TS from using the closure value
        // This allows for workerization to function correctly
        Inflate.prototype.c.call(this, final);
    };
    return Unzlib;
}());

/**
 * Asynchronous streaming Zlib decompression
 */
var AsyncUnzlib = /*#__PURE__*/ (function () {
    function AsyncUnzlib(opts, cb) {
        astrmify([
            bInflt,
            zule,
            function () { return [astrm, Inflate, Unzlib]; }
        ], this, StrmOpt.call(this, opts, cb), function (ev) {
            var strm = new Unzlib(ev.data);
            onmessage = astrm(strm);
        }, 11, 0);
    }
    return AsyncUnzlib;
}());

function unzlib(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        err(7);
    return cbify(data, opts, [
        bInflt,
        zule,
        function () { return [unzlibSync]; }
    ], function (ev) { return pbf(unzlibSync(ev.data[0], gopt(ev.data[1]))); }, 5, cb);
}
/**
 * Expands Zlib data
 * @param data The data to decompress
 * @param opts The decompression options
 * @returns The decompressed version of the data
 */
function unzlibSync(data, opts) {
    return inflt(data.subarray(zls(data, opts && opts.dictionary), -4), { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
// Default algorithm for compression (used because having a known output size allows faster decompression)


/**
 * Streaming GZIP, Zlib, or raw DEFLATE decompression
 */
var Decompress = /*#__PURE__*/ (function () {
    function Decompress(opts, cb) {
        this.o = StrmOpt.call(this, opts, cb) || {};
        this.G = Gunzip;
        this.I = Inflate;
        this.Z = Unzlib;
    }
    // init substream
    // overriden by AsyncDecompress
    Decompress.prototype.i = function () {
        var _this = this;
        this.s.ondata = function (dat, final) {
            _this.ondata(dat, final);
        };
    };
    /**
     * Pushes a chunk to be decompressed
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Decompress.prototype.push = function (chunk, final) {
        if (!this.ondata)
            err(5);
        if (!this.s) {
            if (this.p && this.p.length) {
                var n = new u8(this.p.length + chunk.length);
                n.set(this.p), n.set(chunk, this.p.length);
            }
            else
                this.p = chunk;
            if (this.p.length > 2) {
                this.s = (this.p[0] == 31 && this.p[1] == 139 && this.p[2] == 8)
                    ? new this.G(this.o)
                    : ((this.p[0] & 15) != 8 || (this.p[0] >> 4) > 7 || ((this.p[0] << 8 | this.p[1]) % 31))
                        ? new this.I(this.o)
                        : new this.Z(this.o);
                this.i();
                this.s.push(this.p, final);
                this.p = null;
            }
        }
        else
            this.s.push(chunk, final);
    };
    return Decompress;
}());

/**
 * Asynchronous streaming GZIP, Zlib, or raw DEFLATE decompression
 */
var AsyncDecompress = /*#__PURE__*/ (function () {
    function AsyncDecompress(opts, cb) {
        Decompress.call(this, opts, cb);
        this.queuedSize = 0;
        this.G = AsyncGunzip;
        this.I = AsyncInflate;
        this.Z = AsyncUnzlib;
    }
    AsyncDecompress.prototype.i = function () {
        var _this = this;
        this.s.ondata = function (err, dat, final) {
            _this.ondata(err, dat, final);
        };
        this.s.ondrain = function (size) {
            _this.queuedSize -= size;
            if (_this.ondrain)
                _this.ondrain(size);
        };
    };
    /**
     * Pushes a chunk to be decompressed
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    AsyncDecompress.prototype.push = function (chunk, final) {
        this.queuedSize += chunk.length;
        Decompress.prototype.push.call(this, chunk, final);
    };
    return AsyncDecompress;
}());

function decompress(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        err(7);
    return (data[0] == 31 && data[1] == 139 && data[2] == 8)
        ? gunzip(data, opts, cb)
        : ((data[0] & 15) != 8 || (data[0] >> 4) > 7 || ((data[0] << 8 | data[1]) % 31))
            ? inflate(data, opts, cb)
            : unzlib(data, opts, cb);
}
/**
 * Expands compressed GZIP, Zlib, or raw DEFLATE data, automatically detecting the format
 * @param data The data to decompress
 * @param opts The decompression options
 * @returns The decompressed version of the data
 */
function decompressSync(data, opts) {
    return (data[0] == 31 && data[1] == 139 && data[2] == 8)
        ? gunzipSync(data, opts)
        : ((data[0] & 15) != 8 || (data[0] >> 4) > 7 || ((data[0] << 8 | data[1]) % 31))
            ? inflateSync(data, opts)
            : unzlibSync(data, opts);
}
// flatten a directory structure
var fltn = function (d, p, t, o) {
    for (var k in d) {
        var val = d[k], n = p + k, op = o;
        if (Array.isArray(val))
            op = mrg(o, val[1]), val = val[0];
        if (val instanceof u8)
            t[n] = [val, op];
        else {
            t[n += '/'] = [new u8(0), op];
            fltn(val, n, t, o);
        }
    }
};
// text encoder
var te = typeof TextEncoder != 'undefined' && /*#__PURE__*/ new TextEncoder();
// text decoder
var td = typeof TextDecoder != 'undefined' && /*#__PURE__*/ new TextDecoder();
// text decoder stream
var tds = 0;
try {
    td.decode(et, { stream: true });
    tds = 1;
}
catch (e) { }
// decode UTF8
var dutf8 = function (d) {
    for (var r = '', i = 0;;) {
        var c = d[i++];
        var eb = (c > 127) + (c > 223) + (c > 239);
        if (i + eb > d.length)
            return { s: r, r: slc(d, i - 1) };
        if (!eb)
            r += String.fromCharCode(c);
        else if (eb == 3) {
            c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | (d[i++] & 63)) - 65536,
                r += String.fromCharCode(55296 | (c >> 10), 56320 | (c & 1023));
        }
        else if (eb & 1)
            r += String.fromCharCode((c & 31) << 6 | (d[i++] & 63));
        else
            r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | (d[i++] & 63));
    }
};
/**
 * Streaming UTF-8 decoding
 */
var DecodeUTF8 = /*#__PURE__*/ (function () {
    /**
     * Creates a UTF-8 decoding stream
     * @param cb The callback to call whenever data is decoded
     */
    function DecodeUTF8(cb) {
        this.ondata = cb;
        if (tds)
            this.t = new TextDecoder();
        else
            this.p = et;
    }
    /**
     * Pushes a chunk to be decoded from UTF-8 binary
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    DecodeUTF8.prototype.push = function (chunk, final) {
        if (!this.ondata)
            err(5);
        final = !!final;
        if (this.t) {
            this.ondata(this.t.decode(chunk, { stream: true }), final);
            if (final) {
                if (this.t.decode().length)
                    err(8);
                this.t = null;
            }
            return;
        }
        if (!this.p)
            err(4);
        var dat = new u8(this.p.length + chunk.length);
        dat.set(this.p);
        dat.set(chunk, this.p.length);
        var _a = dutf8(dat), s = _a.s, r = _a.r;
        if (final) {
            if (r.length)
                err(8);
            this.p = null;
        }
        else
            this.p = r;
        this.ondata(s, final);
    };
    return DecodeUTF8;
}());

/**
 * Streaming UTF-8 encoding
 */
var EncodeUTF8 = /*#__PURE__*/ (function () {
    /**
     * Creates a UTF-8 decoding stream
     * @param cb The callback to call whenever data is encoded
     */
    function EncodeUTF8(cb) {
        this.ondata = cb;
    }
    /**
     * Pushes a chunk to be encoded to UTF-8
     * @param chunk The string data to push
     * @param final Whether this is the last chunk
     */
    EncodeUTF8.prototype.push = function (chunk, final) {
        if (!this.ondata)
            err(5);
        if (this.d)
            err(4);
        this.ondata(strToU8(chunk), this.d = final || false);
    };
    return EncodeUTF8;
}());

/**
 * Converts a string into a Uint8Array for use with compression/decompression methods
 * @param str The string to encode
 * @param latin1 Whether or not to interpret the data as Latin-1. This should
 *               not need to be true unless decoding a binary string.
 * @returns The string encoded in UTF-8/Latin-1 binary
 */
function strToU8(str, latin1) {
    if (latin1) {
        var ar_1 = new u8(str.length);
        for (var i = 0; i < str.length; ++i)
            ar_1[i] = str.charCodeAt(i);
        return ar_1;
    }
    if (te)
        return te.encode(str);
    var l = str.length;
    var ar = new u8(str.length + (str.length >> 1));
    var ai = 0;
    var w = function (v) { ar[ai++] = v; };
    for (var i = 0; i < l; ++i) {
        if (ai + 5 > ar.length) {
            var n = new u8(ai + 8 + ((l - i) << 1));
            n.set(ar);
            ar = n;
        }
        var c = str.charCodeAt(i);
        if (c < 128 || latin1)
            w(c);
        else if (c < 2048)
            w(192 | (c >> 6)), w(128 | (c & 63));
        else if (c > 55295 && c < 57344)
            c = 65536 + (c & 1023 << 10) | (str.charCodeAt(++i) & 1023),
                w(240 | (c >> 18)), w(128 | ((c >> 12) & 63)), w(128 | ((c >> 6) & 63)), w(128 | (c & 63));
        else
            w(224 | (c >> 12)), w(128 | ((c >> 6) & 63)), w(128 | (c & 63));
    }
    return slc(ar, 0, ai);
}
/**
 * Converts a Uint8Array to a string
 * @param dat The data to decode to string
 * @param latin1 Whether or not to interpret the data as Latin-1. This should
 *               not need to be true unless encoding to binary string.
 * @returns The original UTF-8/Latin-1 string
 */
function strFromU8(dat, latin1) {
    if (latin1) {
        var r = '';
        for (var i = 0; i < dat.length; i += 16384)
            r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
        return r;
    }
    else if (td) {
        return td.decode(dat);
    }
    else {
        var _a = dutf8(dat), s = _a.s, r = _a.r;
        if (r.length)
            err(8);
        return s;
    }
}
;
// deflate bit flag
var dbf = function (l) { return l == 1 ? 3 : l < 6 ? 2 : l == 9 ? 1 : 0; };
// skip local zip header
var slzh = function (d, b) { return b + 30 + b2(d, b + 26) + b2(d, b + 28); };
// read zip header
var zh = function (d, b, z) {
    var fnl = b2(d, b + 28), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl, bs = b4(d, b + 20);
    var _a = z && bs == 4294967295 ? z64e(d, es) : [bs, b4(d, b + 24), b4(d, b + 42)], sc = _a[0], su = _a[1], off = _a[2];
    return [b2(d, b + 10), sc, su, fn, es + b2(d, b + 30) + b2(d, b + 32), off];
};
// read zip64 extra field
var z64e = function (d, b) {
    for (; b2(d, b) != 1; b += 4 + b2(d, b + 2))
        ;
    return [b8(d, b + 12), b8(d, b + 4), b8(d, b + 20)];
};
// extra field length
var exfl = function (ex) {
    var le = 0;
    if (ex) {
        for (var k in ex) {
            var l = ex[k].length;
            if (l > 65535)
                err(9);
            le += l + 4;
        }
    }
    return le;
};
// write zip header
var wzh = function (d, b, f, fn, u, c, ce, co) {
    var fl = fn.length, ex = f.extra, col = co && co.length;
    var exl = exfl(ex);
    wbytes(d, b, ce != null ? 0x2014B50 : 0x4034B50), b += 4;
    if (ce != null)
        d[b++] = 20, d[b++] = f.os;
    d[b] = 20, b += 2; // spec compliance? what's that?
    d[b++] = (f.flag << 1) | (c < 0 && 8), d[b++] = u && 8;
    d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
    var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
    if (y < 0 || y > 119)
        err(10);
    wbytes(d, b, (y << 25) | ((dt.getMonth() + 1) << 21) | (dt.getDate() << 16) | (dt.getHours() << 11) | (dt.getMinutes() << 5) | (dt.getSeconds() >> 1)), b += 4;
    if (c != -1) {
        wbytes(d, b, f.crc);
        wbytes(d, b + 4, c < 0 ? -c - 2 : c);
        wbytes(d, b + 8, f.size);
    }
    wbytes(d, b + 12, fl);
    wbytes(d, b + 14, exl), b += 16;
    if (ce != null) {
        wbytes(d, b, col);
        wbytes(d, b + 6, f.attrs);
        wbytes(d, b + 10, ce), b += 14;
    }
    d.set(fn, b);
    b += fl;
    if (exl) {
        for (var k in ex) {
            var exf = ex[k], l = exf.length;
            wbytes(d, b, +k);
            wbytes(d, b + 2, l);
            d.set(exf, b + 4), b += 4 + l;
        }
    }
    if (col)
        d.set(co, b), b += col;
    return b;
};
// write zip footer (end of central directory)
var wzf = function (o, b, c, d, e) {
    wbytes(o, b, 0x6054B50); // skip disk
    wbytes(o, b + 8, c);
    wbytes(o, b + 10, c);
    wbytes(o, b + 12, d);
    wbytes(o, b + 16, e);
};
/**
 * A pass-through stream to keep data uncompressed in a ZIP archive.
 */
var ZipPassThrough = /*#__PURE__*/ (function () {
    /**
     * Creates a pass-through stream that can be added to ZIP archives
     * @param filename The filename to associate with this data stream
     */
    function ZipPassThrough(filename) {
        this.filename = filename;
        this.c = crc();
        this.size = 0;
        this.compression = 0;
    }
    /**
     * Processes a chunk and pushes to the output stream. You can override this
     * method in a subclass for custom behavior, but by default this passes
     * the data through. You must call this.ondata(err, chunk, final) at some
     * point in this method.
     * @param chunk The chunk to process
     * @param final Whether this is the last chunk
     */
    ZipPassThrough.prototype.process = function (chunk, final) {
        this.ondata(null, chunk, final);
    };
    /**
     * Pushes a chunk to be added. If you are subclassing this with a custom
     * compression algorithm, note that you must push data from the source
     * file only, pre-compression.
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    ZipPassThrough.prototype.push = function (chunk, final) {
        if (!this.ondata)
            err(5);
        this.c.p(chunk);
        this.size += chunk.length;
        if (final)
            this.crc = this.c.d();
        this.process(chunk, final || false);
    };
    return ZipPassThrough;
}());

// I don't extend because TypeScript extension adds 1kB of runtime bloat
/**
 * Streaming DEFLATE compression for ZIP archives. Prefer using AsyncZipDeflate
 * for better performance
 */
var ZipDeflate = /*#__PURE__*/ (function () {
    /**
     * Creates a DEFLATE stream that can be added to ZIP archives
     * @param filename The filename to associate with this data stream
     * @param opts The compression options
     */
    function ZipDeflate(filename, opts) {
        var _this = this;
        if (!opts)
            opts = {};
        ZipPassThrough.call(this, filename);
        this.d = new Deflate(opts, function (dat, final) {
            _this.ondata(null, dat, final);
        });
        this.compression = 8;
        this.flag = dbf(opts.level);
    }
    ZipDeflate.prototype.process = function (chunk, final) {
        try {
            this.d.push(chunk, final);
        }
        catch (e) {
            this.ondata(e, null, final);
        }
    };
    /**
     * Pushes a chunk to be deflated
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    ZipDeflate.prototype.push = function (chunk, final) {
        ZipPassThrough.prototype.push.call(this, chunk, final);
    };
    return ZipDeflate;
}());

/**
 * Asynchronous streaming DEFLATE compression for ZIP archives
 */
var AsyncZipDeflate = /*#__PURE__*/ (function () {
    /**
     * Creates an asynchronous DEFLATE stream that can be added to ZIP archives
     * @param filename The filename to associate with this data stream
     * @param opts The compression options
     */
    function AsyncZipDeflate(filename, opts) {
        var _this = this;
        if (!opts)
            opts = {};
        ZipPassThrough.call(this, filename);
        this.d = new AsyncDeflate(opts, function (err, dat, final) {
            _this.ondata(err, dat, final);
        });
        this.compression = 8;
        this.flag = dbf(opts.level);
        this.terminate = this.d.terminate;
    }
    AsyncZipDeflate.prototype.process = function (chunk, final) {
        this.d.push(chunk, final);
    };
    /**
     * Pushes a chunk to be deflated
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    AsyncZipDeflate.prototype.push = function (chunk, final) {
        ZipPassThrough.prototype.push.call(this, chunk, final);
    };
    return AsyncZipDeflate;
}());

// TODO: Better tree shaking
/**
 * A zippable archive to which files can incrementally be added
 */
var Zip = /*#__PURE__*/ (function () {
    /**
     * Creates an empty ZIP archive to which files can be added
     * @param cb The callback to call whenever data for the generated ZIP archive
     *           is available
     */
    function Zip(cb) {
        this.ondata = cb;
        this.u = [];
        this.d = 1;
    }
    /**
     * Adds a file to the ZIP archive
     * @param file The file stream to add
     */
    Zip.prototype.add = function (file) {
        var _this = this;
        if (!this.ondata)
            err(5);
        // finishing or finished
        if (this.d & 2)
            this.ondata(err(4 + (this.d & 1) * 8, 0, 1), null, false);
        else {
            var f = strToU8(file.filename), fl_1 = f.length;
            var com = file.comment, o = com && strToU8(com);
            var u = fl_1 != file.filename.length || (o && (com.length != o.length));
            var hl_1 = fl_1 + exfl(file.extra) + 30;
            if (fl_1 > 65535)
                this.ondata(err(11, 0, 1), null, false);
            var header = new u8(hl_1);
            wzh(header, 0, file, f, u, -1);
            var chks_1 = [header];
            var pAll_1 = function () {
                for (var _i = 0, chks_2 = chks_1; _i < chks_2.length; _i++) {
                    var chk = chks_2[_i];
                    _this.ondata(null, chk, false);
                }
                chks_1 = [];
            };
            var tr_1 = this.d;
            this.d = 0;
            var ind_1 = this.u.length;
            var uf_1 = mrg(file, {
                f: f,
                u: u,
                o: o,
                t: function () {
                    if (file.terminate)
                        file.terminate();
                },
                r: function () {
                    pAll_1();
                    if (tr_1) {
                        var nxt = _this.u[ind_1 + 1];
                        if (nxt)
                            nxt.r();
                        else
                            _this.d = 1;
                    }
                    tr_1 = 1;
                }
            });
            var cl_1 = 0;
            file.ondata = function (err, dat, final) {
                if (err) {
                    _this.ondata(err, dat, final);
                    _this.terminate();
                }
                else {
                    cl_1 += dat.length;
                    chks_1.push(dat);
                    if (final) {
                        var dd = new u8(16);
                        wbytes(dd, 0, 0x8074B50);
                        wbytes(dd, 4, file.crc);
                        wbytes(dd, 8, cl_1);
                        wbytes(dd, 12, file.size);
                        chks_1.push(dd);
                        uf_1.c = cl_1, uf_1.b = hl_1 + cl_1 + 16, uf_1.crc = file.crc, uf_1.size = file.size;
                        if (tr_1)
                            uf_1.r();
                        tr_1 = 1;
                    }
                    else if (tr_1)
                        pAll_1();
                }
            };
            this.u.push(uf_1);
        }
    };
    /**
     * Ends the process of adding files and prepares to emit the final chunks.
     * This *must* be called after adding all desired files for the resulting
     * ZIP file to work properly.
     */
    Zip.prototype.end = function () {
        var _this = this;
        if (this.d & 2) {
            this.ondata(err(4 + (this.d & 1) * 8, 0, 1), null, true);
            return;
        }
        if (this.d)
            this.e();
        else
            this.u.push({
                r: function () {
                    if (!(_this.d & 1))
                        return;
                    _this.u.splice(-1, 1);
                    _this.e();
                },
                t: function () { }
            });
        this.d = 3;
    };
    Zip.prototype.e = function () {
        var bt = 0, l = 0, tl = 0;
        for (var _i = 0, _a = this.u; _i < _a.length; _i++) {
            var f = _a[_i];
            tl += 46 + f.f.length + exfl(f.extra) + (f.o ? f.o.length : 0);
        }
        var out = new u8(tl + 22);
        for (var _b = 0, _c = this.u; _b < _c.length; _b++) {
            var f = _c[_b];
            wzh(out, bt, f, f.f, f.u, -f.c - 2, l, f.o);
            bt += 46 + f.f.length + exfl(f.extra) + (f.o ? f.o.length : 0), l += f.b;
        }
        wzf(out, bt, this.u.length, tl, l);
        this.ondata(null, out, true);
        this.d = 2;
    };
    /**
     * A method to terminate any internal workers used by the stream. Subsequent
     * calls to add() will fail.
     */
    Zip.prototype.terminate = function () {
        for (var _i = 0, _a = this.u; _i < _a.length; _i++) {
            var f = _a[_i];
            f.t();
        }
        this.d = 2;
    };
    return Zip;
}());

function zip(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        err(7);
    var r = {};
    fltn(data, '', r, opts);
    var k = Object.keys(r);
    var lft = k.length, o = 0, tot = 0;
    var slft = lft, files = new Array(lft);
    var term = [];
    var tAll = function () {
        for (var i = 0; i < term.length; ++i)
            term[i]();
    };
    var cbd = function (a, b) {
        mt(function () { cb(a, b); });
    };
    mt(function () { cbd = cb; });
    var cbf = function () {
        var out = new u8(tot + 22), oe = o, cdl = tot - o;
        tot = 0;
        for (var i = 0; i < slft; ++i) {
            var f = files[i];
            try {
                var l = f.c.length;
                wzh(out, tot, f, f.f, f.u, l);
                var badd = 30 + f.f.length + exfl(f.extra);
                var loc = tot + badd;
                out.set(f.c, loc);
                wzh(out, o, f, f.f, f.u, l, tot, f.m), o += 16 + badd + (f.m ? f.m.length : 0), tot = loc + l;
            }
            catch (e) {
                return cbd(e, null);
            }
        }
        wzf(out, o, files.length, cdl, oe);
        cbd(null, out);
    };
    if (!lft)
        cbf();
    var _loop_1 = function (i) {
        var fn = k[i];
        var _a = r[fn], file = _a[0], p = _a[1];
        var c = crc(), size = file.length;
        c.p(file);
        var f = strToU8(fn), s = f.length;
        var com = p.comment, m = com && strToU8(com), ms = m && m.length;
        var exl = exfl(p.extra);
        var compression = p.level == 0 ? 0 : 8;
        var cbl = function (e, d) {
            if (e) {
                tAll();
                cbd(e, null);
            }
            else {
                var l = d.length;
                files[i] = mrg(p, {
                    size: size,
                    crc: c.d(),
                    c: d,
                    f: f,
                    m: m,
                    u: s != fn.length || (m && (com.length != ms)),
                    compression: compression
                });
                o += 30 + s + exl + l;
                tot += 76 + 2 * (s + exl) + (ms || 0) + l;
                if (!--lft)
                    cbf();
            }
        };
        if (s > 65535)
            cbl(err(11, 0, 1), null);
        if (!compression)
            cbl(null, file);
        else if (size < 160000) {
            try {
                cbl(null, deflateSync(file, p));
            }
            catch (e) {
                cbl(e, null);
            }
        }
        else
            term.push(deflate(file, p, cbl));
    };
    // Cannot use lft because it can decrease
    for (var i = 0; i < slft; ++i) {
        _loop_1(i);
    }
    return tAll;
}
/**
 * Synchronously creates a ZIP file. Prefer using `zip` for better performance
 * with more than one file.
 * @param data The directory structure for the ZIP archive
 * @param opts The main options, merged with per-file options
 * @returns The generated ZIP archive
 */
function zipSync(data, opts) {
    if (!opts)
        opts = {};
    var r = {};
    var files = [];
    fltn(data, '', r, opts);
    var o = 0;
    var tot = 0;
    for (var fn in r) {
        var _a = r[fn], file = _a[0], p = _a[1];
        var compression = p.level == 0 ? 0 : 8;
        var f = strToU8(fn), s = f.length;
        var com = p.comment, m = com && strToU8(com), ms = m && m.length;
        var exl = exfl(p.extra);
        if (s > 65535)
            err(11);
        var d = compression ? deflateSync(file, p) : file, l = d.length;
        var c = crc();
        c.p(file);
        files.push(mrg(p, {
            size: file.length,
            crc: c.d(),
            c: d,
            f: f,
            m: m,
            u: s != fn.length || (m && (com.length != ms)),
            o: o,
            compression: compression
        }));
        o += 30 + s + exl + l;
        tot += 76 + 2 * (s + exl) + (ms || 0) + l;
    }
    var out = new u8(tot + 22), oe = o, cdl = tot - o;
    for (var i = 0; i < files.length; ++i) {
        var f = files[i];
        wzh(out, f.o, f, f.f, f.u, f.c.length);
        var badd = 30 + f.f.length + exfl(f.extra);
        out.set(f.c, f.o + badd);
        wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
    }
    wzf(out, o, files.length, cdl, oe);
    return out;
}
/**
 * Streaming pass-through decompression for ZIP archives
 */
var UnzipPassThrough = /*#__PURE__*/ (function () {
    function UnzipPassThrough() {
    }
    UnzipPassThrough.prototype.push = function (data, final) {
        this.ondata(null, data, final);
    };
    UnzipPassThrough.compression = 0;
    return UnzipPassThrough;
}());

/**
 * Streaming DEFLATE decompression for ZIP archives. Prefer AsyncZipInflate for
 * better performance.
 */
var UnzipInflate = /*#__PURE__*/ (function () {
    /**
     * Creates a DEFLATE decompression that can be used in ZIP archives
     */
    function UnzipInflate() {
        var _this = this;
        this.i = new Inflate(function (dat, final) {
            _this.ondata(null, dat, final);
        });
    }
    UnzipInflate.prototype.push = function (data, final) {
        try {
            this.i.push(data, final);
        }
        catch (e) {
            this.ondata(e, null, final);
        }
    };
    UnzipInflate.compression = 8;
    return UnzipInflate;
}());

/**
 * Asynchronous streaming DEFLATE decompression for ZIP archives
 */
var AsyncUnzipInflate = /*#__PURE__*/ (function () {
    /**
     * Creates a DEFLATE decompression that can be used in ZIP archives
     */
    function AsyncUnzipInflate(_, sz) {
        var _this = this;
        if (sz < 320000) {
            this.i = new Inflate(function (dat, final) {
                _this.ondata(null, dat, final);
            });
        }
        else {
            this.i = new AsyncInflate(function (err, dat, final) {
                _this.ondata(err, dat, final);
            });
            this.terminate = this.i.terminate;
        }
    }
    AsyncUnzipInflate.prototype.push = function (data, final) {
        if (this.i.terminate)
            data = slc(data, 0);
        this.i.push(data, final);
    };
    AsyncUnzipInflate.compression = 8;
    return AsyncUnzipInflate;
}());

/**
 * A ZIP archive decompression stream that emits files as they are discovered
 */
var Unzip = /*#__PURE__*/ (function () {
    /**
     * Creates a ZIP decompression stream
     * @param cb The callback to call whenever a file in the ZIP archive is found
     */
    function Unzip(cb) {
        this.onfile = cb;
        this.k = [];
        this.o = {
            0: UnzipPassThrough
        };
        this.p = et;
    }
    /**
     * Pushes a chunk to be unzipped
     * @param chunk The chunk to push
     * @param final Whether this is the last chunk
     */
    Unzip.prototype.push = function (chunk, final) {
        var _this = this;
        if (!this.onfile)
            err(5);
        if (!this.p)
            err(4);
        if (this.c > 0) {
            var len = Math.min(this.c, chunk.length);
            var toAdd = chunk.subarray(0, len);
            this.c -= len;
            if (this.d)
                this.d.push(toAdd, !this.c);
            else
                this.k[0].push(toAdd);
            chunk = chunk.subarray(len);
            if (chunk.length)
                return this.push(chunk, final);
        }
        else {
            var f = 0, i = 0, is = void 0, buf = void 0;
            if (!this.p.length)
                buf = chunk;
            else if (!chunk.length)
                buf = this.p;
            else {
                buf = new u8(this.p.length + chunk.length);
                buf.set(this.p), buf.set(chunk, this.p.length);
            }
            var l = buf.length, oc = this.c, add = oc && this.d;
            var _loop_2 = function () {
                var _a;
                var sig = b4(buf, i);
                if (sig == 0x4034B50) {
                    f = 1, is = i;
                    this_1.d = null;
                    this_1.c = 0;
                    var bf = b2(buf, i + 6), cmp_1 = b2(buf, i + 8), u = bf & 2048, dd = bf & 8, fnl = b2(buf, i + 26), es = b2(buf, i + 28);
                    if (l > i + 30 + fnl + es) {
                        var chks_3 = [];
                        this_1.k.unshift(chks_3);
                        f = 2;
                        var sc_1 = b4(buf, i + 18), su_1 = b4(buf, i + 22);
                        var fn_1 = strFromU8(buf.subarray(i + 30, i += 30 + fnl), !u);
                        if (sc_1 == 4294967295) {
                            _a = dd ? [-2] : z64e(buf, i), sc_1 = _a[0], su_1 = _a[1];
                        }
                        else if (dd)
                            sc_1 = -1;
                        i += es;
                        this_1.c = sc_1;
                        var d_1;
                        var file_1 = {
                            name: fn_1,
                            compression: cmp_1,
                            start: function () {
                                if (!file_1.ondata)
                                    err(5);
                                if (!sc_1)
                                    file_1.ondata(null, et, true);
                                else {
                                    var ctr = _this.o[cmp_1];
                                    if (!ctr)
                                        file_1.ondata(err(14, 'unknown compression type ' + cmp_1, 1), null, false);
                                    d_1 = sc_1 < 0 ? new ctr(fn_1) : new ctr(fn_1, sc_1, su_1);
                                    d_1.ondata = function (err, dat, final) { file_1.ondata(err, dat, final); };
                                    for (var _i = 0, chks_4 = chks_3; _i < chks_4.length; _i++) {
                                        var dat = chks_4[_i];
                                        d_1.push(dat, false);
                                    }
                                    if (_this.k[0] == chks_3 && _this.c)
                                        _this.d = d_1;
                                    else
                                        d_1.push(et, true);
                                }
                            },
                            terminate: function () {
                                if (d_1 && d_1.terminate)
                                    d_1.terminate();
                            }
                        };
                        if (sc_1 >= 0)
                            file_1.size = sc_1, file_1.originalSize = su_1;
                        this_1.onfile(file_1);
                    }
                    return "break";
                }
                else if (oc) {
                    if (sig == 0x8074B50) {
                        is = i += 12 + (oc == -2 && 8), f = 3, this_1.c = 0;
                        return "break";
                    }
                    else if (sig == 0x2014B50) {
                        is = i -= 4, f = 3, this_1.c = 0;
                        return "break";
                    }
                }
            };
            var this_1 = this;
            for (; i < l - 4; ++i) {
                var state_1 = _loop_2();
                if (state_1 === "break")
                    break;
            }
            this.p = et;
            if (oc < 0) {
                var dat = f ? buf.subarray(0, is - 12 - (oc == -2 && 8) - (b4(buf, is - 16) == 0x8074B50 && 4)) : buf.subarray(0, i);
                if (add)
                    add.push(dat, !!f);
                else
                    this.k[+(f == 2)].push(dat);
            }
            if (f & 2)
                return this.push(buf.subarray(i), final);
            this.p = buf.subarray(i);
        }
        if (final) {
            if (this.c)
                err(13);
            this.p = null;
        }
    };
    /**
     * Registers a decoder with the stream, allowing for files compressed with
     * the compression type provided to be expanded correctly
     * @param decoder The decoder constructor
     */
    Unzip.prototype.register = function (decoder) {
        this.o[decoder.compression] = decoder;
    };
    return Unzip;
}());

var mt = typeof queueMicrotask == 'function' ? queueMicrotask : typeof setTimeout == 'function' ? setTimeout : function (fn) { fn(); };
function unzip(data, opts, cb) {
    if (!cb)
        cb = opts, opts = {};
    if (typeof cb != 'function')
        err(7);
    var term = [];
    var tAll = function () {
        for (var i = 0; i < term.length; ++i)
            term[i]();
    };
    var files = {};
    var cbd = function (a, b) {
        mt(function () { cb(a, b); });
    };
    mt(function () { cbd = cb; });
    var e = data.length - 22;
    for (; b4(data, e) != 0x6054B50; --e) {
        if (!e || data.length - e > 65558) {
            cbd(err(13, 0, 1), null);
            return tAll;
        }
    }
    ;
    var lft = b2(data, e + 8);
    if (lft) {
        var c = lft;
        var o = b4(data, e + 16);
        var z = o == 4294967295 || c == 65535;
        if (z) {
            var ze = b4(data, e - 12);
            z = b4(data, ze) == 0x6064B50;
            if (z) {
                c = lft = b4(data, ze + 32);
                o = b4(data, ze + 48);
            }
        }
        var fltr = opts && opts.filter;
        var _loop_3 = function (i) {
            var _a = zh(data, o, z), c_1 = _a[0], sc = _a[1], su = _a[2], fn = _a[3], no = _a[4], off = _a[5], b = slzh(data, off);
            o = no;
            var cbl = function (e, d) {
                if (e) {
                    tAll();
                    cbd(e, null);
                }
                else {
                    if (d)
                        files[fn] = d;
                    if (!--lft)
                        cbd(null, files);
                }
            };
            if (!fltr || fltr({
                name: fn,
                size: sc,
                originalSize: su,
                compression: c_1
            })) {
                if (!c_1)
                    cbl(null, slc(data, b, b + sc));
                else if (c_1 == 8) {
                    var infl = data.subarray(b, b + sc);
                    // Synchronously decompress under 512KB, or barely-compressed data
                    if (su < 524288 || sc > 0.8 * su) {
                        try {
                            cbl(null, inflateSync(infl, { out: new u8(su) }));
                        }
                        catch (e) {
                            cbl(e, null);
                        }
                    }
                    else
                        term.push(inflate(infl, { size: su }, cbl));
                }
                else
                    cbl(err(14, 'unknown compression type ' + c_1, 1), null);
            }
            else
                cbl(null, null);
        };
        for (var i = 0; i < c; ++i) {
            _loop_3(i);
        }
    }
    else
        cbd(null, {});
    return tAll;
}
/**
 * Synchronously decompresses a ZIP archive. Prefer using `unzip` for better
 * performance with more than one file.
 * @param data The raw compressed ZIP file
 * @param opts The ZIP extraction options
 * @returns The decompressed files
 */
function unzipSync(data, opts) {
    var files = {};
    var e = data.length - 22;
    for (; b4(data, e) != 0x6054B50; --e) {
        if (!e || data.length - e > 65558)
            err(13);
    }
    ;
    var c = b2(data, e + 8);
    if (!c)
        return {};
    var o = b4(data, e + 16);
    var z = o == 4294967295 || c == 65535;
    if (z) {
        var ze = b4(data, e - 12);
        z = b4(data, ze) == 0x6064B50;
        if (z) {
            c = b4(data, ze + 32);
            o = b4(data, ze + 48);
        }
    }
    var fltr = opts && opts.filter;
    for (var i = 0; i < c; ++i) {
        var _a = zh(data, o, z), c_2 = _a[0], sc = _a[1], su = _a[2], fn = _a[3], no = _a[4], off = _a[5], b = slzh(data, off);
        o = no;
        if (!fltr || fltr({
            name: fn,
            size: sc,
            originalSize: su,
            compression: c_2
        })) {
            if (!c_2)
                files[fn] = slc(data, b, b + sc);
            else if (c_2 == 8)
                files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
            else
                err(14, 'unknown compression type ' + c_2);
        }
    }
    return files;
}


/***/ }),

/***/ "./node_modules/three/examples/jsm/loaders/ColladaLoader.js":
/*!******************************************************************!*\
  !*** ./node_modules/three/examples/jsm/loaders/ColladaLoader.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ColladaLoader: () => (/* binding */ ColladaLoader)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var _loaders_TGALoader_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../loaders/TGALoader.js */ "./node_modules/three/examples/jsm/loaders/TGALoader.js");



class ColladaLoader extends three__WEBPACK_IMPORTED_MODULE_0__.Loader {

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const path = ( scope.path === '' ) ? three__WEBPACK_IMPORTED_MODULE_0__.LoaderUtils.extractUrlBase( url ) : scope.path;

		const loader = new three__WEBPACK_IMPORTED_MODULE_0__.FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text, path ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( text, path ) {

		function getElementsByTagName( xml, name ) {

			// Non recursive xml.getElementsByTagName() ...

			const array = [];
			const childNodes = xml.childNodes;

			for ( let i = 0, l = childNodes.length; i < l; i ++ ) {

				const child = childNodes[ i ];

				if ( child.nodeName === name ) {

					array.push( child );

				}

			}

			return array;

		}

		function parseStrings( text ) {

			if ( text.length === 0 ) return [];

			const parts = text.trim().split( /\s+/ );
			const array = new Array( parts.length );

			for ( let i = 0, l = parts.length; i < l; i ++ ) {

				array[ i ] = parts[ i ];

			}

			return array;

		}

		function parseFloats( text ) {

			if ( text.length === 0 ) return [];

			const parts = text.trim().split( /\s+/ );
			const array = new Array( parts.length );

			for ( let i = 0, l = parts.length; i < l; i ++ ) {

				array[ i ] = parseFloat( parts[ i ] );

			}

			return array;

		}

		function parseInts( text ) {

			if ( text.length === 0 ) return [];

			const parts = text.trim().split( /\s+/ );
			const array = new Array( parts.length );

			for ( let i = 0, l = parts.length; i < l; i ++ ) {

				array[ i ] = parseInt( parts[ i ] );

			}

			return array;

		}

		function parseId( text ) {

			return text.substring( 1 );

		}

		function generateId() {

			return 'three_default_' + ( count ++ );

		}

		function isEmpty( object ) {

			return Object.keys( object ).length === 0;

		}

		// asset

		function parseAsset( xml ) {

			return {
				unit: parseAssetUnit( getElementsByTagName( xml, 'unit' )[ 0 ] ),
				upAxis: parseAssetUpAxis( getElementsByTagName( xml, 'up_axis' )[ 0 ] )
			};

		}

		function parseAssetUnit( xml ) {

			if ( ( xml !== undefined ) && ( xml.hasAttribute( 'meter' ) === true ) ) {

				return parseFloat( xml.getAttribute( 'meter' ) );

			} else {

				return 1; // default 1 meter

			}

		}

		function parseAssetUpAxis( xml ) {

			return xml !== undefined ? xml.textContent : 'Y_UP';

		}

		// library

		function parseLibrary( xml, libraryName, nodeName, parser ) {

			const library = getElementsByTagName( xml, libraryName )[ 0 ];

			if ( library !== undefined ) {

				const elements = getElementsByTagName( library, nodeName );

				for ( let i = 0; i < elements.length; i ++ ) {

					parser( elements[ i ] );

				}

			}

		}

		function buildLibrary( data, builder ) {

			for ( const name in data ) {

				const object = data[ name ];
				object.build = builder( data[ name ] );

			}

		}

		// get

		function getBuild( data, builder ) {

			if ( data.build !== undefined ) return data.build;

			data.build = builder( data );

			return data.build;

		}

		// animation

		function parseAnimation( xml ) {

			const data = {
				sources: {},
				samplers: {},
				channels: {}
			};

			let hasChildren = false;

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				let id;

				switch ( child.nodeName ) {

					case 'source':
						id = child.getAttribute( 'id' );
						data.sources[ id ] = parseSource( child );
						break;

					case 'sampler':
						id = child.getAttribute( 'id' );
						data.samplers[ id ] = parseAnimationSampler( child );
						break;

					case 'channel':
						id = child.getAttribute( 'target' );
						data.channels[ id ] = parseAnimationChannel( child );
						break;

					case 'animation':
						// hierarchy of related animations
						parseAnimation( child );
						hasChildren = true;
						break;

					default:
						console.log( child );

				}

			}

			if ( hasChildren === false ) {

				// since 'id' attributes can be optional, it's necessary to generate a UUID for unqiue assignment

				library.animations[ xml.getAttribute( 'id' ) || three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.generateUUID() ] = data;

			}

		}

		function parseAnimationSampler( xml ) {

			const data = {
				inputs: {},
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						const id = parseId( child.getAttribute( 'source' ) );
						const semantic = child.getAttribute( 'semantic' );
						data.inputs[ semantic ] = id;
						break;

				}

			}

			return data;

		}

		function parseAnimationChannel( xml ) {

			const data = {};

			const target = xml.getAttribute( 'target' );

			// parsing SID Addressing Syntax

			let parts = target.split( '/' );

			const id = parts.shift();
			let sid = parts.shift();

			// check selection syntax

			const arraySyntax = ( sid.indexOf( '(' ) !== - 1 );
			const memberSyntax = ( sid.indexOf( '.' ) !== - 1 );

			if ( memberSyntax ) {

				//  member selection access

				parts = sid.split( '.' );
				sid = parts.shift();
				data.member = parts.shift();

			} else if ( arraySyntax ) {

				// array-access syntax. can be used to express fields in one-dimensional vectors or two-dimensional matrices.

				const indices = sid.split( '(' );
				sid = indices.shift();

				for ( let i = 0; i < indices.length; i ++ ) {

					indices[ i ] = parseInt( indices[ i ].replace( /\)/, '' ) );

				}

				data.indices = indices;

			}

			data.id = id;
			data.sid = sid;

			data.arraySyntax = arraySyntax;
			data.memberSyntax = memberSyntax;

			data.sampler = parseId( xml.getAttribute( 'source' ) );

			return data;

		}

		function buildAnimation( data ) {

			const tracks = [];

			const channels = data.channels;
			const samplers = data.samplers;
			const sources = data.sources;

			for ( const target in channels ) {

				if ( channels.hasOwnProperty( target ) ) {

					const channel = channels[ target ];
					const sampler = samplers[ channel.sampler ];

					const inputId = sampler.inputs.INPUT;
					const outputId = sampler.inputs.OUTPUT;

					const inputSource = sources[ inputId ];
					const outputSource = sources[ outputId ];

					const animation = buildAnimationChannel( channel, inputSource, outputSource );

					createKeyframeTracks( animation, tracks );

				}

			}

			return tracks;

		}

		function getAnimation( id ) {

			return getBuild( library.animations[ id ], buildAnimation );

		}

		function buildAnimationChannel( channel, inputSource, outputSource ) {

			const node = library.nodes[ channel.id ];
			const object3D = getNode( node.id );

			const transform = node.transforms[ channel.sid ];
			const defaultMatrix = node.matrix.clone().transpose();

			let time, stride;
			let i, il, j, jl;

			const data = {};

			// the collada spec allows the animation of data in various ways.
			// depending on the transform type (matrix, translate, rotate, scale), we execute different logic

			switch ( transform ) {

				case 'matrix':

					for ( i = 0, il = inputSource.array.length; i < il; i ++ ) {

						time = inputSource.array[ i ];
						stride = i * outputSource.stride;

						if ( data[ time ] === undefined ) data[ time ] = {};

						if ( channel.arraySyntax === true ) {

							const value = outputSource.array[ stride ];
							const index = channel.indices[ 0 ] + 4 * channel.indices[ 1 ];

							data[ time ][ index ] = value;

						} else {

							for ( j = 0, jl = outputSource.stride; j < jl; j ++ ) {

								data[ time ][ j ] = outputSource.array[ stride + j ];

							}

						}

					}

					break;

				case 'translate':
					console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
					break;

				case 'rotate':
					console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
					break;

				case 'scale':
					console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
					break;

			}

			const keyframes = prepareAnimationData( data, defaultMatrix );

			const animation = {
				name: object3D.uuid,
				keyframes: keyframes
			};

			return animation;

		}

		function prepareAnimationData( data, defaultMatrix ) {

			const keyframes = [];

			// transfer data into a sortable array

			for ( const time in data ) {

				keyframes.push( { time: parseFloat( time ), value: data[ time ] } );

			}

			// ensure keyframes are sorted by time

			keyframes.sort( ascending );

			// now we clean up all animation data, so we can use them for keyframe tracks

			for ( let i = 0; i < 16; i ++ ) {

				transformAnimationData( keyframes, i, defaultMatrix.elements[ i ] );

			}

			return keyframes;

			// array sort function

			function ascending( a, b ) {

				return a.time - b.time;

			}

		}

		const position = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
		const scale = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
		const quaternion = new three__WEBPACK_IMPORTED_MODULE_0__.Quaternion();

		function createKeyframeTracks( animation, tracks ) {

			const keyframes = animation.keyframes;
			const name = animation.name;

			const times = [];
			const positionData = [];
			const quaternionData = [];
			const scaleData = [];

			for ( let i = 0, l = keyframes.length; i < l; i ++ ) {

				const keyframe = keyframes[ i ];

				const time = keyframe.time;
				const value = keyframe.value;

				matrix.fromArray( value ).transpose();
				matrix.decompose( position, quaternion, scale );

				times.push( time );
				positionData.push( position.x, position.y, position.z );
				quaternionData.push( quaternion.x, quaternion.y, quaternion.z, quaternion.w );
				scaleData.push( scale.x, scale.y, scale.z );

			}

			if ( positionData.length > 0 ) tracks.push( new three__WEBPACK_IMPORTED_MODULE_0__.VectorKeyframeTrack( name + '.position', times, positionData ) );
			if ( quaternionData.length > 0 ) tracks.push( new three__WEBPACK_IMPORTED_MODULE_0__.QuaternionKeyframeTrack( name + '.quaternion', times, quaternionData ) );
			if ( scaleData.length > 0 ) tracks.push( new three__WEBPACK_IMPORTED_MODULE_0__.VectorKeyframeTrack( name + '.scale', times, scaleData ) );

			return tracks;

		}

		function transformAnimationData( keyframes, property, defaultValue ) {

			let keyframe;

			let empty = true;
			let i, l;

			// check, if values of a property are missing in our keyframes

			for ( i = 0, l = keyframes.length; i < l; i ++ ) {

				keyframe = keyframes[ i ];

				if ( keyframe.value[ property ] === undefined ) {

					keyframe.value[ property ] = null; // mark as missing

				} else {

					empty = false;

				}

			}

			if ( empty === true ) {

				// no values at all, so we set a default value

				for ( i = 0, l = keyframes.length; i < l; i ++ ) {

					keyframe = keyframes[ i ];

					keyframe.value[ property ] = defaultValue;

				}

			} else {

				// filling gaps

				createMissingKeyframes( keyframes, property );

			}

		}

		function createMissingKeyframes( keyframes, property ) {

			let prev, next;

			for ( let i = 0, l = keyframes.length; i < l; i ++ ) {

				const keyframe = keyframes[ i ];

				if ( keyframe.value[ property ] === null ) {

					prev = getPrev( keyframes, i, property );
					next = getNext( keyframes, i, property );

					if ( prev === null ) {

						keyframe.value[ property ] = next.value[ property ];
						continue;

					}

					if ( next === null ) {

						keyframe.value[ property ] = prev.value[ property ];
						continue;

					}

					interpolate( keyframe, prev, next, property );

				}

			}

		}

		function getPrev( keyframes, i, property ) {

			while ( i >= 0 ) {

				const keyframe = keyframes[ i ];

				if ( keyframe.value[ property ] !== null ) return keyframe;

				i --;

			}

			return null;

		}

		function getNext( keyframes, i, property ) {

			while ( i < keyframes.length ) {

				const keyframe = keyframes[ i ];

				if ( keyframe.value[ property ] !== null ) return keyframe;

				i ++;

			}

			return null;

		}

		function interpolate( key, prev, next, property ) {

			if ( ( next.time - prev.time ) === 0 ) {

				key.value[ property ] = prev.value[ property ];
				return;

			}

			key.value[ property ] = ( ( key.time - prev.time ) * ( next.value[ property ] - prev.value[ property ] ) / ( next.time - prev.time ) ) + prev.value[ property ];

		}

		// animation clips

		function parseAnimationClip( xml ) {

			const data = {
				name: xml.getAttribute( 'id' ) || 'default',
				start: parseFloat( xml.getAttribute( 'start' ) || 0 ),
				end: parseFloat( xml.getAttribute( 'end' ) || 0 ),
				animations: []
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'instance_animation':
						data.animations.push( parseId( child.getAttribute( 'url' ) ) );
						break;

				}

			}

			library.clips[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildAnimationClip( data ) {

			const tracks = [];

			const name = data.name;
			const duration = ( data.end - data.start ) || - 1;
			const animations = data.animations;

			for ( let i = 0, il = animations.length; i < il; i ++ ) {

				const animationTracks = getAnimation( animations[ i ] );

				for ( let j = 0, jl = animationTracks.length; j < jl; j ++ ) {

					tracks.push( animationTracks[ j ] );

				}

			}

			return new three__WEBPACK_IMPORTED_MODULE_0__.AnimationClip( name, duration, tracks );

		}

		function getAnimationClip( id ) {

			return getBuild( library.clips[ id ], buildAnimationClip );

		}

		// controller

		function parseController( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'skin':
						// there is exactly one skin per controller
						data.id = parseId( child.getAttribute( 'source' ) );
						data.skin = parseSkin( child );
						break;

					case 'morph':
						data.id = parseId( child.getAttribute( 'source' ) );
						console.warn( 'THREE.ColladaLoader: Morph target animation not supported yet.' );
						break;

				}

			}

			library.controllers[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseSkin( xml ) {

			const data = {
				sources: {}
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'bind_shape_matrix':
						data.bindShapeMatrix = parseFloats( child.textContent );
						break;

					case 'source':
						const id = child.getAttribute( 'id' );
						data.sources[ id ] = parseSource( child );
						break;

					case 'joints':
						data.joints = parseJoints( child );
						break;

					case 'vertex_weights':
						data.vertexWeights = parseVertexWeights( child );
						break;

				}

			}

			return data;

		}

		function parseJoints( xml ) {

			const data = {
				inputs: {}
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						const semantic = child.getAttribute( 'semantic' );
						const id = parseId( child.getAttribute( 'source' ) );
						data.inputs[ semantic ] = id;
						break;

				}

			}

			return data;

		}

		function parseVertexWeights( xml ) {

			const data = {
				inputs: {}
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						const semantic = child.getAttribute( 'semantic' );
						const id = parseId( child.getAttribute( 'source' ) );
						const offset = parseInt( child.getAttribute( 'offset' ) );
						data.inputs[ semantic ] = { id: id, offset: offset };
						break;

					case 'vcount':
						data.vcount = parseInts( child.textContent );
						break;

					case 'v':
						data.v = parseInts( child.textContent );
						break;

				}

			}

			return data;

		}

		function buildController( data ) {

			const build = {
				id: data.id
			};

			const geometry = library.geometries[ build.id ];

			if ( data.skin !== undefined ) {

				build.skin = buildSkin( data.skin );

				// we enhance the 'sources' property of the corresponding geometry with our skin data

				geometry.sources.skinIndices = build.skin.indices;
				geometry.sources.skinWeights = build.skin.weights;

			}

			return build;

		}

		function buildSkin( data ) {

			const BONE_LIMIT = 4;

			const build = {
				joints: [], // this must be an array to preserve the joint order
				indices: {
					array: [],
					stride: BONE_LIMIT
				},
				weights: {
					array: [],
					stride: BONE_LIMIT
				}
			};

			const sources = data.sources;
			const vertexWeights = data.vertexWeights;

			const vcount = vertexWeights.vcount;
			const v = vertexWeights.v;
			const jointOffset = vertexWeights.inputs.JOINT.offset;
			const weightOffset = vertexWeights.inputs.WEIGHT.offset;

			const jointSource = data.sources[ data.joints.inputs.JOINT ];
			const inverseSource = data.sources[ data.joints.inputs.INV_BIND_MATRIX ];

			const weights = sources[ vertexWeights.inputs.WEIGHT.id ].array;
			let stride = 0;

			let i, j, l;

			// process skin data for each vertex

			for ( i = 0, l = vcount.length; i < l; i ++ ) {

				const jointCount = vcount[ i ]; // this is the amount of joints that affect a single vertex
				const vertexSkinData = [];

				for ( j = 0; j < jointCount; j ++ ) {

					const skinIndex = v[ stride + jointOffset ];
					const weightId = v[ stride + weightOffset ];
					const skinWeight = weights[ weightId ];

					vertexSkinData.push( { index: skinIndex, weight: skinWeight } );

					stride += 2;

				}

				// we sort the joints in descending order based on the weights.
				// this ensures, we only procced the most important joints of the vertex

				vertexSkinData.sort( descending );

				// now we provide for each vertex a set of four index and weight values.
				// the order of the skin data matches the order of vertices

				for ( j = 0; j < BONE_LIMIT; j ++ ) {

					const d = vertexSkinData[ j ];

					if ( d !== undefined ) {

						build.indices.array.push( d.index );
						build.weights.array.push( d.weight );

					} else {

						build.indices.array.push( 0 );
						build.weights.array.push( 0 );

					}

				}

			}

			// setup bind matrix

			if ( data.bindShapeMatrix ) {

				build.bindMatrix = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4().fromArray( data.bindShapeMatrix ).transpose();

			} else {

				build.bindMatrix = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4().identity();

			}

			// process bones and inverse bind matrix data

			for ( i = 0, l = jointSource.array.length; i < l; i ++ ) {

				const name = jointSource.array[ i ];
				const boneInverse = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4().fromArray( inverseSource.array, i * inverseSource.stride ).transpose();

				build.joints.push( { name: name, boneInverse: boneInverse } );

			}

			return build;

			// array sort function

			function descending( a, b ) {

				return b.weight - a.weight;

			}

		}

		function getController( id ) {

			return getBuild( library.controllers[ id ], buildController );

		}

		// image

		function parseImage( xml ) {

			const data = {
				init_from: getElementsByTagName( xml, 'init_from' )[ 0 ].textContent
			};

			library.images[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildImage( data ) {

			if ( data.build !== undefined ) return data.build;

			return data.init_from;

		}

		function getImage( id ) {

			const data = library.images[ id ];

			if ( data !== undefined ) {

				return getBuild( data, buildImage );

			}

			console.warn( 'THREE.ColladaLoader: Couldn\'t find image with ID:', id );

			return null;

		}

		// effect

		function parseEffect( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'profile_COMMON':
						data.profile = parseEffectProfileCOMMON( child );
						break;

				}

			}

			library.effects[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseEffectProfileCOMMON( xml ) {

			const data = {
				surfaces: {},
				samplers: {}
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'newparam':
						parseEffectNewparam( child, data );
						break;

					case 'technique':
						data.technique = parseEffectTechnique( child );
						break;

					case 'extra':
						data.extra = parseEffectExtra( child );
						break;

				}

			}

			return data;

		}

		function parseEffectNewparam( xml, data ) {

			const sid = xml.getAttribute( 'sid' );

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'surface':
						data.surfaces[ sid ] = parseEffectSurface( child );
						break;

					case 'sampler2D':
						data.samplers[ sid ] = parseEffectSampler( child );
						break;

				}

			}

		}

		function parseEffectSurface( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'init_from':
						data.init_from = child.textContent;
						break;

				}

			}

			return data;

		}

		function parseEffectSampler( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'source':
						data.source = child.textContent;
						break;

				}

			}

			return data;

		}

		function parseEffectTechnique( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'constant':
					case 'lambert':
					case 'blinn':
					case 'phong':
						data.type = child.nodeName;
						data.parameters = parseEffectParameters( child );
						break;

					case 'extra':
						data.extra = parseEffectExtra( child );
						break;

				}

			}

			return data;

		}

		function parseEffectParameters( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'emission':
					case 'diffuse':
					case 'specular':
					case 'bump':
					case 'ambient':
					case 'shininess':
					case 'transparency':
						data[ child.nodeName ] = parseEffectParameter( child );
						break;
					case 'transparent':
						data[ child.nodeName ] = {
							opaque: child.hasAttribute( 'opaque' ) ? child.getAttribute( 'opaque' ) : 'A_ONE',
							data: parseEffectParameter( child )
						};
						break;

				}

			}

			return data;

		}

		function parseEffectParameter( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'color':
						data[ child.nodeName ] = parseFloats( child.textContent );
						break;

					case 'float':
						data[ child.nodeName ] = parseFloat( child.textContent );
						break;

					case 'texture':
						data[ child.nodeName ] = { id: child.getAttribute( 'texture' ), extra: parseEffectParameterTexture( child ) };
						break;

				}

			}

			return data;

		}

		function parseEffectParameterTexture( xml ) {

			const data = {
				technique: {}
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'extra':
						parseEffectParameterTextureExtra( child, data );
						break;

				}

			}

			return data;

		}

		function parseEffectParameterTextureExtra( xml, data ) {

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique':
						parseEffectParameterTextureExtraTechnique( child, data );
						break;

				}

			}

		}

		function parseEffectParameterTextureExtraTechnique( xml, data ) {

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'repeatU':
					case 'repeatV':
					case 'offsetU':
					case 'offsetV':
						data.technique[ child.nodeName ] = parseFloat( child.textContent );
						break;

					case 'wrapU':
					case 'wrapV':

						// some files have values for wrapU/wrapV which become NaN via parseInt

						if ( child.textContent.toUpperCase() === 'TRUE' ) {

							data.technique[ child.nodeName ] = 1;

						} else if ( child.textContent.toUpperCase() === 'FALSE' ) {

							data.technique[ child.nodeName ] = 0;

						} else {

							data.technique[ child.nodeName ] = parseInt( child.textContent );

						}

						break;

					case 'bump':
						data[ child.nodeName ] = parseEffectExtraTechniqueBump( child );
						break;

				}

			}

		}

		function parseEffectExtra( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique':
						data.technique = parseEffectExtraTechnique( child );
						break;

				}

			}

			return data;

		}

		function parseEffectExtraTechnique( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'double_sided':
						data[ child.nodeName ] = parseInt( child.textContent );
						break;

					case 'bump':
						data[ child.nodeName ] = parseEffectExtraTechniqueBump( child );
						break;

				}

			}

			return data;

		}

		function parseEffectExtraTechniqueBump( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'texture':
						data[ child.nodeName ] = { id: child.getAttribute( 'texture' ), texcoord: child.getAttribute( 'texcoord' ), extra: parseEffectParameterTexture( child ) };
						break;

				}

			}

			return data;

		}

		function buildEffect( data ) {

			return data;

		}

		function getEffect( id ) {

			return getBuild( library.effects[ id ], buildEffect );

		}

		// material

		function parseMaterial( xml ) {

			const data = {
				name: xml.getAttribute( 'name' )
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'instance_effect':
						data.url = parseId( child.getAttribute( 'url' ) );
						break;

				}

			}

			library.materials[ xml.getAttribute( 'id' ) ] = data;

		}

		function getTextureLoader( image ) {

			let loader;

			let extension = image.slice( ( image.lastIndexOf( '.' ) - 1 >>> 0 ) + 2 ); // http://www.jstips.co/en/javascript/get-file-extension/
			extension = extension.toLowerCase();

			switch ( extension ) {

				case 'tga':
					loader = tgaLoader;
					break;

				default:
					loader = textureLoader;

			}

			return loader;

		}

		function buildMaterial( data ) {

			const effect = getEffect( data.url );
			const technique = effect.profile.technique;

			let material;

			switch ( technique.type ) {

				case 'phong':
				case 'blinn':
					material = new three__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial();
					break;

				case 'lambert':
					material = new three__WEBPACK_IMPORTED_MODULE_0__.MeshLambertMaterial();
					break;

				default:
					material = new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial();
					break;

			}

			material.name = data.name || '';

			function getTexture( textureObject, colorSpace = null ) {

				const sampler = effect.profile.samplers[ textureObject.id ];
				let image = null;

				// get image

				if ( sampler !== undefined ) {

					const surface = effect.profile.surfaces[ sampler.source ];
					image = getImage( surface.init_from );

				} else {

					console.warn( 'THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530).' );
					image = getImage( textureObject.id );

				}

				// create texture if image is avaiable

				if ( image !== null ) {

					const loader = getTextureLoader( image );

					if ( loader !== undefined ) {

						const texture = loader.load( image );

						const extra = textureObject.extra;

						if ( extra !== undefined && extra.technique !== undefined && isEmpty( extra.technique ) === false ) {

							const technique = extra.technique;

							texture.wrapS = technique.wrapU ? three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping : three__WEBPACK_IMPORTED_MODULE_0__.ClampToEdgeWrapping;
							texture.wrapT = technique.wrapV ? three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping : three__WEBPACK_IMPORTED_MODULE_0__.ClampToEdgeWrapping;

							texture.offset.set( technique.offsetU || 0, technique.offsetV || 0 );
							texture.repeat.set( technique.repeatU || 1, technique.repeatV || 1 );

						} else {

							texture.wrapS = three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;
							texture.wrapT = three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping;

						}

						if ( colorSpace !== null ) {

							texture.colorSpace = colorSpace;

						}

						return texture;

					} else {

						console.warn( 'THREE.ColladaLoader: Loader for texture %s not found.', image );

						return null;

					}

				} else {

					console.warn( 'THREE.ColladaLoader: Couldn\'t create texture with ID:', textureObject.id );

					return null;

				}

			}

			const parameters = technique.parameters;

			for ( const key in parameters ) {

				const parameter = parameters[ key ];

				switch ( key ) {

					case 'diffuse':
						if ( parameter.color ) material.color.fromArray( parameter.color );
						if ( parameter.texture ) material.map = getTexture( parameter.texture, three__WEBPACK_IMPORTED_MODULE_0__.SRGBColorSpace );
						break;
					case 'specular':
						if ( parameter.color && material.specular ) material.specular.fromArray( parameter.color );
						if ( parameter.texture ) material.specularMap = getTexture( parameter.texture );
						break;
					case 'bump':
						if ( parameter.texture ) material.normalMap = getTexture( parameter.texture );
						break;
					case 'ambient':
						if ( parameter.texture ) material.lightMap = getTexture( parameter.texture, three__WEBPACK_IMPORTED_MODULE_0__.SRGBColorSpace );
						break;
					case 'shininess':
						if ( parameter.float && material.shininess ) material.shininess = parameter.float;
						break;
					case 'emission':
						if ( parameter.color && material.emissive ) material.emissive.fromArray( parameter.color );
						if ( parameter.texture ) material.emissiveMap = getTexture( parameter.texture, three__WEBPACK_IMPORTED_MODULE_0__.SRGBColorSpace );
						break;

				}

			}

			material.color.convertSRGBToLinear();
			if ( material.specular ) material.specular.convertSRGBToLinear();
			if ( material.emissive ) material.emissive.convertSRGBToLinear();

			//

			let transparent = parameters[ 'transparent' ];
			let transparency = parameters[ 'transparency' ];

			// <transparency> does not exist but <transparent>

			if ( transparency === undefined && transparent ) {

				transparency = {
					float: 1
				};

			}

			// <transparent> does not exist but <transparency>

			if ( transparent === undefined && transparency ) {

				transparent = {
					opaque: 'A_ONE',
					data: {
						color: [ 1, 1, 1, 1 ]
					} };

			}

			if ( transparent && transparency ) {

				// handle case if a texture exists but no color

				if ( transparent.data.texture ) {

					// we do not set an alpha map (see #13792)

					material.transparent = true;

				} else {

					const color = transparent.data.color;

					switch ( transparent.opaque ) {

						case 'A_ONE':
							material.opacity = color[ 3 ] * transparency.float;
							break;
						case 'RGB_ZERO':
							material.opacity = 1 - ( color[ 0 ] * transparency.float );
							break;
						case 'A_ZERO':
							material.opacity = 1 - ( color[ 3 ] * transparency.float );
							break;
						case 'RGB_ONE':
							material.opacity = color[ 0 ] * transparency.float;
							break;
						default:
							console.warn( 'THREE.ColladaLoader: Invalid opaque type "%s" of transparent tag.', transparent.opaque );

					}

					if ( material.opacity < 1 ) material.transparent = true;

				}

			}

			//


			if ( technique.extra !== undefined && technique.extra.technique !== undefined ) {

				const techniques = technique.extra.technique;

				for ( const k in techniques ) {

					const v = techniques[ k ];

					switch ( k ) {

						case 'double_sided':
							material.side = ( v === 1 ? three__WEBPACK_IMPORTED_MODULE_0__.DoubleSide : three__WEBPACK_IMPORTED_MODULE_0__.FrontSide );
							break;

						case 'bump':
							material.normalMap = getTexture( v.texture );
							material.normalScale = new three__WEBPACK_IMPORTED_MODULE_0__.Vector2( 1, 1 );
							break;

					}

				}

			}

			return material;

		}

		function getMaterial( id ) {

			return getBuild( library.materials[ id ], buildMaterial );

		}

		// camera

		function parseCamera( xml ) {

			const data = {
				name: xml.getAttribute( 'name' )
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'optics':
						data.optics = parseCameraOptics( child );
						break;

				}

			}

			library.cameras[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseCameraOptics( xml ) {

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'technique_common':
						return parseCameraTechnique( child );

				}

			}

			return {};

		}

		function parseCameraTechnique( xml ) {

			const data = {};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'perspective':
					case 'orthographic':

						data.technique = child.nodeName;
						data.parameters = parseCameraParameters( child );

						break;

				}

			}

			return data;

		}

		function parseCameraParameters( xml ) {

			const data = {};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'xfov':
					case 'yfov':
					case 'xmag':
					case 'ymag':
					case 'znear':
					case 'zfar':
					case 'aspect_ratio':
						data[ child.nodeName ] = parseFloat( child.textContent );
						break;

				}

			}

			return data;

		}

		function buildCamera( data ) {

			let camera;

			switch ( data.optics.technique ) {

				case 'perspective':
					camera = new three__WEBPACK_IMPORTED_MODULE_0__.PerspectiveCamera(
						data.optics.parameters.yfov,
						data.optics.parameters.aspect_ratio,
						data.optics.parameters.znear,
						data.optics.parameters.zfar
					);
					break;

				case 'orthographic':
					let ymag = data.optics.parameters.ymag;
					let xmag = data.optics.parameters.xmag;
					const aspectRatio = data.optics.parameters.aspect_ratio;

					xmag = ( xmag === undefined ) ? ( ymag * aspectRatio ) : xmag;
					ymag = ( ymag === undefined ) ? ( xmag / aspectRatio ) : ymag;

					xmag *= 0.5;
					ymag *= 0.5;

					camera = new three__WEBPACK_IMPORTED_MODULE_0__.OrthographicCamera(
						- xmag, xmag, ymag, - ymag, // left, right, top, bottom
						data.optics.parameters.znear,
						data.optics.parameters.zfar
					);
					break;

				default:
					camera = new three__WEBPACK_IMPORTED_MODULE_0__.PerspectiveCamera();
					break;

			}

			camera.name = data.name || '';

			return camera;

		}

		function getCamera( id ) {

			const data = library.cameras[ id ];

			if ( data !== undefined ) {

				return getBuild( data, buildCamera );

			}

			console.warn( 'THREE.ColladaLoader: Couldn\'t find camera with ID:', id );

			return null;

		}

		// light

		function parseLight( xml ) {

			let data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique_common':
						data = parseLightTechnique( child );
						break;

				}

			}

			library.lights[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseLightTechnique( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'directional':
					case 'point':
					case 'spot':
					case 'ambient':

						data.technique = child.nodeName;
						data.parameters = parseLightParameters( child );

				}

			}

			return data;

		}

		function parseLightParameters( xml ) {

			const data = {};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'color':
						const array = parseFloats( child.textContent );
						data.color = new three__WEBPACK_IMPORTED_MODULE_0__.Color().fromArray( array ).convertSRGBToLinear();
						break;

					case 'falloff_angle':
						data.falloffAngle = parseFloat( child.textContent );
						break;

					case 'quadratic_attenuation':
						const f = parseFloat( child.textContent );
						data.distance = f ? Math.sqrt( 1 / f ) : 0;
						break;

				}

			}

			return data;

		}

		function buildLight( data ) {

			let light;

			switch ( data.technique ) {

				case 'directional':
					light = new three__WEBPACK_IMPORTED_MODULE_0__.DirectionalLight();
					break;

				case 'point':
					light = new three__WEBPACK_IMPORTED_MODULE_0__.PointLight();
					break;

				case 'spot':
					light = new three__WEBPACK_IMPORTED_MODULE_0__.SpotLight();
					break;

				case 'ambient':
					light = new three__WEBPACK_IMPORTED_MODULE_0__.AmbientLight();
					break;

			}

			if ( data.parameters.color ) light.color.copy( data.parameters.color );
			if ( data.parameters.distance ) light.distance = data.parameters.distance;

			return light;

		}

		function getLight( id ) {

			const data = library.lights[ id ];

			if ( data !== undefined ) {

				return getBuild( data, buildLight );

			}

			console.warn( 'THREE.ColladaLoader: Couldn\'t find light with ID:', id );

			return null;

		}

		// geometry

		function parseGeometry( xml ) {

			const data = {
				name: xml.getAttribute( 'name' ),
				sources: {},
				vertices: {},
				primitives: []
			};

			const mesh = getElementsByTagName( xml, 'mesh' )[ 0 ];

			// the following tags inside geometry are not supported yet (see https://github.com/mrdoob/three.js/pull/12606): convex_mesh, spline, brep
			if ( mesh === undefined ) return;

			for ( let i = 0; i < mesh.childNodes.length; i ++ ) {

				const child = mesh.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				const id = child.getAttribute( 'id' );

				switch ( child.nodeName ) {

					case 'source':
						data.sources[ id ] = parseSource( child );
						break;

					case 'vertices':
						// data.sources[ id ] = data.sources[ parseId( getElementsByTagName( child, 'input' )[ 0 ].getAttribute( 'source' ) ) ];
						data.vertices = parseGeometryVertices( child );
						break;

					case 'polygons':
						console.warn( 'THREE.ColladaLoader: Unsupported primitive type: ', child.nodeName );
						break;

					case 'lines':
					case 'linestrips':
					case 'polylist':
					case 'triangles':
						data.primitives.push( parseGeometryPrimitive( child ) );
						break;

					default:
						console.log( child );

				}

			}

			library.geometries[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseSource( xml ) {

			const data = {
				array: [],
				stride: 3
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'float_array':
						data.array = parseFloats( child.textContent );
						break;

					case 'Name_array':
						data.array = parseStrings( child.textContent );
						break;

					case 'technique_common':
						const accessor = getElementsByTagName( child, 'accessor' )[ 0 ];

						if ( accessor !== undefined ) {

							data.stride = parseInt( accessor.getAttribute( 'stride' ) );

						}

						break;

				}

			}

			return data;

		}

		function parseGeometryVertices( xml ) {

			const data = {};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				data[ child.getAttribute( 'semantic' ) ] = parseId( child.getAttribute( 'source' ) );

			}

			return data;

		}

		function parseGeometryPrimitive( xml ) {

			const primitive = {
				type: xml.nodeName,
				material: xml.getAttribute( 'material' ),
				count: parseInt( xml.getAttribute( 'count' ) ),
				inputs: {},
				stride: 0,
				hasUV: false
			};

			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						const id = parseId( child.getAttribute( 'source' ) );
						const semantic = child.getAttribute( 'semantic' );
						const offset = parseInt( child.getAttribute( 'offset' ) );
						const set = parseInt( child.getAttribute( 'set' ) );
						const inputname = ( set > 0 ? semantic + set : semantic );
						primitive.inputs[ inputname ] = { id: id, offset: offset };
						primitive.stride = Math.max( primitive.stride, offset + 1 );
						if ( semantic === 'TEXCOORD' ) primitive.hasUV = true;
						break;

					case 'vcount':
						primitive.vcount = parseInts( child.textContent );
						break;

					case 'p':
						primitive.p = parseInts( child.textContent );
						break;

				}

			}

			return primitive;

		}

		function groupPrimitives( primitives ) {

			const build = {};

			for ( let i = 0; i < primitives.length; i ++ ) {

				const primitive = primitives[ i ];

				if ( build[ primitive.type ] === undefined ) build[ primitive.type ] = [];

				build[ primitive.type ].push( primitive );

			}

			return build;

		}

		function checkUVCoordinates( primitives ) {

			let count = 0;

			for ( let i = 0, l = primitives.length; i < l; i ++ ) {

				const primitive = primitives[ i ];

				if ( primitive.hasUV === true ) {

					count ++;

				}

			}

			if ( count > 0 && count < primitives.length ) {

				primitives.uvsNeedsFix = true;

			}

		}

		function buildGeometry( data ) {

			const build = {};

			const sources = data.sources;
			const vertices = data.vertices;
			const primitives = data.primitives;

			if ( primitives.length === 0 ) return {};

			// our goal is to create one buffer geometry for a single type of primitives
			// first, we group all primitives by their type

			const groupedPrimitives = groupPrimitives( primitives );

			for ( const type in groupedPrimitives ) {

				const primitiveType = groupedPrimitives[ type ];

				// second, ensure consistent uv coordinates for each type of primitives (polylist,triangles or lines)

				checkUVCoordinates( primitiveType );

				// third, create a buffer geometry for each type of primitives

				build[ type ] = buildGeometryType( primitiveType, sources, vertices );

			}

			return build;

		}

		function buildGeometryType( primitives, sources, vertices ) {

			const build = {};

			const position = { array: [], stride: 0 };
			const normal = { array: [], stride: 0 };
			const uv = { array: [], stride: 0 };
			const uv1 = { array: [], stride: 0 };
			const color = { array: [], stride: 0 };

			const skinIndex = { array: [], stride: 4 };
			const skinWeight = { array: [], stride: 4 };

			const geometry = new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry();

			const materialKeys = [];

			let start = 0;

			for ( let p = 0; p < primitives.length; p ++ ) {

				const primitive = primitives[ p ];
				const inputs = primitive.inputs;

				// groups

				let count = 0;

				switch ( primitive.type ) {

					case 'lines':
					case 'linestrips':
						count = primitive.count * 2;
						break;

					case 'triangles':
						count = primitive.count * 3;
						break;

					case 'polylist':

						for ( let g = 0; g < primitive.count; g ++ ) {

							const vc = primitive.vcount[ g ];

							switch ( vc ) {

								case 3:
									count += 3; // single triangle
									break;

								case 4:
									count += 6; // quad, subdivided into two triangles
									break;

								default:
									count += ( vc - 2 ) * 3; // polylist with more than four vertices
									break;

							}

						}

						break;

					default:
						console.warn( 'THREE.ColladaLoader: Unknow primitive type:', primitive.type );

				}

				geometry.addGroup( start, count, p );
				start += count;

				// material

				if ( primitive.material ) {

					materialKeys.push( primitive.material );

				}

				// geometry data

				for ( const name in inputs ) {

					const input = inputs[ name ];

					switch ( name )	{

						case 'VERTEX':
							for ( const key in vertices ) {

								const id = vertices[ key ];

								switch ( key ) {

									case 'POSITION':
										const prevLength = position.array.length;
										buildGeometryData( primitive, sources[ id ], input.offset, position.array );
										position.stride = sources[ id ].stride;

										if ( sources.skinWeights && sources.skinIndices ) {

											buildGeometryData( primitive, sources.skinIndices, input.offset, skinIndex.array );
											buildGeometryData( primitive, sources.skinWeights, input.offset, skinWeight.array );

										}

										// see #3803

										if ( primitive.hasUV === false && primitives.uvsNeedsFix === true ) {

											const count = ( position.array.length - prevLength ) / position.stride;

											for ( let i = 0; i < count; i ++ ) {

												// fill missing uv coordinates

												uv.array.push( 0, 0 );

											}

										}

										break;

									case 'NORMAL':
										buildGeometryData( primitive, sources[ id ], input.offset, normal.array );
										normal.stride = sources[ id ].stride;
										break;

									case 'COLOR':
										buildGeometryData( primitive, sources[ id ], input.offset, color.array );
										color.stride = sources[ id ].stride;
										break;

									case 'TEXCOORD':
										buildGeometryData( primitive, sources[ id ], input.offset, uv.array );
										uv.stride = sources[ id ].stride;
										break;

									case 'TEXCOORD1':
										buildGeometryData( primitive, sources[ id ], input.offset, uv1.array );
										uv.stride = sources[ id ].stride;
										break;

									default:
										console.warn( 'THREE.ColladaLoader: Semantic "%s" not handled in geometry build process.', key );

								}

							}

							break;

						case 'NORMAL':
							buildGeometryData( primitive, sources[ input.id ], input.offset, normal.array );
							normal.stride = sources[ input.id ].stride;
							break;

						case 'COLOR':
							buildGeometryData( primitive, sources[ input.id ], input.offset, color.array, true );
							color.stride = sources[ input.id ].stride;
							break;

						case 'TEXCOORD':
							buildGeometryData( primitive, sources[ input.id ], input.offset, uv.array );
							uv.stride = sources[ input.id ].stride;
							break;

						case 'TEXCOORD1':
							buildGeometryData( primitive, sources[ input.id ], input.offset, uv1.array );
							uv1.stride = sources[ input.id ].stride;
							break;

					}

				}

			}

			// build geometry

			if ( position.array.length > 0 ) geometry.setAttribute( 'position', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( position.array, position.stride ) );
			if ( normal.array.length > 0 ) geometry.setAttribute( 'normal', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( normal.array, normal.stride ) );
			if ( color.array.length > 0 ) geometry.setAttribute( 'color', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( color.array, color.stride ) );
			if ( uv.array.length > 0 ) geometry.setAttribute( 'uv', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( uv.array, uv.stride ) );
			if ( uv1.array.length > 0 ) geometry.setAttribute( 'uv1', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( uv1.array, uv1.stride ) );

			if ( skinIndex.array.length > 0 ) geometry.setAttribute( 'skinIndex', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( skinIndex.array, skinIndex.stride ) );
			if ( skinWeight.array.length > 0 ) geometry.setAttribute( 'skinWeight', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( skinWeight.array, skinWeight.stride ) );

			build.data = geometry;
			build.type = primitives[ 0 ].type;
			build.materialKeys = materialKeys;

			return build;

		}

		function buildGeometryData( primitive, source, offset, array, isColor = false ) {

			const indices = primitive.p;
			const stride = primitive.stride;
			const vcount = primitive.vcount;

			function pushVector( i ) {

				let index = indices[ i + offset ] * sourceStride;
				const length = index + sourceStride;

				for ( ; index < length; index ++ ) {

					array.push( sourceArray[ index ] );

				}

				if ( isColor ) {

					// convert the vertex colors from srgb to linear if present
					const startIndex = array.length - sourceStride - 1;
					tempColor.setRGB(
						array[ startIndex + 0 ],
						array[ startIndex + 1 ],
						array[ startIndex + 2 ]
					).convertSRGBToLinear();

					array[ startIndex + 0 ] = tempColor.r;
					array[ startIndex + 1 ] = tempColor.g;
					array[ startIndex + 2 ] = tempColor.b;

				}

			}

			const sourceArray = source.array;
			const sourceStride = source.stride;

			if ( primitive.vcount !== undefined ) {

				let index = 0;

				for ( let i = 0, l = vcount.length; i < l; i ++ ) {

					const count = vcount[ i ];

					if ( count === 4 ) {

						const a = index + stride * 0;
						const b = index + stride * 1;
						const c = index + stride * 2;
						const d = index + stride * 3;

						pushVector( a ); pushVector( b ); pushVector( d );
						pushVector( b ); pushVector( c ); pushVector( d );

					} else if ( count === 3 ) {

						const a = index + stride * 0;
						const b = index + stride * 1;
						const c = index + stride * 2;

						pushVector( a ); pushVector( b ); pushVector( c );

					} else if ( count > 4 ) {

						for ( let k = 1, kl = ( count - 2 ); k <= kl; k ++ ) {

							const a = index + stride * 0;
							const b = index + stride * k;
							const c = index + stride * ( k + 1 );

							pushVector( a ); pushVector( b ); pushVector( c );

						}

					}

					index += stride * count;

				}

			} else {

				for ( let i = 0, l = indices.length; i < l; i += stride ) {

					pushVector( i );

				}

			}

		}

		function getGeometry( id ) {

			return getBuild( library.geometries[ id ], buildGeometry );

		}

		// kinematics

		function parseKinematicsModel( xml ) {

			const data = {
				name: xml.getAttribute( 'name' ) || '',
				joints: {},
				links: []
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique_common':
						parseKinematicsTechniqueCommon( child, data );
						break;

				}

			}

			library.kinematicsModels[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildKinematicsModel( data ) {

			if ( data.build !== undefined ) return data.build;

			return data;

		}

		function getKinematicsModel( id ) {

			return getBuild( library.kinematicsModels[ id ], buildKinematicsModel );

		}

		function parseKinematicsTechniqueCommon( xml, data ) {

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'joint':
						data.joints[ child.getAttribute( 'sid' ) ] = parseKinematicsJoint( child );
						break;

					case 'link':
						data.links.push( parseKinematicsLink( child ) );
						break;

				}

			}

		}

		function parseKinematicsJoint( xml ) {

			let data;

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'prismatic':
					case 'revolute':
						data = parseKinematicsJointParameter( child );
						break;

				}

			}

			return data;

		}

		function parseKinematicsJointParameter( xml ) {

			const data = {
				sid: xml.getAttribute( 'sid' ),
				name: xml.getAttribute( 'name' ) || '',
				axis: new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(),
				limits: {
					min: 0,
					max: 0
				},
				type: xml.nodeName,
				static: false,
				zeroPosition: 0,
				middlePosition: 0
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'axis':
						const array = parseFloats( child.textContent );
						data.axis.fromArray( array );
						break;
					case 'limits':
						const max = child.getElementsByTagName( 'max' )[ 0 ];
						const min = child.getElementsByTagName( 'min' )[ 0 ];

						data.limits.max = parseFloat( max.textContent );
						data.limits.min = parseFloat( min.textContent );
						break;

				}

			}

			// if min is equal to or greater than max, consider the joint static

			if ( data.limits.min >= data.limits.max ) {

				data.static = true;

			}

			// calculate middle position

			data.middlePosition = ( data.limits.min + data.limits.max ) / 2.0;

			return data;

		}

		function parseKinematicsLink( xml ) {

			const data = {
				sid: xml.getAttribute( 'sid' ),
				name: xml.getAttribute( 'name' ) || '',
				attachments: [],
				transforms: []
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'attachment_full':
						data.attachments.push( parseKinematicsAttachment( child ) );
						break;

					case 'matrix':
					case 'translate':
					case 'rotate':
						data.transforms.push( parseKinematicsTransform( child ) );
						break;

				}

			}

			return data;

		}

		function parseKinematicsAttachment( xml ) {

			const data = {
				joint: xml.getAttribute( 'joint' ).split( '/' ).pop(),
				transforms: [],
				links: []
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'link':
						data.links.push( parseKinematicsLink( child ) );
						break;

					case 'matrix':
					case 'translate':
					case 'rotate':
						data.transforms.push( parseKinematicsTransform( child ) );
						break;

				}

			}

			return data;

		}

		function parseKinematicsTransform( xml ) {

			const data = {
				type: xml.nodeName
			};

			const array = parseFloats( xml.textContent );

			switch ( data.type ) {

				case 'matrix':
					data.obj = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
					data.obj.fromArray( array ).transpose();
					break;

				case 'translate':
					data.obj = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
					data.obj.fromArray( array );
					break;

				case 'rotate':
					data.obj = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
					data.obj.fromArray( array );
					data.angle = three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad( array[ 3 ] );
					break;

			}

			return data;

		}

		// physics

		function parsePhysicsModel( xml ) {

			const data = {
				name: xml.getAttribute( 'name' ) || '',
				rigidBodies: {}
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'rigid_body':
						data.rigidBodies[ child.getAttribute( 'name' ) ] = {};
						parsePhysicsRigidBody( child, data.rigidBodies[ child.getAttribute( 'name' ) ] );
						break;

				}

			}

			library.physicsModels[ xml.getAttribute( 'id' ) ] = data;

		}

		function parsePhysicsRigidBody( xml, data ) {

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique_common':
						parsePhysicsTechniqueCommon( child, data );
						break;

				}

			}

		}

		function parsePhysicsTechniqueCommon( xml, data ) {

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'inertia':
						data.inertia = parseFloats( child.textContent );
						break;

					case 'mass':
						data.mass = parseFloats( child.textContent )[ 0 ];
						break;

				}

			}

		}

		// scene

		function parseKinematicsScene( xml ) {

			const data = {
				bindJointAxis: []
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'bind_joint_axis':
						data.bindJointAxis.push( parseKinematicsBindJointAxis( child ) );
						break;

				}

			}

			library.kinematicsScenes[ parseId( xml.getAttribute( 'url' ) ) ] = data;

		}

		function parseKinematicsBindJointAxis( xml ) {

			const data = {
				target: xml.getAttribute( 'target' ).split( '/' ).pop()
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'axis':
						const param = child.getElementsByTagName( 'param' )[ 0 ];
						data.axis = param.textContent;
						const tmpJointIndex = data.axis.split( 'inst_' ).pop().split( 'axis' )[ 0 ];
						data.jointIndex = tmpJointIndex.substring( 0, tmpJointIndex.length - 1 );
						break;

				}

			}

			return data;

		}

		function buildKinematicsScene( data ) {

			if ( data.build !== undefined ) return data.build;

			return data;

		}

		function getKinematicsScene( id ) {

			return getBuild( library.kinematicsScenes[ id ], buildKinematicsScene );

		}

		function setupKinematics() {

			const kinematicsModelId = Object.keys( library.kinematicsModels )[ 0 ];
			const kinematicsSceneId = Object.keys( library.kinematicsScenes )[ 0 ];
			const visualSceneId = Object.keys( library.visualScenes )[ 0 ];

			if ( kinematicsModelId === undefined || kinematicsSceneId === undefined ) return;

			const kinematicsModel = getKinematicsModel( kinematicsModelId );
			const kinematicsScene = getKinematicsScene( kinematicsSceneId );
			const visualScene = getVisualScene( visualSceneId );

			const bindJointAxis = kinematicsScene.bindJointAxis;
			const jointMap = {};

			for ( let i = 0, l = bindJointAxis.length; i < l; i ++ ) {

				const axis = bindJointAxis[ i ];

				// the result of the following query is an element of type 'translate', 'rotate','scale' or 'matrix'

				const targetElement = collada.querySelector( '[sid="' + axis.target + '"]' );

				if ( targetElement ) {

					// get the parent of the transform element

					const parentVisualElement = targetElement.parentElement;

					// connect the joint of the kinematics model with the element in the visual scene

					connect( axis.jointIndex, parentVisualElement );

				}

			}

			function connect( jointIndex, visualElement ) {

				const visualElementName = visualElement.getAttribute( 'name' );
				const joint = kinematicsModel.joints[ jointIndex ];

				visualScene.traverse( function ( object ) {

					if ( object.name === visualElementName ) {

						jointMap[ jointIndex ] = {
							object: object,
							transforms: buildTransformList( visualElement ),
							joint: joint,
							position: joint.zeroPosition
						};

					}

				} );

			}

			const m0 = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();

			kinematics = {

				joints: kinematicsModel && kinematicsModel.joints,

				getJointValue: function ( jointIndex ) {

					const jointData = jointMap[ jointIndex ];

					if ( jointData ) {

						return jointData.position;

					} else {

						console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' doesn\'t exist.' );

					}

				},

				setJointValue: function ( jointIndex, value ) {

					const jointData = jointMap[ jointIndex ];

					if ( jointData ) {

						const joint = jointData.joint;

						if ( value > joint.limits.max || value < joint.limits.min ) {

							console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' value ' + value + ' outside of limits (min: ' + joint.limits.min + ', max: ' + joint.limits.max + ').' );

						} else if ( joint.static ) {

							console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' is static.' );

						} else {

							const object = jointData.object;
							const axis = joint.axis;
							const transforms = jointData.transforms;

							matrix.identity();

							// each update, we have to apply all transforms in the correct order

							for ( let i = 0; i < transforms.length; i ++ ) {

								const transform = transforms[ i ];

								// if there is a connection of the transform node with a joint, apply the joint value

								if ( transform.sid && transform.sid.indexOf( jointIndex ) !== - 1 ) {

									switch ( joint.type ) {

										case 'revolute':
											matrix.multiply( m0.makeRotationAxis( axis, three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad( value ) ) );
											break;

										case 'prismatic':
											matrix.multiply( m0.makeTranslation( axis.x * value, axis.y * value, axis.z * value ) );
											break;

										default:
											console.warn( 'THREE.ColladaLoader: Unknown joint type: ' + joint.type );
											break;

									}

								} else {

									switch ( transform.type ) {

										case 'matrix':
											matrix.multiply( transform.obj );
											break;

										case 'translate':
											matrix.multiply( m0.makeTranslation( transform.obj.x, transform.obj.y, transform.obj.z ) );
											break;

										case 'scale':
											matrix.scale( transform.obj );
											break;

										case 'rotate':
											matrix.multiply( m0.makeRotationAxis( transform.obj, transform.angle ) );
											break;

									}

								}

							}

							object.matrix.copy( matrix );
							object.matrix.decompose( object.position, object.quaternion, object.scale );

							jointMap[ jointIndex ].position = value;

						}

					} else {

						console.log( 'THREE.ColladaLoader: ' + jointIndex + ' does not exist.' );

					}

				}

			};

		}

		function buildTransformList( node ) {

			const transforms = [];

			const xml = collada.querySelector( '[id="' + node.id + '"]' );

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				let array, vector;

				switch ( child.nodeName ) {

					case 'matrix':
						array = parseFloats( child.textContent );
						const matrix = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4().fromArray( array ).transpose();
						transforms.push( {
							sid: child.getAttribute( 'sid' ),
							type: child.nodeName,
							obj: matrix
						} );
						break;

					case 'translate':
					case 'scale':
						array = parseFloats( child.textContent );
						vector = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3().fromArray( array );
						transforms.push( {
							sid: child.getAttribute( 'sid' ),
							type: child.nodeName,
							obj: vector
						} );
						break;

					case 'rotate':
						array = parseFloats( child.textContent );
						vector = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3().fromArray( array );
						const angle = three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad( array[ 3 ] );
						transforms.push( {
							sid: child.getAttribute( 'sid' ),
							type: child.nodeName,
							obj: vector,
							angle: angle
						} );
						break;

				}

			}

			return transforms;

		}

		// nodes

		function prepareNodes( xml ) {

			const elements = xml.getElementsByTagName( 'node' );

			// ensure all node elements have id attributes

			for ( let i = 0; i < elements.length; i ++ ) {

				const element = elements[ i ];

				if ( element.hasAttribute( 'id' ) === false ) {

					element.setAttribute( 'id', generateId() );

				}

			}

		}

		const matrix = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
		const vector = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

		function parseNode( xml ) {

			const data = {
				name: xml.getAttribute( 'name' ) || '',
				type: xml.getAttribute( 'type' ),
				id: xml.getAttribute( 'id' ),
				sid: xml.getAttribute( 'sid' ),
				matrix: new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4(),
				nodes: [],
				instanceCameras: [],
				instanceControllers: [],
				instanceLights: [],
				instanceGeometries: [],
				instanceNodes: [],
				transforms: {}
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				let array;

				switch ( child.nodeName ) {

					case 'node':
						data.nodes.push( child.getAttribute( 'id' ) );
						parseNode( child );
						break;

					case 'instance_camera':
						data.instanceCameras.push( parseId( child.getAttribute( 'url' ) ) );
						break;

					case 'instance_controller':
						data.instanceControllers.push( parseNodeInstance( child ) );
						break;

					case 'instance_light':
						data.instanceLights.push( parseId( child.getAttribute( 'url' ) ) );
						break;

					case 'instance_geometry':
						data.instanceGeometries.push( parseNodeInstance( child ) );
						break;

					case 'instance_node':
						data.instanceNodes.push( parseId( child.getAttribute( 'url' ) ) );
						break;

					case 'matrix':
						array = parseFloats( child.textContent );
						data.matrix.multiply( matrix.fromArray( array ).transpose() );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'translate':
						array = parseFloats( child.textContent );
						vector.fromArray( array );
						data.matrix.multiply( matrix.makeTranslation( vector.x, vector.y, vector.z ) );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'rotate':
						array = parseFloats( child.textContent );
						const angle = three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad( array[ 3 ] );
						data.matrix.multiply( matrix.makeRotationAxis( vector.fromArray( array ), angle ) );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'scale':
						array = parseFloats( child.textContent );
						data.matrix.scale( vector.fromArray( array ) );
						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
						break;

					case 'extra':
						break;

					default:
						console.log( child );

				}

			}

			if ( hasNode( data.id ) ) {

				console.warn( 'THREE.ColladaLoader: There is already a node with ID %s. Exclude current node from further processing.', data.id );

			} else {

				library.nodes[ data.id ] = data;

			}

			return data;

		}

		function parseNodeInstance( xml ) {

			const data = {
				id: parseId( xml.getAttribute( 'url' ) ),
				materials: {},
				skeletons: []
			};

			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

				const child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'bind_material':
						const instances = child.getElementsByTagName( 'instance_material' );

						for ( let j = 0; j < instances.length; j ++ ) {

							const instance = instances[ j ];
							const symbol = instance.getAttribute( 'symbol' );
							const target = instance.getAttribute( 'target' );

							data.materials[ symbol ] = parseId( target );

						}

						break;

					case 'skeleton':
						data.skeletons.push( parseId( child.textContent ) );
						break;

					default:
						break;

				}

			}

			return data;

		}

		function buildSkeleton( skeletons, joints ) {

			const boneData = [];
			const sortedBoneData = [];

			let i, j, data;

			// a skeleton can have multiple root bones. collada expresses this
			// situtation with multiple "skeleton" tags per controller instance

			for ( i = 0; i < skeletons.length; i ++ ) {

				const skeleton = skeletons[ i ];

				let root;

				if ( hasNode( skeleton ) ) {

					root = getNode( skeleton );
					buildBoneHierarchy( root, joints, boneData );

				} else if ( hasVisualScene( skeleton ) ) {

					// handle case where the skeleton refers to the visual scene (#13335)

					const visualScene = library.visualScenes[ skeleton ];
					const children = visualScene.children;

					for ( let j = 0; j < children.length; j ++ ) {

						const child = children[ j ];

						if ( child.type === 'JOINT' ) {

							const root = getNode( child.id );
							buildBoneHierarchy( root, joints, boneData );

						}

					}

				} else {

					console.error( 'THREE.ColladaLoader: Unable to find root bone of skeleton with ID:', skeleton );

				}

			}

			// sort bone data (the order is defined in the corresponding controller)

			for ( i = 0; i < joints.length; i ++ ) {

				for ( j = 0; j < boneData.length; j ++ ) {

					data = boneData[ j ];

					if ( data.bone.name === joints[ i ].name ) {

						sortedBoneData[ i ] = data;
						data.processed = true;
						break;

					}

				}

			}

			// add unprocessed bone data at the end of the list

			for ( i = 0; i < boneData.length; i ++ ) {

				data = boneData[ i ];

				if ( data.processed === false ) {

					sortedBoneData.push( data );
					data.processed = true;

				}

			}

			// setup arrays for skeleton creation

			const bones = [];
			const boneInverses = [];

			for ( i = 0; i < sortedBoneData.length; i ++ ) {

				data = sortedBoneData[ i ];

				bones.push( data.bone );
				boneInverses.push( data.boneInverse );

			}

			return new three__WEBPACK_IMPORTED_MODULE_0__.Skeleton( bones, boneInverses );

		}

		function buildBoneHierarchy( root, joints, boneData ) {

			// setup bone data from visual scene

			root.traverse( function ( object ) {

				if ( object.isBone === true ) {

					let boneInverse;

					// retrieve the boneInverse from the controller data

					for ( let i = 0; i < joints.length; i ++ ) {

						const joint = joints[ i ];

						if ( joint.name === object.name ) {

							boneInverse = joint.boneInverse;
							break;

						}

					}

					if ( boneInverse === undefined ) {

						// Unfortunately, there can be joints in the visual scene that are not part of the
						// corresponding controller. In this case, we have to create a dummy boneInverse matrix
						// for the respective bone. This bone won't affect any vertices, because there are no skin indices
						// and weights defined for it. But we still have to add the bone to the sorted bone list in order to
						// ensure a correct animation of the model.

						boneInverse = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();

					}

					boneData.push( { bone: object, boneInverse: boneInverse, processed: false } );

				}

			} );

		}

		function buildNode( data ) {

			const objects = [];

			const matrix = data.matrix;
			const nodes = data.nodes;
			const type = data.type;
			const instanceCameras = data.instanceCameras;
			const instanceControllers = data.instanceControllers;
			const instanceLights = data.instanceLights;
			const instanceGeometries = data.instanceGeometries;
			const instanceNodes = data.instanceNodes;

			// nodes

			for ( let i = 0, l = nodes.length; i < l; i ++ ) {

				objects.push( getNode( nodes[ i ] ) );

			}

			// instance cameras

			for ( let i = 0, l = instanceCameras.length; i < l; i ++ ) {

				const instanceCamera = getCamera( instanceCameras[ i ] );

				if ( instanceCamera !== null ) {

					objects.push( instanceCamera.clone() );

				}

			}

			// instance controllers

			for ( let i = 0, l = instanceControllers.length; i < l; i ++ ) {

				const instance = instanceControllers[ i ];
				const controller = getController( instance.id );
				const geometries = getGeometry( controller.id );
				const newObjects = buildObjects( geometries, instance.materials );

				const skeletons = instance.skeletons;
				const joints = controller.skin.joints;

				const skeleton = buildSkeleton( skeletons, joints );

				for ( let j = 0, jl = newObjects.length; j < jl; j ++ ) {

					const object = newObjects[ j ];

					if ( object.isSkinnedMesh ) {

						object.bind( skeleton, controller.skin.bindMatrix );
						object.normalizeSkinWeights();

					}

					objects.push( object );

				}

			}

			// instance lights

			for ( let i = 0, l = instanceLights.length; i < l; i ++ ) {

				const instanceLight = getLight( instanceLights[ i ] );

				if ( instanceLight !== null ) {

					objects.push( instanceLight.clone() );

				}

			}

			// instance geometries

			for ( let i = 0, l = instanceGeometries.length; i < l; i ++ ) {

				const instance = instanceGeometries[ i ];

				// a single geometry instance in collada can lead to multiple object3Ds.
				// this is the case when primitives are combined like triangles and lines

				const geometries = getGeometry( instance.id );
				const newObjects = buildObjects( geometries, instance.materials );

				for ( let j = 0, jl = newObjects.length; j < jl; j ++ ) {

					objects.push( newObjects[ j ] );

				}

			}

			// instance nodes

			for ( let i = 0, l = instanceNodes.length; i < l; i ++ ) {

				objects.push( getNode( instanceNodes[ i ] ).clone() );

			}

			let object;

			if ( nodes.length === 0 && objects.length === 1 ) {

				object = objects[ 0 ];

			} else {

				object = ( type === 'JOINT' ) ? new three__WEBPACK_IMPORTED_MODULE_0__.Bone() : new three__WEBPACK_IMPORTED_MODULE_0__.Group();

				for ( let i = 0; i < objects.length; i ++ ) {

					object.add( objects[ i ] );

				}

			}

			object.name = ( type === 'JOINT' ) ? data.sid : data.name;
			object.matrix.copy( matrix );
			object.matrix.decompose( object.position, object.quaternion, object.scale );

			return object;

		}

		const fallbackMaterial = new three__WEBPACK_IMPORTED_MODULE_0__.MeshBasicMaterial( {
			name: three__WEBPACK_IMPORTED_MODULE_0__.Loader.DEFAULT_MATERIAL_NAME,
			color: 0xff00ff
		} );

		function resolveMaterialBinding( keys, instanceMaterials ) {

			const materials = [];

			for ( let i = 0, l = keys.length; i < l; i ++ ) {

				const id = instanceMaterials[ keys[ i ] ];

				if ( id === undefined ) {

					console.warn( 'THREE.ColladaLoader: Material with key %s not found. Apply fallback material.', keys[ i ] );
					materials.push( fallbackMaterial );

				} else {

					materials.push( getMaterial( id ) );

				}

			}

			return materials;

		}

		function buildObjects( geometries, instanceMaterials ) {

			const objects = [];

			for ( const type in geometries ) {

				const geometry = geometries[ type ];

				const materials = resolveMaterialBinding( geometry.materialKeys, instanceMaterials );

				// handle case if no materials are defined

				if ( materials.length === 0 ) {

					if ( type === 'lines' || type === 'linestrips' ) {

						materials.push( new three__WEBPACK_IMPORTED_MODULE_0__.LineBasicMaterial() );

					} else {

						materials.push( new three__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial() );

					}

				}

				// Collada allows to use phong and lambert materials with lines. Replacing these cases with LineBasicMaterial.

				if ( type === 'lines' || type === 'linestrips' ) {

					for ( let i = 0, l = materials.length; i < l; i ++ ) {

						const material = materials[ i ];

						if ( material.isMeshPhongMaterial === true || material.isMeshLambertMaterial === true ) {

							const lineMaterial = new three__WEBPACK_IMPORTED_MODULE_0__.LineBasicMaterial();

							// copy compatible properties

							lineMaterial.color.copy( material.color );
							lineMaterial.opacity = material.opacity;
							lineMaterial.transparent = material.transparent;

							// replace material

							materials[ i ] = lineMaterial;

						}

					}

				}

				// regard skinning

				const skinning = ( geometry.data.attributes.skinIndex !== undefined );

				// choose between a single or multi materials (material array)

				const material = ( materials.length === 1 ) ? materials[ 0 ] : materials;

				// now create a specific 3D object

				let object;

				switch ( type ) {

					case 'lines':
						object = new three__WEBPACK_IMPORTED_MODULE_0__.LineSegments( geometry.data, material );
						break;

					case 'linestrips':
						object = new three__WEBPACK_IMPORTED_MODULE_0__.Line( geometry.data, material );
						break;

					case 'triangles':
					case 'polylist':
						if ( skinning ) {

							object = new three__WEBPACK_IMPORTED_MODULE_0__.SkinnedMesh( geometry.data, material );

						} else {

							object = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh( geometry.data, material );

						}

						break;

				}

				objects.push( object );

			}

			return objects;

		}

		function hasNode( id ) {

			return library.nodes[ id ] !== undefined;

		}

		function getNode( id ) {

			return getBuild( library.nodes[ id ], buildNode );

		}

		// visual scenes

		function parseVisualScene( xml ) {

			const data = {
				name: xml.getAttribute( 'name' ),
				children: []
			};

			prepareNodes( xml );

			const elements = getElementsByTagName( xml, 'node' );

			for ( let i = 0; i < elements.length; i ++ ) {

				data.children.push( parseNode( elements[ i ] ) );

			}

			library.visualScenes[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildVisualScene( data ) {

			const group = new three__WEBPACK_IMPORTED_MODULE_0__.Group();
			group.name = data.name;

			const children = data.children;

			for ( let i = 0; i < children.length; i ++ ) {

				const child = children[ i ];

				group.add( getNode( child.id ) );

			}

			return group;

		}

		function hasVisualScene( id ) {

			return library.visualScenes[ id ] !== undefined;

		}

		function getVisualScene( id ) {

			return getBuild( library.visualScenes[ id ], buildVisualScene );

		}

		// scenes

		function parseScene( xml ) {

			const instance = getElementsByTagName( xml, 'instance_visual_scene' )[ 0 ];
			return getVisualScene( parseId( instance.getAttribute( 'url' ) ) );

		}

		function setupAnimations() {

			const clips = library.clips;

			if ( isEmpty( clips ) === true ) {

				if ( isEmpty( library.animations ) === false ) {

					// if there are animations but no clips, we create a default clip for playback

					const tracks = [];

					for ( const id in library.animations ) {

						const animationTracks = getAnimation( id );

						for ( let i = 0, l = animationTracks.length; i < l; i ++ ) {

							tracks.push( animationTracks[ i ] );

						}

					}

					animations.push( new three__WEBPACK_IMPORTED_MODULE_0__.AnimationClip( 'default', - 1, tracks ) );

				}

			} else {

				for ( const id in clips ) {

					animations.push( getAnimationClip( id ) );

				}

			}

		}

		// convert the parser error element into text with each child elements text
		// separated by new lines.

		function parserErrorToText( parserError ) {

			let result = '';
			const stack = [ parserError ];

			while ( stack.length ) {

				const node = stack.shift();

				if ( node.nodeType === Node.TEXT_NODE ) {

					result += node.textContent;

				} else {

					result += '\n';
					stack.push.apply( stack, node.childNodes );

				}

			}

			return result.trim();

		}

		if ( text.length === 0 ) {

			return { scene: new three__WEBPACK_IMPORTED_MODULE_0__.Scene() };

		}

		const xml = new DOMParser().parseFromString( text, 'application/xml' );

		const collada = getElementsByTagName( xml, 'COLLADA' )[ 0 ];

		const parserError = xml.getElementsByTagName( 'parsererror' )[ 0 ];
		if ( parserError !== undefined ) {

			// Chrome will return parser error with a div in it

			const errorElement = getElementsByTagName( parserError, 'div' )[ 0 ];
			let errorText;

			if ( errorElement ) {

				errorText = errorElement.textContent;

			} else {

				errorText = parserErrorToText( parserError );

			}

			console.error( 'THREE.ColladaLoader: Failed to parse collada file.\n', errorText );

			return null;

		}

		// metadata

		const version = collada.getAttribute( 'version' );
		console.debug( 'THREE.ColladaLoader: File version', version );

		const asset = parseAsset( getElementsByTagName( collada, 'asset' )[ 0 ] );
		const textureLoader = new three__WEBPACK_IMPORTED_MODULE_0__.TextureLoader( this.manager );
		textureLoader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

		let tgaLoader;

		if ( _loaders_TGALoader_js__WEBPACK_IMPORTED_MODULE_1__.TGALoader ) {

			tgaLoader = new _loaders_TGALoader_js__WEBPACK_IMPORTED_MODULE_1__.TGALoader( this.manager );
			tgaLoader.setPath( this.resourcePath || path );

		}

		//

		const tempColor = new three__WEBPACK_IMPORTED_MODULE_0__.Color();
		const animations = [];
		let kinematics = {};
		let count = 0;

		//

		const library = {
			animations: {},
			clips: {},
			controllers: {},
			images: {},
			effects: {},
			materials: {},
			cameras: {},
			lights: {},
			geometries: {},
			nodes: {},
			visualScenes: {},
			kinematicsModels: {},
			physicsModels: {},
			kinematicsScenes: {}
		};

		parseLibrary( collada, 'library_animations', 'animation', parseAnimation );
		parseLibrary( collada, 'library_animation_clips', 'animation_clip', parseAnimationClip );
		parseLibrary( collada, 'library_controllers', 'controller', parseController );
		parseLibrary( collada, 'library_images', 'image', parseImage );
		parseLibrary( collada, 'library_effects', 'effect', parseEffect );
		parseLibrary( collada, 'library_materials', 'material', parseMaterial );
		parseLibrary( collada, 'library_cameras', 'camera', parseCamera );
		parseLibrary( collada, 'library_lights', 'light', parseLight );
		parseLibrary( collada, 'library_geometries', 'geometry', parseGeometry );
		parseLibrary( collada, 'library_nodes', 'node', parseNode );
		parseLibrary( collada, 'library_visual_scenes', 'visual_scene', parseVisualScene );
		parseLibrary( collada, 'library_kinematics_models', 'kinematics_model', parseKinematicsModel );
		parseLibrary( collada, 'library_physics_models', 'physics_model', parsePhysicsModel );
		parseLibrary( collada, 'scene', 'instance_kinematics_scene', parseKinematicsScene );

		buildLibrary( library.animations, buildAnimation );
		buildLibrary( library.clips, buildAnimationClip );
		buildLibrary( library.controllers, buildController );
		buildLibrary( library.images, buildImage );
		buildLibrary( library.effects, buildEffect );
		buildLibrary( library.materials, buildMaterial );
		buildLibrary( library.cameras, buildCamera );
		buildLibrary( library.lights, buildLight );
		buildLibrary( library.geometries, buildGeometry );
		buildLibrary( library.visualScenes, buildVisualScene );

		setupAnimations();
		setupKinematics();

		const scene = parseScene( getElementsByTagName( collada, 'scene' )[ 0 ] );
		scene.animations = animations;

		if ( asset.upAxis === 'Z_UP' ) {

			console.warn( 'THREE.ColladaLoader: You are loading an asset with a Z-UP coordinate system. The loader just rotates the asset to transform it into Y-UP. The vertex data are not converted, see #24289.' );
			scene.rotation.set( - Math.PI / 2, 0, 0 );

		}

		scene.scale.multiplyScalar( asset.unit );

		return {
			get animations() {

				console.warn( 'THREE.ColladaLoader: Please access animations over scene.animations now.' );
				return animations;

			},
			kinematics: kinematics,
			library: library,
			scene: scene
		};

	}

}




/***/ }),

/***/ "./node_modules/three/examples/jsm/loaders/FBXLoader.js":
/*!**************************************************************!*\
  !*** ./node_modules/three/examples/jsm/loaders/FBXLoader.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FBXLoader: () => (/* binding */ FBXLoader)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var _libs_fflate_module_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../libs/fflate.module.js */ "./node_modules/three/examples/jsm/libs/fflate.module.js");
/* harmony import */ var _curves_NURBSCurve_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../curves/NURBSCurve.js */ "./node_modules/three/examples/jsm/curves/NURBSCurve.js");




/**
 * Loader loads FBX file and generates Group representing FBX scene.
 * Requires FBX file to be >= 7.0 and in ASCII or >= 6400 in Binary format
 * Versions lower than this may load but will probably have errors
 *
 * Needs Support:
 *  Morph normals / blend shape normals
 *
 * FBX format references:
 * 	https://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_index_html (C++ SDK reference)
 *
 * Binary format specification:
 *	https://code.blender.org/2013/08/fbx-binary-file-format-specification/
 */


let fbxTree;
let connections;
let sceneGraph;

class FBXLoader extends three__WEBPACK_IMPORTED_MODULE_0__.Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const path = ( scope.path === '' ) ? three__WEBPACK_IMPORTED_MODULE_0__.LoaderUtils.extractUrlBase( url ) : scope.path;

		const loader = new three__WEBPACK_IMPORTED_MODULE_0__.FileLoader( this.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );

		loader.load( url, function ( buffer ) {

			try {

				onLoad( scope.parse( buffer, path ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( FBXBuffer, path ) {

		if ( isFbxFormatBinary( FBXBuffer ) ) {

			fbxTree = new BinaryParser().parse( FBXBuffer );

		} else {

			const FBXText = convertArrayBufferToString( FBXBuffer );

			if ( ! isFbxFormatASCII( FBXText ) ) {

				throw new Error( 'THREE.FBXLoader: Unknown format.' );

			}

			if ( getFbxVersion( FBXText ) < 7000 ) {

				throw new Error( 'THREE.FBXLoader: FBX version not supported, FileVersion: ' + getFbxVersion( FBXText ) );

			}

			fbxTree = new TextParser().parse( FBXText );

		}

		// console.log( fbxTree );

		const textureLoader = new three__WEBPACK_IMPORTED_MODULE_0__.TextureLoader( this.manager ).setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

		return new FBXTreeParser( textureLoader, this.manager ).parse( fbxTree );

	}

}

// Parse the FBXTree object returned by the BinaryParser or TextParser and return a Group
class FBXTreeParser {

	constructor( textureLoader, manager ) {

		this.textureLoader = textureLoader;
		this.manager = manager;

	}

	parse() {

		connections = this.parseConnections();

		const images = this.parseImages();
		const textures = this.parseTextures( images );
		const materials = this.parseMaterials( textures );
		const deformers = this.parseDeformers();
		const geometryMap = new GeometryParser().parse( deformers );

		this.parseScene( deformers, geometryMap, materials );

		return sceneGraph;

	}

	// Parses FBXTree.Connections which holds parent-child connections between objects (e.g. material -> texture, model->geometry )
	// and details the connection type
	parseConnections() {

		const connectionMap = new Map();

		if ( 'Connections' in fbxTree ) {

			const rawConnections = fbxTree.Connections.connections;

			rawConnections.forEach( function ( rawConnection ) {

				const fromID = rawConnection[ 0 ];
				const toID = rawConnection[ 1 ];
				const relationship = rawConnection[ 2 ];

				if ( ! connectionMap.has( fromID ) ) {

					connectionMap.set( fromID, {
						parents: [],
						children: []
					} );

				}

				const parentRelationship = { ID: toID, relationship: relationship };
				connectionMap.get( fromID ).parents.push( parentRelationship );

				if ( ! connectionMap.has( toID ) ) {

					connectionMap.set( toID, {
						parents: [],
						children: []
					} );

				}

				const childRelationship = { ID: fromID, relationship: relationship };
				connectionMap.get( toID ).children.push( childRelationship );

			} );

		}

		return connectionMap;

	}

	// Parse FBXTree.Objects.Video for embedded image data
	// These images are connected to textures in FBXTree.Objects.Textures
	// via FBXTree.Connections.
	parseImages() {

		const images = {};
		const blobs = {};

		if ( 'Video' in fbxTree.Objects ) {

			const videoNodes = fbxTree.Objects.Video;

			for ( const nodeID in videoNodes ) {

				const videoNode = videoNodes[ nodeID ];

				const id = parseInt( nodeID );

				images[ id ] = videoNode.RelativeFilename || videoNode.Filename;

				// raw image data is in videoNode.Content
				if ( 'Content' in videoNode ) {

					const arrayBufferContent = ( videoNode.Content instanceof ArrayBuffer ) && ( videoNode.Content.byteLength > 0 );
					const base64Content = ( typeof videoNode.Content === 'string' ) && ( videoNode.Content !== '' );

					if ( arrayBufferContent || base64Content ) {

						const image = this.parseImage( videoNodes[ nodeID ] );

						blobs[ videoNode.RelativeFilename || videoNode.Filename ] = image;

					}

				}

			}

		}

		for ( const id in images ) {

			const filename = images[ id ];

			if ( blobs[ filename ] !== undefined ) images[ id ] = blobs[ filename ];
			else images[ id ] = images[ id ].split( '\\' ).pop();

		}

		return images;

	}

	// Parse embedded image data in FBXTree.Video.Content
	parseImage( videoNode ) {

		const content = videoNode.Content;
		const fileName = videoNode.RelativeFilename || videoNode.Filename;
		const extension = fileName.slice( fileName.lastIndexOf( '.' ) + 1 ).toLowerCase();

		let type;

		switch ( extension ) {

			case 'bmp':

				type = 'image/bmp';
				break;

			case 'jpg':
			case 'jpeg':

				type = 'image/jpeg';
				break;

			case 'png':

				type = 'image/png';
				break;

			case 'tif':

				type = 'image/tiff';
				break;

			case 'tga':

				if ( this.manager.getHandler( '.tga' ) === null ) {

					console.warn( 'FBXLoader: TGA loader not found, skipping ', fileName );

				}

				type = 'image/tga';
				break;

			default:

				console.warn( 'FBXLoader: Image type "' + extension + '" is not supported.' );
				return;

		}

		if ( typeof content === 'string' ) { // ASCII format

			return 'data:' + type + ';base64,' + content;

		} else { // Binary Format

			const array = new Uint8Array( content );
			return window.URL.createObjectURL( new Blob( [ array ], { type: type } ) );

		}

	}

	// Parse nodes in FBXTree.Objects.Texture
	// These contain details such as UV scaling, cropping, rotation etc and are connected
	// to images in FBXTree.Objects.Video
	parseTextures( images ) {

		const textureMap = new Map();

		if ( 'Texture' in fbxTree.Objects ) {

			const textureNodes = fbxTree.Objects.Texture;
			for ( const nodeID in textureNodes ) {

				const texture = this.parseTexture( textureNodes[ nodeID ], images );
				textureMap.set( parseInt( nodeID ), texture );

			}

		}

		return textureMap;

	}

	// Parse individual node in FBXTree.Objects.Texture
	parseTexture( textureNode, images ) {

		const texture = this.loadTexture( textureNode, images );

		texture.ID = textureNode.id;

		texture.name = textureNode.attrName;

		const wrapModeU = textureNode.WrapModeU;
		const wrapModeV = textureNode.WrapModeV;

		const valueU = wrapModeU !== undefined ? wrapModeU.value : 0;
		const valueV = wrapModeV !== undefined ? wrapModeV.value : 0;

		// http://download.autodesk.com/us/fbx/SDKdocs/FBX_SDK_Help/files/fbxsdkref/class_k_fbx_texture.html#889640e63e2e681259ea81061b85143a
		// 0: repeat(default), 1: clamp

		texture.wrapS = valueU === 0 ? three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping : three__WEBPACK_IMPORTED_MODULE_0__.ClampToEdgeWrapping;
		texture.wrapT = valueV === 0 ? three__WEBPACK_IMPORTED_MODULE_0__.RepeatWrapping : three__WEBPACK_IMPORTED_MODULE_0__.ClampToEdgeWrapping;

		if ( 'Scaling' in textureNode ) {

			const values = textureNode.Scaling.value;

			texture.repeat.x = values[ 0 ];
			texture.repeat.y = values[ 1 ];

		}

		if ( 'Translation' in textureNode ) {

			const values = textureNode.Translation.value;

			texture.offset.x = values[ 0 ];
			texture.offset.y = values[ 1 ];

		}

		return texture;

	}

	// load a texture specified as a blob or data URI, or via an external URL using TextureLoader
	loadTexture( textureNode, images ) {

		let fileName;

		const currentPath = this.textureLoader.path;

		const children = connections.get( textureNode.id ).children;

		if ( children !== undefined && children.length > 0 && images[ children[ 0 ].ID ] !== undefined ) {

			fileName = images[ children[ 0 ].ID ];

			if ( fileName.indexOf( 'blob:' ) === 0 || fileName.indexOf( 'data:' ) === 0 ) {

				this.textureLoader.setPath( undefined );

			}

		}

		let texture;

		const extension = textureNode.FileName.slice( - 3 ).toLowerCase();

		if ( extension === 'tga' ) {

			const loader = this.manager.getHandler( '.tga' );

			if ( loader === null ) {

				console.warn( 'FBXLoader: TGA loader not found, creating placeholder texture for', textureNode.RelativeFilename );
				texture = new three__WEBPACK_IMPORTED_MODULE_0__.Texture();

			} else {

				loader.setPath( this.textureLoader.path );
				texture = loader.load( fileName );

			}

		} else if ( extension === 'dds' ) {

			const loader = this.manager.getHandler( '.dds' );

			if ( loader === null ) {

				console.warn( 'FBXLoader: DDS loader not found, creating placeholder texture for', textureNode.RelativeFilename );
				texture = new three__WEBPACK_IMPORTED_MODULE_0__.Texture();

			} else {

				loader.setPath( this.textureLoader.path );
				texture = loader.load( fileName );

			}

		} else if ( extension === 'psd' ) {

			console.warn( 'FBXLoader: PSD textures are not supported, creating placeholder texture for', textureNode.RelativeFilename );
			texture = new three__WEBPACK_IMPORTED_MODULE_0__.Texture();

		} else {

			texture = this.textureLoader.load( fileName );

		}

		this.textureLoader.setPath( currentPath );

		return texture;

	}

	// Parse nodes in FBXTree.Objects.Material
	parseMaterials( textureMap ) {

		const materialMap = new Map();

		if ( 'Material' in fbxTree.Objects ) {

			const materialNodes = fbxTree.Objects.Material;

			for ( const nodeID in materialNodes ) {

				const material = this.parseMaterial( materialNodes[ nodeID ], textureMap );

				if ( material !== null ) materialMap.set( parseInt( nodeID ), material );

			}

		}

		return materialMap;

	}

	// Parse single node in FBXTree.Objects.Material
	// Materials are connected to texture maps in FBXTree.Objects.Textures
	// FBX format currently only supports Lambert and Phong shading models
	parseMaterial( materialNode, textureMap ) {

		const ID = materialNode.id;
		const name = materialNode.attrName;
		let type = materialNode.ShadingModel;

		// Case where FBX wraps shading model in property object.
		if ( typeof type === 'object' ) {

			type = type.value;

		}

		// Ignore unused materials which don't have any connections.
		if ( ! connections.has( ID ) ) return null;

		const parameters = this.parseParameters( materialNode, textureMap, ID );

		let material;

		switch ( type.toLowerCase() ) {

			case 'phong':
				material = new three__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial();
				break;
			case 'lambert':
				material = new three__WEBPACK_IMPORTED_MODULE_0__.MeshLambertMaterial();
				break;
			default:
				console.warn( 'THREE.FBXLoader: unknown material type "%s". Defaulting to MeshPhongMaterial.', type );
				material = new three__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial();
				break;

		}

		material.setValues( parameters );
		material.name = name;

		return material;

	}

	// Parse FBX material and return parameters suitable for a three.js material
	// Also parse the texture map and return any textures associated with the material
	parseParameters( materialNode, textureMap, ID ) {

		const parameters = {};

		if ( materialNode.BumpFactor ) {

			parameters.bumpScale = materialNode.BumpFactor.value;

		}

		if ( materialNode.Diffuse ) {

			parameters.color = new three__WEBPACK_IMPORTED_MODULE_0__.Color().fromArray( materialNode.Diffuse.value ).convertSRGBToLinear();

		} else if ( materialNode.DiffuseColor && ( materialNode.DiffuseColor.type === 'Color' || materialNode.DiffuseColor.type === 'ColorRGB' ) ) {

			// The blender exporter exports diffuse here instead of in materialNode.Diffuse
			parameters.color = new three__WEBPACK_IMPORTED_MODULE_0__.Color().fromArray( materialNode.DiffuseColor.value ).convertSRGBToLinear();

		}

		if ( materialNode.DisplacementFactor ) {

			parameters.displacementScale = materialNode.DisplacementFactor.value;

		}

		if ( materialNode.Emissive ) {

			parameters.emissive = new three__WEBPACK_IMPORTED_MODULE_0__.Color().fromArray( materialNode.Emissive.value ).convertSRGBToLinear();

		} else if ( materialNode.EmissiveColor && ( materialNode.EmissiveColor.type === 'Color' || materialNode.EmissiveColor.type === 'ColorRGB' ) ) {

			// The blender exporter exports emissive color here instead of in materialNode.Emissive
			parameters.emissive = new three__WEBPACK_IMPORTED_MODULE_0__.Color().fromArray( materialNode.EmissiveColor.value ).convertSRGBToLinear();

		}

		if ( materialNode.EmissiveFactor ) {

			parameters.emissiveIntensity = parseFloat( materialNode.EmissiveFactor.value );

		}

		if ( materialNode.Opacity ) {

			parameters.opacity = parseFloat( materialNode.Opacity.value );

		}

		if ( parameters.opacity < 1.0 ) {

			parameters.transparent = true;

		}

		if ( materialNode.ReflectionFactor ) {

			parameters.reflectivity = materialNode.ReflectionFactor.value;

		}

		if ( materialNode.Shininess ) {

			parameters.shininess = materialNode.Shininess.value;

		}

		if ( materialNode.Specular ) {

			parameters.specular = new three__WEBPACK_IMPORTED_MODULE_0__.Color().fromArray( materialNode.Specular.value ).convertSRGBToLinear();

		} else if ( materialNode.SpecularColor && materialNode.SpecularColor.type === 'Color' ) {

			// The blender exporter exports specular color here instead of in materialNode.Specular
			parameters.specular = new three__WEBPACK_IMPORTED_MODULE_0__.Color().fromArray( materialNode.SpecularColor.value ).convertSRGBToLinear();

		}

		const scope = this;
		connections.get( ID ).children.forEach( function ( child ) {

			const type = child.relationship;

			switch ( type ) {

				case 'Bump':
					parameters.bumpMap = scope.getTexture( textureMap, child.ID );
					break;

				case 'Maya|TEX_ao_map':
					parameters.aoMap = scope.getTexture( textureMap, child.ID );
					break;

				case 'DiffuseColor':
				case 'Maya|TEX_color_map':
					parameters.map = scope.getTexture( textureMap, child.ID );
					if ( parameters.map !== undefined ) {

						parameters.map.colorSpace = three__WEBPACK_IMPORTED_MODULE_0__.SRGBColorSpace;

					}

					break;

				case 'DisplacementColor':
					parameters.displacementMap = scope.getTexture( textureMap, child.ID );
					break;

				case 'EmissiveColor':
					parameters.emissiveMap = scope.getTexture( textureMap, child.ID );
					if ( parameters.emissiveMap !== undefined ) {

						parameters.emissiveMap.colorSpace = three__WEBPACK_IMPORTED_MODULE_0__.SRGBColorSpace;

					}

					break;

				case 'NormalMap':
				case 'Maya|TEX_normal_map':
					parameters.normalMap = scope.getTexture( textureMap, child.ID );
					break;

				case 'ReflectionColor':
					parameters.envMap = scope.getTexture( textureMap, child.ID );
					if ( parameters.envMap !== undefined ) {

						parameters.envMap.mapping = three__WEBPACK_IMPORTED_MODULE_0__.EquirectangularReflectionMapping;
						parameters.envMap.colorSpace = three__WEBPACK_IMPORTED_MODULE_0__.SRGBColorSpace;

					}

					break;

				case 'SpecularColor':
					parameters.specularMap = scope.getTexture( textureMap, child.ID );
					if ( parameters.specularMap !== undefined ) {

						parameters.specularMap.colorSpace = three__WEBPACK_IMPORTED_MODULE_0__.SRGBColorSpace;

					}

					break;

				case 'TransparentColor':
				case 'TransparencyFactor':
					parameters.alphaMap = scope.getTexture( textureMap, child.ID );
					parameters.transparent = true;
					break;

				case 'AmbientColor':
				case 'ShininessExponent': // AKA glossiness map
				case 'SpecularFactor': // AKA specularLevel
				case 'VectorDisplacementColor': // NOTE: Seems to be a copy of DisplacementColor
				default:
					console.warn( 'THREE.FBXLoader: %s map is not supported in three.js, skipping texture.', type );
					break;

			}

		} );

		return parameters;

	}

	// get a texture from the textureMap for use by a material.
	getTexture( textureMap, id ) {

		// if the texture is a layered texture, just use the first layer and issue a warning
		if ( 'LayeredTexture' in fbxTree.Objects && id in fbxTree.Objects.LayeredTexture ) {

			console.warn( 'THREE.FBXLoader: layered textures are not supported in three.js. Discarding all but first layer.' );
			id = connections.get( id ).children[ 0 ].ID;

		}

		return textureMap.get( id );

	}

	// Parse nodes in FBXTree.Objects.Deformer
	// Deformer node can contain skinning or Vertex Cache animation data, however only skinning is supported here
	// Generates map of Skeleton-like objects for use later when generating and binding skeletons.
	parseDeformers() {

		const skeletons = {};
		const morphTargets = {};

		if ( 'Deformer' in fbxTree.Objects ) {

			const DeformerNodes = fbxTree.Objects.Deformer;

			for ( const nodeID in DeformerNodes ) {

				const deformerNode = DeformerNodes[ nodeID ];

				const relationships = connections.get( parseInt( nodeID ) );

				if ( deformerNode.attrType === 'Skin' ) {

					const skeleton = this.parseSkeleton( relationships, DeformerNodes );
					skeleton.ID = nodeID;

					if ( relationships.parents.length > 1 ) console.warn( 'THREE.FBXLoader: skeleton attached to more than one geometry is not supported.' );
					skeleton.geometryID = relationships.parents[ 0 ].ID;

					skeletons[ nodeID ] = skeleton;

				} else if ( deformerNode.attrType === 'BlendShape' ) {

					const morphTarget = {
						id: nodeID,
					};

					morphTarget.rawTargets = this.parseMorphTargets( relationships, DeformerNodes );
					morphTarget.id = nodeID;

					if ( relationships.parents.length > 1 ) console.warn( 'THREE.FBXLoader: morph target attached to more than one geometry is not supported.' );

					morphTargets[ nodeID ] = morphTarget;

				}

			}

		}

		return {

			skeletons: skeletons,
			morphTargets: morphTargets,

		};

	}

	// Parse single nodes in FBXTree.Objects.Deformer
	// The top level skeleton node has type 'Skin' and sub nodes have type 'Cluster'
	// Each skin node represents a skeleton and each cluster node represents a bone
	parseSkeleton( relationships, deformerNodes ) {

		const rawBones = [];

		relationships.children.forEach( function ( child ) {

			const boneNode = deformerNodes[ child.ID ];

			if ( boneNode.attrType !== 'Cluster' ) return;

			const rawBone = {

				ID: child.ID,
				indices: [],
				weights: [],
				transformLink: new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4().fromArray( boneNode.TransformLink.a ),
				// transform: new Matrix4().fromArray( boneNode.Transform.a ),
				// linkMode: boneNode.Mode,

			};

			if ( 'Indexes' in boneNode ) {

				rawBone.indices = boneNode.Indexes.a;
				rawBone.weights = boneNode.Weights.a;

			}

			rawBones.push( rawBone );

		} );

		return {

			rawBones: rawBones,
			bones: []

		};

	}

	// The top level morph deformer node has type "BlendShape" and sub nodes have type "BlendShapeChannel"
	parseMorphTargets( relationships, deformerNodes ) {

		const rawMorphTargets = [];

		for ( let i = 0; i < relationships.children.length; i ++ ) {

			const child = relationships.children[ i ];

			const morphTargetNode = deformerNodes[ child.ID ];

			const rawMorphTarget = {

				name: morphTargetNode.attrName,
				initialWeight: morphTargetNode.DeformPercent,
				id: morphTargetNode.id,
				fullWeights: morphTargetNode.FullWeights.a

			};

			if ( morphTargetNode.attrType !== 'BlendShapeChannel' ) return;

			rawMorphTarget.geoID = connections.get( parseInt( child.ID ) ).children.filter( function ( child ) {

				return child.relationship === undefined;

			} )[ 0 ].ID;

			rawMorphTargets.push( rawMorphTarget );

		}

		return rawMorphTargets;

	}

	// create the main Group() to be returned by the loader
	parseScene( deformers, geometryMap, materialMap ) {

		sceneGraph = new three__WEBPACK_IMPORTED_MODULE_0__.Group();

		const modelMap = this.parseModels( deformers.skeletons, geometryMap, materialMap );

		const modelNodes = fbxTree.Objects.Model;

		const scope = this;
		modelMap.forEach( function ( model ) {

			const modelNode = modelNodes[ model.ID ];
			scope.setLookAtProperties( model, modelNode );

			const parentConnections = connections.get( model.ID ).parents;

			parentConnections.forEach( function ( connection ) {

				const parent = modelMap.get( connection.ID );
				if ( parent !== undefined ) parent.add( model );

			} );

			if ( model.parent === null ) {

				sceneGraph.add( model );

			}


		} );

		this.bindSkeleton( deformers.skeletons, geometryMap, modelMap );

		this.addGlobalSceneSettings();

		sceneGraph.traverse( function ( node ) {

			if ( node.userData.transformData ) {

				if ( node.parent ) {

					node.userData.transformData.parentMatrix = node.parent.matrix;
					node.userData.transformData.parentMatrixWorld = node.parent.matrixWorld;

				}

				const transform = generateTransform( node.userData.transformData );

				node.applyMatrix4( transform );
				node.updateWorldMatrix();

			}

		} );

		const animations = new AnimationParser().parse();

		// if all the models where already combined in a single group, just return that
		if ( sceneGraph.children.length === 1 && sceneGraph.children[ 0 ].isGroup ) {

			sceneGraph.children[ 0 ].animations = animations;
			sceneGraph = sceneGraph.children[ 0 ];

		}

		sceneGraph.animations = animations;

	}

	// parse nodes in FBXTree.Objects.Model
	parseModels( skeletons, geometryMap, materialMap ) {

		const modelMap = new Map();
		const modelNodes = fbxTree.Objects.Model;

		for ( const nodeID in modelNodes ) {

			const id = parseInt( nodeID );
			const node = modelNodes[ nodeID ];
			const relationships = connections.get( id );

			let model = this.buildSkeleton( relationships, skeletons, id, node.attrName );

			if ( ! model ) {

				switch ( node.attrType ) {

					case 'Camera':
						model = this.createCamera( relationships );
						break;
					case 'Light':
						model = this.createLight( relationships );
						break;
					case 'Mesh':
						model = this.createMesh( relationships, geometryMap, materialMap );
						break;
					case 'NurbsCurve':
						model = this.createCurve( relationships, geometryMap );
						break;
					case 'LimbNode':
					case 'Root':
						model = new three__WEBPACK_IMPORTED_MODULE_0__.Bone();
						break;
					case 'Null':
					default:
						model = new three__WEBPACK_IMPORTED_MODULE_0__.Group();
						break;

				}

				model.name = node.attrName ? three__WEBPACK_IMPORTED_MODULE_0__.PropertyBinding.sanitizeNodeName( node.attrName ) : '';
				model.userData.originalName = node.attrName;

				model.ID = id;

			}

			this.getTransformData( model, node );
			modelMap.set( id, model );

		}

		return modelMap;

	}

	buildSkeleton( relationships, skeletons, id, name ) {

		let bone = null;

		relationships.parents.forEach( function ( parent ) {

			for ( const ID in skeletons ) {

				const skeleton = skeletons[ ID ];

				skeleton.rawBones.forEach( function ( rawBone, i ) {

					if ( rawBone.ID === parent.ID ) {

						const subBone = bone;
						bone = new three__WEBPACK_IMPORTED_MODULE_0__.Bone();

						bone.matrixWorld.copy( rawBone.transformLink );

						// set name and id here - otherwise in cases where "subBone" is created it will not have a name / id

						bone.name = name ? three__WEBPACK_IMPORTED_MODULE_0__.PropertyBinding.sanitizeNodeName( name ) : '';
						bone.userData.originalName = name;
						bone.ID = id;

						skeleton.bones[ i ] = bone;

						// In cases where a bone is shared between multiple meshes
						// duplicate the bone here and and it as a child of the first bone
						if ( subBone !== null ) {

							bone.add( subBone );

						}

					}

				} );

			}

		} );

		return bone;

	}

	// create a PerspectiveCamera or OrthographicCamera
	createCamera( relationships ) {

		let model;
		let cameraAttribute;

		relationships.children.forEach( function ( child ) {

			const attr = fbxTree.Objects.NodeAttribute[ child.ID ];

			if ( attr !== undefined ) {

				cameraAttribute = attr;

			}

		} );

		if ( cameraAttribute === undefined ) {

			model = new three__WEBPACK_IMPORTED_MODULE_0__.Object3D();

		} else {

			let type = 0;
			if ( cameraAttribute.CameraProjectionType !== undefined && cameraAttribute.CameraProjectionType.value === 1 ) {

				type = 1;

			}

			let nearClippingPlane = 1;
			if ( cameraAttribute.NearPlane !== undefined ) {

				nearClippingPlane = cameraAttribute.NearPlane.value / 1000;

			}

			let farClippingPlane = 1000;
			if ( cameraAttribute.FarPlane !== undefined ) {

				farClippingPlane = cameraAttribute.FarPlane.value / 1000;

			}


			let width = window.innerWidth;
			let height = window.innerHeight;

			if ( cameraAttribute.AspectWidth !== undefined && cameraAttribute.AspectHeight !== undefined ) {

				width = cameraAttribute.AspectWidth.value;
				height = cameraAttribute.AspectHeight.value;

			}

			const aspect = width / height;

			let fov = 45;
			if ( cameraAttribute.FieldOfView !== undefined ) {

				fov = cameraAttribute.FieldOfView.value;

			}

			const focalLength = cameraAttribute.FocalLength ? cameraAttribute.FocalLength.value : null;

			switch ( type ) {

				case 0: // Perspective
					model = new three__WEBPACK_IMPORTED_MODULE_0__.PerspectiveCamera( fov, aspect, nearClippingPlane, farClippingPlane );
					if ( focalLength !== null ) model.setFocalLength( focalLength );
					break;

				case 1: // Orthographic
					model = new three__WEBPACK_IMPORTED_MODULE_0__.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, nearClippingPlane, farClippingPlane );
					break;

				default:
					console.warn( 'THREE.FBXLoader: Unknown camera type ' + type + '.' );
					model = new three__WEBPACK_IMPORTED_MODULE_0__.Object3D();
					break;

			}

		}

		return model;

	}

	// Create a DirectionalLight, PointLight or SpotLight
	createLight( relationships ) {

		let model;
		let lightAttribute;

		relationships.children.forEach( function ( child ) {

			const attr = fbxTree.Objects.NodeAttribute[ child.ID ];

			if ( attr !== undefined ) {

				lightAttribute = attr;

			}

		} );

		if ( lightAttribute === undefined ) {

			model = new three__WEBPACK_IMPORTED_MODULE_0__.Object3D();

		} else {

			let type;

			// LightType can be undefined for Point lights
			if ( lightAttribute.LightType === undefined ) {

				type = 0;

			} else {

				type = lightAttribute.LightType.value;

			}

			let color = 0xffffff;

			if ( lightAttribute.Color !== undefined ) {

				color = new three__WEBPACK_IMPORTED_MODULE_0__.Color().fromArray( lightAttribute.Color.value ).convertSRGBToLinear();

			}

			let intensity = ( lightAttribute.Intensity === undefined ) ? 1 : lightAttribute.Intensity.value / 100;

			// light disabled
			if ( lightAttribute.CastLightOnObject !== undefined && lightAttribute.CastLightOnObject.value === 0 ) {

				intensity = 0;

			}

			let distance = 0;
			if ( lightAttribute.FarAttenuationEnd !== undefined ) {

				if ( lightAttribute.EnableFarAttenuation !== undefined && lightAttribute.EnableFarAttenuation.value === 0 ) {

					distance = 0;

				} else {

					distance = lightAttribute.FarAttenuationEnd.value;

				}

			}

			// TODO: could this be calculated linearly from FarAttenuationStart to FarAttenuationEnd?
			const decay = 1;

			switch ( type ) {

				case 0: // Point
					model = new three__WEBPACK_IMPORTED_MODULE_0__.PointLight( color, intensity, distance, decay );
					break;

				case 1: // Directional
					model = new three__WEBPACK_IMPORTED_MODULE_0__.DirectionalLight( color, intensity );
					break;

				case 2: // Spot
					let angle = Math.PI / 3;

					if ( lightAttribute.InnerAngle !== undefined ) {

						angle = three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad( lightAttribute.InnerAngle.value );

					}

					let penumbra = 0;
					if ( lightAttribute.OuterAngle !== undefined ) {

						// TODO: this is not correct - FBX calculates outer and inner angle in degrees
						// with OuterAngle > InnerAngle && OuterAngle <= Math.PI
						// while three.js uses a penumbra between (0, 1) to attenuate the inner angle
						penumbra = three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad( lightAttribute.OuterAngle.value );
						penumbra = Math.max( penumbra, 1 );

					}

					model = new three__WEBPACK_IMPORTED_MODULE_0__.SpotLight( color, intensity, distance, angle, penumbra, decay );
					break;

				default:
					console.warn( 'THREE.FBXLoader: Unknown light type ' + lightAttribute.LightType.value + ', defaulting to a PointLight.' );
					model = new three__WEBPACK_IMPORTED_MODULE_0__.PointLight( color, intensity );
					break;

			}

			if ( lightAttribute.CastShadows !== undefined && lightAttribute.CastShadows.value === 1 ) {

				model.castShadow = true;

			}

		}

		return model;

	}

	createMesh( relationships, geometryMap, materialMap ) {

		let model;
		let geometry = null;
		let material = null;
		const materials = [];

		// get geometry and materials(s) from connections
		relationships.children.forEach( function ( child ) {

			if ( geometryMap.has( child.ID ) ) {

				geometry = geometryMap.get( child.ID );

			}

			if ( materialMap.has( child.ID ) ) {

				materials.push( materialMap.get( child.ID ) );

			}

		} );

		if ( materials.length > 1 ) {

			material = materials;

		} else if ( materials.length > 0 ) {

			material = materials[ 0 ];

		} else {

			material = new three__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial( {
				name: three__WEBPACK_IMPORTED_MODULE_0__.Loader.DEFAULT_MATERIAL_NAME,
				color: 0xcccccc
			} );
			materials.push( material );

		}

		if ( 'color' in geometry.attributes ) {

			materials.forEach( function ( material ) {

				material.vertexColors = true;

			} );

		}

		if ( geometry.FBX_Deformer ) {

			model = new three__WEBPACK_IMPORTED_MODULE_0__.SkinnedMesh( geometry, material );
			model.normalizeSkinWeights();

		} else {

			model = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh( geometry, material );

		}

		return model;

	}

	createCurve( relationships, geometryMap ) {

		const geometry = relationships.children.reduce( function ( geo, child ) {

			if ( geometryMap.has( child.ID ) ) geo = geometryMap.get( child.ID );

			return geo;

		}, null );

		// FBX does not list materials for Nurbs lines, so we'll just put our own in here.
		const material = new three__WEBPACK_IMPORTED_MODULE_0__.LineBasicMaterial( {
			name: three__WEBPACK_IMPORTED_MODULE_0__.Loader.DEFAULT_MATERIAL_NAME,
			color: 0x3300ff,
			linewidth: 1
		} );
		return new three__WEBPACK_IMPORTED_MODULE_0__.Line( geometry, material );

	}

	// parse the model node for transform data
	getTransformData( model, modelNode ) {

		const transformData = {};

		if ( 'InheritType' in modelNode ) transformData.inheritType = parseInt( modelNode.InheritType.value );

		if ( 'RotationOrder' in modelNode ) transformData.eulerOrder = getEulerOrder( modelNode.RotationOrder.value );
		else transformData.eulerOrder = 'ZYX';

		if ( 'Lcl_Translation' in modelNode ) transformData.translation = modelNode.Lcl_Translation.value;

		if ( 'PreRotation' in modelNode ) transformData.preRotation = modelNode.PreRotation.value;
		if ( 'Lcl_Rotation' in modelNode ) transformData.rotation = modelNode.Lcl_Rotation.value;
		if ( 'PostRotation' in modelNode ) transformData.postRotation = modelNode.PostRotation.value;

		if ( 'Lcl_Scaling' in modelNode ) transformData.scale = modelNode.Lcl_Scaling.value;

		if ( 'ScalingOffset' in modelNode ) transformData.scalingOffset = modelNode.ScalingOffset.value;
		if ( 'ScalingPivot' in modelNode ) transformData.scalingPivot = modelNode.ScalingPivot.value;

		if ( 'RotationOffset' in modelNode ) transformData.rotationOffset = modelNode.RotationOffset.value;
		if ( 'RotationPivot' in modelNode ) transformData.rotationPivot = modelNode.RotationPivot.value;

		model.userData.transformData = transformData;

	}

	setLookAtProperties( model, modelNode ) {

		if ( 'LookAtProperty' in modelNode ) {

			const children = connections.get( model.ID ).children;

			children.forEach( function ( child ) {

				if ( child.relationship === 'LookAtProperty' ) {

					const lookAtTarget = fbxTree.Objects.Model[ child.ID ];

					if ( 'Lcl_Translation' in lookAtTarget ) {

						const pos = lookAtTarget.Lcl_Translation.value;

						// DirectionalLight, SpotLight
						if ( model.target !== undefined ) {

							model.target.position.fromArray( pos );
							sceneGraph.add( model.target );

						} else { // Cameras and other Object3Ds

							model.lookAt( new three__WEBPACK_IMPORTED_MODULE_0__.Vector3().fromArray( pos ) );

						}

					}

				}

			} );

		}

	}

	bindSkeleton( skeletons, geometryMap, modelMap ) {

		const bindMatrices = this.parsePoseNodes();

		for ( const ID in skeletons ) {

			const skeleton = skeletons[ ID ];

			const parents = connections.get( parseInt( skeleton.ID ) ).parents;

			parents.forEach( function ( parent ) {

				if ( geometryMap.has( parent.ID ) ) {

					const geoID = parent.ID;
					const geoRelationships = connections.get( geoID );

					geoRelationships.parents.forEach( function ( geoConnParent ) {

						if ( modelMap.has( geoConnParent.ID ) ) {

							const model = modelMap.get( geoConnParent.ID );

							model.bind( new three__WEBPACK_IMPORTED_MODULE_0__.Skeleton( skeleton.bones ), bindMatrices[ geoConnParent.ID ] );

						}

					} );

				}

			} );

		}

	}

	parsePoseNodes() {

		const bindMatrices = {};

		if ( 'Pose' in fbxTree.Objects ) {

			const BindPoseNode = fbxTree.Objects.Pose;

			for ( const nodeID in BindPoseNode ) {

				if ( BindPoseNode[ nodeID ].attrType === 'BindPose' && BindPoseNode[ nodeID ].NbPoseNodes > 0 ) {

					const poseNodes = BindPoseNode[ nodeID ].PoseNode;

					if ( Array.isArray( poseNodes ) ) {

						poseNodes.forEach( function ( poseNode ) {

							bindMatrices[ poseNode.Node ] = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4().fromArray( poseNode.Matrix.a );

						} );

					} else {

						bindMatrices[ poseNodes.Node ] = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4().fromArray( poseNodes.Matrix.a );

					}

				}

			}

		}

		return bindMatrices;

	}

	addGlobalSceneSettings() {

		if ( 'GlobalSettings' in fbxTree ) {

			if ( 'AmbientColor' in fbxTree.GlobalSettings ) {

				// Parse ambient color - if it's not set to black (default), create an ambient light

				const ambientColor = fbxTree.GlobalSettings.AmbientColor.value;
				const r = ambientColor[ 0 ];
				const g = ambientColor[ 1 ];
				const b = ambientColor[ 2 ];

				if ( r !== 0 || g !== 0 || b !== 0 ) {

					const color = new three__WEBPACK_IMPORTED_MODULE_0__.Color( r, g, b ).convertSRGBToLinear();
					sceneGraph.add( new three__WEBPACK_IMPORTED_MODULE_0__.AmbientLight( color, 1 ) );

				}

			}

			if ( 'UnitScaleFactor' in fbxTree.GlobalSettings ) {

				sceneGraph.userData.unitScaleFactor = fbxTree.GlobalSettings.UnitScaleFactor.value;

			}

		}

	}

}

// parse Geometry data from FBXTree and return map of BufferGeometries
class GeometryParser {

	constructor() {

		this.negativeMaterialIndices = false;

	}

	// Parse nodes in FBXTree.Objects.Geometry
	parse( deformers ) {

		const geometryMap = new Map();

		if ( 'Geometry' in fbxTree.Objects ) {

			const geoNodes = fbxTree.Objects.Geometry;

			for ( const nodeID in geoNodes ) {

				const relationships = connections.get( parseInt( nodeID ) );
				const geo = this.parseGeometry( relationships, geoNodes[ nodeID ], deformers );

				geometryMap.set( parseInt( nodeID ), geo );

			}

		}

		// report warnings

		if ( this.negativeMaterialIndices === true ) {

			console.warn( 'THREE.FBXLoader: The FBX file contains invalid (negative) material indices. The asset might not render as expected.' );

		}

		return geometryMap;

	}

	// Parse single node in FBXTree.Objects.Geometry
	parseGeometry( relationships, geoNode, deformers ) {

		switch ( geoNode.attrType ) {

			case 'Mesh':
				return this.parseMeshGeometry( relationships, geoNode, deformers );
				// removed by dead control flow
{}

			case 'NurbsCurve':
				return this.parseNurbsGeometry( geoNode );
				// removed by dead control flow
{}

		}

	}

	// Parse single node mesh geometry in FBXTree.Objects.Geometry
	parseMeshGeometry( relationships, geoNode, deformers ) {

		const skeletons = deformers.skeletons;
		const morphTargets = [];

		const modelNodes = relationships.parents.map( function ( parent ) {

			return fbxTree.Objects.Model[ parent.ID ];

		} );

		// don't create geometry if it is not associated with any models
		if ( modelNodes.length === 0 ) return;

		const skeleton = relationships.children.reduce( function ( skeleton, child ) {

			if ( skeletons[ child.ID ] !== undefined ) skeleton = skeletons[ child.ID ];

			return skeleton;

		}, null );

		relationships.children.forEach( function ( child ) {

			if ( deformers.morphTargets[ child.ID ] !== undefined ) {

				morphTargets.push( deformers.morphTargets[ child.ID ] );

			}

		} );

		// Assume one model and get the preRotation from that
		// if there is more than one model associated with the geometry this may cause problems
		const modelNode = modelNodes[ 0 ];

		const transformData = {};

		if ( 'RotationOrder' in modelNode ) transformData.eulerOrder = getEulerOrder( modelNode.RotationOrder.value );
		if ( 'InheritType' in modelNode ) transformData.inheritType = parseInt( modelNode.InheritType.value );

		if ( 'GeometricTranslation' in modelNode ) transformData.translation = modelNode.GeometricTranslation.value;
		if ( 'GeometricRotation' in modelNode ) transformData.rotation = modelNode.GeometricRotation.value;
		if ( 'GeometricScaling' in modelNode ) transformData.scale = modelNode.GeometricScaling.value;

		const transform = generateTransform( transformData );

		return this.genGeometry( geoNode, skeleton, morphTargets, transform );

	}

	// Generate a BufferGeometry from a node in FBXTree.Objects.Geometry
	genGeometry( geoNode, skeleton, morphTargets, preTransform ) {

		const geo = new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry();
		if ( geoNode.attrName ) geo.name = geoNode.attrName;

		const geoInfo = this.parseGeoNode( geoNode, skeleton );
		const buffers = this.genBuffers( geoInfo );

		const positionAttribute = new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( buffers.vertex, 3 );

		positionAttribute.applyMatrix4( preTransform );

		geo.setAttribute( 'position', positionAttribute );

		if ( buffers.colors.length > 0 ) {

			geo.setAttribute( 'color', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( buffers.colors, 3 ) );

		}

		if ( skeleton ) {

			geo.setAttribute( 'skinIndex', new three__WEBPACK_IMPORTED_MODULE_0__.Uint16BufferAttribute( buffers.weightsIndices, 4 ) );

			geo.setAttribute( 'skinWeight', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( buffers.vertexWeights, 4 ) );

			// used later to bind the skeleton to the model
			geo.FBX_Deformer = skeleton;

		}

		if ( buffers.normal.length > 0 ) {

			const normalMatrix = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix3().getNormalMatrix( preTransform );

			const normalAttribute = new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( buffers.normal, 3 );
			normalAttribute.applyNormalMatrix( normalMatrix );

			geo.setAttribute( 'normal', normalAttribute );

		}

		buffers.uvs.forEach( function ( uvBuffer, i ) {

			const name = i === 0 ? 'uv' : `uv${ i }`;

			geo.setAttribute( name, new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( buffers.uvs[ i ], 2 ) );

		} );

		if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

			// Convert the material indices of each vertex into rendering groups on the geometry.
			let prevMaterialIndex = buffers.materialIndex[ 0 ];
			let startIndex = 0;

			buffers.materialIndex.forEach( function ( currentIndex, i ) {

				if ( currentIndex !== prevMaterialIndex ) {

					geo.addGroup( startIndex, i - startIndex, prevMaterialIndex );

					prevMaterialIndex = currentIndex;
					startIndex = i;

				}

			} );

			// the loop above doesn't add the last group, do that here.
			if ( geo.groups.length > 0 ) {

				const lastGroup = geo.groups[ geo.groups.length - 1 ];
				const lastIndex = lastGroup.start + lastGroup.count;

				if ( lastIndex !== buffers.materialIndex.length ) {

					geo.addGroup( lastIndex, buffers.materialIndex.length - lastIndex, prevMaterialIndex );

				}

			}

			// case where there are multiple materials but the whole geometry is only
			// using one of them
			if ( geo.groups.length === 0 ) {

				geo.addGroup( 0, buffers.materialIndex.length, buffers.materialIndex[ 0 ] );

			}

		}

		this.addMorphTargets( geo, geoNode, morphTargets, preTransform );

		return geo;

	}

	parseGeoNode( geoNode, skeleton ) {

		const geoInfo = {};

		geoInfo.vertexPositions = ( geoNode.Vertices !== undefined ) ? geoNode.Vertices.a : [];
		geoInfo.vertexIndices = ( geoNode.PolygonVertexIndex !== undefined ) ? geoNode.PolygonVertexIndex.a : [];

		if ( geoNode.LayerElementColor ) {

			geoInfo.color = this.parseVertexColors( geoNode.LayerElementColor[ 0 ] );

		}

		if ( geoNode.LayerElementMaterial ) {

			geoInfo.material = this.parseMaterialIndices( geoNode.LayerElementMaterial[ 0 ] );

		}

		if ( geoNode.LayerElementNormal ) {

			geoInfo.normal = this.parseNormals( geoNode.LayerElementNormal[ 0 ] );

		}

		if ( geoNode.LayerElementUV ) {

			geoInfo.uv = [];

			let i = 0;
			while ( geoNode.LayerElementUV[ i ] ) {

				if ( geoNode.LayerElementUV[ i ].UV ) {

					geoInfo.uv.push( this.parseUVs( geoNode.LayerElementUV[ i ] ) );

				}

				i ++;

			}

		}

		geoInfo.weightTable = {};

		if ( skeleton !== null ) {

			geoInfo.skeleton = skeleton;

			skeleton.rawBones.forEach( function ( rawBone, i ) {

				// loop over the bone's vertex indices and weights
				rawBone.indices.forEach( function ( index, j ) {

					if ( geoInfo.weightTable[ index ] === undefined ) geoInfo.weightTable[ index ] = [];

					geoInfo.weightTable[ index ].push( {

						id: i,
						weight: rawBone.weights[ j ],

					} );

				} );

			} );

		}

		return geoInfo;

	}

	genBuffers( geoInfo ) {

		const buffers = {
			vertex: [],
			normal: [],
			colors: [],
			uvs: [],
			materialIndex: [],
			vertexWeights: [],
			weightsIndices: [],
		};

		let polygonIndex = 0;
		let faceLength = 0;
		let displayedWeightsWarning = false;

		// these will hold data for a single face
		let facePositionIndexes = [];
		let faceNormals = [];
		let faceColors = [];
		let faceUVs = [];
		let faceWeights = [];
		let faceWeightIndices = [];

		const scope = this;
		geoInfo.vertexIndices.forEach( function ( vertexIndex, polygonVertexIndex ) {

			let materialIndex;
			let endOfFace = false;

			// Face index and vertex index arrays are combined in a single array
			// A cube with quad faces looks like this:
			// PolygonVertexIndex: *24 {
			//  a: 0, 1, 3, -3, 2, 3, 5, -5, 4, 5, 7, -7, 6, 7, 1, -1, 1, 7, 5, -4, 6, 0, 2, -5
			//  }
			// Negative numbers mark the end of a face - first face here is 0, 1, 3, -3
			// to find index of last vertex bit shift the index: ^ - 1
			if ( vertexIndex < 0 ) {

				vertexIndex = vertexIndex ^ - 1; // equivalent to ( x * -1 ) - 1
				endOfFace = true;

			}

			let weightIndices = [];
			let weights = [];

			facePositionIndexes.push( vertexIndex * 3, vertexIndex * 3 + 1, vertexIndex * 3 + 2 );

			if ( geoInfo.color ) {

				const data = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.color );

				faceColors.push( data[ 0 ], data[ 1 ], data[ 2 ] );

			}

			if ( geoInfo.skeleton ) {

				if ( geoInfo.weightTable[ vertexIndex ] !== undefined ) {

					geoInfo.weightTable[ vertexIndex ].forEach( function ( wt ) {

						weights.push( wt.weight );
						weightIndices.push( wt.id );

					} );


				}

				if ( weights.length > 4 ) {

					if ( ! displayedWeightsWarning ) {

						console.warn( 'THREE.FBXLoader: Vertex has more than 4 skinning weights assigned to vertex. Deleting additional weights.' );
						displayedWeightsWarning = true;

					}

					const wIndex = [ 0, 0, 0, 0 ];
					const Weight = [ 0, 0, 0, 0 ];

					weights.forEach( function ( weight, weightIndex ) {

						let currentWeight = weight;
						let currentIndex = weightIndices[ weightIndex ];

						Weight.forEach( function ( comparedWeight, comparedWeightIndex, comparedWeightArray ) {

							if ( currentWeight > comparedWeight ) {

								comparedWeightArray[ comparedWeightIndex ] = currentWeight;
								currentWeight = comparedWeight;

								const tmp = wIndex[ comparedWeightIndex ];
								wIndex[ comparedWeightIndex ] = currentIndex;
								currentIndex = tmp;

							}

						} );

					} );

					weightIndices = wIndex;
					weights = Weight;

				}

				// if the weight array is shorter than 4 pad with 0s
				while ( weights.length < 4 ) {

					weights.push( 0 );
					weightIndices.push( 0 );

				}

				for ( let i = 0; i < 4; ++ i ) {

					faceWeights.push( weights[ i ] );
					faceWeightIndices.push( weightIndices[ i ] );

				}

			}

			if ( geoInfo.normal ) {

				const data = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.normal );

				faceNormals.push( data[ 0 ], data[ 1 ], data[ 2 ] );

			}

			if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

				materialIndex = getData( polygonVertexIndex, polygonIndex, vertexIndex, geoInfo.material )[ 0 ];

				if ( materialIndex < 0 ) {

					scope.negativeMaterialIndices = true;
					materialIndex = 0; // fallback

				}

			}

			if ( geoInfo.uv ) {

				geoInfo.uv.forEach( function ( uv, i ) {

					const data = getData( polygonVertexIndex, polygonIndex, vertexIndex, uv );

					if ( faceUVs[ i ] === undefined ) {

						faceUVs[ i ] = [];

					}

					faceUVs[ i ].push( data[ 0 ] );
					faceUVs[ i ].push( data[ 1 ] );

				} );

			}

			faceLength ++;

			if ( endOfFace ) {

				scope.genFace( buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength );

				polygonIndex ++;
				faceLength = 0;

				// reset arrays for the next face
				facePositionIndexes = [];
				faceNormals = [];
				faceColors = [];
				faceUVs = [];
				faceWeights = [];
				faceWeightIndices = [];

			}

		} );

		return buffers;

	}

	// See https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
	getNormalNewell( vertices ) {

		const normal = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3( 0.0, 0.0, 0.0 );

		for ( let i = 0; i < vertices.length; i ++ ) {

			const current = vertices[ i ];
			const next = vertices[ ( i + 1 ) % vertices.length ];

			normal.x += ( current.y - next.y ) * ( current.z + next.z );
			normal.y += ( current.z - next.z ) * ( current.x + next.x );
			normal.z += ( current.x - next.x ) * ( current.y + next.y );

		}

		normal.normalize();

		return normal;

	}

	getNormalTangentAndBitangent( vertices ) {

		const normalVector = this.getNormalNewell( vertices );
		// Avoid up being equal or almost equal to normalVector
		const up = Math.abs( normalVector.z ) > 0.5 ? new three__WEBPACK_IMPORTED_MODULE_0__.Vector3( 0.0, 1.0, 0.0 ) : new three__WEBPACK_IMPORTED_MODULE_0__.Vector3( 0.0, 0.0, 1.0 );
		const tangent = up.cross( normalVector ).normalize();
		const bitangent = normalVector.clone().cross( tangent ).normalize();

		return {
			normal: normalVector,
			tangent: tangent,
			bitangent: bitangent
		};

	}

	flattenVertex( vertex, normalTangent, normalBitangent ) {

		return new three__WEBPACK_IMPORTED_MODULE_0__.Vector2(
			vertex.dot( normalTangent ),
			vertex.dot( normalBitangent )
		);

	}

	// Generate data for a single face in a geometry. If the face is a quad then split it into 2 tris
	genFace( buffers, geoInfo, facePositionIndexes, materialIndex, faceNormals, faceColors, faceUVs, faceWeights, faceWeightIndices, faceLength ) {

		let triangles;

		if ( faceLength > 3 ) {

			// Triangulate n-gon using earcut

			const vertices = [];

			for ( let i = 0; i < facePositionIndexes.length; i += 3 ) {

				vertices.push( new three__WEBPACK_IMPORTED_MODULE_0__.Vector3(
					geoInfo.vertexPositions[ facePositionIndexes[ i ] ],
					geoInfo.vertexPositions[ facePositionIndexes[ i + 1 ] ],
					geoInfo.vertexPositions[ facePositionIndexes[ i + 2 ] ]
				) );

			}

			const { tangent, bitangent } = this.getNormalTangentAndBitangent( vertices );
			const triangulationInput = [];

			for ( const vertex of vertices ) {

				triangulationInput.push( this.flattenVertex( vertex, tangent, bitangent ) );

			}

			triangles = three__WEBPACK_IMPORTED_MODULE_0__.ShapeUtils.triangulateShape( triangulationInput, [] );

		} else {

			// Regular triangle, skip earcut triangulation step
			triangles = [[ 0, 1, 2 ]];

		}

		for ( const [ i0, i1, i2 ] of triangles ) {

			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i0 * 3 ] ] );
			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i0 * 3 + 1 ] ] );
			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i0 * 3 + 2 ] ] );

			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i1 * 3 ] ] );
			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i1 * 3 + 1 ] ] );
			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i1 * 3 + 2 ] ] );

			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i2 * 3 ] ] );
			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i2 * 3 + 1 ] ] );
			buffers.vertex.push( geoInfo.vertexPositions[ facePositionIndexes[ i2 * 3 + 2 ] ] );

			if ( geoInfo.skeleton ) {

				buffers.vertexWeights.push( faceWeights[ i0 * 4 ] );
				buffers.vertexWeights.push( faceWeights[ i0 * 4 + 1 ] );
				buffers.vertexWeights.push( faceWeights[ i0 * 4 + 2 ] );
				buffers.vertexWeights.push( faceWeights[ i0 * 4 + 3 ] );

				buffers.vertexWeights.push( faceWeights[ i1 * 4 ] );
				buffers.vertexWeights.push( faceWeights[ i1 * 4 + 1 ] );
				buffers.vertexWeights.push( faceWeights[ i1 * 4 + 2 ] );
				buffers.vertexWeights.push( faceWeights[ i1 * 4 + 3 ] );

				buffers.vertexWeights.push( faceWeights[ i2 * 4 ] );
				buffers.vertexWeights.push( faceWeights[ i2 * 4 + 1 ] );
				buffers.vertexWeights.push( faceWeights[ i2 * 4 + 2 ] );
				buffers.vertexWeights.push( faceWeights[ i2 * 4 + 3 ] );

				buffers.weightsIndices.push( faceWeightIndices[ i0 * 4 ] );
				buffers.weightsIndices.push( faceWeightIndices[ i0 * 4 + 1 ] );
				buffers.weightsIndices.push( faceWeightIndices[ i0 * 4 + 2 ] );
				buffers.weightsIndices.push( faceWeightIndices[ i0 * 4 + 3 ] );

				buffers.weightsIndices.push( faceWeightIndices[ i1 * 4 ] );
				buffers.weightsIndices.push( faceWeightIndices[ i1 * 4 + 1 ] );
				buffers.weightsIndices.push( faceWeightIndices[ i1 * 4 + 2 ] );
				buffers.weightsIndices.push( faceWeightIndices[ i1 * 4 + 3 ] );

				buffers.weightsIndices.push( faceWeightIndices[ i2 * 4 ] );
				buffers.weightsIndices.push( faceWeightIndices[ i2 * 4 + 1 ] );
				buffers.weightsIndices.push( faceWeightIndices[ i2 * 4 + 2 ] );
				buffers.weightsIndices.push( faceWeightIndices[ i2 * 4 + 3 ] );

			}

			if ( geoInfo.color ) {

				buffers.colors.push( faceColors[ i0 * 3 ] );
				buffers.colors.push( faceColors[ i0 * 3 + 1 ] );
				buffers.colors.push( faceColors[ i0 * 3 + 2 ] );

				buffers.colors.push( faceColors[ i1 * 3 ] );
				buffers.colors.push( faceColors[ i1 * 3 + 1 ] );
				buffers.colors.push( faceColors[ i1 * 3 + 2 ] );

				buffers.colors.push( faceColors[ i2 * 3 ] );
				buffers.colors.push( faceColors[ i2 * 3 + 1 ] );
				buffers.colors.push( faceColors[ i2 * 3 + 2 ] );

			}

			if ( geoInfo.material && geoInfo.material.mappingType !== 'AllSame' ) {

				buffers.materialIndex.push( materialIndex );
				buffers.materialIndex.push( materialIndex );
				buffers.materialIndex.push( materialIndex );

			}

			if ( geoInfo.normal ) {

				buffers.normal.push( faceNormals[ i0 * 3 ] );
				buffers.normal.push( faceNormals[ i0 * 3 + 1 ] );
				buffers.normal.push( faceNormals[ i0 * 3 + 2 ] );

				buffers.normal.push( faceNormals[ i1 * 3 ] );
				buffers.normal.push( faceNormals[ i1 * 3 + 1 ] );
				buffers.normal.push( faceNormals[ i1 * 3 + 2 ] );

				buffers.normal.push( faceNormals[ i2 * 3 ] );
				buffers.normal.push( faceNormals[ i2 * 3 + 1 ] );
				buffers.normal.push( faceNormals[ i2 * 3 + 2 ] );

			}

			if ( geoInfo.uv ) {

				geoInfo.uv.forEach( function ( uv, j ) {

					if ( buffers.uvs[ j ] === undefined ) buffers.uvs[ j ] = [];

					buffers.uvs[ j ].push( faceUVs[ j ][ i0 * 2 ] );
					buffers.uvs[ j ].push( faceUVs[ j ][ i0 * 2 + 1 ] );

					buffers.uvs[ j ].push( faceUVs[ j ][ i1 * 2 ] );
					buffers.uvs[ j ].push( faceUVs[ j ][ i1 * 2 + 1 ] );

					buffers.uvs[ j ].push( faceUVs[ j ][ i2 * 2 ] );
					buffers.uvs[ j ].push( faceUVs[ j ][ i2 * 2 + 1 ] );

				} );

			}

		}

	}

	addMorphTargets( parentGeo, parentGeoNode, morphTargets, preTransform ) {

		if ( morphTargets.length === 0 ) return;

		parentGeo.morphTargetsRelative = true;

		parentGeo.morphAttributes.position = [];
		// parentGeo.morphAttributes.normal = []; // not implemented

		const scope = this;
		morphTargets.forEach( function ( morphTarget ) {

			morphTarget.rawTargets.forEach( function ( rawTarget ) {

				const morphGeoNode = fbxTree.Objects.Geometry[ rawTarget.geoID ];

				if ( morphGeoNode !== undefined ) {

					scope.genMorphGeometry( parentGeo, parentGeoNode, morphGeoNode, preTransform, rawTarget.name );

				}

			} );

		} );

	}

	// a morph geometry node is similar to a standard  node, and the node is also contained
	// in FBXTree.Objects.Geometry, however it can only have attributes for position, normal
	// and a special attribute Index defining which vertices of the original geometry are affected
	// Normal and position attributes only have data for the vertices that are affected by the morph
	genMorphGeometry( parentGeo, parentGeoNode, morphGeoNode, preTransform, name ) {

		const vertexIndices = ( parentGeoNode.PolygonVertexIndex !== undefined ) ? parentGeoNode.PolygonVertexIndex.a : [];

		const morphPositionsSparse = ( morphGeoNode.Vertices !== undefined ) ? morphGeoNode.Vertices.a : [];
		const indices = ( morphGeoNode.Indexes !== undefined ) ? morphGeoNode.Indexes.a : [];

		const length = parentGeo.attributes.position.count * 3;
		const morphPositions = new Float32Array( length );

		for ( let i = 0; i < indices.length; i ++ ) {

			const morphIndex = indices[ i ] * 3;

			morphPositions[ morphIndex ] = morphPositionsSparse[ i * 3 ];
			morphPositions[ morphIndex + 1 ] = morphPositionsSparse[ i * 3 + 1 ];
			morphPositions[ morphIndex + 2 ] = morphPositionsSparse[ i * 3 + 2 ];

		}

		// TODO: add morph normal support
		const morphGeoInfo = {
			vertexIndices: vertexIndices,
			vertexPositions: morphPositions,

		};

		const morphBuffers = this.genBuffers( morphGeoInfo );

		const positionAttribute = new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute( morphBuffers.vertex, 3 );
		positionAttribute.name = name || morphGeoNode.attrName;

		positionAttribute.applyMatrix4( preTransform );

		parentGeo.morphAttributes.position.push( positionAttribute );

	}

	// Parse normal from FBXTree.Objects.Geometry.LayerElementNormal if it exists
	parseNormals( NormalNode ) {

		const mappingType = NormalNode.MappingInformationType;
		const referenceType = NormalNode.ReferenceInformationType;
		const buffer = NormalNode.Normals.a;
		let indexBuffer = [];
		if ( referenceType === 'IndexToDirect' ) {

			if ( 'NormalIndex' in NormalNode ) {

				indexBuffer = NormalNode.NormalIndex.a;

			} else if ( 'NormalsIndex' in NormalNode ) {

				indexBuffer = NormalNode.NormalsIndex.a;

			}

		}

		return {
			dataSize: 3,
			buffer: buffer,
			indices: indexBuffer,
			mappingType: mappingType,
			referenceType: referenceType
		};

	}

	// Parse UVs from FBXTree.Objects.Geometry.LayerElementUV if it exists
	parseUVs( UVNode ) {

		const mappingType = UVNode.MappingInformationType;
		const referenceType = UVNode.ReferenceInformationType;
		const buffer = UVNode.UV.a;
		let indexBuffer = [];
		if ( referenceType === 'IndexToDirect' ) {

			indexBuffer = UVNode.UVIndex.a;

		}

		return {
			dataSize: 2,
			buffer: buffer,
			indices: indexBuffer,
			mappingType: mappingType,
			referenceType: referenceType
		};

	}

	// Parse Vertex Colors from FBXTree.Objects.Geometry.LayerElementColor if it exists
	parseVertexColors( ColorNode ) {

		const mappingType = ColorNode.MappingInformationType;
		const referenceType = ColorNode.ReferenceInformationType;
		const buffer = ColorNode.Colors.a;
		let indexBuffer = [];
		if ( referenceType === 'IndexToDirect' ) {

			indexBuffer = ColorNode.ColorIndex.a;

		}

		for ( let i = 0, c = new three__WEBPACK_IMPORTED_MODULE_0__.Color(); i < buffer.length; i += 4 ) {

			c.fromArray( buffer, i ).convertSRGBToLinear().toArray( buffer, i );

		}

		return {
			dataSize: 4,
			buffer: buffer,
			indices: indexBuffer,
			mappingType: mappingType,
			referenceType: referenceType
		};

	}

	// Parse mapping and material data in FBXTree.Objects.Geometry.LayerElementMaterial if it exists
	parseMaterialIndices( MaterialNode ) {

		const mappingType = MaterialNode.MappingInformationType;
		const referenceType = MaterialNode.ReferenceInformationType;

		if ( mappingType === 'NoMappingInformation' ) {

			return {
				dataSize: 1,
				buffer: [ 0 ],
				indices: [ 0 ],
				mappingType: 'AllSame',
				referenceType: referenceType
			};

		}

		const materialIndexBuffer = MaterialNode.Materials.a;

		// Since materials are stored as indices, there's a bit of a mismatch between FBX and what
		// we expect.So we create an intermediate buffer that points to the index in the buffer,
		// for conforming with the other functions we've written for other data.
		const materialIndices = [];

		for ( let i = 0; i < materialIndexBuffer.length; ++ i ) {

			materialIndices.push( i );

		}

		return {
			dataSize: 1,
			buffer: materialIndexBuffer,
			indices: materialIndices,
			mappingType: mappingType,
			referenceType: referenceType
		};

	}

	// Generate a NurbGeometry from a node in FBXTree.Objects.Geometry
	parseNurbsGeometry( geoNode ) {

		const order = parseInt( geoNode.Order );

		if ( isNaN( order ) ) {

			console.error( 'THREE.FBXLoader: Invalid Order %s given for geometry ID: %s', geoNode.Order, geoNode.id );
			return new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry();

		}

		const degree = order - 1;

		const knots = geoNode.KnotVector.a;
		const controlPoints = [];
		const pointsValues = geoNode.Points.a;

		for ( let i = 0, l = pointsValues.length; i < l; i += 4 ) {

			controlPoints.push( new three__WEBPACK_IMPORTED_MODULE_0__.Vector4().fromArray( pointsValues, i ) );

		}

		let startKnot, endKnot;

		if ( geoNode.Form === 'Closed' ) {

			controlPoints.push( controlPoints[ 0 ] );

		} else if ( geoNode.Form === 'Periodic' ) {

			startKnot = degree;
			endKnot = knots.length - 1 - startKnot;

			for ( let i = 0; i < degree; ++ i ) {

				controlPoints.push( controlPoints[ i ] );

			}

		}

		const curve = new _curves_NURBSCurve_js__WEBPACK_IMPORTED_MODULE_1__.NURBSCurve( degree, knots, controlPoints, startKnot, endKnot );
		const points = curve.getPoints( controlPoints.length * 12 );

		return new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry().setFromPoints( points );

	}

}

// parse animation data from FBXTree
class AnimationParser {

	// take raw animation clips and turn them into three.js animation clips
	parse() {

		const animationClips = [];

		const rawClips = this.parseClips();

		if ( rawClips !== undefined ) {

			for ( const key in rawClips ) {

				const rawClip = rawClips[ key ];

				const clip = this.addClip( rawClip );

				animationClips.push( clip );

			}

		}

		return animationClips;

	}

	parseClips() {

		// since the actual transformation data is stored in FBXTree.Objects.AnimationCurve,
		// if this is undefined we can safely assume there are no animations
		if ( fbxTree.Objects.AnimationCurve === undefined ) return undefined;

		const curveNodesMap = this.parseAnimationCurveNodes();

		this.parseAnimationCurves( curveNodesMap );

		const layersMap = this.parseAnimationLayers( curveNodesMap );
		const rawClips = this.parseAnimStacks( layersMap );

		return rawClips;

	}

	// parse nodes in FBXTree.Objects.AnimationCurveNode
	// each AnimationCurveNode holds data for an animation transform for a model (e.g. left arm rotation )
	// and is referenced by an AnimationLayer
	parseAnimationCurveNodes() {

		const rawCurveNodes = fbxTree.Objects.AnimationCurveNode;

		const curveNodesMap = new Map();

		for ( const nodeID in rawCurveNodes ) {

			const rawCurveNode = rawCurveNodes[ nodeID ];

			if ( rawCurveNode.attrName.match( /S|R|T|DeformPercent/ ) !== null ) {

				const curveNode = {

					id: rawCurveNode.id,
					attr: rawCurveNode.attrName,
					curves: {},

				};

				curveNodesMap.set( curveNode.id, curveNode );

			}

		}

		return curveNodesMap;

	}

	// parse nodes in FBXTree.Objects.AnimationCurve and connect them up to
	// previously parsed AnimationCurveNodes. Each AnimationCurve holds data for a single animated
	// axis ( e.g. times and values of x rotation)
	parseAnimationCurves( curveNodesMap ) {

		const rawCurves = fbxTree.Objects.AnimationCurve;

		// TODO: Many values are identical up to roundoff error, but won't be optimised
		// e.g. position times: [0, 0.4, 0. 8]
		// position values: [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.23538335023477e-7, 93.67518615722656, -0.9982695579528809, 7.235384487103147e-7, 93.67520904541016, -0.9982695579528809]
		// clearly, this should be optimised to
		// times: [0], positions [7.23538335023477e-7, 93.67518615722656, -0.9982695579528809]
		// this shows up in nearly every FBX file, and generally time array is length > 100

		for ( const nodeID in rawCurves ) {

			const animationCurve = {

				id: rawCurves[ nodeID ].id,
				times: rawCurves[ nodeID ].KeyTime.a.map( convertFBXTimeToSeconds ),
				values: rawCurves[ nodeID ].KeyValueFloat.a,

			};

			const relationships = connections.get( animationCurve.id );

			if ( relationships !== undefined ) {

				const animationCurveID = relationships.parents[ 0 ].ID;
				const animationCurveRelationship = relationships.parents[ 0 ].relationship;

				if ( animationCurveRelationship.match( /X/ ) ) {

					curveNodesMap.get( animationCurveID ).curves[ 'x' ] = animationCurve;

				} else if ( animationCurveRelationship.match( /Y/ ) ) {

					curveNodesMap.get( animationCurveID ).curves[ 'y' ] = animationCurve;

				} else if ( animationCurveRelationship.match( /Z/ ) ) {

					curveNodesMap.get( animationCurveID ).curves[ 'z' ] = animationCurve;

				} else if ( animationCurveRelationship.match( /DeformPercent/ ) && curveNodesMap.has( animationCurveID ) ) {

					curveNodesMap.get( animationCurveID ).curves[ 'morph' ] = animationCurve;

				}

			}

		}

	}

	// parse nodes in FBXTree.Objects.AnimationLayer. Each layers holds references
	// to various AnimationCurveNodes and is referenced by an AnimationStack node
	// note: theoretically a stack can have multiple layers, however in practice there always seems to be one per stack
	parseAnimationLayers( curveNodesMap ) {

		const rawLayers = fbxTree.Objects.AnimationLayer;

		const layersMap = new Map();

		for ( const nodeID in rawLayers ) {

			const layerCurveNodes = [];

			const connection = connections.get( parseInt( nodeID ) );

			if ( connection !== undefined ) {

				// all the animationCurveNodes used in the layer
				const children = connection.children;

				children.forEach( function ( child, i ) {

					if ( curveNodesMap.has( child.ID ) ) {

						const curveNode = curveNodesMap.get( child.ID );

						// check that the curves are defined for at least one axis, otherwise ignore the curveNode
						if ( curveNode.curves.x !== undefined || curveNode.curves.y !== undefined || curveNode.curves.z !== undefined ) {

							if ( layerCurveNodes[ i ] === undefined ) {

								const modelID = connections.get( child.ID ).parents.filter( function ( parent ) {

									return parent.relationship !== undefined;

								} )[ 0 ].ID;

								if ( modelID !== undefined ) {

									const rawModel = fbxTree.Objects.Model[ modelID.toString() ];

									if ( rawModel === undefined ) {

										console.warn( 'THREE.FBXLoader: Encountered a unused curve.', child );
										return;

									}

									const node = {

										modelName: rawModel.attrName ? three__WEBPACK_IMPORTED_MODULE_0__.PropertyBinding.sanitizeNodeName( rawModel.attrName ) : '',
										ID: rawModel.id,
										initialPosition: [ 0, 0, 0 ],
										initialRotation: [ 0, 0, 0 ],
										initialScale: [ 1, 1, 1 ],

									};

									sceneGraph.traverse( function ( child ) {

										if ( child.ID === rawModel.id ) {

											node.transform = child.matrix;

											if ( child.userData.transformData ) node.eulerOrder = child.userData.transformData.eulerOrder;

										}

									} );

									if ( ! node.transform ) node.transform = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();

									// if the animated model is pre rotated, we'll have to apply the pre rotations to every
									// animation value as well
									if ( 'PreRotation' in rawModel ) node.preRotation = rawModel.PreRotation.value;
									if ( 'PostRotation' in rawModel ) node.postRotation = rawModel.PostRotation.value;

									layerCurveNodes[ i ] = node;

								}

							}

							if ( layerCurveNodes[ i ] ) layerCurveNodes[ i ][ curveNode.attr ] = curveNode;

						} else if ( curveNode.curves.morph !== undefined ) {

							if ( layerCurveNodes[ i ] === undefined ) {

								const deformerID = connections.get( child.ID ).parents.filter( function ( parent ) {

									return parent.relationship !== undefined;

								} )[ 0 ].ID;

								const morpherID = connections.get( deformerID ).parents[ 0 ].ID;
								const geoID = connections.get( morpherID ).parents[ 0 ].ID;

								// assuming geometry is not used in more than one model
								const modelID = connections.get( geoID ).parents[ 0 ].ID;

								const rawModel = fbxTree.Objects.Model[ modelID ];

								const node = {

									modelName: rawModel.attrName ? three__WEBPACK_IMPORTED_MODULE_0__.PropertyBinding.sanitizeNodeName( rawModel.attrName ) : '',
									morphName: fbxTree.Objects.Deformer[ deformerID ].attrName,

								};

								layerCurveNodes[ i ] = node;

							}

							layerCurveNodes[ i ][ curveNode.attr ] = curveNode;

						}

					}

				} );

				layersMap.set( parseInt( nodeID ), layerCurveNodes );

			}

		}

		return layersMap;

	}

	// parse nodes in FBXTree.Objects.AnimationStack. These are the top level node in the animation
	// hierarchy. Each Stack node will be used to create a AnimationClip
	parseAnimStacks( layersMap ) {

		const rawStacks = fbxTree.Objects.AnimationStack;

		// connect the stacks (clips) up to the layers
		const rawClips = {};

		for ( const nodeID in rawStacks ) {

			const children = connections.get( parseInt( nodeID ) ).children;

			if ( children.length > 1 ) {

				// it seems like stacks will always be associated with a single layer. But just in case there are files
				// where there are multiple layers per stack, we'll display a warning
				console.warn( 'THREE.FBXLoader: Encountered an animation stack with multiple layers, this is currently not supported. Ignoring subsequent layers.' );

			}

			const layer = layersMap.get( children[ 0 ].ID );

			rawClips[ nodeID ] = {

				name: rawStacks[ nodeID ].attrName,
				layer: layer,

			};

		}

		return rawClips;

	}

	addClip( rawClip ) {

		let tracks = [];

		const scope = this;
		rawClip.layer.forEach( function ( rawTracks ) {

			tracks = tracks.concat( scope.generateTracks( rawTracks ) );

		} );

		return new three__WEBPACK_IMPORTED_MODULE_0__.AnimationClip( rawClip.name, - 1, tracks );

	}

	generateTracks( rawTracks ) {

		const tracks = [];

		let initialPosition = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();
		let initialScale = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

		if ( rawTracks.transform ) rawTracks.transform.decompose( initialPosition, new three__WEBPACK_IMPORTED_MODULE_0__.Quaternion(), initialScale );

		initialPosition = initialPosition.toArray();
		initialScale = initialScale.toArray();

		if ( rawTracks.T !== undefined && Object.keys( rawTracks.T.curves ).length > 0 ) {

			const positionTrack = this.generateVectorTrack( rawTracks.modelName, rawTracks.T.curves, initialPosition, 'position' );
			if ( positionTrack !== undefined ) tracks.push( positionTrack );

		}

		if ( rawTracks.R !== undefined && Object.keys( rawTracks.R.curves ).length > 0 ) {

			const rotationTrack = this.generateRotationTrack( rawTracks.modelName, rawTracks.R.curves, rawTracks.preRotation, rawTracks.postRotation, rawTracks.eulerOrder );
			if ( rotationTrack !== undefined ) tracks.push( rotationTrack );

		}

		if ( rawTracks.S !== undefined && Object.keys( rawTracks.S.curves ).length > 0 ) {

			const scaleTrack = this.generateVectorTrack( rawTracks.modelName, rawTracks.S.curves, initialScale, 'scale' );
			if ( scaleTrack !== undefined ) tracks.push( scaleTrack );

		}

		if ( rawTracks.DeformPercent !== undefined ) {

			const morphTrack = this.generateMorphTrack( rawTracks );
			if ( morphTrack !== undefined ) tracks.push( morphTrack );

		}

		return tracks;

	}

	generateVectorTrack( modelName, curves, initialValue, type ) {

		const times = this.getTimesForAllAxes( curves );
		const values = this.getKeyframeTrackValues( times, curves, initialValue );

		return new three__WEBPACK_IMPORTED_MODULE_0__.VectorKeyframeTrack( modelName + '.' + type, times, values );

	}

	generateRotationTrack( modelName, curves, preRotation, postRotation, eulerOrder ) {

		let times;
		let values;

		if ( curves.x !== undefined && curves.y !== undefined && curves.z !== undefined ) {

			const result = this.interpolateRotations( curves.x, curves.y, curves.z, eulerOrder );

			times = result[ 0 ];
			values = result[ 1 ];

		}

		if ( preRotation !== undefined ) {

			preRotation = preRotation.map( three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad );
			preRotation.push( eulerOrder );

			preRotation = new three__WEBPACK_IMPORTED_MODULE_0__.Euler().fromArray( preRotation );
			preRotation = new three__WEBPACK_IMPORTED_MODULE_0__.Quaternion().setFromEuler( preRotation );

		}

		if ( postRotation !== undefined ) {

			postRotation = postRotation.map( three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad );
			postRotation.push( eulerOrder );

			postRotation = new three__WEBPACK_IMPORTED_MODULE_0__.Euler().fromArray( postRotation );
			postRotation = new three__WEBPACK_IMPORTED_MODULE_0__.Quaternion().setFromEuler( postRotation ).invert();

		}

		const quaternion = new three__WEBPACK_IMPORTED_MODULE_0__.Quaternion();
		const euler = new three__WEBPACK_IMPORTED_MODULE_0__.Euler();

		const quaternionValues = [];

		if ( ! values || ! times ) return new three__WEBPACK_IMPORTED_MODULE_0__.QuaternionKeyframeTrack( modelName + '.quaternion', [ 0 ], [ 0 ] );

		for ( let i = 0; i < values.length; i += 3 ) {

			euler.set( values[ i ], values[ i + 1 ], values[ i + 2 ], eulerOrder );
			quaternion.setFromEuler( euler );

			if ( preRotation !== undefined ) quaternion.premultiply( preRotation );
			if ( postRotation !== undefined ) quaternion.multiply( postRotation );

			// Check unroll
			if ( i > 2 ) {

				const prevQuat = new three__WEBPACK_IMPORTED_MODULE_0__.Quaternion().fromArray(
					quaternionValues,
					( ( i - 3 ) / 3 ) * 4
				);

				if ( prevQuat.dot( quaternion ) < 0 ) {

					quaternion.set( - quaternion.x, - quaternion.y, - quaternion.z, - quaternion.w );

				}

			}

			quaternion.toArray( quaternionValues, ( i / 3 ) * 4 );

		}

		return new three__WEBPACK_IMPORTED_MODULE_0__.QuaternionKeyframeTrack( modelName + '.quaternion', times, quaternionValues );

	}

	generateMorphTrack( rawTracks ) {

		const curves = rawTracks.DeformPercent.curves.morph;
		const values = curves.values.map( function ( val ) {

			return val / 100;

		} );

		const morphNum = sceneGraph.getObjectByName( rawTracks.modelName ).morphTargetDictionary[ rawTracks.morphName ];

		return new three__WEBPACK_IMPORTED_MODULE_0__.NumberKeyframeTrack( rawTracks.modelName + '.morphTargetInfluences[' + morphNum + ']', curves.times, values );

	}

	// For all animated objects, times are defined separately for each axis
	// Here we'll combine the times into one sorted array without duplicates
	getTimesForAllAxes( curves ) {

		let times = [];

		// first join together the times for each axis, if defined
		if ( curves.x !== undefined ) times = times.concat( curves.x.times );
		if ( curves.y !== undefined ) times = times.concat( curves.y.times );
		if ( curves.z !== undefined ) times = times.concat( curves.z.times );

		// then sort them
		times = times.sort( function ( a, b ) {

			return a - b;

		} );

		// and remove duplicates
		if ( times.length > 1 ) {

			let targetIndex = 1;
			let lastValue = times[ 0 ];
			for ( let i = 1; i < times.length; i ++ ) {

				const currentValue = times[ i ];
				if ( currentValue !== lastValue ) {

					times[ targetIndex ] = currentValue;
					lastValue = currentValue;
					targetIndex ++;

				}

			}

			times = times.slice( 0, targetIndex );

		}

		return times;

	}

	getKeyframeTrackValues( times, curves, initialValue ) {

		const prevValue = initialValue;

		const values = [];

		let xIndex = - 1;
		let yIndex = - 1;
		let zIndex = - 1;

		times.forEach( function ( time ) {

			if ( curves.x ) xIndex = curves.x.times.indexOf( time );
			if ( curves.y ) yIndex = curves.y.times.indexOf( time );
			if ( curves.z ) zIndex = curves.z.times.indexOf( time );

			// if there is an x value defined for this frame, use that
			if ( xIndex !== - 1 ) {

				const xValue = curves.x.values[ xIndex ];
				values.push( xValue );
				prevValue[ 0 ] = xValue;

			} else {

				// otherwise use the x value from the previous frame
				values.push( prevValue[ 0 ] );

			}

			if ( yIndex !== - 1 ) {

				const yValue = curves.y.values[ yIndex ];
				values.push( yValue );
				prevValue[ 1 ] = yValue;

			} else {

				values.push( prevValue[ 1 ] );

			}

			if ( zIndex !== - 1 ) {

				const zValue = curves.z.values[ zIndex ];
				values.push( zValue );
				prevValue[ 2 ] = zValue;

			} else {

				values.push( prevValue[ 2 ] );

			}

		} );

		return values;

	}

	// Rotations are defined as Euler angles which can have values  of any size
	// These will be converted to quaternions which don't support values greater than
	// PI, so we'll interpolate large rotations
	interpolateRotations( curvex, curvey, curvez, eulerOrder ) {

		const times = [];
		const values = [];

		// Add first frame
		times.push( curvex.times[ 0 ] );
		values.push( three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad( curvex.values[ 0 ] ) );
		values.push( three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad( curvey.values[ 0 ] ) );
		values.push( three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad( curvez.values[ 0 ] ) );

		for ( let i = 1; i < curvex.values.length; i ++ ) {

			const initialValue = [
				curvex.values[ i - 1 ],
				curvey.values[ i - 1 ],
				curvez.values[ i - 1 ],
			];

			if ( isNaN( initialValue[ 0 ] ) || isNaN( initialValue[ 1 ] ) || isNaN( initialValue[ 2 ] ) ) {

				continue;

			}

			const initialValueRad = initialValue.map( three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad );

			const currentValue = [
				curvex.values[ i ],
				curvey.values[ i ],
				curvez.values[ i ],
			];

			if ( isNaN( currentValue[ 0 ] ) || isNaN( currentValue[ 1 ] ) || isNaN( currentValue[ 2 ] ) ) {

				continue;

			}

			const currentValueRad = currentValue.map( three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad );

			const valuesSpan = [
				currentValue[ 0 ] - initialValue[ 0 ],
				currentValue[ 1 ] - initialValue[ 1 ],
				currentValue[ 2 ] - initialValue[ 2 ],
			];

			const absoluteSpan = [
				Math.abs( valuesSpan[ 0 ] ),
				Math.abs( valuesSpan[ 1 ] ),
				Math.abs( valuesSpan[ 2 ] ),
			];

			if ( absoluteSpan[ 0 ] >= 180 || absoluteSpan[ 1 ] >= 180 || absoluteSpan[ 2 ] >= 180 ) {

				const maxAbsSpan = Math.max( ...absoluteSpan );

				const numSubIntervals = maxAbsSpan / 180;

				const E1 = new three__WEBPACK_IMPORTED_MODULE_0__.Euler( ...initialValueRad, eulerOrder );
				const E2 = new three__WEBPACK_IMPORTED_MODULE_0__.Euler( ...currentValueRad, eulerOrder );

				const Q1 = new three__WEBPACK_IMPORTED_MODULE_0__.Quaternion().setFromEuler( E1 );
				const Q2 = new three__WEBPACK_IMPORTED_MODULE_0__.Quaternion().setFromEuler( E2 );

				// Check unroll
				if ( Q1.dot( Q2 ) ) {

					Q2.set( - Q2.x, - Q2.y, - Q2.z, - Q2.w );

				}

				// Interpolate
				const initialTime = curvex.times[ i - 1 ];
				const timeSpan = curvex.times[ i ] - initialTime;

				const Q = new three__WEBPACK_IMPORTED_MODULE_0__.Quaternion();
				const E = new three__WEBPACK_IMPORTED_MODULE_0__.Euler();
				for ( let t = 0; t < 1; t += 1 / numSubIntervals ) {

					Q.copy( Q1.clone().slerp( Q2.clone(), t ) );

					times.push( initialTime + t * timeSpan );
					E.setFromQuaternion( Q, eulerOrder );

					values.push( E.x );
					values.push( E.y );
					values.push( E.z );

				}

			} else {

				times.push( curvex.times[ i ] );
				values.push( three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad( curvex.values[ i ] ) );
				values.push( three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad( curvey.values[ i ] ) );
				values.push( three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad( curvez.values[ i ] ) );

			}

		}

		return [ times, values ];

	}

}

// parse an FBX file in ASCII format
class TextParser {

	getPrevNode() {

		return this.nodeStack[ this.currentIndent - 2 ];

	}

	getCurrentNode() {

		return this.nodeStack[ this.currentIndent - 1 ];

	}

	getCurrentProp() {

		return this.currentProp;

	}

	pushStack( node ) {

		this.nodeStack.push( node );
		this.currentIndent += 1;

	}

	popStack() {

		this.nodeStack.pop();
		this.currentIndent -= 1;

	}

	setCurrentProp( val, name ) {

		this.currentProp = val;
		this.currentPropName = name;

	}

	parse( text ) {

		this.currentIndent = 0;

		this.allNodes = new FBXTree();
		this.nodeStack = [];
		this.currentProp = [];
		this.currentPropName = '';

		const scope = this;

		const split = text.split( /[\r\n]+/ );

		split.forEach( function ( line, i ) {

			const matchComment = line.match( /^[\s\t]*;/ );
			const matchEmpty = line.match( /^[\s\t]*$/ );

			if ( matchComment || matchEmpty ) return;

			const matchBeginning = line.match( '^\\t{' + scope.currentIndent + '}(\\w+):(.*){', '' );
			const matchProperty = line.match( '^\\t{' + ( scope.currentIndent ) + '}(\\w+):[\\s\\t\\r\\n](.*)' );
			const matchEnd = line.match( '^\\t{' + ( scope.currentIndent - 1 ) + '}}' );

			if ( matchBeginning ) {

				scope.parseNodeBegin( line, matchBeginning );

			} else if ( matchProperty ) {

				scope.parseNodeProperty( line, matchProperty, split[ ++ i ] );

			} else if ( matchEnd ) {

				scope.popStack();

			} else if ( line.match( /^[^\s\t}]/ ) ) {

				// large arrays are split over multiple lines terminated with a ',' character
				// if this is encountered the line needs to be joined to the previous line
				scope.parseNodePropertyContinued( line );

			}

		} );

		return this.allNodes;

	}

	parseNodeBegin( line, property ) {

		const nodeName = property[ 1 ].trim().replace( /^"/, '' ).replace( /"$/, '' );

		const nodeAttrs = property[ 2 ].split( ',' ).map( function ( attr ) {

			return attr.trim().replace( /^"/, '' ).replace( /"$/, '' );

		} );

		const node = { name: nodeName };
		const attrs = this.parseNodeAttr( nodeAttrs );

		const currentNode = this.getCurrentNode();

		// a top node
		if ( this.currentIndent === 0 ) {

			this.allNodes.add( nodeName, node );

		} else { // a subnode

			// if the subnode already exists, append it
			if ( nodeName in currentNode ) {

				// special case Pose needs PoseNodes as an array
				if ( nodeName === 'PoseNode' ) {

					currentNode.PoseNode.push( node );

				} else if ( currentNode[ nodeName ].id !== undefined ) {

					currentNode[ nodeName ] = {};
					currentNode[ nodeName ][ currentNode[ nodeName ].id ] = currentNode[ nodeName ];

				}

				if ( attrs.id !== '' ) currentNode[ nodeName ][ attrs.id ] = node;

			} else if ( typeof attrs.id === 'number' ) {

				currentNode[ nodeName ] = {};
				currentNode[ nodeName ][ attrs.id ] = node;

			} else if ( nodeName !== 'Properties70' ) {

				if ( nodeName === 'PoseNode' )	currentNode[ nodeName ] = [ node ];
				else currentNode[ nodeName ] = node;

			}

		}

		if ( typeof attrs.id === 'number' ) node.id = attrs.id;
		if ( attrs.name !== '' ) node.attrName = attrs.name;
		if ( attrs.type !== '' ) node.attrType = attrs.type;

		this.pushStack( node );

	}

	parseNodeAttr( attrs ) {

		let id = attrs[ 0 ];

		if ( attrs[ 0 ] !== '' ) {

			id = parseInt( attrs[ 0 ] );

			if ( isNaN( id ) ) {

				id = attrs[ 0 ];

			}

		}

		let name = '', type = '';

		if ( attrs.length > 1 ) {

			name = attrs[ 1 ].replace( /^(\w+)::/, '' );
			type = attrs[ 2 ];

		}

		return { id: id, name: name, type: type };

	}

	parseNodeProperty( line, property, contentLine ) {

		let propName = property[ 1 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();
		let propValue = property[ 2 ].replace( /^"/, '' ).replace( /"$/, '' ).trim();

		// for special case: base64 image data follows "Content: ," line
		//	Content: ,
		//	 "/9j/4RDaRXhpZgAATU0A..."
		if ( propName === 'Content' && propValue === ',' ) {

			propValue = contentLine.replace( /"/g, '' ).replace( /,$/, '' ).trim();

		}

		const currentNode = this.getCurrentNode();
		const parentName = currentNode.name;

		if ( parentName === 'Properties70' ) {

			this.parseNodeSpecialProperty( line, propName, propValue );
			return;

		}

		// Connections
		if ( propName === 'C' ) {

			const connProps = propValue.split( ',' ).slice( 1 );
			const from = parseInt( connProps[ 0 ] );
			const to = parseInt( connProps[ 1 ] );

			let rest = propValue.split( ',' ).slice( 3 );

			rest = rest.map( function ( elem ) {

				return elem.trim().replace( /^"/, '' );

			} );

			propName = 'connections';
			propValue = [ from, to ];
			append( propValue, rest );

			if ( currentNode[ propName ] === undefined ) {

				currentNode[ propName ] = [];

			}

		}

		// Node
		if ( propName === 'Node' ) currentNode.id = propValue;

		// connections
		if ( propName in currentNode && Array.isArray( currentNode[ propName ] ) ) {

			currentNode[ propName ].push( propValue );

		} else {

			if ( propName !== 'a' ) currentNode[ propName ] = propValue;
			else currentNode.a = propValue;

		}

		this.setCurrentProp( currentNode, propName );

		// convert string to array, unless it ends in ',' in which case more will be added to it
		if ( propName === 'a' && propValue.slice( - 1 ) !== ',' ) {

			currentNode.a = parseNumberArray( propValue );

		}

	}

	parseNodePropertyContinued( line ) {

		const currentNode = this.getCurrentNode();

		currentNode.a += line;

		// if the line doesn't end in ',' we have reached the end of the property value
		// so convert the string to an array
		if ( line.slice( - 1 ) !== ',' ) {

			currentNode.a = parseNumberArray( currentNode.a );

		}

	}

	// parse "Property70"
	parseNodeSpecialProperty( line, propName, propValue ) {

		// split this
		// P: "Lcl Scaling", "Lcl Scaling", "", "A",1,1,1
		// into array like below
		// ["Lcl Scaling", "Lcl Scaling", "", "A", "1,1,1" ]
		const props = propValue.split( '",' ).map( function ( prop ) {

			return prop.trim().replace( /^\"/, '' ).replace( /\s/, '_' );

		} );

		const innerPropName = props[ 0 ];
		const innerPropType1 = props[ 1 ];
		const innerPropType2 = props[ 2 ];
		const innerPropFlag = props[ 3 ];
		let innerPropValue = props[ 4 ];

		// cast values where needed, otherwise leave as strings
		switch ( innerPropType1 ) {

			case 'int':
			case 'enum':
			case 'bool':
			case 'ULongLong':
			case 'double':
			case 'Number':
			case 'FieldOfView':
				innerPropValue = parseFloat( innerPropValue );
				break;

			case 'Color':
			case 'ColorRGB':
			case 'Vector3D':
			case 'Lcl_Translation':
			case 'Lcl_Rotation':
			case 'Lcl_Scaling':
				innerPropValue = parseNumberArray( innerPropValue );
				break;

		}

		// CAUTION: these props must append to parent's parent
		this.getPrevNode()[ innerPropName ] = {

			'type': innerPropType1,
			'type2': innerPropType2,
			'flag': innerPropFlag,
			'value': innerPropValue

		};

		this.setCurrentProp( this.getPrevNode(), innerPropName );

	}

}

// Parse an FBX file in Binary format
class BinaryParser {

	parse( buffer ) {

		const reader = new BinaryReader( buffer );
		reader.skip( 23 ); // skip magic 23 bytes

		const version = reader.getUint32();

		if ( version < 6400 ) {

			throw new Error( 'THREE.FBXLoader: FBX version not supported, FileVersion: ' + version );

		}

		const allNodes = new FBXTree();

		while ( ! this.endOfContent( reader ) ) {

			const node = this.parseNode( reader, version );
			if ( node !== null ) allNodes.add( node.name, node );

		}

		return allNodes;

	}

	// Check if reader has reached the end of content.
	endOfContent( reader ) {

		// footer size: 160bytes + 16-byte alignment padding
		// - 16bytes: magic
		// - padding til 16-byte alignment (at least 1byte?)
		//	(seems like some exporters embed fixed 15 or 16bytes?)
		// - 4bytes: magic
		// - 4bytes: version
		// - 120bytes: zero
		// - 16bytes: magic
		if ( reader.size() % 16 === 0 ) {

			return ( ( reader.getOffset() + 160 + 16 ) & ~ 0xf ) >= reader.size();

		} else {

			return reader.getOffset() + 160 + 16 >= reader.size();

		}

	}

	// recursively parse nodes until the end of the file is reached
	parseNode( reader, version ) {

		const node = {};

		// The first three data sizes depends on version.
		const endOffset = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();
		const numProperties = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();

		( version >= 7500 ) ? reader.getUint64() : reader.getUint32(); // the returned propertyListLen is not used

		const nameLen = reader.getUint8();
		const name = reader.getString( nameLen );

		// Regards this node as NULL-record if endOffset is zero
		if ( endOffset === 0 ) return null;

		const propertyList = [];

		for ( let i = 0; i < numProperties; i ++ ) {

			propertyList.push( this.parseProperty( reader ) );

		}

		// Regards the first three elements in propertyList as id, attrName, and attrType
		const id = propertyList.length > 0 ? propertyList[ 0 ] : '';
		const attrName = propertyList.length > 1 ? propertyList[ 1 ] : '';
		const attrType = propertyList.length > 2 ? propertyList[ 2 ] : '';

		// check if this node represents just a single property
		// like (name, 0) set or (name2, [0, 1, 2]) set of {name: 0, name2: [0, 1, 2]}
		node.singleProperty = ( numProperties === 1 && reader.getOffset() === endOffset ) ? true : false;

		while ( endOffset > reader.getOffset() ) {

			const subNode = this.parseNode( reader, version );

			if ( subNode !== null ) this.parseSubNode( name, node, subNode );

		}

		node.propertyList = propertyList; // raw property list used by parent

		if ( typeof id === 'number' ) node.id = id;
		if ( attrName !== '' ) node.attrName = attrName;
		if ( attrType !== '' ) node.attrType = attrType;
		if ( name !== '' ) node.name = name;

		return node;

	}

	parseSubNode( name, node, subNode ) {

		// special case: child node is single property
		if ( subNode.singleProperty === true ) {

			const value = subNode.propertyList[ 0 ];

			if ( Array.isArray( value ) ) {

				node[ subNode.name ] = subNode;

				subNode.a = value;

			} else {

				node[ subNode.name ] = value;

			}

		} else if ( name === 'Connections' && subNode.name === 'C' ) {

			const array = [];

			subNode.propertyList.forEach( function ( property, i ) {

				// first Connection is FBX type (OO, OP, etc.). We'll discard these
				if ( i !== 0 ) array.push( property );

			} );

			if ( node.connections === undefined ) {

				node.connections = [];

			}

			node.connections.push( array );

		} else if ( subNode.name === 'Properties70' ) {

			const keys = Object.keys( subNode );

			keys.forEach( function ( key ) {

				node[ key ] = subNode[ key ];

			} );

		} else if ( name === 'Properties70' && subNode.name === 'P' ) {

			let innerPropName = subNode.propertyList[ 0 ];
			let innerPropType1 = subNode.propertyList[ 1 ];
			const innerPropType2 = subNode.propertyList[ 2 ];
			const innerPropFlag = subNode.propertyList[ 3 ];
			let innerPropValue;

			if ( innerPropName.indexOf( 'Lcl ' ) === 0 ) innerPropName = innerPropName.replace( 'Lcl ', 'Lcl_' );
			if ( innerPropType1.indexOf( 'Lcl ' ) === 0 ) innerPropType1 = innerPropType1.replace( 'Lcl ', 'Lcl_' );

			if ( innerPropType1 === 'Color' || innerPropType1 === 'ColorRGB' || innerPropType1 === 'Vector' || innerPropType1 === 'Vector3D' || innerPropType1.indexOf( 'Lcl_' ) === 0 ) {

				innerPropValue = [
					subNode.propertyList[ 4 ],
					subNode.propertyList[ 5 ],
					subNode.propertyList[ 6 ]
				];

			} else {

				innerPropValue = subNode.propertyList[ 4 ];

			}

			// this will be copied to parent, see above
			node[ innerPropName ] = {

				'type': innerPropType1,
				'type2': innerPropType2,
				'flag': innerPropFlag,
				'value': innerPropValue

			};

		} else if ( node[ subNode.name ] === undefined ) {

			if ( typeof subNode.id === 'number' ) {

				node[ subNode.name ] = {};
				node[ subNode.name ][ subNode.id ] = subNode;

			} else {

				node[ subNode.name ] = subNode;

			}

		} else {

			if ( subNode.name === 'PoseNode' ) {

				if ( ! Array.isArray( node[ subNode.name ] ) ) {

					node[ subNode.name ] = [ node[ subNode.name ] ];

				}

				node[ subNode.name ].push( subNode );

			} else if ( node[ subNode.name ][ subNode.id ] === undefined ) {

				node[ subNode.name ][ subNode.id ] = subNode;

			}

		}

	}

	parseProperty( reader ) {

		const type = reader.getString( 1 );
		let length;

		switch ( type ) {

			case 'C':
				return reader.getBoolean();

			case 'D':
				return reader.getFloat64();

			case 'F':
				return reader.getFloat32();

			case 'I':
				return reader.getInt32();

			case 'L':
				return reader.getInt64();

			case 'R':
				length = reader.getUint32();
				return reader.getArrayBuffer( length );

			case 'S':
				length = reader.getUint32();
				return reader.getString( length );

			case 'Y':
				return reader.getInt16();

			case 'b':
			case 'c':
			case 'd':
			case 'f':
			case 'i':
			case 'l':

				const arrayLength = reader.getUint32();
				const encoding = reader.getUint32(); // 0: non-compressed, 1: compressed
				const compressedLength = reader.getUint32();

				if ( encoding === 0 ) {

					switch ( type ) {

						case 'b':
						case 'c':
							return reader.getBooleanArray( arrayLength );

						case 'd':
							return reader.getFloat64Array( arrayLength );

						case 'f':
							return reader.getFloat32Array( arrayLength );

						case 'i':
							return reader.getInt32Array( arrayLength );

						case 'l':
							return reader.getInt64Array( arrayLength );

					}

				}

				const data = _libs_fflate_module_js__WEBPACK_IMPORTED_MODULE_2__.unzlibSync( new Uint8Array( reader.getArrayBuffer( compressedLength ) ) );
				const reader2 = new BinaryReader( data.buffer );

				switch ( type ) {

					case 'b':
					case 'c':
						return reader2.getBooleanArray( arrayLength );

					case 'd':
						return reader2.getFloat64Array( arrayLength );

					case 'f':
						return reader2.getFloat32Array( arrayLength );

					case 'i':
						return reader2.getInt32Array( arrayLength );

					case 'l':
						return reader2.getInt64Array( arrayLength );

				}

				break; // cannot happen but is required by the DeepScan

			default:
				throw new Error( 'THREE.FBXLoader: Unknown property type ' + type );

		}

	}

}

class BinaryReader {

	constructor( buffer, littleEndian ) {

		this.dv = new DataView( buffer );
		this.offset = 0;
		this.littleEndian = ( littleEndian !== undefined ) ? littleEndian : true;
		this._textDecoder = new TextDecoder();

	}

	getOffset() {

		return this.offset;

	}

	size() {

		return this.dv.buffer.byteLength;

	}

	skip( length ) {

		this.offset += length;

	}

	// seems like true/false representation depends on exporter.
	// true: 1 or 'Y'(=0x59), false: 0 or 'T'(=0x54)
	// then sees LSB.
	getBoolean() {

		return ( this.getUint8() & 1 ) === 1;

	}

	getBooleanArray( size ) {

		const a = [];

		for ( let i = 0; i < size; i ++ ) {

			a.push( this.getBoolean() );

		}

		return a;

	}

	getUint8() {

		const value = this.dv.getUint8( this.offset );
		this.offset += 1;
		return value;

	}

	getInt16() {

		const value = this.dv.getInt16( this.offset, this.littleEndian );
		this.offset += 2;
		return value;

	}

	getInt32() {

		const value = this.dv.getInt32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	}

	getInt32Array( size ) {

		const a = [];

		for ( let i = 0; i < size; i ++ ) {

			a.push( this.getInt32() );

		}

		return a;

	}

	getUint32() {

		const value = this.dv.getUint32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	}

	// JavaScript doesn't support 64-bit integer so calculate this here
	// 1 << 32 will return 1 so using multiply operation instead here.
	// There's a possibility that this method returns wrong value if the value
	// is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
	// TODO: safely handle 64-bit integer
	getInt64() {

		let low, high;

		if ( this.littleEndian ) {

			low = this.getUint32();
			high = this.getUint32();

		} else {

			high = this.getUint32();
			low = this.getUint32();

		}

		// calculate negative value
		if ( high & 0x80000000 ) {

			high = ~ high & 0xFFFFFFFF;
			low = ~ low & 0xFFFFFFFF;

			if ( low === 0xFFFFFFFF ) high = ( high + 1 ) & 0xFFFFFFFF;

			low = ( low + 1 ) & 0xFFFFFFFF;

			return - ( high * 0x100000000 + low );

		}

		return high * 0x100000000 + low;

	}

	getInt64Array( size ) {

		const a = [];

		for ( let i = 0; i < size; i ++ ) {

			a.push( this.getInt64() );

		}

		return a;

	}

	// Note: see getInt64() comment
	getUint64() {

		let low, high;

		if ( this.littleEndian ) {

			low = this.getUint32();
			high = this.getUint32();

		} else {

			high = this.getUint32();
			low = this.getUint32();

		}

		return high * 0x100000000 + low;

	}

	getFloat32() {

		const value = this.dv.getFloat32( this.offset, this.littleEndian );
		this.offset += 4;
		return value;

	}

	getFloat32Array( size ) {

		const a = [];

		for ( let i = 0; i < size; i ++ ) {

			a.push( this.getFloat32() );

		}

		return a;

	}

	getFloat64() {

		const value = this.dv.getFloat64( this.offset, this.littleEndian );
		this.offset += 8;
		return value;

	}

	getFloat64Array( size ) {

		const a = [];

		for ( let i = 0; i < size; i ++ ) {

			a.push( this.getFloat64() );

		}

		return a;

	}

	getArrayBuffer( size ) {

		const value = this.dv.buffer.slice( this.offset, this.offset + size );
		this.offset += size;
		return value;

	}

	getString( size ) {

		const start = this.offset;
		let a = new Uint8Array( this.dv.buffer, start, size );

		this.skip( size );

		const nullByte = a.indexOf( 0 );
		if ( nullByte >= 0 ) a = new Uint8Array( this.dv.buffer, start, nullByte );

		return this._textDecoder.decode( a );

	}

}

// FBXTree holds a representation of the FBX data, returned by the TextParser ( FBX ASCII format)
// and BinaryParser( FBX Binary format)
class FBXTree {

	add( key, val ) {

		this[ key ] = val;

	}

}

// ************** UTILITY FUNCTIONS **************

function isFbxFormatBinary( buffer ) {

	const CORRECT = 'Kaydara\u0020FBX\u0020Binary\u0020\u0020\0';

	return buffer.byteLength >= CORRECT.length && CORRECT === convertArrayBufferToString( buffer, 0, CORRECT.length );

}

function isFbxFormatASCII( text ) {

	const CORRECT = [ 'K', 'a', 'y', 'd', 'a', 'r', 'a', '\\', 'F', 'B', 'X', '\\', 'B', 'i', 'n', 'a', 'r', 'y', '\\', '\\' ];

	let cursor = 0;

	function read( offset ) {

		const result = text[ offset - 1 ];
		text = text.slice( cursor + offset );
		cursor ++;
		return result;

	}

	for ( let i = 0; i < CORRECT.length; ++ i ) {

		const num = read( 1 );
		if ( num === CORRECT[ i ] ) {

			return false;

		}

	}

	return true;

}

function getFbxVersion( text ) {

	const versionRegExp = /FBXVersion: (\d+)/;
	const match = text.match( versionRegExp );

	if ( match ) {

		const version = parseInt( match[ 1 ] );
		return version;

	}

	throw new Error( 'THREE.FBXLoader: Cannot find the version number for the file given.' );

}

// Converts FBX ticks into real time seconds.
function convertFBXTimeToSeconds( time ) {

	return time / 46186158000;

}

const dataArray = [];

// extracts the data from the correct position in the FBX array based on indexing type
function getData( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {

	let index;

	switch ( infoObject.mappingType ) {

		case 'ByPolygonVertex' :
			index = polygonVertexIndex;
			break;
		case 'ByPolygon' :
			index = polygonIndex;
			break;
		case 'ByVertice' :
			index = vertexIndex;
			break;
		case 'AllSame' :
			index = infoObject.indices[ 0 ];
			break;
		default :
			console.warn( 'THREE.FBXLoader: unknown attribute mapping type ' + infoObject.mappingType );

	}

	if ( infoObject.referenceType === 'IndexToDirect' ) index = infoObject.indices[ index ];

	const from = index * infoObject.dataSize;
	const to = from + infoObject.dataSize;

	return slice( dataArray, infoObject.buffer, from, to );

}

const tempEuler = new three__WEBPACK_IMPORTED_MODULE_0__.Euler();
const tempVec = new three__WEBPACK_IMPORTED_MODULE_0__.Vector3();

// generate transformation from FBX transform data
// ref: https://help.autodesk.com/view/FBX/2017/ENU/?guid=__files_GUID_10CDD63C_79C1_4F2D_BB28_AD2BE65A02ED_htm
// ref: http://docs.autodesk.com/FBX/2014/ENU/FBX-SDK-Documentation/index.html?url=cpp_ref/_transformations_2main_8cxx-example.html,topicNumber=cpp_ref__transformations_2main_8cxx_example_htmlfc10a1e1-b18d-4e72-9dc0-70d0f1959f5e
function generateTransform( transformData ) {

	const lTranslationM = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
	const lPreRotationM = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
	const lRotationM = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
	const lPostRotationM = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();

	const lScalingM = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
	const lScalingPivotM = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
	const lScalingOffsetM = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
	const lRotationOffsetM = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
	const lRotationPivotM = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();

	const lParentGX = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
	const lParentLX = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
	const lGlobalT = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();

	const inheritType = ( transformData.inheritType ) ? transformData.inheritType : 0;

	if ( transformData.translation ) lTranslationM.setPosition( tempVec.fromArray( transformData.translation ) );

	if ( transformData.preRotation ) {

		const array = transformData.preRotation.map( three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad );
		array.push( transformData.eulerOrder || three__WEBPACK_IMPORTED_MODULE_0__.Euler.DEFAULT_ORDER );
		lPreRotationM.makeRotationFromEuler( tempEuler.fromArray( array ) );

	}

	if ( transformData.rotation ) {

		const array = transformData.rotation.map( three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad );
		array.push( transformData.eulerOrder || three__WEBPACK_IMPORTED_MODULE_0__.Euler.DEFAULT_ORDER );
		lRotationM.makeRotationFromEuler( tempEuler.fromArray( array ) );

	}

	if ( transformData.postRotation ) {

		const array = transformData.postRotation.map( three__WEBPACK_IMPORTED_MODULE_0__.MathUtils.degToRad );
		array.push( transformData.eulerOrder || three__WEBPACK_IMPORTED_MODULE_0__.Euler.DEFAULT_ORDER );
		lPostRotationM.makeRotationFromEuler( tempEuler.fromArray( array ) );
		lPostRotationM.invert();

	}

	if ( transformData.scale ) lScalingM.scale( tempVec.fromArray( transformData.scale ) );

	// Pivots and offsets
	if ( transformData.scalingOffset ) lScalingOffsetM.setPosition( tempVec.fromArray( transformData.scalingOffset ) );
	if ( transformData.scalingPivot ) lScalingPivotM.setPosition( tempVec.fromArray( transformData.scalingPivot ) );
	if ( transformData.rotationOffset ) lRotationOffsetM.setPosition( tempVec.fromArray( transformData.rotationOffset ) );
	if ( transformData.rotationPivot ) lRotationPivotM.setPosition( tempVec.fromArray( transformData.rotationPivot ) );

	// parent transform
	if ( transformData.parentMatrixWorld ) {

		lParentLX.copy( transformData.parentMatrix );
		lParentGX.copy( transformData.parentMatrixWorld );

	}

	const lLRM = lPreRotationM.clone().multiply( lRotationM ).multiply( lPostRotationM );
	// Global Rotation
	const lParentGRM = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
	lParentGRM.extractRotation( lParentGX );

	// Global Shear*Scaling
	const lParentTM = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();
	lParentTM.copyPosition( lParentGX );

	const lParentGRSM = lParentTM.clone().invert().multiply( lParentGX );
	const lParentGSM = lParentGRM.clone().invert().multiply( lParentGRSM );
	const lLSM = lScalingM;

	const lGlobalRS = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4();

	if ( inheritType === 0 ) {

		lGlobalRS.copy( lParentGRM ).multiply( lLRM ).multiply( lParentGSM ).multiply( lLSM );

	} else if ( inheritType === 1 ) {

		lGlobalRS.copy( lParentGRM ).multiply( lParentGSM ).multiply( lLRM ).multiply( lLSM );

	} else {

		const lParentLSM = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4().scale( new three__WEBPACK_IMPORTED_MODULE_0__.Vector3().setFromMatrixScale( lParentLX ) );
		const lParentLSM_inv = lParentLSM.clone().invert();
		const lParentGSM_noLocal = lParentGSM.clone().multiply( lParentLSM_inv );

		lGlobalRS.copy( lParentGRM ).multiply( lLRM ).multiply( lParentGSM_noLocal ).multiply( lLSM );

	}

	const lRotationPivotM_inv = lRotationPivotM.clone().invert();
	const lScalingPivotM_inv = lScalingPivotM.clone().invert();
	// Calculate the local transform matrix
	let lTransform = lTranslationM.clone().multiply( lRotationOffsetM ).multiply( lRotationPivotM ).multiply( lPreRotationM ).multiply( lRotationM ).multiply( lPostRotationM ).multiply( lRotationPivotM_inv ).multiply( lScalingOffsetM ).multiply( lScalingPivotM ).multiply( lScalingM ).multiply( lScalingPivotM_inv );

	const lLocalTWithAllPivotAndOffsetInfo = new three__WEBPACK_IMPORTED_MODULE_0__.Matrix4().copyPosition( lTransform );

	const lGlobalTranslation = lParentGX.clone().multiply( lLocalTWithAllPivotAndOffsetInfo );
	lGlobalT.copyPosition( lGlobalTranslation );

	lTransform = lGlobalT.clone().multiply( lGlobalRS );

	// from global to local
	lTransform.premultiply( lParentGX.invert() );

	return lTransform;

}

// Returns the three.js intrinsic Euler order corresponding to FBX extrinsic Euler order
// ref: http://help.autodesk.com/view/FBX/2017/ENU/?guid=__cpp_ref_class_fbx_euler_html
function getEulerOrder( order ) {

	order = order || 0;

	const enums = [
		'ZYX', // -> XYZ extrinsic
		'YZX', // -> XZY extrinsic
		'XZY', // -> YZX extrinsic
		'ZXY', // -> YXZ extrinsic
		'YXZ', // -> ZXY extrinsic
		'XYZ', // -> ZYX extrinsic
		//'SphericXYZ', // not possible to support
	];

	if ( order === 6 ) {

		console.warn( 'THREE.FBXLoader: unsupported Euler Order: Spherical XYZ. Animations and rotations may be incorrect.' );
		return enums[ 0 ];

	}

	return enums[ order ];

}

// Parses comma separated list of numbers and returns them an array.
// Used internally by the TextParser
function parseNumberArray( value ) {

	const array = value.split( ',' ).map( function ( val ) {

		return parseFloat( val );

	} );

	return array;

}

function convertArrayBufferToString( buffer, from, to ) {

	if ( from === undefined ) from = 0;
	if ( to === undefined ) to = buffer.byteLength;

	return new TextDecoder().decode( new Uint8Array( buffer, from, to ) );

}

function append( a, b ) {

	for ( let i = 0, j = a.length, l = b.length; i < l; i ++, j ++ ) {

		a[ j ] = b[ i ];

	}

}

function slice( a, b, from, to ) {

	for ( let i = from, j = 0; i < to; i ++, j ++ ) {

		a[ j ] = b[ i ];

	}

	return a;

}





/***/ }),

/***/ "./node_modules/three/examples/jsm/loaders/TGALoader.js":
/*!**************************************************************!*\
  !*** ./node_modules/three/examples/jsm/loaders/TGALoader.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TGALoader: () => (/* binding */ TGALoader)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");


class TGALoader extends three__WEBPACK_IMPORTED_MODULE_0__.DataTextureLoader {

	constructor( manager ) {

		super( manager );

	}

	parse( buffer ) {

		// reference from vthibault, https://github.com/vthibault/roBrowser/blob/master/src/Loaders/Targa.js

		function tgaCheckHeader( header ) {

			switch ( header.image_type ) {

				// check indexed type

				case TGA_TYPE_INDEXED:
				case TGA_TYPE_RLE_INDEXED:
					if ( header.colormap_length > 256 || header.colormap_size !== 24 || header.colormap_type !== 1 ) {

						throw new Error( 'THREE.TGALoader: Invalid type colormap data for indexed type.' );

					}

					break;

					// check colormap type

				case TGA_TYPE_RGB:
				case TGA_TYPE_GREY:
				case TGA_TYPE_RLE_RGB:
				case TGA_TYPE_RLE_GREY:
					if ( header.colormap_type ) {

						throw new Error( 'THREE.TGALoader: Invalid type colormap data for colormap type.' );

					}

					break;

					// What the need of a file without data ?

				case TGA_TYPE_NO_DATA:
					throw new Error( 'THREE.TGALoader: No data.' );

					// Invalid type ?

				default:
					throw new Error( 'THREE.TGALoader: Invalid type ' + header.image_type );

			}

			// check image width and height

			if ( header.width <= 0 || header.height <= 0 ) {

				throw new Error( 'THREE.TGALoader: Invalid image size.' );

			}

			// check image pixel size

			if ( header.pixel_size !== 8 && header.pixel_size !== 16 &&
				header.pixel_size !== 24 && header.pixel_size !== 32 ) {

				throw new Error( 'THREE.TGALoader: Invalid pixel size ' + header.pixel_size );

			}

		}

		// parse tga image buffer

		function tgaParse( use_rle, use_pal, header, offset, data ) {

			let pixel_data,
				palettes;

			const pixel_size = header.pixel_size >> 3;
			const pixel_total = header.width * header.height * pixel_size;

			 // read palettes

			 if ( use_pal ) {

				 palettes = data.subarray( offset, offset += header.colormap_length * ( header.colormap_size >> 3 ) );

			 }

			 // read RLE

			 if ( use_rle ) {

				 pixel_data = new Uint8Array( pixel_total );

				let c, count, i;
				let shift = 0;
				const pixels = new Uint8Array( pixel_size );

				while ( shift < pixel_total ) {

					c = data[ offset ++ ];
					count = ( c & 0x7f ) + 1;

					// RLE pixels

					if ( c & 0x80 ) {

						// bind pixel tmp array

						for ( i = 0; i < pixel_size; ++ i ) {

							pixels[ i ] = data[ offset ++ ];

						}

						// copy pixel array

						for ( i = 0; i < count; ++ i ) {

							pixel_data.set( pixels, shift + i * pixel_size );

						}

						shift += pixel_size * count;

					} else {

						// raw pixels

						count *= pixel_size;

						for ( i = 0; i < count; ++ i ) {

							pixel_data[ shift + i ] = data[ offset ++ ];

						}

						shift += count;

					}

				}

			 } else {

				// raw pixels

				pixel_data = data.subarray(
					 offset, offset += ( use_pal ? header.width * header.height : pixel_total )
				);

			 }

			 return {
				pixel_data: pixel_data,
				palettes: palettes
			 };

		}

		function tgaGetImageData8bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image, palettes ) {

			const colormap = palettes;
			let color, i = 0, x, y;
			const width = header.width;

			for ( y = y_start; y !== y_end; y += y_step ) {

				for ( x = x_start; x !== x_end; x += x_step, i ++ ) {

					color = image[ i ];
					imageData[ ( x + width * y ) * 4 + 3 ] = 255;
					imageData[ ( x + width * y ) * 4 + 2 ] = colormap[ ( color * 3 ) + 0 ];
					imageData[ ( x + width * y ) * 4 + 1 ] = colormap[ ( color * 3 ) + 1 ];
					imageData[ ( x + width * y ) * 4 + 0 ] = colormap[ ( color * 3 ) + 2 ];

				}

			}

			return imageData;

		}

		function tgaGetImageData16bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

			let color, i = 0, x, y;
			const width = header.width;

			for ( y = y_start; y !== y_end; y += y_step ) {

				for ( x = x_start; x !== x_end; x += x_step, i += 2 ) {

					color = image[ i + 0 ] + ( image[ i + 1 ] << 8 );
					imageData[ ( x + width * y ) * 4 + 0 ] = ( color & 0x7C00 ) >> 7;
					imageData[ ( x + width * y ) * 4 + 1 ] = ( color & 0x03E0 ) >> 2;
					imageData[ ( x + width * y ) * 4 + 2 ] = ( color & 0x001F ) << 3;
					imageData[ ( x + width * y ) * 4 + 3 ] = ( color & 0x8000 ) ? 0 : 255;

				}

			}

			return imageData;

		}

		function tgaGetImageData24bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

			let i = 0, x, y;
			const width = header.width;

			for ( y = y_start; y !== y_end; y += y_step ) {

				for ( x = x_start; x !== x_end; x += x_step, i += 3 ) {

					imageData[ ( x + width * y ) * 4 + 3 ] = 255;
					imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
					imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 1 ];
					imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 2 ];

				}

			}

			return imageData;

		}

		function tgaGetImageData32bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

			let i = 0, x, y;
			const width = header.width;

			for ( y = y_start; y !== y_end; y += y_step ) {

				for ( x = x_start; x !== x_end; x += x_step, i += 4 ) {

					imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
					imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 1 ];
					imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 2 ];
					imageData[ ( x + width * y ) * 4 + 3 ] = image[ i + 3 ];

				}

			}

			return imageData;

		}

		function tgaGetImageDataGrey8bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

			let color, i = 0, x, y;
			const width = header.width;

			for ( y = y_start; y !== y_end; y += y_step ) {

				for ( x = x_start; x !== x_end; x += x_step, i ++ ) {

					color = image[ i ];
					imageData[ ( x + width * y ) * 4 + 0 ] = color;
					imageData[ ( x + width * y ) * 4 + 1 ] = color;
					imageData[ ( x + width * y ) * 4 + 2 ] = color;
					imageData[ ( x + width * y ) * 4 + 3 ] = 255;

				}

			}

			return imageData;

		}

		function tgaGetImageDataGrey16bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

			let i = 0, x, y;
			const width = header.width;

			for ( y = y_start; y !== y_end; y += y_step ) {

				for ( x = x_start; x !== x_end; x += x_step, i += 2 ) {

					imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 0 ];
					imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 0 ];
					imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
					imageData[ ( x + width * y ) * 4 + 3 ] = image[ i + 1 ];

				}

			}

			return imageData;

		}

		function getTgaRGBA( data, width, height, image, palette ) {

			let x_start,
				y_start,
				x_step,
				y_step,
				x_end,
				y_end;

			switch ( ( header.flags & TGA_ORIGIN_MASK ) >> TGA_ORIGIN_SHIFT ) {

				default:
				case TGA_ORIGIN_UL:
					x_start = 0;
					x_step = 1;
					x_end = width;
					y_start = 0;
					y_step = 1;
					y_end = height;
					break;

				case TGA_ORIGIN_BL:
					x_start = 0;
					x_step = 1;
					x_end = width;
					y_start = height - 1;
					y_step = - 1;
					y_end = - 1;
					break;

				case TGA_ORIGIN_UR:
					x_start = width - 1;
					x_step = - 1;
					x_end = - 1;
					y_start = 0;
					y_step = 1;
					y_end = height;
					break;

				case TGA_ORIGIN_BR:
					x_start = width - 1;
					x_step = - 1;
					x_end = - 1;
					y_start = height - 1;
					y_step = - 1;
					y_end = - 1;
					break;

			}

			if ( use_grey ) {

				switch ( header.pixel_size ) {

					case 8:
						tgaGetImageDataGrey8bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;

					case 16:
						tgaGetImageDataGrey16bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;

					default:
						throw new Error( 'THREE.TGALoader: Format not supported.' );
						// removed by dead control flow
{}

				}

			} else {

				switch ( header.pixel_size ) {

					case 8:
						tgaGetImageData8bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image, palette );
						break;

					case 16:
						tgaGetImageData16bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;

					case 24:
						tgaGetImageData24bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;

					case 32:
						tgaGetImageData32bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
						break;

					default:
						throw new Error( 'THREE.TGALoader: Format not supported.' );
						// removed by dead control flow
{}

				}

			}

			// Load image data according to specific method
			// let func = 'tgaGetImageData' + (use_grey ? 'Grey' : '') + (header.pixel_size) + 'bits';
			// func(data, y_start, y_step, y_end, x_start, x_step, x_end, width, image, palette );
			return data;

		}

		// TGA constants

		const TGA_TYPE_NO_DATA = 0,
			TGA_TYPE_INDEXED = 1,
			TGA_TYPE_RGB = 2,
			TGA_TYPE_GREY = 3,
			TGA_TYPE_RLE_INDEXED = 9,
			TGA_TYPE_RLE_RGB = 10,
			TGA_TYPE_RLE_GREY = 11,

			TGA_ORIGIN_MASK = 0x30,
			TGA_ORIGIN_SHIFT = 0x04,
			TGA_ORIGIN_BL = 0x00,
			TGA_ORIGIN_BR = 0x01,
			TGA_ORIGIN_UL = 0x02,
			TGA_ORIGIN_UR = 0x03;

		if ( buffer.length < 19 ) throw new Error( 'THREE.TGALoader: Not enough data to contain header.' );

		let offset = 0;

		const content = new Uint8Array( buffer ),
			header = {
				id_length: content[ offset ++ ],
				colormap_type: content[ offset ++ ],
				image_type: content[ offset ++ ],
				colormap_index: content[ offset ++ ] | content[ offset ++ ] << 8,
				colormap_length: content[ offset ++ ] | content[ offset ++ ] << 8,
				colormap_size: content[ offset ++ ],
				origin: [
					content[ offset ++ ] | content[ offset ++ ] << 8,
					content[ offset ++ ] | content[ offset ++ ] << 8
				],
				width: content[ offset ++ ] | content[ offset ++ ] << 8,
				height: content[ offset ++ ] | content[ offset ++ ] << 8,
				pixel_size: content[ offset ++ ],
				flags: content[ offset ++ ]
			};

		// check tga if it is valid format

		tgaCheckHeader( header );

		if ( header.id_length + offset > buffer.length ) {

			throw new Error( 'THREE.TGALoader: No data.' );

		}

		// skip the needn't data

		offset += header.id_length;

		// get targa information about RLE compression and palette

		let use_rle = false,
			use_pal = false,
			use_grey = false;

		switch ( header.image_type ) {

			case TGA_TYPE_RLE_INDEXED:
				use_rle = true;
				use_pal = true;
				break;

			case TGA_TYPE_INDEXED:
				use_pal = true;
				break;

			case TGA_TYPE_RLE_RGB:
				use_rle = true;
				break;

			case TGA_TYPE_RGB:
				break;

			case TGA_TYPE_RLE_GREY:
				use_rle = true;
				use_grey = true;
				break;

			case TGA_TYPE_GREY:
				use_grey = true;
				break;

		}

		//

		const imageData = new Uint8Array( header.width * header.height * 4 );
		const result = tgaParse( use_rle, use_pal, header, offset, content );
		getTgaRGBA( imageData, header.width, header.height, result.pixel_data, result.palettes );

		return {

			data: imageData,
			width: header.width,
			height: header.height,
			flipY: true,
			generateMipmaps: true,
			minFilter: three__WEBPACK_IMPORTED_MODULE_0__.LinearMipmapLinearFilter,

		};

	}

}




/***/ }),

/***/ "./src/controls/checkpoint-controls.js":
/*!*********************************************!*\
  !*** ./src/controls/checkpoint-controls.js ***!
  \*********************************************/
/***/ (() => {

const EPS = 0.1;

AFRAME.registerComponent('checkpoint-controls', {
  schema: {
    enabled: {default: true},
    mode: {default: 'teleport', oneOf: ['teleport', 'animate']},
    animateSpeed: {default: 3.0}
  },

  init: function () {
    this.active = true;
    this.checkpoint = null;

    this.isNavMeshConstrained = false;

    this.offset = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();
  },

  play: function () { this.active = true; },
  pause: function () { this.active = false; },

  setCheckpoint: function (checkpoint) {
    const el = this.el;

    if (!this.active) return;
    if (this.checkpoint === checkpoint) return;

    if (this.checkpoint) {
      el.emit('navigation-end', {checkpoint: this.checkpoint});
    }

    this.checkpoint = checkpoint;
    this.sync();

    // Ignore new checkpoint if we're already there.
    if (this.position.distanceTo(this.targetPosition) < EPS) {
      this.checkpoint = null;
      return;
    }

    el.emit('navigation-start', {checkpoint: checkpoint});

    if (this.data.mode === 'teleport') {
      this.el.setAttribute('position', this.targetPosition);
      this.checkpoint = null;
      el.emit('navigation-end', {checkpoint: checkpoint});
      el.components['movement-controls'].updateNavLocation();
    }
  },

  isVelocityActive: function () {
    return !!(this.active && this.checkpoint);
  },

  getVelocity: function () {
    if (!this.active) return;

    const data = this.data;
    const offset = this.offset;
    const position = this.position;
    const targetPosition = this.targetPosition;
    const checkpoint = this.checkpoint;

    this.sync();
    if (position.distanceTo(targetPosition) < EPS) {
      this.checkpoint = null;
      this.el.emit('navigation-end', {checkpoint: checkpoint});
      return offset.set(0, 0, 0);
    }
    offset.setLength(data.animateSpeed);
    return offset;
  },

  sync: function () {
    const offset = this.offset;
    const position = this.position;
    const targetPosition = this.targetPosition;

    position.copy(this.el.getAttribute('position'));
    this.checkpoint.object3D.getWorldPosition(targetPosition);
    targetPosition.add(this.checkpoint.components.checkpoint.getOffset());
    offset.copy(targetPosition).sub(position);
  }
});


/***/ }),

/***/ "./src/controls/gamepad-controls.js":
/*!******************************************!*\
  !*** ./src/controls/gamepad-controls.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib_GamepadButton_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../lib/GamepadButton.js */ "./lib/GamepadButton.js");
/* harmony import */ var _lib_GamepadButtonEvent_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../lib/GamepadButtonEvent.js */ "./lib/GamepadButtonEvent.js");
/**
 * Gamepad controls for A-Frame.
 *
 * Stripped-down version of: https://github.com/donmccurdy/aframe-gamepad-controls
 *
 * For more information about the Gamepad API, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
 */




const JOYSTICK_EPS = 0.2;

const Hand = {
  LEFT: 'left',
  RIGHT: 'right'
};

const Joystick = {
  MOVEMENT: 1,
  ROTATION: 2
};

AFRAME.registerComponent('gamepad-controls', {

  /*******************************************************************
   * Statics
   */

  GamepadButton: _lib_GamepadButton_js__WEBPACK_IMPORTED_MODULE_0__["default"],

  /*******************************************************************
   * Schema
   */

  schema: {
    // Enable/disable gamepad-controls
    enabled: { default: true },

    // Rotation sensitivity
    rotationSensitivity: { default: 2.0 },
  },

  /*******************************************************************
   * Core
   */

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    const sceneEl = this.el.sceneEl;

    // tracked-controls-webxr was renamed to tracked-controls in aframe 1.7.0
    // tracked-controls-webxr is for aframe 1.6.0 and below
    this.system = sceneEl.systems['tracked-controls'] || sceneEl.systems['tracked-controls-webxr'] || {controllers: []};

    this.prevTime = window.performance.now();

    // Button state
    this.buttons = {};

    // Rotation
    const rotation = this.el.object3D.rotation;
    this.pitch = new THREE.Object3D();
    this.pitch.rotation.x = rotation.x;
    this.yaw = new THREE.Object3D();
    this.yaw.position.y = 10;
    this.yaw.rotation.y = rotation.y;
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
  update: function () { this.tick(); },

  /**
   * Called on each iteration of main render loop.
   */
  tick: function (t, dt) {
    this.updateButtonState();
    this.updateRotation(dt);
  },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () { },

  /*******************************************************************
   * Movement
   */

  isVelocityActive: function () {
    if (!this.data.enabled || !this.isConnected()) return false;

    const dpad = this._dpadVector;
    const joystick = this._moveVector;

    this.getDpad(dpad);
    this.getJoystick(Joystick.MOVEMENT, joystick);

    const inputX = dpad.x || joystick.x;
    const inputY = dpad.y || joystick.y;

    return Math.abs(inputX) > JOYSTICK_EPS || Math.abs(inputY) > JOYSTICK_EPS;
  },

  getVelocityDelta: function () {
    const dpad = this._dpadVector;
    const joystick = this._moveVector;

    this.getDpad(dpad);
    this.getJoystick(Joystick.MOVEMENT, joystick);

    const inputX = dpad.x || joystick.x;
    const inputY = dpad.y || joystick.y;
    const dVelocity = new THREE.Vector3();

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

  isRotationActive: function () {
    if (!this.data.enabled || !this.isConnected()) return false;

    const joystick = this._lookVector;

    this.getJoystick(Joystick.ROTATION, joystick);

    return Math.abs(joystick.x) > JOYSTICK_EPS || Math.abs(joystick.y) > JOYSTICK_EPS;
  },

  updateRotation: function (dt) {
    if (!this.isRotationActive()) return;

    const data = this.data;
    const yaw = this.yaw;
    const pitch = this.pitch;

    // First copy camera rig pitch/yaw, it may have been changed from
    // another component.
    yaw.rotation.y = this.el.object3D.rotation.y;
    pitch.rotation.x = this.el.object3D.rotation.x;

    const lookVector = this._lookVector;

    this.getJoystick(Joystick.ROTATION, lookVector);

    if (Math.abs(lookVector.x) <= JOYSTICK_EPS) lookVector.x = 0;
    if (Math.abs(lookVector.y) <= JOYSTICK_EPS) lookVector.y = 0;

    lookVector.multiplyScalar(data.rotationSensitivity * dt / 1000);
    yaw.rotation.y -= lookVector.x;
    pitch.rotation.x -= lookVector.y;
    pitch.rotation.x = Math.max(- Math.PI / 2, Math.min(Math.PI / 2, pitch.rotation.x));
    this.el.object3D.rotation.set(pitch.rotation.x, yaw.rotation.y, 0);
  },

  /*******************************************************************
   * Button events
   */

  updateButtonState: function () {
    const gamepad = this.getGamepad(Hand.RIGHT);
    if (this.data.enabled && gamepad) {

      // Fire DOM events for button state changes.
      for (var i = 0; i < gamepad.buttons.length; i++) {
        if (gamepad.buttons[i].pressed && !this.buttons[i]) {
          this.emit(new _lib_GamepadButtonEvent_js__WEBPACK_IMPORTED_MODULE_1__["default"]('gamepadbuttondown', i, gamepad.buttons[i]));
        } else if (!gamepad.buttons[i].pressed && this.buttons[i]) {
          this.emit(new _lib_GamepadButtonEvent_js__WEBPACK_IMPORTED_MODULE_1__["default"]('gamepadbuttonup', i, gamepad.buttons[i]));
        }
        this.buttons[i] = gamepad.buttons[i].pressed;
      }

    } else {
      // Reset state if controls are disabled or controller is lost.
      for (const key in this.buttons) { this.buttons[key] = false; }
    }
  },

  emit: function (event) {
    // Emit original event.
    this.el.emit(event.type, event);

    // Emit convenience event, identifying button index.
    this.el.emit(
      event.type + ':' + event.index,
      new _lib_GamepadButtonEvent_js__WEBPACK_IMPORTED_MODULE_1__["default"](event.type, event.index, event)
    );
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
  getGamepad: (function () {
    const _xrGamepads = [];
    const _empty = [];

    return function (handPreference) {
      // https://github.com/donmccurdy/aframe-proxy-controls
      const proxyControls = this.el.sceneEl.components['proxy-controls'];
      const proxyGamepad = proxyControls && proxyControls.isConnected()
        && proxyControls.getGamepad(0);
      if (proxyGamepad) return proxyGamepad;

      // https://www.w3.org/TR/webxr/#dom-xrinputsource-handedness
      _xrGamepads.length = 0;
      for (let i = 0; i < this.system.controllers.length; i++) {
        const xrController = this.system.controllers[i];
        const xrGamepad = xrController ? xrController.gamepad : null;
        _xrGamepads.push(xrGamepad);
        if (xrGamepad && xrController.handedness === handPreference) return xrGamepad;
      }

      // https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/hand
      const navGamepads = navigator.getGamepads ? navigator.getGamepads() : _empty;
      for (let i = 0; i < navGamepads.length; i++) {
        const navGamepad = navGamepads[i];
        if (navGamepad && navGamepad.hand === handPreference) return navGamepad;
      }

      return _xrGamepads[0] || navGamepads[0];
    };
  })(),

  /**
   * Returns the state of the given button.
   * @param  {number} index The button (0-N) for which to find state.
   * @return {GamepadButton}
   */
  getButton: function (index) {
    return this.getGamepad(Hand.RIGHT).buttons[index];
  },

  /**
   * Returns state of the given axis. Axes are labelled 0-N, where 0-1 will
   * represent X/Y on the first joystick, and 2-3 X/Y on the second.
   * @param  {number} index The axis (0-N) for which to find state.
   * @return {number} On the interval [-1,1].
   */
  getAxis: function (index) {
    return this.getGamepad(index > 1 ? Hand.RIGHT : Hand.LEFT).axes[index];
  },

  /**
   * Returns the state of the specified joystick as a THREE.Vector2.
   * @param  {Joystick} role
   * @param  {THREE.Vector2} target
   * @return {THREE.Vector2}
   */
  getJoystick: function (index, target) {
    const gamepad = this.getGamepad(index === Joystick.MOVEMENT ? Hand.LEFT : Hand.RIGHT);
    // gamepad can be null here if it becomes disconnected even if isConnected() was called
    // in the same tick before calling getJoystick.
    if (!gamepad) {
      return target.set(0, 0);
    }
    if (gamepad.mapping === 'xr-standard') {
      // See: https://github.com/donmccurdy/aframe-extras/issues/307
      switch (index) {
        case Joystick.MOVEMENT: return target.set(gamepad.axes[2], gamepad.axes[3]);
        case Joystick.ROTATION: return target.set(gamepad.axes[2], 0);
      }
    } else {
      switch (index) {
        case Joystick.MOVEMENT: return target.set(gamepad.axes[0], gamepad.axes[1]);
        case Joystick.ROTATION: return target.set(gamepad.axes[2], gamepad.axes[3]);
      }
    }
    throw new Error('Unexpected joystick index "%d".', index);
  },

  /**
   * Returns the state of the dpad as a THREE.Vector2.
   * @param {THREE.Vector2} target
   * @return {THREE.Vector2}
   */
  getDpad: function (target) {
    const gamepad = this.getGamepad(Hand.LEFT);
    if (!gamepad) {
      return target.set(0, 0);
    }
    if (!gamepad.buttons[_lib_GamepadButton_js__WEBPACK_IMPORTED_MODULE_0__["default"].DPAD_RIGHT]) {
      return target.set(0, 0);
    }
    return target.set(
      (gamepad.buttons[_lib_GamepadButton_js__WEBPACK_IMPORTED_MODULE_0__["default"].DPAD_RIGHT].pressed ? 1 : 0)
      + (gamepad.buttons[_lib_GamepadButton_js__WEBPACK_IMPORTED_MODULE_0__["default"].DPAD_LEFT].pressed ? -1 : 0),
      (gamepad.buttons[_lib_GamepadButton_js__WEBPACK_IMPORTED_MODULE_0__["default"].DPAD_UP].pressed ? -1 : 0)
      + (gamepad.buttons[_lib_GamepadButton_js__WEBPACK_IMPORTED_MODULE_0__["default"].DPAD_DOWN].pressed ? 1 : 0)
    );
  },

  /**
   * Returns true if the gamepad is currently connected to the system.
   * @return {boolean}
   */
  isConnected: function () {
    const gamepad = this.getGamepad(Hand.LEFT);
    return !!(gamepad && gamepad.connected);
  },

  /**
   * Returns a string containing some information about the controller. Result
   * may vary across browsers, for a given controller.
   * @return {string}
   */
  getID: function () {
    return this.getGamepad(Hand.LEFT).id;
  }
});


/***/ }),

/***/ "./src/controls/index.js":
/*!*******************************!*\
  !*** ./src/controls/index.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _checkpoint_controls_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./checkpoint-controls.js */ "./src/controls/checkpoint-controls.js");
/* harmony import */ var _checkpoint_controls_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_checkpoint_controls_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _gamepad_controls_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gamepad-controls.js */ "./src/controls/gamepad-controls.js");
/* harmony import */ var _keyboard_controls_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./keyboard-controls.js */ "./src/controls/keyboard-controls.js");
/* harmony import */ var _touch_controls_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./touch-controls.js */ "./src/controls/touch-controls.js");
/* harmony import */ var _touch_controls_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_touch_controls_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _movement_controls_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./movement-controls.js */ "./src/controls/movement-controls.js");
/* harmony import */ var _movement_controls_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_movement_controls_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _trackpad_controls_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./trackpad-controls.js */ "./src/controls/trackpad-controls.js");
/* harmony import */ var _trackpad_controls_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_trackpad_controls_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _nipple_controls_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./nipple-controls.js */ "./src/controls/nipple-controls.js");









/***/ }),

/***/ "./src/controls/keyboard-controls.js":
/*!*******************************************!*\
  !*** ./src/controls/keyboard-controls.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib_keyboard_polyfill_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../lib/keyboard.polyfill.js */ "./lib/keyboard.polyfill.js");
/* harmony import */ var _lib_keyboard_polyfill_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_lib_keyboard_polyfill_js__WEBPACK_IMPORTED_MODULE_0__);
/* global AFRAME, THREE */
/* eslint-disable no-prototype-builtins */


const PROXY_FLAG = '__keyboard-controls-proxy';

const KeyboardEvent = window.KeyboardEvent;

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
AFRAME.registerComponent('keyboard-controls', {
  schema: {
    enabled:           { default: true },
    debug:             { default: false }
  },

  init: function () {
    this.dVelocity = new THREE.Vector3();
    this.localKeys = {};
    this.listeners = {
      keydown: this.onKeyDown.bind(this),
      keyup: this.onKeyUp.bind(this),
      blur: this.onBlur.bind(this),
      onContextMenu: this.onContextMenu.bind(this),
    };
  },

  /*******************************************************************
  * Movement
  */

  isVelocityActive: function () {
    return this.data.enabled && !!Object.keys(this.getKeys()).length;
  },

  getVelocityDelta: function () {
    const data = this.data;
    const keys = this.getKeys();

    this.dVelocity.set(0, 0, 0);
    if (data.enabled) {
      if (keys.KeyW || keys.ArrowUp)    { this.dVelocity.z -= 1; }
      if (keys.KeyA || keys.ArrowLeft)  { this.dVelocity.x -= 1; }
      if (keys.KeyS || keys.ArrowDown)  { this.dVelocity.z += 1; }
      if (keys.KeyD || keys.ArrowRight) { this.dVelocity.x += 1; }

      // Move faster when the shift key is down.
      if (keys.ShiftLeft) { this.dVelocity = this.dVelocity.multiplyScalar(2); }
    }

    return this.dVelocity.clone();
  },

  /*******************************************************************
  * Events
  */

  play: function () {
    this.attachEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
  },

  attachEventListeners: function () {
    window.addEventListener("contextmenu", this.listeners.onContextMenu, false);
    window.addEventListener("keydown", this.listeners.keydown, false);
    window.addEventListener("keyup", this.listeners.keyup, false);
    window.addEventListener("blur", this.listeners.blur, false);
  },

  onContextMenu: function () {
    for (const code in this.localKeys) {
      if (this.localKeys.hasOwnProperty(code)) {
        delete this.localKeys[code];
      }
    }
  },

  removeEventListeners: function () {
    window.removeEventListener('keydown', this.listeners.keydown);
    window.removeEventListener('keyup', this.listeners.keyup);
    window.removeEventListener('blur', this.listeners.blur);
  },

  onKeyDown: function (event) {
    if (AFRAME.utils.shouldCaptureKeyEvent(event)) {
      this.localKeys[event.code] = true;
      this.emit(event);
    }
  },

  onKeyUp: function (event) {
    if (AFRAME.utils.shouldCaptureKeyEvent(event)) {
      delete this.localKeys[event.code];
      this.emit(event);
    }
  },

  onBlur: function () {
    for (const code in this.localKeys) {
      if (this.localKeys.hasOwnProperty(code)) {
        delete this.localKeys[code];
      }
    }
  },

  emit: function (event) {
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

  isPressed: function (code) {
    return code in this.getKeys();
  },

  getKeys: function () {
    if (this.isProxied()) {
      return this.el.sceneEl.components['proxy-controls'].getKeyboard();
    }
    return this.localKeys;
  },

  isProxied: function () {
    const proxyControls = this.el.sceneEl.components['proxy-controls'];
    return proxyControls && proxyControls.isConnected();
  }

});


/***/ }),

/***/ "./src/controls/movement-controls.js":
/*!*******************************************!*\
  !*** ./src/controls/movement-controls.js ***!
  \*******************************************/
/***/ (() => {

/**
 * Movement Controls
 *
 * @author Don McCurdy <dm@donmccurdy.com>
 */

const COMPONENT_SUFFIX = '-controls';
const MAX_DELTA = 0.2; // ms
const EPS = 10e-6;
const MOVED = 'moved';

AFRAME.registerComponent('movement-controls', {

  /*******************************************************************
   * Schema
   */

  dependencies: ['rotation'],

  schema: {
    enabled:            { default: true },
    controls:           { default: ['gamepad', 'trackpad', 'keyboard', 'touch'] },
    speed:              { default: 0.3, min: 0 },
    fly:                { default: false },
    constrainToNavMesh: { default: false },
    camera:             { default: '[movement-controls] [camera]', type: 'selector' }
  },

  /*******************************************************************
   * Lifecycle
   */

  init: function () {
    const el = this.el;
    if (!this.data.camera) {
      this.data.camera = el.querySelector('[camera]');
    }
    this.velocityCtrl = null;

    this.velocity = new THREE.Vector3();
    this.heading = new THREE.Quaternion();
    this.eventDetail = {};

    // Navigation
    this.navGroup = null;
    this.navNode = null;

    if (el.sceneEl.hasLoaded) {
      this.injectControls();
    } else {
      el.sceneEl.addEventListener('loaded', this.injectControls.bind(this));
    }
  },

  update: function (prevData) {
    const el = this.el;
    const data = this.data;
    const nav = el.sceneEl.systems.nav;
    if (el.sceneEl.hasLoaded) {
      this.injectControls();
    }
    if (nav && data.constrainToNavMesh !== prevData.constrainToNavMesh) {
      data.constrainToNavMesh
        ? nav.addAgent(this)
        : nav.removeAgent(this);
    }
    if (data.enabled !== prevData.enabled) {
      // Propagate the enabled change to all controls
      for (let i = 0; i < data.controls.length; i++) {
        const name = data.controls[i] + COMPONENT_SUFFIX;
        this.el.setAttribute(name, { enabled: this.data.enabled });
      }
    }
  },

  injectControls: function () {
    const data = this.data;

    for (let i = 0; i < data.controls.length; i++) {
      const name = data.controls[i] + COMPONENT_SUFFIX;
      this.el.setAttribute(name, { enabled: this.data.enabled });
    }
  },

  updateNavLocation: function () {
    this.navGroup = null;
    this.navNode = null;
  },

  /*******************************************************************
   * Tick
   */

  tick: (function () {
    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    const clampedEnd = new THREE.Vector3();

    return function (t, dt) {
      if (!dt) return;

      const el = this.el;
      const data = this.data;

      if (!data.enabled) return;

      this.updateVelocityCtrl();
      const velocityCtrl = this.velocityCtrl;
      const velocity = this.velocity;

      if (!velocityCtrl) return;

      // Update velocity. If FPS is too low, reset.
      if (dt / 1000 > MAX_DELTA) {
        velocity.set(0, 0, 0);
      } else {
        this.updateVelocity(dt);
      }

      if (data.constrainToNavMesh
          && velocityCtrl.isNavMeshConstrained !== false) {

        if (velocity.lengthSq() < EPS) return;

        start.copy(el.object3D.position);
        end
          .copy(velocity)
          .multiplyScalar(dt / 1000)
          .add(start);

        const nav = el.sceneEl.systems.nav;
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
  }()),

  /*******************************************************************
   * Movement
   */

  updateVelocityCtrl: function () {
    const data = this.data;
    if (data.enabled) {
      for (let i = 0, l = data.controls.length; i < l; i++) {
        const control = this.el.components[data.controls[i] + COMPONENT_SUFFIX];
        if (control && control.isVelocityActive()) {
          this.velocityCtrl = control;
          return;
        }
      }
      this.velocityCtrl = null;
    }
  },

  updateVelocity: (function () {
    const vector2 = new THREE.Vector2();
    const quaternion = new THREE.Quaternion();

    return function (dt) {
      let dVelocity;
      const el = this.el;
      const control = this.velocityCtrl;
      const velocity = this.velocity;
      const data = this.data;

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
        const cameraEl = data.camera;

        // Rotate to heading
        quaternion.copy(cameraEl.object3D.quaternion);
        quaternion.premultiply(el.object3D.quaternion);
        dVelocity.applyQuaternion(quaternion);

        const factor = dVelocity.length();
        if (data.fly) {
          velocity.copy(dVelocity);
          velocity.multiplyScalar(this.data.speed * 16.66667);
        } else {
          vector2.set(dVelocity.x, dVelocity.z);
          vector2.setLength(factor * this.data.speed * 16.66667);
          velocity.x = vector2.x;
          velocity.y = 0;
          velocity.z = vector2.y;
        }
        if (velocity.x !== 0 || velocity.y !== 0 || velocity.z !== 0) {
          this.eventDetail.velocity = velocity;
          this.el.emit(MOVED, this.eventDetail);
        }
      }
    };

  }())
});


/***/ }),

/***/ "./src/controls/nipple-controls.js":
/*!*****************************************!*\
  !*** ./src/controls/nipple-controls.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var nipplejs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! nipplejs */ "./node_modules/nipplejs/dist/nipplejs.js");
/* harmony import */ var nipplejs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(nipplejs__WEBPACK_IMPORTED_MODULE_0__);
/* global AFRAME, THREE */


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

    this.moveJoystick = nipplejs__WEBPACK_IMPORTED_MODULE_0___default().create(options);
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

    this.lookJoystick = nipplejs__WEBPACK_IMPORTED_MODULE_0___default().create(options);
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


/***/ }),

/***/ "./src/controls/touch-controls.js":
/*!****************************************!*\
  !*** ./src/controls/touch-controls.js ***!
  \****************************************/
/***/ (() => {

/**
 * Touch-to-move-forward controls for mobile.
 */
AFRAME.registerComponent('touch-controls', {
  schema: {
    enabled: { default: true },
    reverseEnabled: { default: true }
  },

  init: function () {
    this.dVelocity = new THREE.Vector3();
    this.bindMethods();
    this.direction = 0;
  },

  play: function () {
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
    this.dVelocity.set(0, 0, 0);
  },

  remove: function () {
    this.pause();
  },

  addEventListeners: function () {
    const sceneEl = this.el.sceneEl;
    const canvasEl = sceneEl.canvas;

    if (!canvasEl) {
      sceneEl.addEventListener('render-target-loaded', this.addEventListeners.bind(this));
      return;
    }

    canvasEl.addEventListener('touchstart', this.onTouchStart, {passive: true});
    canvasEl.addEventListener('touchend', this.onTouchEnd, {passive: true});
    const vrModeUI = sceneEl.getAttribute('vr-mode-ui');
    if (vrModeUI && vrModeUI.cardboardModeEnabled) {
      sceneEl.addEventListener('enter-vr', this.onEnterVR);
    }
  },

  removeEventListeners: function () {
    const canvasEl = this.el.sceneEl && this.el.sceneEl.canvas;
    if (!canvasEl) { return; }

    canvasEl.removeEventListener('touchstart', this.onTouchStart);
    canvasEl.removeEventListener('touchend', this.onTouchEnd);
    this.el.sceneEl.removeEventListener('enter-vr', this.onEnterVR)
  },

  isVelocityActive: function () {
    return this.data.enabled && !!this.direction;
  },

  getVelocityDelta: function () {
    this.dVelocity.z = this.direction;
    return this.dVelocity.clone();
  },

  bindMethods: function () {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onEnterVR = this.onEnterVR.bind(this);
  },

  onTouchStart: function (e) {
    this.direction = -1;
    if (this.data.reverseEnabled && e.touches && e.touches.length === 2) {
      this.direction = 1;
    }
    e.preventDefault();
  },

  onTouchEnd: function (e) {
    this.direction = 0;
    e.preventDefault();
  },

  onEnterVR: function () {
    // This is to make the Cardboard button on Chrome Android working
    const xrSession = this.el.sceneEl.xrSession;
    if (!xrSession) { return; }
    xrSession.addEventListener('selectstart', this.onTouchStart);
    xrSession.addEventListener('selectend', this.onTouchEnd);
  }
});


/***/ }),

/***/ "./src/controls/trackpad-controls.js":
/*!*******************************************!*\
  !*** ./src/controls/trackpad-controls.js ***!
  \*******************************************/
/***/ (() => {

/**
 * 3dof (Gear VR, Daydream) controls for mobile.
 */
AFRAME.registerComponent('trackpad-controls', {
  schema: {
    enabled: { default: true },
    enableNegX: { default: true },
    enablePosX: { default: true },
    enableNegZ: { default: true },
    enablePosZ: { default: true },
    mode: { default: 'touch', oneOf: ['swipe', 'touch', 'press'] }

  },

  init: function () {
    this.dVelocity = new THREE.Vector3();
    this.zVel      = 0;
    this.xVel      = 0;
    this.bindMethods();
  },

  play: function () {
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
    this.dVelocity.set(0, 0, 0);
  },

  remove: function () {
    this.pause();
  },

  addEventListeners: function () {
    const data = this.data;
    const sceneEl = this.el.sceneEl;

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

  removeEventListeners: function () {
    const sceneEl = this.el.sceneEl;

    sceneEl.removeEventListener('axismove', this.onAxisMove);
    sceneEl.removeEventListener('trackpadtouchstart', this.onTouchStart);
    sceneEl.removeEventListener('trackpadtouchend', this.onTouchEnd);
    sceneEl.removeEventListener('trackpaddown', this.onTouchStart);
    sceneEl.removeEventListener('trackpadup', this.onTouchEnd);
  },

  isVelocityActive: function () {
    return this.data.enabled && this.isMoving;
  },

  getVelocityDelta: function () {
    this.dVelocity.z = this.isMoving ? -this.zVel : 1;
    this.dVelocity.x = this.isMoving ? this.xVel : 1;
    return this.dVelocity.clone();
  },

  bindMethods: function () {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onAxisMove = this.onAxisMove.bind(this);
  },

  onTouchStart: function (e) {
    switch(this.data.mode){
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

  onTouchEnd: function (e) {
    if(this.data.mode == 'swipe') {
        this.startingAxisData = [];
    }

    this.isMoving = false;
    e.preventDefault();
  },

  onAxisMove: function(e){
    switch (this.data.mode) {
      case 'swipe':
        return this.handleSwipeAxis(e);
      case 'touch':
      case 'press':
        return this.handleTouchAxis(e);
    }
  },

  handleSwipeAxis: function(e) {
    const data = this.data;
    const axisData = e.detail.axis;

    if(this.startingAxisData.length === 0 && this.canRecordAxis){
      this.canRecordAxis = false;
      this.startingAxisData[0] = axisData[0];
      this.startingAxisData[1] = axisData[1];
    }

    if(this.startingAxisData.length > 0){
      let velX = 0;
      let velZ = 0;

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

      const absChangeZ  = Math.abs(this.startingAxisData[1] - axisData[1]);
      const absChangeX  = Math.abs(this.startingAxisData[0] - axisData[0]);

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

  handleTouchAxis: function(e) {
    const data = this.data;
    const axisData = e.detail.axis;

    let velX = 0;
    let velZ = 0;

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



/***/ }),

/***/ "./src/loaders/animation-mixer.js":
/*!****************************************!*\
  !*** ./src/loaders/animation-mixer.js ***!
  \****************************************/
/***/ (() => {

const LoopMode = {
  once: THREE.LoopOnce,
  repeat: THREE.LoopRepeat,
  pingpong: THREE.LoopPingPong
};

/**
 * animation-mixer
 *
 * Player for animation clips. Intended to be compatible with any model format that supports
 * skeletal or morph animations through THREE.AnimationMixer.
 * See: https://threejs.org/docs/?q=animation#Reference/Animation/AnimationMixer
 */
AFRAME.registerComponent('animation-mixer', {
  schema: {
    clip: { default: '*' },
    useRegExp: {default: false},
    duration: { default: 0 },
    clampWhenFinished: { default: false, type: 'boolean' },
    crossFadeDuration: { default: 0 },
    loop: { default: 'repeat', oneOf: Object.keys(LoopMode) },
    repetitions: { default: Infinity, min: 0 },
    timeScale: { default: 1 },
    startAt: { default: 0 }
  },

  init: function () {
    /** @type {THREE.Mesh} */
    this.model = null;
    /** @type {THREE.AnimationMixer} */
    this.mixer = null;
    /** @type {Array<THREE.AnimationAction>} */
    this.activeActions = [];

    const model = this.el.getObject3D('mesh');

    if (model) {
      this.load(model);
    } else {
      this.el.addEventListener('model-loaded', (e) => {
        this.load(e.detail.model);
      });
    }
  },

  load: function (model) {
    const el = this.el;
    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);
    this.mixer.addEventListener('loop', (e) => {
      el.emit('animation-loop', { action: e.action, loopDelta: e.loopDelta });
    });
    this.mixer.addEventListener('finished', (e) => {
      el.emit('animation-finished', { action: e.action, direction: e.direction });
    });
    if (this.data.clip) this.update({});
  },

  remove: function () {
    if (this.mixer) this.mixer.stopAllAction();
  },

  update: function (prevData) {
    if (!prevData) return;

    const data = this.data;
    const changes = AFRAME.utils.diff(data, prevData);

    // If selected clips have changed, restart animation.
    if ('clip' in changes) {
      this.stopAction();
      if (data.clip) this.playAction();
      return;
    }

    // Otherwise, modify running actions.
    this.activeActions.forEach((action) => {
      if ('duration' in changes && data.duration) {
        action.setDuration(data.duration);
      }
      if ('clampWhenFinished' in changes) {
        action.clampWhenFinished = data.clampWhenFinished;
      }
      if ('loop' in changes || 'repetitions' in changes) {
        action.setLoop(LoopMode[data.loop], data.repetitions);
      }
      if ('timeScale' in changes) {
        action.setEffectiveTimeScale(data.timeScale);
      }
    });
  },

  stopAction: function () {
    const data = this.data;
    for (let i = 0; i < this.activeActions.length; i++) {
      data.crossFadeDuration
        ? this.activeActions[i].fadeOut(data.crossFadeDuration)
        : this.activeActions[i].stop();
    }
    this.activeActions.length = 0;
  },

  playAction: function () {
    if (!this.mixer) return;

    const model = this.model,
      data = this.data,
      clips = model.animations || (model.geometry || {}).animations || [];

    if (!clips.length) return;

    const re = data.useRegExp ? data.clip : wildcardToRegExp(data.clip);

    for (let clip, i = 0; (clip = clips[i]); i++) {
      if (clip.name.match(re)) {
        const action = this.mixer.clipAction(clip, model);

        action.enabled = true;
        action.clampWhenFinished = data.clampWhenFinished;
        if (data.duration) action.setDuration(data.duration);
        if (data.timeScale !== 1) action.setEffectiveTimeScale(data.timeScale);
        // animation-mixer.startAt and AnimationAction.startAt have very different meanings.
        // animation-mixer.startAt indicates which frame in the animation to start at, in msecs.
        // AnimationAction.startAt indicates when to start the animation (from the 1st frame),
        // measured in global mixer time, in seconds.
        action.startAt(this.mixer.time - data.startAt / 1000);
        action
          .setLoop(LoopMode[data.loop], data.repetitions)
          .fadeIn(data.crossFadeDuration)
          .play();
        this.activeActions.push(action);
      }
    }
  },

  tick: function (t, dt) {
    if (this.mixer && !isNaN(dt)) this.mixer.update(dt / 1000);
  }
});

/**
 * Creates a RegExp from the given string, converting asterisks to .* expressions,
 * and escaping all other characters.
 */
function wildcardToRegExp(s) {
  return new RegExp('^' + s.split(/\*+/).map(regExpEscape).join('.*') + '$');
}

/**
 * RegExp-escapes all characters in the given string.
 */
function regExpEscape(s) {
  return s.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}


/***/ }),

/***/ "./src/loaders/collada-model-legacy.js":
/*!*********************************************!*\
  !*** ./src/loaders/collada-model-legacy.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var three_addons_loaders_ColladaLoader_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three/addons/loaders/ColladaLoader.js */ "./node_modules/three/examples/jsm/loaders/ColladaLoader.js");

THREE.ColladaLoader = three_addons_loaders_ColladaLoader_js__WEBPACK_IMPORTED_MODULE_0__.ColladaLoader;

/**
 * collada-model-legacy
 *
 * Loader for COLLADA (.dae) format.
 */
AFRAME.registerComponent('collada-model-legacy', {
  schema: {type: 'asset'},

  init: function () {
    this.model = null;
    this.loader = new THREE.ColladaLoader();
  },

  update: function () {
    var self = this;
    var el = this.el;
    var src = this.data;
    var rendererSystem = this.el.sceneEl.systems.renderer;

    if (!src) { return; }

    this.remove();

    this.loader.load(src, function (colladaModel) {
      self.model = colladaModel.scene;
      self.model.traverse(function (object) {
        if (object.isMesh) {
          var material = object.material;
          if (material.color) rendererSystem.applyColorCorrection(material.color);
          if (material.map) rendererSystem.applyColorCorrection(material.map);
          if (material.emissive) rendererSystem.applyColorCorrection(material.emissive);
          if (material.emissiveMap) rendererSystem.applyColorCorrection(material.emissiveMap);
        }
      });
      el.setObject3D('mesh', self.model);
      el.emit('model-loaded', {format: 'collada', model: self.model});
    });
  },

  remove: function () {
    if (!this.model) { return; }
    this.el.removeObject3D('mesh');
  }
});


/***/ }),

/***/ "./src/loaders/fbx-model.js":
/*!**********************************!*\
  !*** ./src/loaders/fbx-model.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var three_addons_loaders_FBXLoader_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three/addons/loaders/FBXLoader.js */ "./node_modules/three/examples/jsm/loaders/FBXLoader.js");

THREE.FBXLoader = three_addons_loaders_FBXLoader_js__WEBPACK_IMPORTED_MODULE_0__.FBXLoader;

/**
 * fbx-model
 *
 * Loader for FBX format.
 */
AFRAME.registerComponent('fbx-model', {
  schema: {
    src:         { type: 'asset' },
    crossorigin: { default: '' }
  },

  init: function () {
    this.model = null;
  },

  update: function () {
    const data = this.data;
    if (!data.src) return;

    this.remove();
    const loader = new THREE.FBXLoader();
    if (data.crossorigin) loader.setCrossOrigin(data.crossorigin);
    loader.load(data.src, this.load.bind(this));
  },

  load: function (model) {
    this.model = model;
    this.el.setObject3D('mesh', model);
    this.el.emit('model-loaded', {format: 'fbx', model: model});
  },

  remove: function () {
    if (this.model) this.el.removeObject3D('mesh');
  }
});


/***/ }),

/***/ "./src/loaders/index.js":
/*!******************************!*\
  !*** ./src/loaders/index.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _animation_mixer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./animation-mixer.js */ "./src/loaders/animation-mixer.js");
/* harmony import */ var _animation_mixer_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_animation_mixer_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _collada_model_legacy_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./collada-model-legacy.js */ "./src/loaders/collada-model-legacy.js");
/* harmony import */ var _fbx_model_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./fbx-model.js */ "./src/loaders/fbx-model.js");
/* harmony import */ var _object_model_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./object-model.js */ "./src/loaders/object-model.js");
/* harmony import */ var _object_model_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_object_model_js__WEBPACK_IMPORTED_MODULE_3__);






/***/ }),

/***/ "./src/loaders/object-model.js":
/*!*************************************!*\
  !*** ./src/loaders/object-model.js ***!
  \*************************************/
/***/ (() => {

/**
 * object-model
 *
 * Loader for THREE.js JSON format. Somewhat confusingly, there are two different THREE.js formats,
 * both having the .json extension. This loader supports only THREE.ObjectLoader, which typically
 * includes multiple meshes or an entire scene.
 *
 * Check the console for errors, if in doubt. You may need to use `json-model` or
 * `blend-character-model` for some .js and .json files.
 *
 * See: https://clara.io/learn/user-guide/data_exchange/threejs_export
 */
AFRAME.registerComponent('object-model', {
  schema: {
    src:         { type: 'asset' },
    crossorigin: { default: '' }
  },

  init: function () {
    this.model = null;
  },

  update: function () {
    let loader;
    const data = this.data;
    if (!data.src) return;

    this.remove();
    loader = new THREE.ObjectLoader();
    if (data.crossorigin) loader.setCrossOrigin(data.crossorigin);
    loader.load(data.src, (object) => {

      // Enable skinning, if applicable.
      object.traverse((o) => {
        if (o instanceof THREE.SkinnedMesh && o.material) {
          o.material.skinning = !!((o.geometry && o.geometry.bones) || []).length;
        }
      });

      this.load(object);
    });
  },

  load: function (model) {
    this.model = model;
    this.el.setObject3D('mesh', model);
    this.el.emit('model-loaded', {format: 'json', model: model});
  },

  remove: function () {
    if (this.model) this.el.removeObject3D('mesh');
  }
});


/***/ }),

/***/ "./src/misc/checkpoint.js":
/*!********************************!*\
  !*** ./src/misc/checkpoint.js ***!
  \********************************/
/***/ (() => {

AFRAME.registerComponent('checkpoint', {
  schema: {
    offset: {default: {x: 0, y: 0, z: 0}, type: 'vec3'}
  },

  init: function () {
    this.active = false;
    this.targetEl = null;
    this.fire = this.fire.bind(this);
    this.offset = new THREE.Vector3();
  },

  update: function () {
    this.offset.copy(this.data.offset);
  },

  play: function () { this.el.addEventListener('click', this.fire); },
  pause: function () { this.el.removeEventListener('click', this.fire); },
  remove: function () { this.pause(); },

  fire: function () {
    const targetEl = this.el.sceneEl.querySelector('[checkpoint-controls]');
    if (!targetEl) {
      throw new Error('No `checkpoint-controls` component found.');
    }
    targetEl.components['checkpoint-controls'].setCheckpoint(this.el);
  },

  getOffset: function () {
    return this.offset.copy(this.data.offset);
  }
});


/***/ }),

/***/ "./src/misc/cube-env-map.js":
/*!**********************************!*\
  !*** ./src/misc/cube-env-map.js ***!
  \**********************************/
/***/ (() => {

/**
 * @param  {Array<THREE.Material>|THREE.Material} material
 * @return {Array<THREE.Material>}
 */
function ensureMaterialArray (material) {
  if (!material) {
    return [];
  } else if (Array.isArray(material)) {
    return material;
  } else if (material.materials) {
    return material.materials;
  } else {
    return [material];
  }
}

/**
 * @param  {THREE.Object3D} mesh
 * @param  {Array<string>} materialNames
 * @param  {THREE.Texture} envMap
 * @param  {number} reflectivity  [description]
 */
function applyEnvMap (mesh, materialNames, envMap, reflectivity) {
  if (!mesh) return;

  materialNames = materialNames || [];

  mesh.traverse((node) => {

    if (!node.isMesh) return;

    const meshMaterials = ensureMaterialArray(node.material);

    meshMaterials.forEach((material) => {

      if (material && !('envMap' in material)) return;
      if (materialNames.length && materialNames.indexOf(material.name) === -1) return;

      material.envMap = envMap;
      material.reflectivity = reflectivity;
      material.needsUpdate = true;

    });

  });
}

/**
 * Specifies an envMap on an entity, without replacing any existing material
 * properties.
 */
AFRAME.registerComponent('cube-env-map', {
  multiple: true,

  schema: {
    path: {default: ''},
    extension: {default: 'jpg', oneOf: ['jpg', 'png']},
    enableBackground: {default: false},
    reflectivity: {default: 1, min: 0, max: 1},
    materials: {default: []}
  },

  init: function () {
    const data = this.data;

    this.texture = new THREE.CubeTextureLoader().load([
      data.path + 'posx.' + data.extension, data.path + 'negx.' + data.extension,
      data.path + 'posy.' + data.extension, data.path + 'negy.' + data.extension,
      data.path + 'posz.' + data.extension, data.path + 'negz.' + data.extension
    ]);
    this.texture.format = THREE.RGBAFormat;

    this.object3dsetHandler = () => {
      const mesh = this.el.getObject3D('mesh');
      const data = this.data;
      applyEnvMap(mesh, data.materials, this.texture, data.reflectivity);
    };

    this.object3dsetHandler();
    this.el.addEventListener('object3dset', this.object3dsetHandler);
    
  },

  update: function (oldData) {
    const data = this.data;
    const mesh = this.el.getObject3D('mesh');

    let addedMaterialNames = [];
    let removedMaterialNames = [];

    if (data.materials.length) {
      if (oldData.materials) {
        addedMaterialNames = data.materials.filter((name) => !oldData.materials.includes(name));
        removedMaterialNames = oldData.materials.filter((name) => !data.materials.includes(name));
      } else {
        addedMaterialNames = data.materials;
      }
    }
    if (addedMaterialNames.length) {
      applyEnvMap(mesh, addedMaterialNames, this.texture, data.reflectivity);
    }
    if (removedMaterialNames.length) {
      applyEnvMap(mesh, removedMaterialNames, null, 1);
    }

    if (oldData.materials && data.reflectivity !== oldData.reflectivity) {
      const maintainedMaterialNames = data.materials
        .filter((name) => oldData.materials.includes(name));
      if (maintainedMaterialNames.length) {
        applyEnvMap(mesh, maintainedMaterialNames, this.texture, data.reflectivity);
      }
    }

    if (this.data.enableBackground && !oldData.enableBackground) {
      this.setBackground(this.texture);
    } else if (!this.data.enableBackground && oldData.enableBackground) {
      this.setBackground(null);
    }
  },

  remove: function () {
    this.el.removeEventListener('object3dset', this.object3dsetHandler);
    const mesh = this.el.getObject3D('mesh');
    const data = this.data;

    applyEnvMap(mesh, data.materials, null, 1);
    if (data.enableBackground) this.setBackground(null);
  },

  setBackground: function (texture) {
    this.el.sceneEl.object3D.background = texture;
  }
});


/***/ }),

/***/ "./src/misc/grab.js":
/*!**************************!*\
  !*** ./src/misc/grab.js ***!
  \**************************/
/***/ (() => {

/* global CANNON */

/**
 * Based on aframe/examples/showcase/tracked-controls.
 *
 * Handles events coming from the hand-controls.
 * Determines if the entity is grabbed or released.
 * Updates its position to move along the controller.
 */
AFRAME.registerComponent('grab', {
  init: function () {
    this.system = this.el.sceneEl.systems.physics;

    this.GRABBED_STATE = 'grabbed';

    this.grabbing = false;
    this.hitEl =      /** @type {AFRAME.Element}    */ null;
    this.physics =    /** @type {AFRAME.System}     */ this.el.sceneEl.systems.physics;
    this.constraint = /** @type {CANNON.Constraint} */ null;

    // Bind event handlers
    this.onHit = this.onHit.bind(this);
    this.onGripOpen = this.onGripOpen.bind(this);
    this.onGripClose = this.onGripClose.bind(this);
  },

  play: function () {
    const el = this.el;
    el.addEventListener('hit', this.onHit);
    el.addEventListener('gripdown', this.onGripClose);
    el.addEventListener('gripup', this.onGripOpen);
    el.addEventListener('trackpaddown', this.onGripClose);
    el.addEventListener('trackpadup', this.onGripOpen);
    el.addEventListener('triggerdown', this.onGripClose);
    el.addEventListener('triggerup', this.onGripOpen);
  },

  pause: function () {
    const el = this.el;
    el.removeEventListener('hit', this.onHit);
    el.removeEventListener('gripdown', this.onGripClose);
    el.removeEventListener('gripup', this.onGripOpen);
    el.removeEventListener('trackpaddown', this.onGripClose);
    el.removeEventListener('trackpadup', this.onGripOpen);
    el.removeEventListener('triggerdown', this.onGripClose);
    el.removeEventListener('triggerup', this.onGripOpen);
  },

  onGripClose: function () {
    this.grabbing = true;
  },

  onGripOpen: function () {
    const hitEl = this.hitEl;
    this.grabbing = false;
    if (!hitEl) { return; }
    hitEl.removeState(this.GRABBED_STATE);
    this.hitEl = undefined;
    this.system.removeConstraint(this.constraint);
    this.constraint = null;
  },

  onHit: function (evt) {
    const hitEl = evt.detail.el;
    // If the element is already grabbed (it could be grabbed by another controller).
    // If the hand is not grabbing the element does not stick.
    // If we're already grabbing something you can't grab again.
    if (hitEl.is(this.GRABBED_STATE) || !this.grabbing || this.hitEl) { return; }
    hitEl.addState(this.GRABBED_STATE);
    this.hitEl = hitEl;
    this.constraint = new CANNON.LockConstraint(this.el.body, hitEl.body);
    this.system.addConstraint(this.constraint);
  }
});


/***/ }),

/***/ "./src/misc/index.js":
/*!***************************!*\
  !*** ./src/misc/index.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _checkpoint_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./checkpoint.js */ "./src/misc/checkpoint.js");
/* harmony import */ var _checkpoint_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_checkpoint_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _cube_env_map_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./cube-env-map.js */ "./src/misc/cube-env-map.js");
/* harmony import */ var _cube_env_map_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_cube_env_map_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _grab_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./grab.js */ "./src/misc/grab.js");
/* harmony import */ var _grab_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_grab_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _normal_material_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./normal-material.js */ "./src/misc/normal-material.js");
/* harmony import */ var _normal_material_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_normal_material_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _sphere_collider_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./sphere-collider.js */ "./src/misc/sphere-collider.js");
/* harmony import */ var _sphere_collider_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_sphere_collider_js__WEBPACK_IMPORTED_MODULE_4__);







/***/ }),

/***/ "./src/misc/normal-material.js":
/*!*************************************!*\
  !*** ./src/misc/normal-material.js ***!
  \*************************************/
/***/ (() => {

/**
 * Recursively applies a MeshNormalMaterial to the entity, such that
 * face colors are determined by their orientation. Helpful for
 * debugging geometry
 */
AFRAME.registerComponent('normal-material', {
  init: function () {
    this.material = new THREE.MeshNormalMaterial({flatShading: true});
    this.applyMaterial = this.applyMaterial.bind(this);
    this.el.addEventListener('object3dset', this.applyMaterial);
    this.applyMaterial();
  },

  remove: function () {
    this.el.removeEventListener('object3dset', this.applyMaterial);
  },

  applyMaterial: function () {
    this.el.object3D.traverse((node) => {
      if (node.isMesh) node.material = this.material;
    });
  }
});


/***/ }),

/***/ "./src/misc/sphere-collider.js":
/*!*************************************!*\
  !*** ./src/misc/sphere-collider.js ***!
  \*************************************/
/***/ (() => {

/**
 * Based on aframe/examples/showcase/tracked-controls.
 *
 * Implement bounding sphere collision detection for entities with a mesh.
 * Sets the specified state on the intersected entities.
 *
 * @property {string} objects - Selector of the entities to test for collision.
 * @property {string} state - State to set on collided entities.
 *
 */
AFRAME.registerComponent('sphere-collider', {
  schema: {
    enabled: {default: true},
    interval: {default: 80},
    objects: {default: ''},
    state: {default: 'collided'},
    radius: {default: 0.05},
    watch: {default: true}
  },

  init: function () {
    /** @type {MutationObserver} */
    this.observer = null;
    /** @type {Array<Element>} Elements to watch for collisions. */
    this.els = [];
    /** @type {Array<Element>} Elements currently in collision state. */
    this.collisions = [];
    this.prevCheckTime = undefined;

    this.eventDetail = {};
    this.handleHit = this.handleHit.bind(this);
    this.handleHitEnd = this.handleHitEnd.bind(this);
  },

  play: function () {
    const sceneEl = this.el.sceneEl;

    if (this.data.watch) {
      this.observer = new MutationObserver(this.update.bind(this, null));
      this.observer.observe(sceneEl, {childList: true, subtree: true});
    }
  },

  pause: function () {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  },

  /**
   * Update list of entities to test for collision.
   */
  update: function () {
    const data = this.data;
    let objectEls;

    // Push entities into list of els to intersect.
    if (data.objects) {
      objectEls = this.el.sceneEl.querySelectorAll(data.objects);
    } else {
      // If objects not defined, intersect with everything.
      objectEls = this.el.sceneEl.children;
    }
    // Convert from NodeList to Array
    this.els = Array.prototype.slice.call(objectEls);
  },

  tick: (function () {
    const position = new THREE.Vector3(),
        meshPosition = new THREE.Vector3(),
        colliderScale = new THREE.Vector3(),
        size = new THREE.Vector3(),
        box = new THREE.Box3(),
        collisions = [],
        distanceMap = new Map();
    return function (time) {
      if (!this.data.enabled) { return; }

      // Only check for intersection if interval time has passed.
      const prevCheckTime = this.prevCheckTime;
      if (prevCheckTime && (time - prevCheckTime < this.data.interval)) { return; }
      // Update check time.
      this.prevCheckTime = time;

      const el = this.el,
          data = this.data,
          mesh = el.getObject3D('mesh');
      let colliderRadius;

      if (!mesh) { return; }

      collisions.length = 0;
      distanceMap.clear();
      el.object3D.getWorldPosition(position);
      el.object3D.getWorldScale(colliderScale);
      colliderRadius = data.radius * scaleFactor(colliderScale);
      // Update collision list.
      this.els.forEach(intersect);

      // Emit events and add collision states, in order of distance.
      collisions
        .sort((a, b) => distanceMap.get(a) > distanceMap.get(b) ? 1 : -1)
        .forEach(this.handleHit);

      // Remove collision state from other elements.
      this.collisions
        .filter((el) => !distanceMap.has(el))
        .forEach(this.handleHitEnd);

      // Store new collisions
      copyArray(this.collisions, collisions);

      // Bounding sphere collision detection
      function intersect (el) {
        let radius, mesh, distance, extent;

        if (!el.isEntity) { return; }

        mesh = el.getObject3D('mesh');

        if (!mesh) { return; }

        box.setFromObject(mesh).getSize(size);
        extent = Math.max(size.x, size.y, size.z) / 2;
        radius = Math.sqrt(2 * extent * extent);
        box.getCenter(meshPosition);

        if (!radius) { return; }

        distance = position.distanceTo(meshPosition);
        if (distance < radius + colliderRadius) {
          collisions.push(el);
          distanceMap.set(el, distance);
        }
      }
      // use max of scale factors to maintain bounding sphere collision
      function scaleFactor (scaleVec) {
        return Math.max(scaleVec.x, scaleVec.y, scaleVec.z);
      }
    };
  })(),

  handleHit: function (targetEl) {
    targetEl.emit('hit');
    targetEl.addState(this.data.state);
    this.eventDetail.el = targetEl;
    this.el.emit('hit', this.eventDetail);
  },
  handleHitEnd: function (targetEl) {
    targetEl.emit('hitend');
    targetEl.removeState(this.data.state);
    this.eventDetail.el = targetEl;
    this.el.emit('hitend', this.eventDetail);
  }
});

function copyArray (dest, source) {
  dest.length = 0;
  for (let i = 0; i < source.length; i++) { dest[i] = source[i]; }
}


/***/ }),

/***/ "./src/pathfinding/index.js":
/*!**********************************!*\
  !*** ./src/pathfinding/index.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nav_mesh_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./nav-mesh.js */ "./src/pathfinding/nav-mesh.js");
/* harmony import */ var _nav_mesh_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_nav_mesh_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _nav_agent_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./nav-agent.js */ "./src/pathfinding/nav-agent.js");
/* harmony import */ var _nav_agent_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_nav_agent_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _system_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./system.js */ "./src/pathfinding/system.js");





/***/ }),

/***/ "./src/pathfinding/nav-agent.js":
/*!**************************************!*\
  !*** ./src/pathfinding/nav-agent.js ***!
  \**************************************/
/***/ (() => {

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


/***/ }),

/***/ "./src/pathfinding/nav-mesh.js":
/*!*************************************!*\
  !*** ./src/pathfinding/nav-mesh.js ***!
  \*************************************/
/***/ (() => {

/**
 * nav-mesh
 *
 * Waits for a mesh to be loaded on the current entity, then sets it as the
 * nav mesh in the pathfinding system.
 */
AFRAME.registerComponent('nav-mesh', {
  schema: {
    nodeName: {type: 'string'}
  },

  init: function () {
    this.system = this.el.sceneEl.systems.nav;
    this.hasLoadedNavMesh = false;
    this.nodeName = this.data.nodeName;
    this.el.addEventListener('object3dset', this.loadNavMesh.bind(this));
  },

  play: function () {
    if (!this.hasLoadedNavMesh) this.loadNavMesh();
  },

  loadNavMesh: function () {
    var self = this;
    const object = this.el.getObject3D('mesh');
    const scene = this.el.sceneEl.object3D;

    if (!object) return;

    let navMesh;
    object.traverse((node) => {
      if (node.isMesh &&
          (!self.nodeName || node.name === self.nodeName)) navMesh = node;
    });

    if (!navMesh) return;

    const navMeshGeometry = navMesh.geometry.clone();
    navMesh.updateWorldMatrix(true, false);
    navMeshGeometry.applyMatrix4(navMesh.matrixWorld);
    this.system.setNavMeshGeometry(navMeshGeometry);
    this.hasLoadedNavMesh = true;
  }
});


/***/ }),

/***/ "./src/pathfinding/system.js":
/*!***********************************!*\
  !*** ./src/pathfinding/system.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var three_pathfinding__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three-pathfinding */ "./node_modules/three-pathfinding/dist/three-pathfinding.module.js");


const pathfinder = new three_pathfinding__WEBPACK_IMPORTED_MODULE_0__.Pathfinding();
const ZONE = 'level';

/**
 * nav
 *
 * Pathfinding system, using PatrolJS.
 */
AFRAME.registerSystem('nav', {
  init: function () {
    this.navMesh = null;
    this.agents = new Set();
  },

  /**
   * @param {THREE.Geometry} geometry
   */
  setNavMeshGeometry: function (geometry) {
    this.navMesh = new THREE.Mesh(geometry);
    pathfinder.setZoneData(ZONE, three_pathfinding__WEBPACK_IMPORTED_MODULE_0__.Pathfinding.createZone(geometry));
    Array.from(this.agents).forEach((agent) => agent.updateNavLocation());
  },

  /**
   * @return {THREE.Mesh}
   */
  getNavMesh: function () {
    return this.navMesh;
  },

  /**
   * @param {NavAgent} ctrl
   */
  addAgent: function (ctrl) {
    this.agents.add(ctrl);
  },

  /**
   * @param {NavAgent} ctrl
   */
  removeAgent: function (ctrl) {
    this.agents.delete(ctrl);
  },

  /**
   * @param  {THREE.Vector3} start
   * @param  {THREE.Vector3} end
   * @param  {number} groupID
   * @return {Array<THREE.Vector3>}
   */
  getPath: function (start, end, groupID) {
    return this.navMesh
      ? pathfinder.findPath(start, end, ZONE, groupID)
      : null;
  },

  /**
   * @param {THREE.Vector3} position
   * @return {number}
   */
  getGroup: function (position) {
    return this.navMesh
      ? pathfinder.getGroup(ZONE, position)
      : null;
  },

  /**
   * @param  {THREE.Vector3} position
   * @param  {number} groupID
   * @return {Node}
   */
  getNode: function (position, groupID) {
    return this.navMesh
      ? pathfinder.getClosestNode(position, ZONE, groupID, true)
      : null;
  },

  /**
   * @param  {THREE.Vector3} start Starting position.
   * @param  {THREE.Vector3} end Desired ending position.
   * @param  {number} groupID
   * @param  {Node} node
   * @param  {THREE.Vector3} endTarget (Output) Adjusted step end position.
   * @return {Node} Current node, after step is taken.
   */
  clampStep: function (start, end, groupID, node, endTarget) {
    if (!this.navMesh) {
      endTarget.copy(end);
      return null;
    } else if (!node) {
      endTarget.copy(end);
      return this.getNode(end, groupID);
    }
    return pathfinder.clampStep(start, end, node, ZONE, groupID, endTarget);
  }
});


/***/ }),

/***/ "./src/primitives/a-grid.js":
/*!**********************************!*\
  !*** ./src/primitives/a-grid.js ***!
  \**********************************/
/***/ (() => {

/**
 * Flat grid.
 *
 * Defaults to 75x75.
 */
AFRAME.registerPrimitive('a-grid', {
  defaultComponents: {
    geometry: {
      primitive: 'plane',
      width: 75,
      height: 75
    },
    rotation: {x: -90, y: 0, z: 0},
    material: {
      src: 'url(https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v1.16.3/assets/grid.png)',
      repeat: '75 75'
    }
  },
  mappings: {
    width: 'geometry.width',
    height: 'geometry.height',
    src: 'material.src'
  }
});


/***/ }),

/***/ "./src/primitives/a-ocean.js":
/*!***********************************!*\
  !*** ./src/primitives/a-ocean.js ***!
  \***********************************/
/***/ (() => {

/**
 * Flat-shaded ocean primitive.
 *
 * Based on a Codrops tutorial:
 * http://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
 */
AFRAME.registerPrimitive('a-ocean', {
  defaultComponents: {
    ocean: {},
    rotation: {x: -90, y: 0, z: 0}
  },
  mappings: {
    width: 'ocean.width',
    depth: 'ocean.depth',
    density: 'ocean.density',
    amplitude: 'ocean.amplitude',
    amplitudeVariance: 'ocean.amplitudeVariance',
    speed: 'ocean.speed',
    speedVariance: 'ocean.speedVariance',
    color: 'ocean.color',
    opacity: 'ocean.opacity'
  }
});

AFRAME.registerComponent('ocean', {
  schema: {
    // Dimensions of the ocean area.
    width: {default: 10, min: 0},
    depth: {default: 10, min: 0},

    // Density of waves.
    density: {default: 10},

    // Wave amplitude and variance.
    amplitude: {default: 0.1},
    amplitudeVariance: {default: 0.3},

    // Wave speed and variance.
    speed: {default: 1},
    speedVariance: {default: 2},

    // Material.
    color: {default: '#7AD2F7', type: 'color'},
    opacity: {default: 0.8}
  },

  /**
   * Use play() instead of init(), because component mappings – unavailable as dependencies – are
   * not guaranteed to have parsed when this component is initialized.
   */
  play: function () {
    const el = this.el;
    const data = this.data;
    let material = el.components.material;

    const geometry = new THREE.PlaneGeometry(data.width, data.depth, data.density, data.density);
    this.waves = [];
    const posAttribute = geometry.getAttribute('position');
    for (let i = 0; i < posAttribute.count; i++) {
      this.waves.push({
        z: posAttribute.getZ(i),
        ang: Math.random() * Math.PI * 2,
        amp: data.amplitude + Math.random() * data.amplitudeVariance,
        speed: (data.speed + Math.random() * data.speedVariance) / 1000 // radians / frame
      });
    }

    if (!material) {
      material = {};
      material.material = new THREE.MeshPhongMaterial({
        color: data.color,
        transparent: data.opacity < 1,
        opacity: data.opacity,
        flatShading: true,
      });
    }

    this.mesh = new THREE.Mesh(geometry, material.material);
    el.setObject3D('mesh', this.mesh);
  },

  remove: function () {
    this.el.removeObject3D('mesh');
  },

  tick: function (t, dt) {
    if (!dt) return;

    const posAttribute = this.mesh.geometry.getAttribute('position');
    for (let i = 0; i < posAttribute.count; i++){
      const vprops = this.waves[i];
      const value = vprops.z + Math.sin(vprops.ang) * vprops.amp;
      posAttribute.setZ(i, value);
      vprops.ang += vprops.speed * dt;
    }
    posAttribute.needsUpdate = true;
  }
});


/***/ }),

/***/ "./src/primitives/a-tube.js":
/*!**********************************!*\
  !*** ./src/primitives/a-tube.js ***!
  \**********************************/
/***/ (() => {

/**
 * Tube following a custom path.
 *
 * Usage:
 *
 * ```html
 * <a-tube path="5 0 5, 5 0 -5, -5 0 -5" radius="0.5"></a-tube>
 * ```
 */
AFRAME.registerPrimitive('a-tube', {
  defaultComponents: {
    tube:           {},
  },
  mappings: {
    path:           'tube.path',
    segments:       'tube.segments',
    radius:         'tube.radius',
    'radial-segments': 'tube.radialSegments',
    closed:         'tube.closed'
  }
});

AFRAME.registerComponent('tube', {
  schema: {
    path:           {default: []},
    segments:       {default: 64},
    radius:         {default: 1},
    radialSegments: {default: 8},
    closed:         {default: false}
  },

  init: function () {
    const el = this.el,
        data = this.data;
    let material = el.components.material;

    if (!data.path.length) {
      console.error('[a-tube] `path` property expected but not found.');
      return;
    }

    const curve = new THREE.CatmullRomCurve3(data.path.map(function (point) {
      point = point.split(' ');
      return new THREE.Vector3(Number(point[0]), Number(point[1]), Number(point[2]));
    }));
    const geometry = new THREE.TubeGeometry(
      curve, data.segments, data.radius, data.radialSegments, data.closed
    );

    if (!material) {
      material = {};
      material.material = new THREE.MeshPhongMaterial();
    }

    this.mesh = new THREE.Mesh(geometry, material.material);
    this.el.setObject3D('mesh', this.mesh);
  },

  update: function (prevData) {
    if (!Object.keys(prevData).length) return;

    this.remove();
    this.init();
  },

  remove: function () {
    if (this.mesh) this.el.removeObject3D('mesh');
  }
});


/***/ }),

/***/ "./src/primitives/index.js":
/*!*********************************!*\
  !*** ./src/primitives/index.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _a_grid_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./a-grid.js */ "./src/primitives/a-grid.js");
/* harmony import */ var _a_grid_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_a_grid_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _a_ocean_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./a-ocean.js */ "./src/primitives/a-ocean.js");
/* harmony import */ var _a_ocean_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_a_ocean_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _a_tube_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./a-tube.js */ "./src/primitives/a-tube.js");
/* harmony import */ var _a_tube_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_a_tube_js__WEBPACK_IMPORTED_MODULE_2__);





/***/ }),

/***/ "three":
/*!************************!*\
  !*** external "THREE" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_three__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!******************!*\
  !*** ./index.js ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _src_controls_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/controls/index.js */ "./src/controls/index.js");
/* harmony import */ var _src_loaders_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/loaders/index.js */ "./src/loaders/index.js");
/* harmony import */ var _src_misc_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/misc/index.js */ "./src/misc/index.js");
/* harmony import */ var _src_pathfinding_index_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/pathfinding/index.js */ "./src/pathfinding/index.js");
/* harmony import */ var _src_primitives_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./src/primitives/index.js */ "./src/primitives/index.js");






})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=aframe-extras.js.map