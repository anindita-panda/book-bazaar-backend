const express = require("express"); //import express
const app = express(); //create express app
const port = 5000; //port we will listen on
const cors = require("cors");

//middleware
app.use(
	cors({
		methods: "GET, POST, PUT, PATCH, DELETE",
	})
);

app.use(express.json());

app.get("/", (req, res) => {
	//Define a Route : when we receive a get request to our endpoint
	res.send("Hello World!"); //we return a response with 'Hello World!'
});

//mongodb configurations
/* this code connects to a MongoDB database, sets up an Express.js route to handle book uploads, and pings the database server to confirm the connection. It's part of a server-side application that interacts with a MongoDB database to manage a collection of books. */

const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
const uri =
	"mongodb+srv://mern-book-store:mongo@cluster0.irwukkm.mongodb.net/?retryWrites=true&w=majority";

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
		console.log("inside run - try");
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();

		console.log("after client connect");

		//Create a collection of documents
		const bookCollections = client.db("BookInventory").collection("books");

		// insert a book to the db : post method
		app.post("/upload-book", async (req, res) => {
			const data = req.body;
			const result = await bookCollections.insertOne(data);
			res.send(result);
		});

		//get all books from the db
		// app.get("/all-books", async (req, res) => {
		//   const books = bookCollections.find();
		//   const result = await books.toArray();
		//   res.send(result);
		// });

		//update a book data : patch or update methods
		app.put("/book/:id", async (req, res) => {
			const id = req.params.id;

			const updateBookData = req.body;
			const filter = {_id: new ObjectId(id)};
			const options = {upsert: true}; // if the book with the specified ID doesn't exist, it will be created.

			const updateDoc = {
				// specifies the changes to be made using the $set operator.
				$set: {
					...updateBookData,
				},
			};

			//update
			const result = await bookCollections.updateOne(
				filter,
				updateDoc,
				options
			);
			res.send(result);
		});

		//delete a book from the db : delete method
		app.delete("/book/:id", async (req, res) => {
			const id = req.params.id;
			const filter = {_id: new ObjectId(id)};
			const result = await bookCollections.deleteOne(filter);
			res.send(result);
		});

		//find by category
		app.get("/all-books", async (req, res) => {
			console.log("all books routed");
			let query = {};
			if (req.query?.category) {
				query = {category: req.query.category};
			}
			const result = await bookCollections.find(query).toArray();
			res.send(result);
		});

		// to get a single book data
		app.get("/book/:id", async (req, res) => {
			const id = req.params.id;
			const filter = {_id: new ObjectId(id)};
			const result = await bookCollections.findOne(filter);
			res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db("admin").command({ping: 1});
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
		console.log("inside finally");
	}
}

run().catch(console.dir);

app.listen(port, () => {
	//start a server on port 5000
	console.log(`Server is running on port: ${port}`);
});
