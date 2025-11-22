# Social Media Platform

A modern, full-stack social media platform with real-time features, user authentication, and comprehensive admin panel.

## 🚀 Features

### Core Features
- **User Authentication**: Secure registration, login, JWT-based authentication
- **User Profiles**: Customizable profiles with avatar uploads, bio, and personal information
- **Posts & Content**: Create, edit, delete posts with text and images
- **Social Interactions**: Like, comment, follow/unfollow users
- **Real-time Updates**: Live notifications, messaging, and feed updates
- **Search & Discovery**: Find users, search posts, trending hashtags
- **Admin Panel**: Comprehensive dashboard for user management and analytics

### Security Features
- JWT token-based authentication
- Bcrypt password hashing
- Input validation and sanitization
- CORS configuration
- Rate limiting
- XSS and CSRF protection
- Secure file uploads

## 🛠 Tech Stack

### Frontend
- React.js (Functional components with hooks)
- Tailwind CSS for styling
- Context API for state management
- Socket.io-client for real-time features
- Axios for API calls
- React Router for navigation

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Socket.io for real-time communication
- Bcrypt for password hashing
- Cloudinary for image uploads
- Express Validator for input validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas account)
- Git

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd social-media-website
```

### 2. Install dependencies
```bash
npm run install-all
```

Or install manually:
```bash
# Root dependencies
npm install

# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

Create `.env` files in the server directory:

```bash
cd server
cp .env.example .env
```

Update the `.env` file with your configuration:
- MongoDB connection string
- JWT secrets
- Email service credentials (for verification)
- Cloudinary credentials (for image uploads)
- Admin credentials

### 4. Database Setup

If using MongoDB locally:
```bash
# Start MongoDB service
mongod
```

Or use MongoDB Atlas (cloud):
1. Create a free account at mongodb.com/atlas
2. Create a cluster
3. Get your connection string
4. Update MONGODB_URI in .env

### 5. Run the Application

#### Development Mode
```bash
# From root directory (runs both client and server)
npm run dev

# Or run separately:
# Terminal 1 - Server
npm run server

# Terminal 2 - Client
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
social-media-website/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Context API state management
│   │   ├── services/      # API service functions
│   │   ├── utils/         # Utility functions
│   │   ├── hooks/         # Custom React hooks
│   │   └── App.js
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── uploads/         # File upload directory
│   ├── server.js        # Entry point
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user account
- `POST /api/users/:id/avatar` - Upload profile picture
- `GET /api/users/search` - Search users

### Posts
- `GET /api/posts` - Get all posts (paginated)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/user/:userId` - Get user's posts

### Interactions
- `POST /api/posts/:id/like` - Like a post
- `DELETE /api/posts/:id/unlike` - Unlike a post
- `POST /api/posts/:id/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/unfollow` - Unfollow user

### Messages
- `GET /api/messages` - Get user's messages
- `GET /api/messages/:userId` - Get conversation with user
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get platform statistics
- `PUT /api/admin/users/:id` - Update user (admin)
- `DELETE /api/admin/users/:id` - Delete user (admin)
- `PUT /api/admin/users/:id/suspend` - Suspend user account
- `GET /api/admin/posts` - Get all posts with filters
- `DELETE /api/admin/posts/:id` - Delete post (moderation)

## 🧪 Testing

```bash
# Run all tests
npm test

# Test server only
npm run test:server

# Test client only
npm run test:client
```

## 📦 Deployment

### Frontend (Vercel/Netlify)

#### Vercel
```bash
cd client
npm run build
vercel --prod
```

#### Netlify
```bash
cd client
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway)

#### Heroku
```bash
cd server
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
# Set other environment variables
git push heroku main
```

#### Railway
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Environment Variables for Production
Make sure to set all environment variables in your hosting platform:
- Database connection strings
- JWT secrets
- API keys (Cloudinary, email service)
- CORS allowed origins

## 🔒 Security Best Practices

- Never commit `.env` files
- Use strong JWT secrets (minimum 32 characters)
- Enable HTTPS in production
- Regularly update dependencies
- Implement rate limiting
- Validate and sanitize all user inputs
- Use parameterized queries to prevent SQL injection
- Implement CSRF tokens for state-changing operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Default Admin Account

After first setup, create an admin account using:
- Email: Set in ADMIN_EMAIL environment variable
- Password: Set in ADMIN_PASSWORD environment variable

**Important**: Change these credentials immediately after first login!

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify network access in MongoDB Atlas

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill process using the port

3. **Image Upload Fails**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure proper MIME types

4. **Real-time Features Not Working**
   - Check Socket.io connection
   - Verify CORS configuration
   - Check firewall settings

## 📧 Support

For support, email support@socialmedia.com or open an issue in the repository.

## 🎯 Roadmap

- [ ] Video post support
- [ ] Stories feature
- [ ] Advanced analytics
- [ ] Mobile application
- [ ] AI-powered content moderation
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Voice/Video calls

---

Built with ❤️ using React, Node.js, and MongoDB
