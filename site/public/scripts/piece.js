"use strict";

/**
 * This file defines a piece in the game.
 */

/**
 * This constructs a new Piece object.
 *
 * @param colour the colour of the piece.
 * @param x      the x index of the piece on the board.
 * @param y      the y index of the piece on the board.
 */
var Piece = function (colour, x, y) {
  this.colour = colour;
  this.x = x;
  this.y = y;
  this.king = false;
};

/**
 * This method returns the stringular representation of this
 * Piece in the game.
 *
 * @return the stringular representation of this Piece in the game.
 */
Piece.prototype.toString = function () {
  return "Piece(" + this.colour + ", "
                  + this.x      + ", "
                  + this.y      + ", "
                  + this.king   + ")";
};
