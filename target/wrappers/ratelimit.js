"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.invokeToTheLimit=invokeToTheLimit,exports.refreshTimeouts=refreshTimeouts,exports.processTimeouts=processTimeouts,exports.default=void 0;var _common=require("../common"),_limiter=_interopRequireDefault(require("../limiter"));function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}var _default=(0,_common.adapter)(function(a,b){var c=null,d=b.delay,e=b.limit,f=b.context,g=b.rejectOnCancel,h=(0,_common.normalizeDelay)(e||d),i=new _limiter.default(h),j=[],k=function(a,b){(0,_common.dropTimeout)(c),b.reset(),invokeToTheLimit(a,b),c=processTimeouts(a,b,k)},l=function(){for(var b=arguments.length,c=Array(b),d=0;d<b;d++)c[d]=arguments[d];return new Promise(function(b,d){j.push({complete:_common.complete.bind(null,b,a,c,f),fail:_common.failOnCancel.bind(null,d)}),k(j,i)})};return l.flush=function(){j.forEach(function(a){return a.complete()}),l.cancel()},l.cancel=function(){g&&j.forEach(function(a){return a.fail()}),j.length=0,(0,_common.dropTimeout)(c)},l});exports.default=_default;function invokeToTheLimit(a,b){for(;0<a.length&&b.isAllowed();)b.decrease(),a.shift().complete()}function refreshTimeouts(a,b,c){return setTimeout(function(){return c(a,b)},b.getNextDelay())}function processTimeouts(a,b,c){return 0<a.length?refreshTimeouts(a,b,c):null}