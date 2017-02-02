"use strict";

/**
 * This file defines a move in the game.
 */

/**
 * This constructs a new Move object.
 *
 * @param piece the piece to move.
 * @param x     the x index to move the piece to.
 * @param y     the y index to move the piece to.
 */
var Move = function (piece, x, y) {
  this.piece = piece;
  this.x = x;
  this.y = y;
};

/**
 * This method returns the stringular representation of a
 * Move in the game.
 *
 * @return the stringular representation of a Move in the game.
 */
Move.prototype.toString = function () {
  return "Move(" + this.piece.toString() + ", "
                 + this.x                + ", "
                 + this.y                + ")";
};
