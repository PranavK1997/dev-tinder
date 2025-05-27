const { userAuth } = require("../middlewares/auth");
const user = require("../models/user");
const validator = require("validator");
const { validateEditProfileData } = require("../utils/validate");
const bcrypt = require("bcrypt");

const express = require("express");
const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      throw new Error("User does not exist!!");
    } else {
      res.json({ user });
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.put("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid edit request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      status: "success",
      message: `${loggedInUser.firstName}, your profile is update succesfully.`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    const isCurrentPasswordValid = await loggedInUser.validatePassword(
      currentPassword
    );
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect.");
    }

    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("New password is not strong enough.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    loggedInUser.password = hashedPassword;

    await loggedInUser.save();

    res.send("Password updated successfully.");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = profileRouter;
