const Course = require("../models/Course");

exports.createCourse = async (req, res) => {
  try {
    const { name, description } = req.body;
    const course = new Course({
      name,
      description,
      teacher: req.user.id,
    });
    await course.save();
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
