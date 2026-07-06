// visitor session route to create a new visitor session

console.log("✅ auth.js chargé");

const express = require("express");

const router = express.Router();

const jwt = require("jsonwebtoken"); // Import jsonwebtoken for generating JWT tokens

const User = require("../models/User"); // Import the User model

// Create a visitor session

router.post("/session", async (req, res) => {

  console.log("✅ Route session appelée");

  const { firstName, lastName, phone } = req.body;

  // validate all input fields

  if (!firstName || !lastName || !phone) {
    return res.status(400).json({
      error: "All fields are required",
    });
  }

  try {

    // Check if the visitor already exists
    /*
    const existingUser = await User.findOne({
      firstName,
      lastName,
      phone,
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Visitor already exists",
      });
    }
    */
   
    // Create a new visitor

    const newUser = new User({
      firstName,
      lastName,
      phone,
    });

    // Save the visitor to the database

    await newUser.save();

    // Generate a JWT token for the visitor

    const token = jwt.sign(
      {
        id: newUser._id,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "24h", // Token expires in 24 hours
      },
    );

    console.log("Visitor created successfully");

    console.log(newUser);

    res.status(201).json({
      message: "Visitor session created successfully",
      token,
      user: newUser,
      
    });
  } 
  
  catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }

});

module.exports = router;
