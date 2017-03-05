"use strict";

/**
 * This file defines a websocket messenger.
 */

/**
 * This constructs a new Messenger object.
 *
 * @param url          the url to connect to.
 * @param callback     the function to call once the websocket is connected.
 * @param message_view the view to display messages in.
 */
var Messenger = function (url, callback, message_view) {
  var self = this;
  this.message_view = message_view;
  this.listeners = {};

  if (url && url != "undefined") {
    this.ws = new WebSocket(url);

    this.ws.addEventListener("message", function (event) {
      self.recieve(event.data);
    });

    this.ws.addEventListener("close", function () {
      self.close();
    });

    this.ws.addEventListener("open", function () {
      callback(self);
    });
  } else {
    callback(this);
  }
};

/**
 * This method closes the connection.
 */
Messenger.prototype.close = function () {
  if (this.ws) {
    this.ws.close();
    this.ws = undefined;
  }
};

/**
 * This method sends a message.
 *
 * @param message the message to send.
 */
Messenger.prototype.send = function (message) {
  if (this.ws) this.ws.send(JSON.stringify(message));
  if (this.message_view) this.message_view.append(message);
};

/**
 * This method recieves a message.
 *
 * @param message_string the string from the socket.
 */
Messenger.prototype.recieve = function (message_string) {
  try {
    var message = JSON.parse(message_string);
    if (this.message_view) this.message_view.append(message);

    var listeners = this.listeners[message.type];
    if (!listeners) return;

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
  else
    this.listeners[message_type] = [ listener ];
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
