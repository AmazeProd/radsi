# Installation & Verification Checklist

## ✅ Pre-Installation Checklist

- [ ] Node.js installed (v14+) - Run `node --version`
- [ ] npm installed - Run `npm --version`
- [ ] MongoDB installed (local) OR MongoDB Atlas account created
- [ ] Git installed (optional) - Run `git --version`
- [ ] Code editor installed (VS Code recommended)

## ✅ Installation Steps

### Step 1: Navigate to Project
```powershell
cd "d:\Social Media WEbsite"
```

### Step 2: Run Setup Script (Recommended)
```powershell
.\setup.ps1
```

**OR** Manual Installation:

```powershell
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### Step 3: Configure Environment Variables

#### Server Configuration
```powershell
# Edit server/.env
notepad server\.env
```

**Required Changes:**
- [ ] `MONGODB_URI` - Update with your MongoDB connection string
- [ ] `JWT_SECRET` - Change to a secure random string (min 32 chars)
- [ ] `JWT_REFRESH_SECRET` - Change to another secure random string
- [ ] `CLIENT_URL` - Keep as http://localhost:3000 for development

**Optional (for full features):**
- [ ] Email settings (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)
- [ ] Cloudinary settings (CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET)

#### Client Configuration
```powershell
# Client .env is already configured
# Verify settings in client/.env
```

### Step 4: Start MongoDB

**If using local MongoDB:**
```powershell
# Start MongoDB service
mongod
```

**If using MongoDB Atlas:**
- [ ] Cluster created
- [ ] Network access configured (allow your IP)
- [ ] Connection string copied to server/.env

## ✅ Running the Application

### Option 1: Run Both (Recommended)
```powershell
npm run dev
```

### Option 2: Run Separately

**Terminal 1 - Backend:**
```powershell
npm run server
```

**Terminal 2 - Frontend:**
```powershell
npm run client
```

## ✅ Verification Steps

### 1. Check Backend is Running
- [ ] Open browser to http://localhost:5000/api/health
- [ ] Should see: `{"status":"OK","message":"Server is running"}`

### 2. Check Frontend is Running
- [ ] Open browser to http://localhost:3000
- [ ] Should see the landing page with "Welcome to SocialMedia"

### 3. Test User Registration
- [ ] Click "Get Started" or "Sign Up"
- [ ] Fill in registration form:
  - Username: testuser
  - Email: test@example.com
  - Password: Test123
  - Confirm Password: Test123
- [ ] Click "Create account"
- [ ] Should redirect to /feed
- [ ] Should see success toast notification

### 4. Test User Login
- [ ] Logout (click profile icon → logout)
- [ ] Click "Login"
- [ ] Enter credentials:
  - Email: test@example.com
  - Password: Test123
- [ ] Click "Sign in"
- [ ] Should redirect to /feed
- [ ] Should see success toast notification

### 5. Test Post Creation
- [ ] On feed page, find "What's on your mind?" textarea
- [ ] Type a test post
- [ ] Click "Post" button
- [ ] Should see post appear in feed

### 6. Test Profile Page
- [ ] Click on username in navbar
- [ ] Should see profile page
- [ ] Should show user info

### 7. Test Search
- [ ] Click "Search" in navbar
- [ ] Type username in search box
- [ ] Should see search results

### 8. Create Admin Account

**Method 1: Using MongoDB Shell**
```javascript
// Connect to database
use social_media

// Create admin user
db.users.insertOne({
  username: "admin",
  email: "admin@socialmedia.com",
  password: "$2a$12$hashed_password_here", // Will be hashed on login
  role: "admin",
  isActive: true,
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})

// OR update existing user
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { role: "admin" } }
)
```

**Method 2: Register then Update**
1. Register normally
2. Update role in database to 'admin'
3. Logout and login again

### 9. Test Admin Panel
- [ ] Login as admin user
- [ ] Click "Admin" in navbar
- [ ] Should see admin dashboard
- [ ] Click "Admin Users" 
- [ ] Should see user list

### 10. Test Real-time Features

**Terminal 3 - Second Browser/Incognito:**
- [ ] Register another user
- [ ] Send message to first user
- [ ] Check if first user receives notification

## ✅ Common Issues & Solutions

### Issue: Port 5000 already in use
```powershell
# Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# OR change port in server/.env
PORT=5001
```

### Issue: Port 3000 already in use
```powershell
# When prompted, type 'Y' to run on different port
# OR set in client/.env
PORT=3001
```

### Issue: MongoDB connection error
**Check:**
- [ ] MongoDB service is running
- [ ] Connection string is correct
- [ ] Network access configured (Atlas)
- [ ] Firewall not blocking connection

### Issue: Cannot find module
```powershell
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install

cd server
Remove-Item -Recurse -Force node_modules
npm install

cd ..\client
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue: JWT errors
**Check:**
- [ ] JWT_SECRET is set in server/.env
- [ ] Token is being sent in requests
- [ ] Token hasn't expired

### Issue: CORS errors
**Check:**
- [ ] CLIENT_URL in server/.env matches frontend URL
- [ ] CORS middleware is configured
- [ ] Credentials are enabled

### Issue: Images not uploading
**Check:**
- [ ] Cloudinary credentials in server/.env
- [ ] uploads/ folder exists in server
- [ ] File size under 5MB
- [ ] File type is allowed (jpg, png, gif)

## ✅ Feature Testing Checklist

### Authentication Features
- [ ] User registration
- [ ] User login
- [ ] User logout
- [ ] Password reset (requires email config)
- [ ] JWT token refresh

### User Features
- [ ] View profile
- [ ] Edit profile
- [ ] Upload avatar
- [ ] Upload cover photo
- [ ] Follow/unfollow users
- [ ] View followers
- [ ] View following

### Post Features
- [ ] Create post (text only)
- [ ] Create post (with images)
- [ ] Edit post
- [ ] Delete post
- [ ] Like post
- [ ] Unlike post
- [ ] View single post

### Comment Features
- [ ] Add comment
- [ ] Reply to comment
- [ ] Edit comment
- [ ] Delete comment
- [ ] Like comment

### Messaging Features
- [ ] Send message
- [ ] Receive message
- [ ] View conversations
- [ ] Mark as read
- [ ] Delete message

### Search Features
- [ ] Search users
- [ ] View search results
- [ ] View trending posts

### Admin Features
- [ ] View dashboard
- [ ] View user list
- [ ] Edit user
- [ ] Suspend user
- [ ] Reactivate user
- [ ] View posts
- [ ] Delete post (moderation)
- [ ] View statistics

### Real-time Features
- [ ] Receive notifications
- [ ] Real-time messages
- [ ] Typing indicators
- [ ] Online status
- [ ] Live feed updates

## ✅ Performance Checks

- [ ] Pages load in < 2 seconds
- [ ] Images load properly
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Smooth scrolling
- [ ] Infinite scroll works

## ✅ Security Checks

- [ ] Passwords are hashed
- [ ] JWT tokens expire
- [ ] Rate limiting works
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Input validation working
- [ ] SQL injection prevention

## ✅ Browser Testing

Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

## ✅ Final Verification

- [ ] All features work as expected
- [ ] No critical errors in console
- [ ] Database is persisting data
- [ ] Real-time features working
- [ ] Admin panel accessible
- [ ] API endpoints responding
- [ ] Documentation is clear

## 🎉 Success Criteria

✅ **Installation Successful if:**
1. Both frontend and backend start without errors
2. Can register and login
3. Can create and view posts
4. Database operations work
5. No critical console errors

✅ **Production Ready if:**
1. All features tested and working
2. Environment variables configured
3. Security measures in place
4. Performance optimized
5. Documentation complete

## 📞 Need Help?

If you encounter issues:
1. Check this checklist
2. Review QUICK_START.md
3. Check DEVELOPMENT_GUIDE.md
4. Review API_DOCUMENTATION.md
5. Check error messages in console
6. Verify environment variables

## 🚀 Next Steps After Verification

1. Customize branding (logo, colors, name)
2. Configure email service
3. Set up Cloudinary for image uploads
4. Add more features
5. Write tests
6. Deploy to production

---

**Congratulations! Your social media platform is ready! 🎊**
