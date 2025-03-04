// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// 1) SETUP MULTER (untuk file upload)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Folder "uploads" pastikan sudah ada
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Contoh: Buat nama file unik berdasarkan timestamp + nama aslinya
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // ex: .xlsx
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// 2) ROUTE: Upload file
app.post('/upload', upload.single('myfile'), async (req, res) => {
  try {
    // file upload oleh multer ada di req.file
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { filename, originalname, path: filePath } = req.file;

    // Simpan metadata ke DB
    const sql = 'INSERT INTO files (filename, originalname, filepath) VALUES (?, ?, ?)';
    await pool.query(sql, [filename, originalname, filePath]);

    res.status(200).json({
      message: 'File uploaded successfully',
      data: {
        filename, 
        originalname,
        filePath
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 3) ROUTE: Lihat daftar file
app.get('/files', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM files');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 4) ROUTE: Download file by ID
app.get('/download/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const [rows] = await pool.query('SELECT * FROM files WHERE id = ?', [fileId]);

    if (!rows.length) {
      return res.status(404).json({ message: 'File not found' });
    }
    const fileRecord = rows[0];
    // path relatif, mis: "uploads/<filename>"
    res.download(path.join(__dirname, fileRecord.filepath), fileRecord.originalname);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 5) START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
