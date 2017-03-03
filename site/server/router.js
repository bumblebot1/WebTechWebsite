var WebSocket = require("ws");
var config = require("../../config.js");
var Message = require("message.js");

var games = {};

var router = new WebSocket("ws://" + config.matchmaker.host + ":" + config.matchmaker.port);

var router_server = new WebSocket.Server({
  host: config.router.host,
  port: config.router.port
});

router_server.on("connection", function (ws) {
  ws.on("message", function (message_str, flags) {
    if (flags.binary) return;
    try {
      var message = JSON.parse(message_str);
      switch (message.type) {
        case Message.MessageType["game"]:
          handleMessageGame(ws, message);
          break;
        case Message.MessageType["ready"]:
          handleMessageReady(ws, message);
          break;
        case Message.MessageType["move"]:
        case Message.MessageType["message"]:
          handleMessagePassThrough(ws, message);
          break;
        case Message.MessageType["game_over"]:
          handleMessageGameOver(ws, message);
          break;
        default:
          console.log("Router received invalid message:", message);
          break;
      }
    } catch (e) {
      console.log("Message is not valid JSON:", e);
    }
  });
});

/**
 * This function initialises a game.
 *
 * @param ws      the websocket to send messages to.
 * @param message the message that defines a game.
 */
var handleMessageGame = function (ws, message) {
  games[message.id] = {
    players: message.players
  };
};

/**
 * This function sets the ready flag for the specified player.
 *
 * @param ws      the websocket to send messages to.
 * @param message the message that contains the player information.
 */
var handleMessageReady = function (ws, message) {
  var game = games[message.id];
  if (!game) return;

  var game_ready = true;
  for (var i = 0; i < game.players.length; i++) {
    if (game.players[i].token_id === message.player.token_id) {
      game.players[i].ready = true;
      game.players[i].ws = ws;
    }
    game_ready = game_ready && game.players[i].ready;
  }

  if (game_ready) {
    // Send out start messages.
    var start_message = new Message.MessageStartGame(message.id);

    for (var i = 0; i < game.players.length; i++) {
      game.players[i].ws.send(JSON.stringify(start_message));
    }
  }
};

/**
 * This function passes the specified message to the other player in a game.
 *
 * @param ws      the websocket to send messages to.
 * @param message the message to pass through to the other player.
 */
var handleMessagePassThrough = function (ws, message) {
  var game = games[message.id];
  if (!game) return;

  for (var i = 0; i < game.players.length; i++) {
    if (game.players[i].ws != ws)
      game.players[i].ws.send(JSON.stringify(message));
  }
};

/**
 * This function sends the game over message to the other player and the matchmaker.
 *
 * @param ws      the websocket to send messages to.
 * @param message the message which contains the game over information.
 */
var handleMessageGameOver = function (ws, message) {
  router.send(JSON.stringify(message));

  var game = games[message.id];
  if (!game) return;

  for (var i = 0; i < game.players.length; i++) {
    if (game.players[i].ws != ws)
      game.players[i].ws.send(JSON.stringify(message));
  }

  games[message.id] = undefined;
};
