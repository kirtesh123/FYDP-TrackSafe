const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const useDBQuery = `USE FYDP`;

// Create the Drivers table
const createTableQuery1 = `
  CREATE TABLE IF NOT EXISTS Drivers (
    KeyID INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    phoneNumber VARCHAR(12) NOT NULL,
    region VARCHAR(30) NOT NULL,
    carModel VARCHAR(50) NOT NULL,
    currentScore INT,
    previousScore INT
  )
`;

// Populate the table with dummy entries
const insertQuery1 = `
INSERT INTO Drivers (KeyID, name, password, email, phoneNumber, region, carModel, currentScore, previousScore)
VALUES
  (1, 'John Doe', 'password123', 'john@example.com', '1234567890', 'North', 'Toyota Camry', 85, 80),
  (2, 'Jane Smith', 'password123', 'jane@example.com', '0987654321', 'South', 'Honda Accord', 90, 88),
  (3, 'Mike Johnson', 'password123', 'mike@example.com', '2345678901', 'East', 'Ford Focus', 75, 78),
  (4, 'Emily Davis', 'password123', 'emily@example.com', '3456789012', 'West', 'Chevrolet Malibu', 82, 84),
  (5, 'Chris Brown', 'password123', 'chris@example.com', '4567890123', 'Central', 'Nissan Altima', 88, 85)
`;

// Create the Sessions table
const createTableQuery2 = `
CREATE TABLE IF NOT EXISTS Sessions (
  KeyID INT,
  sessionID INT,
  time_started TIME,
  time_ended TIME,
  proximity_warnings_vehicles INT,
  proximity_warnings_pedestrians INT,
  speed_violations INT,
  eye_movement INT,  
  traffic_violations INT,
  PRIMARY KEY(KeyID, sessionID, time_started)
)
`;

// Populate the table with dummy entries
const insertQuery2 = `
INSERT INTO Sessions (KeyID, sessionID, time_started, time_ended, proximity_warnings_vehicles, proximity_warnings_pedestrians, speed_violations, eye_movement, traffic_violations)
VALUES
  (1, 1, '08:00:00', '09:00:00', 2, 1, 0, 50, 1),
  (1, 2, '09:00:00', '10:00:00', 1, 0, 1, 45, 0),
  (1, 3, '10:00:00', '11:00:00', 3, 1, 2, 40, 2),
  (1, 4, '11:00:00', '12:00:00', 0, 0, 0, 60, 0),
  (1, 5, '12:00:00', '13:00:00', 2, 1, 1, 55, 1),
  (2, 1, '08:00:00', '09:00:00', 1, 0, 0, 50, 0),
  (2, 2, '09:00:00', '10:00:00', 2, 2, 1, 40, 1),
  (2, 3, '10:00:00', '11:00:00', 3, 1, 2, 45, 2),
  (2, 4, '11:00:00', '12:00:00', 0, 0, 0, 60, 0),
  (2, 5, '12:00:00', '13:00:00', 2, 1, 1, 55, 1),
  (3, 1, '08:00:00', '09:00:00', 1, 0, 0, 50, 0),
  (3, 2, '09:00:00', '10:00:00', 2, 1, 1, 45, 1),
  (3, 3, '10:00:00', '11:00:00', 3, 1, 2, 40, 2),
  (3, 4, '11:00:00', '12:00:00', 0, 0, 0, 60, 0),
  (3, 5, '12:00:00', '13:00:00', 2, 1, 1, 55, 1),
  (4, 1, '08:00:00', '09:00:00', 2, 1, 0, 50, 1),
  (4, 2, '09:00:00', '10:00:00', 1, 0, 1, 45, 0),
  (4, 3, '10:00:00', '11:00:00', 3, 1, 2, 40, 2),
  (4, 4, '11:00:00', '12:00:00', 0, 0, 0, 60, 0),
  (4, 5, '12:00:00', '13:00:00', 2, 1, 1, 55, 1),
  (5, 1, '08:00:00', '09:00:00', 1, 0, 0, 50, 0),
  (5, 2, '09:00:00', '10:00:00', 2, 2, 1, 40, 1),
  (5, 3, '10:00:00', '11:00:00', 3, 1, 2, 45, 2),
  (5, 4, '11:00:00', '12:00:00', 0, 0, 0, 60, 0),
  (5, 5, '12:00:00', '13:00:00', 2, 1, 1, 55, 1)
`;

// Connect to the database
connection.connect((err) => {
  if (err) {
    return console.error('error connecting: ' + err.stack);
  }
  console.log('connected as id ' + connection.threadId);
  
    connection.query(createTableQuery1, (err, results, fields) => {
        if (err) {
        return console.error('error creating table: ' + err.message);
        }
        console.log('Drivers table created successfully');

        connection.query(insertQuery1, (err, results, fields) => {
        if (err) {
            return console.error('error inserting data: ' + err.message);
        }
        console.log('Data inserted into Drivers table successfully');

        // Create and populate Sessions table after Drivers table is done
        connection.query(createTableQuery2, (err, results, fields) => {
            if (err) {
            return console.error('error creating table: ' + err.message);
            }
            console.log('Sessions table created successfully');

            connection.query(insertQuery2, (err, results, fields) => {
            if (err) {
                return console.error('error inserting data: ' + err.message);
            }
            console.log('Data inserted into Sessions table successfully');

            // Close the database connection
            connection.end((err) => {
                if (err) {
                return console.error('error closing connection: ' + err.message);
                }
                console.log('Connection closed successfully');
            });
            });
        });
        });
    });
    });
