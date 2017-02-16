var sql = require("sqlite3");

/**
 * This constructs a DatabaseManager.
 * It creates a connection with the database.
 * 
 * @param path to the database file
 */
var DatabaseManager = function (name) {  
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
 * This inserts the data for one user into the database.
 * 
 * @param user which should have the form {"Token_ID":string, "Name": string, "Score":Integer}
 * @param callback only used in testing is a function which 
 * takes as parameter a boolean (true if query succeded false otherwise)
 * @return true if object is of correct form and query is run or false if object misses some property 
 */
DatabaseManager.prototype.insertUser = function(user, callback) {
  if(!("Token_ID" in user)) {
    return false;
  } else if (!("Name" in user)) {
    return false;
  } else if (!("Score" in user)) {
    return false;
  } else {
    var stmt = this.db.prepare("INSERT INTO leaderboard VALUES (?, ?, ?)", callback.bind(null, true));
    stmt.run(user["Token_ID"], user["Name"], user["Score"]);
    stmt.finalize();
    return true;
  }
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
