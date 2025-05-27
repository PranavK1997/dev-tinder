const express = require("express");
const connectDB = require("./config/database");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const connectionRequestRouter = require("./routes/connectionRequestRouter");
const userRouter = require("./routes/userRouter");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  })
);

// Handle preflight requests
// app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

// Route handlers
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRequestRouter);
app.use("/", userRouter);

// Connect to database and start server
connectDB()
  .then(() => {
    console.log("Database connection is successful...");
    app.listen(3000, () => {
      console.log("Server started listening at 3000...");
    });
  })
  .catch((err) => {
    console.error("Database connection failed!!", err);
  });
