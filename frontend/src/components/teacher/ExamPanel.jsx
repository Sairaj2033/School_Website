import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';

const ExamPanel = () => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, coursesRes] = await Promise.all([
          api.get('/exams'),
          api.get('/courses')
        ]);
        setExams(examsRes.data.data);
        setCourses(coursesRes.data.data);
      } catch (err) {
        console.error("Failed to fetch exams/courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateExam = (courseId) => {
    if (!courseId) {
      alert("Please select a course to create an exam for.");
      return;
    }
    navigate(`/teacher/courses/${courseId}/exam/new`);
  };

  if (loading) return <div className="p-4 text-center">Loading exams...</div>;

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">My Exams & Courses</h2>
        <div className="flex space-x-2">
          <select id="courseSelect" className="border rounded px-2 py-1" defaultValue="">
            <option value="" disabled>Select a Course</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <button 
            onClick={() => handleCreateExam(document.getElementById('courseSelect').value)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Create Exam
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {exams.length > 0 ? exams.map(exam => (
          <div key={exam._id} className="border rounded-lg p-4 hover:shadow-md transition">
            <h3 className="font-semibold text-lg">{exam.title}</h3>
            <p className="text-sm text-gray-500 mb-2">{exam.course?.name || "Unknown Course"}</p>
            <div className="flex justify-between text-xs text-gray-600 mb-3">
              <span>⏱ {exam.timeLimit} mins</span>
              <span>❓ {exam.questions.length} questions</span>
            </div>
            <div className="flex space-x-2">
              <span className={`px-2 py-1 rounded text-xs ${exam.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {exam.isPublished ? 'Published' : 'Draft'}
              </span>
              <button 
                onClick={() => navigate(`/teacher/exam/${exam._id}/submissions`)}
                className="text-blue-600 text-xs font-medium hover:underline ml-auto"
              >
                View Submissions
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-2 text-center text-gray-500 py-8">
            No exams found. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamPanel;
