import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../../config/colors';

/**
 * Ligne - A customizable horizontal line/separator component
 * Props:
 * - color: line color (defaults to secondary5)
 * - height: line thickness (defaults to 1)
 * - width: line width (defaults to '100%')
 * - style: additional custom styles
 */
const Ligne = ({ color = colors.secondary5, height = 1, width = '100%', style }) => {
  return (
    <View
      style={[
        styles.ligne,
        {
          backgroundColor: color,
          height,
          width,
        },
        style,
      ]}
    />
  );
};

export default Ligne;

const styles = StyleSheet.create({
  ligne: {
    alignSelf: 'center',
  },
});