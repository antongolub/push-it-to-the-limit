"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var _common=require("../common"),_debounce=_interopRequireDefault(require("./debounce"));function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}function _objectSpread(a){for(var b=1;b<arguments.length;b++){var c=null==arguments[b]?{}:arguments[b],d=Object.keys(c);"function"==typeof Object.getOwnPropertySymbols&&(d=d.concat(Object.getOwnPropertySymbols(c).filter(function(a){return Object.getOwnPropertyDescriptor(c,a).enumerable}))),d.forEach(function(b){_defineProperty(a,b,c[b])})}return a}function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}var _default=(0,_common.adapter)(function(a,b){var c="number"==typeof b.delay?b.delay:void 0;return(0,_debounce.default)(a,_objectSpread({maxWait:c},b))});exports.default=_default;