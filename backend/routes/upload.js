const express = require('express');
const router = express.Router();
const { handleUploadError } = require('../middleware/upload');
const { uploadCertificate, uploadCertificateTemp, deleteCertificate } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

/**
 * @route  POST /api/upload/certificate
 * @desc   Upload certificate for authenticated user (updates profile)
 * @access Private
 */
router.post('/certificate', protect, handleUploadError, uploadCertificate);

/**
 * @route  POST /api/upload/certificate-temp
 * @desc   Upload certificate during registration (no auth required)
 *         Returns file URL to be sent with registration form data
 * @access Public
 */
router.post('/certificate-temp', handleUploadError, uploadCertificateTemp);

/**
 * @route  DELETE /api/upload/certificate
 * @desc   Remove certificate from user profile
 * @access Private
 */
router.delete('/certificate', protect, deleteCertificate);

module.exports = router;
