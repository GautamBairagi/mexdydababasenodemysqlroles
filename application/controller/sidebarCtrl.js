const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authMiddleware } = require("../middlewares/auth");

router.get("/sidebars", authMiddleware, async (req, res) => {
    try {
        const [result] = await db.query("SELECT * FROM sidebar");

       return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.put("/sidebar", authMiddleware, async (req, res) => {
  try {
    const { first_id, last_id, new_position, old_position } = req.body;
    const [result] = await db.query(
      "UPDATE sidebar SET  position = ? WHERE id = ? ",
      [new_position, first_id]
    );
    const [result1] = await db.query(
      "UPDATE sidebar SET  position = ? WHERE id = ?  ",
      [old_position, last_id]
    );
    if (result && result1) {
      return res.status(200).json(result1);
    } else {
      return res.status(400).json("Data not updated");
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/subsidebars", authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM sub_sidebar");

    return res.json(result);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

router.put("/subsidebar", authMiddleware, async (req, res) => {
  try {
    const { first_id, last_id, new_position, old_position } = req.body;
    const [result] = await db.query(
      "UPDATE sub_sidebar SET  position = ? WHERE id = ? ",
      [new_position, first_id]
    );
    const [result1] = await db.query(
      "UPDATE sub_sidebar SET  position = ? WHERE id = ?  ",
      [old_position, last_id]
    );
    if (result && result1) {
      return res.status(200).json(result1);
    } else {
      return res.status(400).json("Data not updated");
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/sidebar_details/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "SELECT side_name FROM sidebar WHERE id = ?",
      id
    );
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/subsidebar_details/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "SELECT name FROM sub_sidebar WHERE id = ?",
      id
    );
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/sidebar_details/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { side_name } = req.body;

    const [result] = await db.query(
      "UPDATE sidebar SET side_name = ? WHERE id = ?",
      [side_name,id ]
    );
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/subsidebar_details/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const [result] = await db.query(
      "UPDATE sub_sidebar SET name = ? WHERE id = ?",
      [name,id ]
    );
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


module.exports = router;
