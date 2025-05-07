const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult, body } = require('express-validator');
const multer = require('multer');
const path = require('path');

const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Configure multer storage for supportDocument uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Request logging middleware
router.use((req, res, next) => {
  req.requestId = uuidv4();
  console.log(`[${new Date().toISOString()}] [${req.requestId}] ${req.method} ${req.path}`);
  next();
});

// Existing routes omitted for brevity...

router.post('/login', 
  body('loginId').notEmpty().withMessage('Login ID is required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { loginId, password } = req.body;
    loginId = loginId.trim();
    password = password.trim();

    try {
      console.log(`Login attempt for loginId: ${loginId}`);
      // Find user by email, phone number, or username (allow login by any)
      const user = await User.findOne({
        $or: [
          { email: loginId },
          { phoneNumber: loginId },
          { userName: loginId }
        ]
      });
      console.log(`User found: ${user ? user.userName : 'No user found'}`);

      if (!user) {
        return res.status(401).json({ error: 'Invalid login credentials' });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`Password match result: ${isMatch}`);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid login credentials' });
      }

      // Check if veterinarian is approved
      if (user.role === 'veterinarian' && user.status !== 'Active') {
        return res.status(403).json({ error: 'Account not approved by admin yet' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Return token and user info
      res.json({
        token,
        user: {
          id: user._id,
          userName: user.userName,
          role: user.role,
          email: user.email,
          phoneNumber: user.phoneNumber
        }
      });
    } catch (error) {
      console.error(`[${req.requestId}] Login error:`, error);
      res.status(500).json({ error: 'Server error during login' });
    }
  }
);

  
// New route to get all users with roles and locations
router.get('/users', authenticateToken, roleCheck(['admin']), async (req, res) => {
  try {
const users = await User.find({}, 'userName role status createdAt farmerLocation vetLocation').lean();

    // Map users to unify location field and capitalize location names
    const mappedUsers = users.map(user => {
      let location = '';
      if (user.role.toLowerCase() === 'farmer') {
        location = user.farmerLocation || '';
      } else if (user.role.toLowerCase() === 'veterinarian') {
        location = user.vetLocation || '';
      }
      return {
        id: user._id,
        name: user.userName,
        role: user.role,
        status: user.status || 'Active',
        registrationDate: user.createdAt || '',
        location: location.toUpperCase()
      };
    });

    res.json(mappedUsers);
  } catch (error) {
    console.error(`[${req.requestId}] Error fetching users:`, error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /profile route to get authenticated user's profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(`[${req.requestId}] Error fetching profile:`, error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /register route for user registration
router.post('/register', upload.single('supportDocument'), async (req, res) => {
  try {
    let {
      email,
      userName,
      password,
      role,
      phoneNumber,
      farmerLocation,
      additionalInfo,
      specialization,
      areaOfExpertise,
      vetLocation
    } = req.body;

    email = email.trim();
    userName = userName.trim();
    password = password.trim();
    phoneNumber = phoneNumber.trim();
    farmerLocation = farmerLocation ? farmerLocation.trim() : '';
    additionalInfo = additionalInfo ? additionalInfo.trim() : '';
    specialization = specialization ? specialization.trim() : '';
    areaOfExpertise = areaOfExpertise ? areaOfExpertise.trim() : '';
    vetLocation = vetLocation ? vetLocation.trim() : '';

    // Validate required fields
    if (!email || !userName || !password || !role || !phoneNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists by email or phone number
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }]
    });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email or phone number already exists' });
    }

    // Prepare new user data without hashing password manually
    const newUserData = {
      email,
      userName,
      password,  // plain password, will be hashed by pre-save hook
      role,
      phoneNumber,
      farmerLocation: role === 'farmer' ? farmerLocation : undefined,
      additionalInfo: role === 'farmer' ? additionalInfo : undefined,
      specialization: role === 'veterinarian' ? specialization : undefined,
      areaOfExpertise: role === 'veterinarian' ? areaOfExpertise : undefined,
      vetLocation: role === 'veterinarian' ? vetLocation : undefined,
      status: role === 'veterinarian' ? 'Pending' : 'Active',
      registrationDate: new Date()
    };

    // Handle supportDocument file path if veterinarian
    if (role === 'veterinarian' && req.file) {
      newUserData.supportDocument = req.file.filename;
    }

    // Create and save new user
    const newUser = new User(newUserData);
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});




// PUT route for admin to update user status (approve/suspend)
router.put('/users/:id/status', authenticateToken, roleCheck(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!['Pending', 'Active', 'Suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Server error while updating user status' });
  }
});


// GET /users/:id - Get full user profile by ID (admin only)
router.get('/users/:id', authenticateToken, roleCheck(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(`[${req.requestId}] Error fetching user by ID:`, error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /users/:id/document-status - Update supportDocumentStatus (admin only)
router.put('/users/:id/document-status', authenticateToken, roleCheck(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    const { supportDocumentStatus } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(supportDocumentStatus)) {
      return res.status(400).json({ error: 'Invalid supportDocumentStatus value' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.supportDocumentStatus = supportDocumentStatus;
    await user.save();

    res.json({ message: 'Support document status updated successfully' });
  } catch (error) {
    console.error(`[${req.requestId}] Error updating support document status:`, error);
    res.status(500).json({ error: 'Failed to update support document status' });
  }
});

// PUT /profile - Update authenticated user's profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields based on role
    const { userName, email, phoneNumber, farmerLocation, additionalInfo, specialization, areaOfExpertise, vetLocation } = req.body;

    if (userName) user.userName = userName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    if (user.role === 'farmer') {
      if (farmerLocation !== undefined) user.farmerLocation = farmerLocation;
      if (additionalInfo !== undefined) user.additionalInfo = additionalInfo;
    } else if (user.role === 'veterinarian') {
      if (specialization !== undefined) user.specialization = specialization;
      if (areaOfExpertise !== undefined) user.areaOfExpertise = areaOfExpertise;
      if (vetLocation !== undefined) user.vetLocation = vetLocation;
    }

    await user.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.delete('/users/:id', authenticateToken, roleCheck(['admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await User.deleteOne({ _id: userId });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error while deleting user' });
  }
});

module.exports = router;
