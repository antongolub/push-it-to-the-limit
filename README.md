# Push it to the limit

[![Build Status](https://app.travis-ci.com/antongolub/push-it-to-the-limit.svg?branch=master)](https://app.travis-ci.com/antongolub/push-it-to-the-limit)
[![npm (tag)](https://img.shields.io/npm/v/push-it-to-the-limit/latest.svg)](https://www.npmjs.com/package/push-it-to-the-limit)
[![Maintainability](https://api.codeclimate.com/v1/badges/d751b0eb18e737f8694b/maintainability)](https://codeclimate.com/github/antongolub/push-it-to-the-limit/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/d751b0eb18e737f8694b/test_coverage)](https://codeclimate.com/github/antongolub/push-it-to-the-limit/test_coverage)

Delay wrappers for common purposes. <s>Fast and simple</s> with promises.
#### Main features
* `Promise` as a result
* [Lodash](https://lodash.com)-compatible API
* Interrelated delays support
* Exposed `Flow` libdefs

## Install
```bash
    npm i push-it-to-the-limit
    yarn add push-it-to-the-limit
```
Dist contains cjs-formatted `bundle.es5.js` and its parts as es5-modules, so you may use them directly.

## API
[The interface](./src/interface.js) is dumb: each wrapper gets at least one argument — `target` function. The second param is `opt`, which may be a numeric `delay` or a `IWrapperOpts` object. Also the scheme with three arguments is supported as in lodash. Wrapper returns `IControlled` function: it's a functor with a pair exposed util methods: `cancel` and `flush`.  
* `flush()` immediately invokes the `target` fn.
* `cancel()` clears any bounded timeout.

### `IDelay`
_Basic_ `delay` is a rate limit — 1 request per `n` ms. Sometimes you may face with more _complex_ restriction like "10 req per 100ms" and, you know, this is not the same as "1 req per 10ms". Moreover, "10 requests per second and 200 requests per minute" also occurs. The last case is _interrelated delay_.
```javascript
// basic numeric delay
  const d1 = 100
  
// complex delay
  const d2 = {period: 1000, count: 10}
  
// interrelated delay
  const d3 = [{period: 1000, count: 10}, {period: 60000, count: 200}]

// mixed case
  const d4 = [1000, {period: 60000, count: 20}]
```

## Usage examples
#### `delay`
Each function call is delayed for a specified time.
```javascript
    import {delay} from 'push-it-to-the-limit'

    const delayedLog = delay(console.log, 10000)
    
    delayedLog('foo')
    delayedLog('bar')
    
    // ~10 second later in stdout
    // foo
    // bar
```

Wrapped function always returns a `Promise`, so you are're able to use `await` or `then()`
```javascript
    const delayed = delay(() => 'bar', 100)
    const foo = await delayed() // 'bar'
```

#### `throttle`
Returns the function that invokes origin fn at most once per a period.
```javascript
    import {throttle} from 'push-it-to-the-limit'
    const throttled = throttle(v => v, 100)

    throttled('foo')  // 'foo'
    throttled('bar')  // 'foo'

    // 100 ms later
    throttled('baz')  // 'baz'
```

#### `debounce`
`debounce` groups multiple sequential calls in a single one with the last passed args.
```javascript
    import {debounce} from 'push-it-to-the-limit'
    const debounced = debounce(v => v, 1)
    const [foo, bar] = await Promise.all([debounced('baz'), debounced('qux')])
        
    foo === 'qux' // true
    foo === bar   // true
```

#### `ratelimit`
`ratelimit` confines the execution frequency of target function. Overlimited invocations are being `delayed` until the limit reset.
Have a look at this [ratelimit](https://github.com/wankdanker/node-function-rate-limit/blob/master/index.js) implementation. That's good enough except the only thing: generating timeout for each invocation looks redundant.

```javascript
    import {ratelimit} from 'push-it-to-the-limit'

    const period = 100
    const count = 2
    const start = Date.now()
    const fn = ratelimit(x => {
      console.log('%s ms - %s', Date.now() - start, x)
    }, {period, count})

    for (let y = 0; y < 10; y++) {
      fn(y)
    }

/** stdout
    1 ms - 0
    14 ms - 1
    103 ms - 2
    105 ms - 3
    204 ms - 4
    206 ms - 5
    305 ms - 6
    310 ms - 7
    411 ms - 8
    412 ms - 9
 */
```
`ratelimit` supports interrelated delays. So you're able to set complex restrictions like:
```javascript
    [{period: 1000, count: 10}, {period: 60000, count: 200}]
```
It's 10 requests per second and 200 requests per minute. You can also share the same limit across several functions.
```typescript
const l1 = new Limiter([{ period: 10, count: 4 }])
const l2 = new Limiter([{ period: 50, count: 5 }, l1])

const throttled1 = throttle(fn1, {limiter: l2})
const throttled2 = throttle(fn2, {limiter: l1})
const throttled3 = throttle(fn3, {limiter: l1})
```

#### `stabilize`
— Why not just use `debounce`?  
— Debounced fn awaits some time before it invokes the origin function, so if ..., target fn would never been called.  
— But here's `ratelimit`, isn't it?  
— Ratelimit "expands" the calls timeline to match frequency limit.  
— ...  
— This wrapper swaps some calls like `throttle`, but guarantees that target fn would be called at least every `n` ms.  
— Still looks similar to [Lodash debounce](https://lodash.com/docs/4.17.10#debounce) with `maxDelay` opt.  
— Yes. But this one returns a `Promise`.  
— Why just not...  
— Ok. It's a shortcut for `debounce` with `maxDelay` opt, that equals `delay`.  
— And how about this: `throttle(fn, {delay: 100, maxWait: 100, leading: false, trailing: true})`?  
— `throttle` is a special case of `debounce`  
— ...  
— **Actually everything is `debounce`**.

```javascript
    const fn = v => v
    const stable = stabilize(fn, 100)

    for (let y = 0; y < 10; y++) {
      (x => setTimeout(() => {
        const start = Date.now()
    
        stable(x)
          .then(v => console.log('x=', x, 'value=', v, 'delay=', (Date.now() - start)))
        }, x * 20 )
      )(y)
    }
 
 /** stdout
    x= 0 value= 5 delay= 103
    x= 1 value= 5 delay= 94
    x= 2 value= 5 delay= 72
    x= 3 value= 5 delay= 58
    x= 4 value= 5 delay= 35
    x= 5 value= 5 delay= 19
    x= 6 value= 9 delay= 103
    x= 7 value= 9 delay= 85
    x= 8 value= 9 delay= 66
    x= 9 value= 9 delay= 48
  */
```

#### `repeat`
[Repeater](https://github.com/antongolub/repeater) makes a function to be autocallable. It stores the last call params and uses them for further invocations.

```javascript
    import {repeat} from '@antongolub/push-it-to-the-limit'
    
    function fn (step) { this.i += step }
    const context = { i: 0 }
    const delay = 1000
    const rep = repeater(fn, delay, context)
    
    rep(2)
    
    // Imagine, 5 seconds later new 'manual' call occurs
    setTimeout(() => rep(1), 5000)

    // ~10 seconds after start: 
    setTimeout(() => console.log(context.i), 10000) // 15
```

#### Notes and refs
* [The differences between `throttle` and `debounce`](https://css-tricks.com/debouncing-throttling-explained-examples/).
* [wankdanker/node-function-rate-limit](https://github.com/wankdanker/node-function-rate-limit)
* [SGrondin/bottleneck](https://github.com/SGrondin/bottleneck)
* [jmperez/promise-throttle](https://github.com/jmperez/promise-throttle)
* [bjoerge/debounce-promise](https://github.com/bjoerge/debounce-promise)

#### License
[MIT](./LICENSE)
