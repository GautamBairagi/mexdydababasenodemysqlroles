const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware } = require("../middlewares/auth");

router.get("/medicine", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM medicine");

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/medicine", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const {
      medicine_name,
      medicine_restrictions,
      allergies,
      precautions,
      user_ids,
      allotted_to,
      allotted_from,
      mfg_date,
      expiry_date,
      qty,
      update_id,
      created_at,
      updated_at,
      user_id,
    } = req.body;

    const medicineData = {
      workspace_id,
      medicine_name,
      medicine_restrictions,
      allergies,
      precautions,
      user_ids,
      allotted_to,
      allotted_from,
      mfg_date,
      expiry_date,
      qty,
      update_id,
      created_at,
      updated_at,
    };

    const [result] = await db.query("INSERT INTO medicine SET ?", [
      medicineData,
    ]);
    let id = result.insertId;
    medicineData.id = id;
    if (result.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(medicineData),
        created_at: new Date(),
        status: "Created",
      };

      logsData
        ? await db.query("INSERT INTO `medicine_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("comment was not edited!!!");
    }
    return res.status(201).json(medicineData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/medicine/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const workspace_id = req.headers["workspace_id"];

    const [singleData] = await db.query(
      "SELECT * FROM medicine WHERE id =?",
      id
    );

    const {
      medicine_name,
      medicine_restrictions,
      allergies,
      precautions,
      user_ids,
      allotted_to,
      allotted_from,
      mfg_date,
      expiry_date,
      qty,
      update_id,
      created_at,
      updated_at,
      user_id,
    } = req.body;

    const medicineData = {
      medicine_name,
      medicine_restrictions,
      allergies,
      precautions,
      user_ids,
      allotted_to,
      allotted_from,
      mfg_date,
      expiry_date,
      qty,
      update_id,
      created_at,
      updated_at,
      workspace_id,
    };

    const [result] = await db.query(
      "UPDATE comments SET project_id = ?, user_id = ? ,task_id = ? , date_created = ? ,comment = ?  WHERE workspace_id = ? AND id = ?",
      [
        id,
        medicine_name,
        medicine_restrictions,
        allergies,
        precautions,
        user_ids,
        allotted_to,
        allotted_from,
        mfg_date,
        expiry_date,
        qty,
        update_id,
        created_at,
        updated_at,
        workspace_id,
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
        ? await db.query("INSERT INTO `medicine_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("comment was not edited!!!");
    }
    return res.status(201).json(medicineData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/medicine/:id", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { id } = req.params;
    const { user_id } = req.body;

    const [deletedData] = await db.query(
      "SELECT * FROM medicine WHERE id =?",
      id
    );
    console.log(deletedData);
    const [result] = await db.query("DELETE FROM medicine WHERE id =?", id);

    if (result.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(deletedData[0]),
        created_at: new Date(),
        status: "Deleted",
      };

      logsData
        ? await db.query("INSERT INTO `medicine_activity` SET ?", [logsData])
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
