const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const app = express();

app.post("/signup", async (req, res) => {
  const user = new User({
    firstName: "Pranav",
    lastName: "Khairnar",
    email: "pranav@gmail.com",
    password: "pranav@123",
  });

  try {
    await user.save();
    res.send("User registered successfully");
  } catch (err) {
    res.status(500).send("User registration failed!!", err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connection is successful...");
    app.listen(3000, () => {
      console.log("Server started listening at 3000...");
    });
  })
  .catch((err) => {
    console.error("Database connection failed!!");
  });
