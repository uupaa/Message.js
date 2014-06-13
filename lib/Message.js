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
function Message(address) { // @arg Object - to address. { name: Object, ... }
                            // @desc: MessagePassing implementation.
//{@dev
    $valid($type(address, "Object"), Message, "address");

    for (var name in address) {
        $valid($type(address[name]["inbox"], "Function"), Message, "address"); // object has inbox method.
    }
//}@dev

    this._to = address;
}

Message["repository"] = "https://github.com/uupaa/Message.js"; // GitHub repository URL. http://git.io/Help
Message["prototype"] = {
    "constructor":  Message,        // new Message(address:Object)
    "post":         Message_post    // Message#post(data:Object, callback:Function = null):this
};

// --- implement -------------------------------------------
function Message_post(data,       // @arg Object
                      callback) { // @arg Function = null - callback(err:Error, inbox-resultValue:Object):void
                                  // @ret Array
                                  // @desc post to message asynchronously.
//{@dev
    $valid($type(data,     "Object"),        Message_post, "data");
    $valid($type(callback, "Function|omit"), Message_post, "callback");
//}@dev

    var task = new Task(Object.keys(this._to).length, function(err, buffer) {
                            if (callback) {
                                callback(err, buffer);
                            }
                        }, { "name": "Message#post" });

    for (var name in this._to) {
        var object = this._to[name];

        if (object) {
            // Foo#inbox(task, name, data):void
            object["inbox"].call(object, task, name, data);
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

