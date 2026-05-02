-- Database Schema for EduBot
-- Use these in your Supabase SQL Editor

-- 1. Create Subjects table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Topics table
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE(name, subject_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Resources table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'link', -- 'link', 'image', 'document', 'note'
    url TEXT,
    content TEXT, -- For notes
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for performance
CREATE INDEX idx_resources_title ON resources USING gin (to_tsvector('english', title));
CREATE INDEX idx_subjects_name ON subjects(name);
CREATE INDEX idx_topics_name ON topics(name);
CREATE INDEX idx_resources_tags ON resources USING gin (tags);

-- Optional: Full Text Search configuration if needed
