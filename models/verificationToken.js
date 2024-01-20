// models/verificationToken.js
const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  token: {
    type: String,
    required: true,
  },
  expirationDate: {
    type: Date,
    default: () => Date.now() + 3600000, // Token expires in 1 hour
  },
});

tokenSchema.statics.clearExpiredTokens = async function() {
  try {
    await this.deleteMany({ expirationDate: { $lt: new Date() } });
  } catch (error) {
    throw new Error(error);
  }
};

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;