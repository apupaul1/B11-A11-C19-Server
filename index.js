const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

const admin = require("firebase-admin");

const decoded = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf8')
const serviceAccount = JSON.parse(decoded)

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rbn9qen.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = authHeader.split("Bearer ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.decoded = decoded;
    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
};

const verifyTokenEmail = (req, res, next) => {
  if (req.query.email !== req.decoded.email) {
    return res.status(403).send({ message: "Forbidden Access" });
  }
  next();
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const booksCollection = client.db("bookNest").collection("books");
    const usersCollection = client.db("bookNest").collection("users");
    const reviewsCollection = client.db("bookNest").collection("reviews");

    // Reading Status Update PATCH API

    app.patch("/books/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;

      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: updateData,
      };

      const result = await booksCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // all books api
    app.get("/books", async (req, res) => {
      const cursor = booksCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // books api

    app.get(
      "/books/mybooks",
      verifyFirebaseToken,
      verifyTokenEmail,
      async (req, res) => {
        const email = req.query.email;

        console.log(("req header", req.headers));
        const query = {};
        if (email) {
          query.user_email = email;
        }

        const cursor = booksCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      }
    );

    // Book Details api

    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.findOne(query);
      res.send(result);
    });

    // Add book api

    app.post("/books", async (req, res) => {
      const newBook = req.body;
      const result = await booksCollection.insertOne(newBook);
      res.send(result);
    });

    // POST API for adding a user

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // GET API for users

    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    // Create DELETE API

    app.delete("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await booksCollection.deleteOne(query);
      res.send(result);
    });

    // Update Book API

    app.put("/books/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedBook = req.body;
      const updatedDoc = {
        $set: updatedBook,
      };
      const result = await booksCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // Upvote Update PATCH API
    // app.patch("/books/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const { upvote } = req.body;
    //   const filter = { _id: new ObjectId(id) };
    //   const updatedDoc = {
    //     $set: { upvote: upvote }, // set upvote to the new value
    //   };

    //   const result = await booksCollection.updateOne(filter, updatedDoc);
    //   res.send(result);
    // });

    // POST API for adding a new review

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    // GET API for Reviews

    app.get("/reviews", async (req, res) => {
      const { book_id } = req.query;
      const query = book_id ? { book_id } : {};
      const reviews = await reviewsCollection.find(query).toArray();
      res.send(reviews);
    });

    // GET API for Reviews by Book ID

    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const result = await reviewsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Delete Review API

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });

    // Edit Review API

    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const updatedReview = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          review_text: updatedReview.review_text,
        },
      };
      const result = await reviewsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Book is incoming on server.");
});

app.listen(port, () => {
  console.log(`Book is incoming on port ${port}`);
});
