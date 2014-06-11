var ModuleTestMessage = (function(global) {

var _runOnNode = "process" in global;
var _runOnWorker = "WorkerLocation" in global;
var _runOnBrowser = "document" in global;

return new Test("Message", {
        disable:    false,
        browser:    true,
        worker:     true,
        node:       true,
        button:     true,
        both:       true, // test the primary module and secondary module
    }).add([
        testMessage,
    ]).run().clone();

function testMessage(test, pass, miss) {

    function Foo() {
        this.inbox = function(data, task, id) {
            task.set(id, data.msg + "Foo").pass();
        };
    }
    function Bar() {
        this.inbox = function(data, task, id) {
            task.set(id, data.msg + "Bar").pass();
        };
    }

    var foo1 = new Foo();
    var foo2 = new Foo();
    var bar = new Bar();
    var msg = new Message();

    msg.bind(foo1).bind(foo2).bind(bar);

    msg.post(null, { msg: "Hello" }, function(err, buffer) {
        console.log(JSON.stringify(Task.objectize(buffer), null, 2));
    });


    test.done(pass());
}

})((this || 0).self || global);

