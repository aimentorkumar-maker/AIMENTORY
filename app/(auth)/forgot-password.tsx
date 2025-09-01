import { Link, router } from 'expo-router';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { z } from 'zod';
import { useAuth } from '../../packages/api';
import { Button, Card, Input } from '../../packages/ui';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const validateEmail = (): boolean => {
    try {
      forgotPasswordSchema.parse({ email });
      setError(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      }
      return false;
    }
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        Alert.alert('Reset Failed', error.message);
      } else {
        setIsSuccess(true);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <StyledView className="flex-1 bg-gradient-to-br from-primary-50 to-secondary-50 justify-center px-6">
        <Card variant="elevated" className="p-6">
          <StyledView className="items-center">
            <StyledText className="text-6xl mb-4">📧</StyledText>
            <StyledText className="text-2xl font-bold text-center text-secondary-900 mb-2">
              Check Your Email
            </StyledText>
            <StyledText className="text-center text-secondary-600 mb-6">
              We've sent a password reset link to{' '}
              <StyledText className="font-medium">{email}</StyledText>
            </StyledText>
            <Button
              title="Back to Login"
              onPress={() => router.replace('/(auth)/login')}
              fullWidth
            />
          </StyledView>
        </Card>
      </StyledView>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gradient-to-br from-primary-50 to-secondary-50"
    >
      <StyledScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <StyledView className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <StyledView className="mb-8">
            <StyledText className="text-3xl font-bold text-center text-secondary-900 mb-2">
              Reset Password
            </StyledText>
            <StyledText className="text-center text-secondary-600">
              Enter your email address and we'll send you a link to reset your password
            </StyledText>
          </StyledView>

          {/* Reset Form */}
          <Card variant="elevated" className="mb-6">
            <StyledView className="space-y-4">
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (error) setError(null);
                }}
                error={error}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                leftIcon={<StyledText className="text-secondary-500">📧</StyledText>}
                fullWidth
              />

              <Button
                title="Send Reset Link"
                onPress={handleResetPassword}
                loading={isLoading}
                fullWidth
                size="lg"
              />
            </StyledView>
          </Card>

          {/* Back to Login */}
          <StyledView className="flex-row justify-center">
            <StyledText className="text-secondary-600">
              Remember your password?{' '}
            </StyledText>
            <Link href="/(auth)/login" asChild>
              <StyledText className="text-primary-600 font-medium">
                Sign in
              </StyledText>
            </Link>
          </StyledView>
        </StyledView>
      </StyledScrollView>
    </KeyboardAvoidingView>
  );
}
