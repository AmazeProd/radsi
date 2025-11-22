# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Quick Installation

### 1. Clone and Install Dependencies
```powershell
# Navigate to project directory
cd "d:\Social Media WEbsite"

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ..\client
npm install

# Return to root
cd ..
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
```powershell
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Update in server/.env

### 3. Configure Environment Variables

The `.env` file is already created in the server directory. Update these values:

```powershell
# Edit server/.env
notepad server\.env
```

**Required Changes:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Change to a secure random string (min 32 chars)
- `JWT_REFRESH_SECRET` - Change to another secure random string

**Optional (for full features):**
- Email settings (for password reset)
- Cloudinary credentials (for image uploads)

### 4. Start the Application

**Development Mode (runs both frontend and backend):**
```powershell
npm run dev
```

**OR run separately:**

Terminal 1 - Backend:
```powershell
npm run server
```

Terminal 2 - Frontend:
```powershell
npm run client
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health

### 6. Create Admin Account

After starting the server, the admin account can be created by registering with the email specified in `.env`:

```
Email: admin@socialmedia.com
Password: AdminPassword123!
```

Then manually update the user's role to 'admin' in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@socialmedia.com" },
  { $set: { role: "admin" } }
)
```

## Troubleshooting

### Port Already in Use
```powershell
# Change ports in:
# server/.env - PORT=5001
# client/package.json - Update proxy
```

### MongoDB Connection Error
```
Check:
1. MongoDB is running (mongod)
2. Connection string in .env is correct
3. Network access allowed in MongoDB Atlas
```

### Module Not Found Errors
```powershell
# Reinstall dependencies
cd server
Remove-Item -Recurse -Force node_modules
npm install

cd ..\client
Remove-Item -Recurse -Force node_modules
npm install
```

## Development Workflow

1. **Make changes** to code
2. **Hot reload** is enabled - changes reflect automatically
3. **Check console** for errors
4. **Test API** using browser or Postman

## Building for Production

```powershell
# Build frontend
cd client
npm run build

# The build folder will be in client/build
```

## Testing

```powershell
# Run all tests
npm test

# Server tests only
npm run test:server

# Client tests only
npm run test:client
```

## Useful Commands

```powershell
# Install all dependencies at once
npm run install-all

# Run development mode
npm run dev

# Build production
npm run build

# View server logs
cd server
npm run dev

# Clear cache and restart
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

## Next Steps

1. ✅ Register a new account
2. ✅ Update your profile
3. ✅ Create your first post
4. ✅ Follow other users
5. ✅ Send messages
6. ✅ Explore the admin panel (if admin)

## Additional Resources

- Full API Documentation: See `API_DOCUMENTATION.md`
- Main README: See `README.md`
- Report Issues: Create an issue in the repository

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure MongoDB is running
4. Check that all dependencies are installed
5. Review the troubleshooting section above

Happy coding! 🚀
