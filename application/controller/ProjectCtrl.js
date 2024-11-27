const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware } = require("../middlewares/auth");
const { encryptData } = require("../middlewares/EncryptedData");
const { ActivityLogs } = require("../middlewares/ActivityLogs");

router.get("/room", authMiddleware, async (req, res) => {
  try {
    const { order, sort, search, limit, offset } = req.query;

    // default set kiya hai

    const DEFAULT_LIMIT = 10;
    const DEFAULT_OFFSET = 0;

    //Yeh check karta hai ki order parameter mein diya gaya field valid hai ya nahi (valid fields jaise id, title, description, etc.).
    // ' Agar valid field nahi hai, toh orderBy null ho jayega.
    const VALID_ORDER_FIELDS = new Set([
      "id",
      "workspace_id",
      "user_ids",
      "client_id",
      "description",
      "task_count",
      "comment_count",
      "room_number",
    ]);

    const orderBy = VALID_ORDER_FIELDS.has(order) ? order : null;

    //Agar sort diya gaya hai, toh yeh check karta hai ki woh "ASC" ya "DESC" hai.
    // Agar nahi diya gaya ya invalid ho, toh default "ASC" rakha jayega.

    const sortDirection =
      sort && (sort.toUpperCase() === "ASC" || sort.toUpperCase() === "DESC")
        ? sort.toUpperCase()
        : "ASC";

    const searchQuery = search ? `%${search}%` : null;

    //Yeh limit aur offset ko integer mein convert karta hai,
    // aur agar yeh provided nahi hain, toh default values use hoti hain.

    const resultLimit = limit ? parseInt(limit, 10) : DEFAULT_LIMIT;
    const resultOffset = offset ? parseInt(offset, 10) : DEFAULT_OFFSET;

    let baseQuery = `
      SELECT * FROM rooms `;

    const conditions = [];
    const queryParams = [];

    if (searchQuery) {
      conditions.push(`
        id LIKE ? OR workspace_id LIKE ? OR user_ids LIKE ? OR client_id LIKE ? OR description LIKE ?
        OR task_count LIKE ? OR comment_count LIKE ? OR room_number LIKE ? 
      `);

      queryParams.push(
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery,
        searchQuery
      );
    }

    if (conditions.length) baseQuery += ` WHERE ${conditions.join(" AND ")}`;
    if (orderBy) baseQuery += ` ORDER BY ${orderBy} ${sortDirection}`;
    baseQuery += ` LIMIT ? OFFSET ?`;
    queryParams.push(resultLimit, resultOffset);

    const [result] = await db.query(baseQuery, queryParams);
    console.log(result);
    return res.json(result);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ error: "An internal error occurred." });
  }
});

router.get("/room_details/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("SELECT * FROM rooms WHERE id = ?", id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/createroom", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const {
      name,
      user_ids,
      client_id,
      description,
      task_count,
      comment_count,
      room_number,
      user_id,
    } = req.body;

    const data = {
      workspace_id,
      name,
      user_ids,
      client_id,
      description,
      task_count,
      comment_count,
      room_number,
    };

    const [existingUser] = await db.query(
      "SELECT id FROM rooms WHERE workspace_id = ? AND room_number = ?",
      [workspace_id, room_number]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Room already exists",
      });
    }

    const [result] = await db.query("INSERT INTO `rooms` SET ?", [data]);
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
        ? await db.query("INSERT INTO `room_activity` SET ?", [activityData])
        : "activity logs not created";
    } else {
      return res.status(404).json("Room not created!!!");
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.json(error.message);
  }
});

router.put("/editroom/:id", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { id } = req.params;
    const {
      name,
      user_ids,
      client_id,
      description,
      task_count,
      comment_count,
      room_number,
      user_id,
    } = req.body;

    const result = [
      workspace_id,
      name,
      user_ids,
      client_id,
      description,
      task_count,
      comment_count,
      room_number,
      id,
    ];

    await db.query(
      "UPDATE rooms SET workspace_id = ?, name = ?, user_ids = ?, client_id = ?, description = ?, task_count = ?, comment_count = ?, room_number = ? WHERE id = ?",
      result
    );

    const [data] = await db.query("SELECT * FROM rooms WHERE id = ?", id);

    if (data.affectedRows > 0) {
      const activityData = {
        user_id,
        workspace_id,
        message: JSON.stringify(data),
        created_at: new Date(),
        status: "Updated",
      };

      activityData
        ? await db.query("INSERT INTO `room_activity` SET ?", [activityData])
        : "activity logs not created";
    } else {
      return res.status(404).json("Room not edited!!!");
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/clients/:room_number", authMiddleware, async (req, res) => {
  try {
    const { room_number } = req.params;

    const [result] = await db.query(
      "SELECT client_id FROM rooms WHERE room_number = ?",
      room_number
    );
    const client_id = result[0].client_id;

    const clientIdArray = client_id.split(",").map((id) => id.trim());

    const [clientData] = await db.query(
      "SELECT id , workspace_id, first_name,last_name, email,active, address ,date_of_birth,date_of_joining,gender,country, state, city ,phone,profile FROM users WHERE id IN (?)",
      [clientIdArray]
    );
    return res.json(clientData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/users/:room_number", authMiddleware, async (req, res) => {
  try {
    const { room_number } = req.params;

    const [result] = await db.query(
      "SELECT user_ids FROM rooms WHERE room_number = ?",
      room_number
    );
    console.log(result);
    const user_ids = result[0].user_ids;

    const clientIdArray = user_ids.split(",").map((id) => id.trim());

    const [clientData] = await db.query(
      "SELECT id , workspace_id, first_name,last_name, email,active, address ,date_of_birth,date_of_joining,gender,country, state, city ,phone,profile FROM users WHERE id IN (?)",
      [clientIdArray]
    );
    return res.json(clientData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/room/:id", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { id } = req.params;
    const { user_id } = req.body;

    const [deletedData] = await db.query("SELECT * FROM rooms WHERE id =?", id);
    console.log(deletedData);
    const [result] = await db.query("DELETE FROM rooms WHERE id =?", id);

    if (result.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(deletedData[0]),
        created_at: new Date(),
        status: "Deleted",
      };

      logsData
        ? await db.query("INSERT INTO `room_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("room was not deleted!!!");
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
