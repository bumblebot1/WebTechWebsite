"use strict";

var Message = {
  timestamp: new Date().toLocaleString()
};

module.exports = {
  MessageType: {
    "leaderboard": "text",
    "request_game": "request_game",
    "register_router": "register_router",
    "game": "game",
    "ready": "ready",
    "start_game": "start_game",
    "move": "move",
    "message": "message",
    "game_over": "game_over"
  },

  /**
   * This constructs a new Leaderboard message.
   *
   * @param leaderboard the list of players and associated scores to display.
   */
  MessageLeaderboard: function (leaderboard) {
    Object.assign(Message, this);
    this.type = this.MessageType["leaderboard"];
    if (leaderboard) this.leaderboard = leaderboard;
    else this.leaderboard = [];
  },

  /**
   * This constructs a new RequestGame message.
   *
   * @param player the player who is requesting the game.
   */
  MessageRequestGame: function (player) {
    Object.assign(Message, this);
    this.type = this.MessageType["request_game"];
    this.player = player;
  },

  /**
   * This constructs a new RegisterRouter message.
   *
   * @param address the address used to connect to the router.
   */
  MessageRegisterRouter: function (address) {
    Object.assign(Message, this);
    this.type = this.MessageType["register_router"];
    this.address = address;
  },

  /**
   * This constructs a new Game message.
   *
   * @param id              the id of the game.
   * @param players         the details of the players.
   * @param round_time      the time a player has to make a move each turn.
   * @param starting_player the player who starts the game.
   * @param router          the router to send messages to.
   */
  MessageGame: function (id, players, round_time, router) {
    Object.assign(Message, this);
    this.type = this.MessageType["game"];
    this.id = id;
    this.players = players;
    this.round_time = round_time;
    this.router = router;
  },

  /**
   * This constructs a new Ready message.
   *
   * @param id     the id of the game.
   * @param player the player who is ready.
   */
  MessageReady: function (id, player) {
    Object.assign(Message, this);
    this.type = this.MessageType["ready"];
    this.id = id;
    this.player = player;
  },

  /**
   * This constructs a new StartGame message.
   *
   * @param id the id of the game.
   */
  MessageStartGame: function (id) {
    Object.assign(Message, this);
    this.type = this.MessageType["start_game"];
    this.id = id;
  },

  /**
   * This constructs a new Move message.
   *
   * @param id   the id of the game.
   * @param move the move that has been played.
   */
  MessageMove: function (id, move) {
    Object.assign(Message, this);
    this.type = this.MessageType["move"];
    this.id = id;
    this.move = move;
  },

  /**
   * This constructs a new Message message.
   *
   * @param id     the id of the game.
   * @param player the player who has sent the message.
   * @param body   the body of the message as a string.
   */
  MessageMessage: function (id, player, body) {
    Object.assign(Message, this);
    this.type = this.MessageType["message"];
    this.id = id;
    this.player = player;
    this.body = body;
  },

  /**
   * This constructs a new GameOver message.
   *
   * @param id     the id of the game.
   * @param winner the player who has won the game.
   * @param loser  the player who has lost the game.
   */
  MessageGameOver: function (id, winner, loser) {
    Object.assign(Message, this);
    this.type = this.MessageType["game_over"];
    this.id = id;
    this.winner = winner;
    this.loser = loser;
  }
}
