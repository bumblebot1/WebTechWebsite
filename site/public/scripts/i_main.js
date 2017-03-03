"use strict";

/**
 * This file sets up the buttons on the index.html page.
 */

var logged_in = function (googleUser) {
  var profile = googleUser.getBasicProfile();
  var buttons = document.getElementById("buttons");
  buttons.classList.remove("disabled");
};

var log_out = function () {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    var buttons = document.getElementById("buttons");
    buttons.classList.add("disabled");
  });
};

window.addEventListener("load", function () {
  var messenger = new Messenger();
  var leaderboard = new Leaderboard(document.getElementById("leaderboard"), messenger);

  var logout = document.getElementById("logout");
  logout.addEventListener("click", log_out);

  var local = document.getElementById("local");
  local.addEventListener("click", function () {
    // Set up a local game.
    localStorage.setItem("type", "local");
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
    localStorage.setItem("users", JSON.stringify(users));
    messenger.close();
    window.location.href = window.location.href.replace("/index.html", "") + "/game_view.html";
  });

  var remote = document.getElementById("remote");
  remote.addEventListener("click", function () {
    //TODO:
  });
});
