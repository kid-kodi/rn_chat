import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BASE_API_URL } from '@env';
import CustomImageView from './CustomImage';
import { moderateScale, moderateScaleVertical } from '../assets/styles/responsiveSize';

const SelectableList = ({
  title,
  data,
  label,
  imageLabel,
  multiple = true, // Allow multiple selection
  onSelectionChange,
  initialSelected = [],
}) => {
  const [selectedItems, setSelectedItems] = useState(initialSelected);

  const toggleSelection = (itemId) => {
    let updatedSelected = [];

    if (multiple) {
      if (selectedItems.includes(itemId)) {
        updatedSelected = selectedItems.filter((id) => id !== itemId);
      } else {
        updatedSelected = [...selectedItems, itemId];
      }
    } else {
      updatedSelected = selectedItems.includes(itemId) ? [] : [itemId];
    }

    setSelectedItems(updatedSelected);
    onSelectionChange && onSelectionChange(updatedSelected);
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedItems.includes(item._id);

    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          isSelected && styles.itemSelected,
        ]}
        onPress={() => toggleSelection(item._id)}
        activeOpacity={0.7}
      >
        {/* Image */}
        <CustomImageView
          source={`${BASE_API_URL}/image/${item[imageLabel]}`}
          firstName={item[label]}
          size={40}
          fontSize={20}
          style={styles.image}
        />

        {/* Text */}
        <Text style={styles.text}>{item[label]}</Text>

        {/* Checkbox Icon */}
        <Icon
          name={isSelected ? 'checkbox' : 'square-outline'}
          size={24}
          color={isSelected ? '#4CAF50' : '#ccc'}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ gap: 5, marginBottom: 20 }}>
      <Text style={{ paddingHorizontal:16}}>{title}</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(5),
    marginVertical: 1,
  },
  // itemSelected: {
  //   backgroundColor: '#e0f7e9',
  // },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});

export default SelectableList;


// usage
// import React, { useState } from 'react';
// import { View, Text, Button } from 'react-native';
// import SelectableList from './SelectableList';

// const sampleData = [
//   {
//     id: 1,
//     title: 'John Doe',
//     image: 'https://randomuser.me/api/portraits/men/1.jpg',
//   },
//   {
//     id: 2,
//     title: 'Jane Smith',
//     image: 'https://randomuser.me/api/portraits/women/2.jpg',
//   },
//   {
//     id: 3,
//     title: 'Alice Johnson',
//     image: 'https://randomuser.me/api/portraits/women/3.jpg',
//   },
// ];

// export default function App() {
//   const [selected, setSelected] = useState([]);

//   return (
//     <View style={{ flex: 1, padding: 20 }}>
//       <Text style={{ fontSize: 18, marginBottom: 10 }}>
//         Selected IDs: {JSON.stringify(selected)}
//       </Text>

//       <SelectableList
//         data={sampleData}
//         multiple={true} // Change to false for single select
//         initialSelected={[2]} // Optional
//         onSelectionChange={(newSelected) => setSelected(newSelected)}
//       />

//       <Button
//         title="Print Selected"
//         onPress={() => console.log('Selected:', selected)}
//       />
//     </View>
//   );
// }
