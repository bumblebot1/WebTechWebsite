"use strict";

/**
 * This file defines the player classes; a player can be either
 * local or remote.
 */

/**
 * This constructs a new Player object. This class should be used
 * to derive local and remote players.
 */
var Player = function () {};

/**
 * This constructs a new LocalPlayer object.
 *
 * @param message_view     the view to display game messages.
 * @param player_indicator the element which displays the
 *                         current player.
 */
var LocalPlayer = function (message_view, player_indicator) {
  this.moveProvider = null;
  this.message_view = message_view;
  this.player_indicator = player_indicator;
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
  // Display the current player.
  this.player_indicator.className = "";
  this.player_indicator.classList.add("local", model.currentPlayer);

  var self = this;
  var listener = function (move) {
    for (var i = 0; i < validMoves.length; i++) {
      if (validMoves[i].piece == move.piece &&
          validMoves[i].x     == move.x     &&
          validMoves[i].y     == move.y       ) {
        self.moveProvider.deregisterMoveListener(listener);
        self.message_view.append({
          colour: model.currentPlayer,
          username: model.currentPlayer,
          timestamp: new Date().toLocaleString(),
          body: messageBody(move)
        });
        model.play(move);
      }
    }
  };

  this.moveProvider.setSelected(null);
  this.moveProvider.registerMoveListener(listener);

  var messageBody = function (move) {
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
};

/**
 * This constructs a new RemotePlayer object.
 *
 * @param message_view     the view to display game messages.
 * @param player_indicator the element which displays the
 *                         current player.
 */
var RemotePlayer = function (message_view, player_indicator) {
  this.message_view = message_view;
  this.player_indicator = player_indicator;
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
  // Display the current player.
  this.player_indicator.className = "";
  this.player_indicator.classList.add("remote", model.currentPlayer);
};
