"use strict";

window.addEventListener("load", function () {
  // Get the user_id from the url string.
  var user_id = window.location.search.substring(1);
  var params = JSON.parse(localStorage.getItem(user_id));

  if (!params) {
    // Re-direct to the main page if the parameters are not given.
    window.location.href = window.location.protocol + "//" + window.location.host;
  }

  var message_view = new MessageView(document.getElementById("message_log"), params.users)
  new Messenger(params.router, function (messenger) {
    routerConnected(messenger, user_id, params);
  }, message_view);
});

/**
 * This function performs the set-up work once connected to the router server.
 *
 * @param messenger the messenger with which to send messages.
 * @param user_id   the id of the user who is playing the game.
 * @param params    the object containing the configuration of the game.
 */
var routerConnected = function (messenger, user_id, params) {
  // De-register the start_game listener and start the game.
  var startGameCallback = function () {
    messenger.deregisterListener(MessageType["start_game"], startGameCallback);
    model.turn();
  };

  // Emit game_over message.
  var localGameOverCallback = function () {
    var message = getGameOverMessage(model);

    messenger.send(message);
    gameOverCallback(message);
  };

  // Redirect to the main page once the game is over.
  var gameOverCallback = function (message) {
    player_indicator.className = "";
    player_indicator.classList.add("game_over", message.winner.colour);

    messenger.close();

    window.setTimeout(function () {
      localStorage.removeItem(user_id);
      window.location.href = window.location.protocol + "//" + window.location.host;
    }, 5000);
  };

  var timer_view = new TimerView(document.getElementById("time_remaining"));
  var player_indicator = document.getElementById("player");
  var players = getPlayers(user_id, params.users, player_indicator, timer_view, messenger);
  var model = new Model(params.game_id, players.red, players.white, params.users, params.round_time, localGameOverCallback);
  var board = new BoardView(model, document.getElementById("board"));
  var form = new FormView(model, document.getElementById("message_form"), messenger);

  // Set the move_providers for each of the players.
  players.red.move_provider = board;
  players.white.move_provider = board;

  // Draw the initial game state.
  board.draw();

  if (params.type == "local") {
    // Start the game.
    model.turn();
  } else {
    // Send a ready message to the router server.
    messenger.registerListener(MessageType["game_over"], gameOverCallback);
    messenger.registerListener(MessageType["start_game"], startGameCallback);
    messenger.send(new MessageReady(params.game_id, getPlayer(params.users, user_id)));
  }

  // Listen for clicks on the leave game button.
  document.getElementById("leave").addEventListener("click", function () {
    model.gameOver = true;
    model.winningPlayer = getWinningPlayer(params.users, user_id);
    var message = getGameOverMessage(model);

    localStorage.removeItem(user_id);
    messenger.send(message);
    messenger.close();
    window.location.href = window.location.protocol + "//" + window.location.host;
  });
};

/**
 * This function returns the game over message for the specified model.
 *
 * @param model the model which contains the state required
 *              to build a game over message.
 * @return      the game over message for the specified model.
 */
var getGameOverMessage = function (model) {
  var winner = model.winningPlayer;
  var loser = model.users[Colour["red"]];
  if (winner.colour === Colour["red"]) loser = model.users[Colour["white"]];

  return new MessageGameOver(model.id, winner, loser);
};

/**
 * This function returns the player with the specified token_id.
 * @param users    the list of users to search through.
 * @param token_id the token_id of the player to find.
 * @return         the player with the specified token_id.
 */
var getPlayer = function (users, token_id) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].token_id == token_id) return users[i];
  }
  return null;
};

/**
 * This funtion returns the player whose token_id is not equal to the specified token_id.
 *
 * @param users    the list of users to search through.
 * @param token_id the token_id of the player not to find.
 * @return         the player whose token_id is not equal to the specified token_id.
 */
var getWinningPlayer = function (users, token_id) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].token_id != token_id) return users[i];
  }
  return null;
};

/**
 * This function returns the players given the users of the game.
 *
 * @param token_id         the id of the user playing the game.
 * @param users            the users of the game.
 * @param player_indicator the view that displays the current player.
 * @param timer_view       the view that displays the time remaining.
 * @param messenger        the messenger to send messages from.
 * @return                 the players given the users of the game.
 */
var getPlayers = function (token_id, users, player_indicator, timer_view, messenger) {
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
