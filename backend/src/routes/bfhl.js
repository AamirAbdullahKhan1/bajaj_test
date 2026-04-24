const express = require("express");
const { processHierarchy } = require("../services/processHierarchy");
const { USER_ID, EMAIL_ID, COLLEGE_ROLL_NUMBER } = require("../config");

const router = express.Router();

/**
 * POST /bfhl
 * Accepts { data: string[] } and returns the hierarchy analysis.
 */
router.post("/", (req, res) => {
  try {
    const { data } = req.body;

    // Input validation
    if (!data) {
      return res.status(400).json({
        error: true,
        message: "Missing 'data' field in request body.",
      });
    }

    if (!Array.isArray(data)) {
      return res.status(400).json({
        error: true,
        message: "'data' must be an array of strings.",
      });
    }

    const result = processHierarchy(data);

    return res.json({
      user_id: USER_ID,
      email_id: EMAIL_ID,
      college_roll_number: COLLEGE_ROLL_NUMBER,
      ...result,
    });
  } catch (err) {
    console.error("Error processing /bfhl:", err);
    return res.status(500).json({
      error: true,
      message: "Internal server error.",
    });
  }
});

module.exports = router;
