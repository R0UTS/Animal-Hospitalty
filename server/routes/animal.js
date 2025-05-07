const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');

// Create a new animal
router.post('/', async (req, res) => {
    try {
        const animal = new Animal(req.body);
        await animal.save();
        res.status(201).send(animal);
    } catch (error) {
        res.status(400).send(error);
    }
});


/**
 * Get all animals for a specific owner with optional limit and sorting.
 * If limit query parameter is provided, limit the results; otherwise return all.
 */
router.get('/farmer/:ownerId', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        let query = Animal.find({ owner: req.params.ownerId }).sort({ createdAt: -1 });
        if (limit) {
            query = query.limit(limit);
        }
        const animals = await query;
        res.send(animals);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update an animal by animalId
router.put('/:animalId', async (req, res) => {
    try {
        const animal = await Animal.findOneAndUpdate(
            { animalId: req.params.animalId },
            req.body,
            { new: true }
        );
        if (!animal) {
            return res.status(404).send({ message: 'Animal not found' });
        }
        res.send(animal);
    } catch (error) {
        res.status(400).send(error);
    }
});


// Delete an animal by animalId
router.delete('/:animalId', async (req, res) => {
    try {
        const animal = await Animal.findOneAndDelete({ animalId: req.params.animalId });
        if (!animal) {
            return res.status(404).send({ message: 'Animal not found' });
        }
        res.send({ message: 'Animal deleted successfully' });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
