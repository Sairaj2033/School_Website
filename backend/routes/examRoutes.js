const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { protect } = require('../middleware/Auth');
const verifyRole = require('../middleware/verifyRole');

router.post('/', protect, verifyRole('teacher', 'admin'), examController.createExam);
router.get('/', protect, examController.getAllExams);
router.get('/course/:courseId', protect, examController.getExamsForCourse);
router.get('/:id', protect, examController.getExam);

module.exports = router;
