const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware } = require("../middlewares/auth");

router.get("/status", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM status");

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/status", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { name, description, note, status, user_id } = req.body;

    const statusData = {
      name,
      description,
      note,
      status,
    };

    const [result] = await db.query("INSERT INTO status SET ?", statusData);
    let id = result.insertId;
    statusData.id = id;
    if (result.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(statusData),
        created_at: new Date(),
        status: "Created",
      };

      logsData
        ? await db.query("INSERT INTO `status_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("status not created!!!");
    }

    return res.status(201).json(statusData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/status/:id", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { id } = req.params;
    
    if (!workspace_id) {
      return res.status(400).json({ error: "Missing workspace_id in headers" });
    }
    const { name, description, note, status, user_id } = req.body;

    const data = {
      name,
      description,
      note,
      status,
    };
    const [singleData] = await db.query(
      "SELECT * FROM status WHERE id =?",
      id
    );
    const [result] = await db.query(
      "UPDATE status SET name = ? , description = ? , note = ? ,status = ?  WHERE id =? ",
      [
        data.name,
        data.description,
        data.note,
        data.status,
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
        ? await db.query("INSERT INTO `status_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("status not edited!!!");
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.json(error.message);
  }
});

router.delete("/status/:id", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { id } = req.params;
    const { user_id } = req.body;

    const [deletedData] = await db.query(
      "SELECT * FROM status WHERE id =?",
      id
    );
    const [result] = await db.query("DELETE FROM status WHERE id =?", id);

    if (result.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(deletedData[0]),
        created_at: new Date(),
        status: "Deleted",
      };

      logsData
        ? await db.query("INSERT INTO `status_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("status was not deleted!!!");
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
