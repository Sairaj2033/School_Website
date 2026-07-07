require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const Exam = require("../models/Exam");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URL);

  const teacher = await User.findOne({ role: "teacher" });
  if (!teacher) {
    console.log("No teacher found. Run seedTestUsers.js first.");
    process.exit(1);
  }

  // Create a course
  const course = await Course.create({
    name: "Test Course",
    description: "Course for testing exams",
    teacher: teacher._id
  });

  // Create an exam
  const exam = await Exam.create({
    title: "Sample Exam",
    description: "A test exam",
    course: course._id,
    creator: teacher._id,
    timeLimit: 1, // 1 minute to test timeout easily
    isPublished: true,
    questions: [
      {
        questionText: "What is 2 + 2?",
        type: "MCQ",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4",
        points: 1
      },
      {
        questionText: "Explain how gravity works briefly.",
        type: "ShortAnswer",
        correctAnswer: "mass attracts mass",
        points: 2
      }
    ]
  });

  console.log("Seeding complete!");
  console.log(`\nTeacher Exam Builder URL:\nhttp://localhost:5173/teacher/courses/${course._id}/exam/new`);
  console.log(`\nStudent Exam Taking URL:\nhttp://localhost:5173/student/exam/${exam._id}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
