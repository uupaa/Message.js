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
var _counter = {}; // { constructor-name: count }
var _objectMap = global["WeakMap"] ? new WeakMap() : null; // { object: id }

// --- define ----------------------------------------------

// --- interface -------------------------------------------
function Message() { // @desc: MessagePassing implementation.
    this._objects = {}; // Object: registered objects. { id: object, ... }
}

Message["repository"] = "https://github.com/uupaa/Message.js"; // GitHub repository URL. http://git.io/Help
Message["getObjectID"] = Message_getObjectID; // Message#getObjectID(object:Object):String
Message["prototype"] = {
    "constructor":  Message,        // new Message()
    "bind":         Message_bind,   // Message#bind(object:Object):this
    "isBind":       Message_isBind, // Message#isBind(object):Boolean
    "unbind":       Message_unbind, // Message#unbind(object:Object):this
    "clear":        Message_clear,  // Message#clear():this
    "to":           Message_to,     // Message#to(...:Object):To
//  "send":         Message_send,   // Message#send(param:Object, sendback:Boolean = false):Object
    "post":         Message_post    // Message#post(param:Object, callback:Function = null):this
};

function To(message, // @arg Message
            list) {  // @arg ObjectArray
    this._message = message;
    this._list = list;
}

To["prototype"] = {
    "constructor":  To,             // new To(message:Message, list:ObjectArray)
    "add":          To_add,         // To#add(object:Object):this
    "list":         To_list,        // To#list():ObjectArray
    "remove":       To_remove,      // To#remove(object:Object):this
    "clear":        To_clear        // To#clear():this
};

// --- implement -------------------------------------------
function _generateNextObjectID(object) { // @arg Object
                                         // @ret String
    var constructor = object["constructor"]["name"] || "";
    var id = _counter[constructor] || 0;

    _counter[constructor] = ++id;
    return constructor + "#" + id;
}

function _setObjectID(object) { // @arg Object
                                // @ret String - object id
    var id = _generateNextObjectID(object);

    if (_objectMap) { // [ES6]
        _objectMap.set(object, id);
    } else if (Object["defineProperty"]) { // [ES5]
        Object["defineProperty"](object, "__OBJECT_ID__", { "value": id });
    } else {
        object["__OBJECT_ID__"] = id;
    }
    return id;
}

function Message_getObjectID(object) { // @arg Object
                                       // @ret Strign - object id
    if (_objectMap) {
        return _objectMap.get(object) || "";
    }
    return object["__OBJECT_ID__"] || "";
}

function Message_bind(object) { // @arg Object
                                // @ret this
                                // @desc register the object for message delivery.
//{@dev
    $valid(typeof object["inbox"], "Function", Message_bind, "object");
//}@dev

    var id = Message_getObjectID(object) || _setObjectID(object);

    if ( !(id in this._objects) ) {
        this._objects[id] = object;
    }
    return this;
}

function Message_isBind(object) { // @arg Object
                                  // @ret this
                                  // @desc register the object for message delivery.
//{@dev
    $valid(typeof object["inbox"], "Function", Message_isBind, "object");
//}@dev
    return !!this._objects[Message_getObjectID(object)];
}

function Message_unbind(object) { // @arg Object - registered object.
                                  // @ret this
//{@dev
    $valid(typeof object["inbox"], "Function", Message_unbind, "object");
//}@dev
    delete this._objects[Message_getObjectID(object)];
    return this;
}

function Message_clear() { // @ret this
                           // @desc unbind all object.
    this._object = {};
    return this;
}

function Message_to(/* ... */) { // @var_arg Object - delivery objects.
                                 // @ret To
                                 // @desc add delivary objects and create to object.
    return new To( [].slice.call(arguments) );
}

/*
function Message_send(to,         // @arg To|null = null - delivary list
                      data,       // @arg Object - { to, data }
                      sendback) { // @arg Boolean = false
                                  // @ret Array
                                  // @desc send to message synchronously.
//{@dev
    $valid($type(data,     "Object"),       Message_send, "data");
    $valid($type(sendback, "Boolean|omit"), Message_send, "sendback");
//}@dev

    var result = [];
    var address = to ? to.list()      // multicast or unicast
                     : this._objects; // broadcast

    for (var id in address) {
        var object = address[id];

        if (object) {
            // Foo#inbox(data):Any
            result[id] = object["inbox"].call(object, data);
        }
    }
    return sendback ? result : null;
}
 */

function Message_post(to,         // @arg To|null = null - delivary list
                      data,       // @arg Object - { to, data }
                      callback) { // @arg Function = null - callback(err:Error, inbox-resultValue:Object):void
                                  // @ret Array
                                  // @desc post to message asynchronously.
//{@dev
    $valid($type(data,     "Object"),        Message_post, "data");
    $valid($type(callback, "Function|omit"), Message_post, "callback");
//}@dev

    var address = to ? to.list()      // multicast or unicast
                     : this._objects; // broadcast

    var task = new Task(Object.keys(address).length, function(err, buffer) {
                            if (callback) {
                                callback(err, buffer);
                            }
                        }, { "name": "Message#post" });

    for (var id in address) {
        var object = address[id];

        if (object) {
            // Foo#inbox(data, task, id):void
            object["inbox"].call(object, data, task, id);
        }
    }
}

function To_add(object) { // @arg Object
                          // @ret this
//{@dev
    $valid(typeof object["inbox"], "Function", To_add, "object");
//}@dev
    if ( this._message.isBind(object) ) {
        var pos = this._list.indexOf(object);

        if (pos < 0) {
            this._list.push(object);
        }
    }
    return this;
}

function To_list() { // @ret ObjectArray - [object, ...]
    return this._list;
}

function To_remove(object) { // @arg Object
                             // @ret this
//{@dev
    $valid(typeof object["inbox"], "Function", To_remove, "object");
//}@dev
    if ( this._message.isBind(object) ) {
        var pos = this._list.indexOf(object);

        if (pos >= 0) {
            this._list.splice(object, 1);
        }
    }
    return this;
}

function To_clear() { // @ret this
    this._list = [];
    return this;
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

