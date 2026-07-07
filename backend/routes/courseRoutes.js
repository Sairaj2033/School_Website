const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect } = require('../middleware/Auth');
const verifyRole = require('../middleware/verifyRole');

router.post('/', protect, verifyRole('teacher', 'admin'), courseController.createCourse);
router.get('/', protect, courseController.getCourses);

module.exports = router;
