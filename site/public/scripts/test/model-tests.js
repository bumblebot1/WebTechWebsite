var TestPlayer = function (colour) {
  this.colour = colour;
  this.count = 0;
  this.called = false;
  this.notify = function (validMoves, model) {
    this.called = true;
    if (this.count < 1) {
      this.count++;
      model.play(validMoves[0]);
    }
  };
};

var TestElement = {
  className: "",
  classList: {
    add: function () {}
  }
};

var hooks = {
  beforeEach: function () {
    this.redPlayer = new TestPlayer(Colour["red"]),
    this.whitePlayer = new TestPlayer(Colour["white"]),
    this.model = new Model(
      this.redPlayer,
      this.whitePlayer,
      TestElement
    );
  }
};

QUnit.module("model.constructor() Tests", hooks);

QUnit.test("The correct number of pieces are generated", function (assert) {
  assert.strictEqual(
    this.model.pieces.length,
    24,
    "There should be 24 pieces on the initial board, 12 red, 12 white."
  );
});

QUnit.test("Pieces are in the correct positions", function (assert) {
  var red_pieces = [
    { x: 0, y: 5 },
    { x: 2, y: 5 },
    { x: 4, y: 5 },
    { x: 6, y: 5 },
    { x: 1, y: 6 },
    { x: 3, y: 6 },
    { x: 5, y: 6 },
    { x: 7, y: 6 },
    { x: 0, y: 7 },
    { x: 2, y: 7 },
    { x: 4, y: 7 },
    { x: 6, y: 7 }
  ];
  var white_pieces = [
    { x: 1, y: 0 },
    { x: 3, y: 0 },
    { x: 5, y: 0 },
    { x: 7, y: 0 },
    { x: 0, y: 1 },
    { x: 2, y: 1 },
    { x: 4, y: 1 },
    { x: 6, y: 1 },
    { x: 1, y: 2 },
    { x: 3, y: 2 },
    { x: 5, y: 2 },
    { x: 7, y: 2 }
  ];

  for (var i = 0; i < red_pieces.length; i++) {
    var piece = this.model.getPiece(red_pieces[i].x, red_pieces[i].y);
    assert.notStrictEqual(
      piece,
      null,
      "There should be a piece at location (" + red_pieces[i].x + ", " + red_pieces[i].y + ")"
    );
    assert.strictEqual(
      piece.colour,
      Colour["red"],
      "The piece at location (" + red_pieces[i].x + ", " + red_pieces[i].y + ") should be red"
    );
  }
  for (var i = 0; i < white_pieces.length; i++) {
    var piece = this.model.getPiece(white_pieces[i].x, white_pieces[i].y);
    assert.notStrictEqual(
      piece,
      null,
      "There should be a piece at location (" + white_pieces[i].x + ", " + white_pieces[i].y + ")"
    );
    assert.strictEqual(
      piece.colour,
      Colour["white"],
      "The piece at location (" + white_pieces[i].x + ", " + white_pieces[i].y + ") should be white"
    );
  }
});

QUnit.test("No king pieces on initial board", function (assert) {
  var pieces = this.model.pieces;

  for (var i = 0; i < pieces.length; i++) {
    assert.notOk(
      pieces[i].king,
      "There shouldn't be any king pieces on the initial board."
    );
  }
});

QUnit.test("Current player should be red on initial board", function (assert) {
  assert.strictEqual(
    this.model.currentPlayer,
    Colour["red"],
    "The current player should be red on the initial board."
  );
});

QUnit.test("Game should not be over on initial board", function (assert) {
  assert.notOk(
    this.model.gameOver,
    "The game should not be over on initial board."
  );
  assert.notOk(
    this.model.isGameOver(),
    "The game should not be over on initial board."
  );
});

QUnit.module("model.turn() Tests", hooks);

QUnit.test("The current players notify method should be called by model.turn()", function (assert) {
  this.model.turn();
  assert.ok(
    this.redPlayer.called,
    "The red players notify method should be called by model.turn() when the current player is red"
  );

  // Reset the players called attribute.
  this.redPlayer.called = false;
  this.redPlayer.count = 0;
  this.whitePlayer.called = false;
  this.whitePlayer.count = 0;

  this.model.turn();
  assert.ok(
    this.whitePlayer.called,
    "The white players notify method should be called by model.turn() when the current player is white"
  );
});

QUnit.test("After one turn, the current player is white", function (assert) {
  this.whitePlayer.count = 1;

  this.model.turn();
  assert.strictEqual(
    this.model.currentPlayer,
    Colour["white"],
    "The current player should be white after one turn."
  );
});

QUnit.test("The players notify method is not called by model.turn() if the game is over", function (assert) {
  this.model.gameOver = true;
  this.model.turn();

  assert.notOk(
    this.redPlayer.called,
    "The red players notify method should not be called by model.turn() if the game is over."
  );
  assert.notOk(
    this.whitePlayer.called,
    "The white players notify method should not be called by model.turn() if the game is over."
  );
});

QUnit.module("model.play() Tests", hooks);

QUnit.test("Red move up left doesn't remove any pieces", function (assert) {
  this.redPlayer.count = 1;
  this.whitePlayer.count = 1;

  var positions = [
    { x: 2, y: 5 },
    { x: 4, y: 5 },
    { x: 6, y: 5 }
  ];

  var number_of_pieces = this.model.pieces.length;

  for (var i = 0; i < positions.length; i++) {
    var piece = this.model.getPiece(positions[i].x, positions[i].y);
    this.model.play(new Move(piece, piece.x - 1, piece.y - 1));
    assert.strictEqual(
      this.model.pieces.length,
      number_of_pieces,
      "The number of pieces shouldn't change."
    );
    assert.strictEqual(
      this.model.getPiece(positions[i].x, positions[i].y),
      null,
      "There should no longer be a piece at the original location."
    );
  }
});

QUnit.test("Red move up right doesn't remove any pieces", function (assert) {
this.redPlayer.count = 1;
  this.whitePlayer.count = 1;

  var positions = [
    { x: 0, y: 5 },
    { x: 2, y: 5 },
    { x: 4, y: 5 },
    { x: 6, y: 5 }
  ];

  var number_of_pieces = this.model.pieces.length;

  for (var i = 0; i < positions.length; i++) {
    var piece = this.model.getPiece(positions[i].x, positions[i].y);
    this.model.play(new Move(piece, piece.x + 1, piece.y - 1));
    assert.strictEqual(
      this.model.pieces.length,
      number_of_pieces,
      "The number of pieces shouldn't change."
    );
    assert.strictEqual(
      this.model.getPiece(positions[i].x, positions[i].y),
      null,
      "There should no longer be a piece at the original location."
    );
  }
});

QUnit.test("White move down left doesn't remove any pieces", function (assert) {
  this.redPlayer.count = 1;
  this.whitePlayer.count = 1;

  var positions = [
    { x: 1, y: 2 },
    { x: 3, y: 2 },
    { x: 5, y: 2 },
    { x: 7, y: 2 }
  ];

  var number_of_pieces = this.model.pieces.length;

  for (var i = 0; i < positions.length; i++) {
    var piece = this.model.getPiece(positions[i].x, positions[i].y);
    this.model.play(new Move(piece, piece.x - 1, piece.y + 1));
    assert.strictEqual(
      this.model.pieces.length,
      number_of_pieces,
      "The number of pieces shouldn't change."
    );
    assert.strictEqual(
      this.model.getPiece(positions[i].x, positions[i].y),
      null,
      "There should no longer be a piece at the original location."
    );
  }
});

QUnit.test("White move down right doesn't remove any pieces", function (assert) {
  this.redPlayer.count = 1;
  this.whitePlayer.count = 1;

  var positions = [
    { x: 1, y: 2 },
    { x: 3, y: 2 },
    { x: 5, y: 2 }
  ];

  var number_of_pieces = this.model.pieces.length;

  for (var i = 0; i < positions.length; i++) {
    var piece = this.model.getPiece(positions[i].x, positions[i].y);
    this.model.play(new Move(piece, piece.x + 1, piece.y + 1));
    assert.strictEqual(
      this.model.pieces.length,
      number_of_pieces,
      "The number of pieces shouldn't change."
    );
    assert.strictEqual(
      this.model.getPiece(positions[i].x, positions[i].y),
      null,
      "There should no longer be a piece at the original location."
    );
  }
});

QUnit.test("Red jump move left removes the correct piece", function (assert) {
  this.redPlayer.count = 1;
  this.whitePlayer.count = 1;

  this.model.pieces = [
    new Piece(Colour["white"], 2, 3),
    new Piece(Colour["red"], 3, 4),
    new Piece(Colour["red"], 4, 5)
  ];

  var piece = this.model.getPiece(3, 4);
  this.model.play(new Move(piece, piece.x - 2, piece.y - 2));
  assert.strictEqual(
    this.model.pieces.length,
    2,
    "The number of pieces should decrease by one."
  );
  assert.notStrictEqual(
    this.model.getPiece(1, 2),
    null,
    "There should now be a piece at (1, 2)."
  );
  assert.notStrictEqual(
    this.model.getPiece(4, 5),
    null,
    "The piece at (4, 5) should not have moved."
  );
});

QUnit.test("Red jump move right removes the correct piece", function (assert) {
  this.redPlayer.count = 1;
  this.whitePlayer.count = 1;

  this.model.pieces = [
    new Piece(Colour["white"], 4, 3),
    new Piece(Colour["red"], 3, 4),
    new Piece(Colour["red"], 2, 5)
  ];

  var piece = this.model.getPiece(3, 4);
  this.model.play(new Move(piece, piece.x + 2, piece.y - 2));
  assert.strictEqual(
    this.model.pieces.length,
    2,
    "The number of pieces should decrease by one."
  );
  assert.notStrictEqual(
    this.model.getPiece(5, 2),
    null,
    "There should now be a piece at (5, 2)."
  );
  assert.notStrictEqual(
    this.model.getPiece(2, 5),
    null,
    "The piece at (2, 5) should not have moved."
  );
});

QUnit.test("White jump left move removes the correct piece", function (assert) {
  this.redPlayer.count = 1;
  this.whitePlayer.count = 1;

  this.model.pieces = [
    new Piece(Colour["white"], 3, 2),
    new Piece(Colour["white"], 2, 3),
    new Piece(Colour["red"], 1, 4)
  ];

  var piece = this.model.getPiece(2, 3);
  this.model.play(new Move(piece, piece.x - 2, piece.y + 2));
  assert.strictEqual(
    this.model.pieces.length,
    2,
    "The number of pieces should decrease by one."
  );
  assert.notStrictEqual(
    this.model.getPiece(0, 5),
    null,
    "There should now be a piece at (0, 5)."
  );
  assert.notStrictEqual(
    this.model.getPiece(3, 2),
    null,
    "The piece at (3, 2) should not have moved."
  );
});

QUnit.test("White jump right move removes the correct piece", function (assert) {
  this.redPlayer.count = 1;
  this.whitePlayer.count = 1;

  this.model.pieces = [
    new Piece(Colour["white"], 1, 2),
    new Piece(Colour["white"], 2, 3),
    new Piece(Colour["red"], 3, 4)
  ];

  var piece = this.model.getPiece(2, 3);
  this.model.play(new Move(piece, piece.x + 2, piece.y + 2));
  assert.strictEqual(
    this.model.pieces.length,
    2,
    "The number of pieces should decrease by one."
  );
  assert.notStrictEqual(
    this.model.getPiece(4, 5),
    null,
    "There should now be a piece at (4, 5)."
  );
  assert.notStrictEqual(
    this.model.getPiece(1, 2),
    null,
    "The piece at (1, 2) should not have moved."
  );
});

QUnit.test("Red king pieces can move in any direction", function (assert) {
  this.redPlayer.count = 1;
  this.whitePlayer.count = 1;

  this.model.pieces = [
    new Piece(Colour["red"], 2, 5)
  ];

  var length = this.model.pieces.length;

  var piece = this.model.getPiece(2, 5);
  piece.king = true;
  this.model.play(new Move(piece, piece.x - 1, piece.y + 1));
  assert.strictEqual(
    this.model.pieces.length,
    length,
    "The number of pieces should not decrease."
  );
  assert.strictEqual(
    this.model.getPiece(2, 5),
    null,
    "There should not be a piece at (2, 5)."
  );
  assert.notStrictEqual(
    this.model.getPiece(1, 6),
    null,
    "There should be a piece at (1, 6)."
  );
});

QUnit.test("White king pieces can move in any direction", function (assert) {
  this.redPlayer.count = 1;
  this.whitePlayer.count = 1;

  this.model.pieces = [
    new Piece(Colour["white"], 1, 2)
  ];
  this.model.currentPlayer = Colour["white"];

  var length = this.model.pieces.length;

  var piece = this.model.getPiece(1, 2);
  piece.king = true;
  this.model.play(new Move(piece, piece.x + 1, piece.y - 1));
  assert.strictEqual(
    this.model.pieces.length,
    length,
    "The number of pieces should not decrease."
  );
  assert.strictEqual(
    this.model.getPiece(1, 2),
    null,
    "There should not be a piece at (1, 2)."
  );
  assert.notStrictEqual(
    this.model.getPiece(2, 1),
    null,
    "There should be a piece at (2, 1)."
  );
});

QUnit.test("Red pieces are made kings if they jump onto the king row", function (assert) {
  this.redPlayer.count = 1;
  this.whitePlayer.count = 1;

  this.model.pieces = [
    new Piece(Colour["red"], 0, 1)
  ];

  var piece = this.model.getPiece(0, 1);
  assert.notOk(
    piece.king,
    "The piece should not be a king initially."
  );
  this.model.play(new Move(piece, piece.x + 1, piece.y - 1));
  piece = this.model.getPiece(1, 0);
  assert.ok(
    piece.king,
    "The piece should now be a king."
  );
});

QUnit.test("White pieces are made kings if they jump onto the king row", function (assert) {
  this.redPlayer.count = 1;
  this.whitePlayer.count = 1;

  this.model.pieces = [
    new Piece(Colour["white"], 1, 6)
  ];
  this.model.currentPlayer = Colour["white"];

  var piece = this.model.getPiece(1, 6);
  assert.notOk(
    piece.king,
    "The piece should not be a king initially."
  );
  this.model.play(new Move(piece, piece.x - 1, piece.y + 1));
  piece = this.model.getPiece(0, 7);
  assert.ok(
    piece.king,
    "The piece should now be a king."
  );
});

QUnit.module("model.validMoves() Tests", hooks);

QUnit.test("The valid moves are correct for the red player starting", function (assert) {
  var moves = [
    new Move(new Piece(Colour["red"], 0, 5), 1, 4),
    new Move(new Piece(Colour["red"], 2, 5), 1, 4),
    new Move(new Piece(Colour["red"], 2, 5), 3, 4),
    new Move(new Piece(Colour["red"], 4, 5), 3, 4),
    new Move(new Piece(Colour["red"], 4, 5), 5, 4),
    new Move(new Piece(Colour["red"], 6, 5), 5, 4),
    new Move(new Piece(Colour["red"], 6, 5), 7, 4)
  ];

  assert.deepEqual(
    this.model.validMoves(Colour["red"]),
    moves,
    "The list returned by validMoves should only contain valid moves."
  );
});

QUnit.test("The valid moves are correct for the white player starting", function (assert) {
  var moves = [
    new Move(new Piece(Colour["white"], 1, 2), 0, 3),
    new Move(new Piece(Colour["white"], 1, 2), 2, 3),
    new Move(new Piece(Colour["white"], 3, 2), 2, 3),
    new Move(new Piece(Colour["white"], 3, 2), 4, 3),
    new Move(new Piece(Colour["white"], 5, 2), 4, 3),
    new Move(new Piece(Colour["white"], 5, 2), 6, 3),
    new Move(new Piece(Colour["white"], 7, 2), 6, 3)
  ];

  assert.deepEqual(
    this.model.validMoves(Colour["white"]),
    moves,
    "The list returned by validMoves should only contain valid moves."
  );
});

QUnit.test("The valid moves list should be empty when there are no red valid moves", function (assert) {
  this.model.pieces = [
    new Piece(Colour["red"], 1, 0),
    new Piece(Colour["red"], 0, 1)
  ];

  assert.strictEqual(
    this.model.validMoves(Colour["red"]).length,
    0,
    "There shouldn't be any valid moves."
  );
});

QUnit.test("The valid moves list should be empty when there are no white valid moves", function (assert) {
  this.model.pieces = [
    new Piece(Colour["white"], 7, 6),
    new Piece(Colour["white"], 6, 7)
  ];

  assert.strictEqual(
    this.model.validMoves(Colour["white"]).length,
    0,
    "There shouldn't be any valid moves."
  );
});

QUnit.module("model.isGameOver() Tests", hooks);

QUnit.test("Game is over when gameOver attribute is set", function (assert) {
  assert.notOk(
    this.model.isGameOver(),
    "The game should not be over initially."
  );
  this.model.gameOver = true;
  assert.ok(
    this.model.isGameOver(),
    "The game should be over."
  );
});

QUnit.test("Game is over when the red player has no pieces", function (assert) {
  this.model.currentPlayer = Colour["red"];
  this.model.pieces = [
    new Piece(Colour["white"], 1, 0)
  ];
  assert.ok(
    this.model.isGameOver(),
    "The game should be over."
  );
  assert.strictEqual(
    this.model.winningPlayer,
    Colour["white"],
    "The white player should win when the red player has no pieces."
  );
});

QUnit.test("Game is over when the white player has no pieces", function (assert) {
  this.model.currentPlayer = Colour["white"];
  this.model.pieces = [
    new Piece(Colour["red"], 0, 5)
  ];
  assert.ok(
    this.model.isGameOver(),
    "The game should be over."
  );
  assert.strictEqual(
    this.model.winningPlayer,
    Colour["red"],
    "The red player should win when the white player has no pieces."
  );
});

QUnit.test("Game is not over when the red player has no moves, but it is the white players turn", function (assert) {
  this.model.currentPlayer = Colour["white"];
  this.model.pieces = [
    new Piece(Colour["white"], 1, 0)
  ];
  assert.notOk(
    this.model.isGameOver(),
    "The game should not be over."
  );
});

QUnit.test("Game is not over when the white player has no moves, but it is the red players turn", function (assert) {
  this.model.currentPlayer = Colour["red"];
  this.model.pieces = [
    new Piece(Colour["red"], 0, 5)
  ];
  assert.notOk(
    this.model.isGameOver(),
    "The game should not be over."
  );
});
