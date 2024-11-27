const db = require("../config/db");

const ActivityLogs = async (res, data, result, statusData) => {
  try {
    const activityData = {
      message: JSON.stringify(data),
      created_at: new Date(),
      status: statusData,
    };

    activityData
      ? await db.query("INSERT INTO `room_activity` SET ?", [activityData])
      : "activity logs not created";
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

module.exports = { ActivityLogs };
