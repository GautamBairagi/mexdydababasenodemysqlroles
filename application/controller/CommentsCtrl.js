const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware } = require("../middlewares/auth");

router.get("/comment", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query(
      "SELECT * FROM comments INNER JOIN users ON comments.user_id=users.id"
    );
    const data = result.map((item) => ({
      id: item.id,
      workspace_id: item.workspace_id,
      project_id: item.project_id,
      task_id: item.task_id,
      user_id: item.user_id,
      comment: item.comment,
      date_created: item.date_created,
      username: `${item.first_name} ${item.last_name}`,
    }));
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/comment", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { project_id, user_id, task_id, date_created, comment } = req.body;

    const commentData = {
      workspace_id,
      project_id,
      user_id,
      task_id,
      date_created,
      comment,
    };

    const [result] = await db.query("INSERT INTO comments SET ?", commentData);
    let id = result.insertId;
    commentData.id = id;

    if (result.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(commentData),
        created_at: new Date(),
        status: "Created",
      };

      logsData
        ? await db.query("INSERT INTO `comments_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("not commented!!!");
    }
    return res.status(201).json(commentData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/comment/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const workspace_id = req.headers["workspace_id"];
    const { project_id, user_id, task_id, date_created, comment } = req.body;
    if (!workspace_id) {
      return res.status(400).json({ error: "Workspace ID is required" });
    }
    const commentData = {
      workspace_id,
      project_id,
      user_id,
      task_id,
      date_created,
      comment,
    };
    const [singleData] = await db.query(
      "SELECT * FROM medicine WHERE id =?",
      id
    );
    const [result] = await db.query(
      "UPDATE comments SET project_id = ? , user_id = ? ,task_id = ? , date_created = ? ,comment = ?  WHERE workspace_id = ? AND id = ?",
      [
        id,
        commentData.workspace_id,
        commentData.project_id,
        commentData.user_id,
        commentData.task_id,
        commentData.date_created,
        commentData.comment,
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
        ? await db.query("INSERT INTO `comments_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("comment was not edited!!!");
    }
    return res.status(201).json(commentData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/comment/:id", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { id } = req.params;
    const { user_id } = req.body;

    const [deletedData] = await db.query(
      "SELECT * FROM comments WHERE id =?",
      id
    );
    const [result] = await db.query("DELETE FROM comments WHERE id =?", id);

    if (result.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(deletedData[0]),
        created_at: new Date(),
        status: "Deleted",
      };

      logsData
        ? await db.query("INSERT INTO `comments_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("comment was not deleted!!!");
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
