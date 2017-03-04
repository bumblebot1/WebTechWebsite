"use strict";

/**
 * This file sets up the buttons on the index.html page.
 */

/**
 * This function is called when the user signs in.
 *
 * @param googleUser the user who has signed in.
 */
var logged_in = function (googleUser) {
  var profile = googleUser.getBasicProfile();
  localStorage.setItem("username", profile.getName());

  //console.log(profile.getId());

  var token_id = profile.getId();
  //var token_id = googleUser.getAuthResponse().id_token;
  localStorage.setItem("token_id", token_id);

  var buttons = document.getElementById("buttons");
  buttons.classList.remove("disabled");
};

/**
 * This function is called when the user signs out.
 */
var log_out = function () {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    localStorage.setItem("username", undefined);
    localStorage.setItem("token_id", undefined);

    var buttons = document.getElementById("buttons");
    buttons.classList.add("disabled");
  });
};

window.addEventListener("load", function () {
  var messenger = new Messenger("ws://localhost:3001", function () {
    var leaderboard = new Leaderboard(document.getElementById("leaderboard"), messenger);
  });

  var logout = document.getElementById("logout");
  logout.addEventListener("click", log_out);

  var local = document.getElementById("local");
  local.addEventListener("click", function () {
    // Set up a local game.
    var users = [
      { colour: Colour["red"]
      , token_id: null
      , username: Colour["red"]
      },
      { colour: Colour["white"]
      , token_id: null
      , username: Colour["white"]
      }
    ];

    start_game(-1, "local", users, 60000, undefined, messenger);
  });

  var remote = document.getElementById("remote");
  remote.addEventListener("click", function () {
    var buttons = document.getElementById("buttons");
    buttons.classList.add("disabled", "game");

    messenger.registerListener(MessageType["game"], function (message) {
      start_game(message.id, "remote", message.players, message.round_time, message.router, messenger);
    });
    messenger.send(new MessageRequestGame({
      username: localStorage.getItem("username"),
      token_id: localStorage.getItem("token_id")
    }));
  });
});

/**
 * This function starts a new game with the specified options.
 *
 * @param id         the id of the game.
 * @param type       the type of game.
 * @param users      the users playing the game.
 * @param round_time the time a player has to make a move each turn.
 * @param router     the router to connect to.
 * @param messenger  the messenger currently being used to communicate with the matchmaker.
 */
var start_game = function (id, type, users, round_time, router, messenger) {
  localStorage.setItem("id", id);
  localStorage.setItem("type", type);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("round_time", round_time);
  localStorage.setItem("router", router);

  messenger.close();
  window.location.href = window.location.protocol + "//" + window.location.host + "/game_view.html";
};
