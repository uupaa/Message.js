(function(global) {
"use strict";

// --- dependency modules ----------------------------------
//var Task = global["Task"];

// --- define / local variables ----------------------------
//var _runOnNode = "process" in global;
//var _runOnWorker = "WorkerLocation" in global;
//var _runOnBrowser = "document" in global;

// --- class / interfaces ----------------------------------
function Message(instanceList, // @arg InstanceObject - address list. { id: instance, ... }
                 methodName) { // @arg MethodNameString = "inbox" - instance[method]
                               // @desc MessagePassing implementation.
    this._instanceList = instanceList;
    this._methodName   = methodName || "inbox";

//{@dev
    $valid($type(instanceList, "Object"),      Message, "instanceList");
    $valid($type(methodName,   "String|omit"), Message, "methodName");

    for (var id in instanceList) {
        $valid($type(instanceList[id][this._methodName], "Function"), Message, "methodName"); // instance has not method.
    }
//}@dev
}

//{@dev
Message["repository"] = "https://github.com/uupaa/Message.js"; // GitHub repository URL. http://git.io/Help
//}@dev

Message["prototype"] = {
    "constructor":  Message,     // new Message(instanceList:Object, method:String = "inbox")
    "post":         Message_post // Message#post(body:Any, callback:Function = null):void
};

// --- implement -------------------------------------------
function Message_post(body,       // @arg Any - message body, instanceList[id]#inbox(,body,)
                      callback) { // @arg Function = null - callback(err:Error, buffer:Array):void
                                  // @desc post to message asynchronously.
//{@dev
    $valid($type(callback, "Function|omit"), Message_post, "callback");
//}@dev

    var taskCount = Object.keys(this._instanceList).length;
    var task = new global["Task"](taskCount, function(err, buffer) {
                            if (callback) {
                                callback(err, buffer);
                            }
                        }, { "name": "Message#post" });

    for (var id in this._instanceList) {
        var instance = this._instanceList[id];

        if (instance) {
            // call       Foo#inbox(task:Task, body:Any, id:String):void
            // call WebWorker#inbox(task:Task, body:Any, id:String):void
            instance[this._methodName].call(instance, task, body, id);
        }
    }
}

// --- validate / assertions -------------------------------
//{@dev
function $valid(val, fn, hint) { if (global["Valid"]) { global["Valid"](val, fn, hint); } }
function $type(obj, type) { return global["Valid"] ? global["Valid"].type(obj, type) : true; }
//function $keys(obj, str) { return global["Valid"] ? global["Valid"].keys(obj, str) : true; }
//function $some(val, str, ignore) { return global["Valid"] ? global["Valid"].some(val, str, ignore) : true; }
//function $args(fn, args) { if (global["Valid"]) { global["Valid"].args(fn, args); } }
//}@dev

// --- exports ---------------------------------------------
if ("process" in global) {
    module["exports"] = Message;
}
global["Message" in global ? "Message_" : "Message"] = Message; // switch module. http://git.io/Minify

})((this || 0).self || global); // WebModule idiom. http://git.io/WebModule

