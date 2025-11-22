# Development Guide

## 🎯 Project Goals & Architecture

This social media platform follows a modern **MERN stack architecture** with real-time capabilities and enterprise-grade security practices.

### Architecture Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   React     │ ◄──────►│   Express   │ ◄──────►│   MongoDB   │
│   Client    │   HTTP  │   Server    │   ODM   │   Database  │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │
      │                       │
      └──────► Socket.io ◄────┘
           (Real-time Events)
```

## 🏗️ Code Organization

### Backend Architecture

```
server/
├── config/          # Configuration files
├── controllers/     # Business logic
├── middleware/      # Request processing
├── models/         # Data models (Mongoose)
├── routes/         # API endpoints
└── utils/          # Helper functions
```

#### Design Patterns
- **MVC Pattern:** Model-View-Controller separation
- **Middleware Chain:** Request → Middleware → Controller → Response
- **Repository Pattern:** Models encapsulate data access
- **Factory Pattern:** Error responses, tokens

### Frontend Architecture

```
client/src/
├── components/     # Reusable UI components
├── context/        # Global state management
├── pages/          # Route components
├── services/       # API communication
└── utils/          # Helper functions
```

#### Design Patterns
- **Container/Presentational:** Smart vs. dumb components
- **Context Pattern:** Global state without props drilling
- **Service Layer:** Separation of API calls
- **HOC Pattern:** PrivateRoute, AdminRoute

## 🔧 Development Workflow

### 1. Adding a New Feature

#### Backend
```javascript
// 1. Create Model (if needed)
// server/models/Feature.js
const FeatureSchema = new mongoose.Schema({ /* ... */ });

// 2. Create Controller
// server/controllers/featureController.js
exports.createFeature = asyncHandler(async (req, res) => {
  // Implementation
});

// 3. Create Route
// server/routes/feature.js
router.post('/', protect, createFeature);

// 4. Add Route to Server
// server/server.js
app.use('/api/features', require('./routes/feature'));
```

#### Frontend
```javascript
// 1. Create Service
// client/src/services/featureService.js
export const createFeature = async (data) => {
  const response = await api.post('/features', data);
  return response.data;
};

// 2. Create Component
// client/src/components/Feature.js
const Feature = () => { /* ... */ };

// 3. Add Route
// client/src/App.js
<Route path="/feature" element={<Feature />} />
```

### 2. Code Style Guidelines

#### JavaScript/React
```javascript
// Use functional components
const MyComponent = () => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  return <div>Component</div>;
};

// Use async/await
const fetchData = async () => {
  try {
    const response = await api.get('/data');
    setData(response.data);
  } catch (error) {
    console.error(error);
  }
};

// Use destructuring
const { user, loading } = useAuth();
const { id, username, email } = user;
```

#### Node.js/Express
```javascript
// Use asyncHandler for async routes
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// Always validate input
const validation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];
```

### 3. Testing Approach

#### Unit Tests
```javascript
// server/tests/user.test.js
describe('User Controller', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ username: 'test', email: 'test@example.com' });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

#### Integration Tests
```javascript
// Test full user flow
describe('User Registration Flow', () => {
  it('should register, login, and access protected route', async () => {
    // Register
    await register(userData);
    
    // Login
    const { token } = await login(credentials);
    
    // Access protected route
    const profile = await getProfile(token);
    expect(profile).toBeDefined();
  });
});
```

## 🔐 Security Best Practices

### 1. Authentication
```javascript
// Always verify JWT tokens
const { protect } = require('../middleware/auth');
router.get('/protected', protect, controller);

// Never expose passwords
UserSchema.pre('save', async function() {
  this.password = await bcrypt.hash(this.password, 12);
});
```

### 2. Input Validation
```javascript
// Validate all inputs
const validation = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  sanitizeBody('content').trim().escape(),
];

// Sanitize database queries
const user = await User.findOne({ 
  email: req.body.email.toLowerCase().trim() 
});
```

### 3. Error Handling
```javascript
// Never expose internal errors
if (err.name === 'ValidationError') {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    // Don't send: error: err.message
  });
}
```

## 📊 Database Management

### Creating Migrations
```javascript
// Create a script for database updates
// server/scripts/migrate.js
const updateSchema = async () => {
  await User.updateMany({}, { $set: { newField: 'default' } });
};
```

### Seeding Data
```javascript
// server/scripts/seed.js
const seedData = async () => {
  // Clear existing
  await User.deleteMany({});
  
  // Insert sample data
  await User.insertMany(sampleUsers);
};
```

### Backup Strategy
```powershell
# Backup database
mongodump --uri="mongodb://localhost:27017/social_media" --out=backup/

# Restore database
mongorestore --uri="mongodb://localhost:27017/social_media" backup/
```

## 🚀 Performance Optimization

### Backend
```javascript
// 1. Use indexes
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 }, { unique: true });

// 2. Limit populated fields
const posts = await Post.find()
  .populate('user', 'username profilePicture')
  .select('content images createdAt');

// 3. Implement pagination
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const posts = await Post.find()
  .limit(limit)
  .skip(skip);
```

### Frontend
```javascript
// 1. Lazy loading
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

// 2. Memoization
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// 3. Debouncing
const debouncedSearch = useCallback(
  debounce((query) => searchUsers(query), 300),
  []
);
```

## 🐛 Debugging Tips

### Backend Debugging
```javascript
// Use morgan for HTTP logging
app.use(morgan('dev'));

// Add console logs strategically
console.log('User data:', JSON.stringify(user, null, 2));

// Use debugger
debugger; // Pause execution here
```

### Frontend Debugging
```javascript
// React DevTools
// Install React DevTools browser extension

// Console logging
console.log('Props:', props);
console.log('State:', state);

// Network tab
// Check API calls in browser DevTools
```

## 📦 Dependency Management

### Adding Dependencies
```powershell
# Backend
cd server
npm install package-name

# Frontend
cd client
npm install package-name
```

### Updating Dependencies
```powershell
# Check outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all (careful!)
npm update
```

## 🔄 Git Workflow

### Branch Strategy
```bash
main          # Production-ready code
develop       # Development branch
feature/*     # New features
bugfix/*      # Bug fixes
hotfix/*      # Production fixes
```

### Commit Messages
```bash
# Format: type(scope): subject

feat(auth): add password reset functionality
fix(posts): resolve image upload bug
docs(api): update endpoint documentation
style(ui): improve button styling
refactor(users): simplify profile update logic
test(auth): add login tests
```

## 📚 Common Tasks

### Add a New API Endpoint
1. Create controller function
2. Add validation rules
3. Create route
4. Add route to server
5. Test with Postman
6. Document in API_DOCUMENTATION.md

### Add a New Page
1. Create page component
2. Add route in App.js
3. Create service functions
4. Add to Navbar (if needed)
5. Test navigation

### Add Real-time Feature
1. Add socket event handler in socketHandler.js
2. Emit event from controller
3. Listen for event in SocketContext
4. Update UI on event receive

## 🎨 UI/UX Guidelines

### Responsive Design
```javascript
// Use Tailwind responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Content */}
</div>

// Mobile-first approach
<div className="text-sm md:text-base lg:text-lg">
  {/* Scales with screen size */}
</div>
```

### Loading States
```javascript
const [loading, setLoading] = useState(false);

if (loading) {
  return <div className="spinner"></div>;
}

return <Content />;
```

### Error Handling
```javascript
try {
  await action();
  toast.success('Success!');
} catch (error) {
  const message = error.response?.data?.message || 'Error occurred';
  toast.error(message);
}
```

## 🔧 Environment Setup

### VS Code Extensions
- ESLint
- Prettier
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- GitLens

### Recommended Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 📖 Learning Resources

### Documentation
- Express.js: https://expressjs.com/
- React: https://react.dev/
- MongoDB: https://docs.mongodb.com/
- Socket.io: https://socket.io/docs/

### Tutorials
- JWT Authentication: jwt.io
- React Hooks: react.dev/reference/react
- Mongoose: mongoosejs.com/docs/

## 🆘 Troubleshooting

### Common Issues

**Issue:** Port already in use
```powershell
# Find process
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

**Issue:** CORS errors
```javascript
// Check CORS config in server.js
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

**Issue:** MongoDB connection fails
```javascript
// Check connection string
MONGODB_URI=mongodb://localhost:27017/social_media

// Verify MongoDB is running
mongod --version
```

## 🎓 Best Practices Summary

1. ✅ Always validate and sanitize input
2. ✅ Use async/await with try-catch
3. ✅ Implement proper error handling
4. ✅ Add comments for complex logic
5. ✅ Write self-documenting code
6. ✅ Test before committing
7. ✅ Keep functions small and focused
8. ✅ Use environment variables for config
9. ✅ Log errors appropriately
10. ✅ Keep dependencies updated

---

Happy coding! If you have questions, refer to the documentation or create an issue.
