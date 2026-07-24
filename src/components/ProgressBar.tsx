import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from 'react-native-paper';

interface ProgressBarProps {
  progress: number; // 0 a 1
  showPercentage?: boolean;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = React.memo(({
  progress,
  showPercentage = false,
  height = 8
}) => {
  const theme = useTheme();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const percentageText = `${Math.round(clampedProgress * 100)}%`;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height, backgroundColor: theme.colors.surfaceDisabled || '#E5E7EB' }]}>
        <View
          style={[
            styles.fill,
            {
              height,
              width: `${clampedProgress * 100}%`,
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={[styles.text, { color: theme.colors.onSurfaceVariant }]}>
          {percentageText}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  track: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
    fontWeight: '600',
  },
});
