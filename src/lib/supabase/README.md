# Supabase Setup for Ikiform Waitlist

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings

## Environment Variables

Create a `.env.local` file in the root directory with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Database Setup

Run this SQL in your Supabase SQL editor to create the waitlist table:

```sql
-- Create waitlist table
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  email TEXT NOT NULL UNIQUE
);

-- Create index on email for faster lookups
CREATE INDEX idx_waitlist_email ON waitlist(email);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts and reads (adjust as needed)
CREATE POLICY "Anyone can insert into waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read waitlist" ON waitlist
  FOR SELECT USING (true);
```

## Features

- ✅ Email validation
- ✅ Duplicate email prevention
- ✅ Loading states
- ✅ Success/error messages
- ✅ TypeScript support
- ✅ Responsive design
