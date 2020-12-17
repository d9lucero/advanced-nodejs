# Node != JS
Node uses a VM to execute javascript code. This vm can be the famous 'V8' or the microsoft vm called 'chakra'.

To check on all the V8 options: `node --v8-options | less`

And to look up these options we can use the `grep` command

```shell
    node --v8-options | grep gc
```
Node uses v8 via the latter's c++ api.

Node will always wait until v8 can handle more operations.

## The `global` object

### `process`
Provides a bridge between a node app and the running env.

`version` : to read node's version and those of its dependencies.

`env` get a copy of the user's environment. That is, modifying these values will not actually modify the value they're really referring to.

`release.lts` shows current lts node name. If we run in production without an lts version we should throw a warning.

`stdin`,`stdout`,`stderr`

It is an EventEmitter. We could set an on `exit` event or an on `uncaughtException` event. (These happen at the end of the execution of the program), in the case of these events they should not execute async calls (Since the event loop has finished processing and the application is about to end) nor prevent the process form exiting.
### `Buffer`
The Buffer class that's available in node's global object is hevily used for working with binary streams of data.

Whenever there's a buffer, there's a character encoding. Once a buffer is allocated it cannot be resized.

`alloc` creates a buffer of a certain size (filled)

`allocUnsafe` creates a buffer of a certain size (not filled, can use `fill()` to accomplish this. By not filled we mean that the chunk of memory that we allocated to this buffer is just a chunk we got from our memory and it was not cleaned up, so data can be leaked into our buffer if we don't fill it properly.)

`from` allows creating a buffer from a given object (string for example)

Buffers are useful for reading image files or compressed files.

When converting streams of binary data, we should use the StringDecoder library. Using toString() will fail to decode the different chunks of data whereas StringDecoder will get it right.

## `require`
Has 5 stages. Resolving, loading, wrapping, evaluating, caching.

## Resolving and loading

Node has to look for the module. If we require a `some-module`, node will try to look up for a `some-module.js` OR a folder called `some-module` WITH an `index.js` inside of it. By default packages have their main file being pointed at `index.js` but we can change that that's what node will look up when doing this module search.

Actually the process goes a bit further than that, and it actually tries to lookup up `.js` first, then `.json` and then `.node` files. These `.node` files are node addons files.

This process is done by searching on `node_modules` folders from the current directory upwards.

We can require-resolve a module without loading it by calling `require.resolve` instead.

If the module was resolved, then node will simply execute the js file and return its function value to be assigned to whatever stated to use the require.

Circular modular dependency: if we have two modules and they require each other, it is allowed, however whoever calls it first, will get a partial result of the other module (that is, it will only get whatever got executed up until the point where the require was called)

We can't use the exports object inside timers (because we're setting a callback in the event loop, and by that time the `return module.exports` already executed).

### Wrapping

Before compiling a module, node wraps the module into a function. This wrapper function can be accessed by doing `.wrapper` to any module object.

Identify whether the module is being required or being run as a script. For that purpose we can check the `require.main` value, if it is the sale as the `module` object, then it is being run as a script, else it's being required.

### Caching

When requiring modules, node caches the require call and does not reevaluate it again even if it is require further down the code. If we want a re-evaluation of the value of the asdasdmodule we'd rather have it export a function instead of a function execution/object. That way we can call it multiple times.
# Concurrency Model and Event Loop

## IO Operations

When referring to IO operations we are referring to either files or network operations. Which are usually the most time-consuming operations.

The event loop is designed based on these type of operations

### Ways of handling these
- We can execute them synchronously.
- We can fork them.
- We can use threads. But these get complicated once trying to access shared resources.


Single threaded: node with its event loop

## The event loop
It's the entity that handles external events and converts them into callback invocations.

Everytime node starts, the event loop is started automatically. It is a loop that runs in the background picking up callbacks from the queue and pushes them to the V8's callback stack to be executed when it determines it is the time.

### The call stack
V8's call stack is used to evaluate code, it pushes statements to be evaluated to the stack in terms of how deep the code has to go to get a value in the execution order the evaluating function in question provides.

```js
    const test = (a,b) => (a+b)

    const printTest = (a,b)=>{
        const output = test(a,b)
        console.log(a,b)
    }

    printTest(1,2)
    /*
        The callstack would go:
            - console.log(1,2) (popped immediately)
            - test(1,2) (popped immediately)
            - printTest(1,2)
    */
```

If we were to create an inifinite loop (By calling the same function over and over recursively). We could reach the size limit of the call stack and make the program crash.

### Slow operations

If we were to run slow operations without the help of the event loop. Since V8 is single threaded, we would block the execution of code for these operations.

### How callbacks actually work
The bigger picture is that we have the call stack, node and the event queue (+the event loop).

So when a `setTimeout` call is processed, a timer is set in node, and the call stack entry for this callback is popped immediately. The callstack continues processing the other callbacks and when it empties and the timer in node finished running, node adds to the queue the callback that was passed to the `setTimeout` function. Then the event loop constantly checks whether the call stack is empty and if it is and the queue has elements waiting, it pushes to the call stack the callback and then it is executed.

If the timer is set to `setTimeout` is 0 (or we call `setImmediate`, however bear in mind that `setImmediate` takes precedence over `setTimeout` with 0 timer). This timer is not a guaranteed one but rather a minimum. In this case the callback is immediately added to the queue but it will not be pushed to the call stack until the stack is empty. So it is more of a "execute this callback once you're done with the current code" task.

`process.nextTick` is part of node api and allows to queue callbacks right after the callback empties but right before the event loop comes into play. This is useful and dangerous at the same time.
# Node's event-driven arch
## Callbacks, promises and async

### Callbacks
The callback pattern was used before promises and async/await code was available for js. This pattern was based in defining callbacks with two parameters `error` and `data`. Thus, if an operation failed, the callback would be called with error as parameter, else it would be called with `null` as error and the data as the second parameter
### Promises
Promises improve greatly the use of async code and allow for a cleaner code and more understandable. There are ways to convert the callback pattern into promises. However nowadays the preferrred way of working with this is with async/await
### async/await
Is the most recent way of calling asynchronous code. It allows to display asynchronous code in a linear way making it way easier to read than with promises.

## Event emitters
They are imported with the `events` module of node. We import the class and then we instantiate it. Then we can start emitting events `emmiter.emit('name',data)` (creating conditions) and registering events by adding listeners `emitter.on('event',(data)=> { <cbFunc> })`. 

## Errors and order listeners

### Errors
To avoid the crashing of the node app we should be registering an action for the `error` event. That way, we could simply log  it and continue with the operations. That is one way, another is use the `process.on('uncaughtException,<func>)` however, if doing this it is recommended to terminate the program anyway so this wouldn't be really an option for handling the error and continuing execution. The latter options is used mainly for cleaning up rather than simply handling an error. 

### Order listeners
When registering multiple listeners for an event, they'll be called in the order they were declared. There is also the `prependListener` and the `removeListener` to be used in case we want to alter this default behaviour.
# Node for networking

## The `net` module
Using the `net` module in node we can create a sockets server to connect with clients and allow bidirectional communication.

We create a server by calling `createServer`

We can make clients talk to each other by registering their sockets reference in the server (each client receive a different socket object). This registering occurs on the `connection` event and then we can make the sockets interact by the `data` event which is when they send data through the socket.

The data sent is taken as a buffer by the server. If it were to be text we could `toString()` to utf-8 decode it.

We can use the `end` event to set code for when a socket is disconnected.

Multiple things can be done by adding code to the listeners.
## The `dns` module
Translate network names to addresses and viceversa.

- `lookup` : uses libuv to get an ip address of a given url
- `resolve4` : gets ipv4 addresses associated to a given url
- `resolveMx`
- `reverse`: gets the hostnames of a give ip address.

## UDP Datagram sockets. `dgram` module
Similar to the `net` module, this module creates a UDP server instead to allow clients to connect to and send data.
# Node for web
## `http` streaming and low latency.
The `http` module is a first citizen in node. Is the main reason why node arose in the beginning.

It is a non-blocking a streaming straight away module.

We can create a server by calling `createServer` method which gives us an instance of an event emitter. This event emitter has many events, one of which is the `request` event

```js
    const server = require('http').createServer()
    server.on('request',(req,res)=>{
        res.writeHead(200,{'content-type':'text-plain';})
        res.end('Hello world\n')
    })
    server.listen(8000)
```
If we don't `end` the request we can keep on streaming data through the server. But there's a timeout (which defaults to 2min) that we can configure with the `timeout` property of the server.

Note that all requests have to call `end` so that the server does not timeout the request.

A single server can handle multiple requests at once if they have async methods that allow it to exploit the power of the event loop.
## `https` module
This module is pretty much similar to the `http` one but when creating a server we need an `options` object which contains either `key` and `cert` or `pfx` (which combines the first two).

the `key` value is the read file of a `key.pem` and the `cert` value is the read file of a `cert.pem`.
### Generate a certificate
We can generate a `key.pem` and `cert.pem` by openSSL. Which can be googled as to how to generate a self signed certificate.

## Requesting http data
For this we're going to work with the `ClientRequest` object.

```js
    const http=require('http')
    //req:ClientRequest
    const req= http.request(
        {hostname:'www.google.com'},
        //res:IncomingMessage
        (res)=>{
            console.log(res)
        }
    )
    req.on('error',(e)=>console.log(e))
    //req.agent:http.Agent
    console.log(req.agent)
    req.end();
```

The `request` method is the generic way of making requests to a certain url. If we're doing a get request, we can simply do `http.get(url,cb)`

## Routing a web app
Given that the request object comes with a `url` property we can use this property to tell the server how to respond to each of these.

The response object has a `writeHead` method that allows to write the header of the response with whatever we need. and also the `end` method accepts data as a parameter which will be sent to the requesting client

## Working with urls, the `url` module
Helps parsing urls. Checkout the documentation to see the considered parts of the urls when parsing with this module.

### `parse`
We can get the  different parts of the url with this method. It accepts a second parameter to determine whether it should create a query object for the query parameters
### `format`
On the other side, if we have the different parts of the url, we can create a url by formatting these parts.

### `queryString` module
Used especifically for queries. Using `stringify` to create a query string from an object. Using the `parse` method allows to do the operation the other way around, it gets an object.

# Node most common builtin modules

## Working the os
Info about cpu, ip addresses, free memory, type of Os. Get the release version, use info.

Error codes and signals of the os.

## Working with fs
All methods of this module have their async and sync forms.

### `readFile` - `readFileSync`
The async form uses the callback pattern to report errors. Whereas the sync method will simply throw an exception.

The async form gives back a Buffer if not specified the character encoding.

## Console module
The module is meant to match the console object given by the browser.

In node there's a global Console object as well as a console class. But they are different.

If you want to use custom streams for printing to console and printing errors, you can instantiate the `console.Console` class with those two custom streams as parameters.

This new instance will have the methods `log` and `error` that will print whatever we pass to them in the manner we defined our streams.

the console object uses the `util` function under the hood. We can use formats for string by using `%s` and `%j` for json object (these are the most common).

We can use `util.format` if we only want the string (and not log it).

When logging object, the console object uses the `util.inspect` method to print the string representation of those objects. This method allows to print objects and limit how deep we want to go in it for printing. We can pass a second argument of an object with a `depth` property which will tell how much down the object nesting we want to print. The equivalent method in `console` to print is `console.dir`.

`console.err` writes to `stderr` whereas `console.log` writes to `stdout`.

`console.assert` is a simple (and quite limited) way of making asertions, if the assertion is false it will throw an error.

`console.trace` besides printing what we want it also includes part of the callstack (useful for debugging )

`console.time` accepts a key for a timer that gets started and when calling `console.timeEnd` on the same key it will stop the timer and report how much time passed between these calls.

## Debugging Node
Running scripts with `node debug` instead of just `node`  will start a debugging session in that file. There are multiple commands to use in there. The most important ones are `sb` which sets a breakpoint to the passed line, and `watch` which sets a watch to passed string variable name. When continuing the execution of the code the watcher will report when encountering a breakpoint.

This is a clumsy debugger though. There's a chrome dev tools support to debug node scripts there. To start that we do:

```
    node --inspect --debug-brk index.js
```

That gives us a url that we can open in chrome and start debugging with chrome dev tools.
# Working with streams
Streams are a collection of data that not necesarily need to be in memory. So that's why they're so powerful.

With streams we can read and write in chunks and keep the memory low while doing so.

They are all `EventEmitter`s. They all emit events that we can use to write o read from them
## Types

- Readable: it is an abstraction for a source of which data can be consumed ig `fs.createReadStream`
- Writable: it is an abstraction for a destination to which data can be written. `fs.createWriteStream`
- Duplex: it is a readable and writeable stream, ig:  `net.socket`.
- Transform: these are duplex streams that also have the capability of transforming the data as it is being read/written. Ig: `zlib.createGzip`

## Consuming streams with `pipe`

```js
    src.pipe(dst)
```

In this case we're piping the output of a readable stream `src` as the input for a writable stream `dst`. So that the defines the types of the objects when using pipe. Since duplex streams are both readable and writable we can use them interchangeable here, and also we can chain these pipe calls.

Piping streams is the easy way to consume streams, but in case there's a need of more complex/custom behaviour, using events is the way to go.

## Implementing and consuming streams

To implement we simple require the `stream` module. For consuming we use either `pipe` or events.

## Most important events in streams
- Readable:
  - `data`: emitted when data is passed to consumer
  - `end`: when there's no  more data to pass to the consumer.
- Writable:
  - `drain`: when the writable stream can't receive more data.
  - `finish`: when all the data has been flushed to the underline system.

## Most important methods in streams
- Readable
  - `pipe`,`unpipe`
  - `read`,`unshift`,`resume`
- Writable
  - `write`
  - `end`: we call it when we're done

## Readable streams states
They can be in the `paused` (pull) state or in the `flowing` (push) state.

When they're in pause mode we have to use the `read` method to read from it. Whereas in the flow mode we need to listen to events to consume it. When in flowing mode data could be lost if there aren't any consumers receiving the data. This is when the `data` event handler comes into play, even so if we add this handler the stream switches from paused to flowing mode.

To switch between these two modes the methods `resume` and `pause` are used.

## Implement writable stream

```js
    const {Writable} = require('stream')
    const outStream = new Writable({
        write(chunk,ecoding,callback){
            console.log(chunk.toString())
            callback()
        }
    })
    
    //consuming
    process.stdin.pipe(outStream);
```

## Implement readable stream

```js
    const {Readable} = require('stream');
    const inStream = new Readable();
    inStream.push("asdasdas");
    inStream.push(null);
```
This wouldn't be so usefull since we're pre-pushing data in the stream. We need the stream to actually get on demand. To do this, we should implement the read method in the readable stream.

```js
    const {Readable} = require('stream');
    const inStream = new Readable({
        read(size){
            if(endCondition){
                this.push(null)
            }
            this.push("input")
        }
    });
    inStream.pipe(process.stdout)

    process.on('exit',()=>{
        console.error(
            "asd"
        )
    })
```


# Clusters and child processes