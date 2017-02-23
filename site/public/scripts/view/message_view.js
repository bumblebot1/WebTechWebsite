"use strict";

/**
 * This file defines a view which displays messages in
 * the message log.
 */

/**
 * This constructs a new MessageView object.
 *
 * @param message_log the element which contains the messages.
 */
var MessageView = function (message_log, message_form, messenger) {
  var self = this;
  this.message_log = message_log;
  this.message_form = message_form;
  this.messenger = messenger;

  var input = message_form.querySelector("input[type='text']");
  var submit = message_form.querySelector("input[type='submit']");
  submit.addEventListener("click", function (event) {
    var message = {
      colour: window.localStorage.getItem("player_colour"),
      username: window.localStorage.getItem("player_username"),
      timestamp: new Date().toLocaleString(),
      body: input.value,
      type: MessageType["text"]
    };

    messenger.send(message);
    self.append(message);

    input.value = "";
    event.preventDefault();
    event.stopPropagation();
  });
};

/**
 * This method appends a message to the end of the message log.
 *
 * @param message the message to display.
 */
MessageView.prototype.append = function (message) {
  var message_box = document.createElement("li");
  var header = document.createElement("span");

  var username = document.createElement("h3");
  username.appendChild(document.createTextNode(message.username));

  var timestamp = document.createElement("h3");
  timestamp.appendChild(document.createTextNode(message.timestamp));

  var body = document.createElement("p");
  body.appendChild(document.createTextNode(message.body));

  header.appendChild(username);
  header.appendChild(timestamp);
  message_box.appendChild(header);
  message_box.appendChild(body);

  message_box.classList.add(message.colour);

  this.message_log.appendChild(message_box);

  // Scroll to the bottom of the message log.
  this.message_log.scrollTop = this.message_log.scrollHeight - this.message_log.clientHeight;
};

/**
 * This method clears the message log.
 */
MessageView.prototype.clear = function () {
  while (this.message_log.hasChildNodes()) {
    this.message_log.removeChild(this.message_log.firstChild);
  }
};
