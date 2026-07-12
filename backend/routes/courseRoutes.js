const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect } = require('../middleware/Auth');
const verifyRole = require('../middleware/verifyRole');
const multiLevelCache = require('../middleware/cacheMiddleware');

router.post('/', protect, verifyRole('teacher', 'admin'), courseController.createCourse);
router.get('/', protect, multiLevelCache(60), courseController.getCourses);

module.exports = router;
