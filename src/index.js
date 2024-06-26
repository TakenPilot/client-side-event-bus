var Bus = (function () {
  "use strict";
  var headCount = 0;
  var historyMax = 9999;

  function Ring(max) {
    var list = [];
    var end = 0;
    var start = 0;
    this.push = function (item) {
      if (end - start >= max) {
        start++;
        if (start >= max) {
          start = 0;
          end = max - 1;
        }
      }
      var index = end % max;
      list[index] = item;

      end++;
    };
    this.asArray = function () {
      var first = list.slice(start, Math.min(end, max));
      var second = list.slice(0, Math.max(end - max, 0));

      return first.concat(second);
    };
    this.list = list;
  }

  function add(topic, graph) {
    var cursor = graph;
    for (var i = 0; i < topic.length; i++) {
      var word = topic[i];
      var right = cursor.r;
      if (!right[word]) {
        right[word] = { w: word, r: {}, i: headCount++ };
      }
      cursor = right[word];
    }

    return cursor;
  }

  function getList(topic, graph) {
    var routes = [[graph, 0]];
    var finalNodes = {}; // track found nodes, no duplicates should be returned
    var finalRoutes = []; // remember found functions to call

    while (routes.length) {
      var route = routes.shift();
      var cursor = route[0];
      var index = route[1];
      var right = cursor.r;
      var word = topic[index];

      if (word === undefined && cursor.fn && !finalNodes[cursor.i]) {
        finalNodes[cursor.i] = 1; // remember that we've seen this node
        finalRoutes.push(cursor.fn); // remember functions
      } else if (right[word]) {
        routes.push([right[word], index + 1]);
      }

      if (right["#"]) {
        for (var i = index; i <= topic.length; i++) {
          routes.push([right["#"], i]);
        }
      }

      if (word && right["*"]) {
        routes.push([right["*"], index + 1]);
      }
    }

    return finalRoutes;
  }

  function getCachedList(topicStr, graph, cache, sep) {
    var list;

    if (cache[topicStr]) {
      // use previous work if available
      list = cache[topicStr];
    } else {
      list = getList(topicStr.split(sep), graph);
      cache[topicStr] = list; // remember previous work
    }

    return list;
  }

  var Bus = function Bus(sep) {
    sep = sep || ".";
    var head = { w: "", r: {}, i: headCount++ };
    var emitCache = {}; // memoize graph lookups
    var historyCache = new Ring(historyMax);

    function getHistory(topicStr) {
      var partialGraph = { w: "", r: {}, i: headCount++ };
      var lastNode = add(topicStr.split(sep), partialGraph);
      lastNode.fn = 1;
      var timeline = [];
      var cache = {};
      var log = historyCache.asArray();

      for (var i = 0; i < log.length; i++) {
        var entry = log[i];
        if (getCachedList(entry[0], partialGraph, cache, sep).length) {
          timeline.push(entry);
        }
      }
      return timeline;
    }

    function on(topicStr, fn) {
      var lastNode = add(topicStr.split(sep), head);
      var fnList = lastNode.fn || [];
      fnList.push(fn);
      lastNode.fn = fnList;
      emitCache = {}; // forget graph lookups because everything has changed

      // return off() function to unsubscribe
      return function off() {
        var index = fnList.indexOf(fn);
        if (index > -1) {
          fnList.splice(index, 1);
        }
      };
    }

    function emit(topicStr, message) {
      var ts = Date.now();
      historyCache.push([topicStr, ts]);
      var list = getCachedList(topicStr, head, emitCache, sep);
      var results = [];
      var meta = { topic: topicStr, ts: ts };

      for (var i = 0; i < list.length; i++) {
        var fn = list[i];
        for (var j = 0; j < fn.length; j++) {
          try {
            results.push(fn[j](message, meta));
          } catch (e) {
            var errorList = getCachedList("error", head, emitCache, sep);
            if (errorList.length > 0) {
              emit("error", e);
            } else {
              throw e;
            }
          }
        }
      }

      return results;
    }

    // public methods
    this.emit = emit;
    this.on = on;
    this.history = getHistory;
  };

  // public classes
  Bus.Ring = Ring;

  return Bus;
})();

if (typeof exports !== "undefined") {
  module.exports = Bus;
}
if (typeof window !== "undefined") {
  window.Bus = Bus;
}
