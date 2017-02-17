'use strict';

describe("database tests", function() {
  var DatabaseManager = require("../database-manager");
  var manager = new DatabaseManager("site/server/test/test.db");
  var testData = [{
    "Token_ID": "1_test",
    "Name" : "testuser1",
    "Score" : 1
  }];
  beforeAll(function(done) {
    manager.deleteAllEntries(done);
  });

  it("inserts user of correct form without errors", function (done) {
    var query = manager.insertUser(testData[0], function(err) {
      expect(err).toEqual(null);
      done();
    });
  })

  it("throws errors when inserting users of incorect form", function (done) {
    var wrongUser = {
      "bad" : "wrongparam"
    };
    var query = manager.insertUser(wrongUser, function (err) {
      expect(err).not.toEqual(null);
      done();
    });
  })

  it("return all data from the table correctly", function (done) {
    manager.getAllData(function(err, data) {
      expect(data).toEqual(testData);
      done();
    })
  })

  it("changes the score of a user in the table", function(done) {
    manager.updateScore("1_test", 2575, function(err) {
      expect(this.changes).toBeGreaterThan(0);
      done();
    })
  })

  it("does not change the score of a user not in the table", function(done) {
    manager.updateScore("randomID", 1323, function(err) {
      expect(this.changes).toBe(0);
      done();
    })
  })

  it("updated the data correctly", function (done) {
    manager.getAllData(function(err, data) {
      expect(data).toEqual([{
        "Token_ID": "1_test",
        "Name" : "testuser1",
        "Score" : 2575
      }]);
      done();
    })
  })

});
