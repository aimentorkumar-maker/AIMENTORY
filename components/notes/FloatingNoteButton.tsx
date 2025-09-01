import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Haptics } from 'expo-haptics';

interface FloatingNoteButtonProps {
  onCreateNote?: () => void;
  style?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BUTTON_SIZE = 56;
const MARGIN = 20;

export default function FloatingNoteButton({ onCreateNote, style }: FloatingNoteButtonProps) {
  const [pan] = useState(new Animated.ValueXY({
    x: screenWidth - BUTTON_SIZE - MARGIN,
    y: screenHeight - BUTTON_SIZE - MARGIN - 80, // Account for tab bar
  }));
  const [isExpanded, setIsExpanded] = useState(false);
  const [scale] = useState(new Animated.Value(1));

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
    },
    onPanResponderGrant: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.spring(scale, {
        toValue: 1.1,
        useNativeDriver: false,
      }).start();
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, gestureState) => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: false,
      }).start();

      // Snap to edges
      const snapToEdge = () => {
        const currentX = pan.x._value;
        const currentY = pan.y._value;
        
        // Constrain to screen bounds
        const newX = currentX < screenWidth / 2 
          ? MARGIN 
          : screenWidth - BUTTON_SIZE - MARGIN;
        
        const newY = Math.max(
          MARGIN,
          Math.min(currentY, screenHeight - BUTTON_SIZE - MARGIN - 80)
        );

        Animated.spring(pan, {
          toValue: { x: newX, y: newY },
          useNativeDriver: false,
        }).start();
      };

      // If moved significantly, snap to edge
      if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
        snapToEdge();
      }
    },
  });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isExpanded) {
      // Collapse the menu
      setIsExpanded(false);
    } else {
      // Show action menu
      setIsExpanded(true);
    }
  };

  const handleAction = (action: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(false);

    switch (action) {
      case 'text':
        router.push('/(notes)/create?type=text');
        break;
      case 'voice':
        router.push('/(notes)/create?type=audio');
        break;
      case 'camera':
        router.push('/(notes)/create?type=image');
        break;
      case 'file':
        router.push('/(notes)/create?type=pdf');
        break;
      default:
        if (onCreateNote) {
          onCreateNote();
        } else {
          router.push('/(notes)/create');
        }
    }
  };

  const actionButtons = [
    { id: 'text', icon: '📝', label: 'Text Note', color: '#3b82f6' },
    { id: 'voice', icon: '🎤', label: 'Voice Note', color: '#ef4444' },
    { id: 'camera', icon: '📷', label: 'Photo Note', color: '#10b981' },
    { id: 'file', icon: '📎', label: 'File Note', color: '#f59e0b' },
  ];

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      {/* Action Menu */}
      {isExpanded && (
        <Animated.View
          style={[
            styles.actionMenu,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
              ],
            },
          ]}
        >
          {actionButtons.map((action, index) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.actionButton,
                { backgroundColor: action.color },
                {
                  transform: [
                    {
                      translateY: -((index + 1) * 70),
                    },
                  ],
                },
              ]}
              onPress={() => handleAction(action.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <View style={styles.actionLabelContainer}>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Main FAB */}
      <Animated.View
        style={[
          styles.fab,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.fabButton}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text style={[styles.fabIcon, isExpanded && styles.fabIconRotated]}>
            {isExpanded ? '✕' : '📝'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  fab: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabButton: {
    width: '100%',
    height: '100%',
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 24,
    color: 'white',
  },
  fabIconRotated: {
    fontSize: 20,
  },
  actionMenu: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  actionButton: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: 'row',
  },
  actionIcon: {
    fontSize: 20,
    color: 'white',
  },
  actionLabelContainer: {
    position: 'absolute',
    right: 55,
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 80,
  },
  actionLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
