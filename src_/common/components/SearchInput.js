import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Or any icon lib you use

const SearchInput = ({
  value,
  onChangeText,
  placeholder = 'Rechercher',
  onClear,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Search Icon */}
      <Icon name="search" size={20} color="#888" style={styles.icon} />

      {/* Text Input */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#333"
        {...props}
      />

      {/* Clear Button */}
      {value?.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Icon name="close-circle" size={20} color="#888" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2, // Android shadow
  },
  icon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height:35,
    color: '#333',
  },
  clearButton: {
    marginLeft: 6,
  },
});

export default SearchInput;
