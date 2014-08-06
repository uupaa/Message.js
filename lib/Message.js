(function(global) {
"use strict";

// --- dependency modules ----------------------------------
//var Task = global["Task"];

// --- define / local variables ----------------------------
//var _runOnNode = "process" in global;
//var _runOnWorker = "WorkerLocation" in global;
//var _runOnBrowser = "document" in global;

// --- class / interfaces ----------------------------------
function Message(address,  // @arg Object - to address. { name: Object, ... }
                 method) { // @arg String = "inbox" - callback method name.
                           // @desc MessagePassing implementation.
    this._address = address;
    this._method = method || "inbox";

//{@dev
    $valid($type(address, "Object"),      Message, "address");
    $valid($type(method,  "String|omit"), Message, "method");

    for (var name in address) {
        $valid($type(address[name][this._method], "Function"), Message, "address"); // object has not method.
    }
//}@dev
}

//{@dev
Message["repository"] = "https://github.com/uupaa/Message.js"; // GitHub repository URL. http://git.io/Help
//}@dev

Message["prototype"] = {
    "constructor":  Message,        // new Message(address:Object, method:String = "inbox")
    "post":         Message_post    // Message#post(data:Object, callback:Function = null):void
};

// --- implement -------------------------------------------
function Message_post(data,       // @arg Object - object#inbox(,,data)
                      callback) { // @arg Function = null - callback(err:Error, method-resultValue:Object):void
                                  // @desc post to message asynchronously.
//{@dev
    $valid($type(data,     "Object"),        Message_post, "data");
    $valid($type(callback, "Function|omit"), Message_post, "callback");
//}@dev

    var task = new global["Task"](Object.keys(this._address).length, function(err, buffer) {
                            if (callback) {
                                callback(err, buffer);
                            }
                        }, { "name": "Message#post" });

    for (var name in this._address) {
        var object = this._address[name];

        if (object) {
            // call Foo#inbox(task, name, data):void
            // call WebWorker#inbox(task, name, data):void
            object[this._method].call(object, task, name, data);
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

