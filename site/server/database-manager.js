'use strict';

var sql = require("sqlite3");

/**
 * This constructs a DatabaseManager.
 * It creates a connection with the database.
 *
 * @param path to the database file
 */
var DatabaseManager = function(name) {
  this.db = new sql.Database(name);
}


/**
 * This gets all rows from the table and passes them to the callback function.
 *
 * @param callback
 * callback should take as parameters an err and data representing the error returned
 * and the data fetched.
 */
DatabaseManager.prototype.getAllData = function(callback) {
  this.db.all("select * from leaderboard", callback);
}

/**
 * This gets all rows from the table, sorts them by score and passes them to
 * the callback function.
 *
 * @param callback
 * callback should take as parameters an err and data representing the error returned
 * and the data fetched.
 */
DatabaseManager.prototype.getSortedData = function(callback) {
  this.db.all("select * from leaderboard order by Score", callback);
};

/**
 * This inserts the data for one user into the database.
 *
 * @param user which should have the form {"Token_ID":string, "Name": string, "Score":Integer}
 * @param callback to be called after the insertion happens has been added to aid in testing
 *
 */
DatabaseManager.prototype.insertUser = function(user, callback) {
  var stmt = this.db.prepare("INSERT INTO leaderboard VALUES (?, ?, ?)");
  stmt.run(user["Token_ID"], user["Name"], user["Score"], callback);
  stmt.finalize();
}

/**
 * This function selects all users with the given Token_ID from the database.
 *
 * @param Token_ID representing the Token_ID of the user to be searched
 * @param callback to be called on the list of users returned by the query
 *        (should be only one since Token_ID is primary key)
 */
DatabaseManager.prototype.getUserWithTokenID = function(Token_ID, callback) {
  var stmt = this.db.prepare("SELECT * FROM leaderboard WHERE Token_ID = ?");
  stmt.all(Token_ID, callback);
  stmt.finalize();
}

/**
 * This updates the score of a user in the table.
 *
 * @param Token_ID of the user to be updated
 * @param value of the new score must be a number
 * @param callback to be called after the query executes
 */
DatabaseManager.prototype.updateScore = function(Token_ID, value, callback) {
  var stmt = this.db.prepare("UPDATE leaderboard SET Score = ? WHERE Token_ID = ?");
  stmt.run(value, Token_ID, callback);
  stmt.finalize();
}

/**
 * This deletes the all entries from the leaderboard table.
 * SHOULD NOT BE CALLED FROM ANYWHERE ON THE SERVER.
 * Added only to aid in auto testing.
 */
DatabaseManager.prototype.deleteAllEntries = function(callback) {
  this.db.run("Delete from leaderboard", callback);
}

module.exports = DatabaseManager;
