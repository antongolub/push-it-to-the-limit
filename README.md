# Push it to the limit

Delay wrappers for common purposes.

#### Notes and refs
* [The differences between `throttle` and `debounce`](https://css-tricks.com/debouncing-throttling-explained-examples/).
* [node-function-rate-limit](https://github.com/wankdanker/node-function-rate-limit)

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

#### `ratelimit`

#### `swaplimit`
— Why not just use `debounce`?  
— Debounced fn awaits some time before it invokes the origin function, so if , target fn would never been called.  
— But here's `ratelimit`, isn't it?  
— Ratelimit expands the calls timeline to match frequency limit.  
— ...  
— This wrapper swaps some calls like `throttle`, but guarantees that target fn would be call every `n` ms.  
