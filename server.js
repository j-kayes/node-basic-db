const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.log('Failed to connect to MongoDB', err);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Register route
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send({ error: 'Username already exists' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res.send({ token });
});

// Middleware to authenticate users
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

// Route to serve the MBTI test
app.get('/mbti-test', authMiddleware, (req, res) => {
  res.send({ questions: 'MBTI test questions go here' });
});

// Route to submit the MBTI test results
app.post('/mbti-test', authMiddleware, async (req, res) => {
  const { mbtiResults } = req.body; // Expecting an array of four numbers
  const user = await User.findById(req.user._id);
  user.mbtiResults = mbtiResults;
  await user.save();
  res.send({ message: 'Test results saved successfully' });
});

// Route to get the user's MBTI test results
app.get('/mbti-results', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.send({ mbtiResults: user.mbtiResults });
});