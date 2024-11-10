import express from "express";
import { promisePool } from "../db.js";

const app = express.Router();

// POST route to create a user quiz score
app.post("/user-quiz-scores", async (req, res) => {
  const { user_id, quiz_id, score } = req.body;
  const query =
    "INSERT INTO user_quiz_scores (user_id, quiz_id, last_score) VALUES (?, ?, ?)";
  try {
    const [results] = await promisePool.query(query, [
      user_id,
      quiz_id,
      score,
    ]);
    res.status(201).json({ user_quiz_score_id: results.insertId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET route to fetch all user quiz scores for a specific user
app.get("/user-quiz-scores/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const [results] = await promisePool.query(
      "SELECT * FROM user_quiz_scores WHERE user_id = ?",
      [user_id]
    );
    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT route to update a user quiz score by ID
app.put("/user-quiz-scores/:id", async (req, res) => {
  const { id } = req.params;
  const { score } = req.body;
  const query =
    "UPDATE user_quiz_scores SET score = ? WHERE user_quiz_score_id = ?";
  try {
    const [results] = await promisePool.query(query, [score, id]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User quiz score not found" });
    }
    res.status(200).json({ message: "Score updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE route to delete a user quiz score by ID
app.delete("/user-quiz-scores/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await promisePool.query(
      "DELETE FROM user_quiz_scores WHERE user_quiz_score_id = ?",
      [id]
    );
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User quiz score not found" });
    }
    res.status(200).json({ message: "Score deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default app;
