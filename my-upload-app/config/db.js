// config/db.js
const mysql = require('mysql2');

// Buat pool koneksi (disarankan untuk production)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',        // isi dengan password MySQL Anda
  database: 'gps_tracker', // ganti dengan nama DB
  // optional: port: 3306,
  // optional: multipleStatements: true,
});

module.exports = pool.promise();
