# Push it to the limit

Delay wrappers for common purposes. Fast and simple.

#### Main features
* `Promise` as a result
*  Interrelated delays support
* [Lodash](https://lodash.com/)-compatible API

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
Have a look at this [ratelimit](https://github.com/wankdanker/node-function-rate-limit/blob/master/index.js) implementation. That's good except the only thing: generating timeout for each invocation looks redundant.

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
`ratelimit` supports interrelated delays. So you're are able to set complex restrictions like:
```javascript
    [{period: 1000, count: 10}, {period: 60000, count: 200}]
```
It's 10 requests per second and 200 requests per minute.


#### `swaplimit`
— Why not just use `debounce`?  
— Debounced fn awaits some time before it invokes the origin function, so if , target fn would never been called.  
— But here's `ratelimit`, isn't it?  
— Ratelimit "expands" the calls timeline to match frequency limit.  
— ...  
— This wrapper swaps some calls like `throttle`, but guarantees that target fn would be called at least every `n` ms.

#### Notes and refs
* [The differences between `throttle` and `debounce`](https://css-tricks.com/debouncing-throttling-explained-examples/).
* [node-function-rate-limit](https://github.com/wankdanker/node-function-rate-limit)
* [SGrondin/bottleneck](https://github.com/SGrondin/bottleneck)
