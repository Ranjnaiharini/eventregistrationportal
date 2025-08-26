# Event Registration Portal - Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

## Installation Steps

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd event-registration-portal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (optional):
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-key-change-in-production
```

### 4. Start the Application
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

## Project Structure

```
event-registration-portal/
├── public/                 # Frontend static files
│   ├── css/
│   │   └── style.css      # Custom CSS styles
│   ├── js/
│   │   └── app.js         # Frontend JavaScript
│   └── index.html         # Main HTML file
├── server/                 # Backend Node.js code
│   ├── middleware/
│   │   └── auth.js        # JWT authentication middleware
│   ├── models/
│   │   ├── user.js        # User data model
│   │   └── event.js       # Event data model
│   ├── routes/
│   │   ├── auth.js        # Authentication routes
│   │   └── events.js      # Event management routes
│   └── server.js          # Main server file
├── server/data/            # JSON data storage (auto-created)
├── package.json            # Dependencies and scripts
├── .gitignore             # Git ignore rules
├── README.md              # Project documentation
└── SETUP.md               # This setup guide
```

## Features Demonstrated

### Frontend (10 marks)
✅ **Responsive Design**: Mobile-first approach with Bootstrap 5
✅ **Modern UI**: Gradient backgrounds, animations, hover effects
✅ **Interactive Elements**: Modals, forms, dynamic content
✅ **Accessibility**: Semantic HTML, proper form labels
✅ **Cross-browser**: Compatible with modern browsers

### Backend (15 marks)
✅ **Node.js Server**: Express.js with proper middleware
✅ **Async I/O**: Non-blocking operations throughout
✅ **Modular Architecture**: Separated routes, models, middleware
✅ **Authentication**: JWT tokens with bcrypt password hashing
✅ **Data Validation**: Input validation and error handling
✅ **RESTful API**: Proper HTTP methods and status codes

## Testing the Application

### 1. User Registration
- Click "Register" in navigation
- Fill out the registration form
- Verify user is created successfully

### 2. User Login
- Click "Login" in navigation
- Use registered email and password
- Verify JWT token is generated

### 3. Event Creation
- Login as a user
- Click "Create Event" button
- Fill out event form and submit
- Verify event appears in events list

### 4. Event Registration
- Browse available events
- Click "Register" on an event
- Verify registration count increases

### 5. API Testing
Test the backend endpoints:
```bash
# Health check
curl http://localhost:3000/api/health

# Get events
curl http://localhost:3000/api/events

# Register user (replace with actual data)
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with auto-restart
npm run dev

# Start production server
npm start

# Check for linting issues (if ESLint is configured)
npm run lint

# Run tests (if test framework is configured)
npm test
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process using port 3000
   npx kill-port 3000
   # Or change port in .env file
   ```

2. **Module not found errors**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Permission errors (Windows)**
   - Run PowerShell as Administrator
   - Or use WSL for Linux-like environment

4. **Data not persisting**
   - Check if `server/data/` directory exists
   - Verify file permissions
   - Check console for error messages

### Debug Mode
Enable debug logging by setting environment variable:
```bash
# Windows
set DEBUG=*

# Linux/Mac
export DEBUG=*
npm run dev
```

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-production-secret-key
```

### Process Management
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start server/server.js --name "event-portal"

# Monitor application
pm2 monit

# View logs
pm2 logs event-portal
```

### Security Considerations
- Change default JWT secret
- Use HTTPS in production
- Implement rate limiting
- Add input sanitization
- Use environment variables for secrets

## API Documentation

### Authentication Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User authentication
- `GET /api/profile` - User profile (protected)

### Event Endpoints
- `GET /api/events` - List all events
- `POST /api/events` - Create event (protected)
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event (protected)
- `DELETE /api/events/:id` - Delete event (protected)
- `POST /api/events/:id/register` - Register for event (protected)

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
MIT License - see LICENSE file for details
