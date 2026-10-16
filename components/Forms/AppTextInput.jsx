import { TextInput as RNTextInput, StyleSheet } from 'react-native';
import colors from '../../config/colors';

const AppTextInput = ({
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  styleInput,
  inputStyle,
  accessibilityLabel,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  ...rest
}) => {
  return (
    <RNTextInput
      style={[styles.input, styleInput || inputStyle, multiline && styles.multilineInput]}
      placeholder={placeholder}
      placeholderTextColor={'#9AA0A6'}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      accessibilityLabel={accessibilityLabel}
      multiline={multiline}
      numberOfLines={numberOfLines}
      editable={editable}
      {...rest}
    />
  );
};

export default AppTextInput;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.primary1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    color: colors.textPrimary || '#333',
    fontFamily: 'Karla-Regular',
    fontSize: 14,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});

