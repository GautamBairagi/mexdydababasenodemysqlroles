const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware } = require("../middlewares/auth");

router.get("/roomactivity", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT room_activity.*, u.first_name, u.last_name
       FROM room_activity
       INNER JOIN users u ON room_activity.user_id = u.id`
    );
    
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/commentactivity", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT comments_activity.* , u.first_name, u.last_name FROM comments_activity INNER JOIN users u ON comments_activity.user_id = u.id"
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/medicineactivity", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query( "SELECT medicine_activity.* , u.first_name, u.last_name FROM medicine_activity INNER JOIN users u ON medicine_activity.user_id = u.id");
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/milestoneactivity", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("SELECT milestone_activity.* , u.first_name, u.last_name FROM milestone_activity INNER JOIN users u ON milestone_activity.user_id = u.id");
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/taskactivity", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("SELECT task_activity.* , u.first_name, u.last_name FROM task_activity INNER JOIN users u ON task_activity.user_id = u.id");
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/statusactivity", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("SELECT status_activity.* , u.first_name, u.last_name FROM status_activity INNER JOIN users u ON status_activity.user_id = u.id");
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/settingactivity", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("SELECT settings_activity.* , u.first_name, u.last_name FROM settings_activity INNER JOIN users u ON settings_activity.user_id = u.id");
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
