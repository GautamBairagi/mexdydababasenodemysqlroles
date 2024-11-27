const db = require("../config/db");

const authMiddleware = async (req, res, next) => {
  const authkey = req.headers['authkey'];

  if (!authkey) {
    return res.status(400).json({ status: 400, message: 'Auth key required.' });
  }

  try {
    const [results] = await db.query(
      "SELECT email FROM users WHERE auth_key = ?",
      [authkey]
    );

    if (results.length > 0) {
      req.user = results[0]; 
      next();  
    } else {
      return res.status(400).json({ status: 400, message: 'Invalid Auth key.' });
    }
  } catch (error) {
    return res.status(500).json({ status: 500, message: 'Server error.' });
  }
};

module.exports = { authMiddleware };
