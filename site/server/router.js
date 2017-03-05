var WebSocket = require("ws");
var fs        = require("fs");
var http      = require("http");
var https     = require("https");
var config    = require("../../config.js");
var Message   = require("../public/scripts/network/message.js");

var games = {};

var options = {
    key: fs.readFileSync('site/server/ssl_certs/key.pem'),
    cert: fs.readFileSync('site/server/ssl_certs/cert.pem'),
    rejectUnauthorized: false // Required because we are using a self-signed certificate.
};

// Create the server to use for websockets, this is to allow secure connections.
var http_server;
if (config.use_https) {
  http_server = https.createServer(options).listen(config.router.port, config.router.host);
  console.log("Router running at", config.router.https_address);
} else {
  http_server = http.createServer().listen(config.router.port, config.router.host);
  console.log("Router running at", config.router.http_address);
}


// Create a websocket connection between the router and the matchmaker.
var router;
if (config.use_https) {
  router = new WebSocket("wss://" + config.matchmaker.host + ":" + config.matchmaker.port, options);
} else {
  router = new WebSocket("ws://" + config.matchmaker.host + ":" + config.matchmaker.port);
}

// When the websocket is connected, send a register_router message.
router.on("open", function () {
  var address = config.use_https ? config.router.https_address : config.router.http_address;
  router.send(JSON.stringify(new Message.MessageRegisterRouter(address)));
});

// Handle messages from the matchmaker.
router.on("message", function (message_str, flags) {
  if (flags.binary) return;
  try {
    var message = JSON.parse(message_str);
    switch (message.type) {
      case Message.MessageType["game"]:
        if (config.debug) console.log("Game:", message);
        handleMessageGame(router, message);
        break;
      default:
        if (config.debug) console.log("Router received invalid message:", message);
        break;
    }
  } catch (e) {
    if (config.debug) console.log("Message is not valid JSON:", e);
  }
});

router.on("close", function () {
  process.exit();
});

var router_server = new WebSocket.Server({
  server: http_server
});

router_server.on("connection", function (ws) {
  ws.on("message", function (message_str, flags) {
    if (flags.binary) return;
    try {
      var message = JSON.parse(message_str);
      switch (message.type) {
        case Message.MessageType["ready"]:
          if (config.debug) console.log("Ready:", message);
          handleMessageReady(ws, message);
          break;
        case Message.MessageType["move"]:
        case Message.MessageType["message"]:
          if (config.debug) console.log("Move/Message:", message);
          handleMessagePassThrough(ws, message);
          break;
        case Message.MessageType["game_over"]:
          if (config.debug) console.log("Game over:", message);
          handleMessageGameOver(ws, message);
          break;
        default:
          if (config.debug) console.log("Router server received invalid message:", message);
          break;
      }
    } catch (e) {
      if (config.debug) console.log("Message is not valid JSON:", e);
    }
  });

  ws.on("close", function () {
    var keys = Object.keys(games);
    for (var i = 0; i < keys.length; i++) {
      if (games[keys[i]]) {
        var players = games[keys[i]].players;

        for (var j = 0; j < players.length; j++) {
          if (players[j].ws === ws) {
            var message = new Message.MessageGameOver(keys[i], players[j + 1 % players.length], players[j]);
            handleMessageGameOver(ws, message);
          }
        }
      }
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
      game.players[i].ws.close();
  }

  games[message.id] = undefined;
  ws.close();
};
