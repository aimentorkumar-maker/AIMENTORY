import { styled } from 'nativewind';
import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const variantStyles = {
  default: 'bg-white border border-secondary-200',
  elevated: 'bg-white shadow-lg shadow-secondary-200',
  outlined: 'bg-transparent border-2 border-secondary-300',
  filled: 'bg-secondary-50 border border-secondary-200',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
  disabled = false,
}) => {
  const baseStyles = 'rounded-xl';
  const cardStyles = [
    baseStyles,
    variantStyles[variant],
    paddingStyles[padding],
  ].join(' ');

  if (onPress) {
    return (
      <StyledTouchableOpacity
        className={cardStyles}
        onPress={onPress}
        disabled={disabled}
        style={style}
        activeOpacity={0.8}
      >
        {children}
      </StyledTouchableOpacity>
    );
  }

  return (
    <StyledView className={cardStyles} style={style}>
      {children}
    </StyledView>
  );
};

// Card Header Component
export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onRightIconPress,
}) => {
  return (
    <StyledView className="flex-row items-center justify-between mb-4">
      <StyledView className="flex-row items-center flex-1">
        {leftIcon && (
          <StyledView className="mr-3">
            {leftIcon}
          </StyledView>
        )}
        <StyledView className="flex-1">
          <StyledText className="text-lg font-semibold text-secondary-900">
            {title}
          </StyledText>
          {subtitle && (
            <StyledText className="text-sm text-secondary-600 mt-1">
              {subtitle}
            </StyledText>
          )}
        </StyledView>
      </StyledView>
      
      {rightIcon && (
        <StyledTouchableOpacity
          onPress={onRightIconPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {rightIcon}
        </StyledTouchableOpacity>
      )}
    </StyledView>
  );
};

// Card Content Component
export interface CardContentProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  padding = 'md',
}) => {
  const contentPaddingStyles = {
    none: '',
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  return (
    <StyledView className={contentPaddingStyles[padding]}>
      {children}
    </StyledView>
  );
};

// Card Footer Component
export interface CardFooterProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  padding = 'md',
}) => {
  const footerPaddingStyles = {
    none: '',
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  return (
    <StyledView className={`border-t border-secondary-200 ${footerPaddingStyles[padding]}`}>
      {children}
    </StyledView>
  );
};
