const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require('./models/User');

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
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).send({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
  res.send({ token });
});

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate' });
  }
};

// Protected route example
app.get('/dashboard', authMiddleware, (req, res) => {
  res.send({ message: 'Welcome to your dashboard!' });
});
