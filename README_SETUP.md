# Setup Instructions for Company Profiles

## Supabase Setup

1. Log in to your Supabase account and open your project.

2. Navigate to the SQL Editor in the Supabase dashboard.

3. Create the company_profiles table by running the following SQL query:

```sql
-- Create company_profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    business_type TEXT,
    primary_customers TEXT,
    contract_preferences TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own company profile
CREATE POLICY "Users can view their own company profile" ON company_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own company profile
CREATE POLICY "Users can insert their own company profile" ON company_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own company profile
CREATE POLICY "Users can update their own company profile" ON company_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own company profile
CREATE POLICY "Users can delete their own company profile" ON company_profiles
    FOR DELETE
    USING (auth.uid() = user_id);
```

4. In the backend directory, make sure your `.env` file has the correct Supabase credentials:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
```

5. In the SaaS directory, update your `.env.local` file with the correct Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Running the Application

1. Start the backend server:

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

2. Start the frontend development server:

```
cd SaaS
npm install
npm run dev
```

3. Open your browser and navigate to http://localhost:3000. 

4. When you sign up or log in for the first time, you'll be prompted to create a company profile. This profile will be used in the contract analysis feature to replace generic "Seller" references with your company name. 