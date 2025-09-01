import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useNotes, toggleNoteFavorite, archiveNote, type Note } from '../../packages/api';
import { Card } from '../../packages/ui';
import FloatingNoteButton from '../../components/notes/FloatingNoteButton';

export default function NotesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { notes, loading, error, refetch } = useNotes({
    search: searchQuery,
    tags: filterTags.length > 0 ? filterTags : undefined,
    is_archived: showArchived,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (noteId: string) => {
    const { error } = await toggleNoteFavorite(noteId);
    if (error) {
      Alert.alert('Error', 'Failed to update favorite status');
    } else {
      refetch();
    }
  };

  const handleArchiveNote = async (noteId: string) => {
    const { error } = await archiveNote(noteId, !showArchived);
    if (error) {
      Alert.alert('Error', 'Failed to archive note');
    } else {
      refetch();
    }
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => archiveNote(noteId, true),
        },
      ]
    );
  };

  const renderNote = ({ item: note }: { item: Note }) => (
    <Card style={styles.noteCard}>
      <TouchableOpacity
        style={styles.noteContent}
        onPress={() => router.push(`/(notes)/view/${note.id}`)}
      >
        <View style={styles.noteHeader}>
          <Text style={styles.noteTitle} numberOfLines={1}>
            {note.title}
          </Text>
          <View style={styles.noteActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleFavorite(note.id)}
            >
              <Text style={styles.actionIcon}>
                {note.is_favorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/(notes)/edit/${note.id}`)}
            >
              <Text style={styles.actionIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleArchiveNote(note.id)}
            >
              <Text style={styles.actionIcon}>
                {showArchived ? '📥' : '🗃️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.notePreview} numberOfLines={3}>
          {note.content}
        </Text>

        <View style={styles.noteFooter}>
          <View style={styles.noteTags}>
            {note.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {note.tags.length > 3 && (
              <Text style={styles.tagMore}>+{note.tags.length - 3}</Text>
            )}
          </View>
          
          <View style={styles.noteMetadata}>
            <Text style={styles.noteType}>{note.note_type}</Text>
            <Text style={styles.noteDate}>
              {new Date(note.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {note.is_simplified && (
          <View style={styles.simplifiedBadge}>
            <Text style={styles.simplifiedText}>✨ Simplified</Text>
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>
        {showArchived ? 'No archived notes' : 'No notes yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {showArchived 
          ? 'Your archived notes will appear here'
          : 'Tap the floating button to create your first note'
        }
      </Text>
    </View>
  );

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load notes</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#64748b"
        />
        <TouchableOpacity
          style={[styles.filterButton, showArchived && styles.filterButtonActive]}
          onPress={() => setShowArchived(!showArchived)}
        >
          <Text style={styles.filterText}>
            {showArchived ? '📥' : '📝'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6366f1']}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <FloatingNoteButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
  },
  filterText: {
    fontSize: 18,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  noteCard: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  noteContent: {
    padding: 16,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 16,
  },
  notePreview: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  noteTags: {
    flexDirection: 'row',
    flex: 1,
    gap: 4,
    marginRight: 8,
  },
  tag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#3730a3',
    fontWeight: '500',
  },
  tagMore: {
    fontSize: 10,
    color: '#64748b',
    marginLeft: 4,
  },
  noteMetadata: {
    alignItems: 'flex-end',
  },
  noteType: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  noteDate: {
    fontSize: 10,
    color: '#94a3b8',
  },
  simplifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  simplifiedText: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '500',
  },
});
