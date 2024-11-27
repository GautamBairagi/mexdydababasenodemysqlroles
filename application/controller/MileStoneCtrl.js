const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware } = require("../middlewares/auth");

router.get("/milestone_details", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM milestones");

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/milestone_details/:client_id", authMiddleware, async (req, res) => {
  try {
    const {client_id}=req.params
    const [result] = await db.query("SELECT * FROM milestones WHERE client_id =?",client_id);

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
router.post("/createmilestone", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];

    const { room_id, client_id, title, description, status, user_id } =
      req.body;

    const data = {
      room_id,
      workspace_id,
      client_id,
      title,
      description,
      status,
      date_created: new Date(),
    };

    const [existingUser] = await db.query(
      "SELECT id FROM milestones WHERE workspace_id = ? AND title = ?",
      [workspace_id, title]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "title already exists",
      });
    }

    const [result] = await db.query("INSERT INTO `milestones` SET ?", data);
    let id = result.insertId;
    data.id = id;

    if (result.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(data),
        created_at: new Date(),
        status: "Created",
      };

      logsData
        ? await db.query("INSERT INTO `milestone_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("milestone not created!!!");
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.json(error.message);
  }
});

router.put("/editmilestone/:id", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { id } = req.params;
    const { room_id, client_id, title, description, status, user_id } =
      req.body;

    const data = {
      room_id,
      workspace_id,
      client_id,
      title,
      description,
      status,
      date_created: new Date(),
    };
    const [singleData] = await db.query(
      "SELECT * FROM milestones WHERE id =?",
      id
    );
    const [result] = await db.query(
      "UPDATE milestones SET room_id = ? , client_id = ? , title = ? ,description = ? , status =? WHERE id =? ",
      [
        id,
        data.room_id,
        data.workspace_id,
        data.client_id,
        data.title,
        data.description,
        data,
        status,
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
        ? await db.query("INSERT INTO `milestone_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("milestone not edited!!!");
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.json(error.message);
  }
});

router.delete("/milestone/:id", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { id } = req.params;
    const { user_id } = req.body;

    const [deletedData] = await db.query(
      "SELECT * FROM milestones WHERE id =?",
      id
    );
    const [result] = await db.query("DELETE FROM milestones WHERE id =?", id);

    if (result.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(deletedData[0]),
        created_at: new Date(),
        status: "Deleted",
      };

      logsData
        ? await db.query("INSERT INTO `milestone_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("milestones was not deleted!!!");
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
