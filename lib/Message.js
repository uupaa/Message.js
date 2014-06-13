(function(global) {
"use strict";

// --- dependency module -----------------------------------
//{@dev
//  This code block will be removed in `$ npm run build-release`. http://git.io/Minify
//var Valid = global["Valid"] || require("uupaa.valid.js"); // http://git.io/Valid
//}@dev

var Task = global["Task"] || require("uupaa.task.js");

// --- local variable --------------------------------------
//var _runOnNode = "process" in global;
//var _runOnWorker = "WorkerLocation" in global;
//var _runOnBrowser = "document" in global;

// --- define ----------------------------------------------
// --- interface -------------------------------------------
function Message(address,  // @arg Object - to address. { name: Object, ... }
                 method) { // @arg String = "inbox" - callback method name.
                           // @desc: MessagePassing implementation.
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

Message["repository"] = "https://github.com/uupaa/Message.js"; // GitHub repository URL. http://git.io/Help
Message["prototype"] = {
    "constructor":  Message,        // new Message(address:Object, method:String = "inbox")
    "post":         Message_post    // Message#post(data:Object, callback:Function = null):void
};

// --- implement -------------------------------------------
function Message_post(data,       // @arg Object object#inbox(,,data)
                      callback) { // @arg Function = null - callback(err:Error, method-resultValue:Object):void
                                  // @desc post to message asynchronously.
//{@dev
    $valid($type(data,     "Object"),        Message_post, "data");
    $valid($type(callback, "Function|omit"), Message_post, "callback");
//}@dev

    var task = new Task(Object.keys(this._address).length, function(err, buffer) {
                            if (callback) {
                                callback(err, buffer);
                            }
                        }, { "name": "Message#post" });

    for (var name in this._address) {
        var object = this._address[name];

        if (object) {
            // Foo#inbox(task, name, data):void
            object[this._method].call(object, task, name, data);
        }
    }
}

//{@dev
function $valid(val, fn, hint) { if (global["Valid"]) { global["Valid"](val, fn, hint); } }
//function $keys(obj, str) { return global["Valid"] ? global["Valid"].keys(obj, str) : true; }
function $type(obj, type) { return global["Valid"] ? global["Valid"].type(obj, type) : true; }
//}@dev

// --- export ----------------------------------------------
if ("process" in global) {
    module["exports"] = Message;
}
global["Message" in global ? "Message_" : "Message"] = Message; // switch module. http://git.io/Minify

})((this || 0).self || global); // WebModule idiom. http://git.io/WebModule

