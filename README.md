# Client-side Event Bus

A tiny event bus with AMQP and Postal.js-like functionality meant to be used on the client-side.

[![license](https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat)](LICENSE)

### What is it?

This is a simple event bus that replicates the basics of Postal.js in about 150 lines of code (minified to 1337 bytes)

It doesn't use lists of regex like Postal does but uses a directed graph instead, which is _much_ faster.

It adds a history for automatic metrics collection, which brings the line count to about 150 lines of code (minified to 1258 bytes)

It has no dependencies.

### How to use

Use the `emit` and `on` methods, just like a regular event emitter.

```js
var channel = new Bus();

channel.on('metrics.#', function (msg) {
  console.log(msg);
});

channel.emit('metrics.page.loaded', 'hello world');
```

In imitation of Postal.js, use the returned function to stop the events.

```js
var off = channel.on('page.load.justOnce', function (msg) {
  console.log(msg);
  off();
});
```

Also in imitation of Postal.js, use the second parameter to get the topic that triggered the event.

```js
var off = channel.on('page.ad.*.filled', function (msg, meta) {
  console.log(meta.topic + 'just happened');
});
```

### Remote Procedure Calls (RPC)

To support RPC-like functionality, we allow errors to propagate from subscribers back to publishers.

To disable this, create a 'error' subscriber.

```js 
    bus.on('some.topic', function () {
      //etc
    });
    bus.on('error', function (error) {
      console.log('something bad happened', error);
    });
```

We also pass back the results of the subscribers, which allows emitters to receive results.

```js 
    bus.on('some.topic', function () {
      return 42;
    });
    const value = bus.emit('some.topic'); // will be 42
```

This also allows the emitter to wait until the subscribers are done async work by using Promises.

```js 
    bus.on('some.topic', function () {
      return new Promise(etc);
    });
    await Promise.all(bus.emit('some.topic')); // will wait for promises to finish
```


### How it works

A Bus builds a directed graph of subscriptions.  As event topics are published, the graph discovers all the subscribers to notify and then caches the results for faster message publishing in the future.  When a new subscriber is added, the graph is modified and the subscriber cache is reset.

### Wildcard subscriptions

Supports same wildcards as Postal.js, such as:

#### Zero or more words using `#`

```js
channel.on('#.changed', function (msg) {
  // ...
});
channel.emit('what.has.changed', event);
```

```js
channel.on('metrics.#.changed', function (msg) {
  // ...
});
channel.emit('metrics.something.important.has.changed', event);
```

#### Single word using `*`

```js
channel.on('ads.slot.*.filled', function (msg) {
  // ...
});
channel.emit('ads.slot.post-nav.filled', {data, msg});
```

### History

We keep a history of the events that have been emitted.  They can be queried with the `history` method:

```js
var channel = new Bus();

channel.emit('ads.slot.post-nav.filled', {data, msg});
channel.emit('ads.slot.side-rail.filled', {thing, stuff});
channel.emit('ads.slot.instream-banner-0.filled', {a, b});
channel.emit('metrics.component.absdf2324.render.start', {etc, ie});
channel.emit('metrics.component.absdf2324.render.end', {etc, ie});

// gets the ad slots that were filled
var history = channel.history('ads.slot.*.filled');

// gets history of components rendering
var history = channel.history('metrics.component.*.render.*');
```

The format is an array of arrays.  For example:
```json
[
  ["ads.slot.post-nav.filled", 1515714470550],
  ["ads.slot.side-rail.filled", 1515714470559],
  ["ads.slot.instream-banner-0.filled", 1515714500268],
  ["metrics.component.absdf2324.render.start", 1515714782584],
  ["metrics.component.absdf2324.render.end", 1515714790507],
]
```

Only the topic and the timestamp of each event is stored.  We don't store the message/payload in the history to prevent potential memory leaks and scoping issues.

These events are stored in a ring buffer, so old events will be dropped from the history once it reaches a certain size.  The history size is current set to a maximum of 9999 events.

Note that this feature is designed for _metrics_, and often the information that people are interested in for metrics can be included as part of the topic.  For example, if you have a subscriber of `on('components.*.render.start')`, then you can have an infinite number of component ids such as `emit('components.abcdef.render.start')` and `emit('components.someRandomId.render.start')` without any additional complexity or performance penalty to the event bus.  If you're trying to access more information that can't be included as part of the topic, then you should make a subscriber and log that information.

Look at our [Examples Page](https://github.com/CondeNast/quick-bus/blob/master/EXAMPLES.md) for some common code patterns with event buses.

### NOTICE

Yes, this is a continuation of an open-source project that I did for Conde Nast called [Quick-bus](https://github.com/CondeNast/quick-bus).

### Related Documents

- [License - Apache 2.0](https://github.com/CondeNast/quick-bus/blob/master/LICENSE.md)
- [Code of Conduct - Contributor Covenant v1.4](https://github.com/CondeNast/quick-bus/blob/master/CODE_OF_CONDUCT.md)
- [Contributing Guidelines - Atom and Rails](https://github.com/CondeNast/quick-bus/blob/master/CONTRIBUTING.md)

### Related Topics

- [RabbitMX Topic Exchange tutorial explaining * and # wildcards](https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html)
