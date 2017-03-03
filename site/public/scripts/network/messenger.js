"use strict";

/**
 * This file defines a websocket messenger.
 */

/**
 * This constructs a new Messenger object.
 */
var Messenger = function () {
  this.listeners = {};
  for (var i = 0; i < MessageType.keys; i++) {
    this.listeners[MessageType.keys[i]] = [];
  }
};

/**
 * This method closes the connection.
 */
Messenger.prototype.close = function () {
  //TODO;
};

/**
 * This method sends a message.
 *
 * @param message the message to send.
 */
Messenger.prototype.send = function (message) {
  //TODO;
};

/**
 * This method recieves a message.
 *
 * @param message_string the string from the socket.
 */
Messenger.prototype.recieve = function (message_string) {
  try {
    var message = JSON.parse(message_string);
    var listeners = this.listeners[message.type];
    for (var i = 0; i < listeners.length; i++) {
      listeners[i](message);
    }
  } catch (e) {
    console.log("Message is not valid JSON:", e);
  }
};

/**
 * This method registers a listener for the specified message type.
 *
 * @param message_type the type of message to whose events to listen for.
 * @param listener     the listener to register.
 */
Messenger.prototype.registerListener = function (message_type, listener) {
  if (this.listeners[message_type])
    this.listeners[message_type].push(listener);
};

/**
 * This method de-registers a listener for the specified message type.
 *
 * @param message_type the type of message to whose events were being listened to.
 * @param listener     the listener to de-register.
 */
Messenger.prototype.deregisterListener = function (message_type, listener) {
  if (this.listeners[message_type]) {
    var index = this.listeners[message_type].indexOf(listener);
    if (index > -1) {
      this.listeners[message_type].splice(index, 1);
    }
  }
};
