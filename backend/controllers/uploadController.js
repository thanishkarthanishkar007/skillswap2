const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// ── POST /api/upload/certificate ──────────────────────────────
// Uploads a certificate file and saves the path to the user's profile
const uploadCertificate = async (req, res) => {
  try {
    // No file uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a PDF, JPG, or PNG file.'
      });
    }

    const file = req.file;
    const userId = req.user?._id;

    // Build the public URL path
    const fileUrl = `/uploads/${file.filename}`;

    // If user is authenticated, save to their profile
    if (userId) {
      // If user had a previous certificate, delete the old file
      const user = await User.findById(userId);
      if (user && user.skillProof) {
        const oldFilePath = path.join(__dirname, '..', user.skillProof);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update user record
      await User.findByIdAndUpdate(userId, {
        skillProof: fileUrl,
        skillProofOriginalName: file.originalname,
        skillProofMimeType: file.mimetype,
        isVerified: true  // Mark as verified after certificate upload
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Certificate uploaded successfully!',
      file: {
        url: fileUrl,
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
      }
    });

  } catch (err) {
    // Clean up uploaded file on error
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    console.error('Certificate upload error:', err);
    return res.status(500).json({ success: false, message: 'Upload failed. Please try again.' });
  }
};

// ── POST /api/upload/certificate-temp ────────────────────────
// Uploads certificate without requiring auth (used during registration)
// Returns a temp file path that gets associated after account creation
const uploadCertificateTemp = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded.'
      });
    }

    const file = req.file;
    const fileUrl = `/uploads/${file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Certificate uploaded! It will be linked to your account after registration.',
      file: {
        url: fileUrl,
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
      }
    });

  } catch (err) {
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    return res.status(500).json({ success: false, message: 'Upload failed. Please try again.' });
  }
};

// ── DELETE /api/upload/certificate ───────────────────────────
// Remove certificate from user profile and delete the file
const deleteCertificate = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.skillProof) {
      const filePath = path.join(__dirname, '..', user.skillProof);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      await User.findByIdAndUpdate(req.user._id, {
        skillProof: '', skillProofOriginalName: '', skillProofMimeType: '', isVerified: false
      });
    }

    return res.json({ success: true, message: 'Certificate removed successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Helpers ───────────────────────────────────────────────────
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

module.exports = { uploadCertificate, uploadCertificateTemp, deleteCertificate };
