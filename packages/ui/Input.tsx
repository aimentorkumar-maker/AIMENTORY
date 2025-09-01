import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  containerStyle?: any;
  inputStyle?: any;
}

const variantStyles = {
  default: 'border border-secondary-300 bg-white',
  filled: 'border-0 bg-secondary-100',
  outlined: 'border-2 border-secondary-300 bg-transparent',
};

const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-4 py-4 text-lg',
};

const containerSizeStyles = {
  sm: 'h-10',
  md: 'h-12',
  lg: 'h-14',
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  containerStyle,
  inputStyle,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const baseContainerStyles = 'flex-row items-center rounded-lg border';
  const focusStyles = isFocused ? 'border-primary-500' : '';
  const errorStyles = error ? 'border-error-500' : '';
  const widthStyles = fullWidth ? 'w-full' : '';
  
  const containerStyles = [
    baseContainerStyles,
    variantStyles[variant],
    focusStyles,
    errorStyles,
    widthStyles,
    containerSizeStyles[size],
  ].join(' ');

  const inputStyles = [
    'flex-1',
    sizeStyles[size],
    'text-secondary-900',
  ].join(' ');

  const handleFocus = () => {
    setIsFocused(true);
    props.onFocus?.(null as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    props.onBlur?.(null as any);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <StyledView className="w-full">
      {label && (
        <StyledText className="text-sm font-medium text-secondary-700 mb-2">
          {label}
        </StyledText>
      )}
      
      <StyledView className={containerStyles} style={containerStyle}>
        {leftIcon && (
          <StyledView className="ml-3 mr-2">
            {leftIcon}
          </StyledView>
        )}
        
        <StyledTextInput
          className={inputStyles}
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholderTextColor="#94a3b8"
          {...props}
        />
        
        {secureTextEntry && (
          <StyledTouchableOpacity
            onPress={togglePasswordVisibility}
            className="mr-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <StyledText className="text-secondary-500">
              {isPasswordVisible ? '🙈' : '👁️'}
            </StyledText>
          </StyledTouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <StyledTouchableOpacity
            onPress={onRightIconPress}
            className="mr-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightIcon}
          </StyledTouchableOpacity>
        )}
      </StyledView>
      
      {(error || helper) && (
        <StyledText
          className={`text-sm mt-1 ${
            error ? 'text-error-600' : 'text-secondary-500'
          }`}
        >
          {error || helper}
        </StyledText>
      )}
    </StyledView>
  );
};
