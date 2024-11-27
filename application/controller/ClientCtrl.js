const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SECRET_KEY = "JHTHT54Y51Y65JN4YG54M5H1M5U4M5JU";
const { authMiddleware } = require("../middlewares/auth");

router.post("/createclient", authMiddleware, async (req, res) => {
  const workspace_id = req.headers["workspace_id"];
  const { password, email, group_id, ...restData } = req.body;

  try {
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE workspace_id = ? AND email = ?",
      [workspace_id, email]
    );

    if (existingUser.length > 0) {
      console.error("User already exists with this email");
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const userDetails = {
      email,
      password: hashedPassword,
      workspace_id,
      group_id,
      ...restData,
    };

    const [createuserData] = await db.query(
      "INSERT INTO users SET ?",
      userDetails
    );

    const users_group = {
      user_id: createuserData.insertId,
      workspace_id,
      group_id: group_id,
    };
    const [insertusergroup] = await db.query(
      "INSERT INTO users_groups SET ?",
      users_group
    );
    if (createuserData && insertusergroup) {
      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: userDetails,
      });
    } else {
      res.status(404).json({ message: "User can not be created!" });
    }
  } catch (error) {
    console.error(`Error creating user: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/client", authMiddleware, async (req, res) => {
  try {
    const { order, sort, search, limit, offset } = req.query;

    // Default values for limit and offset
    const DEFAULT_LIMIT = 30;
    const DEFAULT_OFFSET = 0;

    // Valid fields for sorting
    const VALID_ORDER_FIELDS = new Set([
      "id",
      "first_name",
      "last_name",
      "email",
      "active",
      "group_id",
      "group_name",
    ]);

    const orderBy = VALID_ORDER_FIELDS.has(order) ? order : null;

    // Sort direction validation
    const sortDirection =
      sort && (sort.toUpperCase() === "ASC" || sort.toUpperCase() === "DESC")
        ? sort.toUpperCase()
        : "DESC";

    const searchQuery = search ? `%${search}%` : null;

    // Convert limit and offset to integers with defaults
    const resultLimit = limit ? parseInt(limit, 10) : DEFAULT_LIMIT;
    const resultOffset = offset ? parseInt(offset, 10) : DEFAULT_OFFSET;

    let baseQuery = `
      SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.active, 
        u.phone,
        u.address,
        u.date_of_birth,
        u.date_of_joining,
        u.gender,
        u.designation,
        u.city,
         u.state,
        u.country,
        u.profile, 
        ug.group_id, 
        g.name AS group_name
      FROM users u
      LEFT JOIN users_groups ug ON u.id = ug.user_id
      LEFT JOIN groups g ON g.id = ug.group_id
    `;

    const conditions = [];
    const queryParams = [];

    // Add search conditions if `search` is provided
    if (searchQuery) {
      conditions.push(`
        u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR g.name LIKE ?
      `);
      queryParams.push(searchQuery, searchQuery, searchQuery, searchQuery);
    }

    // Append conditions to the base query
    if (conditions.length) baseQuery += ` WHERE ${conditions.join(" AND ")}`;

    // Add ordering if a valid order field is provided
    if (orderBy) baseQuery += ` ORDER BY ${orderBy} ${sortDirection}`;

    // Add limit and offset for pagination
    baseQuery += ` LIMIT ? OFFSET ?`;
    queryParams.push(resultLimit, resultOffset);

    const [result] = await db.query(baseQuery, queryParams);
    const filters = result.filter((item) => item.group_id === 3);

    const enrichedResult = [];

    for (const item of filters) {
      const [userdata] = await db.query(
        "SELECT COUNT(user_ids) AS countdata ,room_number, id FROM rooms WHERE FIND_IN_SET(?, user_ids)",
        [item.id]
      );
      enrichedResult.push({
        ...item,
        user_count: userdata[0].countdata,
        room_id: userdata[0]?.id,
        room_number: userdata[0]?.room_number,
      });
    }
    res.status(200).json(enrichedResult);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "An internal error occurred." });
  }
});

module.exports = router;
