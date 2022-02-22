const router = require("express").Router();

const isLoggedIn =require("./../middleware/isLoggedIn")

/* GET home page */
router.get("/", (req, res, next) => {
  const user = req.session.user;
  res.render("index", {user});
});

// MongoAtlas for autocomplete search
const { MongoClient, ObjectId } = require("mongodb");
const MONGO_URI = require("../utils/consts");
const client = new MongoClient(MONGO_URI);
let collection;

const Game = require("../models/Game.model");


(async () => {
  await client.connect();
  collection = client.db("project2").collection("topgames");
})();

router.get("/search", async (request, response) => {
  try {
    
    let result = await collection
      .aggregate([
        {
          $search: {
            autocomplete: {
              query: `${request.query.query}`,
              path: "name",
              fuzzy: {
                maxEdits: 2,
                prefixLength: 3,
              },
            },
          },
        },
      ])  
      .toArray()
    response.send(result);
  } catch (e) {
    response.status(500).send({ message: e.message });
  }
});
router.get("/get/:id", async (request, response) => {
  try {
    let result = await collection.findOne({ _id: ObjectId(request.params.id) });
    response.send(result);
  } catch (e) {
    response.status(500).send({ message: e.message });
  }
});

//Game page
router.get("/game", async (request, response) => {
  try {
    console.log(request.query.name)
    let result = await collection.findOne({ name: request.query.name });
    response.render("game", { result });
    console.log(result)
  } catch (e) {
    response.status(500).send({ message: e.message });
  }
})



module.exports = router;

