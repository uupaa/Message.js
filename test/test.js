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
        this.inbox = function(task, body, id) {
            task.set(id, body + "Foo").pass();
        };
    }
    function Bar() {
        this.inbox = function(task, body, id) {
            task.set(id, body + "Bar").pass();
        };
    }

    var foo1 = new Foo();
    var foo2 = new Foo();
    var bar = new Bar();
    var msg = new Message({ a: foo1, b: foo2, c: bar });

    msg.post("Hello", function(err, buffer) {
        console.log(JSON.stringify(Task.objectize(buffer), null, 2));

        if (buffer["a"] === "HelloFoo" &&
            buffer["b"] === "HelloFoo" &&
            buffer["c"]  === "HelloBar") {

            test.done(pass());
        } else {
            test.done(miss());
        }
    });

}

})((this || 0).self || global);

