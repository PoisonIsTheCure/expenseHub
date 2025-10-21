import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadReceipts } from '../middleware/upload';
import path from 'path';
import fs from 'fs';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload files
router.post('/upload', uploadReceipts, (req, res) => {
  try {
    if (!req.files || (req.files as any[]).length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files as any[];
    const uploadedFiles = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `${file.filename}`, // Store relative path, frontend will prefix with VITE_UPLOADS_URL
    }));

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      message: 'Upload failed',
      error: error.message,
    });
  }
});

// Get upload data
router.get('/upload/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Get MIME type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    // Set headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error: any) {
    console.error('Error serving attachment:', error);
    res.status(500).json({
      message: 'Error serving attachment',
      error: error.message,
    });
  }
});

export default router;