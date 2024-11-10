import express from "express";
import { promisePool } from "../db.js"; 

const app = express.Router();


app.use(express.json()); 

// app.post("/quizzes", async (req, res) => {
//     const { course_id, title, description } = req.body;
  
//     const checkQuery = "SELECT * FROM quizzes WHERE course_id = ?";
//     try {
//       const [existingQuiz] = await promisePool.query(checkQuery, [course_id]);
      
//       if (existingQuiz.length > 0) {
//         return res.status(400).json({ error: "A quiz already exists for this course." });
//       }
  
      
//       const query =
//         "INSERT INTO quizzes (course_id, title, description) VALUES (?, ?, ?)";
//       const [results] = await promisePool.query(query, [
//         course_id,
//         title,
//         description,
//       ]);
//       res.status(201).json({ quiz_id: results.insertId });
//     } catch (err) {
//       return res.status(500).json({ error: err.message });
//     }
//   });
  

app.get("/quizzes", async (req, res) => {
  try {
    const [results] = await promisePool.query("SELECT * FROM quizzes");
    res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


app.get("/quizzes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await promisePool.query(
      "SELECT * FROM quizzes WHERE quiz_id = ?",
      [id]
    );
    if (results.length === 0) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// app.put("/quizzes/:id", async (req, res) => {
//     const { id } = req.params;
//     const { title, description } = req.body;
  
//     const query =
//       "UPDATE quizzes SET title = ?, description = ? WHERE quiz_id = ?";
//     try {
//       const [results] = await promisePool.query(query, [
//         title,
//         description,
//         id,
//       ]);
  
//       if (results.affectedRows === 0) {
//         return res.status(404).json({ error: "Quiz not found" });
//       }
  
//       res.status(200).json({ message: "Quiz updated successfully" });
//     } catch (err) {
//       return res.status(500).json({ error: err.message });
//     }
//   });
  

//   app.delete("/quizzes/:id", async (req, res) => {
//     const { id } = req.params;
//     try {
//       const [results] = await promisePool.query(
//         "DELETE FROM quizzes WHERE quiz_id = ?",
//         [id]
//       );
//       if (results.affectedRows === 0) {
//         return res.status(404).json({ error: "Quiz not found" });
//       }
//       res.status(200).json({ message: "Quiz deleted successfully" });
//     } catch (err) {
//       return res.status(500).json({ error: err.message });
//     }
//   });
  

export default app;
