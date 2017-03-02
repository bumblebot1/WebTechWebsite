"use strict";

/**
 * This file defines a message.
 */

/**
 * This constructs a new Leaderboard message.
 */
var MessageLeaderboard = function () {
  this.type = MessageType["leaderboard"];
};

/*
function (colour, username, timestamp, body, type) {
  this.colour = colour;
  this.username = username;
  this.timestamp = timestamp;
  this.body = body;
  this.type = type;
};
*/

var MessageType = {
  "leaderboard": "text",
  "request_game": "request_game",
  "register_router": "register_router",
  "game": "game",
  "ready": "ready",
  "start_game": "start_game",
  "move": "move",
  "message": "message",
  "game_over": "game_over"
};
