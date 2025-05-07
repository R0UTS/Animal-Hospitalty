const express = require('express');
const router = express.Router();
const Emergency = require('../models/Emergency');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer storage for images and videos
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

// POST /
// Create a new emergency report with file uploads
router.post('/', authenticateToken, upload.fields([{ name: 'images' }, { name: 'videos' }]), async (req, res) => {
  try {
    const { location, description, animals, farmerPhone, farmerEmail } = req.body;

    if (!location) {
      return res.status(400).json({ message: 'Location is required' });
    }
    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (!animals) {
      return res.status(400).json({ message: 'Animals data is required' });
    }

    let parsedAnimals;
    try {
      parsedAnimals = JSON.parse(animals);
    } catch (err) {
      console.error('Invalid animals data format:', err);
      return res.status(400).json({ message: 'Invalid animals data format' });
    }

    // Fetch farmer profile to get location
    const User = require('../models/User');
    const farmer = await User.findById(req.user.userId);
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    const farmerLocation = farmer.farmerLocation || '';
    console.log('Farmer location:', farmerLocation);

    // Find vets in farmerLocation (case-insensitive)
    const Vet = require('../models/User');
    const vetsInLocation = await Vet.find({
      role: 'veterinarian',
      vetLocation: { $regex: new RegExp(`${farmer.farmerLocation}`, 'i') }
    });
    console.log('Vets found in location:', vetsInLocation.map(v => ({ id: v._id, location: v.vetLocation })));

    if (!vetsInLocation || vetsInLocation.length === 0) {
      const allVets = await Vet.find({ role: 'veterinarian' });
      console.log('All vets:', allVets.map(v => ({ id: v._id, location: v.vetLocation })));
      return res.status(400).json({ error: 'No vet in your location' });
    }

    const emergencyData = {
      emergencyId: uuidv4(),
      userId: req.user.userId, // Set userId to the farmer's userId
      location,
      farmerLocation: farmerLocation,
      farmerName: farmer.userName || '',
      description,
      animals: parsedAnimals,
      images: [],
      videos: [],
      status: 'Pending',
      farmerPhone: farmerPhone || farmer.phoneNumber || '',
      farmerEmail: farmerEmail || farmer.email || '',
      createdAt: new Date(),
    };

    if (req.files) {
      if (req.files['images']) {
        emergencyData.images = req.files['images'].map(file => file.filename);
      }
      if (req.files['videos']) {
        emergencyData.videos = req.files['videos'].map(file => file.filename);
      }
    }

    const newEmergency = new Emergency(emergencyData);
    const savedEmergency = await newEmergency.save();

    // TODO: Notify vetsInLocation about new emergency (implementation depends on notification system)

    res.status(201).json(savedEmergency);
  } catch (error) {
    console.error('Error creating emergency report:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to create emergency report', details: error.message });
  }
});

const mongoose = require('mongoose');

// GET /statistics
// Returns emergency report counts grouped by location and status
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const locationFilter = req.query.location;
    const matchStage = locationFilter && locationFilter.toLowerCase() !== 'all'
      ? { location: { $regex: new RegExp(`^${locationFilter}$`, 'i') } }
      : {};

    const aggregation = await Emergency.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { location: '$location', status: '$status' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.location',
          countsByStatus: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          location: '$_id',
          countsByStatus: 1
        }
      }
    ]);

    res.json(aggregation);
  } catch (error) {
    console.error('Error fetching emergency statistics:', error);
    res.status(500).json({ error: 'Failed to fetch emergency statistics' });
  }
});

// GET /statistics/monthly
// Returns emergency report counts grouped by year, month, and status
router.get('/statistics/monthly', authenticateToken, async (req, res) => {
  try {
    const locationFilter = req.query.location;
    const matchStage = locationFilter && locationFilter.toLowerCase() !== 'all'
      ? { location: { $regex: new RegExp(`^${locationFilter}$`, 'i') } }
      : {};

    const aggregation = await Emergency.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: { year: '$_id.year', month: '$_id.month' },
          countsByStatus: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          countsByStatus: 1,
          total: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    res.json(aggregation);
  } catch (error) {
    console.error('Error fetching monthly emergency statistics:', error);
    res.status(500).json({ error: 'Failed to fetch monthly emergency statistics' });
  }
});

// GET /
// Returns a list of emergency reports with optional limit query parameter
router.get('/', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user.userId;

    // Filter emergencies by logged-in farmer's userId
    const emergencies = await Emergency.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    res.json(emergencies);
  } catch (error) {
    console.error('Error fetching emergencies:', error);
    res.status(500).json({ error: 'Failed to fetch emergencies' });
  }
});

router.get('/vet-emergencies', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const User = require('../models/User');
    const vet = await User.findById(userId);
    if (!vet) {
      return res.status(404).json({ error: 'Vet not found' });
    }
    if (vet.role !== 'veterinarian') {
      return res.status(403).json({ error: 'Access denied: Not a veterinarian' });
    }
    const vetLocation = vet.vetLocation || '';
    const limit = parseInt(req.query.limit) || 20;

    const emergencies = await Emergency.find({
      farmerLocation: { $regex: new RegExp(vetLocation, 'i') }
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    res.json(emergencies);
  } catch (error) {
    console.error('Error fetching vet emergencies:', error);
    res.status(500).json({ error: 'Failed to fetch vet emergencies' });
  }
});

router.get('/:emergencyId', authenticateToken, async (req, res) => {
  try {
    const emergencyId = req.params.emergencyId;
    const emergency = await Emergency.findOne({ emergencyId }).lean();
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    res.json(emergency);
  } catch (error) {
    console.error('Error fetching emergency details:', error);
    res.status(500).json({ error: 'Failed to fetch emergency details' });
  }
});

router.patch('/:emergencyId/status', authenticateToken, async (req, res) => {
  try {
    const emergencyId = req.params.emergencyId;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    const allowedStatuses = ['pending', 'acknowledge', 'cancelled', 'en route', 'on site', 'resolved'];
    if (!allowedStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ error: `Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}` });
    }
    const updatedEmergency = await Emergency.findOneAndUpdate(
      { emergencyId },
      { status },
      { new: true }
    ).lean();
    if (!updatedEmergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    res.json(updatedEmergency);
  } catch (error) {
    console.error('Error updating emergency status:', error);
    res.status(500).json({ error: 'Failed to update emergency status' });
  }
});

// GET /detailed
// Returns filtered emergency reports for admin reporting panel
router.get('/detailed', authenticateToken, async (req, res) => {
  try {
    const { fromDate, toDate, category, status, location } = req.query;

    const filter = {};

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }
      if (toDate) {
        filter.createdAt.$lte = new Date(toDate);
      }
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    if (location) {
      filter.farmerLocation = { $regex: new RegExp(`^${location}$`, 'i') };
    }

    const emergencies = await Emergency.find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.json(emergencies);
  } catch (error) {
    console.error('Error fetching detailed emergency reports:', error);
    res.status(500).json({ error: 'Failed to fetch detailed emergency reports' });
  }
});

module.exports = router;
