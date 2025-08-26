const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

class User {
    constructor() {
        this.dataFile = path.join(__dirname, '../data/users.json');
        this.users = [];
        this.nextId = 1;
        this.init();
    }

    async init() {
        try {
            await this.loadUsers();
        } catch (error) {
            console.log('No existing users file found, starting with empty database');
            this.users = [];
        }
    }

    async loadUsers() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf8');
            this.users = JSON.parse(data);
            
            // Find the highest ID to set nextId
            if (this.users.length > 0) {
                this.nextId = Math.max(...this.users.map(user => user.id)) + 1;
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, start with empty array
                this.users = [];
            } else {
                throw error;
            }
        }
    }

    async saveUsers() {
        try {
            // Ensure data directory exists
            const dataDir = path.dirname(this.dataFile);
            await fs.mkdir(dataDir, { recursive: true });
            
            await fs.writeFile(this.dataFile, JSON.stringify(this.users, null, 2));
        } catch (error) {
            console.error('Error saving users:', error);
            throw error;
        }
    }

    async create(userData) {
        try {
            const newUser = {
                id: this.nextId++,
                name: userData.name,
                email: userData.email.toLowerCase(),
                password: userData.password,
                registeredEvents: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.users.push(newUser);
            await this.saveUsers();

            // Return user without password
            const { password, ...userWithoutPassword } = newUser;
            return userWithoutPassword;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            return this.users.find(user => user.id === parseInt(id));
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            const userIndex = this.users.findIndex(user => user.id === parseInt(id));
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }

            // Update user data
            this.users[userIndex] = {
                ...this.users[userIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            await this.saveUsers();

            // Return user without password
            const { password, ...userWithoutPassword } = this.users[userIndex];
            return userWithoutPassword;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const userIndex = this.users.findIndex(user => user.id === parseInt(id));
            
            if (userIndex === -1) {
                throw new Error('User not found');
            }

            this.users.splice(userIndex, 1);
            await this.saveUsers();

            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    async addRegisteredEvent(userId, eventId) {
        try {
            const user = await this.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            if (!user.registeredEvents.includes(eventId)) {
                user.registeredEvents.push(eventId);
                await this.update(userId, { registeredEvents: user.registeredEvents });
            }

            return true;
        } catch (error) {
            console.error('Error adding registered event:', error);
            throw error;
        }
    }

    async removeRegisteredEvent(userId, eventId) {
        try {
            const user = await this.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            user.registeredEvents = user.registeredEvents.filter(id => id !== eventId);
            await this.update(userId, { registeredEvents: user.registeredEvents });

            return true;
        } catch (error) {
            console.error('Error removing registered event:', error);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            // Return users without passwords
            return this.users.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    async searchUsers(query) {
        try {
            const searchTerm = query.toLowerCase();
            const filteredUsers = this.users.filter(user => 
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            );

            // Return users without passwords
            return filteredUsers.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    }

    async validatePassword(userId, password) {
        try {
            const user = await this.findById(userId);
            if (!user) {
                return false;
            }

            return await bcrypt.compare(password, user.password);
        } catch (error) {
            console.error('Error validating password:', error);
            return false;
        }
    }

    async changePassword(userId, newPassword) {
        try {
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            
            await this.update(userId, { password: hashedPassword });
            return true;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    async getUserStats(userId) {
        try {
            const user = await this.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            return {
                totalEvents: user.registeredEvents.length,
                memberSince: user.createdAt,
                lastUpdated: user.updatedAt
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const userModel = new User();
module.exports = userModel;
