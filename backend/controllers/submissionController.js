const Submission = require("../models/Submission");
const Exam = require("../models/Exam");

exports.submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { answers, isAutoSubmitted, cheatWarnings } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, error: "Exam not found" });

    // Auto-grade MCQs
    let score = 0;
    answers.forEach((studentAns) => {
      const question = exam.questions.id(studentAns.questionId);
      if (question && question.type === "MCQ") {
        if (studentAns.providedAnswer === question.correctAnswer) {
          score += question.points || 1;
        }
      }
    });

    const submission = new Submission({
      exam: examId,
      student: req.user.id,
      answers,
      score,
      cheatWarnings: cheatWarnings || 0,
      isAutoSubmitted: isAutoSubmitted || false,
    });

    await submission.save();
    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.logWarning = async (req, res) => {
  // We can just return success, client will increment local count and send final on submit
  res.status(200).json({ success: true, message: "Warning logged" });
};

exports.getSubmissions = async (req, res) => {
  try {
    const { examId } = req.params;
    const submissions = await Submission.find({ exam: examId }).populate('student', 'name email');
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
