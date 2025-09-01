import { styled } from 'nativewind';
import React from 'react';
import { ActivityIndicator, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary: 'bg-primary-600 active:bg-primary-700',
  secondary: 'bg-secondary-600 active:bg-secondary-700',
  outline: 'bg-transparent border border-primary-600 active:bg-primary-50',
  ghost: 'bg-transparent active:bg-secondary-100',
  danger: 'bg-error-600 active:bg-error-700',
};

const textStyles = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-primary-600',
  ghost: 'text-secondary-700',
  danger: 'text-white',
};

const sizeStyles = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
};

const textSizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const baseStyles = 'flex-row items-center justify-center rounded-lg font-medium';
  const disabledStyles = disabled || loading ? 'opacity-50' : '';
  const widthStyles = fullWidth ? 'w-full' : '';
  
  const buttonStyles = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    disabledStyles,
    widthStyles,
  ].join(' ');

  const buttonTextStyles = [
    textStyles[variant],
    textSizeStyles[size],
    'font-semibold',
  ].join(' ');

  return (
    <StyledTouchableOpacity
      className={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      style={style}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#3b82f6' : '#ffffff'}
          style={{ marginRight: 8 }}
        />
      )}
      
      {!loading && leftIcon && (
        <StyledText className="mr-2">{leftIcon}</StyledText>
      )}
      
      <StyledText className={buttonTextStyles} style={textStyle}>
        {title}
      </StyledText>
      
      {!loading && rightIcon && (
        <StyledText className="ml-2">{rightIcon}</StyledText>
      )}
    </StyledTouchableOpacity>
  );
};
