const express = require('express');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// app.use(cors()); // Enable CORS
const corsOptions = {
  origin: 'http://localhost:3000', // Allow only this origin
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions)); // Enable CORS with specific options

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();
// const bucketName = process.env.S3_BUCKET_NAME;

const filesDir = path.join(__dirname, 'Files');

// Ensure Files directory exists
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

/*--- S3 APIs --- */

// Endpoint to list files
app.get('/files', async (req, res) => {
  let bucketName = '';
  try {
    let bucket = req.query.bucket;
    switch (bucket) {
      case 'driver' : 
        bucketName = process.env.S3_BUCKET_NAME_DRIVER;
        break;
      case 'road' : 
        bucketName = process.env.S3_BUCKET_NAME_ROAD;
        break;
      case 'data' : 
        bucketName = process.env.S3_BUCKET_NAME_DATA;
        break;
      default : 
        bucketName = '';
        break; 
    }
    const params = {
      Bucket: bucketName,
    };
    const data = await s3.listObjectsV2(params).promise();
    res.json(data.Contents);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint to get a file by key and save it locally if it doesn't exist
app.get('/files/:key', async (req, res) => {
  const fileKey = req.params.key;
  const filePath = path.join(filesDir, fileKey);

  if (fs.existsSync(filePath)) {
    console.log('File already present');
    res.send('File already present');
  } else {
    let bucket = req.query.bucket;
    switch (bucket) {
      case 'driver' : 
        bucketName = process.env.S3_BUCKET_NAME_DRIVER;
        break;
      case 'road' : 
        bucketName = process.env.S3_BUCKET_NAME_ROAD;
        break;
      case 'data' : 
        bucketName = process.env.S3_BUCKET_NAME_DATA;
        break;
      default : 
        bucketName = '';
        break; 
    }
    const params = {
      Bucket: bucketName,
      Key: fileKey,
    };

    try {
      const data = await s3.getObject(params).promise();
      fs.writeFileSync(filePath, data.Body);
      console.log(`File saved to ${filePath}`);
      console.log(JSON.stringify(data, null, 2));
      res.send(`File saved to ${filePath}`);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
});

/*--- SQL APIs ---*/

// Endpoint to get session data
app.get('/sessions', (req, res) => {
  let limit = parseInt(req.query.limit, 10);
  let offset = parseInt(req.query.offset, 10);
  let user = parseInt(req.query.user, 10);
  if (isNaN(user) || user <= 0) {
    user = null; // Handle invalid or missing limit
  }
  if (isNaN(offset) || offset <= 0) {
    offset = null; // Handle invalid or missing limit
  }
  if (isNaN(limit) || limit <= 0) {
    limit = null; // Handle invalid or missing limit
  }
  const basicSelect = 'SELECT * FROM Sessions' + (user?` WHERE KeyID = ${user}`:'');
  const constraints = (limit?' limit ' + limit:'') + (offset?' offset ' + offset:'');
  const query = basicSelect + constraints;
  console.log('Query: ', query);
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Server error');
      return;
    }
    console.log('Data fetched from database:', results); // Log the fetched data
    res.json(results);
  });
});

// Endpoint to get driver data
app.get('/driver', (req, res) => {
  let user = parseInt(req.query.user, 10);
  if (isNaN(user) || user <= 0) {
    user = null; // Handle invalid or missing limit
  }
  const query = 'SELECT * FROM Drivers' + (user?` WHERE KeyID = ${user}`:'');
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Server error');
      return;
    }
    console.log('Data fetched from database:', results); // Log the fetched data
    res.json(results);
  });
});

app.post('/sessions', (req, res) => {
  const data = req.body;
  console.log('Received data:', data);
  // if (!Array.isArray(data)) {
  //     throw new Error('Input data should be an array of objects');
  // }

  const columns = Object.keys(data[0]).join(', ');
  const values = data.map(Object.values);

  const placeholders = data.map(() => `(${new Array(Object.keys(data[0]).length).fill('?').join(', ')})`).join(', ');

  const query = `INSERT INTO Sessions (${columns}) VALUES ${placeholders}`;

  console.log('Executing query:', query);
  console.log('With values:', values.flat());

  db.query(query, values.flat(), (err, results) => {
      if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ message: 'Server error', error: err.message });
          return;
      }
      console.log('Data inserted into database:', results);
      res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
