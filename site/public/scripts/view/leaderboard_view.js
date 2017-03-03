"use strict";

/**
 * This file defines a view which displays the leaderboard.
 */

/**
 * This constructs a new Leaderboard object.
 *
 * @param leaderboard the element which contains the leaderboard.
 * @param messenger   the messenger with which to communicate with the server.
 */
var Leaderboard = function (leaderboard, messenger) {
  var self = this;
  this.leaderboard = leaderboard;
  messenger.registerListener(MessageType["leaderboard"], displayLeaderboard);
  messenger.send(new MessageLeaderboard());

  var displayLeaderboard = function (message) {
    self.clearRows();
    self.addHeader();
    self.addRows(message.leaderboard);
  };
};

/**
 * This method clears the leaderboard of rows.
 */
Leaderboard.prototype.clearRows = function () {
  while (this.leaderboard.hasChild()) {
    this.leaderboard.removeChild(this.leaderboard.nextChild());
  }
};

/**
 * This method adds the header row to the leaderboard.
 */
Leaderboard.prototype.addHeader = function () {
  var rank = document.createElement("th");
  rank.appendChild(document.createTextNode("Rank"));
  var username = document.createElement("th");
  username.appendChild(document.createTextNode("Username"));
  var score = document.createElement("th");
  score.appendChild(document.createTextNode("Score"));

  var row = document.createElement("tr");
  row.appendChild(rank);
  row.appendChild(username);
  row.appendChild(score);

  this.leaderboard.appendChild(row);
};

/**
 * This method adds the specified rows.
 *
 * @param rows the rows to add to the leaderboard.
 */
Leaderboard.prototype.addRows = function (rows) {
  for (var i = 0; i < rows.length; i++) {
    var rank = document.createElement("td");
    rank.appendChild(document.createTextNode(i + 1));

    var username = document.createElement("td");
    username.appendChild(document.createTextNode(rows[i].username));

    var score = document.createElement("td");
    score.appendChild(document.createTextNode(rows[i].score));

    var row = document.createElement("tr");
    row.appendChild(rank);
    row.appendChild(username);
    row.appendChild(score);

    this.leaderboard.appendChild(row);
  }
};
