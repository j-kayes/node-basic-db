require('dotenv').config();  // Load environment variables

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require('./models/User');

const app = express();
app.use(bodyParser.json());

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    // Stop here and send a 401 response if no token is present
    return res.status(401).send({ error: 'Authorization header missing' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify the token before proceeding to route handler
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Token is valid, pass control to the route handler
    next();
  } catch (error) {
    // Invalid token, stop here and send a 401 response
    res.status(401).send({ error: 'Invalid token, please authenticate' });
  }
};

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve quiz project for authenticated users only
app.use('/quiz', authMiddleware, express.static(path.join(__dirname, 'public/mbti-quiz')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.log('Failed to connect to MongoDB', err);
});

// Start the server
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
  
  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.send({ token });
});

// Protected route for dashboard (authenticated users only)
app.get('/dashboard', authMiddleware, (req, res) => {
  res.send({ message: 'Welcome to your dashboard!' });
});
