import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { 
  createNote, 
  uploadNoteAsset, 
  getSyllabusNodes, 
  simplifyNotes,
  type CreateNoteData, 
  type SyllabusNode,
  type NoteType 
} from '../../packages/api';
import { Button, Card, Input } from '../../packages/ui';

export default function CreateNoteScreen() {
  const { type: initialType } = useLocalSearchParams<{ type?: NoteType }>();
  
  const [formData, setFormData] = useState<CreateNoteData>({
    title: '',
    content: '',
    tags: [],
    note_type: (initialType as NoteType) || 'text',
    metadata: {},
  });
  
  const [syllabusNodes, setSyllabusNodes] = useState<SyllabusNode[]>([]);
  const [selectedSyllabusNode, setSelectedSyllabusNode] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    loadSyllabusNodes();
    requestPermissions();
  }, []);

  const loadSyllabusNodes = async () => {
    const { data, error } = await getSyllabusNodes();
    if (data) {
      setSyllabusNodes(data);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (audioStatus !== 'granted' || mediaStatus !== 'granted' || cameraStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'This app needs camera, microphone, and media library permissions to work properly.'
        );
      }
    }
  };

  const handleInputChange = (field: keyof CreateNoteData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        setFormData(prev => ({
          ...prev,
          note_type: result.assets[0].mimeType?.includes('pdf') ? 'pdf' : 'text',
          title: prev.title || result.assets[0].name.split('.')[0],
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        setFormData(prev => ({
          ...prev,
          note_type: 'image',
          title: prev.title || 'Image Note',
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
        setFormData(prev => ({
          ...prev,
          note_type: 'image',
          title: prev.title || 'Camera Note',
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setFormData(prev => ({
        ...prev,
        note_type: 'audio',
        title: prev.title || 'Voice Note',
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      if (uri) {
        setSelectedFile({
          uri,
          name: `voice-note-${Date.now()}.m4a`,
          type: 'audio/m4a',
        });
      }
      setRecording(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handleSimplify = async () => {
    if (!formData.content.trim()) {
      Alert.alert('Error', 'Please enter some content to simplify');
      return;
    }

    setIsSimplifying(true);
    try {
      const { data, error } = await simplifyNotes(formData.content, {
        context: selectedSyllabusNode ? 
          syllabusNodes.find(n => n.id === selectedSyllabusNode)?.title : 
          'General UPSC preparation',
        target_level: 'both',
        include_mnemonics: true,
      });

      if (error) throw error;

      if (data) {
        setFormData(prev => ({
          ...prev,
          content: `${prev.content}\n\n--- AI Simplified ---\n\n**Key Points:**\n${data.key_points.map(point => `• ${point}`).join('\n')}\n\n**Child-Friendly Explanation:**\n${data.child_view}\n\n**Exam Focus:**\n${data.exam_view}${data.mnemonics ? `\n\n**Memory Aids:**\n${data.mnemonics.map(m => `• ${m}`).join('\n')}` : ''}`,
          metadata: {
            ...prev.metadata,
            simplified: true,
            simplification_data: data,
          },
        }));
        
        Alert.alert('Success', 'Content has been simplified and added to your note!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to simplify content');
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }

    setIsLoading(true);
    try {
      const noteData = {
        ...formData,
        syllabus_node_id: selectedSyllabusNode || undefined,
      };

      const { data: note, error } = await createNote(noteData);
      if (error) throw error;

      // Upload file if selected
      if (selectedFile && note) {
        const fileBlob = await fetch(selectedFile.uri).then(r => r.blob());
        await uploadNoteAsset(note.id, fileBlob, selectedFile.name);
      }

      Alert.alert('Success', 'Note created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create note');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <View style={styles.form}>
          {/* Note Type Selector */}
          <View style={styles.typeSelector}>
            <Text style={styles.label}>Note Type</Text>
            <View style={styles.typeButtons}>
              {(['text', 'pdf', 'audio', 'image'] as NoteType[]).map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.note_type === type && styles.typeButtonActive,
                  ]}
                  onPress={() => handleInputChange('note_type', type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    formData.note_type === type && styles.typeButtonTextActive,
                  ]}>
                    {type === 'text' && '📝'}
                    {type === 'pdf' && '📄'}
                    {type === 'audio' && '🎤'}
                    {type === 'image' && '📷'}
                    {' '}
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title Input */}
          <Input
            label="Title"
            placeholder="Enter note title"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            fullWidth
          />

          {/* Syllabus Node Selector */}
          <View style={styles.syllabusSelector}>
            <Text style={styles.label}>Link to Syllabus Topic (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.syllabusOptions}>
                <TouchableOpacity
                  style={[
                    styles.syllabusOption,
                    !selectedSyllabusNode && styles.syllabusOptionActive,
                  ]}
                  onPress={() => setSelectedSyllabusNode('')}
                >
                  <Text style={styles.syllabusOptionText}>None</Text>
                </TouchableOpacity>
                {syllabusNodes.map(node => (
                  <TouchableOpacity
                    key={node.id}
                    style={[
                      styles.syllabusOption,
                      selectedSyllabusNode === node.id && styles.syllabusOptionActive,
                    ]}
                    onPress={() => setSelectedSyllabusNode(node.id)}
                  >
                    <Text style={styles.syllabusOptionText}>{node.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* File Upload Section */}
          {formData.note_type !== 'text' && (
            <View style={styles.fileSection}>
              <Text style={styles.label}>Attach File</Text>
              <View style={styles.fileButtons}>
                {formData.note_type === 'pdf' && (
                  <Button
                    title="📎 Select File"
                    onPress={handleFileUpload}
                    variant="outline"
                    size="sm"
                  />
                )}
                {formData.note_type === 'image' && (
                  <>
                    <Button
                      title="📷 Camera"
                      onPress={handleTakePhoto}
                      variant="outline"
                      size="sm"
                    />
                    <Button
                      title="🖼️ Gallery"
                      onPress={handleImageUpload}
                      variant="outline"
                      size="sm"
                    />
                  </>
                )}
                {formData.note_type === 'audio' && (
                  <Button
                    title={isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
                    onPress={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? 'danger' : 'outline'}
                    size="sm"
                  />
                )}
              </View>
              {selectedFile && (
                <Text style={styles.fileName}>📎 {selectedFile.name}</Text>
              )}
            </View>
          )}

          {/* Content Input */}
          <Input
            label="Content"
            placeholder="Enter your note content..."
            value={formData.content}
            onChangeText={(value) => handleInputChange('content', value)}
            multiline
            numberOfLines={8}
            fullWidth
          />

          {/* AI Simplify Button */}
          <Button
            title={isSimplifying ? 'Simplifying...' : '✨ AI Simplify & Enhance'}
            onPress={handleSimplify}
            variant="outline"
            loading={isSimplifying}
            disabled={!formData.content.trim()}
            fullWidth
          />

          {/* Tags Input */}
          <View style={styles.tagsSection}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagInput}>
              <Input
                placeholder="Add tags..."
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                style={styles.tagInputField}
              />
              <Button
                title="Add"
                onPress={handleAddTag}
                size="sm"
                disabled={!tagInput.trim()}
              />
            </View>
            {formData.tags.length > 0 && (
              <View style={styles.tags}>
                {formData.tags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tag}
                    onPress={() => handleRemoveTag(tag)}
                  >
                    <Text style={styles.tagText}>#{tag} ✕</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Save Button */}
          <Button
            title={isLoading ? 'Saving...' : 'Save Note'}
            onPress={handleSave}
            loading={isLoading}
            disabled={!formData.title.trim() || !formData.content.trim()}
            fullWidth
            size="lg"
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  form: {
    gap: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  typeSelector: {
    marginBottom: 4,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#6366f1',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  syllabusSelector: {
    marginBottom: 4,
  },
  syllabusOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  syllabusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
  },
  syllabusOptionActive: {
    backgroundColor: '#6366f1',
  },
  syllabusOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  fileSection: {
    marginBottom: 4,
  },
  fileButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  fileName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    fontStyle: 'italic',
  },
  tagsSection: {
    marginBottom: 4,
  },
  tagInput: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  tagInputField: {
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#3730a3',
    fontWeight: '500',
  },
});
