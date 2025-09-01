import { styled } from 'nativewind';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const sizeStyles = {
  sm: {
    container: 'w-10 h-6',
    thumb: 'w-4 h-4',
    thumbOffset: 2,
  },
  md: {
    container: 'w-12 h-7',
    thumb: 'w-5 h-5',
    thumbOffset: 2,
  },
  lg: {
    container: 'w-14 h-8',
    thumb: 'w-6 h-6',
    thumbOffset: 2,
  },
};

const variantStyles = {
  default: {
    on: 'bg-secondary-600',
    off: 'bg-secondary-300',
    thumb: 'bg-white',
  },
  primary: {
    on: 'bg-primary-600',
    off: 'bg-secondary-300',
    thumb: 'bg-white',
  },
  success: {
    on: 'bg-success-600',
    off: 'bg-secondary-300',
    thumb: 'bg-white',
  },
  warning: {
    on: 'bg-warning-600',
    off: 'bg-secondary-300',
    thumb: 'bg-white',
  },
};

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  size = 'md',
  variant = 'default',
}) => {
  const sizeConfig = sizeStyles[size];
  const variantConfig = variantStyles[variant];

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const containerStyles = [
    'flex-row items-center rounded-full transition-colors duration-200',
    sizeConfig.container,
    value ? variantConfig.on : variantConfig.off,
    disabled ? 'opacity-50' : '',
  ].join(' ');

  const thumbStyles = [
    'rounded-full shadow-sm transition-transform duration-200',
    sizeConfig.thumb,
    variantConfig.thumb,
    value ? `translate-x-${sizeConfig.thumbOffset}` : 'translate-x-0',
  ].join(' ');

  return (
    <StyledView className="flex-row items-center">
      <StyledTouchableOpacity
        className={containerStyles}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <StyledView className={thumbStyles} />
      </StyledTouchableOpacity>
      
      {(label || description) && (
        <StyledView className="ml-3 flex-1">
          {label && (
            <StyledText className="text-sm font-medium text-secondary-900">
              {label}
            </StyledText>
          )}
          {description && (
            <StyledText className="text-xs text-secondary-600 mt-1">
              {description}
            </StyledText>
          )}
        </StyledView>
      )}
    </StyledView>
  );
};

// Checkbox Toggle Component
export interface CheckboxToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CheckboxToggle: React.FC<CheckboxToggleProps> = ({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <StyledView className="flex-row items-start">
      <StyledTouchableOpacity
        className={[
          'items-center justify-center rounded border-2 transition-colors duration-200',
          sizeStyles[size],
          value ? 'bg-primary-600 border-primary-600' : 'bg-white border-secondary-300',
          disabled ? 'opacity-50' : '',
        ].join(' ')}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {value && (
          <StyledText className={`text-white font-bold ${iconSizeStyles[size]}`}>
            ✓
          </StyledText>
        )}
      </StyledTouchableOpacity>
      
      {(label || description) && (
        <StyledView className="ml-3 flex-1">
          {label && (
            <StyledText className="text-sm font-medium text-secondary-900">
              {label}
            </StyledText>
          )}
          {description && (
            <StyledText className="text-xs text-secondary-600 mt-1">
              {description}
            </StyledText>
          )}
        </StyledView>
      )}
    </StyledView>
  );
};
