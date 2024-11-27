const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware } = require("../middlewares/auth");

router.get("/routine", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM routine");

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/routine", authMiddleware, async (req, res) => {
  try {
    const workspace_id=req.headers['workspace_id']
    const {
      medicine_name,
      rxnumber,
      frequency,
      unit,
      time,
      client_id,
      mfg_date,
      expiry_date,
      routine_start_date,
      routine_end_date,
      user_id,
    } = req.body;

    const startDate = new Date(routine_start_date);
    const endDate = new Date(routine_end_date);
    const difference_time = (endDate - startDate) / (1000 * 60 * 60 * 24);

    const RoutineData = {
      medicine_name,
      rxnumber,
      frequency,
      unit,
      time,
      client_id,
      mfg_date,
      expiry_date,
      routine_start_date,
      routine_end_date,
      created_at: new Date(),
      difference_time,
    };

    const [result] =await db.query("INSERT INTO routine SET ?", RoutineData);
    let id = result.insertId;
    RoutineData.id = id;
    if (result.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(RoutineData),
        created_at: new Date(),
        status: "Created",
      };

      logsData
        ? await db.query("INSERT INTO `routine_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("routine not created!!!");
    }

    return res.status(201).json(RoutineData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/routine/:id", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { id } = req.params;
    
    const {
      medicine_name,
      rxnumber,
      frequency,
      unit,
      time,
      client_id,
      mfg_date,
      expiry_date,
      routine_start_date,
      routine_end_date,
      user_id,
    } = req.body;

    const data = {
      medicine_name,
      rxnumber,
      frequency,
      unit,
      time,
      client_id,
      mfg_date,
      expiry_date,
      routine_start_date,
      routine_end_date,
    };
    const [singleData] = await db.query(
      "SELECT * FROM routine WHERE id =?",
      id
    );
    const [result] = await db.query(
      "UPDATE routine SET medicine_name = ? , rxnumber = ? , frequency = ? ,unit = ? , time =? ,client_id = ? , mfg_date = ? , expiry_date = ? ,routine_start_date = ? , routine_end_date =? WHERE id =? ",
      [
        data.medicine_name,
        data.rxnumber,
        data.frequency,
        data.unit,
        data.time,
        data.client_id,
        data.mfg_date,
        data.expiry_date,
        data.routine_start_date,
        data.routine_end_date,
        id
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
        ? await db.query("INSERT INTO `routine_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("routine not edited!!!");
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.json(error.message);
  }
});

router.delete("/routine/:id", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { id } = req.params;
    const { user_id } = req.body;

    const [deletedData] = await db.query(
      "SELECT * FROM routine WHERE id =?",
      id
    );
    const [result] = await db.query("DELETE FROM routine WHERE id =?", id);

    if (result.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(deletedData[0]),
        created_at: new Date(),
        status: "Deleted",
      };

      logsData
        ? await db.query("INSERT INTO `routine_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("routine was not deleted!!!");
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
