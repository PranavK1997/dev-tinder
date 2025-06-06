const validator = require("validator");

const validateSignUp = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Please provide a strong password");
  }
};

const validateEditProfileData = (req) => {
  const isAllowedFields = [
    "firstName",
    "lastName",
    "photoURL",
    "skills",
    "about",
    "gender",
    "age",
  ];

  const isEditAllowed = Object.keys(req.body).every((fields) =>
    isAllowedFields.includes(fields)
  );

  return isEditAllowed;
};

module.exports = {
  validateSignUp,
  validateEditProfileData,
};
