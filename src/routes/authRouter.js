const bcrypt = require("bcrypt");
const { validateSignUp } = require("../utils/validate");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const express = require("express");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      photoURL,
      age,
      gender,
      about,
      skills,
    } = req.body;
    validateSignUp(req);

    const encryptedPassword = await bcrypt.hash(password, 10);

    const userData = {
      firstName,
      lastName,
      email,
      password: encryptedPassword,
      photoURL,
      age,
      gender,
      about,
      skills,
    };

    Object.keys(userData).forEach(
      (key) => userData[key] === undefined && delete userData[key]
    );

    const user = new User(userData);

    const savedUser = await user.save();
    const token = await savedUser.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 3600000),
      httpOnly: true,
    });
    res.json({ message: "User registered successfully", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Email or password is invalid");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Email or password is invalid");
    } else {
      const token = await user.getJWT();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 7 * 3600000),
        httpOnly: true,
      });
      res.send(user);
    }
  } catch (err) {
    res.status(400).send("Invalid credentials: " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });

  res.send("You are logged out!!");
});

authRouter.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id).select("-password -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error in /me:", err);
    res.status(401).json({ message: "Invalid token or session expired" });
  }
});

module.exports = authRouter;
