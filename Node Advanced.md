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

When requiring modules, node caches the require call and does not reevaluate it again even if it is require further down the code. If we want a re-evaluation of the value of the module we'd rather have it export a function instead of a function execution/object. That way we can call it multiple times.
# Concurrency Model and Event Loop

# Node's event-driven arch

# Node for networking
# Node for web
# Node most common builtin modules
# Working with streams
# Clusters and child processes