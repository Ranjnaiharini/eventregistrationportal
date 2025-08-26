const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const Event = require('../models/event');
const User = require('../models/user');

const router = express.Router();

/**
 * Get All Events
 * GET /api/events
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        const events = await Event.findAll();
        
        // If user is authenticated, check their registrations
        if (req.user) {
            const user = await User.findById(req.user.id);
            if (user && user.registeredEvents) {
                events.forEach(event => {
                    event.isRegistered = user.registeredEvents.includes(event.id);
                });
            }
        }

        res.json({
            success: true,
            events: events,
            total: events.length
        });

    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events'
        });
    }
});

/**
 * Get Event by ID
 * GET /api/events/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            event: event
        });

    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event'
        });
    }
});

/**
 * Create New Event
 * POST /api/events
 * Requires authentication
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, category, date, time, location, description, capacity, price } = req.body;

        // Validation
        if (!title || !category || !date || !time || !location || !description || !capacity || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (capacity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Capacity must be greater than 0'
            });
        }

        if (price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price cannot be negative'
            });
        }

        // Validate date
        const eventDate = new Date(date + 'T' + time);
        if (eventDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Event date must be in the future'
            });
        }

        // Create event
        const newEvent = await Event.create({
            title,
            category,
            date,
            time,
            location,
            description,
            capacity,
            price,
            organizerId: req.user.id,
            organizerName: req.user.name,
            registrations: 0,
            registeredUsers: []
        });

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event: newEvent
        });

    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create event'
        });
    }
});

/**
 * Register for Event
 * POST /api/events/:id/register
 * Requires authentication
 */
router.post('/:id/register', authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if event is full
        if (event.registrations >= event.capacity) {
            return res.status(400).json({
                success: false,
                message: 'Event is full'
            });
        }

        // Check if user is already registered
        if (event.registeredUsers.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event'
            });
        }

        // Check if event date has passed
        const eventDate = new Date(event.date + 'T' + event.time);
        if (eventDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot register for past events'
            });
        }

        // Register user for event
        await Event.registerUser(eventId, userId);

        // Update user's registered events
        await User.addRegisteredEvent(userId, eventId);

        res.json({
            success: true,
            message: 'Successfully registered for event',
            eventId: eventId
        });

    } catch (error) {
        console.error('Event registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register for event'
        });
    }
});

/**
 * Update Event
 * PUT /api/events/:id
 * Requires authentication and ownership
 */
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is the organizer
        if (event.organizerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the event organizer can update this event'
            });
        }

        const updatedEvent = await Event.update(eventId, req.body);

        res.json({
            success: true,
            message: 'Event updated successfully',
            event: updatedEvent
        });

    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update event'
        });
    }
});

/**
 * Delete Event
 * DELETE /api/events/:id
 * Requires authentication and ownership
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is the organizer
        if (event.organizerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the event organizer can delete this event'
            });
        }

        await Event.delete(eventId);

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete event'
        });
    }
});

/**
 * Get Events by Category
 * GET /api/events/category/:category
 */
router.get('/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const events = await Event.findByCategory(category);

        res.json({
            success: true,
            events: events,
            category: category,
            total: events.length
        });

    } catch (error) {
        console.error('Get events by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events by category'
        });
    }
});

/**
 * Search Events
 * GET /api/events/search?q=query
 */
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const events = await Event.search(query);

        res.json({
            success: true,
            events: events,
            query: query,
            total: events.length
        });

    } catch (error) {
        console.error('Search events error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search events'
        });
    }
});

module.exports = router;
