const express = require("express");
const router = express.Router();
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SECRET_KEY = "JHTHT54Y51Y65JN4YG54M5H1M5U4M5JU";
const { authMiddleware } = require("../middlewares/auth");

router.put("/deleteUser/:user_id", async (req, res) => {
  const workspace_id = req.headers["workspace_id"];
  const { user_id } = req.params;

  try {
    const [existingUser] = await db.query(
      "UPDATE users SET workspace_id = ? WHERE workspace_id = ? AND user_id = ? ",
      ["0", workspace_id, user_id]
    );

    if (existingUser.length == 0) {
      return res.status(400).json({
        success: false,
        message: "User Can Not Be Deleted",
      });
    }

    if (existingUser) {
      return res.status(201).json({
        success: true,
        message: "User Deleted successfully",
        data: userDetails,
      });
    } else {
      res.status(404).json({ message: "User Can Not Be Deleted!" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/createuser", authMiddleware, async (req, res) => {
  const workspace_id = req.headers["workspace_id"];
  console.log(workspace_id);
  const { password, email, group_id, first_name, last_name, ...restData } =
    req.body;

  try {
    if (!password || !email || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
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
      ...restData,
      first_name,
      last_name,
    };

    const [createuserData] = await db.query(
      "INSERT INTO users SET ?",
      userDetails
    );
    console.log(createuserData.insertId);

    const users_group = {
      user_id: createuserData.insertId,
      workspace_id,
      group_id: group_id,
    };
    const [insertusergroup] = await db.query(
      "INSERT INTO users_groups SET ?",
      users_group
    );

    let id = createuserData.insertId;
    createuserData.id = id;
    if (createuserData.affectedRows > 0) {
      const logsData = {
        user_id,
        workspace_id,
        message: JSON.stringify(createuserData),
        created_at: new Date(),
        status: "Created",
      };

      logsData
        ? await db.query("INSERT INTO `users_activity` SET ?", [logsData])
        : "logs not created";
    } else {
      return res.status(404).json("user not created!!!");
    }

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

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userIp = req.ip || req.connection.remoteAddress;
  console.log(userIp);
  try {
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      email
    );

    const existingUser = users[0];
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    const token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    await db.query("UPDATE users SET auth_key = ?,ip_address=? WHERE id = ?", [
      token,
      userIp,
      existingUser.id,
    ]);

    const [grouppermission] = await db.query(
      "SELECT * FROM users_groups WHERE user_id = ?",
      [existingUser.id]
    );
    const group_id = grouppermission[0]?.group_id;

    const [group_name] = await db.query(
      "SELECT name FROM groups WHERE id = ?",
      [group_id]
    );

    const data = {
      userId: existingUser.id,
      email: existingUser.email,
      username: existingUser.username,
      first_name: existingUser.first_name,
      last_name: existingUser.last_name,
      group_id,
      group_name: group_name[0].name,
      token,
      ip_address: userIp,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      response: data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/groups", authMiddleware, async (req, res) => {
  const workspace_id = req.headers["workspace_id"];
  try {
    const [result] = await db.query(
      "SELECT * FROM groups WHERE workspace_id = ?",
      [workspace_id]
    );
    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

router.get("/users", authMiddleware, async (req, res) => {
  try {
    const { order, sort, search, limit, offset } = req.query;

    // Default values for limit and offset
    const DEFAULT_LIMIT = 10;
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
        ug.group_id, 
        u.profile, 
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

    const enrichedResult = [];

    for (const item of result) {
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

    return res.json(enrichedResult);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "An internal error occurred." });
  }
});

router.get("/users_details/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const workspace_id = req.headers["workspace_id"];

    const [result] = await db.query(
      "SELECT profile , first_name , email ,last_name, phone, date_of_birth, date_of_joining, gender, designation,password FROM users WHERE workspace_id = ? AND id =? ",
      [workspace_id, id]
    );
    let enrichedResult = [];
    for (const item of result) {
      const [userdata] = await db.query(
        "SELECT COUNT(user_ids) AS countdata ,room_number, id FROM rooms WHERE FIND_IN_SET(?, user_ids) AND id",
        [id, item.id]
      );

      console.log("userdata", userdata);
      enrichedResult.push({
        ...item,
        user_count: userdata[0].countdata,
        room_id: userdata[0]?.id,
        room_number: userdata[0]?.room_number,
      });
    }
    res.status(200).json(enrichedResult);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/userdata/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const workspace_id = req.headers["workspace_id"].includes(1);
    if (!workspace_id) {
      return res.status(404).json("workspace Id not found");
    }
    const [result] = await db.query(
      "SELECT  first_name ,last_name FROM users WHERE workspace_id = ? AND id =? ",
      [workspace_id, id]
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/editUser/:id", authMiddleware, async (req, res) => {
  try {
    const workspace_id = req.headers["workspace_id"];
    const { id } = req.params;
    const { password, ...restData } = req.body;

    if (!workspace_id || !id) {
      return res.status(400).json({ error: "Missing workspace ID or user ID" });
    }

    let updatedQuery = `
      UPDATE users 
      SET profile = ?, first_name = ?, last_name = ?, phone = ?, address = ?, 
          date_of_birth = ?, date_of_joining = ?, gender = ?, designation = ?, 
          city = ?, state = ?, zip_code = ?, country = ?
    `;
    const queryParams = [
      restData.profile,
      restData.first_name,
      restData.last_name,
      restData.phone,
      restData.address,
      restData.date_of_birth,
      restData.date_of_joining,
      restData.gender,
      restData.designation,
      restData.city,
      restData.state,
      restData.zip_code,
      restData.country,
    ];
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedQuery += `, password = ?`;
      queryParams.push(hashedPassword);
    }

    updatedQuery += ` WHERE workspace_id = ? AND id = ?`;
    queryParams.push(workspace_id, id);

    await db.query(updatedQuery, queryParams);
    const [singleData] = await db.query("SELECT * FROM users WHERE id = ?", id);

    return res.json({
      message: "User updated successfully",
      data: singleData,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while updating the user" });
  }
});

router.put("/group_id/:user_id", authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.params;
    const { group_id } = req.body;
    const workspace_id = req.headers["workspace_id"];
    const [result] = await db.query(
      "UPDATE users_groups SET group_id = ?  WHERE workspace_id = ? AND user_id = ?",
      [group_id, workspace_id, user_id]
    );
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch("/activateUser/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const [result] = await db.query(
      "UPDATE users SET active = ? WHERE id = ?",
      [active, id]
    );
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/logout/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query(
      "UPDATE users SET auth_key = '' WHERE id = ?",
      id
    );
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
