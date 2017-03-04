"use strict";

window.onload = function () {
  try {
    var id = localStorage.getItem("id");
    var type = localStorage.getItem("type");
    var users = JSON.parse(localStorage.getItem("users"));
    var round_time = parseInt(localStorage.getItem("round_time"));
    var router = localStorage.getItem("router");

    if (!(users && round_time && router)) {
      window.location.href = window.location.protocol + "//" + window.location.host;
    }

    var timer_view = new TimerView(document.getElementById("time_remaining"));
    var message_view = new MessageView(document.getElementById("message_log"), users);
    new Messenger(router, function (messenger) {

      var player_indicator = document.getElementById("player");

      var players = getPlayers(users, player_indicator, timer_view, messenger);
      var model = new Model(id, players.red, players.white, users, round_time, function () {
        player_indicator.className = "";
        player_indicator.classList.add("game_over", this.winningPlayer.colour);

        messenger.close();

        window.setTimeout(function () {
          var token_id = localStorage.getItem("token_id");
          var username = localStorage.getItem("username");

          localStorage.clear();

          localStorage.setItem("token_id", token_id);
          localStorage.setItem("username", username);

          window.location.href = window.location.protocol + "//" + window.location.host;
        }, 5000);
      });
      var board = new BoardView(model, document.getElementById("board"));
      var form_view = new FormView(model, document.getElementById("message_form"), messenger);

      players.red.move_provider = board;
      players.white.move_provider = board;

      board.draw();

      if (type == "local") {
        model.turn();
      } else {
        messenger.registerListener(MessageType["start_game"], function () {
          model.turn();
        });

        var ready = new MessageReady(model.id, { token_id: localStorage.getItem("token_id"), username: localStorage.getItem("username") });
        messenger.send(ready);
      }

      document.getElementById("leave").addEventListener("click", function () {
        var winner = model.winningPlayer;
        var loser;
        if (winner.colour === Colour["red"]) loser = model.users[Colour["white"]];
        else loser = model.users[Colour["red"]];
        var message = new MessageGameOver(model.id, winner, loser);

        messenger.send(message);
        window.location.href = window.location.protocol + "//" + window.location.host;
      });

      document.getElementById("logout").addEventListener("click", function () {
        var winner = model.winningPlayer;
        var loser;
        if (winner.colour === Colour["red"]) loser = model.users[Colour["white"]];
        else loser = model.users[Colour["red"]];
        var message = new MessageGameOver(model.id, winner, loser);

        messenger.send(message);

        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
          window.location.href = window.location.protocol + "//" + window.location.host;
        });
      });

    }, message_view);
  } catch (e) {
    console.log(e);
    //window.location.href = window.location.protocol + "//" + window.location.host;
  }
};

/**
 * This function returns the players given the users of the game.
 *
 * @param users            the users of the game.
 * @param player_indicator the view that displays the current player.
 * @param timer_view       the view that displays the time remaining.
 * @param messenger        the messenger to send messages from.
 * @return                 the players given the users of the game.
 */
var getPlayers = function (users, player_indicator, timer_view, messenger) {
  var token_id = localStorage.getItem("token_id");

  var red_player = null;
  var white_player = null;
  for (var i = 0; i < users.length; i++) {
    var player;
    if (users[i].token_id === null || users[i].token_id === token_id) {
      player = new LocalPlayer(player_indicator, timer_view, messenger);
    } else {
      player = new RemotePlayer(player_indicator, timer_view, messenger);
    }
    if (users[i].colour === Colour["red"]) red_player = player;
    else white_player = player;
  }

  return {
    "red": red_player,
    "white": white_player
  };
};
