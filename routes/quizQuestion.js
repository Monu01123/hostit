import express from "express";
import { promisePool } from "../db.js";

const app = express.Router();

// POST route to create a quiz question for a course
app.post("/quiz-questions", async (req, res) => {
  const { course_id, question_text } = req.body;
  const query =
    "INSERT INTO quiz_questions (course_id, question_text) VALUES (?, ?)";
  try {
    const [results] = await promisePool.query(query, [
      course_id,
      question_text,
    ]);
    res.status(201).json({ question_id: results.insertId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


// GET route to fetch all quiz questions for a specific course
app.get("/quiz-questions/:course_id", async (req, res) => {
  const { course_id } = req.params;
  try {
    const [results] = await promisePool.query(
      `SELECT qq.* FROM quiz_questions qq
       JOIN quizzes q ON qq.quiz_id = q.quiz_id
       WHERE q.course_id = ?`,
      [course_id]
    );
    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


// GET route to fetch a specific quiz question by ID
app.get("/quiz-questions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await promisePool.query(
      "SELECT * FROM quiz_questions WHERE question_id = ?",
      [id]
    );
    if (results.length === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT route to update a quiz question for a course
app.put("/quiz-questions/:id", async (req, res) => {
  const { id } = req.params;
  const { question_text } = req.body;
  const query =
    "UPDATE quiz_questions SET question_text = ? WHERE question_id = ?";
  try {
    const [results] = await promisePool.query(query, [
      question_text,
      id,
    ]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(200).json({ message: "Question updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE route to delete a quiz question by ID
app.delete("/quiz-questions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await promisePool.query(
      "DELETE FROM quiz_questions WHERE question_id = ?",
      [id]
    );
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default app;
