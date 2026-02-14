const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // parse JSON body

// Connect MongoDB

mongoose.connect('mongodb://127.0.0.1:27017/saas_app')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


// User Schema
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  country: String,
  password: String
});

const User = mongoose.model('User', userSchema);

// ==========================
// REGISTER
// ==========================
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, country, password } = req.body;

    if (!fullName || !email || !country || !password) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ fullName, email, country, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ msg: 'Registration successful' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Email already exists' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// ==========================
// LOGIN
// ==========================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid email or password' });

    res.json({ msg: 'Login successful', userId: user._id });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ==========================
// FORGOT PASSWORD
// ==========================
app.post('/api/forgot', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000....!'));