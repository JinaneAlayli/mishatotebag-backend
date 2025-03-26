const express = require("express");
const router = express.Router();
const { submitContact, getAllContacts } = require("../controllers/contactController");

// Route to handle contact form submission
router.post("/submit", submitContact);

// Route to get all contacts (for admin)
router.get("/all", getAllContacts);

module.exports = router;
