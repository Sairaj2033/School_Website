const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Exam title is required"],
      trim: true,
    },
    description: {
      type: String,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator (Teacher) is required"],
    },
    timeLimit: {
      type: Number, // in minutes
      required: [true, "Time limit is required"],
      min: [1, "Time limit must be at least 1 minute"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    questions: [
      {
        questionText: { type: String, required: true },
        type: { type: String, enum: ["MCQ", "ShortAnswer"], required: true },
        options: [{ type: String }], // Only for MCQ
        correctAnswer: { type: String, required: true }, // For MCQ it's the exact option text. For ShortAnswer, could be a keyword/regex or exact match
        points: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
