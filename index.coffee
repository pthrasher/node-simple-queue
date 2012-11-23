'use strict'

uuid = require 'node-uuid'

class SimpleQueue
    constructor: (@timeout=1000) ->
        @uuid = uuid.v4()
        @first = null
        @last = null
        @length = 0
        @index = {}

        @offset = 0
        @positionCounter = 0


    read: (_uuid) ->
        item = @index[_uuid]
        return null unless item?

        {
            uuid: item.uuid
            item: item.item
            pos: item._pos - @offset
        }

    queue: (item, _uuid=uuid.v4()) =>

        item =
            uuid: _uuid
            next: null
            item: item
            _pos: @positionCounter

        @positionCounter++

        if @first?
            @last.next = item
            @last = item
        else
            @first = item
            @last = item
            @first.next = @last

        @index[_uuid] = item

        @length++

        _uuid

    ackFactory: (item) ->
        # return a noop method if we have a timeout of -1
        if @timeout is -1 or @timeout is null
            return ->

        timeout = setTimeout =>
            @queue item.item, item.uuid
            timeout = null
        , @timeout

        _ack = =>
            unless timeout?
                throw 'Message ack\'ed after requeue. (Message ack\'ed too late.)'
            clearTimeout timeout
            timeout = null
            true

        _ack

    dequeue: =>
        return [null, null, null] unless @first?
        @length--
        @offset++
        item = @first
        @first = item.next
        item.next = null

        if @length is 0
            @last = null
            @first = null

        delete @index[item.uuid]

        [item.uuid, item.item, @ackFactory(item)]


module.exports = SimpleQueue
