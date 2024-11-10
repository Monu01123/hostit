import express from "express";
import { promisePool } from "../db.js";

const app = express.Router();

// POST route to create a quiz option
app.post("/quiz-options", async (req, res) => {
  const { question_id, option_text, is_correct } = req.body;
  const query =
    "INSERT INTO quiz_options (question_id, option_text, is_correct) VALUES (?, ?, ?)";
  try {
    const [results] = await promisePool.query(query, [
      question_id,
      option_text,
      is_correct,
    ]);
    res.status(201).json({ option_id: results.insertId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET route to fetch all options for a specific question
app.get("/quiz-options/:question_id", async (req, res) => {
  const { question_id } = req.params;
  try {
    const [results] = await promisePool.query(
      "SELECT * FROM quiz_options WHERE question_id = ?",
      [question_id]
    );
    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET route to fetch a specific quiz option by ID
app.get("/quiz-options/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await promisePool.query(
      "SELECT * FROM quiz_options WHERE option_id = ?",
      [id]
    );
    if (results.length === 0) {
      return res.status(404).json({ error: "Option not found" });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT route to update a quiz option
app.put("/quiz-options/:id", async (req, res) => {
  const { id } = req.params;
  const { option_text, is_correct } = req.body;
  const query =
    "UPDATE quiz_options SET option_text = ?, is_correct = ? WHERE option_id = ?";
  try {
    const [results] = await promisePool.query(query, [
      option_text,
      is_correct,
      id,
    ]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Option not found" });
    }
    res.status(200).json({ message: "Option updated successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE route to delete a quiz option by ID
app.delete("/quiz-options/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await promisePool.query(
      "DELETE FROM quiz_options WHERE option_id = ?",
      [id]
    );
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Option not found" });
    }
    res.status(200).json({ message: "Option deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default app;
