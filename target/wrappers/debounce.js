"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=exports.DEFAULT_OPTS=void 0;var _common=require("../common"),_limiter=_interopRequireDefault(require("../limiter"));function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}function _objectSpread(a){for(var b=1;b<arguments.length;b++){var c=null==arguments[b]?{}:arguments[b],d=Object.keys(c);"function"==typeof Object.getOwnPropertySymbols&&(d=d.concat(Object.getOwnPropertySymbols(c).filter(function(a){return Object.getOwnPropertyDescriptor(c,a).enumerable}))),d.forEach(function(b){_defineProperty(a,b,c[b])})}return a}function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}var DEFAULT_OPTS={leading:!1,trailing:!0};exports.DEFAULT_OPTS=DEFAULT_OPTS;var _default=(0,_common.adapter)(function(a,b){var c,d,e,f=_objectSpread({},DEFAULT_OPTS,b),g=f.delay,h=f.limit,i=f.context,j=f.rejectOnCancel,k=f.maxWait,l=f.leading,m=f.order,n=new _limiter.default((0,_common.normalizeDelay)(h||g)),o=[],p=[],q=null,r=function(){null===q&&(q=n.getNextQueueSize());var b=l&&0<q;(0<q||null===e)&&(e=new Promise(function(b,c){o.push({complete:function complete(){return(0,_common.complete)(b,a,"fifo"===m?p.shift():p.pop(),i)},fail:_common.failOnCancel.bind(null,c)})}),n.decrease(),q+=-1);for(var f=arguments.length,g=Array(f),h=0;h<f;h++)g[h]=arguments[h];p.push(g),n.resetTtl();var j=n.getNextDelay();if(b){var s=e;return c=setTimeout(r.flush,j),e=null,o.forEach(function(a){return a.complete()}),o.length=0,s}return(0,_common.dropTimeout)(c),c=setTimeout(r.flush,j),k&&!d&&(d=setTimeout(r.flush,k)),e};return r.flush=function(){n.reset(),e=null,q=null,o.forEach(function(a){return a.complete()}),o.length=0,r.cancel()},r.cancel=function(){(0,_common.dropTimeout)(c),(0,_common.dropTimeout)(d),q=null,e=null,c=null,d=null,p.length=0,j&&o.forEach(function(a){return a.fail}),o.length=0},r});exports.default=_default;