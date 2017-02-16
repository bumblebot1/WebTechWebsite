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

//TODO: Jump moves.

QUnit.module("model.validMoves() Tests", hooks);

QUnit.module("model.isGameOver() Tests", hooks);
