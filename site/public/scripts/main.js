"use strict";

window.onload = function () {
  var message_view = new MessageView(document.getElementById("message_log"));
  var red = new LocalPlayer(message_view, document.getElementById("player"));
  var white = new LocalPlayer(message_view, document.getElementById("player"));
  var model = new Model(red, white, document.getElementById("player"));
  var board = new BoardView(model, document.getElementById("board"));
  red.moveProvider = board;
  white.moveProvider = board;
  board.draw();
  model.turn();
};
