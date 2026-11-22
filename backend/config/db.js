const mysql = require("mysql2");

// Create a connection to MySQL
const pool = mysql.createPool({
  host: "localhost", // Change if using a cloud database
  user: "root", // Your MySQL username
  password: "", // Your MySQL password
  database: "dot", // Your database name
  waitForConnections: true,
  connectionLimit: 10, // Number of connections in the pool
  queueLimit: 0,
});

// Promisify the connection for async/await support
const db = pool.promise();

module.exports = db;
