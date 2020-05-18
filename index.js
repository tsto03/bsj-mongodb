const express = require('express');
const body_parser = require('body-parser');
const mongodb = require('mongodb');

const PORT = 3000;
const app = express();
// Set the View Engine
app.set('view engine', 'ejs');

// Use body Parser in middle-ware
app.use(body_parser.json());
app.use(body_parser.urlencoded( {extended: true} ));


// Declare any constants or variables here for Database
let db_handler;
const DB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'bsj'
const COLLECTION_NAME = 'companies'; 

app.listen(PORT, () => {
    console.log(`Server Started on Port: ${PORT}`);

    // Step 4.
    // Here you should create a connection with your database
    mongo_client = mongodb.MongoClient; 
    // Upon success, print a message saying "Database Connected"
    mongo_client.connect(DB_URL, (err, db_client) => {
        if (err) {
            console.log("Error: " + err); 
        }
        else {
            console.log("Database Connected"); 
            
            // Use db_handler for future use
            db_handler = db_client.db(DB_NAME); 
        };
    });
    // Upon success, you should also connect to the 'bsj' database.
    
});

// From here on, we can start writing our routes

app.get('/', (req, res) => {
    res.render("index");
});

app.get('/view/:company_id', (req, res) => {
    const parameters = req.params;
    const c_name = parameters['company_id'];
    // A better way to do the following is using findOne method. 
    // You can find information here https://www.w3schools.com/nodejs/nodejs_mongodb_find.asp
    db_handler.collection(COLLECTION_NAME).find({ name: c_name }).toArray((err, result) => {
        if (err) {
            res.send("Company not found");
            console.log(err);
        }
        else {
            res.render('company', {
                'single_company': result[0]
            });
        }
    });
});

app.get('/updateCompany/:company_id', (req, res) => {
    const parameters = req.params;
    const c_name = parameters['company_id'];

    const new_values = { $set: { hiring: 'Yes' } };
    db_handler.collection(COLLECTION_NAME).updateOne({ name: c_name }, new_values, (err, result) => {
        if (err) {
            res.send("Could not fetch hiring info on company");
            console.log(err);
        }
        else {
            res.redirect('/view/company_id');
            console.log(`${c_name} is hiring!`); 
        }
    });
});

app.get('/delete/:company_id', (req, res) => {
    const parameters = req.params;
    const c_name = parameters['company_id'];
    db_handler.collection(COLLECTION_NAME).deleteOne({ name: c_name }, (err, result) => {
        if (err) {
            res.send("Could not delete the company");
            console.log(err);
        }
        else {
            res.redirect('/jobs');
        }

    });
});


app.get('/jobs', (req, res) => {
    // In Step 7, we will fetch data from Database here and send to jobs.ejs page using an array called all_companies
    db_handler.collection(COLLECTION_NAME).find({ }).toArray( (err, result) => {
        if(err) {
            console.log(err);
        } else {
            console.log(result); 
            res.render('jobs', {
                'all_companies': result
            });
        };
    });

});

app.post('/add', (req, res) => {
    // This is where you will get a POST request on the '/add' route. 
    // Step 5. Add your logic here to add a new company to the database.

    const form_data = req.body;
    console.log(req.body); 

    let company_id = parseInt(form_data['company_id']); 
    const name = form_data['name'];
    const description = form_data['description'];
    const logo_url = form_data['logo_url']; 
    

    const my_obj = {
        company_id: company_id,
        name: name,
        description: description,
        logo_url: logo_url
    };
    console.log(my_obj); 

    db_handler.collection(COLLECTION_NAME).insertOne(my_obj, (error, result) => {
        if(error) {
            console.log(error);
        } else {
            console.log("Company inserted");
            // send response to browser once we are done with db
            res.redirect('/jobs');
        }
    });
});


