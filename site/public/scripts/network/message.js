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

var Message = function (type) {
  this.timestamp = new Date().toLocaleString();
  this.type = type;
};

/**
 * This constructs a new Leaderboard message.
 *
 * @param leaderboard the list of players and associated scores to display.
 */
var MessageLeaderboard = function (leaderboard) {
  Message.call(this, MessageType["leaderboard"]);
  if (leaderboard) this.leaderboard = leaderboard;
  else this.leaderboard = [];
};

/**
 * This constructs a new RequestGame message.
 *
 * @param player the player who is requesting the game.
 */
var MessageRequestGame = function (player) {
  Message.call(this, MessageType["request_game"]);
  this.player = player;
};

/**
 * This constructs a new RegisterRouter message.
 *
 * @param address the address used to connect to the router.
 */
var MessageRegisterRouter = function (address) {
  Message.call(this, MessageType["register_router"]);
  this.address = address;
};

/**
 * This constructs a new Game message.
 *
 * @param id              the id of the game.
 * @param players         the details of the players.
 * @param round_time      the time a player has to make a move each turn.
 * @param starting_player the player who starts the game.
 * @param router          the router to send messages to.
 */
var MessageGame = function (id, players, round_time, router) {
  Message.call(this, MessageType["game"]);
  this.id = id;
  this.players = players;
  this.round_time = round_time;
  this.router = router;
};

/**
 * This constructs a new Ready message.
 *
 * @param id     the id of the game.
 * @param player the player who is ready.
 */
var MessageReady = function (id, player) {
  Message.call(this, MessageType["ready"]);
  this.id = id;
  this.player = player;
};

/**
 * This constructs a new StartGame message.
 *
 * @param id the id of the game.
 */
var MessageStartGame = function (id) {
  Message.call(this, MessageType["start_game"]);
  this.id = id;
};

/**
 * This constructs a new Move message.
 *
 * @param id   the id of the game.
 * @param move the move that has been played.
 */
var MessageMove = function (id, move) {
  Message.call(this, MessageType["move"]);
  this.id = id;
  this.move = move;
};

/**
 * This constructs a new Message message.
 *
 * @param id     the id of the game.
 * @param player the player who has sent the message.
 * @param body   the body of the message as a string.
 */
var MessageMessage = function (id, player, body) {
  Message.call(this, MessageType["message"]);
  this.id = id;
  this.player = player;
  this.body = body;
};

/**
 * This constructs a new GameOver message.
 *
 * @param id     the id of the game.
 * @param winner the player who has won the game.
 * @param loser  the player who has lost the game.
 */
var MessageGameOver = function (id, winner, loser) {
  Message.call(this, MessageType["game_over"]);
  this.id = id;
  this.winner = winner;
  this.loser = loser;
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = {
    MessageType: MessageType,
    MessageLeaderboard: MessageLeaderboard,
    MessageRequestGame: MessageRequestGame,
    MessageRegisterRouter: MessageRegisterRouter,
    MessageGame: MessageGame,
    MessageReady: MessageReady,
    MessageStartGame: MessageStartGame,
    MessageMove: MessageMove,
    MessageMessage: MessageMessage,
    MessageGameOver: MessageGameOver
  };
}
