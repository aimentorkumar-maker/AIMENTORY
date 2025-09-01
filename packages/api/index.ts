// Supabase client
export { supabase } from './supabase';
export type { Database } from './supabase';

// Authentication
export { useAuth, useProfile } from './auth';
export { loginSchema, signupSchema } from './auth';
export type { LoginData, SignupData, AuthState } from './auth';

// Notes
export { useNotes, createNote, updateNote, deleteNote, simplifyNotes } from './notes';
export { noteSchema, noteAssetSchema } from './notes';
export type { Note, NoteAsset, NoteCitation, SyllabusNode, NoteType, SimplifyResult } from './notes';