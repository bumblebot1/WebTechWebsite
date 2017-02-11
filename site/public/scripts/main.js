"use strict";

window.onload = function () {
  var red = new LocalPlayer();
  var white = new LocalPlayer();
  var model = new Model(red, white);
  var board = new BoardView(model, document.getElementById("board"));
  board.draw();
};
