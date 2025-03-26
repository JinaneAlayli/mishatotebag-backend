const Contact = require("../models/Contact");

// Submit Contact Form
exports.submitContact = async (req, res) => {
  try {
    const { first_name, email, subject, message } = req.body;

    if (!first_name || !email || !message) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    const newContact = await Contact.create({ first_name, email, subject, message });

    res.status(201).json({ message: "Your message has been sent successfully.", contact: newContact });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong, please try again later." });
  }
};

// Get All Contact Submissions (Admin Use)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages." });
  }
};
