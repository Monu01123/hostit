import React, { useState, useEffect } from "react";
import axiosInstance from "../../axiosconfig";

const CourseQuizManagement = () => {
  const [questionText, setQuestionText] = useState("");
  const [message, setMessage] = useState("");
  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);
  const courseId = 82;
  useEffect(() => {
    if (courseId) {
      fetchQuestions(courseId);
    }
  }, [courseId]);

  // Define the fetchQuestions function
  const fetchQuestions = async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/quiz-questions/${courseId}`);
      setQuestions(response.data);
    } catch (err) {
      setMessage(
        "Error fetching questions: " + err.response?.data?.error || err.message
      );
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!courseId) {
      setMessage("Course ID is required to create a question");
      return;
    }
    try {
      const response = await axiosInstance.post("/api/quiz-questions", {
        course_id: courseId,
        question_text: questionText,
      });
      setMessage(
        `Question created successfully with ID: ${response.data.question_id}`
      );
      setQuestionText("");
      fetchQuestions(courseId);
    } catch (err) {
      setMessage(
        "Error creating question: " + err.response?.data?.error || err.message
      );
    }
  };

  // Handle question update
  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/api/quiz-questions/${editingQuestionId}`, {
        question_text: questionText,
      });
      setMessage("Question updated successfully!");
      setEditingQuestionId(null); // Close the editing form
      setQuestionText("");
      fetchQuestions(courseId); // Refresh the question list after update
    } catch (err) {
      setMessage(
        "Error updating question: " + err.response?.data?.error || err.message
      );
    }
  };

  // Handle question deletion
  const handleDeleteQuestion = async (id) => {
    try {
      await axiosInstance.delete(`/api/quiz-questions/${id}`);
      setMessage("Question deleted successfully!");
      setDeletingQuestionId(null);
      fetchQuestions(courseId); // Refresh the question list after deletion
    } catch (err) {
      setMessage(
        "Error deleting question: " + err.response?.data?.error || err.message
      );
    }
  };

  return (
    <div>
      <h3>Course Quiz Management</h3>

      {/* Message to show feedback */}
      {message && <p>{message}</p>}

      {/* Form to create a new question */}
      <form onSubmit={handleCreateQuestion}>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question"
          rows="4"
          required
        />
        <button type="submit">Create Question</button>
      </form>

      {/* Display the list of quiz questions */}
      <div>
        <h4>Quiz Questions</h4>
        {questions.length > 0 ? (
          <ul>
            {questions.map((question) => (
              <li key={question.question_id}>
                <strong>{question.question_text}</strong>
                <button
                  onClick={() => setEditingQuestionId(question.question_id)}
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeletingQuestionId(question.question_id)}
                >
                  Delete
                </button>
                {/* Edit question form */}
                {editingQuestionId === question.question_id && (
                  <div>
                    <form onSubmit={handleUpdateQuestion}>
                      <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Edit your question"
                        rows="4"
                        required
                      />
                      <button type="submit">Update Question</button>
                    </form>
                  </div>
                )}
                {/* Delete confirmation */}
                {deletingQuestionId === question.question_id && (
                  <div>
                    <p>Are you sure you want to delete this question?</p>
                    <button
                      onClick={() => handleDeleteQuestion(question.question_id)}
                    >
                      Yes
                    </button>
                    <button onClick={() => setDeletingQuestionId(null)}>
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No questions available.</p>
        )}
      </div>
    </div>
  );
};

export default CourseQuizManagement;
