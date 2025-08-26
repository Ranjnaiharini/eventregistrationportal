const fs = require('fs').promises;
const path = require('path');

class Event {
    constructor() {
        this.dataFile = path.join(__dirname, '../data/events.json');
        this.events = [];
        this.nextId = 1;
        this.init();
    }

    async init() {
        try {
            await this.loadEvents();
        } catch (error) {
            console.log('No existing events file found, starting with empty database');
            this.events = [];
        }
    }

    async loadEvents() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf8');
            this.events = JSON.parse(data);
            
            // Find the highest ID to set nextId
            if (this.events.length > 0) {
                this.nextId = Math.max(...this.events.map(event => event.id)) + 1;
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, start with empty array
                this.events = [];
            } else {
                throw error;
            }
        }
    }

    async saveEvents() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(this.dataFile);
            await fs.mkdir(dataDir, { recursive: true });
            
            await fs.writeFile(this.dataFile, JSON.stringify(this.events, null, 2));
        } catch (error) {
            console.error('Error saving events:', error);
            throw error;
        }
    }

    async create(eventData) {
        try {
            const newEvent = {
                id: this.nextId++,
                title: eventData.title,
                category: eventData.category,
                date: eventData.date,
                time: eventData.time,
                location: eventData.location,
                description: eventData.description,
                capacity: parseInt(eventData.capacity),
                price: parseFloat(eventData.price),
                organizerId: eventData.organizerId,
                organizerName: eventData.organizerName,
                registrations: eventData.registrations || 0,
                registeredUsers: eventData.registeredUsers || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.events.push(newEvent);
            await this.saveEvents();

            return newEvent;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            return this.events.find(event => event.id === parseInt(id));
        } catch (error) {
            console.error('Error finding event by ID:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            // Sort events by date (upcoming first)
            return this.events
                .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
                .map(event => ({
                    ...event,
                    isUpcoming: new Date(event.date + 'T' + event.time) > new Date()
                }));
        } catch (error) {
            console.error('Error finding all events:', error);
            throw error;
        }
    }

    async findByCategory(category) {
        try {
            return this.events.filter(event => 
                event.category.toLowerCase() === category.toLowerCase()
            );
        } catch (error) {
            console.error('Error finding events by category:', error);
            throw error;
        }
    }

    async search(query) {
        try {
            const searchTerm = query.toLowerCase();
            return this.events.filter(event => 
                event.title.toLowerCase().includes(searchTerm) ||
                event.description.toLowerCase().includes(searchTerm) ||
                event.location.toLowerCase().includes(searchTerm) ||
                event.category.toLowerCase().includes(searchTerm)
            );
        } catch (error) {
            console.error('Error searching events:', error);
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            const eventIndex = this.events.findIndex(event => event.id === parseInt(id));
            
            if (eventIndex === -1) {
                throw new Error('Event not found');
            }

            // Update event data
            this.events[eventIndex] = {
                ...this.events[eventIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            await this.saveEvents();

            return this.events[eventIndex];
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const eventIndex = this.events.findIndex(event => event.id === parseInt(id));
            
            if (eventIndex === -1) {
                throw new Error('Event not found');
            }

            this.events.splice(eventIndex, 1);
            await this.saveEvents();

            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }

    async registerUser(eventId, userId) {
        try {
            const event = await this.findById(eventId);
            if (!event) {
                throw new Error('Event not found');
            }

            if (event.registrations >= event.capacity) {
                throw new Error('Event is full');
            }

            if (event.registeredUsers.includes(userId)) {
                throw new Error('User already registered for this event');
            }

            // Add user to registered users and increment registration count
            event.registeredUsers.push(userId);
            event.registrations += 1;

            await this.update(eventId, {
                registeredUsers: event.registeredUsers,
                registrations: event.registrations
            });

            return true;
        } catch (error) {
            console.error('Error registering user for event:', error);
            throw error;
        }
    }

    async unregisterUser(eventId, userId) {
        try {
            const event = await this.findById(eventId);
            if (!event) {
                throw new Error('Event not found');
            }

            if (!event.registeredUsers.includes(userId)) {
                throw new Error('User not registered for this event');
            }

            // Remove user from registered users and decrement registration count
            event.registeredUsers = event.registeredUsers.filter(id => id !== userId);
            event.registrations = Math.max(0, event.registrations - 1);

            await this.update(eventId, {
                registeredUsers: event.registeredUsers,
                registrations: event.registrations
            });

            return true;
        } catch (error) {
            console.error('Error unregistering user from event:', error);
            throw error;
        }
    }

    async getUpcomingEvents(limit = 10) {
        try {
            const now = new Date();
            const upcomingEvents = this.events
                .filter(event => new Date(event.date + 'T' + event.time) > now)
                .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
                .slice(0, limit);

            return upcomingEvents;
        } catch (error) {
            console.error('Error getting upcoming events:', error);
            throw error;
        }
    }

    async getEventsByOrganizer(organizerId) {
        try {
            return this.events.filter(event => event.organizerId === organizerId);
        } catch (error) {
            console.error('Error getting events by organizer:', error);
            throw error;
        }
    }

    async getEventStats() {
        try {
            const totalEvents = this.events.length;
            const upcomingEvents = this.events.filter(event => 
                new Date(event.date + 'T' + event.time) > new Date()
            ).length;
            const pastEvents = totalEvents - upcomingEvents;
            const totalRegistrations = this.events.reduce((sum, event) => sum + event.registrations, 0);

            const categoryStats = {};
            this.events.forEach(event => {
                categoryStats[event.category] = (categoryStats[event.category] || 0) + 1;
            });

            return {
                totalEvents,
                upcomingEvents,
                pastEvents,
                totalRegistrations,
                categoryStats
            };
        } catch (error) {
            console.error('Error getting event stats:', error);
            throw error;
        }
    }

    async getPopularEvents(limit = 5) {
        try {
            return this.events
                .sort((a, b) => b.registrations - a.registrations)
                .slice(0, limit);
        } catch (error) {
            console.error('Error getting popular events:', error);
            throw error;
        }
    }

    async cleanupPastEvents() {
        try {
            const now = new Date();
            const pastEvents = this.events.filter(event => 
                new Date(event.date + 'T' + event.time) <= now
            );

            // Archive or delete past events (for now, just log them)
            console.log(`Found ${pastEvents.length} past events`);
            
            return pastEvents.length;
        } catch (error) {
            console.error('Error cleaning up past events:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const eventModel = new Event();
module.exports = eventModel;
