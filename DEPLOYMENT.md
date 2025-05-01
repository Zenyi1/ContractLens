# Deployment Guide

This guide outlines the steps to deploy your application to production using free or low-cost services.

## Backend Deployment

### Option 1: Render.com (Free tier available)

1. **Sign up for Render**
   - Create an account at [render.com](https://render.com)

2. **Create a Web Service**
   - Click "New +" > "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - Name: contractlens-api
     - Environment: Python
     - Build Command: `pip install -r requirements.txt`
     - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
     - Select Free tier ($0/month)

3. **Set Environment Variables**
   - Add all required environment variables from `backend/env.example`
   - Include `REGISTRATION_OPEN=False` to disable new signups initially
   - Add the Supabase credentials

### Option 2: Fly.io (Free tier for small apps)

1. **Install flyctl**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**:
   ```bash
   fly auth login
   ```

3. **Create a fly.toml file in the backend folder**:
   ```bash
   cd backend
   fly launch
   ```

4. **Set secrets**:
   ```bash
   fly secrets set SUPABASE_URL=your_supabase_url
   fly secrets set SUPABASE_KEY=your_supabase_key
   fly secrets set REGISTRATION_OPEN=False
   # Set other environment variables
   ```

5. **Deploy**:
   ```bash
   fly deploy
   ```

## Frontend Deployment

### Option 1: Vercel (Free tier available)

1. **Sign up for Vercel**
   - Create an account at [vercel.com](https://vercel.com)

2. **Import your project**
   - Click "Add New..." > "Project"
   - Connect your GitHub repository
   - Configure the project:
     - Framework Preset: Next.js
     - Root Directory: SaaS
     - Build Command: `npm run build`
     - Install Command: `npm install`

3. **Set Environment Variables**
   - Add `NEXT_PUBLIC_API_URL=https://your-backend-url.com`
   - Add Supabase public credentials

4. **Deploy**
   - Click "Deploy"

### Option 2: Netlify (Free tier available)

1. **Sign up for Netlify**
   - Create an account at [netlify.com](https://netlify.com)

2. **Import your project**
   - Click "New site from Git"
   - Connect to your GitHub repository
   - Configure build settings:
     - Base directory: SaaS
     - Build command: `npm run build`
     - Publish directory: SaaS/.next
     - Advanced build settings: Add environment variables

3. **Deploy**
   - Click "Deploy site"

## Database (Supabase)

Your application is already configured to use Supabase, which offers a generous free tier:

1. **Create Tables**
   - Ensure your tables are created using the SQL in `backend/create_tables.sql`

2. **Set Up RLS Policies**
   - Configure Row Level Security policies for your tables
   - Example policy for company_profiles:
     ```sql
     CREATE POLICY "Users can view their own profiles"
     ON company_profiles
     FOR SELECT
     USING (auth.uid() = user_id);

     CREATE POLICY "Users can update their own profiles"
     ON company_profiles
     FOR UPDATE
     USING (auth.uid() = user_id);
     ```

## Controlling Registration

With the implemented toggle feature, you can control user registrations:

1. **Disable Registration During Initial Setup**
   - Set `REGISTRATION_OPEN=False` in your environment variables

2. **Create Your Admin Account**
   - Temporarily enable registration (`REGISTRATION_OPEN=True`)
   - Create your admin account
   - Disable registration again

3. **Toggle Registration Via API**
   - Use the `/admin/toggle-registration` endpoint with admin credentials
   - Check status with `/registration/status` endpoint

## Domain Setup (Optional)

1. **Purchase a domain** (e.g., from Namecheap, GoDaddy)
2. **Configure DNS records** to point to your deployed services
3. **Set up SSL** (most deployment platforms handle this automatically)

## Monitoring and Maintenance

1. **Set up application monitoring** with a free service like UptimeRobot
2. **Create regular database backups** through Supabase console
3. **Monitor your quota usage** on all platforms to avoid unexpected charges

## Cost-Efficient Scaling

If you need to scale beyond free tiers:

1. **Evaluate usage patterns** to optimize resource allocation
2. **Consider serverless options** that charge only for actual usage
3. **Implement caching strategies** to reduce database and API calls

This deployment architecture keeps costs minimal while providing a professional-quality service. 