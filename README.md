# Push it to the limit

Delay wrappers for common purposes.

#### `delay`
Each function call is delayed for specified time.
```javascript
    import {delay} from '@antongolub/push-it-to-the-limit'

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
