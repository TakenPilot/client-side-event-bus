# Client-side Event Bus

A tiny pub/sub event bus.

Ideal for browsers, embedded systems, lambdas or cloudFlare workers.

[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

Features:

- Topic-based routing
- Trie-based wildcard subscriptions
- Highly memory efficient and performant
- No dependencies
- Self-contained in an IIFE
- MUCH faster than regex-based routing

### What is it?

A simple event bus that replicates the basics of a message broker in about 170 lines of code minified to 1437 bytes.

Subscriptions build a directed graph of tokens. Emitted events tranverse the graph to find subscriber functions to trigger.

### How to use

Use `emit` and `on` like a regular event emitter.

```js
var channel = new Bus();

channel.on("metrics.#", (msg) => console.log(msg));

channel.emit("metrics.page.loaded", "hello world");
```

Use the returned function to unsubscribe from events.

```js
var off = channel.on("page.load.justOnce", (msg) => {
  console.log(msg);
  off();
});
```

The second parameter has the topic that triggered the event.

```js
var off = channel.on("page.ad.*.filled", (msg, meta) => {
  console.log(meta.topic + "just happened");
});
```

### Remote Procedure Calls (RPC)

To support RPC-like functionality, we allow errors to propagate from subscribers back to publishers.

To disable this, create an 'error' subscriber.

```js
bus.on("some.topic", () => {
  //etc
});
bus.on("error", (error) => {
  console.log("something bad happened", error);
});
```

Results are returned from subscribers, allowing emitters to receive Promises.

```js
bus.on("some.topic", () => Promise.resolve(42));

await Promise.all(bus.emit("some.topic"));
```

The returned values can also be used to learn how many subscribers were triggered.

```js
bus.on("some.topic", () => 42);

bus.emit("some.topic").length; // 1
```

### Zero or more words wildcard: `#`

```js
channel.on("#.changed", (msg) => {
  // ...
});
channel.emit("what.has.changed", event);
```

```js
channel.on("metrics.#.changed", (msg) => {
  // ...
});
channel.emit("metrics.something.important.has.changed", event);
```

#### Single word wildcard: `*`

```js
channel.on("ads.slot.*.filled", (msg) => {
  // ...
});
channel.emit("ads.slot.post-nav.filled", { data, msg });
```

### History

A history of event names with timestamps is kept in a ring buffer. It's meant to be used for performance optimization and debugging distributed systems.

This is especially useful for iframe messages, loading scripts, and other UI events that are difficult to track in the console. This library is so small and light that it is ideal for tracking early page loading events, especially where the order of events is important such as React renders.

They can be queried with the `history` method:

```js
var channel = new Bus();

channel.emit("ads.slot.post-nav.filled", { data, msg });
channel.emit("ads.slot.side-rail.filled", { thing, stuff });
channel.emit("ads.slot.instream-banner-0.filled", { a, b });
channel.emit("metrics.component.absdf2324.render.start", { etc, ie });
channel.emit("metrics.component.absdf2324.render.end", { etc, ie });

// gets the ad slots that were filled
var history = channel.history("ads.slot.*.filled");

// gets history of components rendering
var history = channel.history("metrics.component.*.render.*");
```

The format is an array of arrays. For example:

```json
[
  ["ads.slot.post-nav.filled", 1515714470550],
  ["ads.slot.side-rail.filled", 1515714470559],
  ["ads.slot.instream-banner-0.filled", 1515714500268],
  ["metrics.component.absdf2324.render.start", 1515714782584],
  ["metrics.component.absdf2324.render.end", 1515714790507]
]
```

The message/payload is not stored in the history to prevent potential memory leaks and scoping issues.

Note that this feature is designed for _metrics_, and often the information that people are interested in for metrics can be included as part of the topic.

For example, imagine tracking component render speed. Simply use events such as `emit('components.MyComponentName.render.start')` or `emit('components.SomeRandomId.render.start')`. You could then query `components.*.render.start` to get all render start events for all components along with timestamps.

Look at our [Examples Page](https://github.com/CondeNast/quick-bus/blob/master/EXAMPLES.md) for some common code patterns with event buses.

### Related Documents

- [License - MIT](https://github.com/CondeNast/quick-bus/blob/master/LICENSE.md)
- [Code of Conduct - Contributor Covenant v1.4](https://github.com/CondeNast/quick-bus/blob/master/CODE_OF_CONDUCT.md)
- [Contributing Guidelines - Atom and Rails](https://github.com/CondeNast/quick-bus/blob/master/CONTRIBUTING.md)

### Related Topics

- [RabbitMX Topic Exchange tutorial explaining \* and # wildcards](https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html)
