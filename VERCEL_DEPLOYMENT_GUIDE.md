# Vercel Deployment Guide

## Required Environment Variables

You need to set the following environment variables in your Vercel project:

1. **MongoDB Connection**
   - `MONGODB_URI`: Your MongoDB connection string
     ```
     mongodb+srv://<username>:<password>@cluster0.nesg8rs.mongodb.net/inmobiliaria?retryWrites=true&w=majority
     ```

2. **JWT Configuration**
   - `JWT_SECRET`: A secure secret key for JWT token generation
   - `JWT_EXPIRES_IN`: Token expiration time (e.g., '30d' for 30 days)

3. **Server Configuration**
   - `NODE_ENV`: Set to 'production' for production
   - `PORT`: Port for the server (Vercel will set this automatically)

4. **CORS Configuration**
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed origins
     ```
     https://your-vercel-app.vercel.app,https://*.vercel.app
     ```

## How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each environment variable from the list above
4. For production, make sure to add them to the "Production" environment
5. If you have a preview environment, add them there as well

## Testing the Deployment

After deployment, you can test the following endpoints:

1. **Health Check**
   ```
   GET /api/health
   ```
   Should return a 200 status with database connection status.

2. **API Base URL**
   Make sure your frontend is configured to use the correct API base URL. In production, it should point to your Vercel URL:
   ```
   https://your-vercel-app.vercel.app/api
   ```

## Troubleshooting

1. **Database Connection Issues**
   - Verify your MongoDB Atlas IP whitelist includes Vercel's IPs
   - Check the Vercel logs for detailed error messages

2. **CORS Errors**
   - Ensure your `ALLOWED_ORIGINS` includes your Vercel app URL
   - Check the browser console for specific CORS errors

3. **Environment Variables**
   - Double-check that all required environment variables are set in Vercel
   - Remember to redeploy after changing environment variables

## Deployment Commands

To deploy to Vercel:

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Support

If you encounter any issues, please check the Vercel documentation or contact support with the error logs from the Vercel dashboard.
