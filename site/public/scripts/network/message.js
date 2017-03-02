"use strict";

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

/**
 * This file defines the valid messages that can be sent to the matchmaker and router servers.
 */

/**
 * This constructs a new Leaderboard message.
 *
 * @param players the list of players to display.
 */
var MessageLeaderboard = function (players) {
  this.type = MessageType["leaderboard"];
  if (players) this.players = players;
  else this.players = [];
};

/**
 * This constructs a new RequestGame message.
 *
 * @param player the player who is requesting the game.
 */
var MessageRequestGame = function (player) {
  this.type = MessageType["request_game"];
  this.player = player;
};

/**
 * This constructs a new RegisterRouter message.
 *
 * @param address the address used to connect to the router.
 */
var MessageRegisterRouter = function (address) {
  this.type = MessageType["register_router"];
  this.address = address;
};

/**
 * This constructs a new Game message.
 *
 * @param player the details of a player.
 */
var MessageGame = function () {
  this.type = MessageType["game"];
};

var MessageReady = function () {
  this.type = MessageType["ready"];
};

var MessageStartGame = function () {
  this.type = MessageType["start_game"];
};

var MessageMove = function () {
  this.type = MessageType["move"];
};

var MessageMessage = function () {
  this.type = MessageType["message"];
};

var MessageGameOver = function () {
  this.type = MessageType["game_over"];
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
