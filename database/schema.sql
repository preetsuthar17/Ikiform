-- Form Builder Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Forms table - stores form metadata
CREATE TABLE forms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    share_url VARCHAR(255) UNIQUE,
    password_protected BOOLEAN DEFAULT false,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Form fields table - stores individual form fields
CREATE TABLE form_fields (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    field_type VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    placeholder VARCHAR(255),
    options JSONB DEFAULT '[]',
    required BOOLEAN DEFAULT false,
    field_order INTEGER NOT NULL,
    validation_rules JSONB DEFAULT '{}',
    conditional_logic JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Form responses table - stores submitted responses
CREATE TABLE form_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    respondent_email VARCHAR(255),
    response_data JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT,
    completion_time INTEGER, -- in seconds
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- File uploads table - stores uploaded files metadata
CREATE TABLE file_uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    field_id UUID REFERENCES form_fields(id) ON DELETE CASCADE,
    response_id UUID REFERENCES form_responses(id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Form analytics table - stores form analytics data
CREATE TABLE form_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    submissions INTEGER DEFAULT 0,
    average_completion_time INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_forms_user_id ON forms(user_id);
CREATE INDEX idx_forms_share_url ON forms(share_url);
CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_form_fields_order ON form_fields(form_id, field_order);
CREATE INDEX idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX idx_form_responses_submitted_at ON form_responses(submitted_at);
CREATE INDEX idx_form_analytics_form_id ON form_analytics(form_id);
CREATE INDEX idx_file_uploads_form_id ON file_uploads(form_id);
CREATE INDEX idx_file_uploads_response_id ON file_uploads(response_id);

-- Enable Row Level Security (RLS)
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forms table
CREATE POLICY "Users can view their own forms" ON forms
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own forms" ON forms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms" ON forms
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms" ON forms
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for form_fields table
CREATE POLICY "Users can view form fields of their forms" ON form_fields
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_fields.form_id 
            AND forms.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert form fields to their forms" ON form_fields
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_fields.form_id 
            AND forms.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update form fields of their forms" ON form_fields
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_fields.form_id 
            AND forms.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete form fields of their forms" ON form_fields
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_fields.form_id 
            AND forms.user_id = auth.uid()
        )
    );

-- RLS Policies for form_responses table
CREATE POLICY "Users can view responses to their forms" ON form_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_responses.form_id 
            AND forms.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert responses to published forms" ON form_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_responses.form_id 
            AND forms.is_published = true
        )
    );

-- RLS Policies for form_analytics table
CREATE POLICY "Users can view analytics of their forms" ON form_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_analytics.form_id 
            AND forms.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update analytics of their forms" ON form_analytics
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = form_analytics.form_id 
            AND forms.user_id = auth.uid()
        )
    );

CREATE POLICY "Analytics can be inserted for any form" ON form_analytics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for file_uploads table
CREATE POLICY "Users can view file uploads for their forms" ON file_uploads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = file_uploads.form_id 
            AND forms.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert file uploads for published forms" ON file_uploads
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = file_uploads.form_id 
            AND forms.is_published = true
        )
    );

CREATE POLICY "Users can delete file uploads for their forms" ON file_uploads
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM forms 
            WHERE forms.id = file_uploads.form_id 
            AND forms.user_id = auth.uid()
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_forms_updated_at 
    BEFORE UPDATE ON forms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_analytics_updated_at 
    BEFORE UPDATE ON form_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Database functions for analytics
CREATE OR REPLACE FUNCTION increment_form_views(form_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO form_analytics (form_id, views, submissions, average_completion_time, bounce_rate, conversion_rate)
    VALUES (form_id, 1, 0, 0, 0, 0)
    ON CONFLICT (form_id)
    DO UPDATE SET 
        views = form_analytics.views + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique share URLs
CREATE OR REPLACE FUNCTION generate_share_url()
RETURNS trigger AS $$
BEGIN
    IF NEW.share_url IS NULL THEN
        NEW.share_url := encode(gen_random_bytes(16), 'hex');
        
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM forms WHERE share_url = NEW.share_url) LOOP
            NEW.share_url := encode(gen_random_bytes(16), 'hex');
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate share URLs
CREATE TRIGGER forms_generate_share_url
    BEFORE INSERT ON forms
    FOR EACH ROW
    EXECUTE FUNCTION generate_share_url();
