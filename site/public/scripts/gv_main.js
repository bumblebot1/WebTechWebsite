"use strict";

window.onload = function () {
  var logged_in = window.localStorage.getItem("logged_in");
  // Remove in production.
  logged_in = true;
  if (logged_in) {
    var messenger = new Messenger();
    var timer_view = new TimerView(document.getElementById("time_remaining"));
    var message_view = new MessageView(document.getElementById("message_log"), document.getElementById("message_form"), messenger);
    var red = new LocalPlayer(message_view, document.getElementById("player"), timer_view, messenger);
    var white = new LocalPlayer(message_view, document.getElementById("player"), timer_view, messenger);
    var model = new Model(red, white, document.getElementById("player"), messenger, [ { colour: Colour["red"] }, { colour: Colour["white"] } ]);
    var board = new BoardView(model, document.getElementById("board"));
    red.moveProvider = board;
    white.moveProvider = board;
    board.draw();
    model.turn();
  } else {
    window.location.href = window.location.href.replace("game_view.html", "");
  }
};
