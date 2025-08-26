# Event Registration Portal

## Project Overview
A full-stack web application for event registration with responsive frontend and Node.js backend.

## Features
- **User Registration & Authentication**: Secure user signup and login
- **Event Management**: Create, view, and manage events
- **Registration System**: Users can register for events
- **Responsive Design**: Mobile-first approach using Bootstrap
- **Real-time Updates**: Live registration status updates

## Technology Stack

### Frontend (10 marks)
- **HTML5**: Semantic markup with proper structure
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **JavaScript**: ES6+ features, async/await, modular architecture
- **Bootstrap 5**: Responsive grid system, components, and utilities
- **Font Awesome**: Icon library for enhanced UI

### Backend (15 marks)
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **JWT Authentication**: Secure user authentication with tokens
- **bcryptjs**: Password hashing for security
- **Async I/O**: Non-blocking operations with promises
- **Modular Architecture**: Separated routes, models, and middleware

### Data Storage
- **JSON Files**: File-based storage for users and events
- **Async File Operations**: Non-blocking file I/O with fs.promises
- **Data Validation**: Input validation and sanitization

### Version Control
- **Git**: Local version control
- **GitHub**: Remote repository hosting
- **Proper .gitignore**: Excludes unnecessary files

## Project Structure
```
Event Registration Portal/
├── public/
│   ├── css/
│   ├── js/
│   └── index.html
├── server/
│   ├── routes/
│   ├── models/
│   └── server.js
├── package.json
├── .gitignore
└── README.md
```

## Setup Instructions
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm start` to start the server
4. Open `http://localhost:3000` in your browser

## API Endpoints

### Authentication
- `POST /api/register` - User registration with password hashing
- `POST /api/login` - User login with JWT token generation
- `GET /api/profile` - Get user profile (protected)
- `GET /api/health` - Health check endpoint

### Events
- `GET /api/events` - Get all events with optional authentication
- `GET /api/events/:id` - Get specific event details
- `POST /api/events` - Create new event (requires authentication)
- `PUT /api/events/:id` - Update event (requires ownership)
- `DELETE /api/events/:id` - Delete event (requires ownership)
- `POST /api/events/:id/register` - Register for event (requires authentication)
- `GET /api/events/category/:category` - Get events by category
- `GET /api/events/search?q=query` - Search events by keyword

### Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Proper HTTP status codes and error messages
- **Async Operations**: Non-blocking I/O throughout

## Team Members & Roles

### Frontend Developer (10 marks)
- **HTML5**: Semantic structure, accessibility, forms
- **CSS3**: Responsive design, animations, modern styling
- **JavaScript**: ES6+ features, event handling, API integration
- **Bootstrap 5**: Grid system, components, responsive utilities
- **UI/UX**: User experience, responsive design, accessibility

### Backend Developer (15 marks)
- **Node.js**: Server setup, async operations, modules
- **Express.js**: Routing, middleware, error handling
- **Authentication**: JWT tokens, password hashing, security
- **Data Models**: User and Event models with async I/O
- **API Design**: RESTful endpoints, validation, error handling

### Full Stack Integration
- **API Integration**: Frontend-backend communication
- **Data Flow**: User authentication and event management
- **Error Handling**: Consistent error messages across layers
- **Performance**: Optimized loading and user experience

## Evaluation Criteria
- Responsive Frontend (HTML, CSS, JS): 10 marks
- Node.js Server Functionality: 15 marks
- Total: 25 marks
