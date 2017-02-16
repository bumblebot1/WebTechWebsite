describe("database tests", () => {
  var DatabaseManager = require("../database-manager");
  var manager = new DatabaseManager("./site/server/test/test.db");
  beforeAll((done) =>{
    manager.deleteAllEntries(done);
  });

  it("inserts user of correct form", (done) => {
    var query = manager.insertUser({
      "Token_ID": "1_test",
      "Name" : "testuser1",
      "Score" : 1
    }, (result) => {
      expect(result).toEqual(true);
      done();
    });
   
    //if query false means we failed so we need to fail the test
    if(query === false) {
      fail("We failed inserting a user of correct form");
      done();
    }
  })

  it("does not insert users of incorect form", (done) => {
    var query = manager.insertUser({
      "bad": "wrongparam",
    }, () => {
      fail("A query inserting a user of incorect form should fail");
      done();
    })
    if(query === false) {
      expect(query).toEqual(false);
      done();
    }
  })

  it("return all data from the table correctly", (done) => {
    manager.getAllData((err, data) => {
      expect(data).toEqual([{
        "Token_ID": "1_test",
        "Name" : "testuser1",
        "Score" : 1
      }]);
      done();
    })
  })
});
