const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://admin:pranav%401234@cluster0.tutzh.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
