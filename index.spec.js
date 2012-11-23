(function() {
  'use strict';

  var SimpleQueue,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  SimpleQueue = require('index.js');

  describe('When the constructor is called.', function() {
    var sq;
    sq = null;
    beforeEach(function() {
      return sq = new SimpleQueue;
    });
    it('Should have a length of 0', function() {
      sq = new SimpleQueue;
      return expect(sq.length).toEqual(0);
    });
    it('Should create a unique id for itself using uuid v4', function() {
      var i, uuids, _i, _ref, _results;
      uuids = [];
      _results = [];
      for (i = _i = 0; _i <= 999; i = ++_i) {
        sq = new SimpleQueue;
        expect((_ref = sq.uuid, __indexOf.call(uuids, _ref) < 0)).toEqual(true);
        _results.push(uuids.push(sq.uuid));
      }
      return _results;
    });
    it('Should set this.first and this.last to null.', function() {
      expect(sq.first).toBeNull();
      return expect(sq.last).toBeNull();
    });
    it('Should have a queue and a dequeue method.', function() {
      expect(sq.queue).toBeDefined();
      expect(sq.queue).not.toBeNull();
      expect(sq.dequeue).toBeDefined();
      return expect(sq.dequeue).not.toBeNull();
    });
    return it('Should have a timeout set.', function() {
      expect(sq.timeout).toBeDefined();
      return expect(sq.timeout).not.toBeNull();
    });
  });

  describe('When queue is called', function() {
    var sq;
    sq = null;
    beforeEach(function() {
      return sq = new SimpleQueue;
    });
    it('Should set this.first and this.last to the same value when queue is empty.', function() {
      expect(sq.first).toBeNull();
      expect(sq.last).toBeNull();
      expect(sq.first).toEqual(sq.last);
      sq.queue(1);
      expect(sq.first).not.toBeNull();
      expect(sq.last).not.toBeNull();
      return expect(sq.first).toEqual(sq.last);
    });
    it('Should not let this.first and this.last equal the same value.', function() {
      expect(sq.first).toBeNull();
      expect(sq.last).toBeNull();
      expect(sq.first).toEqual(sq.last);
      sq.queue(1);
      expect(sq.first).not.toBeNull();
      expect(sq.last).not.toBeNull();
      expect(sq.first).toEqual(sq.last);
      sq.queue(2);
      expect(sq.first).not.toBeNull();
      expect(sq.last).not.toBeNull();
      return expect(sq.first).not.toEqual(sq.last);
    });
    it('Should append new items to the right hand side.', function() {
      sq.queue(1);
      sq.queue(2);
      sq.queue(3);
      sq.queue(4);
      sq.queue(5);
      expect(sq.first.item).toEqual(1);
      expect(sq.first.next.item).toEqual(2);
      expect(sq.first.next.next.item).toEqual(3);
      expect(sq.first.next.next.next.item).toEqual(4);
      return expect(sq.first.next.next.next.next.item).toEqual(5);
    });
    it('Should increment the length counter.', function() {
      expect(sq.length).toEqual(0);
      sq.queue(1);
      return expect(sq.length).toEqual(1);
    });
    return it('Should add items to the index.', function() {
      var _uuid;
      _uuid = sq.queue('Hello, world!');
      return expect(sq.index[_uuid]).toBeDefined();
    });
  });

  describe('When dequeue is called.', function() {
    var sq;
    sq = null;
    beforeEach(function() {
      return sq = new SimpleQueue(-1);
    });
    it('Should delete items from the index.', function() {
      var items, _uuid;
      _uuid = sq.queue('Hello, world!');
      items = sq.dequeue();
      return expect(sq.index[_uuid]).not.toBeDefined();
    });
    it('Should decrement the length.', function() {
      var items, _uuid;
      expect(sq.length).toEqual(0);
      _uuid = sq.queue('Hello, world!');
      expect(sq.length).toEqual(1);
      items = sq.dequeue();
      return expect(sq.length).toEqual(0);
    });
    it('Should return [null, null, null] when queue is empty.', function() {
      var items;
      items = sq.dequeue();
      expect(items.length).toEqual(3);
      expect(items[0]).toBeNull();
      expect(items[1]).toBeNull();
      return expect(items[2]).toBeNull();
    });
    return it('Should return [uuid, item, ack-function] when queue is not empty.', function() {
      var items, _uuid;
      _uuid = sq.queue('Hello, world!');
      items = sq.dequeue();
      expect(items.length).toEqual(3);
      expect(items[0]).toEqual(_uuid);
      expect(items[1]).toEqual('Hello, world!');
      return expect(typeof items[2]).toEqual('function');
    });
  });

  describe('When read is called.', function() {
    var sq;
    sq = null;
    beforeEach(function() {
      return sq = new SimpleQueue(-1);
    });
    it('Should return null when item doesn\'t exist.', function() {
      return expect(sq.read('qwerty')).toBeNull();
    });
    return it('Should return a fresh item with the queue position when called and item exists.', function() {
      var item, _uuid;
      _uuid = sq.queue('Hello, world!');
      item = sq.read(_uuid);
      expect(item.uuid).toEqual(_uuid);
      expect(item.pos).toEqual(0);
      return expect(item.item).toEqual('Hello, world!');
    });
  });

  describe('How the ack\'ing mechanism works.', function() {
    var sq;
    sq = null;
    beforeEach(function() {
      return sq = new SimpleQueue(500);
    });
    it('Should return an ack function that keeps the item from being requeued when called.', function() {
      var items, now, _uuid;
      _uuid = sq.queue('Hello, world!');
      items = sq.dequeue();
      now = null;
      runs(function() {
        expect(items[2]()).toEqual(true);
        return now = +new Date();
      });
      waitsFor(function() {
        var _now;
        _now = +new Date();
        if (_now - now > 750) {
          if (sq.length === 0) {
            return true;
          }
        }
      }, 'Waits untill after requeue timeout to check that the item never got requeued', 1000);
      return runs(function() {
        return expect(sq.length).toEqual(0);
      });
    });
    it('Should requeue the message if ack is never called after a timeout period and increment the length.', function() {
      var items, _uuid;
      expect(sq.length).toEqual(0);
      _uuid = sq.queue('Hello, world!');
      expect(sq.length).toEqual(1);
      items = sq.dequeue();
      expect(sq.length).toEqual(0);
      runs(function() {});
      waitsFor(function() {
        if (sq.length === 1) {
          return true;
        }
        return false;
      }, 'Waits untill after requeue timeout to check that the item never got requeued', 1000);
      return runs(function() {
        return expect(sq.length).toEqual(1);
      });
    });
    return it('Throws an error if you ack after the message has been requeued.', function() {
      var items, _uuid;
      _uuid = sq.queue('Hello, world!');
      expect(sq.length).toEqual(1);
      items = sq.dequeue();
      runs(function() {});
      waitsFor(function() {
        if (sq.length === 1) {
          return true;
        }
        return false;
      }, 'Waits for requeue timeout to happen.', 1000);
      return runs(function() {
        return expect(items[2]).toThrow();
      });
    });
  });

}).call(this);
