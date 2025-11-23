// components/SearchInput.jsx
import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Colors from '../../../constants/Colors';
import { height } from '../../../assets/styles/responsiveSize';

const SearchInput = ({ value, onChangeText, placeholder }) => {
  return (
    <View style={styles.container}>
      <Icon name="search" size={18} color={Colors.grey} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.lightGrey}
        autoFocus
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Icon name="x" size={18} color={Colors.grey} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 16,
    height : 42
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
    color: Colors.black,
  },
};

export default SearchInput;
