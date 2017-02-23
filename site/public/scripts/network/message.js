"use strict";

/**
 * This file defines a message.
 */

/**
 * This constructs a new Message object.
 *
 * @param colour    the colour of the player who sent this message.
 * @param username  the username of the player who sent this message.
 * @param timestamp the time that the message was sent.
 * @param body      the body of the message.
 * @param type      the type of the message.
 */
var Message = function (colour, username, timestamp, body, type) {
  this.colour = colour;
  this.username = username;
  this.timestamp = timestamp;
  this.body = body;
  this.type = type;
};

var MessageType = {
  "text": "text"
};
