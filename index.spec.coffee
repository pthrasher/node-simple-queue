SimpleQueue = require './'

describe 'When the constructor is called.', ->
    sq = null

    beforeEach ->
        sq = new SimpleQueue

    it 'Should have a length of 0', ->
        sq = new SimpleQueue
        expect(sq.length).toEqual(0)

    it 'Should create a unique id for itself using uuid v4', ->
        uuids = []
        # Try 1000 times to see if the uuid is unique.
        for i in [0..999]
            sq = new SimpleQueue
            expect(sq.uuid not in uuids).toEqual(true)
            uuids.push sq.uuid

    it 'Should set this.first and this.last to null.', ->
        expect(sq.first).toBeNull()
        expect(sq.last).toBeNull()


    it 'Should have a queue and a dequeue method.', ->
        expect(sq.queue).toBeDefined()
        expect(sq.queue).not.toBeNull()

        expect(sq.dequeue).toBeDefined()
        expect(sq.dequeue).not.toBeNull()

    it 'Should have a timeout set.', ->
        expect(sq.timeout).toBeDefined()
        expect(sq.timeout).not.toBeNull()

describe 'When queue is called', ->
    sq = null

    beforeEach ->
        sq = new SimpleQueue

    it 'Should set this.first and this.last to the same value when queue is empty.', ->
        expect(sq.first).toBeNull()
        expect(sq.last).toBeNull()
        expect(sq.first).toEqual(sq.last)

        sq.queue 1

        expect(sq.first).not.toBeNull()
        expect(sq.last).not.toBeNull()
        expect(sq.first).toEqual(sq.last)

    it 'Should not let this.first and this.last equal the same value.', ->
        expect(sq.first).toBeNull()
        expect(sq.last).toBeNull()
        expect(sq.first).toEqual(sq.last)

        sq.queue 1

        expect(sq.first).not.toBeNull()
        expect(sq.last).not.toBeNull()
        expect(sq.first).toEqual(sq.last)

        sq.queue 2

        expect(sq.first).not.toBeNull()
        expect(sq.last).not.toBeNull()
        expect(sq.first).not.toEqual(sq.last)

    it 'Should append new items to the right hand side.', ->
        sq.queue 1
        sq.queue 2
        sq.queue 3
        sq.queue 4
        sq.queue 5

        expect(sq.first.item).toEqual(1)
        expect(sq.first.next.item).toEqual(2)
        expect(sq.first.next.next.item).toEqual(3)
        expect(sq.first.next.next.next.item).toEqual(4)
        expect(sq.first.next.next.next.next.item).toEqual(5)


    it 'Should increment the length counter.', ->
        expect(sq.length).toEqual(0)
        sq.queue 1
        expect(sq.length).toEqual(1)

    it 'Should add items to the index.', ->
        _uuid = sq.queue 'Hello, world!'
        expect(sq.index[_uuid]).toBeDefined()


describe 'When dequeue is called.', ->
    sq = null

    beforeEach ->
        sq = new SimpleQueue -1

    it 'Should delete items from the index.', ->
        _uuid = sq.queue 'Hello, world!'
        items = sq.dequeue()
        expect(sq.index[_uuid]).not.toBeDefined()

    it 'Should decrement the length.', ->
        expect(sq.length).toEqual(0)
        _uuid = sq.queue 'Hello, world!'
        expect(sq.length).toEqual(1)
        items = sq.dequeue()
        expect(sq.length).toEqual(0)

    it 'Should return [null, null, null] when queue is empty.', ->
        items = sq.dequeue()
        expect(items.length).toEqual(3)
        expect(items[0]).toBeNull()
        expect(items[1]).toBeNull()
        expect(items[2]).toBeNull()

    it 'Should return [uuid, item, ack-function] when queue is not empty.', ->
        _uuid = sq.queue 'Hello, world!'
        items = sq.dequeue()

        expect(items.length).toEqual(3)
        expect(items[0]).toEqual(_uuid)
        expect(items[1]).toEqual('Hello, world!')
        expect(typeof items[2]).toEqual('function')


describe 'When read is called.', ->
    sq = null

    beforeEach ->
        sq = new SimpleQueue -1

    it 'Should return null when item doesn\'t exist.', ->
        expect(sq.read('qwerty')).toBeNull()

    it 'Should return a fresh item with the queue position when called and item exists.', ->
        _uuid = sq.queue 'Hello, world!'
        item = sq.read(_uuid)
        expect(item.uuid).toEqual(_uuid)
        expect(item.pos).toEqual(0)
        expect(item.item).toEqual('Hello, world!')

describe 'How the ack\'ing mechanism works.', ->
    sq = null

    beforeEach ->
        sq = new SimpleQueue 500


    it 'Should return an ack function that keeps the item from being requeued when called.', ->
        _uuid = sq.queue 'Hello, world!'
        items = sq.dequeue()

        now = null

        runs ->
            expect(items[2]()).toEqual(true)
            now = +new Date()

        waitsFor ->
            _now = +new Date()
            if _now - now > 750
                if sq.length is 0
                    return true
        , 'Waits untill after requeue timeout to check that the item never got requeued', 1000

        runs ->
            expect(sq.length).toEqual(0)

    it 'Should requeue the message if ack is never called after a timeout period and increment the length.', ->
        expect(sq.length).toEqual(0)
        _uuid = sq.queue 'Hello, world!'
        expect(sq.length).toEqual(1)
        items = sq.dequeue()
        expect(sq.length).toEqual(0)

        runs ->

        waitsFor ->
            return true if sq.length is 1
            false
        , 'Waits untill after requeue timeout to check that the item never got requeued', 1000

        runs ->
            expect(sq.length).toEqual(1)

    it 'Throws an error if you ack after the message has been requeued.', ->
        _uuid = sq.queue 'Hello, world!'
        expect(sq.length).toEqual(1)
        items = sq.dequeue()
        
        runs ->

        waitsFor ->
            return true if sq.length is 1
            false
        , 'Waits for requeue timeout to happen.', 1000

        runs ->
            expect(items[2]).toThrow()









