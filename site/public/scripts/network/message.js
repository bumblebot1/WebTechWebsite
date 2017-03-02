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

var Message = function () {
  this.timestamp = new Date().toLocaleString();
};

/**
 * This constructs a new Leaderboard message.
 *
 * @param players the list of players to display.
 */
var MessageLeaderboard = function (players) {
  Object.assign(Message, this);
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
  Object.assign(Message, this);
  this.type = MessageType["request_game"];
  this.player = player;
};

/**
 * This constructs a new RegisterRouter message.
 *
 * @param address the address used to connect to the router.
 */
var MessageRegisterRouter = function (address) {
  Object.assign(Message, this);
  this.type = MessageType["register_router"];
  this.address = address;
};

/**
 * This constructs a new Game message.
 *
 * @param player          the details of a player.
 * @param opponent        the details of the opponent.
 * @param round_time      the time a player has to make a move each turn.
 * @param starting_player the player who starts the game.
 * @param router          the router to send messages to.
 */
var MessageGame = function (player, opponent, round_time, starting_player, router) {
  Object.assign(Message, this);
  this.type = MessageType["game"];
  this.player = player;
  this.opponent = opponent;
  this.round_time = round_time;
  this.starting_player = starting_player;
  this.router = router;
};

/**
 * This constructs a new Ready message.
 *
 * @param player the player who is ready.
 */
var MessageReady = function (player) {
  Object.assign(Message, this);
  this.type = MessageType["ready"];
  this.player = player;
};

/**
 * This constructs a new StartGame message.
 */
var MessageStartGame = function () {
  Object.assign(Message, this);
  this.type = MessageType["start_game"];
};

/**
 * This constructs a new Move message.
 *
 * @param move the move that has been played.
 */
var MessageMove = function (move) {
  Object.assign(Message, this);
  this.type = MessageType["move"];
  this.move = move;
};

/**
 * This constructs a new Message message.
 *
 * @param player the player who has sent the message.
 * @param body   the body of the message as a string.
 */
var MessageMessage = function (player, body) {
  Object.assign(Message, this);
  this.type = MessageType["message"];
  this.player = player;
  this.body = body;
};

/**
 * This constructs a new GameOver message.
 *
 * @param winner the player who has won the game.
 * @param loser  the player who has lost the game.
 */
var MessageGameOver = function (winner, loser) {
  Object.assign(Message, this);
  this.type = MessageType["game_over"];
  this.winner = winner;
  this.loser = loser;
};
