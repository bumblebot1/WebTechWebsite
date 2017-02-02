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
 */
var LocalPlayer = function () {};

LocalPlayer.prototype = Object.create(Player.prototype);
LocalPlayer.prototype.constructor = LocalPlayer;

/**
 * This method selects the chosen move to be played from the list
 * of valid moves.
 *
 * @param validMoves the list of valid moves.
 * @param model      the game model object.
 * @param select     the function used to select the chosen move
 *                   to be played.
 */
LocalPlayer.prototype.notify = function (validMoves, model, select) {};

/**
 * This constructs a new RemotePlayer object.
 */
var RemotePlayer = function () {};

RemotePlayer.prototype = Object.create(Player.prototype);
RemotePlayer.prototype.constructor = RemotePlayer;

/**
 * This method selects the chosen move to be played from the list
 * of valid moves.
 *
 * @param validMoves the list of valid moves.
 * @param model      the game model object.
 * @param select     the function used to select the chosen move
 *                   to be played.
 */
RemotePlayer.prototype.notify = function (validMoves, model, select) {};
