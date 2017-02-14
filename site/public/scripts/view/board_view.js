"use strict";

/**
 * This file defines a view which draws the board.
 */

/**
 * This constructs a new BoardView object.
 *
 * @param model  the model of English Draughts.
 * @param canvas the canvas to draw to.
 */
var BoardView = function (model, canvas) {
  var self = this;
  this.minPadding = 0.05;
  this.n_cols = 8;
  this.n_rows = 8;
  this.border_size = 8;
  this.white = "#B8CCD6";
  this.white_highlight = "#758086";
  this.green = "#257060";
  this.red = "#A72030";
  this.red_hightlight = "#702029";
  this.black = "#000000";
  this.model = model;
  this.canvas = canvas;
  this.context = canvas.getContext("2d");
  this.selected = null;
  this.listeners = [];

  window.addEventListener("resize", function () {
    self.canvas.width = 0;
    self.canvas.height = 0;
    self.draw();
  });

  canvas.addEventListener("click", function (e) {
    var coordinates = self.getClickCoordinates(e);
    if (coordinates) {
      var piece = model.getPiece(coordinates.x, coordinates.y);
      if (piece) {
        self.setSelected(piece);
      } else if (self.selected) {
        emitMoveEvent(new Move(self.selected, coordinates.x, coordinates.y));
        self.setSelected(null);
      }
    }
  });

  var emitMoveEvent = function (move) {
    for (var i = 0; i < self.listeners.length; i++) {
      self.listeners[i](move);
    }
  };
};

/**
 * This method clears the canvas.
 */
BoardView.prototype.clear = function () {
  this.canvas.width = this.canvas.offsetWidth;
  this.canvas.height = this.canvas.offsetHeight;
};

/**
 * This method draws the board to the canvas.
 */
BoardView.prototype.draw = function () {
  this.clear();

  var boardRect = this.calcBoardRect();

  this.context.fillStyle = this.green;
  this.context.fillRect(boardRect.x, boardRect.y, boardRect.width, boardRect.height);

  var x_offset = this.border_size + boardRect.x;
  var y_offset = this.border_size + boardRect.y;
  var x_width = (boardRect.width - (2 * this.border_size)) / this.n_cols;
  var y_width = (boardRect.height - (2 * this.border_size)) / this.n_rows;

  // Draw the board.
  for (var y = 0; y < this.n_rows; y++) {
    var white = y % 2 == 0;
    for (var x = 0; x < this.n_cols; x++) {
      if (white) this.context.fillStyle = this.white;
      else       this.context.fillStyle = this.green;

      this.context.fillRect(
        x_offset + x * x_width,
        y_offset + y * y_width,
        x_width,
        y_width
      );

      white = !white;
    }
  }

  var pieces = this.model.pieces;
  var multiplier = 1 - 4 * this.minPadding;
  var radius = Math.min(x_width * multiplier, y_width * multiplier) / 2;
  var offset = this.minPadding * radius * 2;

  // Draw the pieces.
  for (var i = 0; i < pieces.length; i++) {
    this.context.beginPath();
    this.context.arc(
      x_offset + pieces[i].x * x_width + x_width / 2 + offset,
      y_offset + pieces[i].y * y_width + y_width / 2 + offset,
      radius,
      0,
      2 * Math.PI,
      false
    );
    this.context.fillStyle = this.black;
    this.context.fill();
    this.context.closePath();

    this.context.beginPath();
    this.context.arc(
      x_offset + pieces[i].x * x_width + x_width / 2,
      y_offset + pieces[i].y * y_width + y_width / 2,
      radius,
      0,
      2 * Math.PI,
      false
    );
    if (this.selected &&
        pieces[i].x == this.selected.x &&
        pieces[i].y == this.selected.y) {
      if (pieces[i].colour === Colour["red"]) this.context.fillStyle = this.red_hightlight;
      else this.context.fillStyle = this.white_highlight;
    } else {
      if (pieces[i].colour === Colour["red"]) this.context.fillStyle = this.red;
      else this.context.fillStyle = this.white;
    }
    this.context.fill();
    this.context.closePath();

    if (pieces[i].king) {
      this.context.beginPath();
      this.context.arc(
        x_offset + pieces[i].x * x_width + x_width / 2,
        y_offset + pieces[i].y * y_width + y_width / 2,
        radius * 0.2,
        0,
        2 * Math.PI,
        false
      );
      this.context.fillStyle = this.black;
      this.context.fill();
      this.context.closePath();
    }
  }
};

/**
 * This method returns the position, width and height of the
 * board.
 *
 * @return the position, width and height of the board.
 */
BoardView.prototype.calcBoardRect = function () {
  var multiplier = 1 - 2 * this.minPadding;
  var sideLength = Math.min(this.canvas.width * multiplier,
                            this.canvas.height * multiplier);
  return {
    x: (this.canvas.width - sideLength) / 2,
    y: (this.canvas.height - sideLength) / 2,
    width: sideLength,
    height: sideLength
  };
};

/**
 * This method returns the coordinates of the square that was clicked or
 * null if the click was not in a square.
 *
 * @param click the click event.
 * @return      the coordinates of the square clicked.
 */
BoardView.prototype.getClickCoordinates = function (click) {
  // Get the pixel coordinates in the canvas.
  var x = click.pageX - this.canvas.offsetLeft;
  var y = click.pageY - this.canvas.offsetTop;
  var bounding_box = this.calcBoardRect();

  // Transform, so that (0,0) is the top left corner of the board.
  x = x - (bounding_box.x + this.border_size);
  y = y - (bounding_box.y + this.border_size);

  // Scale, so that the coordinates are between 0 and 8 if they are on the board.
  x = x / (bounding_box.width - 2 * this.border_size) * this.n_cols;
  y = y / (bounding_box.height - 2 * this.border_size) * this.n_rows;

  // Floor, to get integer coordinates on the board.
  x = Math.floor(x);
  y = Math.floor(y);

  if (x >= 0 && x < this.n_cols &&
      y >= 0 && y < this.n_rows) return {
    x: x,
    y: y
  }
  return null;
};

/**
 * This method sets the selected piece.
 *
 * @param piece the piece to set as selected.
 */
BoardView.prototype.setSelected = function (piece) {
  this.selected = piece;
  this.draw();
};

/**
 * This method registers a move listener.
 *
 * @param listener the listener to register.
 */
BoardView.prototype.registerMoveListener = function (listener) {
  this.listeners.push(listener);
};

/**
 * This method de-registers a move listener.
 *
 * @param listener the listener to de-register.
 */
BoardView.prototype.deregisterMoveListener = function (listener) {
  var index = this.listeners.indexOf(listener);
  if (index >= 0) {
    this.listeners.splice(index, 1);
  }
};
