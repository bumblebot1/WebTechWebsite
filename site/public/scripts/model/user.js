"use strict";

/**
 * This file defines a user who plays the game.
 */

/**
 * This constructs a new User object.
 *
 * @param colour   the colour of the user.
 * @param token_id the token_id of the player.
 * @param username the username of the player.
 */
var User = function (colour, token_id, username) {
  this.colour = colour;
  this.token_id = token_id;
  this.username = username;
};
