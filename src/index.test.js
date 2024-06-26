describe("exact matches", function () {
  it("emits and receives", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("a", spy);
    bus.emit("a");

    sinon.assert.called(spy);
  });

  it("emits and receives multiple", function () {
    var bus = new Bus();
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();

    bus.on("a", spy1);
    bus.on("a", spy2);
    bus.emit("a");

    sinon.assert.called(spy1);
    sinon.assert.called(spy2);
  });

  it("can send strings as message", function () {
    var bus = new Bus();
    var expected = "b";
    var spy = sinon.spy();

    bus.on("a", spy);
    bus.emit("a", expected);

    sinon.assert.calledWith(spy, expected);
  });

  it("can send objects without changing reference", function () {
    var bus = new Bus();
    var expected = {};
    var spy = sinon.spy();

    bus.on("a", spy);
    bus.emit("a", expected);

    sinon.assert.calledWith(spy, expected);
  });

  it("can send objects without changing reference", function () {
    var bus = new Bus();
    var expected = { topic: "a" };
    var spy = sinon.spy();

    bus.on("a", spy);
    bus.emit("a", {});

    sinon.assert.calledWith(spy, sinon.match.any, sinon.match(expected));
  });

  it("sends timestamps", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("a", spy);
    bus.emit("a", {});

    sinon.assert.calledWith(spy, sinon.match.any, sinon.match.has("ts"));
  });

  it("allows exceptions from subscriptions to flow to emitter", function () {
    var bus = new Bus();

    bus.on("a", function () {
      throw new Error("what");
    });

    expect(function () {
      bus.emit("a", {});
    }).to.throw("what");
  });

  it("allows exceptions from subscriptions to flow to error handler if it exists", function (done) {
    var bus = new Bus();

    bus.on("a", function () {
      throw new Error("what");
    });
    bus.on("error", function (error) {
      expect(error).to.be.an("error");
      done();
    });
    bus.emit("a", {});
  });

  it("allows subscription results to flow to emitter", function () {
    var bus = new Bus();
    function fn() {
      return "what";
    }

    bus.on("a", fn);

    expect(bus.emit("a", {})[0]).to.equal("what");
  });

  it("allows Promise.all to accept values", function () {
    var bus = new Bus();
    function fn() {
      return "what";
    }

    bus.on("a", fn);

    var values = bus.emit("a", {});

    return Promise.all(values).then(function (results) {
      expect(results[0]).to.equal("what");
    });
  });

  it("allows Promise.all to catch exceptions in Promises", function () {
    var bus = new Bus();
    function fn() {
      return Promise.reject("test");
    }

    bus.on("a", fn);

    var values = bus.emit("a", {});

    return Promise.all(values).catch(function (errorText) {
      expect(errorText).to.equal("test");
    });
  });
});

describe("wildstar *", function () {
  it("a.* does not find a", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("a.*", spy);
    bus.emit("a");

    sinon.assert.notCalled(spy);
  });

  it("*.a does not find a", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("*.a", spy);
    bus.emit("a");

    sinon.assert.notCalled(spy);
  });

  it("a.* finds a.b", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("a.*", spy);
    bus.emit("a.b");

    sinon.assert.called(spy);
  });

  it("*.b finds a.b", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("*.b", spy);
    bus.emit("a.b");

    sinon.assert.called(spy);
  });

  it("a.*.c finds a.b.c", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("a.*.c", spy);
    bus.emit("a.b.c");

    sinon.assert.called(spy);
  });

  it("a.* does not find a.b.c", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("a.*", spy);
    bus.emit("a.b.c");

    sinon.assert.notCalled(spy);
  });

  it("*.c does not find a.b.c", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("*.c", spy);
    bus.emit("a.b.c");

    sinon.assert.notCalled(spy);
  });

  it("a.*.d does not find a.b.c.d", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("a.*.d", spy);
    bus.emit("a.b.c.d");

    sinon.assert.notCalled(spy);
  });

  it("a.*.d does not find a.b.c.d meanwhile a.#.d does", function () {
    var bus = new Bus();
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();

    bus.on("a.*.d", spy1);
    bus.on("a.#.d", spy2);
    bus.emit("a.b.c.d");

    sinon.assert.notCalled(spy1);
    sinon.assert.called(spy2);
  });

  it("emits and receives multiple", function () {
    var bus = new Bus();
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();
    var spy3 = sinon.spy();

    bus.on("metrics.*", spy1);
    bus.on("*.changed", spy2);
    bus.on("metrics.*.changed", spy3);
    bus.emit("metrics.changed");

    sinon.assert.called(spy1);
    sinon.assert.called(spy2);
    sinon.assert.notCalled(spy3);
  });
});

describe("wildstar #", function () {
  it("a.# finds a.b", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("a.#", spy);
    bus.emit("a.b");

    sinon.assert.called(spy);
  });

  it("a.# finds a.b.c", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("a.#", spy);
    bus.emit("a.b.c");

    sinon.assert.called(spy);
  });

  it("#.b finds a.b", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("#.b", spy);
    bus.emit("a.b");

    sinon.assert.called(spy);
  });

  it("#.c finds a.b.c", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("#.c", spy);
    bus.emit("a.b.c");

    sinon.assert.called(spy);
  });

  it("a.#.c finds a.b.c", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("a.#.c", spy);
    bus.emit("a.b.c");

    sinon.assert.called(spy);
  });

  it("a.# finds a", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("a.#", spy);
    bus.emit("a");

    sinon.assert.called(spy);
  });

  it("#.c finds c", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("#.c", spy);
    bus.emit("c");

    sinon.assert.called(spy);
  });

  it("a.#.b finds a.b", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("a.#.b", spy);
    bus.emit("a.b");

    sinon.assert.called(spy);
  });

  it("emits and receives multiple", function () {
    var bus = new Bus();
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();
    var spy3 = sinon.spy();

    bus.on("metrics.#", spy1);
    bus.on("#.changed", spy2);
    bus.on("metrics.#.changed", spy3);
    bus.emit("metrics.changed");

    sinon.assert.called(spy1);
    sinon.assert.called(spy2);
    sinon.assert.called(spy3);
  });

  it("avoids unneeded multiples", function () {
    var bus = new Bus();
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();
    var spy3 = sinon.spy();

    bus.on("metrics.#", spy1);
    bus.on("ads.#", spy2);
    bus.on("#.changed", spy3);
    bus.emit("metrics.changed");

    sinon.assert.called(spy1);
    sinon.assert.notCalled(spy2);
    sinon.assert.called(spy3);
  });
});

describe("unsubscribe", function () {
  it("does not receive exact match after unsubscribe", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    var off = bus.on("a", spy);
    off();
    bus.emit("a");

    sinon.assert.notCalled(spy);
  });

  it("does not receive wildcard a.* match after unsubscribe", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    var off = bus.on("a.*", spy);
    off();
    bus.emit("a.b");

    sinon.assert.notCalled(spy);
  });

  it("does not receive wildcard *.a match after unsubscribe", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    var off = bus.on("*.b", spy);
    off();
    bus.emit("a.b");

    sinon.assert.notCalled(spy);
  });

  it("does not receive wildcard a.# match after unsubscribe", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    var off = bus.on("a.#", spy);
    off();
    bus.emit("a.b");

    sinon.assert.notCalled(spy);
  });

  it("does not receive wildcard #.a match after unsubscribe", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    var off = bus.on("#.b", spy);
    off();
    bus.emit("a.b");

    sinon.assert.notCalled(spy);
  });

  it("does not receive wildcard #.a match with multiple subscribers after single unsubscribe", function () {
    var bus = new Bus();
    var spy1 = sinon.spy();
    var spy2 = sinon.spy();
    var spy3 = sinon.spy();

    bus.on("#.b", spy1);
    var off = bus.on("#.b", spy2);
    bus.on("#.b", spy3);
    off();
    bus.emit("a.b");

    sinon.assert.called(spy1);
    sinon.assert.notCalled(spy2);
    sinon.assert.called(spy3);
  });
});

describe("history", function () {
  it("no events and no entries gives no history", function () {
    var bus = new Bus();

    expect(bus.history("a").length).to.equal(0);
  });

  it("mismatched topic gives no history", function () {
    var bus = new Bus();

    bus.emit("a");

    expect(bus.history("b").length).to.equal(0);
  });

  it("wildcard * gives selective history", function () {
    var bus = new Bus();

    bus.emit("a");
    bus.emit("a.b");
    bus.emit("a.b.c");

    expect(bus.history("a.*").length).to.equal(1);
  });

  it("wildcard # gives selective history", function () {
    var bus = new Bus();

    bus.emit("a");
    bus.emit("a.b");
    bus.emit("a.c");
    bus.emit("a.b.c");

    expect(bus.history("a.#.c").length).to.equal(2);
  });

  it("wildcard * with sep gives selective history", function () {
    var bus = new Bus("/");

    bus.emit("a");
    bus.emit("a/b");
    bus.emit("a/b/c");

    expect(bus.history("a/*").length).to.equal(1);
  });

  it("1 entry", function () {
    var bus = new Bus();
    var spy = sinon.spy();

    bus.on("a", spy);
    bus.emit("a");
    expect(bus.history("a")[0][0]).to.equal("a");

    sinon.assert.called(spy);
  });
});

describe("Ring", function () {
  it("no events and no entries gives no history", function () {
    var ring = new Bus.Ring(2);

    ring.push("hi");

    expect(ring.asArray()).to.deep.equal(["hi"]);
  });

  it("no events and no entries gives no history", function () {
    var ring = new Bus.Ring(2);

    ring.push("a");
    ring.push("b");

    expect(ring.asArray()).to.deep.equal(["a", "b"]);
  });

  it("list can wrap", function () {
    var ring = new Bus.Ring(2);

    ring.push("a");
    expect(ring.list).to.deep.equal(["a"]);
    ring.push("b");
    expect(ring.list).to.deep.equal(["a", "b"]);
    ring.push("c");
    expect(ring.list).to.deep.equal(["c", "b"]);
    ring.push("d");
    expect(ring.list).to.deep.equal(["c", "d"]);
  });

  it("asArray can wrap 2 3", function () {
    var ring = new Bus.Ring(2);

    ring.push("a");
    expect(ring.asArray()).to.deep.equal(["a"]);
    ring.push("b");
    expect(ring.asArray()).to.deep.equal(["a", "b"]);
    ring.push("c");
    expect(ring.asArray()).to.deep.equal(["b", "c"]);
  });

  it("asArray can wrap 2 4", function () {
    var ring = new Bus.Ring(2);

    ring.push("a");
    expect(ring.asArray()).to.deep.equal(["a"]);
    ring.push("b");
    expect(ring.asArray()).to.deep.equal(["a", "b"]);
    ring.push("c");
    expect(ring.asArray()).to.deep.equal(["b", "c"]);
    ring.push("d");
    expect(ring.asArray()).to.deep.equal(["c", "d"]);
  });

  it("asArray can wrap once", function () {
    var ring = new Bus.Ring(2);

    ring.push("a");
    expect(ring.asArray()).to.deep.equal(["a"]);
    ring.push("b");
    expect(ring.asArray()).to.deep.equal(["a", "b"]);
    ring.push("c");
    expect(ring.asArray()).to.deep.equal(["b", "c"]);
    ring.push("d");
    expect(ring.asArray()).to.deep.equal(["c", "d"]);
    ring.push("e");
    expect(ring.asArray()).to.deep.equal(["d", "e"]);
  });

  it("asArray can wrap twice", function () {
    var ring = new Bus.Ring(5);

    ring.push("a");
    expect(ring.asArray()).to.deep.equal(["a"]);
    ring.push("b");
    expect(ring.asArray()).to.deep.equal(["a", "b"]);
    ring.push("c");
    expect(ring.asArray()).to.deep.equal(["a", "b", "c"]);
    ring.push("d");
    expect(ring.asArray()).to.deep.equal(["a", "b", "c", "d"]);
    ring.push("e");
    expect(ring.asArray()).to.deep.equal(["a", "b", "c", "d", "e"]);
    ring.push("f");
    expect(ring.asArray()).to.deep.equal(["b", "c", "d", "e", "f"]);
    ring.push("g");
    expect(ring.asArray()).to.deep.equal(["c", "d", "e", "f", "g"]);
    ring.push("h");
    expect(ring.asArray()).to.deep.equal(["d", "e", "f", "g", "h"]);
    ring.push("i");
    expect(ring.asArray()).to.deep.equal(["e", "f", "g", "h", "i"]);
    ring.push("j");
    expect(ring.asArray()).to.deep.equal(["f", "g", "h", "i", "j"]);
    ring.push("k");
    expect(ring.asArray()).to.deep.equal(["g", "h", "i", "j", "k"]);
    ring.push("l");
    expect(ring.asArray()).to.deep.equal(["h", "i", "j", "k", "l"]);
  });
});
