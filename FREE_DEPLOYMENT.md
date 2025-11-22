# Free Deployment Guide - Radsi Social Media Website

## Prerequisites
- GitHub account (free)
- MongoDB Atlas account (free)
- Vercel account (free)
- Render account (free)

---

## Step 1: Setup MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a new cluster (Free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/`)
6. Replace `<password>` with your database password
7. Add your database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/radsi`
8. In Network Access, click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)

---

## Step 2: Push Code to GitHub

```powershell
cd "D:\Social Media WEbsite"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/radsi-social-media.git
git push -u origin main
```

---

## Step 3: Deploy Backend on Render

### Using Render (Recommended - 100% Free)

1. Go to [Render](https://render.com/)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: radsi-backend
   - **Root Directory**: server
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

6. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_random_secret_key_min_32_characters_long
   CLIENT_URL=https://your-frontend-url.vercel.app
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   ```

   **Note**: Images will be stored as base64 strings in MongoDB (no external storage needed).

7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Copy your backend URL (e.g., `https://radsi-backend.onrender.com`)

**Note**: Free tier sleeps after 15 minutes of inactivity. First request may take 30-60 seconds.

---

## Step 4: Update Frontend API URL

1. Open `client/src/services/api.js`
2. Find this line:
   ```javascript
   baseURL: process.env.REACT_APP_API_URL || 'http://192.168.31.121:5000/api',
   ```
3. Replace with:
   ```javascript
   baseURL: process.env.REACT_APP_API_URL || 'https://your-backend-url.onrender.com/api',
   ```

4. Commit and push:
   ```powershell
   git add .
   git commit -m "Update API URL for production"
   git push
   ```

---

## Step 5: Deploy Frontend on Vercel

1. Go to [Vercel](https://vercel.com/)
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure:
   - **Root Directory**: client
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: build

6. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

7. Click "Deploy"
8. Wait 2-3 minutes
9. Your site will be live at: `https://your-project.vercel.app`

---

## Step 6: Update Backend CORS

1. Go back to Render dashboard
2. Click on your service → Environment
3. Update the `CLIENT_URL` environment variable:
   ```
   CLIENT_URL=https://your-project.vercel.app
   ```
4. Click "Save Changes" (service will auto-restart)

---

## Step 7: Test Your Deployment

1. Visit your Vercel URL
2. Register a new account
3. Try posting, messaging, liking posts
4. Check browser console for errors

---

## Gmail App Password Setup (for Email)

1. Go to [Google Account](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable it)
3. Security → App passwords
4. Select "Mail" and "Other (Custom name)"
5. Enter "Radsi App" and click Generate
6. Copy the 16-character password
7. Use this as `EMAIL_PASS` in Render environment variables

---

## Troubleshooting

### Backend not starting:
- Check Render logs: Dashboard → Your Service → Logs
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

### Frontend showing errors:
- Check Vercel deployment logs
- Verify API URL in `api.js` matches your Render URL
- Check browser console for CORS errors

### CORS errors:
- Ensure `CLIENT_URL` in backend matches your Vercel URL exactly
- No trailing slash in URLs
- Redeploy backend after changing environment variables

### Database connection failed:
- Check MongoDB Atlas Network Access (should have 0.0.0.0/0)
- Verify connection string has correct password
- Ensure password has no special characters (use alphanumeric only)

### Images not showing:
- Images are stored as base64 in MongoDB
- Check MongoDB storage limits (512MB free tier)
- Large images may increase database size

---

## Free Tier Limits

| Service | Free Tier | Limitations |
|---------|-----------|-------------|
| **Render** | 750 hours/month | Sleeps after 15 min inactivity |
| **Vercel** | 100 GB bandwidth | 100 deployments/day |
| **MongoDB Atlas** | 512 MB storage | Includes images stored as base64 |

**Total Monthly Cost**: $0

---

## Auto-Deploy on Git Push

Both Vercel and Render will automatically redeploy when you push to GitHub:

```powershell
git add .
git commit -m "Your changes"
git push
```

Frontend and backend will update automatically within 2-5 minutes.

---

## Quick Reference URLs

- **MongoDB Atlas**: https://cloud.mongodb.com/
- **Render**: https://dashboard.render.com/
- **Vercel**: https://vercel.com/dashboard
- **GitHub**: https://github.com/

---

## Need Help?

Common issues and solutions:
1. **Slow first load**: Normal for free tier (backend wakes up)
2. **CORS error**: Update CLIENT_URL in backend
3. **Can't register**: Check MongoDB connection and email setup
3. **Images not loading**: Check MongoDB storage space

Your app is now live and costs $0/month! 🎉
