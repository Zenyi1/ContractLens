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