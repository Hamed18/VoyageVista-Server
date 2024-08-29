const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3nkfm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

	// READ all data (whole json data) stored in database
	const SpotsCollection = client.db("VoyageVista").collection("TouristSpots");
    app.get('/TouristSpots', async(req,res) => {
		const cursor = SpotsCollection.find();
		const result = await cursor.toArray();
		res.send(result);
	})
	// READ specifc object (view details card) from all json data
	app.get('/TouristSpots/:id', async(req,res) => {
		const id = req.params.id;
		const query= {_id: new ObjectId(id)}
		const result = await SpotsCollection.findOne(query);
		res.send(result);
	})

	// New Collection
	const AllUsersAddedCollection = client.db("VoyageVista").collection("AllUsersAddedSpots");
	// CREATE: send user input data from server to database. client: Add Spot 
	app.post('/allUsersAddedSpots', async(req,res) => {
		const newSpot = req.body;
		console.log(newSpot);
		const result = await AllUsersAddedCollection.insertOne(newSpot);
		res.send(result);
	})
	// READ: get data from db. client: All Spot page
    app.get('/AllSpots', async(req,res) => {
		const cursor = AllUsersAddedCollection.find();
		const result = await cursor.toArray();
		res.send(result);
	})
	// load data using query parameter
	app.get('/AllSpots/:email', async(req,res) => {
			const email = req.params.email;
			console.log(req.query.email);
			let query = {userEmail : email};
		/*	if (req.query?.email){
				query = {email : req.query.email}
			}  */
			const result = await AllUsersAddedCollection.find(query).toArray();
			res.send(result);
		})
	
	// load single data for update api
	app.get('/AllSpots/:email/:id', async(req,res) => {
		const id = req.params.id;
		const query = {_id: new ObjectId(id)}
		const result = await AllUsersAddedCollection.findOne(query);
		res.send(result);
	})


	// DELETE: delete api to delete a data from My List
	app.delete('/AllSpots/:id', async (req, res) => {
		const id = req.params.id;
		const query = { _id: new ObjectId(id) }
		const result = await AllUsersAddedCollection.deleteOne(query);
		res.send(result);
	})

	

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  //  await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res) => {
	res.send('tourism server is running')
})

app.listen(port, () => {
	console.log(`tourism is running on port ${port}`)
})