const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { protect } = require('../middleware/Auth');
const verifyRole = require('../middleware/verifyRole');

router.post('/:examId/submit', protect, verifyRole('student'), submissionController.submitExam);
router.post('/:examId/warning', protect, verifyRole('student'), submissionController.logWarning);
router.get('/exam/:examId', protect, verifyRole('teacher', 'admin'), submissionController.getSubmissions);

module.exports = router;
