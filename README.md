# simple-queue

A simple linked-list based queue.

[![Build Status](https://travis-ci.org/pthrasher/node-simple-queue.png)](https://travis-ci.org/pthrasher/node-simple-queue)

## Getting Started
Install the module with: `npm install simple-queue`

```javascript
var SimpleQueue = require('simple-queue');

sq = new SimpleQueue();
item = { /* ... my item to be queued */ }
_uuid = sq.queue(item);

result = sq.dequeue()
__uuid = result[0];
item = result[1];
ack = result[2];

ack(); // Acknowledge receipt. (not neccessary if you call new SimpleQueue(-1)
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/gruntjs/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Philip Thrasher  
Licensed under the MIT license.


