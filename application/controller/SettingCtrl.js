const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware } = require("../middlewares/auth");

router.get("/setting", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM mysetting");
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/setting", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { title, logo, user_id } = req.body;

    const data = {
      title,
      logo,
    };

    const [result] = await db.query("INSERT INTO `mysetting` SET ?", [data]);
    let id = result.insertId;
    data.id = id;
    if (result.affectedRows > 0) {
      const activityData = {
        user_id,
        workspace_id,
        message: JSON.stringify(data),
        created_at: new Date(),
        status: "Created",
      };

      activityData
        ? await db.query("INSERT INTO `settings_activity` SET ?", [
            activityData,
          ])
        : "activity logs not created";
    } else {
      return res.status(404).json("setting not created!!!");
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.json(error.message);
  }
});

router.put("/setting/:id", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { id } = req.params;
    const { title, logo, user_id } = req.body;

    // Update the setting
    await db.query(
      "UPDATE `mysetting` SET title = ?, logo = ? WHERE id = ?",
      [title, logo, id]
    );

    // Retrieve the updated setting
    const [data] = await db.query("SELECT * FROM `mysetting` WHERE id = ?", [id]);

    if (data.length > 0) {
      const activityData = {
        user_id,
        workspace_id,
        message: JSON.stringify(data),
        created_at: new Date(),
        status: "Updated",
      };

      // Log the activity
      await db.query("INSERT INTO `settings_activity` SET ?", activityData);

      return res.status(200).json(data);
    } else {
      return res.status(404).json("setting not edited!!!");
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


module.exports = router;
