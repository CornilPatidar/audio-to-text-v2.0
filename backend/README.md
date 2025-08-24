# AudioTextly Backend

## Railway Deployment Setup

### Required Environment Variables

Set these in your Railway project settings:

1. **DATABASE_URL** - PostgreSQL connection string
   ```
   postgresql://username:password@host:port/database
   ```

2. **JWT_SECRET** - Secret key for JWT tokens
   ```
   your-super-secret-jwt-key-here
   ```

3. **NODE_ENV** - Environment (set to "production")
   ```
   production
   ```

4. **CORS_ORIGINS** - Allowed frontend domains (comma-separated)
   ```
   http://localhost:5173,https://your-frontend-domain.vercel.app
   ```

### Deployment Steps

1. **Connect your repository** to Railway
2. **Set environment variables** in Railway dashboard
3. **Deploy** - Railway will automatically:
   - Install dependencies (`npm ci`)
   - Generate Prisma client (`npm run build`)
   - Start the server (`npm start`)

### Database Setup

The app will automatically:
- Connect to the database using `DATABASE_URL`
- Run Prisma migrations if needed
- Create tables if they don't exist

### Health Check

The deployment includes a health check endpoint at `/api/health` that Railway will use to verify the service is running.

### Troubleshooting

If deployment fails:
1. Check Railway logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure the `DATABASE_URL` points to a valid PostgreSQL database
4. Check that the database is accessible from Railway's servers
