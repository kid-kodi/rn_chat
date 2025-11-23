// components/SearchResultSection.jsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Colors from '../../../constants/Colors';

export default function SearchResultSection({ title, data, onPressFilter }) {
  if (!data?.length) return null;

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={() => onPressFilter({ key: title })}>
          <Text style={styles.filter}>Voir tout</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}
            onPress={() => onPressFilter({ key: title, data: item })}>
            <Text style={styles.itemText}>{item.title}</Text>
            {item.subTitle && <Text style={styles.itemText}>{item.subTitle}</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = {
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.black,
  },
  filter: {
    color: Colors.primary,
    fontSize: 14,
  },
  item: {
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  itemText: {
    color: Colors.black,
  },
};
