// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  profileImage: {
    type: String,
  },
  isNewUser: {
    type: Boolean,
    default: true,
  },
}, { collection: 'users' });

userSchema.pre('save', async function(next) {
  const user = this;

  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;

    if (!user.isNew) {
      user.isNewUser = false;
    }

    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('Stored Hash:', this.password);
        console.log('Entered Password:', candidatePassword);

        // Compare the entered password with the stored hash
        const result = await bcrypt.compare(candidatePassword, this.password);
        console.log('Bcrypt Compare Result:', result);
        return result;
    } catch (error) {
        throw new Error(error);
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;