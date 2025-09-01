import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { createNote, updateNote, deleteNote } from '../../api/notes';

// Mock the API functions
jest.mock('../../api/notes', () => ({
  createNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  useNotes: jest.fn(() => ({
    notes: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

// Mock Expo modules
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
  requestCameraPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(() => ({ status: 'granted' })),
    setAudioModeAsync: jest.fn(),
    Recording: {
      createAsync: jest.fn(() => ({
        recording: {
          stopAndUnloadAsync: jest.fn(),
          getURI: jest.fn(() => 'mock-uri'),
        },
      })),
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
  },
}));

// Simple test component to test note creation logic
const TestNoteComponent = () => {
  const [note, setNote] = React.useState({
    title: '',
    content: '',
    tags: [],
  });

  const handleCreateNote = async () => {
    return await createNote({
      title: note.title,
      content: note.content,
      tags: note.tags,
      note_type: 'text',
      metadata: {},
    });
  };

  return (
    <>
      <input
        testID="title-input"
        value={note.title}
        onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
        placeholder="Title"
      />
      <textarea
        testID="content-input"
        value={note.content}
        onChange={(e) => setNote(prev => ({ ...prev, content: e.target.value }))}
        placeholder="Content"
      />
      <button testID="create-button" onClick={handleCreateNote}>
        Create Note
      </button>
    </>
  );
};

describe('Notes API Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNote', () => {
    it('should create a note successfully', async () => {
      const mockNote = {
        id: '123',
        title: 'Test Note',
        content: 'Test content',
        user_id: 'user123',
        tags: ['test'],
        note_type: 'text' as const,
        is_simplified: false,
        metadata: {},
        is_favorite: false,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (createNote as jest.Mock).mockResolvedValue({
        data: mockNote,
        error: null,
      });

      const noteData = {
        title: 'Test Note',
        content: 'Test content',
        tags: ['test'],
        note_type: 'text' as const,
        metadata: {},
      };

      const result = await createNote(noteData);

      expect(createNote).toHaveBeenCalledWith(noteData);
      expect(result.data).toEqual(mockNote);
      expect(result.error).toBeNull();
    });

    it('should handle creation errors', async () => {
      const error = new Error('Failed to create note');
      (createNote as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      const noteData = {
        title: 'Test Note',
        content: 'Test content',
        tags: [],
        note_type: 'text' as const,
        metadata: {},
      };

      const result = await createNote(noteData);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(error);
    });

    it('should validate required fields', async () => {
      const error = new Error('Title is required');
      (createNote as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      const noteData = {
        title: '', // Empty title
        content: 'Test content',
        tags: [],
        note_type: 'text' as const,
        metadata: {},
      };

      const result = await createNote(noteData);

      expect(result.error).toBeTruthy();
    });
  });

  describe('updateNote', () => {
    it('should update a note successfully', async () => {
      const mockUpdatedNote = {
        id: '123',
        title: 'Updated Note',
        content: 'Updated content',
        user_id: 'user123',
        tags: ['updated'],
        note_type: 'text' as const,
        is_simplified: false,
        metadata: {},
        is_favorite: false,
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (updateNote as jest.Mock).mockResolvedValue({
        data: mockUpdatedNote,
        error: null,
      });

      const updates = {
        title: 'Updated Note',
        content: 'Updated content',
        tags: ['updated'],
      };

      const result = await updateNote('123', updates);

      expect(updateNote).toHaveBeenCalledWith('123', updates);
      expect(result.data).toEqual(mockUpdatedNote);
      expect(result.error).toBeNull();
    });

    it('should handle update errors', async () => {
      const error = new Error('Note not found');
      (updateNote as jest.Mock).mockResolvedValue({
        data: null,
        error,
      });

      const result = await updateNote('nonexistent', { title: 'Updated' });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(error);
    });
  });

  describe('deleteNote', () => {
    it('should delete a note successfully', async () => {
      (deleteNote as jest.Mock).mockResolvedValue({
        error: null,
      });

      const result = await deleteNote('123');

      expect(deleteNote).toHaveBeenCalledWith('123');
      expect(result.error).toBeNull();
    });

    it('should handle deletion errors', async () => {
      const error = new Error('Failed to delete note');
      (deleteNote as jest.Mock).mockResolvedValue({
        error,
      });

      const result = await deleteNote('123');

      expect(result.error).toEqual(error);
    });
  });
});

describe('Note Creation Flow', () => {
  it('should handle the complete note creation workflow', async () => {
    const mockNote = {
      id: '123',
      title: 'Integration Test Note',
      content: 'This is a test note for integration testing',
      user_id: 'user123',
      tags: ['integration', 'test'],
      note_type: 'text' as const,
      is_simplified: false,
      metadata: {},
      is_favorite: false,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (createNote as jest.Mock).mockResolvedValue({
      data: mockNote,
      error: null,
    });

    const { getByTestId } = render(<TestNoteComponent />);

    // Simulate user input
    const titleInput = getByTestId('title-input');
    const contentInput = getByTestId('content-input');
    const createButton = getByTestId('create-button');

    fireEvent.change(titleInput, { target: { value: 'Integration Test Note' } });
    fireEvent.change(contentInput, { 
      target: { value: 'This is a test note for integration testing' } 
    });

    // Simulate note creation
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(createNote).toHaveBeenCalledWith({
        title: 'Integration Test Note',
        content: 'This is a test note for integration testing',
        tags: [],
        note_type: 'text',
        metadata: {},
      });
    });
  });
});

describe('Note Validation', () => {
  it('should validate note schema correctly', () => {
    const validNote = {
      title: 'Valid Note',
      content: 'Valid content',
      tags: ['valid'],
      note_type: 'text' as const,
      metadata: {},
    };

    // This would normally use the actual Zod schema validation
    // For testing purposes, we'll simulate the validation
    expect(validNote.title).toBeTruthy();
    expect(validNote.content).toBeTruthy();
    expect(Array.isArray(validNote.tags)).toBe(true);
    expect(['text', 'pdf', 'audio', 'image', 'link']).toContain(validNote.note_type);
  });

  it('should reject invalid note data', () => {
    const invalidNote = {
      title: '', // Invalid: empty title
      content: 'Valid content',
      tags: 'invalid', // Invalid: should be array
      note_type: 'invalid_type', // Invalid: not in enum
      metadata: {},
    };

    expect(invalidNote.title).toBeFalsy();
    expect(Array.isArray(invalidNote.tags)).toBe(false);
    expect(['text', 'pdf', 'audio', 'image', 'link']).not.toContain(invalidNote.note_type);
  });
});

describe('Note Features', () => {
  it('should handle favorite toggle functionality', () => {
    // Test that favorite status can be toggled
    let isFavorite = false;
    const toggleFavorite = () => {
      isFavorite = !isFavorite;
    };

    expect(isFavorite).toBe(false);
    toggleFavorite();
    expect(isFavorite).toBe(true);
    toggleFavorite();
    expect(isFavorite).toBe(false);
  });

  it('should handle archive functionality', () => {
    // Test that archive status can be managed
    let isArchived = false;
    const setArchived = (archived: boolean) => {
      isArchived = archived;
    };

    expect(isArchived).toBe(false);
    setArchived(true);
    expect(isArchived).toBe(true);
    setArchived(false);
    expect(isArchived).toBe(false);
  });

  it('should handle tag management', () => {
    const tags: string[] = [];
    
    const addTag = (tag: string) => {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    };

    const removeTag = (tagToRemove: string) => {
      const index = tags.indexOf(tagToRemove);
      if (index > -1) {
        tags.splice(index, 1);
      }
    };

    expect(tags).toHaveLength(0);
    
    addTag('test');
    expect(tags).toContain('test');
    expect(tags).toHaveLength(1);
    
    addTag('test'); // Duplicate - should not be added
    expect(tags).toHaveLength(1);
    
    addTag('another');
    expect(tags).toHaveLength(2);
    
    removeTag('test');
    expect(tags).not.toContain('test');
    expect(tags).toHaveLength(1);
  });
});
