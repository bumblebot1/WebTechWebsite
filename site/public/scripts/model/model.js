"use strict";

/**
 * This file defines a model for English Draughts.
 */

/**
 * This constructs a new Model for English Draughts. The red
 * player will always start the game.
 *
 * @param id               the id of the game.
 * @param redPlayer        the Player object for the red player.
 * @param whitePlayer      the Player object for the white player.
 * @param users            the list of users who are playing the game.
 * @param round_time       the time a user has to make a move per turn.
 * @param gameOverCallback the function to call when the game is over.
 */
var Model = function (id, redPlayer, whitePlayer, users, round_time, gameOverCallback) {
  // This function returns the list of Pieces defining the starting
  // state of the game.
  var initializePieces = function () {
    var pieces = [];
    for (var i = 0; i < 3; i++) {
      for (var j = 1; j < 8; j += 2) {
        pieces.push(new Piece(Colour["white"], j - (i % 2), i));
      }
    }
    for (var i = 5; i < 8; i++) {
      for (var j = 1; j < 8; j += 2) {
        pieces.push(new Piece(Colour["red"], j - (i % 2), i));
      }
    }
    return pieces;
  };

  this.players = {
    "red"   : redPlayer,
    "white" : whitePlayer
  };
  this.users = {};
  for (var i = 0; i < users.length; i++) {
    if (users[i].colour === Colour["red"]) {
      this.users[Colour["red"]] = users[i];
      this.currentPlayer = users[i];
    } else {
      this.users[Colour["white"]] = users[i];
    }
  }

  this.id = id;
  this.pieces = initializePieces();
  this.gameOverCallback = gameOverCallback;
  this.gameOver = false;
  this.winningPlayer = null;
  this.time_limit = round_time;
};

/**
 * This method performs a single turn in the game.
 */
Model.prototype.turn = function () {
  if (!this.isGameOver()) {
    this.getPlayerMove(this.validMoves(this.currentPlayer.colour));
  } else {
    this.gameOverCallback();
  }
};

/**
 * This method asks the current player for a move.
 *
 * @param moves the list of valid moves the player can make.
 */
Model.prototype.getPlayerMove = function (moves) {
  this.players[this.currentPlayer.colour].notify(moves, this);
};

/**
 * This method plays a Move in the game.
 *
 * @param move the Move to play.
 */
Model.prototype.play = function (move) {
  if (this.isGameOver()) return this.turn();
  var self = this;
  // This function updates all pieces which have reached the
  // top of the board and are now king pieces.
  var checkForKing = function () {
    for (var i = 0; i < self.pieces.length; i++) {
      if ((self.pieces[i].colour === Colour["red"] &&
           self.pieces[i].y === 0)
       || (self.pieces[i].colour === Colour["white"] &&
           self.pieces[i].y === 7)) {
        self.pieces[i].king = true;
      }
    }
  };
  // This function returns true if the player has jumped onto their
  // opponents kings row and they are not already a king.
  var jumpOntoKing = function (piece) {
    return (piece.colour === Colour["red"]   && piece.y === 0 && !piece.king)
        || (piece.colour === Colour["white"] && piece.y === 7 && !piece.king);
  };
  // This function removes a piece that has been jumped over, returns
  // true in this case.
  var removePiece = function (x1, y1, x2, y2) {
    var x = x2 - x1, y = y2 - y1;
    if (x % 2 === 0) {
      var piece = self.getPiece(x1 + (x / 2), y1 + (y / 2));
      var index = self.pieces.indexOf(piece);
      if (index > -1) self.pieces.splice(index, 1);
      return true;
    }
    return false;
  };
  // This function sets the next player.
  var nextPlayer = function () {
    if (self.currentPlayer.colour === Colour["red"]) self.currentPlayer = self.users[Colour["white"]];
    else self.currentPlayer = self.users[Colour["red"]];
  };

  var old_x, old_y;
  for (var i = 0; i < this.pieces.length; i++) {
    if (this.pieces[i] === move.piece) {
      old_x = this.pieces[i].x;
      old_y = this.pieces[i].y;
      this.pieces[i].x = move.x;
      this.pieces[i].y = move.y;
    }
  }
  var jump = removePiece(old_x, old_y, move.x, move.y);
  var newKing = jumpOntoKing(move.piece);
  checkForKing();
  var moves = this.pieceValidMoves(this.currentPlayer.colour, move.piece, 1, true);
  if (move.piece.king)
    moves = moves.concat(this.pieceValidMoves(this.currentPlayer.colour, move.piece, -1, true));
  if (jump && moves.length > 0 && !newKing) {
    this.getPlayerMove(moves);
  } else {
    nextPlayer();
    this.turn();
  }
};

/**
 * This method returns the list of valid moves for the specified
 * player.
 *
 * @param colour   the Colour of the player whose moves to generate.
 * @return         the list of valid moves for the specified player.
 */
Model.prototype.validMoves = function (colour) {
  var moves = [];
  for (var i = 0; i < this.pieces.length; i++) {
    if (this.pieces[i].colour === colour) {
      if (this.pieces[i].king)
        moves = moves.concat(this.pieceValidMoves(colour, this.pieces[i], -1, false));
      moves = moves.concat(this.pieceValidMoves(colour, this.pieces[i], 1, false));
    }
  }
  return moves;
};

/**
 * This method returns the list of valid moves for the specified
 * player and piece.
 *
 * @param colour   the Colour of the player whose moves to generate.
 * @param piece    the Piece to generate moves for.
 * @param yOffset  the distance to move in the y-direction for a Move.
 * @param jumpOnly the boolean which decides whether to generate only
 *                 jump moves.
 * @return         the list of valid moves for a normal Piece.
 */
Model.prototype.pieceValidMoves = function (colour, piece, yOffset, jumpOnly) {
  var self = this;
  var moves = [];
  // This function returns true if the specified location
  // is empty.
  var isEmpty = function (x, y) {
    return !(self.getPiece(x, y) !== null ||
             x < 0 ||
             x > 7 ||
             y < 0 ||
             y > 7);
  };

  if (colour === Colour["red"]) yOffset = -yOffset;
  if (!jumpOnly) {
    if (isEmpty(piece.x - 1, piece.y + yOffset))
      moves.push(new Move(piece, piece.x - 1, piece.y + yOffset));
    if (isEmpty(piece.x + 1, piece.y + yOffset))
      moves.push(new Move(piece, piece.x + 1, piece.y + yOffset));
  }
  var yJumpOffset = yOffset * 2;
  if (isEmpty(piece.x - 2, piece.y + yJumpOffset) &&
      this.getPiece(piece.x - 1, piece.y + yOffset) !== null &&
      this.getPiece(piece.x - 1, piece.y + yOffset).colour !== colour)
    moves.push(new Move(piece, piece.x - 2, piece.y + yJumpOffset));
  if (isEmpty(piece.x + 2, piece.y + yJumpOffset) &&
      this.getPiece(piece.x + 1, piece.y + yOffset) !== null &&
      this.getPiece(piece.x + 1, piece.y + yOffset).colour !== colour)
    moves.push(new Move(piece, piece.x + 2, piece.y + yJumpOffset));

  return moves;
};

/**
 * This method returns the Piece at the specified coordinates,
 * null if that location is empty.
 *
 * @param x the x coordinate of the piece to retrieve.
 * @param y the y coordinate of the piece to retrieve.
 * @return  the Piece at the specified coordinates, null
 *          if that location is empty.
 */
Model.prototype.getPiece = function (x, y) {
  for (var i = 0; i < this.pieces.length; i++) {
    if (this.pieces[i].x === x && this.pieces[i].y === y)
      return this.pieces[i];
  }
  return null;
};

/**
 * This method returns true if the game is over, false
 * otherwise.
 *
 * @return true if the game is over.
 */
Model.prototype.isGameOver = function () {
  var red_lost   = this.validMoves(Colour["red"]).length === 0 &&
                   this.currentPlayer.colour === Colour["red"];
  var white_lost = this.validMoves(Colour["white"]).length === 0 &&
                   this.currentPlayer.colour === Colour["white"];

  if (red_lost) this.winningPlayer = this.users[Colour["white"]];
  if (white_lost) this.winningPlayer = this.users[Colour["red"]];

  return this.gameOver || red_lost || white_lost;
};
