import { styled } from 'nativewind';
import React from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth, useProfile } from '../../../packages/api';
import { Button, Card, CardContent, CardHeader } from '../../../packages/ui';
import FloatingNoteButton from '../../../components/notes/FloatingNoteButton';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Add refresh logic here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <StyledView className="flex-1 bg-secondary-50">
      <StyledScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <StyledView className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 pt-12 pb-6">
          <StyledView className="flex-row justify-between items-center mb-4">
            <StyledView>
              <StyledText className="text-white text-lg font-medium">
                Welcome back,
              </StyledText>
              <StyledText className="text-white text-2xl font-bold">
                {profile?.full_name || user?.email || 'UPSC Aspirant'}
              </StyledText>
            </StyledView>
            <StyledTouchableOpacity
              onPress={handleSignOut}
              className="bg-white/20 px-3 py-2 rounded-lg"
            >
              <StyledText className="text-white text-sm">Sign Out</StyledText>
            </StyledTouchableOpacity>
          </StyledView>
          
          <StyledView className="flex-row items-center">
            <StyledView className="bg-white/20 px-3 py-1 rounded-full">
              <StyledText className="text-white text-sm font-medium">
                {profile?.subscription_tier || 'Free'} Plan
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledView>

        <StyledView className="px-6 py-6">
          {/* Quick Stats */}
          <StyledView className="mb-6">
            <StyledText className="text-xl font-bold text-secondary-900 mb-4">
              Your Progress
            </StyledText>
            <StyledView className="flex-row space-x-4">
              <Card variant="elevated" className="flex-1">
                <CardContent padding="sm">
                  <StyledView className="items-center">
                    <StyledText className="text-2xl font-bold text-primary-600">12</StyledText>
                    <StyledText className="text-sm text-secondary-600">Topics Completed</StyledText>
                  </StyledView>
                </CardContent>
              </Card>
              <Card variant="elevated" className="flex-1">
                <CardContent padding="sm">
                  <StyledView className="items-center">
                    <StyledText className="text-2xl font-bold text-success-600">85%</StyledText>
                    <StyledText className="text-sm text-secondary-600">Accuracy</StyledText>
                  </StyledView>
                </CardContent>
              </Card>
              <Card variant="elevated" className="flex-1">
                <CardContent padding="sm">
                  <StyledView className="items-center">
                    <StyledText className="text-2xl font-bold text-warning-600">24</StyledText>
                    <StyledText className="text-sm text-secondary-600">Study Hours</StyledText>
                  </StyledView>
                </CardContent>
              </Card>
            </StyledView>
          </StyledView>

          {/* Today's Focus */}
          <StyledView className="mb-6">
            <StyledText className="text-xl font-bold text-secondary-900 mb-4">
              Today's Focus
            </StyledText>
            <Card variant="elevated">
              <CardHeader
                title="Indian Polity"
                subtitle="Constitutional Framework"
                leftIcon={<StyledText className="text-2xl">📚</StyledText>}
              />
              <CardContent>
                <StyledText className="text-secondary-600 mb-4">
                  Continue with Chapter 3: Fundamental Rights and Duties
                </StyledText>
                <StyledView className="flex-row space-x-2">
                  <Button title="Resume" size="sm" />
                  <Button title="Take Quiz" variant="outline" size="sm" />
                </StyledView>
              </CardContent>
            </Card>
          </StyledView>

          {/* Quick Actions */}
          <StyledView className="mb-6">
            <StyledText className="text-xl font-bold text-secondary-900 mb-4">
              Quick Actions
            </StyledText>
            <StyledView className="space-y-3">
              <Card variant="outlined" onPress={() => router.push('/(notes)')}>
                <CardContent>
                  <StyledView className="flex-row items-center">
                    <StyledText className="text-2xl mr-3">📝</StyledText>
                    <StyledView className="flex-1">
                      <StyledText className="font-semibold text-secondary-900">
                        My Notes
                      </StyledText>
                      <StyledText className="text-sm text-secondary-600">
                        View and manage your notes
                      </StyledText>
                    </StyledView>
                    <StyledText className="text-secondary-400">→</StyledText>
                  </StyledView>
                </CardContent>
              </Card>

              <Card variant="outlined" onPress={() => {}}>
                <CardContent>
                  <StyledView className="flex-row items-center">
                    <StyledText className="text-2xl mr-3">🎯</StyledText>
                    <StyledView className="flex-1">
                      <StyledText className="font-semibold text-secondary-900">
                        Practice Test
                      </StyledText>
                      <StyledText className="text-sm text-secondary-600">
                        Test your knowledge
                      </StyledText>
                    </StyledView>
                    <StyledText className="text-secondary-400">→</StyledText>
                  </StyledView>
                </CardContent>
              </Card>

              <Card variant="outlined" onPress={() => {}}>
                <CardContent>
                  <StyledView className="flex-row items-center">
                    <StyledText className="text-2xl mr-3">📊</StyledText>
                    <StyledView className="flex-1">
                      <StyledText className="font-semibold text-secondary-900">
                        View Analytics
                      </StyledText>
                      <StyledText className="text-sm text-secondary-600">
                        Track your progress
                      </StyledText>
                    </StyledView>
                    <StyledText className="text-secondary-400">→</StyledText>
                  </StyledView>
                </CardContent>
              </Card>
            </StyledView>
          </StyledView>

          {/* Recent Activity */}
          <StyledView className="mb-6">
            <StyledText className="text-xl font-bold text-secondary-900 mb-4">
              Recent Activity
            </StyledText>
            <Card variant="elevated">
              <CardContent>
                <StyledView className="space-y-3">
                  <StyledView className="flex-row items-center">
                    <StyledView className="w-2 h-2 bg-success-500 rounded-full mr-3" />
                    <StyledView className="flex-1">
                      <StyledText className="font-medium text-secondary-900">
                        Completed Indian Economy Quiz
                      </StyledText>
                      <StyledText className="text-sm text-secondary-600">
                        2 hours ago • Score: 85%
                      </StyledText>
                    </StyledView>
                  </StyledView>
                  
                  <StyledView className="flex-row items-center">
                    <StyledView className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                    <StyledView className="flex-1">
                      <StyledText className="font-medium text-secondary-900">
                        Created note on Constitutional Amendments
                      </StyledText>
                      <StyledText className="text-sm text-secondary-600">
                        4 hours ago
                      </StyledText>
                    </StyledView>
                  </StyledView>
                  
                  <StyledView className="flex-row items-center">
                    <StyledView className="w-2 h-2 bg-warning-500 rounded-full mr-3" />
                    <StyledView className="flex-1">
                      <StyledText className="font-medium text-secondary-900">
                        Started Geography Module
                      </StyledText>
                      <StyledText className="text-sm text-secondary-600">
                        Yesterday
                      </StyledText>
                    </StyledView>
                  </StyledView>
                </StyledView>
              </CardContent>
            </Card>
          </StyledView>

          {/* Study Tips */}
          <StyledView className="mb-6">
            <StyledText className="text-xl font-bold text-secondary-900 mb-4">
              Study Tip of the Day
            </StyledText>
            <Card variant="filled">
              <CardContent>
                <StyledView className="flex-row items-start">
                  <StyledText className="text-2xl mr-3">💡</StyledText>
                  <StyledView className="flex-1">
                    <StyledText className="font-medium text-secondary-900 mb-2">
                      Active Recall Technique
                    </StyledText>
                    <StyledText className="text-secondary-600">
                      Instead of just re-reading notes, try to recall information from memory. 
                      This strengthens neural connections and improves retention.
                    </StyledText>
                  </StyledView>
                </StyledView>
              </CardContent>
            </Card>
          </StyledView>
        </StyledView>
      </StyledScrollView>
      
      {/* Floating Action Button for Notes */}
      <FloatingNoteButton />
    </StyledView>
  );
}
