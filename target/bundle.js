(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global['push-it-to-the-limit'] = {}));
}(this, function (exports) { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function complete(resolve, fn, args, context) {
    resolve(fn.call(context, ...args));
  }
  const REJECTED = 'Rejected';
  function fail(reject, message = REJECTED) {
    reject(new Error(message));
  }
  const REJECTED_ON_CANCEL = 'Rejected on cancel';
  function failOnCancel(reject) {
    fail(reject, REJECTED_ON_CANCEL);
  }
  const DEFAULT_DELAY = 0;
  function adapter(wrapper) {
    return (fn, value, lodashOpts) => {
      assertFn(fn);

      let opts = _objectSpread({
        delay: DEFAULT_DELAY
      }, lodashOpts);

      if (typeof value === 'number') {
        opts = _objectSpread({}, lodashOpts, {
          delay: value
        });
      } else if (Array.isArray(value)) {
        opts = _objectSpread({
          delay: DEFAULT_DELAY
        }, lodashOpts, {
          limit: value
        });
      } else if (typeof value === 'object' && typeof value.period === 'number' && typeof value.count === 'number') {
        opts = _objectSpread({
          delay: value
        }, lodashOpts);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        opts = _objectSpread({
          delay: DEFAULT_DELAY
        }, lodashOpts, value);
      }

      return wrapper(fn, opts);
    };
  }
  function assert(condition, text = 'Assertion error') {
    if (!condition) {
      throw new Error(text);
    }
  }
  function assertFn(target) {
    assert(typeof target === 'function', 'Target must be a function');
  }
  function dropTimeout(timeout) {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
  function normalizeDelay(delay) {
    if (delay === undefined) {
      return [];
    }

    return [].concat(delay).map(v => typeof v === 'number' ? {
      period: v,
      count: 1
    } : v);
  }

  class Limiter {
    constructor(delays) {
      this.limits = delays.map(delay => _objectSpread({}, delay, {
        rest: delay.count,
        ttl: 0
      }));
      return this;
    }

    decrease() {
      this.limits.forEach(limit => {
        limit.rest += -1;
      });
    }

    reset() {
      this.limits.forEach(this.constructor.refreshLimit);
    }

    resetTtl() {
      this.limits.forEach(this.constructor.refreshTtl);
    }

    isAllowed() {
      return !this.limits.find(({
        rest
      }) => rest < 1);
    }

    getNextDelay() {
      let ttl = 0;
      const limits = this.limits;

      for (let i = 0; i < limits.length; i++) {
        let limit = limits[i];

        if (limit.rest < 1 && limit.ttl > ttl) {
          ttl = limit.ttl;
        }
      }

      return ttl - Date.now();
    }

    getNextQueueSize() {
      this.reset();
      return Math.min.apply(Math, this.limits.map(({
        rest
      }) => rest));
    }

    static refreshLimit(limit) {
      if (limit.ttl === undefined || limit.ttl < Date.now()) {
        limit.rest = limit.count;
        limit.ttl = Date.now() + limit.period;
      }

      return limit;
    }

    static refreshTtl(limit) {
      limit.ttl = Date.now() + limit.period;
    }

  }

  const DEFAULT_OPTS = {
    leading: false,
    trailing: true
  };
  var debounce = adapter((fn, opts) => {
    const {
      delay,
      limit,
      context,
      rejectOnCancel,
      maxWait,
      leading,
      order
    } = _objectSpread({}, DEFAULT_OPTS, opts);

    const limiter = new Limiter(normalizeDelay(limit || delay));
    const calls = [];
    const args = [];
    let timeout;
    let maxTimeout;
    let promise;
    let queueLimit = null;

    const res = (..._args) => {
      if (queueLimit === null) {
        queueLimit = limiter.getNextQueueSize();
      }

      let shouldRun = leading && queueLimit > 0;

      if (queueLimit > 0 || promise === null) {
        promise = new Promise((resolve, reject) => {
          calls.push({
            complete: () => complete(resolve, fn, order === 'fifo' ? args.shift() : args.pop(), context),
            fail: failOnCancel.bind(null, reject)
          });
        });
        limiter.decrease();
        queueLimit += -1;
      }

      args.push(_args);
      limiter.resetTtl();
      const nextDelay = limiter.getNextDelay();

      if (shouldRun) {
        const _p = promise;
        timeout = setTimeout(res.flush, nextDelay);
        promise = null;
        calls.forEach(call => call.complete());
        calls.length = 0;
        return _p;
      }

      dropTimeout(timeout);
      timeout = setTimeout(res.flush, nextDelay);

      if (maxWait && !maxTimeout) {
        maxTimeout = setTimeout(res.flush, maxWait);
      }

      return promise;
    };

    res.flush = () => {
      limiter.reset();
      promise = null;
      queueLimit = null;
      calls.forEach(call => call.complete());
      calls.length = 0;
      res.cancel();
    };

    res.cancel = () => {
      dropTimeout(timeout);
      dropTimeout(maxTimeout);
      queueLimit = null;
      promise = null;
      timeout = null;
      maxTimeout = null;
      args.length = 0;

      if (rejectOnCancel) {
        calls.forEach(call => call.fail);
      }

      calls.length = 0;
    };

    return res;
  });

  var delay = adapter((fn, opts) => {
    const delay = typeof opts.delay === 'number' ? {
      period: opts.delay,
      count: Infinity
    } : opts.delay;
    const maxWait = typeof opts.delay === 'number' ? opts.delay : undefined;
    return debounce(fn, _objectSpread({
      maxWait
    }, opts, {
      delay,
      order: 'fifo'
    }));
  });

  var throttle = adapter((fn, opts) => {
    const maxWait = typeof opts.delay === 'number' ? opts.delay : undefined;
    return debounce(fn, _objectSpread({
      leading: true,
      maxWait
    }, opts));
  });

  var ratelimit = adapter((fn, opts) => {
    let timeout = null;
    const {
      delay,
      limit,
      context,
      rejectOnCancel
    } = opts;
    const delays = normalizeDelay(limit || delay);
    const limiter = new Limiter(delays);
    const calls = [];

    const processCalls = (calls, limiter) => {
      dropTimeout(timeout);
      limiter.reset();
      invokeToTheLimit(calls, limiter);
      timeout = processTimeouts(calls, limiter, processCalls);
    };

    const res = (...args) => new Promise((resolve, reject) => {
      calls.push({
        complete: complete.bind(null, resolve, fn, args, context),
        fail: failOnCancel.bind(null, reject)
      });
      processCalls(calls, limiter);
    });

    res.flush = () => {
      calls.forEach(call => call.complete());
      res.cancel();
    };

    res.cancel = () => {
      if (rejectOnCancel) {
        calls.forEach(call => call.fail());
      }

      calls.length = 0;
      dropTimeout(timeout);
    };

    return res;
  });
  function invokeToTheLimit(calls, limiter) {
    while (calls.length > 0 && limiter.isAllowed()) {
      limiter.decrease();
      calls.shift().complete();
    }
  }
  function refreshTimeouts(calls, limiter, handler) {
    return setTimeout(() => handler(calls, limiter), limiter.getNextDelay());
  }
  function processTimeouts(calls, limiter, handler) {
    if (calls.length > 0) {
      return refreshTimeouts(calls, limiter, handler);
    }

    return null;
  }

  var stabilize = adapter((fn, opts) => {
    const maxWait = typeof opts.delay === 'number' ? opts.delay : undefined;
    return debounce(fn, _objectSpread({
      maxWait
    }, opts));
  });

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var repeater = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", {value: !0}), exports.default = createRepeater;

  function _typeof(a) {
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (a) {
      return typeof a
    } : function (a) {
      return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a
    }, _typeof(a)
  }

  function createRepeater(a, b, c, d) {
    if ("object" === _typeof(a)) {
      var e = a.target, f = a.delay, g = a.context, h = a.limit;
      return createRepeater(e, f, g, h)
    }
    assert(a, b);
    var i = function () {
      var a = i.timeout, c = i.target, d = i.limit, e = i.context, f = getNextLimit(d);
      clearTimeout(a);
      for (var g = arguments.length, h = Array(g), j = 0; j < g; j++) h[j] = arguments[j];
      return (void 0 === f || 0 < f) && (i.limit = f, i.args = h, i.timeout = setTimeout(i.bind.apply(i, [i].concat(h)), b)), c.call.apply(c, [e].concat(h))
    };
    return i.target = a, i.delay = b, i.limit = d, i.context = c, i
  }

  function assert(a, b) {
    if ("function" != typeof a) throw new Error("repeater: target must be callable")
    if (!b) throw new Error("repeater: delay must not be empty")
  }

  function getNextLimit(a) {
    return "number" == typeof a ? a - 1 : void 0
  }
  });

  unwrapExports(repeater);

  var dist = createCommonjsModule(function (module, exports) {
  var _repeater = _interopRequireDefault(repeater);
  Object.defineProperty(exports, "__esModule", {value: !0}), exports.default = void 0;

  function _interopRequireDefault(a) {
    return a && a.__esModule ? a : {default: a}
  }

  var _default = _repeater.default;
  exports.default = _default;
  });

  var repeater$1 = unwrapExports(dist);

  var repeat = adapter((fn, opts) => {
    const res = repeater$1(_objectSpread({
      target: fn
    }, opts));

    res.cancel = () => {
      dropTimeout(res.timeout);
    };

    res.flush = () => {
      fn.call(res.context, res.args);
      res.cancel();
    };

    return res;
  });

  exports.DEFAULT_DELAY = DEFAULT_DELAY;
  exports.REJECTED = REJECTED;
  exports.REJECTED_ON_CANCEL = REJECTED_ON_CANCEL;
  exports.debounce = debounce;
  exports.delay = delay;
  exports.ratelimit = ratelimit;
  exports.repeat = repeat;
  exports.stabilize = stabilize;
  exports.throttle = throttle;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
