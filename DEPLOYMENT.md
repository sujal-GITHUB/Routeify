# Routeify Deployment Guide

## Issues Fixed

### 1. Client-Side Routing (404 on Refresh)
The main issue was that the production server wasn't configured to handle client-side routing for React Router.

**Solutions Applied:**
- Added `_redirects` file for Netlify
- Added `vercel.json` for Vite/Vercel
- Added `netlify.toml` for Netlify
- Added `nginx.conf` for custom server deployments

### 2. Token Management
- Added token cleanup initialization in `main.jsx`
- Improved wrapper components with better loading states
- Added proper token validation logging

### 3. Favicon Issues
- Fixed favicon paths and added proper favicon files

## Deployment Steps

### For Netlify:
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `frontend/dist` folder to Netlify
3. The `_redirects` and `netlify.toml` files will handle routing

### For Vercel:
1. Connect your repository to Vercel
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/dist`
4. The `vercel.json` file will handle routing

### For Custom Server (nginx):
1. Copy `nginx.conf` to your server
2. Update the paths in the nginx configuration
3. Restart nginx service

## Environment Variables

Make sure these are set in your deployment environment:

**Frontend:**
- `VITE_MAPBOX_ACCESS_TOKEN` - Your Mapbox API token
- `VITE_BASE_URL` - Your backend API URL (e.g., https://api.routeify.live)

**Backend:**
- `PORT` - Server port (default: 4000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret for token signing
- `RAZORPAY_KEY_ID` - Razorpay payment gateway key
- `RAZORPAY_KEY_SECRET` - Razorpay payment gateway secret

## Testing the Fix

After deployment:
1. Navigate to any route (e.g., `/home`, `/captain`)
2. Refresh the page - should work without 404 errors
3. Check browser console - no more favicon or home resource 404 errors
4. Token validation should work properly across page refreshes

## Content Script Messages

The "content-script.js" and "AdUnit" messages are from browser extensions (ad blockers, privacy tools, etc.) and are not related to your application. They can be safely ignored.
