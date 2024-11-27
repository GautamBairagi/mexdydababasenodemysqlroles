const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware } = require("../middlewares/auth");

router.get("/task", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM tasks");

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/task", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const {
      project_id,
      user_id,
      milestone_id,
      description,
      priority,
      due_date,
      time,
      status,
      task_message,
      comment_count,
      start_date,
      date_created,
      updated_at,
    } = req.body;


    const startDate = new Date(start_date);
    const endDate = new Date(due_date);
    const day = (endDate - startDate + 1) / (1000 * 60 * 60 * 24);

    const TaskData = {
      workspace_id,
      project_id,
      milestone_id,
      day,
      description,
      priority,
      due_date,
      time,
      status,
      task_message,
      comment_count,
      start_date,
      date_created,
      updated_at,
    };

    const [result] = await db.query("INSERT INTO tasks SET ?", TaskData);
    let id = result.insertId;
    TaskData.id = id;
    if (result.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(TaskData),
        created_at: new Date(),
        status: "Created",
      };

      logsData
        ? await db.query("INSERT INTO `task_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("Task not created!!!");
    }
    return res.status(201).json(TaskData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/task/:id", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { id } = req.params;

    const {
      project_id,
      milestone_id,
      day,
      name,
      task_days,
      description,
      priority,
      due_date,
      time,
      status,
      task_message,
      comment_count,
      start_date,
      date_created,
      updated_at,
      user_id,
    } = req.body;

    const data = {
      project_id,
      milestone_id,
      day,
      task_days,
      description,
      priority,
      due_date,
      time,
      status,
      name,
      task_message,
      comment_count,
      start_date,
      date_created,
      updated_at,
      user_id
    };
    const [singleData] = await db.query("SELECT * FROM tasks WHERE id =?", id);
    const [result] = await db.query(
      "UPDATE tasks SET project_id = ? , milestone_id = ? ,day = ? , task_days =? ,description = ? , priority = ? , due_date = ? ,time = ? , status =?,    task_message = ? , comment_count = ? ,start_date = ?  , user_id = ? ,name= ? WHERE id =?  ",
      [
        data.project_id,
        data.milestone_id,
        data.day,
        data.task_days,
        data.description,
        data.priority,
        data.due_date,
        data.time,
        data.status,
        data.comment_count,
        data.start_date,
        data.date_created,
        data.updated_at,
        data.task_message,
        id,
      ]
    );
    if (result.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(singleData[0]),
        created_at: new Date(),
        status: "Updated",
      };

      logsData
        ? await db.query("INSERT INTO `task_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("task not edited!!!");
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.json(error.message);
  }
});

router.delete("/task/:id", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { id } = req.params;
    const { user_id } = req.body;

    const [deletedData] = await db.query("SELECT * FROM tasks WHERE id =?", id);
    const [result] = await db.query("DELETE FROM tasks WHERE id =?", id);

    if (result.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(deletedData[0]),
        created_at: new Date(),
        status: "Deleted",
      };

      logsData
        ? await db.query("INSERT INTO `task_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("tasks was not deleted!!!");
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
