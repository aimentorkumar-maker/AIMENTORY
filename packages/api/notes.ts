import { useState, useEffect } from 'react';
import { z } from 'zod';
import { supabase } from './supabase';

// Types
export type NoteType = 'text' | 'pdf' | 'audio' | 'image' | 'link';

export interface SyllabusNode {
  id: string;
  title: string;
  description?: string;
  content?: string;
  parent_id?: string;
  level: number;
  order_index: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_time_minutes: number;
  prerequisites: string[];
  learning_objectives: string[];
  tags: string[];
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  syllabus_node_id?: string;
  tags: string[];
  note_type: NoteType;
  source_url?: string;
  source_title?: string;
  is_simplified: boolean;
  simplification_data?: Record<string, any>;
  confidence_score?: number;
  metadata: Record<string, any>;
  is_favorite: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  syllabus_node?: SyllabusNode;
  assets?: NoteAsset[];
  citations?: NoteCitation[];
}

export interface NoteAsset {
  id: string;
  note_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  mime_type?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  ai_summary?: string;
  extracted_text?: string;
  ocr_confidence?: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NoteCitation {
  id: string;
  note_id: string;
  source_type: 'book' | 'article' | 'website' | 'video' | 'document' | 'other';
  title: string;
  author?: string;
  url?: string;
  page_number?: number;
  quote?: string;
  publication_date?: string;
  access_date: string;
  confidence_score: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface SimplifyResult {
  child_view: string;
  exam_view: string;
  citations: NoteCitation[];
  confidence: number;
  key_points: string[];
  mnemonics?: string[];
}

// Zod schemas
export const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  syllabus_node_id: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  note_type: z.enum(['text', 'pdf', 'audio', 'image', 'link']).default('text'),
  source_url: z.string().url().optional(),
  source_title: z.string().optional(),
  metadata: z.record(z.any()).default({}),
});

export const noteAssetSchema = z.object({
  file_name: z.string().min(1, 'File name is required'),
  file_type: z.string().min(1, 'File type is required'),
  file_size: z.number().positive().optional(),
  mime_type: z.string().optional(),
});

export type CreateNoteData = z.infer<typeof noteSchema>;
export type CreateNoteAssetData = z.infer<typeof noteAssetSchema>;

// Hooks
export function useNotes(filters?: { 
  syllabus_node_id?: string; 
  tags?: string[]; 
  is_archived?: boolean;
  search?: string;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [filters]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('notes')
        .select(`
          *,
          syllabus_node:syllabus_nodes(*),
          assets:note_assets(*),
          citations:note_citations(*)
        `)
        .eq('is_archived', filters?.is_archived ?? false)
        .order('created_at', { ascending: false });

      if (filters?.syllabus_node_id) {
        query = query.eq('syllabus_node_id', filters.syllabus_node_id);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      setNotes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchNotes();

  return { notes, loading, error, refetch };
}

// API functions
export async function createNote(noteData: CreateNoteData): Promise<{ data: Note | null; error: Error | null }> {
  try {
    const validatedData = noteSchema.parse(noteData);
    
    const { data, error } = await supabase
      .from('notes')
      .insert([validatedData])
      .select(`
        *,
        syllabus_node:syllabus_nodes(*),
        assets:note_assets(*),
        citations:note_citations(*)
      `)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error('Failed to create note') 
    };
  }
}

export async function updateNote(
  noteId: string, 
  updates: Partial<CreateNoteData>
): Promise<{ data: Note | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', noteId)
      .select(`
        *,
        syllabus_node:syllabus_nodes(*),
        assets:note_assets(*),
        citations:note_citations(*)
      `)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error('Failed to update note') 
    };
  }
}

export async function deleteNote(noteId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { 
      error: err instanceof Error ? err : new Error('Failed to delete note') 
    };
  }
}

export async function uploadNoteAsset(
  noteId: string,
  file: File | Blob,
  fileName: string
): Promise<{ data: NoteAsset | null; error: Error | null }> {
  try {
    // Generate unique file path
    const fileExt = fileName.split('.').pop();
    const filePath = `note-assets/${noteId}/${Date.now()}.${fileExt}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('note-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('note-assets')
      .getPublicUrl(filePath);

    // Create asset record
    const assetData = {
      note_id: noteId,
      file_name: fileName,
      file_url: urlData.publicUrl,
      file_type: fileExt || 'unknown',
      file_size: file instanceof File ? file.size : undefined,
      mime_type: file instanceof File ? file.type : undefined,
    };

    const { data, error } = await supabase
      .from('note_assets')
      .insert([assetData])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error('Failed to upload asset') 
    };
  }
}

export async function simplifyNotes(
  content: string,
  options?: {
    context?: string;
    target_level?: 'child' | 'exam' | 'both';
    include_mnemonics?: boolean;
  }
): Promise<{ data: SimplifyResult | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.functions.invoke('simplify-notes', {
      body: {
        content,
        options: {
          target_level: 'both',
          include_mnemonics: true,
          ...options,
        },
      },
    });

    if (error) throw error;

    return { data, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error('Failed to simplify notes') 
    };
  }
}

export async function getSyllabusNodes(): Promise<{ data: SyllabusNode[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('syllabus_nodes')
      .select('*')
      .eq('is_active', true)
      .order('level', { ascending: true })
      .order('order_index', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (err) {
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error('Failed to fetch syllabus nodes') 
    };
  }
}

export async function toggleNoteFavorite(noteId: string): Promise<{ error: Error | null }> {
  try {
    // First get current favorite status
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('is_favorite')
      .eq('id', noteId)
      .single();

    if (fetchError) throw fetchError;

    // Toggle the favorite status
    const { error } = await supabase
      .from('notes')
      .update({ is_favorite: !note.is_favorite })
      .eq('id', noteId);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { 
      error: err instanceof Error ? err : new Error('Failed to toggle favorite') 
    };
  }
}

export async function archiveNote(noteId: string, archive = true): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('notes')
      .update({ is_archived: archive })
      .eq('id', noteId);

    if (error) throw error;

    return { error: null };
  } catch (err) {
    return { 
      error: err instanceof Error ? err : new Error('Failed to archive note') 
    };
  }
}
