(function() {
  'use strict';

  var SimpleQueue, uuid,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  uuid = require('node-uuid');

  SimpleQueue = (function() {

    function SimpleQueue(timeout) {
      this.timeout = timeout != null ? timeout : 1000;
      this.dequeue = __bind(this.dequeue, this);

      this.queue = __bind(this.queue, this);

      this.uuid = uuid.v4();
      this.first = null;
      this.last = null;
      this.length = 0;
      this.index = {};
      this.offset = 0;
      this.positionCounter = 0;
    }

    SimpleQueue.prototype.read = function(_uuid) {
      var item;
      item = this.index[_uuid];
      if (item == null) {
        return null;
      }
      return {
        uuid: item.uuid,
        item: item.item,
        pos: item._pos - this.offset
      };
    };

    SimpleQueue.prototype.queue = function(item, _uuid) {
      if (_uuid == null) {
        _uuid = uuid.v4();
      }
      item = {
        uuid: _uuid,
        next: null,
        item: item,
        _pos: this.positionCounter
      };
      this.positionCounter++;
      if (this.first != null) {
        this.last.next = item;
        this.last = item;
      } else {
        this.first = item;
        this.last = item;
        this.first.next = this.last;
      }
      this.index[_uuid] = item;
      this.length++;
      return _uuid;
    };

    SimpleQueue.prototype.ackFactory = function(item) {
      var timeout, _ack,
        _this = this;
      if (this.timeout === -1 || this.timeout === null) {
        return function() {};
      }
      timeout = setTimeout(function() {
        _this.queue(item.item, item.uuid);
        return timeout = null;
      }, this.timeout);
      _ack = function() {
        if (timeout == null) {
          throw 'Message ack\'ed after requeue. (Message ack\'ed too late.)';
        }
        clearTimeout(timeout);
        timeout = null;
        return true;
      };
      return _ack;
    };

    SimpleQueue.prototype.dequeue = function() {
      var item;
      if (this.first == null) {
        return [null, null, null];
      }
      this.length--;
      this.offset++;
      item = this.first;
      this.first = item.next;
      item.next = null;
      if (this.length === 0) {
        this.last = null;
        this.first = null;
      }
      delete this.index[item.uuid];
      return [item.uuid, item.item, this.ackFactory(item)];
    };

    return SimpleQueue;

  })();

  module.exports = SimpleQueue;

}).call(this);
