var WebSocket = require("ws");
var config = require("../../config.js");
var Message = require("message.js");
var DatabaseManager = require("database-manager.js");
var DBManager = new DatabaseManager("site/server/leaderboard.db");

var routers = {};
var next_game_id = 0;
var waiting_players = [];

var matchmaker_server = new WebSocket.Server({
  host: "localhost",
  port: config.matchmaker.port
}, function () {
  console.log("Matchmaker running at", config.matchmaker.address);
});

matchmaker_server.on("connection", function (ws) {
  ws.on("message", function (message_str, flags) {
    if (flags.binary) return;
    try {
      var message = JSON.parse(message_str);
      switch (message.type) {
        case Message.MessageType["leaderboard"]:
          handleMessageLeaderboard(ws, message);
          break;
        case Message.MessageType["request_game"]:
          handleMessageRequestGame(ws, message);
          break;
        case Message.MessageType["register_router"]:
          handleMessageRegisterRouter(ws, message);
          break;
        case Message.MessageType["game_over"]:
          handleMessageGameOver(ws, message);
          break;
        default:
          console.log("Matchmaker received invalid message:", message);
          break;
      }
    } catch (e) {
      console.log("Message is not valid JSON:", e);
    }
  });
});

/**
 * This function sends the top ten players to the specified websocket.
 *
 * @param ws      the websocket to send the top ten players to.
 * @param message the message requesting we send the top ten players.
 */
var handleMessageLeaderboard = function (ws, message) {
  DBManager.getSortedData(function (data) {
    var leaderboard = []
    for (var i = 0; i < data.length || i < 10; i++) {
      leaderboard.push({
        username: data[i]["Name"],
        score: data[i]["Score"]
      });
    }

    ws.send(JSON.stringify(new Message.MessageLeaderboard(leaderboard)));
  });
};

/**
 * This function adds the player requesting a game to the queue of
 * waiting players and emits an event to the matching object.
 *
 * @param ws      the websocket to send a response to.
 * @param message the message requesting a game.
 */
var handleMessageRequestGame = function (ws, message) {
  waiting_players.push({
    ws: ws,
    player: message.player
  });
  checkForMatch();
};

/**
 * This function registers a router server.
 *
 * @param ws      the websocket to send a response to.
 * @param message the message registering the specified router server.
 */
var handleMessageRegisterRouter = function (ws, message) {
  routers[message.address] = {
    game_count: 0,
    ws: ws
  };
  checkForMatch();
};

/**
 * This function updates the scores in the database once a game is over.
 *
 * @param ws      the websocket to send a response to.
 * @param message the message telling us a game is over.
 */
var handleMessageGameOver = function (ws, message) {
  // Update ELO scores for each player.
  DBManager.getUserWithTokenID(message.winner.token_id, function (winner_data) {
    DBManager.getUserWithTokenID(message.loser.token_id, function (loser_data) {
      if (winner_data.length > 0 && loser_data.length > 0) return;
      var ra = winner_data[0]["Score"], rb = loser_data[0]["Score"];
      var Ra = Math.exp(10, ra / 400), Rb = Math.exp(10, rb / 400);
      var Ea = Ra / (Ra + Rb), Eb = Rb / (Ra + Rb);
      var Sa = 1, Sb = 0;
      var k = 15;

      // Updated ELO scores.
      var raa = ra + config.matchmaker.elo_k * (Sa - Ea);
      var rbb = rb + config.matchmaker.elo_k * (Sb - Eb);
      DBManager.updateScore(message.winner.token_id, raa, function () {
        DBManager.updateScore(message.loser.token_id, rbb);
      });
    });
  });
};

/**
 * This function checks for a game match.
 */
var checkForMatch = function () {
  if (routers.keys.length <= 0) return;
  while (waiting_players.length >= 2) {
    var router_server = getRouter();

    var colours = getRandomColours();
    waiting_players[0].colour = colours[0];
    waiting_players[1].colour = colours[1];

    var message = new Message.MessageGame(
      next_game_id++,
      [ waiting_players[0], waiting_players[1] ],
      config.matchmaker.round_time,
      router_server.address
    );

    router_server.ws.send(JSON.stringify(message));
    waiting_players[0].ws.send(JSON.stringify(message));
    waiting_players[1].ws.send(JSON.stringify(message));

    waiting_players.splice(0, 2);
  }
};

/**
 * This function returns the router serving the fewest games.
 *
 * @return the router serving the fewest games.
 */
var getRouter = function () {
  if (routers.keys.length < 1) return;
  var router = routers[routers.keys[0]];
  router.address = routers.keys[0];

  for (var i = 1; i < routers.keys.length; i++) {
    if (routers[routers.keys[i]].game_count < router.game_count) {
      router = routers[routers.keys[i]];
      router.address = routers.keys[i];
    }
  }

  return router;
};

/**
 * This function returns the player colours in a random order.
 *
 * @return the player colours in a random order.
 */
var getRandomColours = function () {
  var i = Math.round(Math.random());
  if (i == 0) {
    return [ Colour["red"], Colour["white"] ];
  } else {
    return [ Colour["white"], Colour["red"] ];
  }
};
