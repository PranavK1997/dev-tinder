const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { validateSignUp } = require("./utils/validate");
const bcrypt = require("bcrypt");
const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    validateSignUp(req);

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: encryptedPassword,
    });

    await user.save();
    res.send("User registered successfully");
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Email or password is invalid");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Email or password is invalid");
    } else {
      res.send("Login successful!!");
    }
  } catch (err) {
    res.status(400).send("Invalid credentials: " + err.message);
  }
});

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});

    if (!users) {
      res.status(404).send("Users not found");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("Something went wrong!!");
  }
});

app.get("/user", async (req, res) => {
  const userEmail = req.body.email;
  try {
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(400).send("Something went wrong!!");
  }
});

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    const ALLOWED_UPDATES = ["photoURL", "about", "gender", "age", "skills"];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }

    if (data?.skills.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }
    const user = await User.findByIdAndUpdate(userId, data, {
      runValidators: true,
    });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.status(200).send("User updated successfully");
    }
  } catch (err) {
    res.status(400).send("UPDATE FAILED " + err.message);
  }
});

// app.patch("/user", async (req, res) => {
//   const userEmail = req.body.email;
//   const updateData = req.body;

//   try {
//     const user = await User.findOneAndUpdate({ email: userEmail }, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!user) {
//       return res.status(404).send("User not found");
//     }

//     res.status(200).send("User updated successfully");
//   } catch (err) {
//     console.error(err);
//     res.status(400).send("Something went wrong!!");
//   }
// });

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.status(200).send("User deleted successfully");
    }
  } catch (err) {
    res.status(400).send("Something went wrong!!");
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
