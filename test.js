const expect = require("chai").expect;
const axios = require("axios");

describe("API Tests", function() {
  let id, hash, hits;
  describe("/shorten", function() {
    it("should return a shortened URL", done => {
      const request = { url: "https://google.com" };
      axios.post("http://localhost:3000/shorten", request).then(response => {
        id = response.data._id;
        hash = response.data.hash;
        hits = response.data.hits;
        expect(response.status).to.equal(201);
        expect(response.data._id).to.be.ok;
        expect(response.data.hash).to.be.ok;
        done();
      });
    });
    it("should return the same shortened URL for the earlier url", done => {
      const request = { url: "https://google.com" };
      axios.post("http://localhost:3000/shorten", request).then(response => {
        expect(response.status).to.equal(201);
        expect(response.data._id).to.equal(id);
        expect(response.data.hash).to.equal(hash);
        done();
      });
    });
  });

  describe("/:hash", function() {
    it("should redirect the user for an existing hash", done => {
      axios.get("http://localhost:3000/" + hash).then(response => {
        expect(response.data).to.contain("google.com");
        done();
      });
    });
    it("hash is not exist", done => {
      axios.get(`http://localhost:3000/Viaga8eiSS`).catch(error => {
        expect(error.response.status).to.equal(404);
        done();
      });
    });
    it("hits", done => {
      const request = { url: "https://google.com" };
      axios.post("http://localhost:3000/shorten", request).then(response => {
        expect(response.data.hits).to.equal(hits + 1);
        done();
      });
    });
  });
  describe("/hits", function() {
    it("number of hits", done => {
      axios.get(`http://localhost:3000/hits?hash=${hash}`).then(response => {
        expect(response.data.hits).to.equal(hits + 1);
        done();
      });
    });
  });
});

