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
  this.initialPiece = null;
  this.updatingPiece = null;
  this.distance = {
    x: 0,
    y: 0
  };
  this.requestAnimationID = null;
  this.stop = true;
  this.start = 0;
  
  var king_svg = new Image();
  king_svg.src = "resources/crown.svg";
  king_svg.onload = function () {
    self.king_svg = king_svg;
  };

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
        self.draw();
      } else if (self.selected) {
        emitMoveEvent(new Move(self.selected, coordinates.x, coordinates.y));
        self.setSelected(null);
      }
    }
  });

  var emitMoveEvent = function (move) {
    self.initialPiece = self.model.getPiece(move.piece.x, move.piece.y);
    self.model.getPiece(move.piece.x, move.piece.y);
    self.distance = {
      x: move.x - move.piece.x,
      y: move.y - move.piece.y 
    }; 
    self.updatingPiece = {
      x: move.piece.x,
      y: move.piece.y,
      colour: move.piece.colour,
      king: false
    }
    for (var i = 0; i < self.listeners.length; i++) {
      self.listeners[i](move);
    }
    self.updatingPiece.king = self.initialPiece.king;
    self.requestAnimationID = requestAnimationFrame(function(now){
      self.start = now * 0.001;
      self.stop = false;
      self.Animate(now);
    });
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
    var toDraw = pieces[i] === this.initialPiece ? this.updatingPiece : pieces[i];
    this.context.beginPath();
    this.context.arc(
      x_offset + toDraw.x * x_width + x_width / 2 + offset,
      y_offset + toDraw.y * y_width + y_width / 2 + offset,
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
      x_offset + toDraw.x * x_width + x_width / 2,
      y_offset + toDraw.y * y_width + y_width / 2,
      radius,
      0,
      2 * Math.PI,
      false
    );
    if (this.selected &&
        toDraw.x == this.selected.x &&
        toDraw.y == this.selected.y) {
      if (toDraw.colour === Colour["red"]) this.context.fillStyle = this.red_hightlight;
      else this.context.fillStyle = this.white_highlight;
    } else {
      if (toDraw.colour === Colour["red"]) this.context.fillStyle = this.red;
      else this.context.fillStyle = this.white;
    }
    this.context.fill();
    this.context.closePath();

    if (toDraw.king) {
      if (this.king_svg) {
        this.context.drawImage(
          this.king_svg,
          x_offset + toDraw.x * x_width + 0.1 * x_width,
          y_offset + toDraw.y * y_width + 0.1 * y_width,
          0.8 * x_width,
          0.8 * y_width
        );
      } else {
        this.context.beginPath();
        this.context.arc(
          x_offset + toDraw.x * x_width + x_width / 2,
          y_offset + toDraw.y * y_width + y_width / 2,
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
  }
};

BoardView.prototype.Animate = function(now) {
  if(this.requestAnimationID !== null) {
    now = now * 0.001;
    var deltaTime = now - this.start;
    this.start = now;
    var speed = 0.9;
    this.updatePieceInView(deltaTime, speed);
    this.draw();
    if(!this.stop) {
      //if animation not finished request another frame
      var self = this;
      this.requestAnimationID = requestAnimationFrame(function(time){
        self.Animate(time);
      })
    } else {
        this.distance = null;
        this.initialPiece = null;
        this.updatingPiece = null;
        window.cancelAnimationFrame(this.requestAnimationID);
        this.requestAnimationID = null;
    }
  }
}

BoardView.prototype.updatePieceInView = function(deltaTime, speed) {
  var pieces = this.model.pieces;
  deltaTime = deltaTime * speed;
  if(this.updatingPiece.x === this.initialPiece.x && this.updatingPiece.y === this.initialPiece.y) {
    this.stopAnimation();
    return;
  }

  if(this.distance.x > 0) {
    this.updatingPiece.x = this.updatingPiece.x + deltaTime * (this.distance.x) < this.initialPiece.x 
                      ? this.updatingPiece.x + deltaTime * (this.distance.x) 
                      : this.initialPiece.x;
  } else {
    this.updatingPiece.x = this.updatingPiece.x + deltaTime * (this.distance.x) > this.initialPiece.x 
                      ? this.updatingPiece.x + deltaTime * (this.distance.x) 
                      : this.initialPiece.x;
  }

  if(this.distance.y > 0) {
    this.updatingPiece.y = this.updatingPiece.y + deltaTime * (this.distance.y) < this.initialPiece.y 
                      ? this.updatingPiece.y + deltaTime * (this.distance.y) 
                      : this.initialPiece.y;
  } else {
    this.updatingPiece.y = this.updatingPiece.y + deltaTime * (this.distance.y) > this.initialPiece.y 
                      ? this.updatingPiece.y + deltaTime * (this.distance.y) 
                      : this.initialPiece.y;
  }
}

BoardView.prototype.stopAnimation = function() {
  this.stop = true;
}


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
