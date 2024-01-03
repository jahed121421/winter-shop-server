const express = require("express");
var cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://winter:acghypoRosRGwqPd@cluster0.7bfhsu6.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const database = client.db("winter-shop");
    const alldata = database.collection("all-data");
    const cartdata = database.collection("cart-data");
    const userdata = database.collection("user-data");

    // all product route
    app.get("/all-data", async (req, res) => {
      const result = await alldata.find().toArray();
      res.send(result);
    });
    app.post("/save-data", async (req, res) => {
      const body = req.body;
      const result = await alldata.insertOne(body);
      res.send(result);
    });
    // single product detail route
    app.get("/singleproduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await alldata.findOne(query);
      res.send(result);
    });
    //update product route
    app.patch("/update-product/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedoc = {
        $set: {
          description: body.description,
          price: body.price,
          productName: body.productName,
          quantity: body.quantity,
          sallerName: body.sallerName,
        },
      };
      const result = await alldata.updateOne(query, updatedoc);
      res.send(result);
    });
    //user all data
    app.get("/user-data", async (req, res) => {
      const result = await userdata.find().toArray();
      res.send(result);
    });
    // admin check
    app.get("/check-admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userdata.findOne(query);
      res.send({ admin: result.role });
    });
    //saller check
    app.get("/check-saller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userdata.findOne(query);
      res.send({ saller: result.role });
    });
    // make admin
    app.put("/make-admin/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedoc = { $set: { role: "admin" } };
      const result = await userdata.updateOne(query, updatedoc, options);
      res.send(result);
    });
    //make saller
    app.put("/make-saller/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedoc = { $set: { role: "saller" } };
      const result = await userdata.updateOne(query, updatedoc, options);
      res.send(result);
    });

    // post data to user database
    app.post("/user-data-post", async (req, res) => {
      const body = req.body;
      const result = await userdata.insertOne(body);
      res.send(result);
    });

    // own product route
    app.get("/my-data/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await alldata.find(query).toArray();
      res.send(result);
    });

    //delete own post
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await alldata.deleteOne(query);
      res.send(result);
    });

    // cart data route
    app.get("/cart/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await cartdata.find(query).toArray();
      res.send(result);
    });
    //insert cart data
    app.post("/addtocart", async (req, res) => {
      const body = req.body;
      const menuId = body.menuId;
      const findId = { menuId: menuId };
      const findData = await cartdata.findOne(findId);
      if (findData) {
        res.send({ message: "product already added to cart" });
      } else {
        const result = await cartdata.insertOne(body);
        res.send(result);
      }
    });
    //delete cart data
    app.delete("/cart-data-delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartdata.deleteOne(query);
      res.send(result);
    });
    // incrse quantity
    app.patch("/increse-quantity/:id", async (req, res) => {
      const body = req.body;
      const bag = body.bag;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedoc = {
        $set: {
          bag: bag + 1,
          priceperquentity: body.priceperquentity + body.price,
        },
      };
      const result = await cartdata.updateOne(query, updatedoc);
      res.send(result);
    });
    // decrse quantity
    app.patch("/decrese-quantity/:id", async (req, res) => {
      const body = req.body;
      const bag = body.bag;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updatedoc = {
        $set: {
          bag: bag - 1,
          priceperquentity: body.priceperquentity - body.price,
        },
      };
      const result = await cartdata.updateOne(query, updatedoc);
      res.send(result);
    });
    // appoved post route
    app.put("/approved/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const set = {
        $set: {
          status: "approved",
        },
      };
      const removed = {
        $unset: {
          reason: 1,
        },
      };
      const options = { upsert: ture };
      const result = await alldata.updateOne(query, set, removed, options);
      res.send(result);
    });
    //decline post with reason route
    app.put("/decline/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const message = body.message;
      const query = { _id: new ObjectId(id) };
      const set = {
        $set: {
          reason: message,
          status: "decline",
        },
      };
      const options = { upsert: ture };
      const result = await alldata.updateOne(query, set, options);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`<h1>Welcome to our winter shop</h1>`);
});

app.listen(port, () => {
  console.log(`Welcome to winter shop at ${port}`);
});
