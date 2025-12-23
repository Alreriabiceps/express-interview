const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", UserSchema);

async function createUser(data) {
  const user = await User.create({
    username: data.username,
    password: data.password,
    adminName: data.adminName,
  });
  return user;
}

async function findUserByUsername(username) {
  return User.findOne({ username: username.toLowerCase() });
}

async function findUserById(id) {
  return User.findById(id).select("-password");
}

async function updateUser(id, data) {
  const updateData = {};
  if (data.adminName) updateData.adminName = data.adminName;
  if (data.password) updateData.password = data.password;
  if (data.username) updateData.username = data.username.toLowerCase();

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");

  return user;
}

module.exports = {
  User,
  createUser,
  findUserByUsername,
  findUserById,
  updateUser,
};
