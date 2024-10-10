require('dotenv').config();  // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const cookieParser = require('cookie-parser');  // Added this line
const User = require('./models/User');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());  // Added this line

// Helper function to calculate Euclidean distance
function euclideanDistance(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must be of the same length');
  }
  let sum = 0;
  for (let i = 0; i < vectorA.length; i++) {
    sum += Math.pow(vectorA[i] - vectorB[i], 2);
  }
  return Math.sqrt(sum);
}

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;  // Changed from header to cookie

  if (!token) {
    // Stop here and send a 401 response if no token is present
    return res.status(401).send({ error: 'Token missing' });
  }

  try {
    // Verify the token before proceeding to route handler
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
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

// Protected route for dashboard (authenticated users only)
app.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Get the current user's ID from the JWT token
    const currentUserId = req.user.userId;

    // Fetch the user's data (username, MBTI type, and vector)
    const user = await User.findById(currentUserId, 'username mbtiType mbtiVector');

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Send the user data to the frontend
    res.status(200).json({
      username: user.username,
      mbtiType: user.mbtiType,
      mbtiVector: user.mbtiVector,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register route
app.post('/register', async (req, res) => {
  try {
    const { username, password, name, gender, email } = req.body;
    const user = new User({ username, password, name, gender, email });
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
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);

  // Set the token as an HttpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: false,       // Set to true if using HTTPS
    sameSite: 'Strict',  // Helps prevent CSRF attacks
  });

  // Send a success response
  res.status(200).send({ message: 'Login successful' });
});

app.post('/save-mbti', authMiddleware, async (req, res) => {
  try {
    const { mbtiVector, mbtiType } = req.body;

    // Validate mbtiVector
    if (!Array.isArray(mbtiVector) || mbtiVector.length !== 4 || mbtiVector.some(isNaN)) {
      return res.status(400).json({ error: 'Invalid MBTI vector' });
    }

    // Get the user's ID from the auth middleware
    const userId = req.user.userId;

    // Update the user's record
    await User.findByIdAndUpdate(userId, {
      mbtiVector: mbtiVector,
      mbtiType: mbtiType
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving MBTI data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get similar users
app.get('/similar-users', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    // Fetch the current user's MBTI vector
    const currentUser = await User.findById(currentUserId, 'mbtiVector');
    // Check if MBTI data is available
    for (let index = 0; index < currentUser.mbtiVector.length; index++) {
      if(!currentUser.mbtiVector[index]){
        return res.status(200).json({
          message: 'Please take the MBTI quiz before viewing similar users.',
        });
      }
      
    }
    // Fetch other users with MBTI data, excluding the current user
    const otherUsers = await User.find({
      _id: { $ne: currentUserId },
      mbtiVector: { $exists: true, $size: 4 },
    }, 'username name email gender mbtiVector mbtiType');

    // Calculate Euclidean distances
    const usersWithDistance = otherUsers.map(user => {
      return {
        userId: user._id,
        username: user.username,
        distance: euclideanDistance(currentUser.mbtiVector, user.mbtiVector),
        mbtiVector: user.mbtiVector,
        mbtiType: user.mbtiType,
        email: user.email,
        name: user.name
      };
    });

    // Sort users by distance (closest first)
    usersWithDistance.sort((a, b) => a.distance - b.distance);

    // Return the sorted list of similar users
    res.status(200).json({ users: usersWithDistance });
  } catch (error) {
    console.error('Error fetching similar users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});