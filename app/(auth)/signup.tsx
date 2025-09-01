import { Link, router } from 'expo-router';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { z } from 'zod';
import { signupSchema, useAuth, type SignupData } from '../../packages/api';
import { Button, Card, Input } from '../../packages/ui';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);

export default function SignupScreen() {
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    fullName: '',
  });
  const [errors, setErrors] = useState<Partial<SignupData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuth();

  const validateForm = (): boolean => {
    try {
      signupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<SignupData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof SignupData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await signUp(formData);
      
      if (error) {
        Alert.alert('Signup Failed', error.message);
      } else {
        Alert.alert(
          'Account Created!',
          'Please check your email to verify your account before signing in.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof SignupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

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
              Create Account
            </StyledText>
            <StyledText className="text-center text-secondary-600">
              Join PragyaAI-UPSC and start your preparation journey
            </StyledText>
          </StyledView>

          {/* Signup Form */}
          <Card variant="elevated" className="mb-6">
            <StyledView className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChangeText={(value) => updateField('fullName', value)}
                error={errors.fullName}
                autoCapitalize="words"
                autoComplete="name"
                leftIcon={<StyledText className="text-secondary-500">👤</StyledText>}
                fullWidth
              />

              <Input
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                leftIcon={<StyledText className="text-secondary-500">📧</StyledText>}
                fullWidth
              />

              <Input
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                error={errors.password}
                secureTextEntry
                autoComplete="new-password"
                leftIcon={<StyledText className="text-secondary-500">🔒</StyledText>}
                helper="Password must be at least 6 characters long"
                fullWidth
              />

              <Button
                title="Create Account"
                onPress={handleSignup}
                loading={isLoading}
                fullWidth
                size="lg"
              />
            </StyledView>
          </Card>

          {/* Terms and Privacy */}
          <StyledView className="mb-6">
            <StyledText className="text-xs text-center text-secondary-500">
              By creating an account, you agree to our{' '}
              <StyledText className="text-primary-600">Terms of Service</StyledText>
              {' '}and{' '}
              <StyledText className="text-primary-600">Privacy Policy</StyledText>
            </StyledText>
          </StyledView>

          {/* Sign In Link */}
          <StyledView className="flex-row justify-center">
            <StyledText className="text-secondary-600">
              Already have an account?{' '}
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
