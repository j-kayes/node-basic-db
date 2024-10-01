const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  name: String,
  email: String,
  gender: String,
  password: String,
  mbtiType: String,
  mbtiVector: {
    type: [Number], // An array of numbers representing the 4D vector
    default: [null, null, null, null], // Initialize with zeros or null if preferred
  },
  mbtiType: String
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;