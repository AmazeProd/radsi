# Production Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying your social media platform to production using popular hosting services.

## 📋 Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables documented
- [ ] Database backups configured
- [ ] Security measures verified
- [ ] Performance optimized
- [ ] Error handling implemented
- [ ] Logging configured

## 🗄️ Database Deployment (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create new cluster (M0 Free tier available)
4. Choose cloud provider and region
5. Wait for cluster to be created (2-5 minutes)

### Step 2: Configure Security

```
1. Database Access:
   - Add database user
   - Username: your_db_user
   - Password: generate secure password
   - Role: Read and write to any database

2. Network Access:
   - Add IP Address
   - For development: Allow access from anywhere (0.0.0.0/0)
   - For production: Add your server IPs only
```

### Step 3: Get Connection String

```
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string
4. Replace <password> with your database password
5. Replace <dbname> with your database name (e.g., social_media)

Example:
mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/social_media?retryWrites=true&w=majority
```

## 🖥️ Backend Deployment

### Option 1: Heroku

#### Setup
```powershell
# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
cd server
heroku create your-app-name

# Or for existing app
heroku git:remote -a your-app-name
```

#### Configure Environment Variables
```powershell
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your_mongodb_atlas_uri"
heroku config:set JWT_SECRET="your_jwt_secret_min_32_chars"
heroku config:set JWT_REFRESH_SECRET="your_refresh_secret"
heroku config:set CLIENT_URL="https://your-frontend-url.com"
heroku config:set PORT=5000

# Optional
heroku config:set SMTP_HOST="smtp.gmail.com"
heroku config:set SMTP_USER="your_email@gmail.com"
heroku config:set SMTP_PASSWORD="your_app_password"
heroku config:set CLOUDINARY_CLOUD_NAME="your_cloud"
heroku config:set CLOUDINARY_API_KEY="your_key"
heroku config:set CLOUDINARY_API_SECRET="your_secret"
```

#### Create Procfile
```powershell
# In server directory
echo "web: node server.js" > Procfile
```

#### Deploy
```powershell
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# OR if using develop branch
git push heroku develop:main

# View logs
heroku logs --tail
```

### Option 2: Railway

#### Setup
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway will auto-detect Node.js

#### Configure
1. Go to project → Variables
2. Add all environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your_atlas_uri
   JWT_SECRET=your_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   CLIENT_URL=https://your-frontend.com
   PORT=5000
   ```

#### Deploy
```
Automatic deployment on git push to main branch
```

### Option 3: DigitalOcean App Platform

#### Setup
1. Go to [digitalocean.com](https://www.digitalocean.com)
2. Create account
3. Navigate to Apps
4. Click "Create App"
5. Connect GitHub repository
6. Select branch and directory (server/)

#### Configure
1. Environment Variables: Add all variables
2. Build Command: `npm install`
3. Run Command: `node server.js`
4. HTTP Port: `5000`

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended for React)

#### Setup
```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from client directory
cd client
vercel
```

#### Configure
1. Build Command: `npm run build`
2. Output Directory: `build`
3. Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.herokuapp.com/api
   REACT_APP_SOCKET_URL=https://your-backend-url.herokuapp.com
   ```

#### Production Deploy
```powershell
vercel --prod
```

### Option 2: Netlify

#### Setup
1. Go to [netlify.com](https://www.netlify.com)
2. Sign up with GitHub
3. Click "New site from Git"
4. Choose your repository
5. Configure build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/build`

#### Environment Variables
```
Go to Site settings → Environment variables
Add:
REACT_APP_API_URL=https://your-backend.herokuapp.com/api
REACT_APP_SOCKET_URL=https://your-backend.herokuapp.com
```

#### Deploy
```
Automatic deployment on git push
```

### Option 3: GitHub Pages (Static only)

```powershell
# Add to client/package.json
"homepage": "https://yourusername.github.io/your-repo",

# Install gh-pages
npm install --save-dev gh-pages

# Add deploy scripts
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# Deploy
npm run deploy
```

## 🔧 Production Configuration

### Backend Production Updates

#### 1. Update CORS
```javascript
// server/server.js
app.use(cors({
  origin: [
    'https://your-frontend.vercel.app',
    'https://your-frontend.netlify.app'
  ],
  credentials: true
}));
```

#### 2. Update Socket.io CORS
```javascript
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});
```

#### 3. Enable HTTPS
```javascript
// Heroku handles this automatically
// For custom servers:
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private.key'),
  cert: fs.readFileSync('path/to/certificate.crt')
};

https.createServer(options, app).listen(443);
```

### Frontend Production Updates

#### 1. Update API URLs
```javascript
// client/src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'https://your-backend.herokuapp.com/api';
```

#### 2. Build for Production
```powershell
cd client
npm run build
```

#### 3. Test Production Build Locally
```powershell
# Install serve
npm install -g serve

# Serve build
serve -s build -p 3000
```

## 🔒 Security for Production

### 1. Environment Variables
```
✓ Never commit .env files
✓ Use strong JWT secrets (32+ characters)
✓ Use different secrets for dev/prod
✓ Rotate secrets periodically
```

### 2. Database Security
```
✓ Enable MongoDB authentication
✓ Use IP whitelisting
✓ Enable SSL/TLS connections
✓ Regular backups
```

### 3. API Security
```
✓ Enable rate limiting
✓ Use HTTPS only
✓ Implement CSRF protection
✓ Sanitize all inputs
✓ Add security headers (Helmet)
```

### 4. Update Dependencies
```powershell
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update packages
npm update
```

## 📊 Monitoring & Logging

### Application Monitoring

#### 1. Heroku Logs
```powershell
heroku logs --tail
heroku logs --source app
```

#### 2. Error Tracking (Sentry)
```powershell
npm install @sentry/node @sentry/react

# Backend
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your_dsn" });

# Frontend
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: "your_dsn" });
```

#### 3. Performance Monitoring (New Relic)
```powershell
npm install newrelic

# Add to server.js
require('newrelic');
```

## 🔄 CI/CD Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: |
        cd server && npm install
        cd ../client && npm install
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 🗂️ Database Backup

### Automated Backups (MongoDB Atlas)
```
1. Go to Atlas cluster
2. Navigate to "Backup" tab
3. Enable continuous backups
4. Configure retention policy
5. Set up point-in-time restore
```

### Manual Backup
```powershell
# Export database
mongodump --uri="your_mongodb_atlas_uri" --out=backup/

# Import database
mongorestore --uri="your_mongodb_atlas_uri" backup/
```

## 🧪 Post-Deployment Testing

### 1. API Health Check
```
curl https://your-backend.herokuapp.com/api/health
```

### 2. Frontend Accessibility
```
https://your-frontend.vercel.app
```

### 3. Database Connectivity
```
Check logs for successful MongoDB connection
```

### 4. Real-time Features
```
Test Socket.io connection
Send test message
Verify notifications
```

## 📈 Performance Optimization

### 1. Enable Compression
```javascript
// Already included in server.js
const compression = require('compression');
app.use(compression());
```

### 2. CDN for Static Assets
```
Use Cloudinary for images
Use Vercel/Netlify CDN for frontend
```

### 3. Database Optimization
```
✓ Indexes on frequently queried fields
✓ Limit populated fields
✓ Implement caching (Redis)
```

## 🚨 Troubleshooting

### Backend Won't Start
```
Check:
- All environment variables set
- MongoDB connection string correct
- Port not hardcoded (use process.env.PORT)
- Dependencies installed
```

### Frontend Can't Connect
```
Check:
- REACT_APP_API_URL correct
- CORS configured on backend
- Backend is running
- URLs match
```

### Database Connection Issues
```
Check:
- MongoDB Atlas IP whitelist
- Connection string format
- Database user permissions
- Network connectivity
```

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database deployed and accessible
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] SSL/HTTPS enabled
- [ ] CORS configured correctly
- [ ] Real-time features working
- [ ] Error monitoring setup
- [ ] Backup strategy in place
- [ ] Performance optimized
- [ ] Security hardened
- [ ] Documentation updated

## 📞 Support

### Heroku Support
- Docs: https://devcenter.heroku.com
- Status: https://status.heroku.com

### Vercel Support
- Docs: https://vercel.com/docs
- Status: https://vercel-status.com

### MongoDB Atlas Support
- Docs: https://docs.atlas.mongodb.com
- Support: https://support.mongodb.com

---

**🎉 Congratulations! Your app is now live in production!**

URLs:
- Frontend: https://your-app.vercel.app
- Backend: https://your-app.herokuapp.com
- API: https://your-app.herokuapp.com/api

Remember to:
1. Monitor logs regularly
2. Check error reports
3. Update dependencies
4. Review security advisories
5. Backup database regularly
