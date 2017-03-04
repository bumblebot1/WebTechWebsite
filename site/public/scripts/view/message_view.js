"use strict";

/**
 * This file defines a view which displays messages in
 * the message log.
 */

/**
 * This constructs a new MessageView object.
 *
 * @param message_log  the element which contains the messages.
 * @param users        the users in the game.
 */
var MessageView = function (message_log, users) {
  this.message_log = message_log;
  this.users = users;
};

/**
 * This method appends a message to the end of the message log.
 *
 * @param message the message to display.
 */
MessageView.prototype.append = function (message) {
  var self = this;
  var appendMessage = function (username, timestamp, body, colour) {
    var message_box = document.createElement("li");
    var header = document.createElement("span");

    var message_username = document.createElement("h3");
    message_username.appendChild(document.createTextNode(username));

    var message_timestamp = document.createElement("h3");
    message_timestamp.appendChild(document.createTextNode(timestamp));

    var message_body = document.createElement("p");
    message_body.appendChild(document.createTextNode(body));

    header.appendChild(message_username);
    header.appendChild(message_timestamp);
    message_box.appendChild(header);
    message_box.appendChild(message_body);

    if (colour) message_box.classList.add(colour);

    self.message_log.appendChild(message_box);

    // Scroll to the bottom of the message log.
    self.message_log.scrollTop = self.message_log.scrollHeight - self.message_log.clientHeight;
  };

  switch (message.type) {
    case MessageType["start_game"]:
      appendMessage("English draughts", message.timestamp, "The game has started.");
      break;
    case MessageType["move"]:
      appendMessage(getUsername(message, this.users), message.timestamp, move_toString(message.move), message.move.piece.colour);
      break;
    case MessageType["message"]:
      appendMessage(message.player.username, message.timestamp, message.body, message.player.colour);
      break;
    case MessageType["game_over"]:
      appendMessage("English draughts", message.timestamp, gameOver_toString(message));
      break;
    default:
      break;
  }
};

/**
 * This method clears the message log.
 */
MessageView.prototype.clear = function () {
  while (this.message_log.hasChildNodes()) {
    this.message_log.removeChild(this.message_log.firstChild);
  }
};

/**
 * This function returns the stringular representation of the specified move.
 *
 * @param move the move to convert to a string.
 * @return     the stringular representation of the specified move.
 */
var move_toString = function (move) {
  var body = "Moved piece from (" + move.piece.x + ", "
                                  + move.piece.y + ") to ("
                                  + move.x       + ", "
                                  + move.y       + ").";
  var dx = move.x - move.piece.x;
  var dy = move.y - move.piece.y;
  if (dx % 2 == 0) {
    body += " And took piece at (" + (move.piece.x + (dx / 2)) + ", "
                                   + (move.piece.y + (dy / 2)) + ").";
  }
  return body;
};

/**
 * This function returns the stringular representation of the specified game over message.
 *
 * @param message the message to convert to a string.
 * @return        the stringular representation of the specified game over message.
 */
var gameOver_toString = function (message) {
  return message.winner.username + " won the game!";
};

/**
 * This function returns the username for the specified move message.
 *
 * @param message the move message whose username to return.
 * @param users   the users in the game.
 * @return        the username for the specified move message.
 */
var getUsername = function (message, users) {
  var colour = message.move.piece.colour;

  for (var i = 0; i < users.length; i++) {
    if (users[i].colour === colour) return users[i].username;
  }

  return "";
};
