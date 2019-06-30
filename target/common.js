"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.complete=complete,exports.fail=fail,exports.failOnCancel=failOnCancel,exports.adapter=adapter,exports.assert=assert,exports.assertFn=assertFn,exports.dropTimeout=dropTimeout,exports.normalizeDelay=normalizeDelay,exports.DEFAULT_DELAY=exports.REJECTED_ON_CANCEL=exports.REJECTED=void 0;function _typeof(a){return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},_typeof(a)}function _objectSpread(a){for(var b=1;b<arguments.length;b++){var c=null==arguments[b]?{}:arguments[b],d=Object.keys(c);"function"==typeof Object.getOwnPropertySymbols&&(d=d.concat(Object.getOwnPropertySymbols(c).filter(function(a){return Object.getOwnPropertyDescriptor(c,a).enumerable}))),d.forEach(function(b){_defineProperty(a,b,c[b])})}return a}function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}function _toConsumableArray(a){return _arrayWithoutHoles(a)||_iterableToArray(a)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance")}function _iterableToArray(a){if(Symbol.iterator in Object(a)||"[object Arguments]"===Object.prototype.toString.call(a))return Array.from(a)}function _arrayWithoutHoles(a){if(Array.isArray(a)){for(var b=0,c=Array(a.length);b<a.length;b++)c[b]=a[b];return c}}function complete(a,b,c,d){a(b.call.apply(b,[d].concat(_toConsumableArray(c))))}var REJECTED="Rejected";exports.REJECTED="Rejected";function fail(a){var b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:REJECTED;a(new Error(b))}var REJECTED_ON_CANCEL="Rejected on cancel";exports.REJECTED_ON_CANCEL="Rejected on cancel";function failOnCancel(a){fail(a,REJECTED_ON_CANCEL)}var DEFAULT_DELAY=0;exports.DEFAULT_DELAY=0;function adapter(a){return function(b,c,d){assertFn(b);var e=_objectSpread({delay:DEFAULT_DELAY},d);return"number"==typeof c?e=_objectSpread({},d,{delay:c}):Array.isArray(c)?e=_objectSpread({delay:DEFAULT_DELAY},d,{limit:c}):"object"===_typeof(c)&&"number"==typeof c.period&&"number"==typeof c.count?e=_objectSpread({delay:c},d):"object"===_typeof(c)&&!Array.isArray(c)&&(e=_objectSpread({delay:DEFAULT_DELAY},d,c)),a(b,e)}}function assert(a){var b=1<arguments.length&&arguments[1]!==void 0?arguments[1]:"Assertion error";if(!a)throw new Error(b)}function assertFn(a){assert("function"==typeof a,"Target must be a function")}function dropTimeout(a){a&&clearTimeout(a)}function normalizeDelay(a){return void 0===a?[]:[].concat(a).map(function(a){return"number"==typeof a?{period:a,count:1}:a})}