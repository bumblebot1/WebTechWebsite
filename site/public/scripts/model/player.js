"use strict";

/**
 * This file defines the player classes; a player can be either
 * local or remote.
 */

/**
 * This constructs a new Player object. This class should be used
 * to derive local and remote players.
 *
 * @param player_indicator the element which displays the
 *                         current player.
 * @param timer_view       the view to display the time left per move.
 * @param messenger        the messenger with which to send messages.
 */
var Player = function (player_indicator, timer_view, messenger) {
  this.player_indicator = player_indicator;
  this.timer_view = timer_view;
  this.messenger = messenger;
};

/**
 * This constructs a new LocalPlayer object.
 *
 * @param player_indicator the element which displays the
 *                         current player.
 * @param timer_view       the view to display the time left per move.
 * @param messenger        the messenger with which to send messages.
 */
var LocalPlayer = function (player_indicator, timer_view, messenger) {
  Player.call(this, player_indicator, timer_view, messenger);
  this.move_provider = null;
};

LocalPlayer.prototype = Object.create(Player.prototype);
LocalPlayer.prototype.constructor = LocalPlayer;

/**
 * This method selects the chosen move to be played from the list
 * of valid moves.
 *
 * @param validMoves the list of valid moves.
 * @param model      the game model object.
 */
LocalPlayer.prototype.notify = function (validMoves, model) {
  var self = this;
  var timeOutListener = function () {
    self.move_provider.deregisterMoveListener(listener);
    model.gameOver = true;
    if (model.currentPlayer.colour == Colour["red"]) model.winningPlayer = model.users[Colour["white"]];
    else model.winningPlayer = model.users[Colour["red"]];
    model.play(null);
  };

  // Display the current player.
  this.player_indicator.className = "";
  this.player_indicator.classList.add("local", model.currentPlayer.colour);

  this.timer_view.registerListener(timeOutListener);
  this.timer_view.start(model.time_limit);

  var self = this;
  var listener = function (move) {

    for (var i = 0; i < validMoves.length; i++) {
      if (validMoves[i].piece == move.piece &&
          validMoves[i].x     == move.x     &&
          validMoves[i].y     == move.y       ) {
        self.move_provider.deregisterMoveListener(listener);

        self.messenger.send(new MessageMove(model.id, move));

        self.timer_view.deregisterListener(timeOutListener);
        self.timer_view.reset(model.time_limit);
        model.play(move);
      }
    }
  };

  this.move_provider.setSelected(null);
  this.move_provider.registerMoveListener(listener);
};

/**
 * This constructs a new RemotePlayer object.
 *
 * @param player_indicator the element which displays the
 *                         current player.
 * @param timer_view       the view to display the time left per move.
 * @param messenger        the messenger with which to send messages.
 */
var RemotePlayer = function (player_indicator, timer_view, messenger) {
  Player.call(this, player_indicator, timer_view, messenger);
};

RemotePlayer.prototype = Object.create(Player.prototype);
RemotePlayer.prototype.constructor = RemotePlayer;

/**
 * This method selects the chosen move to be played from the list
 * of valid moves.
 *
 * @param validMoves the list of valid moves.
 * @param model      the game model object.
 */
RemotePlayer.prototype.notify = function (validMoves, model) {
  var self = this;
  var timeOutListener = function () {
    self.messenger.deregisterListener(MessageType["move"], listener);
    model.gameOver = true;
    if (model.currentPlayer.colour == Colour["red"]) model.winningPlayer = model.users[Colour["white"]];
    else model.winningPlayer = model.users[Colour["red"]];
    model.play(null);
  };

  // Display the current player.
  this.player_indicator.className = "";
  this.player_indicator.classList.add("remote", model.currentPlayer.colour);

  this.timer_view.registerListener(timeOutListener);
  this.timer_view.start(model.time_limit);

  var self = this;
  var listener = function (message) {
    self.messenger.deregisterListener(MessageType["move"], listener);

    self.timer_view.deregisterListener(timeOutListener);
    self.timer_view.reset(model.time_limit);

    var piece = model.getPiece(message.move.piece.x, message.move.piece.y);
    var move = new Move(piece, message.move.x, message.move.y);
    model.play(move);
  };

  this.messenger.registerListener(MessageType["move"], listener);
};
