import { Stack } from 'expo-router';
import React from 'react';

export default function NotesLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'My Notes',
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="create" 
        options={{ 
          title: 'Create Note',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="edit/[id]" 
        options={{ 
          title: 'Edit Note',
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="view/[id]" 
        options={{ 
          title: 'Note Details',
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
        }} 
      />
    </Stack>
  );
}
