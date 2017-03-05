var WebSocket       = require("ws");
var fs              = require("fs");
var http            = require("http");
var https           = require("https");
var config          = require("../../config.js");
var Message         = require("../public/scripts/network/message.js");
var DatabaseManager = require("./database-manager.js");
var GoogleAuth      = require("google-auth-library");

var CLIENT_ID = "845935205653-dl6ulvl06lsmqhshbbf122nc6vducvaf.apps.googleusercontent.com";

// Set up the client object which enables verification of user ids.
var auth = new GoogleAuth;
var client = new auth.OAuth2(CLIENT_ID, "", "");
var DBManager = new DatabaseManager("site/server/leaderboard.db");
var routers = {};
var next_game_id = 0;
var waiting_players = [];

var options = {
    key: fs.readFileSync('site/server/ssl_certs/key.pem'),
    cert: fs.readFileSync('site/server/ssl_certs/cert.pem')
};

// Create the server to use for websockets, this is to allow secure connections.
var http_server;
if (config.use_https) {
  http_server = https.createServer(options).listen(config.matchmaker.port, config.matchmaker.host);
  console.log("Matchmaker running at", config.matchmaker.https_address);
} else {
  http_server = http.createServer().listen(config.matchmaker.port, config.matchmaker.host);
  console.log("Matchmaker running at", config.matchmaker.http_address);
}

// Start the matchmaker websocket server.
var matchmaker_server = new WebSocket.Server({
  server: http_server
});

// Listen for new connections to the server.
matchmaker_server.on("connection", function (ws) {
  ws.on("message", function (message_str, flags) {
    if (flags.binary) return;
    try {
      var message = JSON.parse(message_str);
      switch (message.type) {
        case Message.MessageType["leaderboard"]:
          if (config.debug) console.log("Leaderboard:", message);
          handleMessageLeaderboard(ws, message);
          break;
        case Message.MessageType["request_game"]:
          if (config.debug) console.log("Request game:", message);
          handleMessageRequestGame(ws, message);
          break;
        case Message.MessageType["register_router"]:
          if (config.debug) console.log("Register router:", message);
          handleMessageRegisterRouter(ws, message);
          break;
        case Message.MessageType["game_over"]:
          if (config.debug) console.log("Game over:", message);
          handleMessageGameOver(ws, message);
          break;
        default:
          if (config.debug) console.log("Matchmaker received invalid message:", message);
          break;
      }
    } catch (e) {
      if (config.debug) console.log("Message is not valid JSON:", e);
    }
  });

  ws.on("close", function () {
    var keys = Object.keys(routers);
    for (var i = 0; i < keys.length; i++) {
      if (routers[keys[i]].ws === ws) {
        if (config.debug) console.log("Router at address", keys[i], "closed.");
        routers[keys[i]] = undefined;
      }
    }

    var i = 0;
    while (i < waiting_players.length) {
      if (waiting_players[i].ws === ws) {
        if (config.debug) console.log("Player", waiting_players[i].player, "closed.");
        waiting_players.splice(i, 1);
      } else {
        i++;
      }
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
  DBManager.getSortedData(function (err, data) {
    var leaderboard = []
    for (var i = 0; i < data.length && i < 10; i++) {
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
  var handler = function (e, login) {
    var payload = login.getPayload();
    // Get the unique id for the user.
    var id = payload["sub"];

    message.player.token_id = id;

    // Add the player to the list of waiting players.
    waiting_players.push({
      ws: ws,
      player: message.player
    });

    // Set default score if the player has not got one already.
    DBManager.getUserWithTokenID(id, function (err, data) {
      if (data.length <= 0) {
        DBManager.insertUser({
          "Token_ID": id,
          "Name": message.player.username,
          "Score": 1000
        });
      }
    });

    // Check if we can now create a match.
    checkForMatch();
  };

  // Verify that the given token_id is valid.
  client.verifyIdToken(
    message.player.token_id,
    CLIENT_ID,
    handler
  );
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
  // Reduce the game count for the router.
  var router_server = getRouterServer(ws);
  if (router_server) router_server.game_count--;

  // Update ELO scores for each player.
  DBManager.getUserWithTokenID(message.winner.token_id, function (err1, winner_data) {
    DBManager.getUserWithTokenID(message.loser.token_id, function (err2, loser_data) {
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
  var keys = Object.keys(routers);
  if (keys.length <= 0) return;
  while (waiting_players.length >= 2) {
    var router_server = getRouter();
    router_server.game_count++;

    var colours = getRandomColours();
    waiting_players[0].player.colour = colours[0];
    waiting_players[1].player.colour = colours[1];

    var message = new Message.MessageGame(
      next_game_id++,
      [ { colour: waiting_players[0].player.colour
        , token_id: waiting_players[0].player.token_id
        , username: waiting_players[0].player.username
        },
        { colour: waiting_players[1].player.colour
        , token_id: waiting_players[1].player.token_id
        , username: waiting_players[1].player.username
        }
      ],
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
  var keys = Object.keys(routers);
  if (keys.length < 1) return null;
  var router = routers[keys[0]];
  router.address = keys[0];

  for (var i = 1; i < keys.length; i++) {
    if (routers[keys[i]].game_count < router.game_count) {
      router = routers[keys[i]];
      router.address = keys[i];
    }
  }

  return router;
};

/**
 * This function returns the router server connected via the specified websocket.
 *
 * @param ws the websocket that the router server is connected via.
 * @return   the router server connected via the specified websocket.
 */
var getRouterServer = function (ws) {
  var keys = Object.keys(routers);
  for (var i = 0; i < keys.length; i++) {
    if (routers[keys[i]].ws == ws) return routers[keys[i]];
  }
  return null;
};

/**
 * This function returns the player colours in a random order.
 *
 * @return the player colours in a random order.
 */
var getRandomColours = function () {
  var i = Math.round(Math.random());
  if (i == 0) {
    return [ "red", "white" ];
  } else {
    return [ "white", "red" ];
  }
};
