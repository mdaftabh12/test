// config/db.js

const mongoose = require('mongoose');

// const uri = "mongodb+srv://gforss8:<<password>>@cluster0.rtbm8rp.mongodb.net/test?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1); 
  }
};

module.exports = connectDB;
