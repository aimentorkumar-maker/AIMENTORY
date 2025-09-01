-- Migration: Create notes system tables
-- Phase 2: Notes System & Simplify Pipeline

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create syllabus_nodes table (foundation for notes linking)
CREATE TABLE IF NOT EXISTS public.syllabus_nodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    parent_id UUID REFERENCES public.syllabus_nodes(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    estimated_time_minutes INTEGER DEFAULT 60,
    prerequisites TEXT[],
    learning_objectives TEXT[],
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    syllabus_node_id UUID REFERENCES public.syllabus_nodes(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    note_type TEXT CHECK (note_type IN ('text', 'pdf', 'audio', 'image', 'link')) DEFAULT 'text',
    source_url TEXT,
    source_title TEXT,
    is_simplified BOOLEAN DEFAULT false,
    simplification_data JSONB,
    confidence_score REAL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    metadata JSONB DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create note_assets table for file attachments
CREATE TABLE IF NOT EXISTS public.note_assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    ai_summary TEXT,
    extracted_text TEXT,
    ocr_confidence REAL CHECK (ocr_confidence >= 0 AND ocr_confidence <= 1),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create note_citations table for tracking sources and references
CREATE TABLE IF NOT EXISTS public.note_citations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    source_type TEXT CHECK (source_type IN ('book', 'article', 'website', 'video', 'document', 'other')) NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    url TEXT,
    page_number INTEGER,
    quote TEXT,
    publication_date DATE,
    access_date DATE DEFAULT CURRENT_DATE,
    confidence_score REAL CHECK (confidence_score >= 0 AND confidence_score <= 1) DEFAULT 0.5,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_syllabus_node_id ON public.notes(syllabus_node_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON public.notes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_notes_is_archived ON public.notes(is_archived) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON public.notes(is_favorite) WHERE is_favorite = true;

CREATE INDEX IF NOT EXISTS idx_note_assets_note_id ON public.note_assets(note_id);
CREATE INDEX IF NOT EXISTS idx_note_assets_processing_status ON public.note_assets(processing_status);

CREATE INDEX IF NOT EXISTS idx_note_citations_note_id ON public.note_citations(note_id);

CREATE INDEX IF NOT EXISTS idx_syllabus_nodes_parent_id ON public.syllabus_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_syllabus_nodes_level ON public.syllabus_nodes(level);
CREATE INDEX IF NOT EXISTS idx_syllabus_nodes_tags ON public.syllabus_nodes USING GIN(tags);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_note_assets_updated_at BEFORE UPDATE ON public.note_assets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_syllabus_nodes_updated_at BEFORE UPDATE ON public.syllabus_nodes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_nodes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notes
CREATE POLICY "Users can view their own notes" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for note_assets
CREATE POLICY "Users can view assets of their notes" ON public.note_assets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = note_assets.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert assets to their notes" ON public.note_assets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = note_assets.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update assets of their notes" ON public.note_assets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = note_assets.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete assets of their notes" ON public.note_assets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = note_assets.note_id 
            AND notes.user_id = auth.uid()
        )
    );

-- Create RLS policies for note_citations
CREATE POLICY "Users can view citations of their notes" ON public.note_citations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = note_citations.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert citations to their notes" ON public.note_citations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = note_citations.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update citations of their notes" ON public.note_citations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = note_citations.note_id 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete citations of their notes" ON public.note_citations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.notes 
            WHERE notes.id = note_citations.note_id 
            AND notes.user_id = auth.uid()
        )
    );

-- Create RLS policies for syllabus_nodes (public read, admin write)
CREATE POLICY "Anyone can view active syllabus nodes" ON public.syllabus_nodes
    FOR SELECT USING (is_active = true);

-- Insert sample syllabus data for UPSC
INSERT INTO public.syllabus_nodes (title, description, level, order_index, difficulty_level, learning_objectives, tags) VALUES
    ('General Studies Paper I', 'Indian Heritage and Culture, History, Geography', 1, 1, 'intermediate', 
     ARRAY['Understand Indian heritage', 'Learn historical events', 'Master geography concepts'], 
     ARRAY['history', 'culture', 'geography']),
    ('Ancient India', 'Ancient Indian history and culture', 2, 1, 'beginner',
     ARRAY['Know ancient civilizations', 'Understand cultural developments'],
     ARRAY['ancient', 'history', 'culture']),
    ('Medieval India', 'Medieval Indian history', 2, 2, 'intermediate',
     ARRAY['Understand medieval developments', 'Learn about rulers and empires'],
     ARRAY['medieval', 'history', 'empires']),
    ('Modern India', 'Modern Indian history and freedom struggle', 2, 3, 'advanced',
     ARRAY['Know freedom struggle', 'Understand modern developments'],
     ARRAY['modern', 'history', 'freedom struggle']);

-- Update parent_id for hierarchical structure
UPDATE public.syllabus_nodes SET parent_id = (
    SELECT id FROM public.syllabus_nodes WHERE title = 'General Studies Paper I'
) WHERE title IN ('Ancient India', 'Medieval India', 'Modern India');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.notes TO authenticated;
GRANT ALL ON public.note_assets TO authenticated;
GRANT ALL ON public.note_citations TO authenticated;
GRANT SELECT ON public.syllabus_nodes TO anon, authenticated;
GRANT ALL ON public.syllabus_nodes TO service_role;
