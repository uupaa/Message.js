# Message.js [![Build Status](https://travis-ci.org/uupaa/Message.js.png)](http://travis-ci.org/uupaa/Message.js)

[![npm](https://nodei.co/npm/message.png?downloads=true&stars=true)](https://nodei.co/npm/message/)

MessagePassing implementation.

## Document

- [Message.js wiki](https://github.com/uupaa/Message.js/wiki/Message)
- [Development](https://github.com/uupaa/WebModule/wiki/Development)
- [WebModule](https://github.com/uupaa/WebModule) ([Slide](http://uupaa.github.io/Slide/slide/WebModule/index.html))


## How to use

### Browser

```js
<script src="lib/Message.js">
<script>

    function Foo() {
        this.inbox = function(task, name, data) {
            task.set(name, data.msg + "Foo").pass();
        };
    }
    function Bar() {
        this.inbox = function(task, name, data) {
            task.set(name, data.msg + "Bar").pass();
        };
    }

    var foo1 = new Foo();
    var foo2 = new Foo();
    var bar = new Bar();
    var msg = new Message({ a: foo1, b: foo2, c: bar });

    msg.post({ msg: "Hello" }, function(err, buffer) {
        console.log(JSON.stringify(Task.objectize(buffer), null, 2));
    });

</script>
```

### WebWorkers

```js
importScripts("lib/Message.js");

```

### Node.js

```js
var Message = require("lib/Message.js");

```

