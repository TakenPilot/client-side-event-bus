# Client-side Event Bus

Client-side communication with a lightweight and lightning-fast event bus.

The Client-side Event Bus is a tiny pub/sub event bus designed for seamless communication in various environments, including browsers, embedded systems, AWS Lambdas, or CloudFlare workers. Whether you're building a dynamic web application or orchestrating microservices, this event bus simplifies message handling and enhances inter-component communication.

[![license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

Key Features:

- **Topic-based Routing**: Effortlessly route messages based on custom topics.
- **Wildcard Subscriptions**: Use trie-based wildcard subscriptions for flexible event handling.
- **Memory-efficient and Performant**: Optimize memory usage and achieve high performance with our streamlined implementation.
- **No Dependencies**: Enjoy hassle-free integration without worrying about additional dependencies.
- **Self-contained in an IIFE**: Encapsulate functionality within an Immediately Invoked Function Expression (IIFE) for easy deployment.
- **Faster Than Regex-based Routing**: Benefit from faster event routing compared to regex-based alternatives.
- **Browser Compatibility 8 Years+**: Ensure broad compatibility with modern and legacy browsers alike.

This is a simple event bus that replicates the basics of a message broker in about 170 lines of code minified to 1437 bytes.

Subscriptions build a directed graph of tokens. Emitted events tranverse the graph to find subscriber functions to trigger.

## How to use

```bash
npm i --save @takenpilot/client-side-event-bus
```

Getting started with the Client-side Event Bus is quick and easy. Simply use `emit` and `on` methods like a regular event emitter:

```js
var channel = new Bus();

channel.on("metrics.#", (msg) => console.log(msg));

channel.emit("metrics.page.loaded", "hello world");
```

Need to unsubscribe from events? No problem. Use the returned function:

```js
var off = channel.on("page.load.justOnce", (msg) => {
  console.log(msg);
  off();
});
```

Gain insights into triggered events with the second parameter:

```js
var off = channel.on("page.ad.*.filled", (msg, meta) => {
  console.log(meta.topic + "just happened");
});
```

## Error Propagation and Results

Support RPC-like functionality by allowing errors to propagate from subscribers back to publishers. Easily disable this feature by creating an 'error' subscriber:

```js
bus.on("some.topic", () => {
  // ...
});
bus.on("error", (error) => {
  console.log("something happened", error);
});
```

Retrieve results from subscribers, enabling emitters to receive Promises:

```js
bus.on("some.topic", () => Promise.resolve(42));

await Promise.all(bus.emit("some.topic"));
```

The returned values can also be used to learn how many subscribers were triggered.

```js
bus.on("some.topic", () => 42);

bus.emit("some.topic").length; // 1
```

## Zero or more words wildcard: `#`

Match any number of words in a topic.

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

## Single word wildcard: `*`

Match a single word in a topic.

```js
channel.on("ads.slot.*.filled", (msg) => {
  // ...
});
channel.emit("ads.slot.post-nav.filled", { data, msg });
```

## History

Keep track of event names and timestamps with a built-in history feature. Useful for performance optimization and debugging distributed systems, the history feature is ideal for tracking early page loading events and UI interactions.

Query the history using the history method:

```js
var channel = new Bus();

channel.emit("ads.slot.post-nav.filled", { data, msg });

var history = channel.history("ads.slot.*.filled");
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

## Explore Examples and More

Visit our [Examples Page](https://github.com/takenpilot/client-side-event-bus/blob/master/EXAMPLES.md) for common code patterns and use cases with event buses.

## Related Documents

- [License - MIT](https://github.com/takenpilot/client-side-event-bus/blob/master/LICENSE.md)
- [Code of Conduct - Contributor Covenant v1.4](https://github.com/takenpilot/client-side-event-bus/blob/master/CODE_OF_CONDUCT.md)
- [Contributing Guidelines - Atom and Rails](https://github.com/takenpilot/client-side-event-bus/blob/master/CONTRIBUTING.md)

## Related Topics

- [RabbitMX Topic Exchange tutorial explaining \* and # wildcards](https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html)
