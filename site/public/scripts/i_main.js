"use strict";

/**
 * This file sets up the buttons on the index.html page.
 */

var username, token_id, id;

/**
 * This function is called when the user signs in.
 *
 * @param googleUser the user who has signed in.
 */
var logged_in = function (googleUser) {
  var profile = googleUser.getBasicProfile();
  // Set the username and token_id.
  username = profile.getName();
  id = profile.getId();
  token_id = googleUser.getAuthResponse().id_token;

  var buttons = document.getElementById("buttons");
  buttons.classList.remove("disabled");
};

/**
 * This function is called when the user signs out.
 */
var log_out = function () {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    // Clear the localStorage for the specified user.
    localStorage.removeItem(id);
    // Set the username and token_id to undefined.
    username = undefined;
    id = undefined;
    token_id = undefined;

    var buttons = document.getElementById("buttons");
    buttons.classList.add("disabled");
  });
};

window.addEventListener("load", function () {
  var address = config.use_https ? config.matchmaker.https_address : config.matchmaker.http_address;
  var messenger = new Messenger(address, function () {
    var leaderboard = new Leaderboard(document.getElementById("leaderboard"), messenger);
  });

  var logout = document.getElementById("logout");
  logout.addEventListener("click", log_out);

  var local = document.getElementById("local");
  local.addEventListener("click", function () {
    // Set up a local game.
    var users = [
      new User(Colour["red"], null, Colour["red"]),
      new User(Colour["white"], null, Colour["white"])
    ];

    start_game(-1, "local", users, config.matchmaker.round_time, undefined, messenger);
  });

  var remote = document.getElementById("remote");
  remote.addEventListener("click", function () {
    if (!username || !id || !token_id) return;
    var buttons = document.getElementById("buttons");
    buttons.classList.add("disabled", "game");

    messenger.registerListener(MessageType["game"], function (message) {
      start_game(message.id, "remote", message.players, message.round_time, message.router, messenger);
    });

    messenger.send(new MessageRequestGame({
      username: username,
      token_id: token_id
    }));
  });
});

/**
 * This function starts a new game with the specified options.
 *
 * @param game_id    the id of the game.
 * @param type       the type of game.
 * @param users      the users playing the game.
 * @param round_time the time a player has to make a move each turn.
 * @param router     the router to connect to.
 * @param messenger  the messenger currently being used to communicate with the matchmaker.
 */
var start_game = function (game_id, type, users, round_time, router, messenger) {

  var params = {
    game_id: game_id,
    type: type,
    users: users,
    round_time: round_time,
    router: router
  };

  localStorage.setItem(id, JSON.stringify(params));

  messenger.close();
  window.location.href = window.location.protocol + "//" + window.location.host + "/" + config.game_page + "?" + encodeURIComponent(id);
};
